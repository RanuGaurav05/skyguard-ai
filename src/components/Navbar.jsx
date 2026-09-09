import React, { useState } from "react";
import {
  CloudLightning,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const navigate = useNavigate();

  // Removed 'Features' per requirement
  const navItems = [
    { name: "Home", hasDropdown: false },
    { name: "How It Works", hasDropdown: false },
    { name: "About Us", hasDropdown: false },
    { name: "Contact", hasDropdown: true },
  ];

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      setFeedbackSent(true);
      setTimeout(() => {
        setFeedbackSent(false);
        setFeedbackModalOpen(false);
        setFeedbackText("");
      }, 1500);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#030712]/90 backdrop-blur-md border-b border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Logo & Subtitle */}
          <div className="flex items-center space-x-2.5 cursor-pointer">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-500/10 border border-blue-500/40 shadow-[0_0_12px_rgba(0,168,255,0.3)]">
              <CloudLightning className="w-4 h-4 text-[#00f0ff] filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
                SkyGuard <span className="text-[#00a8ff]">AI</span>
              </span>
              <span className="text-[8px] sm:text-[9px] text-blue-300/70 font-medium tracking-wider uppercase -mt-1">
                Weather Station Monitoring
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.name;

              if (item.hasDropdown) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setContactDropdownOpen(true)}
                    onMouseLeave={() => setContactDropdownOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setActiveTab(item.name);
                        setContactDropdownOpen(!contactDropdownOpen);
                      }}
                      className={`relative flex items-center gap-1 py-1 text-xs sm:text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "text-[#00f0ff] font-semibold"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${contactDropdownOpen ? "rotate-180 text-[#00f0ff]" : "text-slate-400"}`}
                      />
                      {isActive && (
                        <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] rounded-full" />
                      )}
                    </button>

                    {/* Futuristic Glassmorphism Dropdown */}
                    {contactDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-40 bg-[#07112b]/95 border border-blue-500/40 rounded-xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          onClick={() => {
                            setFeedbackModalOpen(true);
                            setContactDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-[#00f0ff] hover:bg-blue-900/30 rounded-lg transition-colors text-left"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#00f0ff]" />
                          <span>Feedback</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`relative py-1 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#00f0ff] font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Get Started CTA Button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="relative px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-[0_0_15px_rgba(0,168,255,0.4)] hover:shadow-[0_0_24px_rgba(0,240,255,0.6)] border border-blue-400/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-blue-950/50 border border-blue-500/30 text-blue-400 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#060d24]/95 border-b border-blue-500/20 px-4 pt-3 pb-5 space-y-2 backdrop-blur-xl">
            {navItems.map((item) => (
              <div key={item.name}>
                <button
                  onClick={() => {
                    setActiveTab(item.name);
                    if (!item.hasDropdown) setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.name
                      ? "bg-blue-600/20 text-[#00f0ff] border-l-2 border-[#00f0ff]"
                      : "text-slate-300 hover:bg-blue-900/20 hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
                {item.hasDropdown && (
                  <div className="pl-6 pt-1">
                    <button
                      onClick={() => {
                        setFeedbackModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 py-1.5 text-xs text-blue-300 hover:text-[#00f0ff]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Feedback</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full py-2 rounded-lg font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-neon-blue"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#081333] border border-blue-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,168,255,0.3)] text-left">
            <button
              onClick={() => setFeedbackModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-[#00f0ff]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Send Feedback</h3>
                <p className="text-xs text-blue-200/70">
                  Help us improve SkyGuard AI Weather Monitoring
                </p>
              </div>
            </div>

            {feedbackSent ? (
              <div className="py-8 text-center text-[#00f0ff] font-semibold text-sm animate-in zoom-in-95">
                ✓ Thank you! Your feedback has been received.
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Thoughts or Suggestions
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you think about the platform..."
                    required
                    className="w-full bg-[#03091e] border border-blue-500/30 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-blue-950/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(0,168,255,0.4)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all"
                  >
                    <span>Submit</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
