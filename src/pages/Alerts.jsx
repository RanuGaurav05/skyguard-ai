import { useState } from "react";

import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock3,
  MapPin,
  Thermometer,
  Droplets,
  WifiOff,
  ChevronRight,
  Filter,
  Activity,
  BrainCircuit,
} from "lucide-react";

const alerts = [
  {
    id: "ALT-1042",
    severity: "CRITICAL",
    type: "TEMPERATURE SPIKE",
    station: "AWS-042",
    stationName: "Central Station",
    parameter: "Temperature",
    value: "55.0 °C",
    expected: "28.1 °C",
    time: "10:39:21",
    age: "2 min ago",
    status: "ACTIVE",
    message:
      "Temperature reading is significantly above the expected atmospheric pattern.",
    action: "Inspect temperature sensor and verify station calibration.",
  },
  {
    id: "ALT-1038",
    severity: "HIGH",
    type: "SENSOR INCONSISTENCY",
    station: "AWS-011",
    stationName: "East Station",
    parameter: "Humidity",
    value: "96.4 %",
    expected: "71.8 %",
    time: "10:18:42",
    age: "23 min ago",
    status: "ACTIVE",
    message:
      "Humidity measurement is inconsistent with temperature and neighboring stations.",
    action: "Inspect humidity sensor and station enclosure.",
  },
  {
    id: "ALT-1031",
    severity: "MEDIUM",
    type: "SENSOR DRIFT",
    station: "AWS-018",
    stationName: "North Station",
    parameter: "Temperature",
    value: "31.7 °C",
    expected: "28.9 °C",
    time: "09:57:14",
    age: "44 min ago",
    status: "ACKNOWLEDGED",
    message:
      "Gradual deviation detected across multiple consecutive observations.",
    action: "Schedule sensor calibration during the next maintenance cycle.",
  },
  {
    id: "ALT-1027",
    severity: "HIGH",
    type: "COMMUNICATION FAILURE",
    station: "AWS-006",
    stationName: "Airport Station",
    parameter: "Telemetry",
    value: "NO DATA",
    expected: "LIVE",
    time: "09:41:05",
    age: "1 hr ago",
    status: "ACTIVE",
    message:
      "No telemetry has been received from the station within the expected transmission interval.",
    action:
      "Check station power, network connectivity and communication module.",
  },
];

function Alerts() {
  const [selectedId, setSelectedId] = useState("ALT-1042");

  const [filter, setFilter] = useState("ALL");

  const selectedAlert =
    alerts.find((alert) => alert.id === selectedId) || alerts[0];

  const filteredAlerts =
    filter === "ALL"
      ? alerts
      : alerts.filter((alert) => alert.status === filter);

  const getAlertIcon = (type) => {
    if (type === "TEMPERATURE SPIKE") {
      return <Thermometer size={17} />;
    }

    if (type === "SENSOR INCONSISTENCY") {
      return <Droplets size={17} />;
    }

    if (type === "COMMUNICATION FAILURE") {
      return <WifiOff size={17} />;
    }

    return <Activity size={17} />;
  };

  return (
    <div className="page-content">
      {/* HEADER */}
      <div className="alerts-header">
        <div>
          <span className="eyebrow">SYSTEM NOTIFICATIONS</span>

          <h1>Alerts</h1>

          <p>Real-time operational alerts from the SkyGuard AI engine</p>
        </div>

        <div className="alert-engine-status">
          <span className="status-dot"></span>
          ALERT ENGINE ACTIVE
        </div>
      </div>

      {/* SUMMARY */}
      <div className="alerts-summary">
        <div className="alerts-summary-card">
          <span>ACTIVE ALERTS</span>
          <strong>03</strong>
          <small>Require attention</small>
        </div>

        <div className="alerts-summary-card">
          <span>CRITICAL</span>
          <strong>01</strong>
          <small>Immediate action</small>
        </div>

        <div className="alerts-summary-card">
          <span>ACKNOWLEDGED</span>
          <strong>01</strong>
          <small>Under investigation</small>
        </div>

        <div className="alerts-summary-card">
          <span>RESOLVED TODAY</span>
          <strong>12</strong>
          <small>Successfully handled</small>
        </div>
      </div>

      {/* ALERT CONTENT */}
      <div className="alerts-main-grid">
        {/* ALERT LIST */}
        <div className="alerts-list-card">
          <div className="alerts-list-header">
            <div>
              <span className="card-eyebrow">ALERT QUEUE</span>

              <h2>Recent Alerts</h2>
            </div>

            <div className="alert-filter">
              <Filter size={13} />

              <button
                className={filter === "ALL" ? "active" : ""}
                onClick={() => setFilter("ALL")}
              >
                ALL
              </button>

              <button
                className={filter === "ACTIVE" ? "active" : ""}
                onClick={() => setFilter("ACTIVE")}
              >
                ACTIVE
              </button>

              <button
                className={filter === "ACKNOWLEDGED" ? "active" : ""}
                onClick={() => setFilter("ACKNOWLEDGED")}
              >
                ACK
              </button>
            </div>
          </div>

          <div className="alert-list">
            {filteredAlerts.map((alert) => (
              <button
                key={alert.id}
                className={`alert-list-item ${
                  selectedId === alert.id ? "selected" : ""
                }`}
                onClick={() => setSelectedId(alert.id)}
              >
                <div
                  className={`alert-severity-icon ${alert.severity.toLowerCase()}`}
                >
                  {getAlertIcon(alert.type)}
                </div>

                <div className="alert-list-info">
                  <strong>{alert.type}</strong>

                  <span>
                    {alert.station} · {alert.parameter}
                  </span>

                  <small>{alert.age}</small>
                </div>

                <div
                  className={`alert-list-severity ${alert.severity.toLowerCase()}`}
                >
                  {alert.severity}
                </div>

                <ChevronRight size={15} />
              </button>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="no-alerts">No alerts in this category.</div>
            )}
          </div>
        </div>

        {/* SELECTED ALERT */}
        <div className="selected-alert-card">
          <div className="selected-alert-header">
            <div>
              <span className="card-eyebrow">ALERT DETAILS</span>

              <h2>{selectedAlert.type}</h2>

              <p>{selectedAlert.id}</p>
            </div>

            <div
              className={`alert-detail-severity ${selectedAlert.severity.toLowerCase()}`}
            >
              <ShieldAlert size={14} />
              {selectedAlert.severity}
            </div>
          </div>

          {/* STATION */}

          <div className="alert-station">
            <div className="alert-station-icon">
              {getAlertIcon(selectedAlert.type)}
            </div>

            <div>
              <strong>{selectedAlert.station}</strong>

              <span>{selectedAlert.stationName}</span>
            </div>
          </div>

          {/* VALUES */}

          <div className="alert-values">
            <div>
              <span>OBSERVED</span>

              <strong>{selectedAlert.value}</strong>
            </div>

            <div>
              <span>EXPECTED</span>

              <strong>{selectedAlert.expected}</strong>
            </div>

            <div>
              <span>DETECTED</span>

              <strong>{selectedAlert.time}</strong>
            </div>
          </div>

          {/* MESSAGE */}

          <div className="alert-message">
            <span>AI ALERT MESSAGE</span>

            <p>{selectedAlert.message}</p>
          </div>

          {/* ACTION */}

          <div className="alert-action">
            <span>RECOMMENDED ACTION</span>

            <div>
              <CheckCircle2 size={15} />

              <p>{selectedAlert.action}</p>
            </div>
          </div>

          {/* FOOTER */}

          <div className="alert-detail-footer">
            <div>
              <Clock3 size={13} />

              <span>Detected {selectedAlert.age}</span>
            </div>

            <div>
              <MapPin size={13} />

              <span>{selectedAlert.station}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE ACTIVITY */}
      <div className="alert-activity-card">
        <div className="alerts-list-header">
          <div>
            <span className="card-eyebrow">LIVE ACTIVITY</span>

            <h2>Alert Processing</h2>
          </div>

          <Bell size={17} />
        </div>

        <div className="alert-processing">
          <div className="processing-item">
            <div className="processing-icon">
              <BrainCircuit size={15} />
            </div>

            <div>
              <strong>AI anomaly engine</strong>

              <span>Processing incoming observations</span>
            </div>

            <b>ACTIVE</b>
          </div>

          <div className="processing-item">
            <div className="processing-icon">
              <Activity size={15} />
            </div>

            <div>
              <strong>Sensor validation</strong>

              <span>Cross-checking temporal patterns</span>
            </div>

            <b>ACTIVE</b>
          </div>

          <div className="processing-item">
            <div className="processing-icon">
              <MapPin size={15} />
            </div>

            <div>
              <strong>Spatial consistency</strong>

              <span>Comparing neighboring AWS stations</span>
            </div>

            <b>ACTIVE</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
