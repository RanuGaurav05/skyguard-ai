import React from "react";

const WeatherStationVisual = () => {
  return (
    <div className="relative w-full max-w-[540px] h-[440px] sm:h-[480px] lg:h-[510px] flex items-center justify-center select-none overflow-visible mx-auto lg:ml-auto lg:mr-0">
      {/* 1. Deep Atmospheric Radial Glow Behind Mast */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[380px] h-[380px] rounded-full bg-cyan-500/16 blur-[100px] animate-pulse-slow" />
        <div className="w-[240px] h-[240px] rounded-full bg-blue-600/22 blur-[70px]" />
      </div>

      {/* 2. Vertical Digital Data Beams & Signal Nodes */}
      <div className="absolute inset-0 flex justify-around pointer-events-none opacity-50 px-6">
        <div
          className="w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent animate-beam"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="w-1.5 h-1.5 -ml-0.25 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f0ff] animate-ping" />
        </div>
        <div
          className="w-[1px] h-full bg-gradient-to-b from-transparent via-blue-400/40 to-transparent animate-beam"
          style={{ animationDelay: "1.2s" }}
        >
          <div className="w-1.5 h-1.5 -ml-0.25 rounded-full bg-blue-300 shadow-[0_0_8px_#00a8ff] animate-pulse" />
        </div>
        <div
          className="w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-400/70 to-transparent animate-beam"
          style={{ animationDelay: "0.7s" }}
        >
          <div className="w-1.5 h-1.5 -ml-0.25 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-ping" />
        </div>
        <div
          className="w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/40 to-transparent animate-beam"
          style={{ animationDelay: "1.8s" }}
        />
      </div>

      {/* 3. UNIFIED LOCKED CONTAINER: AWS STATION MAST EXACTLY CENTERED OVER HOLOGRAPHIC RIPPLE PLATFORM */}
      <div className="relative w-full h-full flex flex-col items-center justify-end pb-4">
        {/* AWS Station Mast Image with Soft Rim Light & Glow */}
        <div className="relative z-10 w-full h-[88%] lg:h-[92%] flex items-center justify-center -mb-20 sm:-mb-22 lg:-mb-24">
          <img
            src="/aws_weather_station.png"
            alt="SkyGuard Automatic Weather Station (AWS)"
            className="h-full max-w-full object-contain filter drop-shadow-[0_0_28px_rgba(0,168,255,0.5)] drop-shadow-[0_0_60px_rgba(0,240,255,0.3)] transition-transform duration-500 hover:scale-[1.02]"
            style={{ mixBlendMode: "lighten" }}
          />
        </div>

        {/* Concentric Holographic Ripple Platform (Tripod Base Stands in Exact Center) */}
        <div className="relative z-0 w-[340px] sm:w-[400px] lg:w-[440px] h-[130px] pointer-events-none flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center [transform:perspective(500px)_rotateX(72deg)]">
            {/* Outer Ring */}
            <div className="absolute w-[360px] h-[360px] rounded-full border border-cyan-400/25 shadow-[0_0_18px_rgba(0,240,255,0.2)] animate-spin-slow" />

            {/* Outer Dashed Ring */}
            <div className="absolute w-[290px] h-[290px] rounded-full border border-dashed border-blue-400/35 animate-spin-reverse-slow" />

            {/* Glowing Concentric Wave Ring */}
            <div className="absolute w-[230px] h-[230px] rounded-full border-2 border-[#00f0ff] shadow-[0_0_28px_#00f0ff,inset_0_0_20px_#00f0ff] animate-ring-pulse" />

            {/* Inner Bright Ring */}
            <div className="absolute w-[160px] h-[160px] rounded-full border border-cyan-300 bg-cyan-500/12 shadow-[0_0_35px_rgba(0,240,255,0.6)]" />

            {/* Center Glow Spot directly under tripod base */}
            <div className="absolute w-8 h-8 rounded-full bg-[#00f0ff] shadow-[0_0_28px_#00f0ff] blur-[1px]" />
          </div>
        </div>
      </div>

      {/* 4. Ambient Particle Dust Around Equipment */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-ping"
          style={{ animationDuration: "4s" }}
        />
        <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#00a8ff] animate-pulse" />
        <div
          className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_6px_#00f0ff] animate-ping"
          style={{ animationDuration: "3s" }}
        />
      </div>
    </div>
  );
};

export default WeatherStationVisual;
