"""
SkyGuard AI - Stuck-Sensor Detector

A dedicated, deterministic check for STUCK_AT sensor faults — a sensor that
freezes and repeats the same value for several days. Neither the Physics
Rule Engine (single/adjacent-row checks) nor the LSTM Autoencoder (7-day
window) catch this well:

    Physics Engine recall on STUCK_AT:  ~3%
    LSTM Autoencoder recall on STUCK_AT: ~3%

The reason: a 7-day window usually only PARTIALLY overlaps a real stuck-run
(our injected stuck-runs are 4-8 days long), so it mixes real values with
the stuck value and never looks "flat enough" to stand out. A SHORTER
window — 3 days — is much more likely to land entirely inside the stuck
period, even for short runs.

This module computes a short-window rolling standard deviation per station,
per core feature, and flags a row as a stuck-sensor candidate when that std
falls below a threshold. This is meant to be consumed as an input signal by
the Isolation Forest step and/or the Fusion layer later — not a final
verdict on its own.
"""

import pandas as pd

ROLLING_WINDOW = 3      # days; short window catches short stuck-runs a 7-day window would miss
STD_THRESHOLD = 0.05    # below this, a feature is considered "not moving" over the window
CORE_FEATURES = ["avg_temp", "air_pressure", "relative_humidity"]


def compute_short_rolling_std(df: pd.DataFrame, feature: str,
                               window: int = ROLLING_WINDOW) -> pd.Series:
    """Rolling std per station, computed fresh (not reusing the 7-day rolling
    columns from injection.py — those are too wide for this check)."""
    parts = []
    for station, grp in df.groupby("station_name"):
        grp = grp.sort_values("date_of_record")
        s = grp[feature].rolling(window, min_periods=window).std()
        parts.append(pd.Series(s.values, index=grp.index))
    return pd.concat(parts).sort_index()


def detect_stuck_at(df: pd.DataFrame, features=CORE_FEATURES,
                     window: int = ROLLING_WINDOW,
                     threshold: float = STD_THRESHOLD) -> pd.DataFrame:
    """Adds stuck_at_flag (bool) and stuck_at_feature (which feature triggered
    it, if any) to the dataframe. A row can only be flagged by one feature
    here — the first one found below threshold — since in practice a stuck
    sensor affects one feature at a time in our data."""
    df = df.copy()
    df["date_of_record"] = pd.to_datetime(df["date_of_record"])
    df = df.sort_values(["station_name", "date_of_record"]).reset_index(drop=True)

    flag = pd.Series(False, index=df.index)
    triggering_feature = pd.Series([None] * len(df), dtype="object")

    for feature in features:
        rolling_std = compute_short_rolling_std(df, feature, window)
        this_feature_flag = rolling_std < threshold
        newly_flagged = this_feature_flag & ~flag  # don't overwrite an earlier feature's flag
        triggering_feature[newly_flagged] = feature
        flag = flag | this_feature_flag

    df["stuck_at_flag"] = flag
    df["stuck_at_feature"] = triggering_feature
    return df


if __name__ == "__main__":
    INPUT_PATH = "01_ml/01_data/03_synthetic/skyguard_anomaly_dataset.csv"

    df = pd.read_csv(INPUT_PATH)
    df = detect_stuck_at(df)

    print("=== RECALL on actual STUCK_AT rows ===")
    stuck_rows = df["anomaly_type"] == "STUCK_AT"
    recall = df.loc[stuck_rows, "stuck_at_flag"].mean()
    print(f"  {recall*100:.1f}%  (n={stuck_rows.sum()})")

    print("\n=== FALSE POSITIVE RATE on NORMAL rows ===")
    normal_rows = df["anomaly_category"] == "NORMAL"
    fp = df.loc[normal_rows, "stuck_at_flag"].mean()
    print(f"  {fp*100:.2f}%  (n={normal_rows.sum()})")

    print("\n=== side-effect check: does this also catch other anomaly types? ===")
    for atype in df["anomaly_type"].dropna().unique():
        if atype == "STUCK_AT":
            continue
        mask = df["anomaly_type"] == atype
        rate = df.loc[mask, "stuck_at_flag"].mean()
        print(f"  {atype:25s}: {rate*100:5.1f}%  (n={mask.sum()})")