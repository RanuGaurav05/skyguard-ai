import {
  AlertTriangle,
  Activity,
  Droplets,
  Gauge,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   RECENT ALERTS
========================================================= */

const recentAlerts = [
  {
    id: 1,

    title: "Sensor fault detected",

    station: "Ambala",

    time: "10:39:21",

    age: "2 min ago",

    severity: "HIGH",

    type: "PRESSURE",
  },

  {
    id: 2,

    title: "Sensor drift detected",

    station: "Chandigarh / Surajpur",

    time: "10:31:08",

    age: "10 min ago",

    severity: "MEDIUM",

    type: "TEMPERATURE",
  },

  {
    id: 3,

    title: "Humidity inconsistency detected",

    station: "Palakkad",

    time: "10:18:42",

    age: "23 min ago",

    severity: "MEDIUM",

    type: "HUMIDITY",
  },
];

/* =========================================================
   ICON
========================================================= */

function getAlertIcon(type) {
  if (type === "PRESSURE") {
    return <Gauge size={17} />;
  }

  if (type === "TEMPERATURE") {
    return <Activity size={17} />;
  }

  if (type === "HUMIDITY") {
    return <Droplets size={17} />;
  }

  return <AlertTriangle size={17} />;
}

/* =========================================================
   COMPONENT
========================================================= */

function RecentAlerts() {
  return (
    <div className="alerts-card">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="alerts-list-header">

        <div>

          <span className="card-eyebrow">
            MONITORING LOG
          </span>

          <h2>
            Recent Alerts
          </h2>

        </div>

      </div>


      {/* =====================================================
          ALERT LIST
      ===================================================== */}

      <div className="recent-alerts-list">

        {recentAlerts.map((alert) => (

          <button
            type="button"
            className="recent-alert-item"
            key={alert.id}
          >

            {/* =================================================
                ICON
            ================================================= */}

            <div
              className={`recent-alert-icon ${alert.severity.toLowerCase()}`}
            >
              {getAlertIcon(alert.type)}
            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="recent-alert-info">

              <strong>
                {alert.title}
              </strong>

              <span>
                {alert.station} · {alert.time}
              </span>

            </div>


            {/* =================================================
                AGE
            ================================================= */}

            <span className="recent-alert-age">
              {alert.age}
            </span>


            {/* =================================================
                ARROW
            ================================================= */}

            <ChevronRight
              size={16}
              className="recent-alert-arrow"
            />

          </button>

        ))}

      </div>

    </div>
  );
}

export default RecentAlerts;