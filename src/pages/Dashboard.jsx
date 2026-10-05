import { useState } from "react";

import SensorCard from "../components/SensorCard";
import WeatherChart from "../components/WeatherChart";
import SensorHealth from "../components/SensorHealth";
import AnomalyPanel from "../components/AnomalyPanel";
import RecentAlerts from "../components/RecentAlerts";
import AIStatus from "../components/AIStatus";
import WeatherDataGrid from "../components/WeatherDataGrid";

import { useLiveMonitoring } from "../components/LiveMonitoringContext";

function Dashboard() {
  const {
    stations,
    selectedStation,
    setSelectedStation,
    currentRecord,
    stationData,
    currentIndex,
    loading,
    isLive,
  } = useLiveMonitoring();

  const [isStationOpen, setIsStationOpen] =
    useState(false);

  const previousRecord =
    currentIndex > 0
      ? stationData[currentIndex - 1]
      : null;

  const getChange = (
    current,
    previous,
    unit = ""
  ) => {
    if (
      current === null ||
      current === undefined ||
      previous === null ||
      previous === undefined
    ) {
      return "";
    }

    const currentNumber = Number(current);
    const previousNumber = Number(previous);

    if (
      Number.isNaN(currentNumber) ||
      Number.isNaN(previousNumber)
    ) {
      return "";
    }

    const difference =
      currentNumber - previousNumber;

    if (difference === 0) {
      return "0";
    }

    const sign =
      difference > 0 ? "+" : "";

    return `${sign}${difference.toFixed(
      1
    )}${unit}`;
  };

  if (loading) {
    return (
      <section className="dashboard-content">
        <div className="live-loading">
          Loading live AWS data...
        </div>
      </section>
    );
  }

  if (!currentRecord) {
    return (
      <section className="dashboard-content">
        <div className="live-error">
          No live observation data available
          for {selectedStation}.
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-content">

      {/* PAGE HEADER */}
      <div className="page-heading">

        <div>
          <span className="eyebrow">
            AUTOMATIC WEATHER STATION
          </span>

          <h1>
            Weather Observation Network
          </h1>

          <p>
            Real-time atmospheric monitoring powered
            by SkyGuard AI
          </p>
        </div>


        {/* STATION SELECTOR */}

        <div className="station-selector">

          <div className="station-selector-status">
            <span className="status-dot"></span>
          </div>

          <div className="station-selector-info">

            <strong>
              {selectedStation}
            </strong>

            <small>
              {currentRecord.state ||
                "STATION"}{" "}
              · {isLive ? "ONLINE" : "OFFLINE"}
            </small>

          </div>

          <button
            type="button"
            className="selector-arrow"
            onClick={() =>
              setIsStationOpen(
                (previous) => !previous
              )
            }
            aria-label="Select weather station"
            aria-expanded={isStationOpen}
          >
            <span
              className={`dropdown-chevron ${
                isStationOpen
                  ? "open"
                  : ""
              }`}
            >
              ⌄
            </span>
          </button>

          {isStationOpen && (
            <div className="station-dropdown">

              {stations.map(
                (station, index) => (
                  <button
                    type="button"
                    key={station}
                    className={`station-dropdown-item ${
                      selectedStation ===
                      station
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedStation(
                        station
                      );

                      setIsStationOpen(false);
                    }}
                  >
                    <span className="station-number">
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


      {/* SENSOR CARDS */}

      <div className="sensor-grid">

        <SensorCard
          title="AVG Temperature"
          value={currentRecord.avg_temp}
          unit="°C"
          change={getChange(
            currentRecord.avg_temp,
            previousRecord?.avg_temp,
            "°C"
          )}
          status="NORMAL"
          icon="temperature"
        />

        <SensorCard
          title="Atmospheric Pressure"
          value={currentRecord.air_pressure}
          unit="hPa"
          change={getChange(
            currentRecord.air_pressure,
            previousRecord?.air_pressure,
            " hPa"
          )}
          status="STABLE"
          icon="pressure"
        />

        <SensorCard
          title="Relative Humidity"
          value={
            currentRecord.relative_humidity !==
              null &&
            currentRecord.relative_humidity !==
              undefined
              ? Number(
                  currentRecord.relative_humidity
                ).toFixed(4)
              : "—"
          }
          unit="%"
          change={getChange(
            currentRecord.relative_humidity,
            previousRecord?.relative_humidity,
            "%"
          )}
          status="NORMAL"
          icon="humidity"
        />

      </div>


      {/* AWS SENSOR DATA */}

      <WeatherDataGrid />


      {/* AI STATUS */}

      <AIStatus />


      {/* MAIN ANALYSIS */}

      <div className="dashboard-grid">

        <div className="chart-card large-card">
          <WeatherChart />
        </div>

        {/*
        <div className="health-wrapper">
          <SensorHealth />
        </div>
        */}

      </div>


      {/* LOWER SECTION */}

      <div className="dashboard-grid lower-grid">

        <AnomalyPanel />
        <RecentAlerts />

      </div>

    </section>
  );
}

export default Dashboard;