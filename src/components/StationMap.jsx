import { useEffect, useRef } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* =========================================================
   MARKER ICON
========================================================= */

const createMarkerIcon = (
  status,
  selected,
  stationName
) => {
  const color =
    status === "ANOMALOUS"
      ? "#f5b942"
      : "#20c8ed";

  return L.divIcon({
    className: "skyguard-marker-wrapper",

    html: `
      <div
        class="skyguard-marker ${
          selected ? "selected" : ""
        }"
        style="--marker-color: ${color};"
      >
        <span class="marker-pulse"></span>
        <span class="marker-core"></span>

        ${
          selected
            ? `<div class="marker-label">${stationName}</div>`
            : ""
        }
      </div>
    `,

    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};


/* =========================================================
   MAP CONTROLLER
========================================================= */

function MapController({
  stations,
  selectedStationName,
}) {
  const map = useMap();

  const initialFitDone = useRef(false);

  const previousSelectedStation =
    useRef(selectedStationName);


  /* =======================================================
     INITIAL MAP FIT
     
     Runs ONLY once when station data becomes available.
     It will NOT run again during live 2-sec updates.
  ======================================================= */

  useEffect(() => {
    if (initialFitDone.current) return;

    const validStations = stations.filter(
      (station) =>
        station.latitude !== null &&
        station.longitude !== null
    );

    if (!validStations.length) return;

    const bounds = L.latLngBounds(
      validStations.map((station) => [
        Number(station.latitude),
        Number(station.longitude),
      ])
    );

    map.fitBounds(bounds, {
      padding: [35, 35],
      maxZoom: 6,
      animate: false,
    });

    initialFitDone.current = true;
  }, [stations, map]);


  /* =======================================================
     MOVE MAP ONLY WHEN USER CHANGES STATION
     
     Live data updates will NOT trigger this.
  ======================================================= */

  useEffect(() => {
    if (
      previousSelectedStation.current ===
      selectedStationName
    ) {
      return;
    }

    previousSelectedStation.current =
      selectedStationName;

    const selectedStation =
      stations.find(
        (station) =>
          station.name === selectedStationName
      );

    if (!selectedStation) return;

    if (
      selectedStation.latitude === null ||
      selectedStation.longitude === null
    ) {
      return;
    }

    map.flyTo(
      [
        Number(selectedStation.latitude),
        Number(selectedStation.longitude),
      ],
      10,
      {
        duration: 0.8,
      }
    );

  }, [
    selectedStationName,
    stations,
    map,
  ]);


  return null;
}


/* =========================================================
   STATION MAP
========================================================= */

function StationMap({
  stations,
  selectedStationName,
  setSelectedStationName,
}) {

  /* =======================================================
     MARKER REFERENCES

     Used to programmatically open the newly selected
     station popup.
  ======================================================= */

  const markerRefs = useRef({});


  return (
    <div className="leaflet-map-wrapper">

      <MapContainer
        center={[22.5, 78.5]}
        zoom={5}
        minZoom={4}
        maxZoom={16}
        scrollWheelZoom={true}
        className="leaflet-map"
      >

        {/* ===================================================
            OPEN STREET MAP
        =================================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* ===================================================
            MAP CONTROLLER
        =================================================== */}

        <MapController
          stations={stations}
          selectedStationName={
            selectedStationName
          }
        />


        {/* ===================================================
            ALL 14 STATIONS
        =================================================== */}

        {stations.map((station) => {

          if (
            station.latitude === null ||
            station.longitude === null
          ) {
            return null;
          }

          const isSelected =
            station.name ===
            selectedStationName;


          return (
            <Marker
              key={station.name}

              ref={(marker) => {
                if (marker) {
                  markerRefs.current[
                    station.name
                  ] = marker;
                }
              }}

              position={[
                Number(station.latitude),
                Number(station.longitude),
              ]}

              icon={createMarkerIcon(
                station.status,
                isSelected,
                station.name
              )}

              eventHandlers={{
                click: (event) => {

                  /* =========================================
                     CLOSE PREVIOUS POPUP IMMEDIATELY
                  ========================================= */

                  const map =
                    event.target._map;

                  if (map) {
                    map.closePopup();
                  }


                  /* =========================================
                     CHANGE SELECTED STATION
                  ========================================= */

                  setSelectedStationName(
                    station.name
                  );


                  /* =========================================
                     OPEN THIS STATION'S POPUP
                     
                     Small delay allows React to update
                     the selected marker first.
                  ========================================= */

                  setTimeout(() => {

                    const selectedMarker =
                      markerRefs.current[
                        station.name
                      ];

                    if (
                      selectedMarker
                    ) {
                      selectedMarker.openPopup();
                    }

                  }, 50);
                },
              }}
            >

              {/* =================================================
                  POPUP
                  
                  IMPORTANT:
                  Only selected station gets a popup.
                  This prevents previous station popup
                  from remaining visible.
              ================================================= */}

              {isSelected && (

                <Popup
                  closeButton={true}
                  autoClose={true}
                  closeOnClick={false}
                >

                  <div className="station-popup">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="popup-header">

                      <div>

                        <span className="popup-eyebrow">
                          AWS STATION
                        </span>

                        <strong>
                          {station.name}
                        </strong>

                      </div>

                      <span
                        className={`popup-status ${
                          station.status.toLowerCase()
                        }`}
                      >
                        {station.status}
                      </span>

                    </div>


                    {/* =================================================
                        LOCATION
                    ================================================= */}

                    <div className="popup-location">

                      {station.state}
                      {" · "}
                      {station.district}

                      <br />

                      <span>
                        {station.date_of_record}
                      </span>

                    </div>


                    {/* =================================================
                        SENSOR READINGS
                    ================================================= */}

                    <div className="popup-readings">

                      {/* TEMPERATURE */}

                      <div>

                        <span>
                          Temperature
                        </span>

                        <strong>
                          {station.avg_temp ===
                          null
                            ? "--"
                            : `${Number(
                                station.avg_temp
                              ).toFixed(1)}°C`}
                        </strong>

                      </div>


                      {/* PRESSURE */}

                      <div>

                        <span>
                          Pressure
                        </span>

                        <strong>
                          {station.air_pressure ===
                          null
                            ? "--"
                            : `${Number(
                                station.air_pressure
                              ).toFixed(1)} hPa`}
                        </strong>

                      </div>


                      {/* HUMIDITY */}

                      <div>

                        <span>
                          Humidity
                        </span>

                        <strong>
                          {station.relative_humidity ===
                          null
                            ? "--"
                            : `${Number(
                                station.relative_humidity
                              ).toFixed(4)}%`}
                        </strong>

                      </div>

                    </div>


                    {/* =================================================
                        COORDINATES
                    ================================================= */}

                    <div className="popup-location">

                      <span>
                        LAT:{" "}
                        {Number(
                          station.latitude
                        ).toFixed(4)}
                      </span>

                      <br />

                      <span>
                        LNG:{" "}
                        {Number(
                          station.longitude
                        ).toFixed(4)}
                      </span>

                    </div>

                  </div>

                </Popup>

              )}

            </Marker>
          );
        })}


        {/* ===================================================
            LEGEND
        =================================================== */}

        <div className="leaflet-legend">

          <div className="legend-title">
            STATION STATUS
          </div>

          <div>
            <span className="legend-dot healthy"></span>
            Healthy
          </div>

          <div>
            <span className="legend-dot anomalous"></span>
            Anomalous
          </div>

        </div>

      </MapContainer>

    </div>
  );
}

export default StationMap;