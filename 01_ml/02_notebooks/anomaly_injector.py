import pandas as pd

from sensor_faults import add_sudden_spike, add_stuck_at
from transmission_faults import remove_record

# --------------------------------------------------------------------------------------------------------------------------------#

def create_anomaly_event(
    anomaly_id,
    station_name,
    anomaly_category,
    anomaly_type,
    affected_feature,
    start_date,
    end_date=None,
    severity=None
):
    """
    Create one event-level record for an injected anomaly.
    """

    event = {
        "anomaly_id": anomaly_id,
        "station_name": station_name,
        "anomaly_category": anomaly_category,
        "anomaly_type": anomaly_type,
        "affected_feature": affected_feature,
        "start_date": start_date,
        "end_date": end_date,
        "severity": severity
    }

    return event


# Helper addition before full random injection:

def select_station_row(df, station_name, position):
    """
    Select one observation from a specific station.
    """

    station_data = df[
        df["station_name"] == station_name
    ].sort_values("date_of_record")

    if station_data.empty:
        raise ValueError(f"Station not found: {station_name}")

    if position >= len(station_data):
        raise IndexError(
            f"Position {position} is outside the data for {station_name}."
        )

    return station_data.iloc[position].name

# Ye actual dataframe ka index return karta hai, jise add_sudden_spike() ya remove_record() use kar sakte hain.

# --------------------------------------------------------------------------------------------------------------------------------#

# def inject_test_anomalies(df):   # This is our main controller - Jo dataframe isko milega, uska modified version return karega.
#     """
#     Inject a few known anomalies into a copy of the dataset.
#     This is only for testing the anomaly pipeline.
#     """

#     test_df = df.copy()    # We aren't modifying the original clean_df
#     anomaly_log = []

#     # -------------------------------------------------
#     # 1. Sudden spike
#     # -------------------------------------------------

#     spike_index = 5000

#     result = add_sudden_spike(
#         test_df,
#         row_index=spike_index,
#         column="avg_temp",
#         increase=15.0
#     )

#     anomaly_log.append({
#         "anomaly_id": "TEST_SF_001",
#         "station_name": test_df.loc[spike_index, "station_name"],
#         "date": test_df.loc[spike_index, "date_of_record"],
#         "anomaly_category": "SENSOR_FAULT",
#         "anomaly_type": "SUDDEN_SPIKE",
#         "affected_feature": "avg_temp",
#         "original_value": result["original_value"],
#         "modified_value": result["modified_value"]
#     })

#     # -------------------------------------------------
#     # 2. Stuck-at
#     # -------------------------------------------------

#     mandi_rows = test_df[                                # Pehle Mandi ke observations nikaale.
#         test_df["station_name"] == "Mandi"
#     ].sort_values("date_of_record")

#     stuck_rows = mandi_rows.iloc[700:705].index         # Selected consecutive rows from 700- 704

#     result = add_stuck_at(
#         test_df,
#         stuck_rows,
#         "humidity"
#     )

#     for row_index in stuck_rows:

#         anomaly_log.append({
#             "anomaly_id": "TEST_SF_002",
#             "station_name": test_df.loc[row_index, "station_name"],
#             "date": test_df.loc[row_index, "date_of_record"],
#             "anomaly_category": "SENSOR_FAULT",
#             "anomaly_type": "STUCK_AT",
#             "affected_feature": "humidity",
#             "original_value": result["original_values"][list(stuck_rows).index(row_index)],
#             "modified_value": result["stuck_value"]
#         })

#     # -------------------------------------------------
#     # 3. Missing record
#     # -------------------------------------------------

#     mandi_rows = test_df[
#         test_df["station_name"] == "Mandi"
#     ].sort_values("date_of_record")

#     missing_index = mandi_rows.iloc[900].name           # Selected mandi's 900 th observation deliberately

#     test_df, removed_record = remove_record(
#         test_df,
#         missing_index
#     )

#     anomaly_log.append({
#         "anomaly_id": "TEST_TG_001",
#         "station_name": removed_record["station_name"],
#         "date": removed_record["date_of_record"],
#         "anomaly_category": "TRANSMISSION_GLITCH",
#         "anomaly_type": "MISSING_RECORD",
#         "affected_feature": "entire_record",
#         "original_value": None,
#         "modified_value": None
#     })

#     anomaly_log = pd.DataFrame(anomaly_log)

#     return test_df, anomaly_log
#     """
#     This returns : modified dataset + ground-truth anomaly log
#     O/P: TEST_SF_002
#         2022-12-05
#         TEST_SF_002
#         2022-12-06
#         TEST_SF_002
#         2022-12-07
#         TEST_SF_002
#         2022-12-08
#         TEST_SF_002
#         2022-12-09
#     """




def inject_test_anomalies(df):
    """
    Inject a few known anomalies and create event-level metadata.
    """

    test_df = df.copy()
    anomaly_log = []

    # -------------------------------------------------
    # 1. Sudden spike
    # -------------------------------------------------

#   spike_index = 5000 (Before)

    spike_index = select_station_row(
        test_df,
        station_name="Mandi",
        position=500
)

    result = add_sudden_spike(
        test_df,
        row_index=spike_index,
        column="avg_temp",
        increase=15.0
    )

    spike_event = create_anomaly_event(
        anomaly_id="TEST_SF_001",
        station_name=test_df.loc[spike_index, "station_name"],
        anomaly_category="SENSOR_FAULT",
        anomaly_type="SUDDEN_SPIKE",
        affected_feature="avg_temp",
        start_date=test_df.loc[spike_index, "date_of_record"],
        end_date=test_df.loc[spike_index, "date_of_record"],
        severity="high"
    )

    spike_event["original_value"] = result["original_value"]
    spike_event["modified_value"] = result["modified_value"]

    anomaly_log.append(spike_event)

    # -------------------------------------------------
    # 2. Stuck-at
    # -------------------------------------------------

    mandi_rows = test_df[
        test_df["station_name"] == "Mandi"
    ].sort_values("date_of_record")

    stuck_rows = mandi_rows.iloc[700:705].index

    result = add_stuck_at(
        test_df,
        stuck_rows,
        "relative_humidity"
    )

    stuck_event = create_anomaly_event(
        anomaly_id="TEST_SF_002",
        station_name="Mandi",
        anomaly_category="SENSOR_FAULT",
        anomaly_type="STUCK_AT",
        affected_feature="relative_humidity",
        start_date=test_df.loc[stuck_rows[0], "date_of_record"],
        end_date=test_df.loc[stuck_rows[-1], "date_of_record"],
        severity="medium"
    )

    stuck_event["original_values"] = result["original_values"]
    stuck_event["modified_value"] = result["stuck_value"]
    stuck_event["affected_rows"] = len(stuck_rows)

    anomaly_log.append(stuck_event)

    # -------------------------------------------------
    # 3. Missing record
    # -------------------------------------------------

    mandi_rows = test_df[
        test_df["station_name"] == "Mandi"
    ].sort_values("date_of_record")

    missing_index = mandi_rows.iloc[900].name

    test_df, removed_record = remove_record(
        test_df,
        missing_index
    )

    missing_event = create_anomaly_event(
        anomaly_id="TEST_TG_001",
        station_name=removed_record["station_name"],
        anomaly_category="TRANSMISSION_GLITCH",
        anomaly_type="MISSING_RECORD",
        affected_feature="entire_record",
        start_date=removed_record["date_of_record"],
        end_date=removed_record["date_of_record"],
        severity="medium"
    )

    anomaly_log.append(missing_event)

    anomaly_log = pd.DataFrame(anomaly_log)

    return test_df, anomaly_log

"""
TEST_SF_002
Mandi
STUCK_AT
Relative_humidity
2022-12-05 → 2022-12-09
medium
"""