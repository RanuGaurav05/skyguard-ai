"""
SkyGuard AI - Genuine Event Injectors
Path: 01_ml/03_src/02_anomaly/genuine_events.py

Covers GENUINE_EVENT category: REGIONAL_HEAT_EVENT, REGIONAL_PRESSURE_DROP.
The defining trait of a genuine event is that ALL stations in a cluster move together — this is what the spatial
correlation engine will later use to tell it apart from an isolated sensor fault.
"""

import numpy as np
import pandas as pd


# Magnitude ranges are grounded in real Indian meteorological data, not tuned
# to pass/fail any downstream detector:
#   - Heat events: regional temperature anomalies of 15-30% relative to seasonal norms are consistent with documented Indian heatwave episodes.
#   - Pressure drops: real Indian monsoon depressions and western disturbances produce only ~2-8 hPa surface pressure drops over an inland station
#     network (source: IMD monsoon depression case studies, Hunt et al. 2018 western disturbance composites). Our station network's own normal
#     pressure range is ~992-1025 hPa (33 hPa span) — a genuine regional event should be a small fraction of that, not larger than the whole range.
#     -0.3% to -0.8% of ~1013 hPa ≈ -3 to -8 hPa, matching that real-world figure.
DEFAULT_MAGNITUDE_RANGES = {
    "REGIONAL_HEAT_EVENT": (0.15, 0.30),
    "REGIONAL_PRESSURE_DROP": (-0.008, -0.003),
}


def inject_regional_event(df, feature, anomaly_type, n_events, used_rows, event_log,
                           new_event_id, min_len=2, max_len=4, magnitude_range=None,
                           companion_features=None):
    if magnitude_range is None:
        magnitude_range = DEFAULT_MAGNITUDE_RANGES[anomaly_type]
    """Apply the same directional shift to every station in a cluster over a shared date window."""
    clusters = df["cluster"].unique()
    injected, attempts = 0, 0

    while injected < n_events and attempts < n_events * 20:
        attempts += 1
        cluster = np.random.choice(clusters)
        cluster_stations = df[df["cluster"] == cluster]["station_name"].unique()
        if len(cluster_stations) < 2:  # need at least 2 stations for a "regional" pattern
            continue

        common_dates = df[df["station_name"] == cluster_stations[0]]["date_of_record"]
        run_len = np.random.randint(min_len, max_len + 1)
        if len(common_dates) <= run_len + 10:
            continue

        start_pos = np.random.randint(5, len(common_dates) - run_len - 5)
        date_window = sorted(common_dates)[start_pos:start_pos + run_len]

        magnitude = np.random.uniform(*magnitude_range)
        eid = new_event_id()
        affected_idx = []

        for station in cluster_stations:
            station_mask = (df["station_name"] == station) & (df["date_of_record"].isin(date_window))
            idxs = df[station_mask].index
            if any(i in used_rows for i in idxs):
                continue                             # skip just this station, keep going for the rest of the cluster

            for idx in idxs:
                original = df.at[idx, feature]
                if pd.isna(original):
                    continue
                modified = original * (1 + magnitude)  # same direction/magnitude across the cluster

                # Applying the same positive scale factor to min/max keeps min<=avg<=max intact — without this, a heat event pushes avg_temp above max_temp and
                # the physics rule engine wrongly flags a genuine event as a sensor fault.
                if companion_features:
                    for cf in companion_features:
                        cf_val = df.at[idx, cf]
                        if not pd.isna(cf_val):
                            df.at[idx, cf] = cf_val * (1 + magnitude)

                df.at[idx, feature] = modified
                df.at[idx, "is_injected"] = True
                df.at[idx, "anomaly_category"] = "GENUINE_EVENT"
                df.at[idx, "anomaly_type"] = anomaly_type
                df.at[idx, "affected_feature"] = feature
                df.at[idx, "severity"] = "HIGH"
                df.at[idx, "anomaly_id"] = eid
                df.at[idx, "original_value"] = original
                df.at[idx, "modified_value"] = modified
                df.at[idx, "description"] = (
                    f"Regional {anomaly_type.replace('_', ' ').lower()} affecting whole {cluster} cluster"
                )
                used_rows.add(idx)
                affected_idx.append(idx)

        if not affected_idx:
            continue

        event_log.append({
            "anomaly_id": eid, "anomaly_category": "GENUINE_EVENT",
            "anomaly_type": anomaly_type, "station_names": ",".join(cluster_stations),
            "affected_feature": feature, "severity": "HIGH", "affected_rows": len(affected_idx),
        })
        injected += 1

    return df