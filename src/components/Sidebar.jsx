import {
  LayoutDashboard,
  Map,
  Activity,
  AlertTriangle,
  HeartPulse,
  BarChart3,
  Bell,
  Settings,
  Cloud,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      {/* MOBILE CLOSE BUTTON */}
      <button
        type="button"
        className="mobile-sidebar-close"
        onClick={onClose}
        aria-label="Close navigation"
      >
        <X size={20} />
      </button>

      {/* LOGO */}
      <div className="brand">
        <div className="brand-icon">
          <Cloud size={21} />
        </div>

        <div>
          <div className="brand-name">SKYGUARD</div>
          <div className="brand-ai">AI</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        {/* MONITORING */}
        <div className="nav-section">
          <span>MONITORING</span>
        </div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/live"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Activity size={18} />
          <span>Live Monitoring</span>
        </NavLink>

        <NavLink
          to="/stations"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Map size={18} />
          <span>AWS Stations</span>
        </NavLink>

        {/* INTELLIGENCE */}
        <div className="nav-section second">
          <span>INTELLIGENCE</span>
        </div>

        <NavLink
          to="/anomalies"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <AlertTriangle size={18} />
          <span>Anomalies</span>
          <span className="nav-badge">02</span>
        </NavLink>

        <NavLink
          to="/health"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <HeartPulse size={18} />
          <span>Sensor Health</span>
        </NavLink>
        {/* 
        <NavLink
          to="/analytics"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </NavLink> */}

        {/* SYSTEM */}
        <div className="nav-section second">
          <span>SYSTEM</span>
        </div>

        <NavLink
          to="/alerts"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Bell size={18} />
          <span>Alerts</span>
          <span className="nav-badge">03</span>
        </NavLink>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* SYSTEM STATUS */}
      <div className="sidebar-status">
        <div className="system-status-header">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>

        <div className="system-status-line">
          <span>Network</span>
          <strong>98.7%</strong>
        </div>

        <div className="system-status-line">
          <span>Stations</span>
          <strong>24 / 24</strong>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
