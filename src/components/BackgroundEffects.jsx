import React from "react";

const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* 1. Deep Atmospheric Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#050c26] to-[#020512]" />

      {/* 2. Top-Center Ambient Radial Glow */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-gradient-to-b from-blue-600/20 via-cyan-500/12 to-transparent rounded-full blur-[140px]" />
      <div className="absolute top-[20%] right-[-5%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[130px]" />

      {/* 3. Subtle Digital Dot Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* 4. Perspective 3D Digital Floor Grid (Smoothly Masked Radial) */}
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] overflow-hidden opacity-30 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center_bottom,black_30%,transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_at_center_bottom,black_30%,transparent_75%)]">
        <div className="w-[160%] h-[120%] bg-perspective-grid [transform:perspective(500px)_rotateX(68deg)] origin-bottom" />
      </div>

      {/* 5. Ambient Floating Cyan Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f0ff] animate-ping"
          style={{ animationDuration: "4s" }}
        />
        <div className="absolute top-[35%] right-[20%] w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#00a8ff] animate-pulse" />
        <div
          className="absolute top-[60%] left-[28%] w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-ping"
          style={{ animationDuration: "3s" }}
        />
        <div className="absolute top-[15%] right-[35%] w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_#0088ff] animate-pulse" />
        <div
          className="absolute top-[50%] right-[12%] w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_6px_#00f0ff] animate-ping"
          style={{ animationDuration: "5s" }}
        />
      </div>

      {/* 6. Smoothly Curved Electric Cyan Horizon Curve Line (More Pronounced & Smooth Arc) */}
      <div className="absolute top-[68.5%] left-0 right-0 w-full pointer-events-none -translate-y-1/2 overflow-visible z-0">
        <svg
          className="w-full h-28 overflow-visible opacity-70"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="horizonWaveGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#0066ff" stopOpacity="0.15" />
              <stop offset="15%" stopColor="#00d4ff" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#00a8ff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0066ff" stopOpacity="0.15" />
            </linearGradient>
            <filter
              id="horizonWaveGlow"
              x="-10%"
              y="-30%"
              width="120%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Smooth, Pronounced Cubic Bezier Horizon Curve Line */}
          <path
            d="M0,42 C300,90 660,88 1020,55 C1220,38 1360,32 1440,30"
            stroke="url(#horizonWaveGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#horizonWaveGlow)"
          />
        </svg>
      </div>

      {/* 7. Digital Mountain Terrain along Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[220px] md:h-[280px] overflow-hidden pointer-events-none">
        {/* Digital Mountain Silhouette */}
        <svg
          className="absolute bottom-0 left-0 w-full h-full text-[#03091e]"
          viewBox="0 0 1440 320"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          {/* Back Mountain Silhouette */}
          <path
            fillOpacity="0.65"
            d="M0,224L48,202.7C96,181,192,139,288,149.3C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,186.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />

          {/* Front Mountain Layer */}
          <path
            fill="#020512"
            d="M0,256L60,240C120,224,240,192,360,202.7C480,213,600,267,720,261.3C840,256,960,192,1080,192C1200,192,1320,256,1380,288L1440,320L1440,320L1380,320C1320,320,1200,320,1080,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>

        {/* Bottom Horizon Electric Blue Glow Line at Very Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_16px_#00f0ff]" />
      </div>
    </div>
  );
};

export default BackgroundEffects;
