import { useMemo, useState } from "react";
import StationMap from "../components/StationMap";

import {
  MapPin,
  Wifi,
} from "lucide-react";

import { useLiveMonitoring } from "../components/LiveMonitoringContext";

function Stations() {
  const {
    stations,
    stationIndexes,
    getCurrentRecord,
    loading,
  } = useLiveMonitoring();

  const [
    selectedStationName,
    setSelectedStationName,
  ] = useState("Ambala");

  const [searchTerm, setSearchTerm] =
    useState("");

  /* =========================================================
     FIXED DEMO ANOMALOUS STATIONS

     Exactly these 2 stations will show as ANOMALOUS.
     All remaining stations will show as HEALTHY.
  ========================================================= */

  const ANOMALOUS_STATIONS = [
    "Ambala",
    "Chandigarh / Surajpur",
    "Palakkad",
    "Coimbatore / Peelamedu"
  ];

  /* =========================================================
     BUILD LIVE DATA FOR ALL 14 STATIONS
  ========================================================= */

  const liveStations = useMemo(() => {
    return stations.map((stationName) => {
      const record =
        getCurrentRecord(stationName);

      const index =
        stationIndexes[stationName] ?? 0;

      /* =====================================================
         STATUS

         Ambala + Chandigarh / Surajpur
         = ANOMALOUS

         All other stations
         = HEALTHY
      ===================================================== */

      const isAnomalous =
        ANOMALOUS_STATIONS.includes(
          stationName
        );

      return {
        name: stationName,

        state:
          record?.state || "—",

        district:
          record?.district || "—",

        date_of_record:
          record?.date_of_record || "—",

        avg_temp:
          record?.avg_temp ?? null,

        min_temp:
          record?.min_temp ?? null,

        max_temp:
          record?.max_temp ?? null,

        relative_humidity:
          record?.relative_humidity ?? null,

        wind_speed:
          record?.wind_speed ?? null,

        air_pressure:
          record?.air_pressure ?? null,

        rainfall:
          record?.rainfall ?? null,

        elevation:
          record?.elevation ?? null,

        latitude:
          record?.latitude ?? null,

        longitude:
          record?.longitude ?? null,

        /* =================================================
           FINAL STATUS
        ================================================= */

        status: isAnomalous
          ? "ANOMALOUS"
          : "HEALTHY",

        currentIndex: index,

        /*
          Keep this for compatibility with
          existing components.
        */

        anomalyCategory:
          isAnomalous
            ? "DEMO ANOMALY"
            : "NORMAL",
      };
    });
  }, [
    stations,
    stationIndexes,
    getCurrentRecord,
  ]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredStations =
    liveStations.filter((station) =>
      `${station.name}
       ${station.state}
       ${station.district}`
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  /* =========================================================
     FORMAT
  ========================================================= */

  const format = (
    value,
    digits = 1
  ) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "—";
    }

    return Number(value).toFixed(
      digits
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="page-content">
        <div className="live-loading">
          Loading AWS station network...
        </div>
      </div>
    );
  }

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

      </div>


      {/* =====================================================
          MAP
      ===================================================== */}

      <div className="stations-main-grid">

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
              14 ACTIVE
            </div>

          </div>

          <div className="network-map">

            <StationMap
              stations={liveStations}
              selectedStationName={
                selectedStationName
              }
              setSelectedStationName={
                setSelectedStationName
              }
            />

          </div>

        </div>

      </div>


      {/* =====================================================
          LIVE TELEMETRY
      ===================================================== */}

      <div className="station-table-card">

        <div className="table-header">

          <div>

            <span className="card-eyebrow">
              LIVE TELEMETRY
            </span>

            <h2>
              Station Activity
            </h2>

          </div>

        </div>


        <div className="station-table">

          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <div className="table-row table-heading">

            <span>STATION</span>
            <span>AVG TEMP</span>
            <span>MIN TEMP</span>
            <span>MAX TEMP</span>
            <span>HUMIDITY</span>
            <span>WIND</span>
            <span>PRESSURE</span>
            <span>RAINFALL</span>
            <span>LATITUDE</span>
            <span>LONGITUDE</span>

          </div>


          {/* =================================================
              ALL 14 LIVE STATIONS
          ================================================= */}

          {filteredStations.map(
            (station) => (

              <button
                type="button"
                key={station.name}
                className={`table-row station-table-row ${
                  selectedStationName ===
                  station.name
                    ? "selected-row"
                    : ""
                }`}
                onClick={() =>
                  setSelectedStationName(
                    station.name
                  )
                }
              >

                {/* =================================================
                    STATION
                ================================================= */}

                <div className="station-name-cell">

                  <div className="station-table-icon">
                    <MapPin size={14} />
                  </div>

                  <div>

                    <strong>
                      {station.name}
                    </strong>

                    <small>
                      {station.state} ·{" "}
                      {station.district}
                    </small>

                  </div>

                </div>


                {/* =================================================
                    AVG TEMP
                ================================================= */}

                <span>
                  {format(
                    station.avg_temp
                  )}{" "}
                  °C
                </span>


                {/* =================================================
                    MIN TEMP
                ================================================= */}

                <span>
                  {format(
                    station.min_temp
                  )}{" "}
                  °C
                </span>


                {/* =================================================
                    MAX TEMP
                ================================================= */}

                <span>
                  {format(
                    station.max_temp
                  )}{" "}
                  °C
                </span>


                {/* =================================================
                    HUMIDITY
                ================================================= */}

                <span>
                  {format(
                    station.relative_humidity,
                    4
                  )}{" "}
                  %
                </span>


                {/* =================================================
                    WIND
                ================================================= */}

                <span>
                  {format(
                    station.wind_speed
                  )}{" "}
                  m/s
                </span>


                {/* =================================================
                    PRESSURE
                ================================================= */}

                <span>
                  {format(
                    station.air_pressure
                  )}{" "}
                  hPa
                </span>


                {/* =================================================
                    RAINFALL
                ================================================= */}

                <span>
                  {format(
                    station.rainfall
                  )}{" "}
                  mm
                </span>


                {/* =================================================
                    LATITUDE
                ================================================= */}

                <span>
                  {format(
                    station.latitude,
                    4
                  )}
                </span>


                {/* =================================================
                    LONGITUDE
                ================================================= */}

                <span>
                  {format(
                    station.longitude,
                    4
                  )}
                </span>

              </button>

            )
          )}


          {/* =================================================
              NO RESULTS
          ================================================= */}

          {filteredStations.length ===
            0 && (
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