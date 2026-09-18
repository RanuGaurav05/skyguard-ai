"""
SkyGuard AI - Sensor Fault Injectors
Path: 01_ml/03_src/02_anomaly/sensor_faults.py

Covers SENSOR_FAULT category: SUDDEN_SPIKE, STUCK_AT, GRADUAL_DRIFT.
Each function mutates df in place, updates the shared `used_rows` set to prevent
overlapping injections, and appends a summary record to `event_log`.
"""

import numpy as np
import pandas as pd

# Physically plausible clip bounds per feature — even a faulty sensor doesn't
# usually report values wildly outside instrument range. Keeping spikes within
# these bounds makes them "wrong but plausible", which is what forces the model
# to actually learn temporal/spatial context instead of a trivial range check.
FEATURE_CLIP_BOUNDS = {
    "avg_temp": (-15.0, 55.0),
    "air_pressure": (940.0, 1050.0),
    "relative_humidity": (5.0, 100.0),
}


def inject_sudden_spike(df, feature, n_events, used_rows, event_log, new_event_id):
    """Single-day abrupt jump/drop in one feature (classic sensor glitch)."""
    stations = df["station_name"].unique()
    injected, attempts = 0, 0
    lo, hi = FEATURE_CLIP_BOUNDS[feature]

    while injected < n_events and attempts < n_events * 20:
        attempts += 1
        station = np.random.choice(stations)
        station_rows = df[df["station_name"] == station].index
        candidate_idx = np.random.choice(station_rows)

        if candidate_idx in used_rows:
            continue

        original = df.at[candidate_idx, feature]
        if pd.isna(original):
            continue

        # magnitude and direction of the spike are randomized within a realistic band
        spike_pct = np.random.uniform(0.35, 0.6)
        direction = np.random.choice([1, -1])
        modified = original * (1 + direction * spike_pct)
        modified = float(np.clip(modified, lo, hi))  # keep it within instrument-plausible range

        df.at[candidate_idx, feature] = modified
        eid = new_event_id()
        df.at[candidate_idx, "is_injected"] = True
        df.at[candidate_idx, "anomaly_category"] = "SENSOR_FAULT"
        df.at[candidate_idx, "anomaly_type"] = "SUDDEN_SPIKE"
        df.at[candidate_idx, "affected_feature"] = feature
        df.at[candidate_idx, "severity"] = "HIGH"
        df.at[candidate_idx, "anomaly_id"] = eid
        df.at[candidate_idx, "original_value"] = original
        df.at[candidate_idx, "modified_value"] = modified
        df.at[candidate_idx, "description"] = (
            f"Sudden {spike_pct*100:.0f}% spike in {feature} — likely sensor glitch"
        )

        used_rows.add(candidate_idx)
        event_log.append({
            "anomaly_id": eid, "anomaly_category": "SENSOR_FAULT",
            "anomaly_type": "SUDDEN_SPIKE", "station_names": station,
            "affected_feature": feature, "severity": "HIGH", "affected_rows": 1,
        })
        injected += 1

    return df


def inject_stuck_at(df, feature, n_events, used_rows, event_log, new_event_id,
                     min_len=4, max_len=8):
    """Sensor freezes and reports the same value for several consecutive days."""
    stations = df["station_name"].unique()
    injected, attempts = 0, 0

    while injected < n_events and attempts < n_events * 20:
        attempts += 1
        station = np.random.choice(stations)
        station_df = df[df["station_name"] == station].sort_values("date_of_record")
        run_len = np.random.randint(min_len, max_len + 1)

        if len(station_df) <= run_len:
            continue

        start_pos = np.random.randint(0, len(station_df) - run_len)
        window_idx = station_df.index[start_pos:start_pos + run_len]

        if any(i in used_rows for i in window_idx):
            continue

        # value from day 1 of the window becomes the "frozen" reading for the whole run
        stuck_value = df.at[window_idx[0], feature]
        if pd.isna(stuck_value):
            continue

        eid = new_event_id()
        for idx in window_idx:
            original = df.at[idx, feature]
            df.at[idx, feature] = stuck_value
            df.at[idx, "is_injected"] = True
            df.at[idx, "anomaly_category"] = "SENSOR_FAULT"
            df.at[idx, "anomaly_type"] = "STUCK_AT"
            df.at[idx, "affected_feature"] = feature
            df.at[idx, "severity"] = "MEDIUM"
            df.at[idx, "anomaly_id"] = eid
            df.at[idx, "original_value"] = original
            df.at[idx, "modified_value"] = stuck_value
            df.at[idx, "description"] = (
                f"Sensor stuck at constant {feature} value for {run_len} days"
            )
            used_rows.add(idx)

        event_log.append({
            "anomaly_id": eid, "anomaly_category": "SENSOR_FAULT",
            "anomaly_type": "STUCK_AT", "station_names": station,
            "affected_feature": feature, "severity": "MEDIUM", "affected_rows": run_len,
        })
        injected += 1

    return df


def inject_gradual_drift(df, feature, n_events, used_rows, event_log, new_event_id,
                          min_len=6, max_len=12):
    """Slow calibration decay: value drifts steadily in one direction over the window."""
    stations = df["station_name"].unique()
    injected, attempts = 0, 0
    lo, hi = FEATURE_CLIP_BOUNDS[feature]

    while injected < n_events and attempts < n_events * 20:
        attempts += 1
        station = np.random.choice(stations)
        station_df = df[df["station_name"] == station].sort_values("date_of_record")
        run_len = np.random.randint(min_len, max_len + 1)

        if len(station_df) <= run_len:
            continue

        start_pos = np.random.randint(0, len(station_df) - run_len)
        window_idx = station_df.index[start_pos:start_pos + run_len]

        if any(i in used_rows for i in window_idx):
            continue

        total_drift_pct = np.random.uniform(0.15, 0.30)
        direction = np.random.choice([1, -1])
        eid = new_event_id()

        for step, idx in enumerate(window_idx):
            original = df.at[idx, feature]
            if pd.isna(original):
                continue
            # drift accumulates linearly across the window (day 1 = small, last day = full magnitude)
            progress = (step + 1) / run_len
            drifted = original * (1 + direction * total_drift_pct * progress)
            drifted = float(np.clip(drifted, lo, hi))  # keep drift within instrument-plausible range

            df.at[idx, feature] = drifted
            df.at[idx, "is_injected"] = True
            df.at[idx, "anomaly_category"] = "SENSOR_FAULT"
            df.at[idx, "anomaly_type"] = "GRADUAL_DRIFT"
            df.at[idx, "affected_feature"] = feature
            df.at[idx, "severity"] = "LOW" if progress < 0.5 else "MEDIUM"
            df.at[idx, "anomaly_id"] = eid
            df.at[idx, "original_value"] = original
            df.at[idx, "modified_value"] = drifted
            df.at[idx, "description"] = (
                f"Gradual sensor drift in {feature}, day {step+1}/{run_len} of calibration decay"
            )
            used_rows.add(idx)

        event_log.append({
            "anomaly_id": eid, "anomaly_category": "SENSOR_FAULT",
            "anomaly_type": "GRADUAL_DRIFT", "station_names": station,
            "affected_feature": feature, "severity": "MEDIUM", "affected_rows": run_len,
        })
        injected += 1

    return df