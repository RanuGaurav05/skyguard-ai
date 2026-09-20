"""
SkyGuard AI - Temporal Preprocessing for LSTM
Path: 01_ml/03_src/04_temporal/sequence_prep.py

Three stages, run in order:
  1. interpolate_short_gaps  — fills missing air_pressure runs of <=3 days
     (linear, time-based, per station). Longer runs are left as NaN on purpose.
  2. assign_chunk_ids        — splits each station's timeline into continuous
     chunks, breaking at a calendar date-gap OR a missing-value run that was
     too long to interpolate. A chunk is a stretch where every day is
     genuinely present and complete.
  3. build_sequences         — slides a fixed-length window only within a
     single chunk, so no window ever crosses a real discontinuity.
"""

import numpy as np
import pandas as pd

CORE_FEATURES = ["avg_temp", "air_pressure", "relative_humidity"]
MAX_INTERPOLATE_GAP = 3  # days; longer runs are NOT interpolated (see module docstring)


def interpolate_short_gaps(df: pd.DataFrame, feature: str = "air_pressure",
                            max_gap: int = MAX_INTERPOLATE_GAP) -> pd.DataFrame:
    """Linear, time-based interpolation per station, but only for runs of
    <= max_gap consecutive missing days. Longer runs are restored to NaN
    afterward so a 7-day gap doesn't get smoothed into fabricated data."""
    df = df.copy()
    df["date_of_record"] = pd.to_datetime(df["date_of_record"])

    filled_parts = []
    for station, grp in df.groupby("station_name"):
        grp = grp.sort_values("date_of_record").set_index("date_of_record")
        is_na = grp[feature].isna()

        # interpolate everything first (time-aware, so it accounts for any date gaps too)
        interpolated = grp[feature].interpolate(method="time", limit_direction="both")

        # find run lengths of consecutive NaNs in the ORIGINAL column
        run_id = (is_na != is_na.shift()).cumsum()
        run_lengths = is_na.groupby(run_id).transform("sum")
        too_long = is_na & (run_lengths > max_gap)

        grp[feature] = interpolated.where(~too_long, np.nan)  # keep long runs as NaN
        filled_parts.append(grp.reset_index())

    return pd.concat(filled_parts, ignore_index=True).sort_values(
        ["station_name", "date_of_record"]).reset_index(drop=True)


def assign_chunk_ids(df: pd.DataFrame, features=CORE_FEATURES) -> pd.DataFrame:

    """Assigns a chunk_id per station. Rows that still have a missing core
    feature (a gap too long to interpolate) get chunk_id = None and are
    excluded entirely — they don't just start a new chunk, they're removed
    from the eligible timeline, so the row right after them correctly sees
    a "gap" too (since the missing day(s) are gone from the valid sequence),
    not silently merged into the same chunk as the missing row."""

    df = df.copy()
    df["date_of_record"] = pd.to_datetime(df["date_of_record"])
    df = df.sort_values(["station_name", "date_of_record"]).reset_index(drop=True)

    chunk_id_map = {}
    for station, grp in df.groupby("station_name"):
        grp = grp.sort_values("date_of_record")
        is_valid = ~grp[features].isna().any(axis=1)
        valid_grp = grp[is_valid]

        # gaps measured only between consecutive VALID rows -> a dropped
        # missing-row automatically creates a gap here, no separate check needed
        day_gap = valid_grp["date_of_record"].diff().dt.days.fillna(1) > 1
        local_chunk_num = day_gap.cumsum()

        for idx, cnum in zip(valid_grp.index, local_chunk_num):
            chunk_id_map[idx] = f"{station}__chunk{cnum}"
        # invalid rows simply get no entry -> chunk_id stays None for them

    df["chunk_id"] = df.index.map(chunk_id_map)  # None for excluded (still-missing) rows
    return df


def build_sequences(df: pd.DataFrame, seq_len: int = 7, features=CORE_FEATURES,
                     label_col: str = "anomaly_category"):
    """Slides a seq_len-day window within each chunk only. Returns:
      X        — array of shape (n_sequences, seq_len, n_features)
      meta     — one row per sequence: station, chunk_id, start/end date
      y_window — label for the window: NORMAL if every day in it is NORMAL,
                 else the anomaly_category of whichever day is anomalous
                 (used for a first pass; a day-by-day label is also kept)
      y_daily  — array of shape (n_sequences, seq_len) with each day's own label
    """
    df = df.copy()
    df["date_of_record"] = pd.to_datetime(df["date_of_record"])

    X, meta, y_window, y_daily = [], [], [], []

    for chunk_id, grp in df.groupby("chunk_id"):
        if pd.isna(chunk_id):
            continue  # excluded rows (still-missing feature) — not a real chunk
        grp = grp.sort_values("date_of_record").reset_index(drop=True)
        if len(grp) < seq_len:
            continue  # not enough rows in this chunk for even one window

        feature_values = grp[features].values
        labels = grp[label_col].values

        for start in range(len(grp) - seq_len + 1):
            end = start + seq_len
            window_feats = feature_values[start:end]
            window_labels = labels[start:end]

            X.append(window_feats)
            y_daily.append(window_labels)
            non_normal = [l for l in window_labels if l != "NORMAL"]
            y_window.append(non_normal[0] if non_normal else "NORMAL")
            meta.append({
                "station_name": grp["station_name"].iloc[0],
                "chunk_id": chunk_id,
                "start_date": grp["date_of_record"].iloc[start],
                "end_date": grp["date_of_record"].iloc[end - 1],
            })

    X = np.array(X)
    y_daily = np.array(y_daily)
    meta_df = pd.DataFrame(meta)
    y_window = np.array(y_window)
    return X, y_window, y_daily, meta_df



#-------------------------------------------------------------------------------------------------------------------------------------------#

def chronological_sequence_split(X, y_window, y_daily, meta_df,
                                  train_end="2023-11-17", val_end="2024-06-29"):
    
    """Splits sequences into train / validation / test by calendar date — same boundary dates used earlier for the baseline MLP, kept consistent
    across the whole project.

    Why this matters (the short version): an autoencoder is only allowed to
    learn what "normal" looks like from data that is genuinely unseen at test time.
    
    If the same normal days show up in both training and testing,
    the model isn't being tested on its ability to generalize — it's just
    being asked to recall something it memorized. So:

      TRAIN — only NORMAL sequences, before train_end.
              This is the only data the model ever learns from.
      VAL   — only NORMAL sequences, between train_end and val_end.
              Used later to decide the reconstruction-error threshold(what error counts as "anomalous"), on data the model has never trained on.
              
      TEST  — everything (NORMAL + every anomaly type), after val_end.
              This is the only honest place to report detection performance,
              since none of it was seen during training.

    A sequence is assigned to a split based on its START date, so no window
    accidentally straddles two splits.
    """
    train_end = pd.Timestamp(train_end)
    val_end = pd.Timestamp(val_end)
    start_dates = meta_df["start_date"]

    train_mask = (start_dates < train_end) & (y_window == "NORMAL")
    val_mask = (start_dates >= train_end) & (start_dates < val_end) & (y_window == "NORMAL")
    test_mask = start_dates >= val_end  # everything here — NORMAL and every anomaly type

    def _subset(mask):
        return {
            "X": X[mask.values],
            "y_window": y_window[mask.values],
            "y_daily": y_daily[mask.values],
            "meta": meta_df[mask].reset_index(drop=True),
        }

    return {
        "train": _subset(train_mask),
        "val": _subset(val_mask),
        "test": _subset(test_mask),
    }


if __name__ == "__main__":
    INPUT_PATH = "01_ml/01_data/03_synthetic/skyguard_anomaly_dataset.csv"

    df = pd.read_csv(INPUT_PATH)
    print("=== BEFORE INTERPOLATION ===")
    print("air_pressure missing:", df["air_pressure"].isna().sum())

    df = interpolate_short_gaps(df, "air_pressure")
    print("\n=== AFTER INTERPOLATION (<=3-day runs filled) ===")
    print("air_pressure missing:", df["air_pressure"].isna().sum(), "(remaining = long runs, left as-is)")

    df = assign_chunk_ids(df)
    print("\n=== CHUNKS ===")
    print("total chunks:", df["chunk_id"].nunique())
    print(df.groupby("station_name")["chunk_id"].nunique())

    X, y_window, y_daily, meta_df = build_sequences(df, seq_len=7)
    print("\n=== SEQUENCES ===")
    print("X shape:", X.shape)
    print("window-level label distribution:")
    print(pd.Series(y_window).value_counts())

    splits = chronological_sequence_split(X, y_window, y_daily, meta_df)
    print("\n=== CHRONOLOGICAL SPLIT ===")
    for name, part in splits.items():
        print(f"  {name:5s}: {part['X'].shape[0]} sequences", end="")
        if name != "train":
            print(f"  | labels: {pd.Series(part['y_window']).value_counts().to_dict()}")
        else:
            print()