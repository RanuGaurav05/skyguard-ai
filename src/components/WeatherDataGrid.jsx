import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Mountain,
  MapPin,
} from "lucide-react";

import weatherData from "../data/weatherData";

function WeatherDataGrid() {
  return (
    <div className="weather-data-card">
      {/* HEADER */}
      <div className="weather-data-header">
        <div>
          <span className="card-eyebrow">AWS SENSOR DATA</span>

          <h2>Weather Observation Data</h2>

          <p>Current atmospheric parameters from {weatherData.station_id}</p>
        </div>

        <div className="weather-data-live">
          <span className="status-dot"></span>
          LIVE
        </div>
      </div>

      {/* DATA GRID */}
      <div className="weather-data-grid">
        {/* AVG TEMPERATURE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Thermometer size={17} />
          </div>

          <div>
            <span>AVG TEMPERATURE</span>
            <strong>{weatherData.avg_temp} °C</strong>
          </div>
        </div>

        {/* MIN TEMPERATURE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Thermometer size={17} />
          </div>

          <div>
            <span>MIN TEMPERATURE</span>
            <strong>{weatherData.min_temp} °C</strong>
          </div>
        </div>

        {/* MAX TEMPERATURE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Thermometer size={17} />
          </div>

          <div>
            <span>MAX TEMPERATURE</span>
            <strong>{weatherData.max_temp} °C</strong>
          </div>
        </div>

        {/* HUMIDITY */}
        {/* <div className="weather-data-item">
          <div className="weather-data-icon">
            <Droplets size={17} />
          </div>

          <div>
            <span>RELATIVE HUMIDITY</span>
            <strong>
              {weatherData.relative_humidity} %
            </strong>
          </div>
        </div> */}

        {/* WIND SPEED */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Wind size={17} />
          </div>

          <div>
            <span>WIND SPEED</span>
            <strong>{weatherData.wind_speed} m/s</strong>
          </div>
        </div>

        {/* PRESSURE */}
        {/* <div className="weather-data-item">
          <div className="weather-data-icon">
            <Gauge size={17} />
          </div>

          <div>
            <span>AIR PRESSURE</span>
            <strong>
              {weatherData.air_pressure} hPa
            </strong>
          </div>
        </div> */}

        {/* RAINFALL */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <CloudRain size={17} />
          </div>

          <div>
            <span>RAINFALL</span>
            <strong>{weatherData.rainfall} mm</strong>
          </div>
        </div>

        {/* ELEVATION */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <Mountain size={17} />
          </div>

          <div>
            <span>ELEVATION</span>
            <strong>{weatherData.elevation} m</strong>
          </div>
        </div>

        {/* LATITUDE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <MapPin size={17} />
          </div>

          <div>
            <span>LATITUDE</span>
            <strong>{weatherData.latitude}</strong>
          </div>
        </div>

        {/* LONGITUDE */}
        <div className="weather-data-item">
          <div className="weather-data-icon">
            <MapPin size={17} />
          </div>

          <div>
            <span>LONGITUDE</span>
            <strong>{weatherData.longitude}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherDataGrid;
