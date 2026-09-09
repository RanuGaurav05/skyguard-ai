import { Search, Bell, Menu } from "lucide-react";

function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      {/* MOBILE HAMBURGER */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>

      <div className="topbar-left">
        <div className="breadcrumb">
          SKYGUARD AI
          <span>/</span>
          Dashboard
        </div>
      </div>

      <div className="topbar-right">
        <div className="live-indicator">
          <span className="status-dot"></span>
          LIVE
        </div>

        <div className="topbar-time">11:05:32 IST</div>

        <button type="button" className="icon-button" aria-label="Search">
          <Search size={18} />
        </button>

        <button
          type="button"
          className="icon-button notification-button"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span></span>
        </button>

        <div className="operator">
          <div className="operator-avatar">SG</div>

          <div className="operator-info">
            <strong>SkyGuard</strong>
            <small>Operator</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
