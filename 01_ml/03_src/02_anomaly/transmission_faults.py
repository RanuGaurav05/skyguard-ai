"""
SkyGuard AI - Transmission Fault Injectors
Path: 01_ml/03_src/02_anomaly/transmission_faults.py

Covers TRANSMISSION_GLITCH category: MISSING_RECORD.
Unlike sensor faults, this does not modify a value — it removes rows entirely,
since a communication failure means no data arrived at all.
"""

import numpy as np


def inject_missing_record(df, n_events, used_rows, event_log, new_event_id,
                           min_len=1, max_len=3):
    """Drop a short run of consecutive days for a station to simulate a comms outage."""
    stations = df["station_name"].unique()
    rows_to_drop = []
    injected, attempts = 0, 0

    while injected < n_events and attempts < n_events * 20:
        attempts += 1
        station = np.random.choice(stations)
        station_df = df[df["station_name"] == station].sort_values("date_of_record")
        run_len = np.random.randint(min_len, max_len + 1)

        if len(station_df) <= run_len + 10:  # keep a buffer so we don't touch station edges
            continue

        start_pos = np.random.randint(5, len(station_df) - run_len - 5)
        window_idx = station_df.index[start_pos:start_pos + run_len]

        if any(i in used_rows for i in window_idx):
            continue

        eid = new_event_id()
        event_start = df.at[window_idx[0], "date_of_record"]
        event_end = df.at[window_idx[-1], "date_of_record"]

        for idx in window_idx:
            used_rows.add(idx)
            rows_to_drop.append(idx)

        event_log.append({
            "anomaly_id": eid, "anomaly_category": "TRANSMISSION_GLITCH",
            "anomaly_type": "MISSING_RECORD", "station_names": station,
            "affected_feature": "entire_record", "severity": "MEDIUM",
            "affected_rows": run_len, "event_start": event_start, "event_end": event_end,
        })
        injected += 1

    df = df.drop(index=rows_to_drop)  # do NOT reset_index here — that would corrupt
    # `used_rows` and any index-based lookups in injectors that run after this one.
    # Index is reset once, at the very end of the full pipeline (see injection.py).
    return df