import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import WeatherStationVisual from "./WeatherStationVisual";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative flex-1 flex items-center overflow-hidden py-3 lg:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Spacious, Premium Text Content & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start z-20 pr-0 lg:pr-4">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-xs font-bold text-[#00f0ff] uppercase tracking-wider shadow-[0_0_12px_rgba(0,168,255,0.2)] mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
              <span>AI POWERED WEATHER STATION MONITORING</span>
            </div>

            {/* Main Heading: Spacious gap between line 1 & line 2 */}
            <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.15] mb-6">
              <span className="block text-white whitespace-nowrap">
                Intelligent. Real-Time.
              </span>
              <span className="block text-[#00a8ff] drop-shadow-[0_0_15px_rgba(0,168,255,0.5)] mt-3">
                Reliable.
              </span>
            </h1>

            {/* Exact Supporting Text */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-lg mb-8">
              SkyGuard AI monitors AWS stations in real-time, detects anomalies,
              assesses sensor health, and provides instant alerts for reliable
              weather intelligence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Primary CTA */}
              <button
                onClick={() => navigate("/dashboard")}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-[0_0_22px_rgba(0,168,255,0.45)] hover:shadow-[0_0_30px_rgba(0,240,255,0.75)] border border-blue-400/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Dashboard</span>

                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* Secondary CTA */}
              <button className="group w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-lg text-sm font-semibold text-white bg-[#0a1638]/70 hover:bg-blue-950/80 border border-blue-500/40 hover:border-blue-400/70 shadow-[0_0_12px_rgba(0,100,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: AWS Weather Station Visual */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end z-10 my-2 lg:my-0">
            <WeatherStationVisual />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
