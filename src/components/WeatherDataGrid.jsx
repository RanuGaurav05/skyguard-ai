import {
  Thermometer,
  Wind,
  CloudRain,
  Mountain,
  MapPin,
} from "lucide-react";

import { useLiveMonitoring } from "./LiveMonitoringContext";

function WeatherDataGrid() {
  const {
    selectedStation,
    currentRecord,
    isLive,
  } = useLiveMonitoring();

  const formatValue = (value, digits = 1) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      Number.isNaN(Number(value))
    ) {
      return "—";
    }

    return Number(value).toFixed(digits);
  };

  return (
    <div className="weather-data-card">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="weather-data-header">
        <div>
          <span className="card-eyebrow">
            AWS SENSOR DATA
          </span>

          <h2>
            Weather Observation Data
          </h2>

          <p>
            Current atmospheric parameters from{" "}
            <strong>{selectedStation}</strong>
          </p>
        </div>

        <div className="weather-data-live">
          <span
            className={`status-dot ${
              isLive ? "" : "offline"
            }`}
          ></span>

          {isLive ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      {/* =====================================================
          DATA GRID
      ===================================================== */}

      <div className="weather-data-grid">

        {/* MIN TEMPERATURE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Thermometer size={17} />
          </div>

          <div>
            <span>MIN TEMPERATURE</span>

            <strong>
              {formatValue(
                currentRecord?.min_temp
              )}{" "}
              °C
            </strong>
          </div>
        </div>


        {/* MAX TEMPERATURE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Thermometer size={17} />
          </div>

          <div>
            <span>MAX TEMPERATURE</span>

            <strong>
              {formatValue(
                currentRecord?.max_temp
              )}{" "}
              °C
            </strong>
          </div>
        </div>


        {/* WIND SPEED */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Wind size={17} />
          </div>

          <div>
            <span>WIND SPEED</span>

            <strong>
              {formatValue(
                currentRecord?.wind_speed
              )}{" "}
              m/s
            </strong>
          </div>
        </div>


        {/* RAINFALL */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <CloudRain size={17} />
          </div>

          <div>
            <span>RAINFALL</span>

            <strong>
              {formatValue(
                currentRecord?.rainfall
              )}{" "}
              mm
            </strong>
          </div>
        </div>


        {/* ELEVATION */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Mountain size={17} />
          </div>

          <div>
            <span>ELEVATION</span>

            <strong>
              {formatValue(
                currentRecord?.elevation
              )}{" "}
              m
            </strong>
          </div>
        </div>


        {/* LATITUDE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <MapPin size={17} />
          </div>

          <div>
            <span>LATITUDE</span>

            <strong>
              {formatValue(
                currentRecord?.latitude,
                4
              )}
            </strong>
          </div>
        </div>


        {/* LONGITUDE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <MapPin size={17} />
          </div>

          <div>
            <span>LONGITUDE</span>

            <strong>
              {formatValue(
                currentRecord?.longitude,
                4
              )}
            </strong>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WeatherDataGrid;