import { useState } from "react";

import {
  Settings as SettingsIcon,
  BrainCircuit,
  Bell,
  Activity,
  Wifi,
  ShieldCheck,
  Save,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

function Settings() {
  const [confidence, setConfidence] = useState(85);

  const [sensitivity, setSensitivity] = useState("BALANCED");

  const [monitoringInterval, setMonitoringInterval] = useState("5");

  const [autoCorrection, setAutoCorrection] = useState(false);

  const [criticalAlerts, setCriticalAlerts] = useState(true);

  const [warningAlerts, setWarningAlerts] = useState(true);

  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleReset = () => {
    setConfidence(85);
    setSensitivity("BALANCED");
    setMonitoringInterval("5");
    setAutoCorrection(false);
    setCriticalAlerts(true);
    setWarningAlerts(true);
    setMaintenanceAlerts(true);
  };

  return (
    <div className="page-content">
      {/* HEADER */}

      <div className="settings-header">
        <div>
          <span className="eyebrow">SYSTEM CONFIGURATION</span>

          <h1>Settings</h1>

          <p>Configure SkyGuard AI detection and monitoring behavior</p>
        </div>

        <div className="settings-status">
          <span className="status-dot"></span>
          SYSTEM CONFIGURED
        </div>
      </div>

      {/* SETTINGS GRID */}

      <div className="settings-grid">
        {/* =================================
            AI CONFIGURATION
        ================================= */}

        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="card-eyebrow">AI ENGINE</span>

              <h2>Detection Configuration</h2>
            </div>

            <BrainCircuit size={18} />
          </div>

          <div className="settings-body">
            {/* SENSITIVITY */}

            <div className="setting-row">
              <div className="setting-info">
                <strong>Detection Sensitivity</strong>

                <span>
                  Controls how aggressively the AI flags unusual observations.
                </span>
              </div>

              <div className="sensitivity-options">
                {["LOW", "BALANCED", "HIGH"].map((option) => (
                  <button
                    key={option}
                    className={sensitivity === option ? "active" : ""}
                    onClick={() => setSensitivity(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* CONFIDENCE */}

            <div className="setting-row">
              <div className="setting-info">
                <strong>Anomaly Confidence Threshold</strong>

                <span>
                  Minimum AI confidence required before generating an anomaly
                  alert.
                </span>
              </div>

              <div className="range-setting">
                <div className="range-value">{confidence}%</div>

                <input
                  type="range"
                  min="50"
                  max="99"
                  value={confidence}
                  onChange={(event) => setConfidence(event.target.value)}
                />

                <div className="range-labels">
                  <span>50%</span>
                  <span>99%</span>
                </div>
              </div>
            </div>

            {/* AUTO CORRECTION */}

            <div className="setting-row">
              <div className="setting-info">
                <strong>Automatic Value Correction</strong>

                <span>
                  Allow the system to suggest corrected values for anomalous
                  observations.
                </span>
              </div>

              <button
                className={`toggle ${autoCorrection ? "on" : ""}`}
                onClick={() => setAutoCorrection(!autoCorrection)}
              >
                <span></span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================
            MONITORING
        ================================= */}

        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="card-eyebrow">MONITORING</span>

              <h2>Data Processing</h2>
            </div>

            <Activity size={18} />
          </div>

          <div className="settings-body">
            {/* INTERVAL */}

            <div className="setting-row">
              <div className="setting-info">
                <strong>Monitoring Interval</strong>

                <span>
                  Frequency at which incoming AWS observations are evaluated.
                </span>
              </div>

              <select
                value={monitoringInterval}
                onChange={(event) => setMonitoringInterval(event.target.value)}
              >
                <option value="1">1 second</option>

                <option value="5">5 seconds</option>

                <option value="10">10 seconds</option>

                <option value="30">30 seconds</option>

                <option value="60">1 minute</option>
              </select>
            </div>

            {/* PARAMETERS */}

            <div className="setting-row">
              <div className="setting-info">
                <strong>Monitored Parameters</strong>

                <span>
                  Parameters currently processed by the anomaly detection
                  engine.
                </span>
              </div>

              <div className="parameter-tags">
                <span>TEMPERATURE</span>

                <span>PRESSURE</span>

                <span>HUMIDITY</span>
              </div>
            </div>

            {/* SPATIAL */}

            <div className="setting-row">
              <div className="setting-info">
                <strong>Spatial Consistency</strong>

                <span>Compare observations against nearby AWS stations.</span>
              </div>

              <div className="enabled-label">
                <span className="status-dot"></span>
                ENABLED
              </div>
            </div>
          </div>
        </div>

        {/* =================================
            ALERT SETTINGS
        ================================= */}

        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="card-eyebrow">NOTIFICATIONS</span>

              <h2>Alert Preferences</h2>
            </div>

            <Bell size={18} />
          </div>

          <div className="settings-body">
            {/* CRITICAL */}

            <div className="setting-row compact">
              <div className="setting-info">
                <strong>Critical Alerts</strong>

                <span>Sensor failures and severe anomalies</span>
              </div>

              <button
                className={`toggle ${criticalAlerts ? "on" : ""}`}
                onClick={() => setCriticalAlerts(!criticalAlerts)}
              >
                <span></span>
              </button>
            </div>

            {/* WARNING */}

            <div className="setting-row compact">
              <div className="setting-info">
                <strong>Warning Alerts</strong>

                <span>Potential sensor inconsistencies</span>
              </div>

              <button
                className={`toggle ${warningAlerts ? "on" : ""}`}
                onClick={() => setWarningAlerts(!warningAlerts)}
              >
                <span></span>
              </button>
            </div>

            {/* MAINTENANCE */}

            <div className="setting-row compact">
              <div className="setting-info">
                <strong>Maintenance Alerts</strong>

                <span>Predicted sensor degradation</span>
              </div>

              <button
                className={`toggle ${maintenanceAlerts ? "on" : ""}`}
                onClick={() => setMaintenanceAlerts(!maintenanceAlerts)}
              >
                <span></span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================
            SYSTEM INFORMATION
        ================================= */}

        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="card-eyebrow">SYSTEM</span>

              <h2>System Information</h2>
            </div>

            <ShieldCheck size={18} />
          </div>

          <div className="system-info-list">
            <div>
              <span>AI ENGINE</span>

              <strong>SkyGuard Anomaly Engine</strong>
            </div>

            <div>
              <span>MODEL VERSION</span>

              <strong>SG-AI v1.0.0</strong>
            </div>

            <div>
              <span>DETECTION MODE</span>

              <strong>Multivariate + Temporal</strong>
            </div>

            <div>
              <span>EDGE COMPATIBILITY</span>

              <strong>ESP32 READY</strong>
            </div>

            <div>
              <span>NETWORK STATUS</span>

              <strong className="system-online">ONLINE</strong>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}

      <div className="settings-actions">
        <button className="settings-reset" onClick={handleReset}>
          <RotateCcw size={14} />
          RESET
        </button>

        <button className="settings-save" onClick={handleSave}>
          {saved ? <ShieldCheck size={14} /> : <Save size={14} />}

          {saved ? "SAVED" : "SAVE CONFIGURATION"}
        </button>
      </div>
    </div>
  );
}

export default Settings;
