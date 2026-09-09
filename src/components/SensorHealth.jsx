import { useState } from "react";

import {
  HeartPulse,
  Activity,
  Thermometer,
  Gauge,
  Droplets,
  BrainCircuit,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";

const sensors = [
  {
    id: "AWS-042",
    station: "Central Station",
    parameter: "Temperature",
    health: 97,
    degradation: "LOW",
    maintenance: "18 DAYS",
    status: "HEALTHY",
    drift: "0.4%",
    noise: "LOW",
    missing: "0.1%",
    calibration: "GOOD",
    assessment: "Stable sensor behavior with minimal drift.",
  },
  {
    id: "AWS-018",
    station: "North Station",
    parameter: "Temperature",
    health: 94,
    degradation: "LOW",
    maintenance: "24 DAYS",
    status: "HEALTHY",
    drift: "0.8%",
    noise: "LOW",
    missing: "0.2%",
    calibration: "GOOD",
    assessment: "Sensor operating within expected performance range.",
  },
  {
    id: "AWS-011",
    station: "East Station",
    parameter: "Humidity",
    health: 76,
    degradation: "MEDIUM",
    maintenance: "7 DAYS",
    status: "WARNING",
    drift: "3.7%",
    noise: "MEDIUM",
    missing: "0.8%",
    calibration: "REVIEW",
    assessment:
      "Increasing deviation suggests possible humidity sensor degradation.",
  },
  {
    id: "AWS-027",
    station: "South Station",
    parameter: "Pressure",
    health: 91,
    degradation: "LOW",
    maintenance: "31 DAYS",
    status: "HEALTHY",
    drift: "1.1%",
    noise: "LOW",
    missing: "0.1%",
    calibration: "GOOD",
    assessment: "Stable pressure measurements with consistent behavior.",
  },
  {
    id: "AWS-033",
    station: "West Station",
    parameter: "Temperature",
    health: 89,
    degradation: "LOW",
    maintenance: "27 DAYS",
    status: "HEALTHY",
    drift: "1.4%",
    noise: "LOW",
    missing: "0.3%",
    calibration: "GOOD",
    assessment: "Minor drift detected but no immediate intervention required.",
  },
  {
    id: "AWS-006",
    station: "Airport Station",
    parameter: "Temperature",
    health: 42,
    degradation: "HIGH",
    maintenance: "IMMEDIATE",
    status: "CRITICAL",
    drift: "8.9%",
    noise: "HIGH",
    missing: "100%",
    calibration: "UNKNOWN",
    assessment:
      "Sensor has stopped transmitting and requires immediate inspection.",
  },
];

function SensorHealth() {
  const [selectedId, setSelectedId] = useState("AWS-042");

  const selectedSensor =
    sensors.find((sensor) => sensor.id === selectedId) || sensors[0];

  const getParameterIcon = (parameter) => {
    if (parameter === "Temperature") {
      return <Thermometer size={17} />;
    }

    if (parameter === "Humidity") {
      return <Droplets size={17} />;
    }

    return <Gauge size={17} />;
  };

  return (
    <div className="page-content">
      {/* HEADER */}
      <div className="health-header">
        <div>
          <span className="eyebrow">SENSOR INTELLIGENCE</span>

          <h1>Sensor Health</h1>

          <p>AI-powered reliability and degradation monitoring</p>
        </div>

        <div className="health-engine-status">
          <span className="status-dot"></span>
          HEALTH ENGINE ACTIVE
        </div>
      </div>

      {/* SUMMARY */}
      <div className="health-summary">
        <div className="health-summary-card">
          <span>MONITORED SENSORS</span>
          <strong>24</strong>
          <small>Across AWS network</small>
        </div>

        <div className="health-summary-card">
          <span>HEALTHY</span>
          <strong>21</strong>
          <small>Normal operation</small>
        </div>

        <div className="health-summary-card">
          <span>AT RISK</span>
          <strong>02</strong>
          <small>Requires observation</small>
        </div>

        <div className="health-summary-card">
          <span>NEXT MAINTENANCE</span>
          <strong>18 DAYS</strong>
          <small>Predicted by AI</small>
        </div>
      </div>

      {/* MAIN */}
      <div className="health-main-grid">
        {/* SENSOR LIST */}
        <div className="health-overview-card">
          <div className="health-card-header">
            <div>
              <span className="card-eyebrow">NETWORK HEALTH</span>

              <h2>Sensor Health Overview</h2>
            </div>

            <HeartPulse size={19} />
          </div>

          {/* PARAMETER HEALTH */}

          <div className="parameter-health">
            <div className="parameter-health-row">
              <div className="parameter-label">
                <Thermometer size={14} />
                <span>Temperature</span>
              </div>

              <div className="health-progress">
                <div style={{ width: "97%" }}></div>
              </div>

              <strong>97%</strong>
            </div>

            <div className="parameter-health-row">
              <div className="parameter-label">
                <Gauge size={14} />
                <span>Pressure</span>
              </div>

              <div className="health-progress">
                <div style={{ width: "94%" }}></div>
              </div>

              <strong>94%</strong>
            </div>

            <div className="parameter-health-row">
              <div className="parameter-label">
                <Droplets size={14} />
                <span>Humidity</span>
              </div>

              <div className="health-progress">
                <div style={{ width: "91%" }}></div>
              </div>

              <strong>91%</strong>
            </div>
          </div>

          {/* SENSOR LIST */}

          <div className="sensor-list">
            <div className="sensor-list-title">STATION SENSORS</div>

            {sensors.map((sensor) => (
              <button
                key={sensor.id}
                className={`sensor-health-item ${
                  selectedId === sensor.id ? "selected" : ""
                }`}
                onClick={() => setSelectedId(sensor.id)}
              >
                <div className="sensor-item-icon">
                  {getParameterIcon(sensor.parameter)}
                </div>

                <div className="sensor-item-info">
                  <strong>{sensor.id}</strong>

                  <span>
                    {sensor.station} · {sensor.parameter}
                  </span>
                </div>

                <div className="sensor-item-health">
                  <strong>{sensor.health}%</strong>

                  <span
                    className={`sensor-status ${sensor.status.toLowerCase()}`}
                  >
                    <i></i>
                    {sensor.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SELECTED SENSOR */}
        <div className="selected-health-card">
          <div className="health-card-header">
            <div>
              <span className="card-eyebrow">SELECTED SENSOR</span>

              <h2>{selectedSensor.id}</h2>

              <p>
                {selectedSensor.station} · {selectedSensor.parameter}
              </p>
            </div>

            {getParameterIcon(selectedSensor.parameter)}
          </div>

          {/* HEALTH SCORE */}

          <div className="health-score-section">
            <div className="health-score">
              <strong>{selectedSensor.health}</strong>

              <span>%</span>
            </div>

            <div>
              <span>OVERALL SENSOR HEALTH</span>

              <strong>{selectedSensor.status}</strong>
            </div>
          </div>

          {/* PREDICTION */}

          <div className="degradation-box">
            <div className="degradation-icon">
              <TrendingDown size={17} />
            </div>

            <div>
              <span>PREDICTED DEGRADATION</span>

              <strong>{selectedSensor.degradation}</strong>
            </div>

            <div className="maintenance-estimate">
              <span>MAINTENANCE</span>

              <strong>{selectedSensor.maintenance}</strong>
            </div>
          </div>

          {/* AI ASSESSMENT */}

          <div className="health-ai-assessment">
            <div className="assessment-header">
              <BrainCircuit size={16} />

              <span>AI ASSESSMENT</span>
            </div>

            <p>{selectedSensor.assessment}</p>
          </div>

          {/* HEALTH METRICS */}

          <div className="health-metrics">
            <div>
              <span>DRIFT</span>

              <strong>{selectedSensor.drift}</strong>
            </div>

            <div>
              <span>NOISE LEVEL</span>

              <strong>{selectedSensor.noise}</strong>
            </div>

            <div>
              <span>MISSING DATA</span>

              <strong>{selectedSensor.missing}</strong>
            </div>

            <div>
              <span>CALIBRATION</span>

              <strong>{selectedSensor.calibration}</strong>
            </div>
          </div>

          {/* MAINTENANCE */}

          <div className="maintenance-box">
            <CalendarClock size={16} />

            <div>
              <span>NEXT RECOMMENDED MAINTENANCE</span>

              <strong>{selectedSensor.maintenance}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* RELIABILITY */}
      <div className="reliability-card">
        <div className="health-card-header">
          <div>
            <span className="card-eyebrow">SENSOR RELIABILITY</span>

            <h2>Health Trend Analysis</h2>
          </div>

          <Activity size={18} />
        </div>

        <div className="health-chart">
          <div className="chart-y-labels">
            <span>100</span>
            <span>95</span>
            <span>90</span>
            <span>85</span>
            <span>80</span>
          </div>

          <div className="health-chart-area">
            <div className="chart-grid-line"></div>
            <div className="chart-grid-line"></div>
            <div className="chart-grid-line"></div>
            <div className="chart-grid-line"></div>
            <div className="chart-grid-line"></div>

            <svg
              className="health-line-chart"
              viewBox="0 0 800 190"
              preserveAspectRatio="none"
            >
              <polyline
                points="0,30 100,34 200,37 300,45 400,52 500,55 600,65 700,61 800,68"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>

            <div className="chart-current-value">97%</div>
          </div>
        </div>

        {/* HEALTH SIGNALS */}

        <div className="health-signals">
          <div className="health-signal">
            <CheckCircle2 size={15} />

            <div>
              <span>DRIFT</span>
              <strong>LOW</strong>
            </div>
          </div>

          <div className="health-signal">
            <CheckCircle2 size={15} />

            <div>
              <span>NOISE</span>
              <strong>LOW</strong>
            </div>
          </div>

          <div className="health-signal">
            <AlertTriangle size={15} />

            <div>
              <span>CALIBRATION</span>
              <strong>MONITOR</strong>
            </div>
          </div>

          <div className="health-signal">
            <CheckCircle2 size={15} />

            <div>
              <span>DATA QUALITY</span>
              <strong>98.7%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensorHealth;
