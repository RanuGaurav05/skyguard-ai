import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="mobile-overlay" onClick={closeSidebar} />}

      {/* MAIN CONTENT */}
      <main className="main-content">
        <Topbar onMenuClick={openSidebar} />

        {children}
      </main>
    </div>
  );
}

export default Layout;
