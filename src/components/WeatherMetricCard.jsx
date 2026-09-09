import React from "react";
import { Thermometer, Droplets, Gauge } from "lucide-react";

const sparklinePaths = {
  temperature: "M0,18 Q15,8 30,14 T60,6 T90,14 T120,4 T150,12 T180,6 T200,10",
  humidity: "M0,14 Q20,20 40,10 T80,16 T120,6 T160,14 T200,8",
  pressure: "M0,10 Q25,4 50,14 T100,8 T150,16 T200,6",
};

const getIcon = (type) => {
  switch (type) {
    case "temperature":
      return (
        <Thermometer className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
      );
    case "humidity":
      return (
        <Droplets className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
      );
    case "pressure":
      return (
        <Gauge className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
      );
    default:
      return <Thermometer className="w-4 h-4 text-[#00f0ff]" />;
  }
};

const WeatherMetricCard = ({ title, value, unit, type, delay = "0s" }) => {
  const sparkPath = sparklinePaths[type] || sparklinePaths.temperature;

  return (
    <div
      className="w-full sm:w-56 glass-card-hud rounded-xl p-3.5 transition-all duration-300 hover:border-blue-400/60 hover:shadow-[0_0_20px_rgba(0,168,255,0.2)] animate-float"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between gap-2.5 mb-1.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900/70 to-cyan-900/40 border border-blue-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(0,168,255,0.3)] flex-shrink-0">
            {getIcon(type)}
          </div>
          <div>
            <div className="text-[11px] font-medium text-blue-200/70 tracking-wider">
              {title}
            </div>
            <div className="text-lg font-bold text-white tracking-tight flex items-baseline gap-1">
              <span>{value}</span>
              <span className="text-xs font-semibold text-blue-300">
                {unit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Glowing Sparkline Graph */}
      <div className="w-full h-7 pt-1">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 200 24"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`grad-card-${type}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </linearGradient>
            <filter id={`glow-card-${type}`}>
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={`${sparkPath} L200,24 L0,24 Z`}
            fill={`url(#grad-card-${type})`}
          />

          <path
            d={sparkPath}
            fill="none"
            stroke="#00f0ff"
            strokeWidth="1.75"
            strokeLinecap="round"
            filter={`url(#glow-card-${type})`}
          />
        </svg>
      </div>
    </div>
  );
};

export default WeatherMetricCard;
