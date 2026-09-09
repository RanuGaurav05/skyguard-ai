import { AlertTriangle, ArrowUpRight } from "lucide-react";

function AnomalyPanel() {
  return (
    <div className="anomaly-card">
      <div className="card-header">
        <div>
          <span className="card-eyebrow">AI DETECTION ENGINE</span>

          <h2>Anomaly Detection</h2>
        </div>

        <AlertTriangle size={19} />
      </div>

      <div className="anomaly-main">
        <div className="anomaly-number">
          02
          <span>anomalies detected</span>
        </div>

        <div className="confidence">
          <div>
            <span>Detection confidence</span>
            <strong>91.4%</strong>
          </div>

          <div className="confidence-bar">
            <i></i>
          </div>
        </div>
      </div>

      <div className="anomaly-event">
        <div className="event-icon">
          <AlertTriangle size={17} />
        </div>

        <div className="event-info">
          <strong>Temperature spike</strong>
          <span>AWS-042 · 10:39:21</span>
        </div>

        <div className="event-score">
          97.8%
          <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
}

export default AnomalyPanel;
