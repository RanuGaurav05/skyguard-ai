import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeatureBar from "../components/FeatureBar";
import BackgroundEffects from "../components/BackgroundEffects";

function LandingPage() {
  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen bg-[#030712] text-slate-100 selection:bg-blue-500 selection:text-white overflow-y-auto lg:overflow-hidden flex flex-col justify-between">
      <BackgroundEffects />

      <div className="relative z-10 flex-grow flex flex-col justify-between h-full max-h-full">
        <Navbar />

        <main className="flex-grow flex flex-col justify-between overflow-hidden py-2 lg:py-4">
          <HeroSection />

          <FeatureBar />
        </main>
      </div>
    </div>
  );
}

export default LandingPage;
