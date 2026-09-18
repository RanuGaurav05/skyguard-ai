"""
SkyGuard AI - Physics Rule Engine
Path: 01_ml/03_src/03_physics/checks.py

Deterministic, fast sanity checks — no ML training involved. This engine runs
first in the pipeline and catches the "obviously wrong" cases cheaply, so the
LSTM/Spatial/Isolation Forest layers only need to handle subtler patterns.

Three kinds of checks:
  1. Range check       — is the value within physically possible bounds?
  2. Consistency check — do min_temp, avg_temp, max_temp agree with each other?
  3. Step-change check  — did the value jump further than physically realistic
                          in a single day? (catches spikes that land inside a
                          "normal-looking" range but are still impossible jumps)
"""

import pandas as pd

# HARD bounds: values outside this are physically impossible for these stations.
HARD_BOUNDS = {
    "avg_temp": (-30.0, 60.0),
    "air_pressure": (850.0, 1100.0),
    "relative_humidity": (0.0, 100.0),
}

# SOFT bounds: values outside this are extreme/unusual but not impossible
# (e.g. a genuine heatwave) — flagged at lower severity than a hard violation.
SOFT_BOUNDS = {
    "avg_temp": (-5.0, 50.0),
    "air_pressure": (970.0, 1040.0),
    "relative_humidity": (10.0, 100.0),
}

# Max realistic change between two CONSECUTIVE days for the same station.
# Chosen conservatively so real weather variation doesn't get flagged, but a
# same-day sensor jump does.
MAX_DAILY_CHANGE = {
    "avg_temp": 12.0,          # degrees C
    "air_pressure": 15.0,      # hPa
    "relative_humidity": 35.0, # percentage points
}


def check_range(feature: str, value: float) -> dict:
    """Single-value bounds check against HARD and SOFT limits."""
    if pd.isna(value):
        return {"violated": False, "level": None, "reason": None}

    hard_lo, hard_hi = HARD_BOUNDS[feature]
    soft_lo, soft_hi = SOFT_BOUNDS[feature]

    if value < hard_lo or value > hard_hi:
        return {"violated": True, "level": "HIGH",
                "reason": f"{feature}={value:.2f} is physically impossible (outside [{hard_lo}, {hard_hi}])"}
    if value < soft_lo or value > soft_hi:
        return {"violated": True, "level": "LOW",
                "reason": f"{feature}={value:.2f} is outside the typical range [{soft_lo}, {soft_hi}]"}
    return {"violated": False, "level": None, "reason": None}


def check_temp_consistency(min_temp: float, avg_temp: float, max_temp: float) -> dict:
    """min_temp <= avg_temp <= max_temp must hold for any single day."""
    if pd.isna(min_temp) or pd.isna(avg_temp) or pd.isna(max_temp):
        return {"violated": False, "level": None, "reason": None}

    if min_temp > avg_temp or avg_temp > max_temp:
        return {"violated": True, "level": "HIGH",
                "reason": f"Inconsistent temps: min={min_temp:.1f}, avg={avg_temp:.1f}, max={max_temp:.1f}"}
    return {"violated": False, "level": None, "reason": None}


def check_step_change(feature: str, current: float, previous: float,
                       days_gap: int) -> dict:
    """Flag a jump that's too large to be real weather variation.
    Only meaningful when the previous day is exactly 1 day back — a bigger gap
    naturally allows a bigger change, so we skip the check rather than guess.
    """
    if pd.isna(current) or pd.isna(previous) or days_gap != 1:
        return {"violated": False, "level": None, "reason": None}

    change = abs(current - previous)
    limit = MAX_DAILY_CHANGE[feature]
    if change > limit:
        return {"violated": True, "level": "MEDIUM",
                "reason": f"{feature} jumped {change:.2f} in 1 day (limit {limit})"}
    return {"violated": False, "level": None, "reason": None}


SEVERITY_RANK = {None: 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3}


def evaluate_row(row: pd.Series, prev_row: pd.Series = None) -> dict:
    """Runs all checks for one row and combines them into a single verdict."""
    checks = []

    for feature in ["avg_temp", "air_pressure", "relative_humidity"]:
        checks.append(check_range(feature, row[feature]))

    checks.append(check_temp_consistency(row["min_temp"], row["avg_temp"], row["max_temp"]))

    if prev_row is not None:
        days_gap = (row["date_of_record"] - prev_row["date_of_record"]).days
        for feature in ["avg_temp", "air_pressure", "relative_humidity"]:
            checks.append(check_step_change(feature, row[feature], prev_row[feature], days_gap))

    violations = [c for c in checks if c["violated"]]
    if not violations:
        return {"physics_flag": "PASS", "physics_severity": None, "physics_reasons": []}

    worst = max(violations, key=lambda c: SEVERITY_RANK[c["level"]])
    return {
        "physics_flag": "VIOLATION",
        "physics_severity": worst["level"],
        "physics_reasons": [v["reason"] for v in violations],
    }


def evaluate_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Runs the engine over every row, station-wise so step-change compares
    correctly against each station's own previous day."""
    df = df.copy()
    df["date_of_record"] = pd.to_datetime(df["date_of_record"])
    df = df.sort_values(["station_name", "date_of_record"]).reset_index(drop=True)

    results = []
    for station, grp in df.groupby("station_name"):
        grp = grp.sort_values("date_of_record")
        prev_row = None
        for _, row in grp.iterrows():
            verdict = evaluate_row(row, prev_row)
            results.append(verdict)
            prev_row = row

    verdict_df = pd.DataFrame(results)
    df["physics_flag"] = verdict_df["physics_flag"].values
    df["physics_severity"] = verdict_df["physics_severity"].values
    df["physics_reasons"] = verdict_df["physics_reasons"].values
    return df


# -------------------------------------------------------------------------------------------------------------------------------------------
# Whenever this code_script is directly run/called the constructor below will execute the code:
# -------------------------------------------------------------------------------------------------------------------------------------------

if __name__ == "__main__":
    # This is the dataset produced by 02_anomaly/injection.py — same file, just read here instead of imported, since checks.py only defines functions.
    INPUT_PATH = "01_ml/01_data/03_synthetic/skyguard_anomaly_dataset.csv"
    OUTPUT_PATH = "01_ml/01_data/03_synthetic/skyguard_physics_evaluated.csv"

    raw_df = pd.read_csv(INPUT_PATH)
    result_df = evaluate_dataframe(raw_df)
    result_df.to_csv(OUTPUT_PATH, index=False)

    print("=== PHYSICS FLAG DISTRIBUTION ===")
    print(result_df["physics_flag"].value_counts())

    print("\n=== RECALL PER ANOMALY TYPE (how many did physics alone catch?) ===")
    for atype in result_df["anomaly_type"].dropna().unique():
        sub = result_df[result_df["anomaly_type"] == atype]
        caught = (sub["physics_flag"] == "VIOLATION").sum()
        print(f"  {atype:25s}: {caught}/{len(sub)}  ({caught/len(sub)*100:.1f}%)")

    print("\n=== FALSE POSITIVE RATE on NORMAL rows ===")
    normal = result_df[result_df["anomaly_category"] == "NORMAL"]
    fp = (normal["physics_flag"] == "VIOLATION").sum()
    print(f"  {fp}/{len(normal)}  ({fp/len(normal)*100:.2f}%)")