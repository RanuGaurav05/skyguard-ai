import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// =========================================================
// STATION COORDINATES
// Demo coordinates around Bhopal.
// Replace these with actual AWS coordinates later.
// =========================================================

const stationLocations = {
  "AWS-042": {
    lat: 23.2599,
    lng: 77.4126,
  },

  "AWS-018": {
    lat: 23.2850,
    lng: 77.3950,
  },

  "AWS-011": {
    lat: 23.2450,
    lng: 77.4450,
  },

  "AWS-027": {
    lat: 23.2250,
    lng: 77.4150,
  },

  "AWS-033": {
    lat: 23.2650,
    lng: 77.3650,
  },

  "AWS-006": {
    lat: 23.2870,
    lng: 77.4700,
  },
};


// =========================================================
// CUSTOM LEAFLET MARKER
// =========================================================

const createMarkerIcon = (status, selected) => {
  let color = "#20c8ed";

  if (status === "WARNING") {
    color = "#f5b942";
  }

  if (status === "OFFLINE") {
    color = "#718096";
  }

  return L.divIcon({
    className: "skyguard-marker-wrapper",

    html: `
      <div
        class="skyguard-marker ${selected ? "selected" : ""}"
        style="--marker-color: ${color};"
      >
        <span class="marker-pulse"></span>
        <span class="marker-core"></span>

        ${
          selected
            ? `<div class="marker-label">${status}</div>`
            : ""
        }
      </div>
    `,

    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};


// =========================================================
// MAP CONTROLLER
// Automatically moves map to selected station
// =========================================================

function MapController({ selectedStation }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedStation) return;

    const location =
      stationLocations[selectedStation.id];

    if (!location) return;

    map.flyTo(
      [location.lat, location.lng],
      11,
      {
        duration: 0.8,
      }
    );
  }, [selectedStation, map]);

  return null;
}


// =========================================================
// STATION MAP
// =========================================================

function StationMap({
  stations,
  selectedStationId,
  setSelectedStationId,
}) {
  const selectedStation =
    stations.find(
      (station) =>
        station.id === selectedStationId
    ) || stations[0];

  return (
    <div className="leaflet-map-wrapper">

      <MapContainer
        center={[23.2599, 77.4126]}
        zoom={10}
        minZoom={5}
        maxZoom={16}
        scrollWheelZoom={true}
        className="leaflet-map"
      >

        {/* =================================================
            OPEN STREET MAP
        ================================================= */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =================================================
            SELECTED STATION CONTROLLER
        ================================================= */}

        <MapController
          selectedStation={selectedStation}
        />


        {/* =================================================
            STATION MARKERS
        ================================================= */}

        {stations.map((station) => {
          const location =
            stationLocations[station.id];

          if (!location) return null;

          const isSelected =
            station.id === selectedStationId;

          return (
            <Marker
              key={station.id}
              position={[
                location.lat,
                location.lng,
              ]}
              icon={createMarkerIcon(
                station.status,
                isSelected
              )}
              eventHandlers={{
                click: () => {
                  setSelectedStationId(
                    station.id
                  );
                },
              }}
            >

              {/* =================================================
                  STATION POPUP
              ================================================= */}

              <Popup>

                <div className="station-popup">

                  {/* HEADER */}

                  <div className="popup-header">

                    <div>
                      <span className="popup-eyebrow">
                        AWS STATION
                      </span>

                      <strong>
                        {station.id}
                      </strong>
                    </div>

                    <span
                      className={`popup-status ${station.status.toLowerCase()}`}
                    >
                      {station.status}
                    </span>

                  </div>


                  {/* LOCATION */}

                  <div className="popup-location">

                    {station.name}

                    <br />

                    <span>
                      {station.location}
                    </span>

                  </div>


                  {/* HEALTH */}

                  <div className="popup-health">

                    <span>
                      SENSOR HEALTH
                    </span>

                    <strong>
                      {station.health}%
                    </strong>

                  </div>


                  {/* SENSOR READINGS */}

                  <div className="popup-readings">

                    <div>
                      <span>
                        Temperature
                      </span>

                      <strong>
                        {station.temperature === "--"
                          ? "--"
                          : `${station.temperature}°C`}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Pressure
                      </span>

                      <strong>
                        {station.pressure === "--"
                          ? "--"
                          : `${station.pressure} hPa`}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Humidity
                      </span>

                      <strong>
                        {station.humidity === "--"
                          ? "--"
                          : `${station.humidity}%`}
                      </strong>
                    </div>

                  </div>

                </div>

              </Popup>

            </Marker>
          );
        })}


        {/* =================================================
            MAP LEGEND
        ================================================= */}

        <div className="leaflet-legend">

          <div className="legend-title">
            STATION STATUS
          </div>

          <div>
            <span className="legend-dot healthy"></span>
            Healthy
          </div>

          <div>
            <span className="legend-dot warning"></span>
            Warning
          </div>

          <div>
            <span className="legend-dot offline"></span>
            Offline
          </div>

        </div>

      </MapContainer>

    </div>
  );
}

export default StationMap;