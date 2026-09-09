import React from "react";
import { Radio, BrainCircuit, Activity, Bell, TrendingUp } from "lucide-react";

const features = [
  {
    icon: (
      <Radio className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
    ),
    title: "Real-Time Monitoring",
    description: "Live data from all AWS stations",
  },
  {
    icon: (
      <BrainCircuit className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
    ),
    title: "AI Anomaly Detection",
    description: "Detects unusual patterns instantly",
  },
  {
    icon: (
      <Activity className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
    ),
    title: "Sensor Health Analysis",
    description: "Health scoring & issue detection",
  },
  {
    icon: (
      <Bell className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
    ),
    title: "Instant Alerts",
    description: "Critical alerts & notifications",
  },
  {
    icon: (
      <TrendingUp className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
    ),
    title: "Analytics & Reports",
    description: "Historical insights & trends",
  },
];

const FeatureBar = () => {
  return (
    <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 lg:mb-6">
      <div className="glass-panel rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.5)] border border-blue-500/30 backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-2 items-center divide-y sm:divide-y-0 lg:divide-x divide-blue-500/20">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-3 ${idx !== 0 ? "pt-3 sm:pt-0 lg:pl-3" : ""} group cursor-pointer hover:translate-y-[-1px] transition-transform duration-200`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900/60 to-cyan-900/40 border border-blue-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,168,255,0.2)] group-hover:border-blue-400 group-hover:shadow-[0_0_18px_rgba(0,240,255,0.4)] transition-all flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-xs font-bold text-white tracking-wide truncate group-hover:text-[#00f0ff] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[11px] text-blue-200/70 font-medium leading-tight mt-0.5 truncate">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureBar;
