import React from "react";
import { TowerControl, Activity, ShieldCheck, Clock } from "lucide-react";

const stats = [
  {
    icon: (
      <TowerControl className="w-5 h-5 text-[#00f0ff] filter drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
    ),
    value: "120+",
    label: "AWS Stations",
  },
  {
    icon: (
      <Activity className="w-5 h-5 text-[#00f0ff] filter drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
    ),
    value: "1.2M+",
    label: "Data Points / Day",
  },
  {
    icon: (
      <ShieldCheck className="w-5 h-5 text-[#00f0ff] filter drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
    ),
    value: "99.5%",
    label: "Detection Accuracy",
  },
  {
    icon: (
      <Clock className="w-5 h-5 text-[#00f0ff] filter drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
    ),
    value: "24/7",
    label: "Active Monitoring",
  },
];

const StatsSection = () => {
  return (
    <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-5 lg:pb-6">
      {/* Section Header */}
      <h2 className="text-[10px] sm:text-xs font-extrabold text-blue-300/80 uppercase tracking-[0.25em] text-center mb-4 lg:mb-5 drop-shadow-[0_0_8px_rgba(0,168,255,0.4)]">
        TRUSTED BY WEATHER INTELLIGENCE NETWORKS
      </h2>

      {/* Grid of 4 Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-blue-500/20">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex items-center justify-center space-x-3 ${index !== 0 ? "pt-3 md:pt-0 md:pl-4" : ""} group cursor-pointer`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border border-blue-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,168,255,0.2)] group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all flex-shrink-0">
              {stat.icon}
            </div>

            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-[#00f0ff] tracking-tight text-glow-cyan">
                {stat.value}
              </span>
              <span className="text-xs text-slate-300 font-medium tracking-wide mt-0.5 whitespace-nowrap">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
