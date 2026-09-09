import {
  Thermometer,
  Gauge,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

function SensorCard({ title, value, unit, change, status, icon }) {
  const icons = {
    temperature: Thermometer,
    pressure: Gauge,
    humidity: Droplets,
  };

  const Icon = icons[icon];

  const isDown = change?.startsWith("-");
  const isNeutral = status === "STABLE";

  return (
    <div className="sensor-card">
      <div className="sensor-card-top">
        <div className="sensor-title">
          <div className="sensor-icon">
            <Icon size={19} />
          </div>

          <span>{title}</span>
        </div>

        <div className={`sensor-status ${isNeutral ? "stable" : ""}`}>
          <span></span>
          {status}
        </div>
      </div>

      <div className="sensor-value">
        {value}
        <span>{unit}</span>
      </div>

      <div className="sensor-footer">
        <div className={`sensor-change ${isDown ? "down" : ""}`}>
          {isNeutral ? (
            <Minus size={13} />
          ) : isDown ? (
            <ArrowDownRight size={13} />
          ) : (
            <ArrowUpRight size={13} />
          )}

          {change}
        </div>

        <span className="updated-text">Updated 2 sec ago</span>
      </div>

      <div className="sensor-line"></div>
    </div>
  );
}

export default SensorCard;
