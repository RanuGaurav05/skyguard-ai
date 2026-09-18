"""
SkyGuard AI - Anomaly Injection Orchestrator
Path: 01_ml/03_src/02_anomaly/injection.py

Loads the base AWS dataset, prepares label/rolling-stat columns, then runs all
anomaly injectors (sensor_faults, transmission_faults, genuine_events) on the 3 core model features: avg_temp, air_pressure, relative_humidity.
"""

import uuid
import numpy as np
import pandas as pd

from sensor_faults import inject_sudden_spike, inject_stuck_at, inject_gradual_drift
from transmission_faults import inject_missing_record
from genuine_events import inject_regional_event

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)  # fixed seed -> reproducible anomaly placement across runs

CORE_FEATURES = ["avg_temp", "air_pressure", "relative_humidity"]


def load_base_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["date_of_record"] = pd.to_datetime(df["date_of_record"])
    df = df.sort_values(["station_name", "date_of_record"]).reset_index(drop=True)
    return df


def initialize_metadata_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Adds label columns with NORMAL defaults; injectors overwrite these per-row later."""
    df = df.copy()
    df["is_injected"] = False
    df["anomaly_category"] = "NORMAL"
    # object dtype so string labels can be assigned later without dtype errors
    for col in ["anomaly_type", "affected_feature", "severity", "anomaly_id",
                "event_start", "event_end", "description"]:
        df[col] = pd.Series([None] * len(df), dtype="object")
    df["original_value"] = np.nan
    df["modified_value"] = np.nan
    return df


def add_rolling_stats(df: pd.DataFrame, window: int = 7, min_periods: int = 3) -> pd.DataFrame:
    """7-day rolling mean/std per station, per core feature — used later by Isolation Forest.
    min_periods=3 ensures a lone valid point (e.g. right after a NaN or at series start)
    can't produce a "fake stable" rolling_mean equal to itself with rolling_std=NaN,
    which would silently mask an anomaly right at that spot. Fewer than 3 valid points
    in the window -> rolling stats stay NaN (handled explicitly downstream)."""
    df = df.copy()
    for feature in CORE_FEATURES:
        grouped = df.groupby("station_name")[feature]
        df[f"{feature}_rolling_mean_7d"] = grouped.transform(
            lambda x: x.rolling(window, min_periods=min_periods).mean()
        )
        df[f"{feature}_rolling_std_7d"] = grouped.transform(
            lambda x: x.rolling(window, min_periods=min_periods).std()
        )
    return df


def new_event_id() -> str:
    return "EVT_" + uuid.uuid4().hex[:8].upper()


def build_anomaly_dataset(input_path: str, output_csv: str, output_events_csv: str):
    df = load_base_data(input_path)
    df = initialize_metadata_columns(df)
    # NOTE: rolling stats are intentionally NOT computed here. They are computed
    # AFTER all injections below, so they reflect the "as-observed" corrupted
    # stream (what a live pipeline would actually see) instead of clean ground
    # truth — otherwise the rolling columns silently leak the true values.

    used_rows = set()  # tracks rows already claimed by an anomaly, prevents overlap
    event_log = []

    # SENSOR_FAULT — spread across all 3 core features
    df = inject_sudden_spike(df, "avg_temp", 60, used_rows, event_log, new_event_id)
    df = inject_sudden_spike(df, "air_pressure", 45, used_rows, event_log, new_event_id)
    df = inject_sudden_spike(df, "relative_humidity", 45, used_rows, event_log, new_event_id)

    df = inject_stuck_at(df, "avg_temp", 25, used_rows, event_log, new_event_id)
    df = inject_stuck_at(df, "relative_humidity", 25, used_rows, event_log, new_event_id)

    df = inject_gradual_drift(df, "air_pressure", 20, used_rows, event_log, new_event_id)
    df = inject_gradual_drift(df, "avg_temp", 20, used_rows, event_log, new_event_id)

    # TRANSMISSION_GLITCH
    df = inject_missing_record(df, 30, used_rows, event_log, new_event_id)

    # GENUINE_EVENT — regional, multi-station
    # companion_features keeps min_temp/max_temp scaled together with avg_temp
    # so min<=avg<=max stays physically consistent for a genuine heat event.
    # Magnitude ranges are NOT passed here — they default to DEFAULT_MAGNITUDE_RANGES in genuine_events.py, which are grounded in real IMD monsoon-depression /
    # heatwave data (see the comment there), not chosen to dodge the physics engine.
    df = inject_regional_event(df, "avg_temp", "REGIONAL_HEAT_EVENT", 20,
                                used_rows, event_log, new_event_id,
                                companion_features=["min_temp", "max_temp"])
    df = inject_regional_event(df, "air_pressure", "REGIONAL_PRESSURE_DROP", 20,
                                used_rows, event_log, new_event_id)

    # Rolling stats computed AFTER injection -> reflect the corrupted stream, not ground truth
    df = add_rolling_stats(df)

    df = df.reset_index(drop=True)       # safe to reset only now, after every injector is done

    events_df = pd.DataFrame(event_log)
    df.to_csv(output_csv, index=False)
    events_df.to_csv(output_events_csv, index=False)
    return df, events_df


if __name__ == "__main__":
    INPUT_PATH = "01_ml/01_data/02_processed/aws_stations_with_synthetic_humidity_clean.csv"
    OUTPUT_CSV = "01_ml/01_data/03_synthetic/skyguard_anomaly_dataset.csv"
    OUTPUT_EVENTS_CSV = "01_ml/01_data/03_synthetic/skyguard_anomaly_events.csv"

    df, events_df = build_anomaly_dataset(INPUT_PATH, OUTPUT_CSV, OUTPUT_EVENTS_CSV)

    print("=== FINAL DATASET SHAPE ===")
    print(df.shape)
    print("\n=== ANOMALY CATEGORY DISTRIBUTION ===")
    print(df["anomaly_category"].value_counts())
    print("\n=== ANOMALY TYPE DISTRIBUTION ===")
    print(df["anomaly_type"].value_counts(dropna=True))
    print("\n=== TOTAL EVENTS LOGGED ===")
    print(len(events_df))








