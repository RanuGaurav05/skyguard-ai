import { useState } from "react";
import {
  Activity,
  ChevronDown,
  Radio,
} from "lucide-react";

import { useLiveMonitoring } from "../components/LiveMonitoringContext";

function LiveMonitoring() {
  const {
    stations,
    selectedStation,
    setSelectedStation,
    stationData,
    currentIndex,
    currentRecord,
    visibleRecords,
    isLive,
    loading,
    error,
  } = useLiveMonitoring();

  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  const formatValue = (
    value,
    suffix = "",
    digits = 1
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      Number.isNaN(Number(value))
    ) {
      return "—";
    }

    return `${Number(value).toFixed(
      digits
    )}${suffix}`;
  };

  if (loading) {
    return (
      <section className="page-content live-monitoring-page">
        <div className="live-loading">
          <Activity
            className="live-loading-icon"
            size={24}
          />

          <span>
            Loading AWS observation data...
          </span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-content live-monitoring-page">
        <div className="live-error">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="page-content live-monitoring-page">

      {/* HEADER */}

      <div className="live-monitoring-header">

        <div>
          <span className="eyebrow">
            LIVE MONITORING
          </span>

          <h1>
            Live Weather Monitoring
          </h1>

          <p>
            Real-time atmospheric observations from
            Automatic Weather Stations
          </p>
        </div>

        <div className="live-status">
          <span className="live-status-dot"></span>

          <span>
            {isLive
              ? "ACTIVE"
              : "OFFLINE"}
          </span>
        </div>

      </div>


      {/* STATION CONTROL */}

      <div className="live-station-control">

        <div className="live-station-left">

          <span className="live-control-label">
            STATION
          </span>

          <div className="live-station-dropdown-wrapper">

            <button
              type="button"
              className="live-station-dropdown"
              onClick={() =>
                setIsDropdownOpen(
                  (previous) => !previous
                )
              }
              aria-expanded={
                isDropdownOpen
              }
              aria-label="Select weather station"
            >
              <span>
                {selectedStation}
              </span>

              <ChevronDown
                size={18}
                className={
                  isDropdownOpen
                    ? "live-chevron open"
                    : "live-chevron"
                }
              />
            </button>

            {isDropdownOpen && (
              <div className="live-station-menu">

                {stations.map(
                  (station, index) => (
                    <button
                      key={station}
                      type="button"
                      className={
                        selectedStation ===
                        station
                          ? "live-station-option selected"
                          : "live-station-option"
                      }
                      onClick={() => {
                        setSelectedStation(
                          station
                        );

                        setIsDropdownOpen(
                          false
                        );
                      }}
                    >
                      <span className="station-index">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <span>
                        {station}
                      </span>
                    </button>
                  )
                )}

              </div>
            )}

          </div>

        </div>


        {/* CURRENT STATION */}

        <div className="live-current-station">

          <span className="live-current-label">
            STATION
          </span>

          <strong>
            {selectedStation}
          </strong>

          <small>
            {stationData.length.toLocaleString()}{" "}
            OBSERVATIONS
          </small>

        </div>

      </div>


      {/* ACTIVE STATION */}

      <div className="live-station-name-card">

        <div className="live-name-icon">
          <Radio size={19} />
        </div>

        <div>
          <span>
            ACTIVE WEATHER STATION
          </span>

          <strong>
            {selectedStation}
          </strong>
        </div>

        <div className="live-stream-indicator">
          <span></span>

          {isLive
            ? "LIVE STREAM"
            : "STREAM PAUSED"}
        </div>

      </div>


      {/* WEATHER DATA */}

      <div className="live-data-card">

        <div className="live-data-header">

          <div>

            <span className="card-eyebrow">
              REAL-TIME OBSERVATION
            </span>

            <h2>
              Weather Observation Data
            </h2>

            <p>
              Current atmospheric parameters from{" "}
              <strong>
                {selectedStation}
              </strong>
            </p>

          </div>

          <div className="record-counter">
            RECORD{" "}
            {String(
              currentIndex + 1
            ).padStart(4, "0")}
            {" / "}
            {String(
              stationData.length
            ).padStart(4, "0")}
          </div>

        </div>


        {/* TABLE */}

        <div className="live-table-wrapper">

          <table className="live-data-table">

            <thead>
              <tr>
                <th>STATE</th>
                <th>DISTRICT</th>
                <th>DATE OF RECORD</th>
                <th>AVG TEMP</th>
                <th>MIN TEMP</th>
                <th>MAX TEMP</th>
                <th>RELATIVE HUMIDITY</th>
                <th>WIND SPEED</th>
                <th>AIR PRESSURE</th>
                <th>RAINFALL</th>
              </tr>
            </thead>

            <tbody>

              {visibleRecords.length > 0 ? (
                visibleRecords.map(
                  (record, index) => (
                    <tr
                      key={`${selectedStation}-${record.__datasetIndex}`}
                      className={
                        index === 0
                          ? "new-live-record"
                          : ""
                      }
                    >

                      <td>
                        {record.state || "—"}
                      </td>

                      <td>
                        {record.district || "—"}
                      </td>

                      <td className="date-cell">
                        {record.date_of_record ||
                          "—"}
                      </td>

                      <td className="numeric-cell">
                        {formatValue(
                          record.avg_temp,
                          " °C"
                        )}
                      </td>

                      <td className="numeric-cell">
                        {formatValue(
                          record.min_temp,
                          " °C"
                        )}
                      </td>

                      <td className="numeric-cell">
                        {formatValue(
                          record.max_temp,
                          " °C"
                        )}
                      </td>

                      <td className="numeric-cell">
                        {formatValue(
                          record.relative_humidity,
                          " %",
                          4
                        )}
                      </td>

                      <td className="numeric-cell">
                        {formatValue(
                          record.wind_speed,
                          " m/s"
                        )}
                      </td>

                      <td className="numeric-cell">
                        {formatValue(
                          record.air_pressure,
                          " hPa"
                        )}
                      </td>

                      <td className="numeric-cell">
                        {formatValue(
                          record.rainfall,
                          " mm"
                        )}
                      </td>

                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No observation data available
                    for this station.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="live-data-footer">

          <div>

            <span className="live-footer-dot"></span>

            {isLive
              ? "LIVE DATA STREAM"
              : "DATA STREAM"}

          </div>

          <span>
            Updating automatically
          </span>

          <span>
            Interval: 2 sec
          </span>

          <span>
            Showing{" "}
            {visibleRecords.length.toLocaleString()}{" "}
            records
          </span>

          <span>
            Current record:{" "}
            {currentRecord
              ? currentIndex + 1
              : "—"}
          </span>

        </div>

      </div>

    </section>
  );
}

export default LiveMonitoring;