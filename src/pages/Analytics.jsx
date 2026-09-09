import { useState } from "react";

import {
  BarChart3,
  Activity,
  Thermometer,
  Gauge,
  Droplets,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const readings = {
  temperature: [
    26.1, 26.4, 26.8, 27.1, 27.4, 27.8, 28.1, 28.4, 28.2, 29.1, 28.7, 28.5,
  ],
  pressure: [
    1013.4, 1013.1, 1012.9, 1012.7, 1012.6, 1012.4, 1012.2, 1011.9, 1011.8,
    1010.9, 1011.2, 1011.4,
  ],
  humidity: [
    72.4, 71.9, 71.5, 70.8, 68.2, 67.9, 67.4, 67.1, 68.2, 72.1, 70.8, 69.7,
  ],
};

const labels = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const anomalyPoints = {
  temperature: [9],
  pressure: [9],
  humidity: [9],
};

function Analytics() {
  const [parameter, setParameter] = useState("temperature");
  const [range, setRange] = useState("24H");

  const data = readings[parameter];

  const parameterLabel = {
    temperature: "Temperature",
    pressure: "Atmospheric Pressure",
    humidity: "Relative Humidity",
  };

  const parameterUnit = {
    temperature: "°C",
    pressure: "hPa",
    humidity: "%",
  };

  const getIcon = () => {
    if (parameter === "temperature") {
      return <Thermometer size={16} />;
    }

    if (parameter === "pressure") {
      return <Gauge size={16} />;
    }

    return <Droplets size={16} />;
  };

  const min = Math.min(...data);
  const max = Math.max(...data);

  const chartPoints = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 90 - ((value - min) / (max - min || 1)) * 75;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="page-content">
      {/* HEADER */}
      <div className="analytics-header">
        <div>
          <span className="eyebrow">DATA INTELLIGENCE</span>

          <h1>Analytics</h1>

          <p>Historical patterns, anomaly trends and multivariate analysis</p>
        </div>

        <div className="analytics-engine-status">
          <span className="status-dot"></span>
          ANALYTICS ENGINE ACTIVE
        </div>
      </div>

      {/* TOP STATS */}
      <div className="analytics-summary">
        <div className="analytics-summary-card">
          <span>OBSERVATIONS ANALYZED</span>
          <strong>18.4K</strong>
          <small>Last 24 hours</small>
        </div>

        <div className="analytics-summary-card">
          <span>ANOMALIES DETECTED</span>
          <strong>17</strong>
          <small>Across all stations</small>
        </div>

        <div className="analytics-summary-card">
          <span>DETECTION ACCURACY</span>
          <strong>96.8%</strong>
          <small>Validation performance</small>
        </div>

        <div className="analytics-summary-card">
          <span>FALSE ALARM RATE</span>
          <strong>2.1%</strong>
          <small>Current model performance</small>
        </div>
      </div>

      {/* MAIN CHART */}
      <div className="analytics-chart-card">
        <div className="analytics-chart-header">
          <div>
            <span className="card-eyebrow">TEMPORAL ANALYSIS</span>

            <h2>Atmospheric Pattern</h2>
          </div>

          <div className="analytics-controls">
            <div className="parameter-selector">
              <button
                className={parameter === "temperature" ? "active" : ""}
                onClick={() => setParameter("temperature")}
              >
                <Thermometer size={13} />
                TEMP
              </button>

              <button
                className={parameter === "pressure" ? "active" : ""}
                onClick={() => setParameter("pressure")}
              >
                <Gauge size={13} />
                PRESSURE
              </button>

              <button
                className={parameter === "humidity" ? "active" : ""}
                onClick={() => setParameter("humidity")}
              >
                <Droplets size={13} />
                HUMIDITY
              </button>
            </div>

            <div className="range-selector">
              {["6H", "12H", "24H", "7D"].map((item) => (
                <button
                  key={item}
                  className={range === item ? "active" : ""}
                  onClick={() => setRange(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CURRENT VALUE */}
        <div className="analytics-current">
          <div className="analytics-current-icon">{getIcon()}</div>

          <div>
            <span>{parameterLabel[parameter]}</span>

            <strong>
              {data[data.length - 1]} {parameterUnit[parameter]}
            </strong>
          </div>

          <div className="analytics-trend">
            <TrendingUp size={13} />
            NORMAL TREND
          </div>
        </div>

        {/* CHART */}
        <div className="analytics-chart">
          <div className="chart-axis">
            <span>{max.toFixed(1)}</span>
            <span>{((max + min) / 2).toFixed(1)}</span>
            <span>{min.toFixed(1)}</span>
          </div>

          <div className="analytics-chart-area">
            <div className="analytics-grid-line"></div>
            <div className="analytics-grid-line"></div>
            <div className="analytics-grid-line"></div>
            <div className="analytics-grid-line"></div>
            <div className="analytics-grid-line"></div>

            <svg
              className="analytics-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                points={chartPoints}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* ANOMALY MARKER */}

            <div
              className="analytics-anomaly-marker"
              style={{
                left: "81.8%",
                top: "19%",
              }}
            >
              <span></span>
              <label>ANOMALY</label>
            </div>

            {/* X AXIS */}

            <div className="analytics-x-axis">
              {labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="analytics-lower-grid">
        {/* MULTIVARIATE */}
        <div className="correlation-card">
          <div className="analytics-card-header">
            <div>
              <span className="card-eyebrow">MULTIVARIATE ANALYSIS</span>

              <h2>Parameter Correlation</h2>
            </div>

            <BrainCircuit size={18} />
          </div>

          <div className="correlation-grid">
            <div></div>

            <span>TEMP</span>
            <span>PRESS</span>
            <span>HUM</span>

            <span className="correlation-label">TEMP</span>

            <div className="correlation strong">1.00</div>

            <div className="correlation negative">-0.62</div>

            <div className="correlation moderate">0.71</div>

            <span className="correlation-label">PRESS</span>

            <div className="correlation negative">-0.62</div>

            <div className="correlation strong">1.00</div>

            <div className="correlation weak">-0.31</div>

            <span className="correlation-label">HUM</span>

            <div className="correlation moderate">0.71</div>

            <div className="correlation weak">-0.31</div>

            <div className="correlation strong">1.00</div>
          </div>

          <div className="correlation-note">
            <Activity size={14} />

            <span>
              Strong temperature-humidity relationship detected. Unexpected
              deviations may indicate sensor inconsistency.
            </span>
          </div>
        </div>

        {/* ANOMALY DISTRIBUTION */}
        <div className="distribution-card">
          <div className="analytics-card-header">
            <div>
              <span className="card-eyebrow">ANOMALY DISTRIBUTION</span>

              <h2>Detection Breakdown</h2>
            </div>

            <BarChart3 size={18} />
          </div>

          <div className="distribution-list">
            <div className="distribution-item">
              <div className="distribution-label">
                <span>Temperature Spike</span>
                <strong>41%</strong>
              </div>

              <div className="distribution-bar">
                <div style={{ width: "41%" }}></div>
              </div>
            </div>

            <div className="distribution-item">
              <div className="distribution-label">
                <span>Sensor Drift</span>
                <strong>29%</strong>
              </div>

              <div className="distribution-bar">
                <div style={{ width: "29%" }}></div>
              </div>
            </div>

            <div className="distribution-item">
              <div className="distribution-label">
                <span>Humidity Inconsistency</span>
                <strong>18%</strong>
              </div>

              <div className="distribution-bar">
                <div style={{ width: "18%" }}></div>
              </div>
            </div>

            <div className="distribution-item">
              <div className="distribution-label">
                <span>Communication Error</span>
                <strong>12%</strong>
              </div>

              <div className="distribution-bar">
                <div style={{ width: "12%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODEL PERFORMANCE */}
      <div className="model-performance-card">
        <div className="analytics-card-header">
          <div>
            <span className="card-eyebrow">MODEL PERFORMANCE</span>

            <h2>Detection Quality</h2>
          </div>

          <BrainCircuit size={18} />
        </div>

        <div className="model-metrics">
          <div>
            <span>PRECISION</span>
            <strong>95.4%</strong>
          </div>

          <div>
            <span>RECALL</span>
            <strong>94.1%</strong>
          </div>

          <div>
            <span>F1 SCORE</span>
            <strong>94.7%</strong>
          </div>

          <div>
            <span>FALSE POSITIVE</span>
            <strong>2.1%</strong>
          </div>

          <div>
            <span>INFERENCE</span>
            <strong>18 ms</strong>
          </div>
        </div>

        <div className="model-note">
          <AlertTriangle size={14} />

          <span>
            Performance metrics are based on the current validation dataset and
            injected anomaly scenarios.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
