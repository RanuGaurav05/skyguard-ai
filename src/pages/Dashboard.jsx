import SensorCard from "../components/SensorCard";
import WeatherChart from "../components/WeatherChart";
import SensorHealth from "../components/SensorHealth";
import AnomalyPanel from "../components/AnomalyPanel";
import RecentAlerts from "../components/RecentAlerts";
import AIStatus from "../components/AIStatus";
import WeatherDataGrid from "../components/WeatherDataGrid";

function Dashboard() {
  return (
    <section className="dashboard-content">
      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">AUTOMATIC WEATHER STATION</span>
          <h1>Weather Observation Network</h1>
          <p>Real-time atmospheric monitoring powered by SkyGuard AI</p>
        </div>

        <div className="station-selector">
          <div className="station-selector-status">
            <span className="status-dot"></span>
          </div>

          <div className="station-selector-info">
            <strong>AWS-042</strong>
            <small>CENTRAL STATION · ONLINE</small>
          </div>

          <span className="selector-arrow">⌄</span>
        </div>
      </div>

      {/* SENSOR CARDS */}
      <div className="sensor-grid">
        <SensorCard
          title="Temperature"
          value="27.4"
          unit="°C"
          change="+0.8°C"
          status="NORMAL"
          icon="temperature"
        />

        <SensorCard
          title="Atmospheric Pressure"
          value="1012.6"
          unit="hPa"
          change="+0.2 hPa"
          status="STABLE"
          icon="pressure"
        />

        <SensorCard
          title="Relative Humidity"
          value="68.2"
          unit="%"
          change="-2.1%"
          status="NORMAL"
          icon="humidity"
        />
      </div>

      {/* ALL AWS WEATHER PARAMETERS */}
      <WeatherDataGrid />

      <AIStatus />
      {/* MAIN ANALYSIS */}
      <div className="dashboard-grid">
        <div className="chart-card large-card">
          <WeatherChart />
        </div>

        <div className="health-wrapper">
          <SensorHealth />
        </div>
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
