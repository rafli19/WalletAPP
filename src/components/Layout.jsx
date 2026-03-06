import Icon, { icons } from "./Icon";
import { useState } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar
        user={user}
        onLogout={onLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="layout-body">
        <header className="mobile-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Icon d={icons.wallet} size={18} stroke="#0a0a0f" />
            </div>
            <span className="sidebar-logo-text">WalletApp</span>
          </div>
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
