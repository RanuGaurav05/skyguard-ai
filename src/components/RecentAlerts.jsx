import { AlertTriangle, Activity } from "lucide-react";

function RecentAlerts() {
  return (
    <div className="alerts-card">
      <div className="card-header">
        <div>
          <span className="card-eyebrow">MONITORING LOG</span>

          <h2>Recent Alerts</h2>
        </div>

        <span className="view-all">View all →</span>
      </div>

      <div className="alert-list">
        <div className="alert-item">
          <div className="alert-icon">
            <AlertTriangle size={16} />
          </div>

          <div>
            <strong>Temperature spike detected</strong>
            <span>AWS-042 · 10:39</span>
          </div>

          <b>97.8%</b>
        </div>

        <div className="alert-item">
          <div className="alert-icon">
            <Activity size={16} />
          </div>

          <div>
            <strong>Sensor drift detected</strong>
            <span>AWS-018 · 10:31</span>
          </div>

          <b>89.2%</b>
        </div>

        <div className="alert-item">
          <div className="alert-icon">
            <AlertTriangle size={16} />
          </div>

          <div>
            <strong>Humidity inconsistency</strong>
            <span>AWS-011 · 10:18</span>
          </div>

          <b>84.7%</b>
        </div>
      </div>
    </div>
  );
}

export default RecentAlerts;
