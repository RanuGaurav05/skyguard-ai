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
    temperature: "27.4",
    pressure: "1012.6",
    humidity: "68.2",
    health: 94,
    status: "NORMAL",
    lastUpdate: "2 sec ago",
  },

  {
    id: "AWS-018",
    name: "North Station",
    location: "Bhopal North",
    temperature: "26.8",
    pressure: "1011.8",
    humidity: "71.4",
    health: 97,
    status: "NORMAL",
    lastUpdate: "4 sec ago",
  },

  {
    id: "AWS-011",
    name: "East Station",
    location: "Bhopal East",
    temperature: "29.1",
    pressure: "1010.9",
    humidity: "72.1",
    health: 76,
    status: "WARNING",
    lastUpdate: "8 sec ago",
  },

  {
    id: "AWS-027",
    name: "South Station",
    location: "Bhopal South",
    temperature: "27.9",
    pressure: "1012.1",
    humidity: "66.8",
    health: 91,
    status: "NORMAL",
    lastUpdate: "3 sec ago",
  },

  {
    id: "AWS-033",
    name: "West Station",
    location: "Bhopal West",
    temperature: "28.2",
    pressure: "1011.4",
    humidity: "69.3",
    health: 89,
    status: "NORMAL",
    lastUpdate: "5 sec ago",
  },

  {
    id: "AWS-006",
    name: "Airport Station",
    location: "Airport Zone",
    temperature: "--",
    pressure: "--",
    humidity: "--",
    health: 42,
    status: "OFFLINE",
    lastUpdate: "14 min ago",
  },
];


// =========================================================
// STATIONS PAGE
// =========================================================

function Stations() {

  const [
    selectedStationId,
    setSelectedStationId,
  ] = useState("AWS-042");


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  // =======================================================
  // SELECTED STATION
  // =======================================================

  const selectedStation =
    stations.find(
      (station) =>
        station.id === selectedStationId
    ) || stations[0];


  // =======================================================
  // SEARCH
  // =======================================================

  const filteredStations =
    stations.filter((station) =>
      `${station.id} ${station.name} ${station.location}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );


  // =======================================================
  // STATUS
  // =======================================================

  const isOffline =
    selectedStation.status === "OFFLINE";

  const isWarning =
    selectedStation.status === "WARNING";


  return (
    <div className="page-content">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="stations-header">

        <div>

          <span className="eyebrow">
            AUTOMATIC WEATHER STATIONS
          </span>

          <h1>
            Weather Station Network
          </h1>

          <p>
            Monitor connected AWS infrastructure
            and real-time sensor health
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

          <span>
            TOTAL STATIONS
          </span>

          <strong>
            24
          </strong>

          <small>
            Connected network
          </small>

        </div>


        <div className="station-summary-card">

          <span>
            HEALTHY
          </span>

          <strong>
            21
          </strong>

          <small>
            Normal operation
          </small>

        </div>


        <div className="station-summary-card">

          <span>
            WARNING
          </span>

          <strong>
            02
          </strong>

          <small>
            Requires attention
          </small>

        </div>


        <div className="station-summary-card">

          <span>
            OFFLINE
          </span>

          <strong>
            01
          </strong>

          <small>
            No recent transmission
          </small>

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

              <span className="card-eyebrow">
                NETWORK OVERVIEW
              </span>

              <h2>
                Station Distribution
              </h2>

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
              selectedStationId={
                selectedStationId
              }
              setSelectedStationId={
                setSelectedStationId
              }
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

              <span className="card-eyebrow">
                SELECTED STATION
              </span>

              <h2>
                {selectedStation.id}
              </h2>

              <p>

                {selectedStation.name}

                {" · "}

                {selectedStation.location}

              </p>

            </div>


            <div
              className={`station-online ${
                isOffline
                  ? "offline"
                  : ""
              }`}
            >

              <span className="status-dot"></span>

              {selectedStation.status}

            </div>

          </div>



          {/* =================================================
              HEALTH
          ================================================= */}

          <div className="station-health-large">

            <div className="health-number">

              <strong>
                {selectedStation.health}
              </strong>

              <span>
                %
              </span>

            </div>


            <div>

              <span>
                Sensor Health
              </span>

              <strong>

                {
                  isOffline
                    ? "CRITICAL"
                    : isWarning
                      ? "ATTENTION"
                      : "GOOD"
                }

              </strong>

            </div>

          </div>



          {/* =================================================
              READINGS
          ================================================= */}

          <div className="station-reading">


            {/* TEMPERATURE */}

            <div>

              <span>
                Temperature
              </span>

              <strong>

                {
                  selectedStation.temperature === "--"
                    ? "--"
                    : `${selectedStation.temperature} °C`
                }

              </strong>

            </div>


            {/* PRESSURE */}

            <div>

              <span>
                Pressure
              </span>

              <strong>

                {
                  selectedStation.pressure === "--"
                    ? "--"
                    : `${selectedStation.pressure} hPa`
                }

              </strong>

            </div>


            {/* HUMIDITY */}

            <div>

              <span>
                Humidity
              </span>

              <strong>

                {
                  selectedStation.humidity === "--"
                    ? "--"
                    : `${selectedStation.humidity} %`
                }

              </strong>

            </div>

          </div>



          {/* =================================================
              AI STATUS
          ================================================= */}

          <div
            className={`station-ai ${
              isWarning || isOffline
                ? "attention"
                : ""
            }`}
          >

            <div className="station-ai-icon">

              {
                isWarning || isOffline ? (
                  <AlertTriangle size={17} />
                ) : (
                  <Activity size={17} />
                )
              }

            </div>


            <div>

              <span>
                AI STATUS
              </span>

              <strong>

                {
                  isOffline
                    ? "No recent sensor transmission"
                    : isWarning
                      ? "Potential sensor inconsistency"
                      : "Normal atmospheric pattern"
                }

              </strong>

            </div>

          </div>



          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="station-detail-footer">

            <div>

              <span>
                Last transmission
              </span>

              <strong>
                {selectedStation.lastUpdate}
              </strong>

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

            <span className="card-eyebrow">
              LIVE TELEMETRY
            </span>

            <h2>
              Station Activity
            </h2>

          </div>


          {/* SEARCH */}

          <div className="station-search">

            <Search size={14} />

            <input
              placeholder="Search station..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>

        </div>



        {/* TABLE */}

        <div className="station-table">


          {/* TABLE HEADING */}

          <div className="table-row table-heading">

            <span>
              STATION
            </span>

            <span>
              TEMPERATURE
            </span>

            <span>
              PRESSURE
            </span>

            <span>
              HUMIDITY
            </span>

            <span>
              HEALTH
            </span>

            <span>
              STATUS
            </span>

          </div>



          {/* TABLE ROWS */}

          {filteredStations.map(
            (station) => (

              <button
                className={`table-row station-table-row ${
                  selectedStationId === station.id
                    ? "selected-row"
                    : ""
                }`}
                key={station.id}
                onClick={() =>
                  setSelectedStationId(
                    station.id
                  )
                }
              >


                {/* STATION */}

                <div className="station-name-cell">

                  <div className="station-table-icon">

                    <MapPin size={14} />

                  </div>


                  <div>

                    <strong>
                      {station.id}
                    </strong>

                    <small>
                      {station.name}
                    </small>

                  </div>

                </div>



                {/* TEMPERATURE */}

                <span>

                  {
                    station.temperature === "--"
                      ? "--"
                      : `${station.temperature} °C`
                  }

                </span>



                {/* PRESSURE */}

                <span>

                  {
                    station.pressure === "--"
                      ? "--"
                      : `${station.pressure} hPa`
                  }

                </span>



                {/* HUMIDITY */}

                <span>

                  {
                    station.humidity === "--"
                      ? "--"
                      : `${station.humidity} %`
                  }

                </span>



                {/* HEALTH */}

                <span className="health-value">

                  {station.health}%

                </span>



                {/* STATUS */}

                <span
                  className={`table-status ${station.status.toLowerCase()}`}
                >

                  <i></i>

                  {station.status}

                </span>

              </button>

            )
          )}



          {/* NO RESULTS */}

          {filteredStations.length === 0 && (

            <div className="no-stations">

              No stations found.

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Stations;