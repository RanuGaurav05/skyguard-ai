"""
SkyGuard AI - Genuine Event Injectors

Covers GENUINE_EVENT category: REGIONAL_HEAT_EVENT, REGIONAL_PRESSURE_DROP.
The defining trait of a genuine event is that every station GEOGRAPHICALLY NEAR the affected one moves together — this is what the spatial correlation
engine will later use to tell it apart from an isolated sensor fault.

Grouping is done by actual distance (haversine, using lat/long), not by the `cluster` label column. The label alone isn't reliable for this: the
"Isolated Edge-Case" cluster contains Bikaner and Car Nicobar, which are ~1,740 km apart — a single weather system cannot plausibly hit both at once,
so treating them as one "region" would inject a physically impossible event. Distance-based grouping naturally excludes pairings like that: a station
with no real neighbor within MAX_REGION_RADIUS_KM simply never qualifies for a regional event, which is the physically correct outcome.
"""

import numpy as np
import pandas as pd

MAX_REGION_RADIUS_KM = 150       # stations further apart than this aren't treated as one region
MAX_ELEVATION_DIFF_M = 400       # even if horizontally close, a big elevation gap means a meaningfully different local climate (e.g. plains vs a Himalayan hill station) — not one weather region


# HAVERSINE FORMULA Application :
def haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance between two lat/long points, in km."""
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    return 2 * R * np.arcsin(np.sqrt(a))


def build_station_neighbor_groups(df: pd.DataFrame, max_radius_km: float = MAX_REGION_RADIUS_KM,
                                   max_elevation_diff_m: float = MAX_ELEVATION_DIFF_M):
    """For each station, the set of stations (including itself) within
    max_radius_km AND within max_elevation_diff_m of its own elevation —
    used as that station's "region" for event injection. Both conditions
    matter: horizontal distance alone would wrongly group a plains station
    with a nearby-but-much-higher hill station (very different local climate)."""
    stations = df[["station_name", "latitude", "longitude", "elevation"]].drop_duplicates("station_name").reset_index(drop=True)
    groups = {}
    for _, row in stations.iterrows():
        d = haversine_km(row["latitude"], row["longitude"], stations["latitude"], stations["longitude"])
        elev_diff = (stations["elevation"] - row["elevation"]).abs()
        nearby = stations.loc[(d <= max_radius_km) & (elev_diff <= max_elevation_diff_m), "station_name"].tolist()
        groups[row["station_name"]] = nearby
    return groups


# Magnitude ranges are grounded in real Indian meteorological data, not tuned to pass/fail any downstream detector:
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
                           companion_features=None, max_radius_km=MAX_REGION_RADIUS_KM,
                           max_elevation_diff_m=MAX_ELEVATION_DIFF_M):
    """Apply the same directional shift to every station within max_radius_km
    (and max_elevation_diff_m elevation) of a randomly chosen center station,
    over a shared date window."""
    if magnitude_range is None:
        magnitude_range = DEFAULT_MAGNITUDE_RANGES[anomaly_type]

    neighbor_groups = build_station_neighbor_groups(df, max_radius_km, max_elevation_diff_m)
    # only stations that actually have a real neighbor can anchor a region
    eligible_centers = [s for s, grp in neighbor_groups.items() if len(grp) >= 2]

    injected, attempts = 0, 0
    while injected < n_events and attempts < n_events * 20:
        attempts += 1
        center = np.random.choice(eligible_centers)
        region_stations = neighbor_groups[center]  # includes center itself

        common_dates = df[df["station_name"] == region_stations[0]]["date_of_record"]
        run_len = np.random.randint(min_len, max_len + 1)
        if len(common_dates) <= run_len + 10:
            continue

        start_pos = np.random.randint(5, len(common_dates) - run_len - 5)
        date_window = sorted(common_dates)[start_pos:start_pos + run_len]

        magnitude = np.random.uniform(*magnitude_range)
        eid = new_event_id()
        affected_idx = []

        for station in region_stations:
            station_mask = (df["station_name"] == station) & (df["date_of_record"].isin(date_window))
            idxs = df[station_mask].index
            if any(i in used_rows for i in idxs):
                continue  # skip just this station, keep going for the rest of the region

            for idx in idxs:
                original = df.at[idx, feature]
                if pd.isna(original):
                    continue
                modified = original * (1 + magnitude)  # same direction/magnitude across the region

                # Applying the same positive scale factor to min/max keeps min<=avg<=max
                # intact — without this, a heat event pushes avg_temp above max_temp and
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
                    f"Regional {anomaly_type.replace('_', ' ').lower()} affecting stations "
                    f"within {max_radius_km}km of {center}"
                )
                used_rows.add(idx)
                affected_idx.append(idx)

        if not affected_idx:
            continue

        event_log.append({
            "anomaly_id": eid, "anomaly_category": "GENUINE_EVENT",
            "anomaly_type": anomaly_type, "station_names": ",".join(region_stations),
            "affected_feature": feature, "severity": "HIGH", "affected_rows": len(affected_idx),
        })
        injected += 1

    return df