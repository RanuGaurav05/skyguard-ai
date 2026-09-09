import {
  BrainCircuit,
  ShieldCheck,
  Activity,
  ChevronRight,
} from "lucide-react";

function AIStatus() {
  return (
    <div className="ai-status-card">
      <div className="ai-status-left">
        <div className="ai-icon">
          <BrainCircuit size={20} />
        </div>

        <div>
          <span className="card-eyebrow">SKYGUARD AI ENGINE</span>

          <h3>Normal Atmospheric Pattern</h3>

          <p>
            Current observations are consistent with expected temporal and
            multivariate patterns.
          </p>
        </div>
      </div>

      <div className="ai-status-metrics">
        <div className="ai-metric">
          <span>AI CONFIDENCE</span>
          <strong>94.8%</strong>
        </div>

        <div className="ai-metric">
          <span>DATA QUALITY</span>
          <strong>98.7%</strong>
        </div>

        <div className="ai-metric">
          <span>MODEL</span>
          <strong>SG-AE v1.0</strong>
        </div>
      </div>

      <div className="ai-status-icon">
        <ShieldCheck size={22} />
      </div>
    </div>
  );
}

export default AIStatus;
