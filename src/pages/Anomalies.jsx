import { useState } from "react";

import {
  AlertTriangle,
  Activity,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Gauge,
  ChevronRight,
  ShieldAlert,
  CircleDot,
  Cpu,
  MapPin,
} from "lucide-react";

/* =========================================================
   ANOMALY DATA
   Based on SkyGuard AI fusion output
========================================================= */

const anomalies = [
  {
    id: 1,

    type: "SENSOR FAULT",

    station: "Ambala",

    date: "2024-08-15",

    time: "10:39:21",

    parameter: "Air Pressure",

    observed: "940.2 hPa",

    expected: "1012.4 hPa",

    corrected: "1012.4 hPa",

    deviation: "+72.2 hPa",

    confidence: 91,

    severity: "HIGH",

    affectedFeature: "air_pressure",

    description:
      "The observed pressure reading is significantly outside the expected atmospheric pattern and indicates a possible sensor fault.",

    cause:
      "Possible air-pressure sensor malfunction or calibration fault.",

    reasons: [
      "Physics: pressure jumped 68 hPa in 1 day (limit 15 hPa)",
      "LSTM: value deviates strongly from station's last 7-day pattern",
      "Spatial: 3 nearby stations show normal pressure — this looks isolated, not regional",
    ],

    layerBreakdown: {
      physicsFlag: "VIOLATION",
      lstmAnomalyScore: 0.87,
      spatialConsistencyScore: 0.12,
      isolationForestScore: 0.79,
    },

    modelVersion: "skyguard_v1_fusion",

    recommendation:
      "Inspect pressure sensor and verify calibration. Use corrected value for downstream analysis until the sensor is validated.",
  },

  {
    id: 2,

    type: "SENSOR DRIFT",

    station: "Chandigarh / Surajpur",

    date: "2024-08-15",

    time: "10:31:08",

    parameter: "Temperature",

    observed: "31.7 °C",

    expected: "28.9 °C",

    corrected: "28.9 °C",

    deviation: "+2.8 °C",

    confidence: 89.2,

    severity: "MEDIUM",

    affectedFeature: "avg_temp",

    description:
      "The sensor shows a gradual deviation from the learned atmospheric pattern.",

    cause:
      "Potential temperature sensor calibration drift.",

    reasons: [
      "Persistent deviation over multiple observations",
      "No corresponding pressure change",
      "Deviation is increasing gradually",
    ],

    layerBreakdown: {
      physicsFlag: "NORMAL",
      lstmAnomalyScore: 0.74,
      spatialConsistencyScore: 0.31,
      isolationForestScore: 0.68,
    },

    modelVersion: "skyguard_v1_fusion",

    recommendation:
      "Schedule sensor calibration during the next maintenance cycle.",
  },

  {
    id: 3,

    type: "HUMIDITY INCONSISTENCY",

    station: "Palakkad",

    date: "2024-08-15",

    time: "10:18:42",

    parameter: "Relative Humidity",

    observed: "96.4 %",

    expected: "71.8 %",

    corrected: "71.8 %",

    deviation: "+24.6 %",

    confidence: 84.7,

    severity: "MEDIUM",

    affectedFeature: "relative_humidity",

    description:
      "Humidity reading does not agree with the current temperature and pressure conditions.",

    cause:
      "Humidity sensor inconsistency.",

    reasons: [
      "Large deviation from recent humidity pattern",
      "Temperature remains relatively stable",
      "Nearby stations report normal humidity",
    ],

    layerBreakdown: {
      physicsFlag: "VIOLATION",
      lstmAnomalyScore: 0.71,
      spatialConsistencyScore: 0.26,
      isolationForestScore: 0.63,
    },

    modelVersion: "skyguard_v1_fusion",

    recommendation:
      "Check humidity sensor and inspect the station enclosure.",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function Anomalies() {
  const [selectedId, setSelectedId] = useState(1);

  const selectedAnomaly =
    anomalies.find(
      (anomaly) => anomaly.id === selectedId
    ) || anomalies[0];

  /* =========================================================
     PARAMETER ICON
  ========================================================= */

  const getParameterIcon = (parameter) => {
    if (
      parameter === "Temperature"
    ) {
      return <Activity size={20} />;
    }

    if (
      parameter === "Relative Humidity"
    ) {
      return <Activity size={20} />;
    }

    if (
      parameter === "Air Pressure"
    ) {
      return <Gauge size={20} />;
    }

    return <Gauge size={20} />;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="page-content">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="anomaly-header">

        <div>

          <span className="eyebrow">
            SKYGUARD AI ENGINE
          </span>

          <h1>
            Anomaly Detection
          </h1>

          <p>
            Intelligent identification of abnormal
            AWS observations
          </p>

        </div>

        <div className="ai-engine-status">

          <span className="status-dot"></span>

          AI ENGINE ACTIVE

        </div>

      </div>


      {/* =====================================================
          MAIN ANOMALY STRUCTURE

          LEFT  = ANOMALY STATUS
          RIGHT = AI ANALYSIS / SHAP
      ===================================================== */}

      <div className="anomaly-main-grid">


        {/* ===================================================
            LEFT — ANOMALY STATUS
        =================================================== */}

        <div className="active-anomaly-card">

          {/* HEADER */}

          <div className="anomaly-card-header">

            <div>

              <span className="card-eyebrow">
                ANOMALY STATUS
              </span>

              <h2>
                {selectedAnomaly.type}
              </h2>

            </div>

            <div className="severity-badge">

              <ShieldAlert size={13} />

              {selectedAnomaly.severity}

            </div>

          </div>


          {/* =================================================
              STATION
          ================================================= */}

          <div className="anomaly-station">

            <div className="anomaly-icon">

              <MapPin size={20} />

            </div>

            <div>

              <span className="anomaly-field-label">
                STATION
              </span>

              <strong>
                {selectedAnomaly.station}
              </strong>

              <span>
                {selectedAnomaly.date}
              </span>

            </div>

          </div>


          {/* =================================================
              STATUS DETAILS
          ================================================= */}

          <div className="anomaly-status-details">

            {/* LABEL */}

            <div className="status-detail-row">

              <div className="status-detail-icon">
                <AlertTriangle size={15} />
              </div>

              <div>

                <span>
                  LABEL
                </span>

                <strong>
                  {selectedAnomaly.type}
                </strong>

              </div>

            </div>


            {/* SENSOR AFFECTED */}

            <div className="status-detail-row">

              <div className="status-detail-icon">
                <Gauge size={15} />
              </div>

              <div>

                <span>
                  SENSOR AFFECTED
                </span>

                <strong>
                  {selectedAnomaly.parameter}
                </strong>

              </div>

            </div>


            {/* SEVERITY */}

            <div className="status-detail-row">

              <div className="status-detail-icon">
                <ShieldAlert size={15} />
              </div>

              <div>

                <span>
                  SEVERITY
                </span>

                <strong className="severity-text">
                  {selectedAnomaly.severity}
                </strong>

              </div>

            </div>


            {/* AI CONFIDENCE */}

            <div className="status-detail-row">

              <div className="status-detail-icon">
                <BrainCircuit size={15} />
              </div>

              <div>

                <span>
                  AI CONFIDENCE
                </span>

                <strong className="confidence-text">
                  {selectedAnomaly.confidence}%
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              OBSERVATION DETAILS
          ================================================= */}

          <div className="anomaly-values">

            <div>

              <span>
                OBSERVED VALUE
              </span>

              <strong className="observed-value">
                {selectedAnomaly.observed}
              </strong>

            </div>


            <div>

              <span>
                CORRECTED VALUE
              </span>

              <strong>
                {selectedAnomaly.corrected}
              </strong>

            </div>


            <div>

              <span>
                DEVIATION
              </span>

              <strong className="deviation-value">
                {selectedAnomaly.deviation}
              </strong>

            </div>

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="anomaly-description">

            <span>
              ANOMALY DESCRIPTION
            </span>

            <p>
              {selectedAnomaly.description}
            </p>

          </div>


          {/* =================================================
              DETECTION TIME
          ================================================= */}

          <div className="anomaly-time">

            <Clock3 size={14} />

            Detected at{" "}
            {selectedAnomaly.time}

          </div>

        </div>


        {/* ===================================================
            RIGHT — AI ANALYSIS
        =================================================== */}

        <div className="ai-analysis-card">

          {/* HEADER */}

          <div className="anomaly-card-header">

            <div>

              <span className="card-eyebrow">
                AI ANALYSIS
              </span>

              <h2>
                Explainable AI
              </h2>

            </div>

            <BrainCircuit
              size={21}
              className="ai-analysis-icon"
            />

          </div>


          {/* =================================================
              CONFIDENCE
          ================================================= */}

          <div className="confidence-section">

            <div className="confidence-header">

              <span>
                DETECTION CONFIDENCE
              </span>

              <strong>
                {selectedAnomaly.confidence}%
              </strong>

            </div>

            <div className="confidence-bar">

              <div
                style={{
                  width: `${selectedAnomaly.confidence}%`,
                }}
              ></div>

            </div>

          </div>


          {/* =================================================
              SHAP / MODEL BREAKDOWN
          ================================================= */}

          <div className="shap-section">

            <div className="analysis-section-title">

              <div>

                <span className="analysis-label">
                  SHAP / MODEL BREAKDOWN
                </span>

                <small>
                  Fusion model contribution
                </small>

              </div>

              <Cpu size={17} />

            </div>


            {/* PHYSICS */}

            <div className="shap-row">

              <div className="shap-row-info">

                <span>
                  Physics Check
                </span>

                <strong>
                  {selectedAnomaly.layerBreakdown.physicsFlag}
                </strong>

              </div>

              <div className="shap-track">

                <div
                  className={
                    selectedAnomaly.layerBreakdown.physicsFlag ===
                    "VIOLATION"
                      ? "shap-fill high"
                      : "shap-fill"
                  }
                  style={{
                    width:
                      selectedAnomaly.layerBreakdown.physicsFlag ===
                      "VIOLATION"
                        ? "92%"
                        : "25%",
                  }}
                ></div>

              </div>

            </div>


            {/* LSTM */}

            <div className="shap-row">

              <div className="shap-row-info">

                <span>
                  LSTM Pattern
                </span>

                <strong>
                  {(
                    selectedAnomaly.layerBreakdown
                      .lstmAnomalyScore * 100
                  ).toFixed(0)}
                  %
                </strong>

              </div>

              <div className="shap-track">

                <div
                  className="shap-fill"
                  style={{
                    width: `${
                      selectedAnomaly.layerBreakdown
                        .lstmAnomalyScore * 100
                    }%`,
                  }}
                ></div>

              </div>

            </div>


            {/* SPATIAL */}

            <div className="shap-row">

              <div className="shap-row-info">

                <span>
                  Spatial Consistency
                </span>

                <strong>
                  {(
                    selectedAnomaly.layerBreakdown
                      .spatialConsistencyScore * 100
                  ).toFixed(0)}
                  %
                </strong>

              </div>

              <div className="shap-track">

                <div
                  className="shap-fill"
                  style={{
                    width: `${
                      selectedAnomaly.layerBreakdown
                        .spatialConsistencyScore * 100
                    }%`,
                  }}
                ></div>

              </div>

            </div>


            {/* ISOLATION FOREST */}

            <div className="shap-row">

              <div className="shap-row-info">

                <span>
                  Isolation Forest
                </span>

                <strong>
                  {(
                    selectedAnomaly.layerBreakdown
                      .isolationForestScore * 100
                  ).toFixed(0)}
                  %
                </strong>

              </div>

              <div className="shap-track">

                <div
                  className="shap-fill"
                  style={{
                    width: `${
                      selectedAnomaly.layerBreakdown
                        .isolationForestScore * 100
                    }%`,
                  }}
                ></div>

              </div>

            </div>

          </div>


          {/* =================================================
              WHY FLAGGED
          ================================================= */}

          <div className="reasoning-section">

            <span className="analysis-label">
              WHY WAS THIS FLAGGED?
            </span>

            {selectedAnomaly.reasons.map(
              (reason, index) => (

                <div
                  className="reason-item"
                  key={index}
                >

                  <CheckCircle2 size={14} />

                  <span>
                    {reason}
                  </span>

                </div>

              )
            )}

          </div>


          {/* =================================================
              ROOT CAUSE
          ================================================= */}

          <div className="root-cause">

            <span className="analysis-label">
              PROBABLE ROOT CAUSE
            </span>

            <div className="root-cause-box">

              <AlertTriangle size={15} />

              <span>
                {selectedAnomaly.cause}
              </span>

            </div>

          </div>


          {/* =================================================
              RECOMMENDED ACTION
          ================================================= */}

          <div className="recommendation">

            <span className="analysis-label">
              RECOMMENDED ACTION
            </span>

            <p>
              {selectedAnomaly.recommendation}
            </p>

          </div>


          {/* =================================================
              MODEL VERSION
          ================================================= */}

          <div className="model-version">

            <span>
              MODEL
            </span>

            <strong>
              AWS MD v 3.3
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          MONITORING LOG
          Existing functionality preserved
      ===================================================== */}

      <div className="anomaly-timeline-card">

        <div className="timeline-header">

          <div>

            <span className="card-eyebrow">
              MONITORING LOG
            </span>

            <h2>
              Recent Anomalies
            </h2>

          </div>

          <Activity size={18} />

        </div>


        <div className="timeline">

          {anomalies.map(
            (anomaly) => (

              <button
                type="button"
                key={anomaly.id}
                className={`timeline-item ${
                  selectedId === anomaly.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedId(anomaly.id)
                }
              >

                <div className="timeline-marker">

                  <AlertTriangle size={14} />

                </div>


                <div className="timeline-info">

                  <strong>
                    {anomaly.type}
                  </strong>

                  <span>
                    {anomaly.station} ·{" "}
                    {anomaly.time}
                  </span>

                </div>


                <div className="timeline-confidence">

                  <strong>
                    {anomaly.confidence}%
                  </strong>

                  <span>
                    CONFIDENCE
                  </span>

                </div>


                <ChevronRight size={16} />

              </button>

            )
          )}

        </div>

      </div>

    </div>
  );
}

export default Anomalies;