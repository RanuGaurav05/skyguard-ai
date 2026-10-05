import {
  AlertTriangle,
  Activity,
  Gauge,
  Droplets,
  Thermometer,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   DASHBOARD ANOMALIES
========================================================= */

const anomalies = [
  {
    id: 1,
    type: "SENSOR FAULT",
    station: "Ambala",
    time: "10:39:21",
    parameter: "Air Pressure",
    severity: "HIGH",
    confidence: 91,
  },

  {
    id: 2,
    type: "SENSOR DRIFT",
    station: "Chandigarh / Surajpur",
    time: "10:31:08",
    parameter: "Temperature",
    severity: "MEDIUM",

    // USER REQUESTED
    confidence: 50,
  },

  {
    id: 3,
    type: "HUMIDITY INCONSISTENCY",
    station: "Palakkad",
    time: "10:18:42",
    parameter: "Relative Humidity",
    severity: "MEDIUM",
    confidence: 84.7,
  },
];

/* =========================================================
   ICON
========================================================= */

function getAnomalyIcon(parameter) {
  if (parameter === "Temperature") {
    return <Thermometer size={17} />;
  }

  if (parameter === "Relative Humidity") {
    return <Droplets size={17} />;
  }

  if (parameter === "Air Pressure") {
    return <Gauge size={17} />;
  }

  return <Activity size={17} />;
}

/* =========================================================
   COMPONENT
========================================================= */

function AnomalyPanel() {
  return (
    <div className="anomaly-panel">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="anomaly-panel-header">

        <div>

          <span className="card-eyebrow">
            AI ANOMALY ENGINE
          </span>

          <h2>
            Anomaly Detection
          </h2>

        </div>

        <div className="anomaly-panel-status">

          <span className="status-dot"></span>

          ACTIVE

        </div>

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="anomaly-panel-summary">

        <div className="anomaly-count">

          <strong>
            03
          </strong>

          <span>
            anomalies detected
          </span>

        </div>

      </div>


      {/* =====================================================
          THREE ANOMALY ROWS
      ===================================================== */}

      <div className="anomaly-panel-list">

        {anomalies.map((anomaly) => (

          <div
            className="anomaly-panel-item"
            key={anomaly.id}
          >

            {/* =================================================
                ICON
            ================================================= */}

            <div
              className={`anomaly-panel-icon ${anomaly.severity.toLowerCase()}`}
            >
              {getAnomalyIcon(anomaly.parameter)}
            </div>


            {/* =================================================
                ANOMALY INFORMATION
            ================================================= */}

            <div className="anomaly-panel-info">

              <strong>
                {anomaly.type}
              </strong>

              <span>
                {anomaly.station} · {anomaly.time}
              </span>

            </div>


            {/* =================================================
                SEVERITY
            ================================================= */}

            <div
              className={`anomaly-panel-severity ${anomaly.severity.toLowerCase()}`}
            >
              {anomaly.severity}
            </div>


            {/* =================================================
                INDIVIDUAL CONFIDENCE
            ================================================= */}

            <div className="anomaly-row-confidence">

              <div className="anomaly-confidence-header">

                <span>
                  Detection confidence
                </span>

                <strong>
                  {anomaly.confidence}%
                </strong>

              </div>

              <div className="anomaly-confidence-track">

                <div
                  className="anomaly-confidence-fill"
                  style={{
                    width: `${anomaly.confidence}%`,
                  }}
                ></div>

              </div>

            </div>


            {/* =================================================
                ARROW
            ================================================= */}

            <ChevronRight
              size={16}
              className="anomaly-panel-arrow"
            />

          </div>

        ))}

      </div>

    </div>
  );
}

export default AnomalyPanel;