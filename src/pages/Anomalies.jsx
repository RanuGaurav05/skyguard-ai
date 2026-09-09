import { useState } from "react";

import {
  AlertTriangle,
  Activity,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Thermometer,
  Droplets,
  Gauge,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

const anomalies = [
  {
    id: 1,
    type: "TEMPERATURE SPIKE",
    station: "AWS-042",
    time: "10:39:21",
    parameter: "Temperature",
    observed: "55.0 °C",
    expected: "28.1 °C",
    deviation: "+26.9 °C",
    confidence: 97.8,
    severity: "HIGH",
    cause: "Possible temperature sensor malfunction",
    description:
      "Observed temperature is significantly outside the expected temporal and spatial pattern.",
    reasons: [
      "Sudden increase compared with previous readings",
      "Neighboring stations report normal temperature",
      "Temperature-humidity relationship is inconsistent",
    ],
    recommendation: "Inspect temperature sensor and verify calibration.",
  },
  {
    id: 2,
    type: "SENSOR DRIFT",
    station: "AWS-018",
    time: "10:31:08",
    parameter: "Temperature",
    observed: "31.7 °C",
    expected: "28.9 °C",
    deviation: "+2.8 °C",
    confidence: 89.2,
    severity: "MEDIUM",
    cause: "Potential sensor calibration drift",
    description:
      "The sensor shows a gradual deviation from the learned atmospheric pattern.",
    reasons: [
      "Persistent deviation over multiple observations",
      "No corresponding pressure change",
      "Deviation is increasing gradually",
    ],
    recommendation:
      "Schedule sensor calibration during the next maintenance cycle.",
  },
  {
    id: 3,
    type: "HUMIDITY INCONSISTENCY",
    station: "AWS-011",
    time: "10:18:42",
    parameter: "Humidity",
    observed: "96.4 %",
    expected: "71.8 %",
    deviation: "+24.6 %",
    confidence: 84.7,
    severity: "MEDIUM",
    cause: "Humidity sensor inconsistency",
    description:
      "Humidity reading does not agree with the current temperature and pressure conditions.",
    reasons: [
      "Large deviation from recent humidity pattern",
      "Temperature remains relatively stable",
      "Nearby stations report normal humidity",
    ],
    recommendation: "Check humidity sensor and inspect the station enclosure.",
  },
];

function Anomalies() {
  const [selectedId, setSelectedId] = useState(1);

  const selectedAnomaly =
    anomalies.find((anomaly) => anomaly.id === selectedId) || anomalies[0];

  const getParameterIcon = (parameter) => {
    if (parameter === "Temperature") {
      return <Thermometer size={18} />;
    }

    if (parameter === "Humidity") {
      return <Droplets size={18} />;
    }

    return <Gauge size={18} />;
  };

  return (
    <div className="page-content">
      {/* HEADER */}
      <div className="anomaly-header">
        <div>
          <span className="eyebrow">SKYGUARD AI ENGINE</span>

          <h1>Anomaly Detection</h1>

          <p>Intelligent identification of abnormal AWS observations</p>
        </div>

        <div className="ai-engine-status">
          <span className="status-dot"></span>
          AI ENGINE ACTIVE
        </div>
      </div>

      {/* SUMMARY */}
      <div className="anomaly-summary">
        <div className="anomaly-summary-card">
          <span>ACTIVE ANOMALIES</span>
          <strong>02</strong>
          <small>Requires attention</small>
        </div>

        <div className="anomaly-summary-card">
          <span>HIGH SEVERITY</span>
          <strong>01</strong>
          <small>Immediate inspection</small>
        </div>

        <div className="anomaly-summary-card">
          <span>MEDIUM SEVERITY</span>
          <strong>02</strong>
          <small>Under observation</small>
        </div>

        <div className="anomaly-summary-card">
          <span>AI CONFIDENCE</span>
          <strong>91.4%</strong>
          <small>Current detection confidence</small>
        </div>
      </div>

      {/* MAIN ANALYSIS */}
      <div className="anomaly-main-grid">
        {/* ACTIVE ANOMALY */}
        <div className="active-anomaly-card">
          <div className="anomaly-card-header">
            <div>
              <span className="card-eyebrow">ACTIVE ANOMALY</span>

              <h2>{selectedAnomaly.type}</h2>
            </div>

            <div className="severity-badge">
              <ShieldAlert size={13} />
              {selectedAnomaly.severity}
            </div>
          </div>

          <div className="anomaly-station">
            <div className="anomaly-icon">
              {getParameterIcon(selectedAnomaly.parameter)}
            </div>

            <div>
              <strong>{selectedAnomaly.station}</strong>

              <span>{selectedAnomaly.parameter} anomaly detected</span>
            </div>
          </div>

          {/* VALUES */}
          <div className="anomaly-values">
            <div>
              <span>OBSERVED VALUE</span>

              <strong className="observed-value">
                {selectedAnomaly.observed}
              </strong>
            </div>

            <div>
              <span>EXPECTED VALUE</span>

              <strong>{selectedAnomaly.expected}</strong>
            </div>

            <div>
              <span>DEVIATION</span>

              <strong className="deviation-value">
                {selectedAnomaly.deviation}
              </strong>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="anomaly-description">
            <span>ANOMALY DESCRIPTION</span>

            <p>{selectedAnomaly.description}</p>
          </div>

          {/* TIMESTAMP */}
          <div className="anomaly-time">
            <Clock3 size={14} />
            Detected at {selectedAnomaly.time}
          </div>
        </div>

        {/* AI ANALYSIS */}
        <div className="ai-analysis-card">
          <div className="anomaly-card-header">
            <div>
              <span className="card-eyebrow">EXPLAINABLE AI</span>

              <h2>AI Analysis</h2>
            </div>

            <BrainCircuit size={20} className="ai-analysis-icon" />
          </div>

          {/* CONFIDENCE */}
          <div className="confidence-section">
            <div className="confidence-header">
              <span>DETECTION CONFIDENCE</span>

              <strong>{selectedAnomaly.confidence}%</strong>
            </div>

            <div className="confidence-bar">
              <div
                style={{
                  width: `${selectedAnomaly.confidence}%`,
                }}
              ></div>
            </div>
          </div>

          {/* REASONING */}
          <div className="reasoning-section">
            <span className="analysis-label">WHY WAS THIS FLAGGED?</span>

            {selectedAnomaly.reasons.map((reason, index) => (
              <div className="reason-item" key={index}>
                <CheckCircle2 size={14} />

                <span>{reason}</span>
              </div>
            ))}
          </div>

          {/* ROOT CAUSE */}
          <div className="root-cause">
            <span className="analysis-label">PROBABLE ROOT CAUSE</span>

            <div className="root-cause-box">
              <AlertTriangle size={15} />

              <span>{selectedAnomaly.cause}</span>
            </div>
          </div>

          {/* RECOMMENDATION */}
          <div className="recommendation">
            <span className="analysis-label">RECOMMENDED ACTION</span>

            <p>{selectedAnomaly.recommendation}</p>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="anomaly-timeline-card">
        <div className="timeline-header">
          <div>
            <span className="card-eyebrow">MONITORING LOG</span>

            <h2>Recent Anomalies</h2>
          </div>

          <Activity size={18} />
        </div>

        <div className="timeline">
          {anomalies.map((anomaly) => (
            <button
              key={anomaly.id}
              className={`timeline-item ${
                selectedId === anomaly.id ? "selected" : ""
              }`}
              onClick={() => setSelectedId(anomaly.id)}
            >
              <div className="timeline-marker">
                <AlertTriangle size={14} />
              </div>

              <div className="timeline-info">
                <strong>{anomaly.type}</strong>

                <span>
                  {anomaly.station} · {anomaly.time}
                </span>
              </div>

              <div className="timeline-confidence">
                <strong>{anomaly.confidence}%</strong>

                <span>CONFIDENCE</span>
              </div>

              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Anomalies;
