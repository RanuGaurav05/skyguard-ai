import { useState } from "react";
import StationMap from "../components/StationMap";

import {
  MapPin,
  Activity,
  AlertTriangle,
  Wifi,
  Search,
  ChevronRight,
} from "lucide-react";

// =========================================================
// STATION DATA
// =========================================================

const stations = [
  {
    id: "AWS-042",
    name: "Central Station",
    location: "Bhopal Central",

    avg_temp: 27.4,
    min_temp: 24.8,
    max_temp: 30.6,
    relative_humidity: 68.2,
    wind_speed: 12.4,
    air_pressure: 1012.6,
    rainfall: 0.0,

    elevation: 523,
    latitude: 23.2599,
    longitude: 77.4126,

    health: 94,
    status: "NORMAL",
    lastUpdate: "2 sec ago",
  },

  {
    id: "AWS-018",
    name: "North Station",
    location: "Bhopal North",

    avg_temp: 26.8,
    min_temp: 23.9,
    max_temp: 29.7,
    relative_humidity: 71.4,
    wind_speed: 10.8,
    air_pressure: 1011.8,
    rainfall: 0.4,

    elevation: 541,
    latitude: 23.285,
    longitude: 77.395,

    health: 97,
    status: "NORMAL",
    lastUpdate: "4 sec ago",
  },

  {
    id: "AWS-011",
    name: "East Station",
    location: "Bhopal East",

    avg_temp: 29.1,
    min_temp: 25.7,
    max_temp: 32.8,
    relative_humidity: 72.1,
    wind_speed: 15.2,
    air_pressure: 1010.9,
    rainfall: 2.6,

    elevation: 517,
    latitude: 23.2685,
    longitude: 77.438,

    health: 76,
    status: "WARNING",
    lastUpdate: "8 sec ago",
  },

  {
    id: "AWS-027",
    name: "South Station",
    location: "Bhopal South",

    avg_temp: 27.9,
    min_temp: 24.6,
    max_temp: 31.2,
    relative_humidity: 66.8,
    wind_speed: 11.6,
    air_pressure: 1012.1,
    rainfall: 0.0,

    elevation: 496,
    latitude: 23.225,
    longitude: 77.415,

    health: 91,
    status: "NORMAL",
    lastUpdate: "3 sec ago",
  },

  {
    id: "AWS-033",
    name: "West Station",
    location: "Bhopal West",

    avg_temp: 28.2,
    min_temp: 25.1,
    max_temp: 31.5,
    relative_humidity: 69.3,
    wind_speed: 13.1,
    air_pressure: 1011.4,
    rainfall: 0.8,

    elevation: 528,
    latitude: 23.255,
    longitude: 77.365,

    health: 89,
    status: "NORMAL",
    lastUpdate: "5 sec ago",
  },

  {
    id: "AWS-006",
    name: "Airport Station",
    location: "Airport Zone",

    avg_temp: "--",
    min_temp: "--",
    max_temp: "--",
    relative_humidity: "--",
    wind_speed: "--",
    air_pressure: "--",
    rainfall: "--",

    elevation: 522,
    latitude: 23.2875,
    longitude: 77.337,

    health: 42,
    status: "OFFLINE",
    lastUpdate: "14 min ago",
  },
];

// =========================================================
// STATIONS PAGE
// =========================================================

function Stations() {
  const [selectedStationId, setSelectedStationId] = useState("AWS-042");

  const [searchTerm, setSearchTerm] = useState("");

  // =======================================================
  // SELECTED STATION
  // =======================================================

  const selectedStation =
    stations.find((station) => station.id === selectedStationId) || stations[0];

  // =======================================================
  // SEARCH
  // =======================================================

  const filteredStations = stations.filter((station) =>
    `${station.id} ${station.name} ${station.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // =======================================================
  // STATUS
  // =======================================================

  const isOffline = selectedStation.status === "OFFLINE";

  const isWarning = selectedStation.status === "WARNING";

  return (
    <div className="page-content">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="stations-header">
        <div>
          <span className="eyebrow">AUTOMATIC WEATHER STATIONS</span>

          <h1>Weather Station Network</h1>

          <p>
            Monitor connected AWS infrastructure and real-time sensor health
          </p>
        </div>

        <div className="network-live">
          <span className="status-dot"></span>
          NETWORK LIVE
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="station-summary">
        <div className="station-summary-card">
          <span>TOTAL STATIONS</span>

          <strong>24</strong>

          <small>Connected network</small>
        </div>

        <div className="station-summary-card">
          <span>HEALTHY</span>

          <strong>21</strong>

          <small>Normal operation</small>
        </div>

        <div className="station-summary-card">
          <span>WARNING</span>

          <strong>02</strong>

          <small>Requires attention</small>
        </div>

        <div className="station-summary-card">
          <span>OFFLINE</span>

          <strong>01</strong>

          <small>No recent transmission</small>
        </div>
      </div>

      {/* =====================================================
          NETWORK AREA
      ===================================================== */}

      <div className="stations-main-grid">
        {/* ===================================================
            LEAFLET MAP
        =================================================== */}

        <div className="network-map-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">NETWORK OVERVIEW</span>

              <h2>Station Distribution</h2>
            </div>

            <div className="map-status">
              <Wifi size={14} />
              24 ONLINE
            </div>
          </div>

          {/* REAL LEAFLET MAP */}

          <div className="network-map">
            <StationMap
              stations={stations}
              selectedStationId={selectedStationId}
              setSelectedStationId={setSelectedStationId}
            />
          </div>
        </div>

        {/* ===================================================
            SELECTED STATION
        =================================================== */}

        <div className="station-detail-card">
          {/* HEADER */}

          <div className="station-detail-header">
            <div>
              <span className="card-eyebrow">SELECTED STATION</span>

              <h2>{selectedStation.id}</h2>

              <p>
                {selectedStation.name}

                {" · "}

                {selectedStation.location}
              </p>
            </div>

            <div className={`station-online ${isOffline ? "offline" : ""}`}>
              <span className="status-dot"></span>

              {selectedStation.status}
            </div>
          </div>

          {/* =================================================
              HEALTH
          ================================================= */}

          <div className="station-health-large">
            <div className="health-number">
              <strong>{selectedStation.health}</strong>

              <span>%</span>
            </div>

            <div>
              <span>Sensor Health</span>

              <strong>
                {isOffline ? "CRITICAL" : isWarning ? "ATTENTION" : "GOOD"}
              </strong>
            </div>
          </div>

          {/* =================================================
    WEATHER PARAMETERS
================================================= */}

          <div className="station-reading station-reading-expanded">
            {/* AVG TEMPERATURE */}
            <div>
              <span>Avg Temperature</span>
              <strong>
                {selectedStation.avg_temp === "--"
                  ? "--"
                  : `${selectedStation.avg_temp} °C`}
              </strong>
            </div>

            {/* MIN TEMPERATURE */}
            <div>
              <span>Min Temperature</span>
              <strong>
                {selectedStation.min_temp === "--"
                  ? "--"
                  : `${selectedStation.min_temp} °C`}
              </strong>
            </div>

            {/* MAX TEMPERATURE */}
            <div>
              <span>Max Temperature</span>
              <strong>
                {selectedStation.max_temp === "--"
                  ? "--"
                  : `${selectedStation.max_temp} °C`}
              </strong>
            </div>

            {/* HUMIDITY */}
            <div>
              <span>Relative Humidity</span>
              <strong>
                {selectedStation.relative_humidity === "--"
                  ? "--"
                  : `${selectedStation.relative_humidity} %`}
              </strong>
            </div>

            {/* WIND SPEED */}
            <div>
              <span>Wind Speed</span>
              <strong>
                {selectedStation.wind_speed === "--"
                  ? "--"
                  : `${selectedStation.wind_speed} m/s`}
              </strong>
            </div>

            {/* AIR PRESSURE */}
            <div>
              <span>Air Pressure</span>
              <strong>
                {selectedStation.air_pressure === "--"
                  ? "--"
                  : `${selectedStation.air_pressure} hPa`}
              </strong>
            </div>

            {/* RAINFALL */}
            <div>
              <span>Rainfall</span>
              <strong>
                {selectedStation.rainfall === "--"
                  ? "--"
                  : `${selectedStation.rainfall} mm`}
              </strong>
            </div>

            {/* ELEVATION */}
            <div>
              <span>Elevation</span>
              <strong>{selectedStation.elevation} m</strong>
            </div>

            {/* LATITUDE */}
            <div>
              <span>Latitude</span>
              <strong>{selectedStation.latitude}</strong>
            </div>

            {/* LONGITUDE */}
            <div>
              <span>Longitude</span>
              <strong>{selectedStation.longitude}</strong>
            </div>
          </div>

          {/* =================================================
              AI STATUS
          ================================================= */}

          <div
            className={`station-ai ${
              isWarning || isOffline ? "attention" : ""
            }`}
          >
            <div className="station-ai-icon">
              {isWarning || isOffline ? (
                <AlertTriangle size={17} />
              ) : (
                <Activity size={17} />
              )}
            </div>

            <div>
              <span>AI STATUS</span>

              <strong>
                {isOffline
                  ? "No recent sensor transmission"
                  : isWarning
                    ? "Potential sensor inconsistency"
                    : "Normal atmospheric pattern"}
              </strong>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="station-detail-footer">
            <div>
              <span>Last transmission</span>

              <strong>{selectedStation.lastUpdate}</strong>
            </div>

            <ChevronRight size={17} />
          </div>
        </div>
      </div>

      {/* =====================================================
          STATION TABLE
      ===================================================== */}

      <div className="station-table-card">
        {/* TABLE HEADER */}

        <div className="table-header">
          <div>
            <span className="card-eyebrow">LIVE TELEMETRY</span>

            <h2>Station Activity</h2>
          </div>

          {/* SEARCH */}

          <div className="station-search">
            <Search size={14} />

            <input
              placeholder="Search station..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}

        <div className="station-table">
          {/* TABLE HEADING */}

          <div className="table-row table-heading">
            <span>STATION</span>

            <span>AVG TEMP</span>

            <span>MIN TEMP</span>

            <span>MAX TEMP</span>

            <span>HUMIDITY</span>

            <span>WIND</span>

            <span>PRESSURE</span>

            <span>RAINFALL</span>

            <span>HEALTH</span>

            <span>STATUS</span>
          </div>

          {/* TABLE ROWS */}

          {filteredStations.map((station) => (
            <button
              className={`table-row station-table-row ${
                selectedStationId === station.id ? "selected-row" : ""
              }`}
              key={station.id}
              onClick={() => setSelectedStationId(station.id)}
            >
              {/* STATION */}

              <div className="station-name-cell">
                <div className="station-table-icon">
                  <MapPin size={14} />
                </div>

                <div>
                  <strong>{station.id}</strong>

                  <small>{station.name}</small>
                </div>
              </div>

              {/* AVG TEMPERATURE */}
              <span>
                {station.avg_temp === "--" ? "--" : `${station.avg_temp} °C`}
              </span>

              {/* MIN TEMPERATURE */}
              <span>
                {station.min_temp === "--" ? "--" : `${station.min_temp} °C`}
              </span>

              {/* MAX TEMPERATURE */}
              <span>
                {station.max_temp === "--" ? "--" : `${station.max_temp} °C`}
              </span>

              {/* HUMIDITY */}
              <span>
                {station.relative_humidity === "--"
                  ? "--"
                  : `${station.relative_humidity} %`}
              </span>

              {/* WIND SPEED */}
              <span>
                {station.wind_speed === "--"
                  ? "--"
                  : `${station.wind_speed} m/s`}
              </span>

              {/* PRESSURE */}
              <span>
                {station.air_pressure === "--"
                  ? "--"
                  : `${station.air_pressure} hPa`}
              </span>

              {/* RAINFALL */}
              <span>
                {station.rainfall === "--" ? "--" : `${station.rainfall} mm`}
              </span>

              {/* HEALTH */}

              <span className="health-value">{station.health}%</span>

              {/* STATUS */}

              <span className={`table-status ${station.status.toLowerCase()}`}>
                <i></i>

                {station.status}
              </span>
            </button>
          ))}

          {/* NO RESULTS */}

          {filteredStations.length === 0 && (
            <div className="no-stations">No stations found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Stations;
