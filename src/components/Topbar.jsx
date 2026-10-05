import { useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";

function Topbar({ onMenuClick }) {
  const navigate = useNavigate();

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
        {/* HOME */}
        <button
          type="button"
          className="breadcrumb home-button"
          onClick={() => navigate("/")}
          aria-label="Go to Home"
        >
          Go Home
        </button>
      </div>

      <div className="topbar-right">
        {/* NOTIFICATION */}
        <button
          type="button"
          className="icon-button notification-button"
          aria-label="Notifications"
          onClick={() => navigate("/alerts")}
        >
          <Bell size={18} />
          <span></span>
        </button>

        {/* OPERATOR */}
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