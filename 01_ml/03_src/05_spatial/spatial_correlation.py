"""
SkyGuard AI - Spatial Correlation Engine

The core question this layer answers:
for a given station's reading on a given day, did every station GEOGRAPHICALLY NEAR it show a similar reading,
or is this one isolated reading ? We need an answer for this......

  - Isolated deviation (this station is an outlier vs its neighbors,who look normal) -> supports SENSOR_FAULT.

  - Consistent with neighbors (this station's reading matches what nearby stations are also showing,
    whether that's normal weather or a shared unusual pattern) -> does NOT support SENSOR_FAULT.
    If the LSTM or Physics layer also flagged this day, the shared neighbor pattern is
    what upgrades the verdict to GENUINE_EVENT in the Fusion layer.

Neighbor definition (distance <= 150km AND elevation difference <= 400m) is the same rule used in
genuine_events.py when the dataset's regional events were generated - kept identical on purpose,
so a "region" means the same thing whether we're injecting a synthetic event or checking a real one.

Three stations in this network (Bikaner, Car Nicobar, Shimla) have no real
neighbor under this rule — this engine is honest about that and reports
"insufficient data" for them rather than guessing.
"""

import numpy as np
import pandas as pd

MAX_REGION_RADIUS_KM = 150   # must match genuine_events.py
MAX_ELEVATION_DIFF_M = 400   # must match genuine_events.py
CORE_FEATURES = ["avg_temp", "air_pressure", "relative_humidity"]


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    return 2 * R * np.arcsin(np.sqrt(a))


def build_station_neighbor_groups(df: pd.DataFrame, max_radius_km=MAX_REGION_RADIUS_KM,
                                   max_elevation_diff_m=MAX_ELEVATION_DIFF_M):
    """For each station, the OTHER stations within max_radius_km and
    max_elevation_diff_m — i.e. its neighbors, not including itself."""
    stations = df[["station_name", "latitude", "longitude", "elevation"]].drop_duplicates("station_name").reset_index(drop=True)
    groups = {}
    for _, row in stations.iterrows():
        d = haversine_km(row["latitude"], row["longitude"], stations["latitude"], stations["longitude"])
        elev_diff = (stations["elevation"] - row["elevation"]).abs()
        nearby = stations.loc[(d <= max_radius_km) & (elev_diff <= max_elevation_diff_m)
                               & (stations["station_name"] != row["station_name"]), "station_name"].tolist()
        groups[row["station_name"]] = nearby
    return groups


def compute_spatial_scores(df: pd.DataFrame, features=CORE_FEATURES,
                            max_radius_km=MAX_REGION_RADIUS_KM,
                            max_elevation_diff_m=MAX_ELEVATION_DIFF_M) -> pd.DataFrame:
    """For every row, compares that station's reading to its neighbors'
    readings on the SAME DATE (a cross-sectional check, not a time-series
    one — this is what makes it a genuinely different signal from the LSTM).
    Adds one z-score column per feature, plus a combined spatial_flag."""

    df = df.copy()
    df["date_of_record"] = pd.to_datetime(df["date_of_record"])
    neighbor_groups = build_station_neighbor_groups(df, max_radius_km, max_elevation_diff_m)

    for feature in features:
        z_col = f"{feature}_spatial_z"
        df[z_col] = np.nan
        pivot = df.pivot_table(index="date_of_record", columns="station_name", values=feature)

        for station in df["station_name"].unique():
            neighbors = neighbor_groups.get(station, [])
            if len(neighbors) < 1:
                continue  # no neighbor at all -> stays NaN, handled by spatial_has_neighbors below

            neighbor_vals = pivot[neighbors]
            neighbor_mean = neighbor_vals.mean(axis=1, skipna=True)
            neighbor_std = neighbor_vals.std(axis=1, skipna=True)
            neighbor_count = neighbor_vals.notna().sum(axis=1)

            z = (pivot[station] - neighbor_mean) / neighbor_std.replace(0, np.nan)
            z[neighbor_count < 2] = np.nan  # need at least 2 valid neighbor readings for a meaningful std

            station_mask = df["station_name"] == station
            df.loc[station_mask, z_col] = df.loc[station_mask, "date_of_record"].map(z).values

    df["spatial_has_neighbors"] = df["station_name"].map(lambda s: len(neighbor_groups.get(s, [])) >= 1)
    z_cols = [f"{f}_spatial_z" for f in features]
    df["spatial_max_abs_z"] = df[z_cols].abs().max(axis=1)
    return df


def flag_spatial(df: pd.DataFrame, z_threshold: float) -> pd.DataFrame:


    """Turns the raw z-scores into a 3-way verdict. Kept separate from
    compute_spatial_scores so the threshold can be tuned without recomputing
    every z-score from scratch."""


    df = df.copy()
    df["spatial_flag"] = np.select(
        [df["spatial_has_neighbors"] == False, df["spatial_max_abs_z"] > z_threshold],
        ["INSUFFICIENT_DATA", "ISOLATED_DEVIATION"],
        default="CONSISTENT_WITH_NEIGHBORS",
    )
    return df


if __name__ == "__main__":
    INPUT_PATH = "01_ml/01_data/03_synthetic/skyguard_anomaly_dataset.csv"

    df = pd.read_csv(INPUT_PATH)
    df = compute_spatial_scores(df)

    print(" Stations with NO usable neighbor (always INSUFFICIENT_DATA) ")
    no_neighbor_stations = df.loc[~df["spatial_has_neighbors"], "station_name"].unique()
    print(list(no_neighbor_stations))

    print("\n z-score distributions, to pick a threshold from real data ")
    for category in ["NORMAL", "SENSOR_FAULT", "GENUINE_EVENT"]:
        vals = df.loc[df["anomaly_category"] == category, "spatial_max_abs_z"].dropna()
        if len(vals) == 0:
            continue
        print(f"  {category:15s}: median={vals.median():.2f}  75%ile={vals.quantile(.75):.2f}  "
              f"90%ile={vals.quantile(.90):.2f}  95%ile={vals.quantile(.95):.2f}")

    Z_THRESHOLD = 10  # NORMAL rows' own 99th percentile z-score — anything beyond what
    # ordinary day-to-day neighbor variation produces is treated as an isolated deviation
    df = flag_spatial(df, Z_THRESHOLD)

    print(f"\n=== VERDICT DISTRIBUTION (threshold={Z_THRESHOLD}) ===")
    print(df["spatial_flag"].value_counts())

    print("\n=== Does spatial correctly separate SENSOR_FAULT from GENUINE_EVENT? ===")
    for category in ["NORMAL", "SENSOR_FAULT", "GENUINE_EVENT"]:
        sub = df[(df["anomaly_category"] == category) & (df["spatial_has_neighbors"])]
        isolated_rate = (sub["spatial_flag"] == "ISOLATED_DEVIATION").mean()
        print(f"  {category:15s}: {isolated_rate*100:5.1f}% flagged as isolated deviation  (n={len(sub)})")