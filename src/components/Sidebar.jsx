import { NavLink, useNavigate } from "react-router-dom";
import Icon, { icons } from "./Icon";

const Sidebar = ({ user, onLogout, open, onClose }) => {
  const navigate = useNavigate();

  const navLinks = [
    { to: "/dashboard", icon: icons.wallet, label: "Dashboard" },
    { to: "/topup", icon: icons.topup, label: "Top Up" },
    { to: "/transfer", icon: icons.transfer, label: "Transfer" },
    { to: "/transactions", icon: icons.history, label: "Riwayat" },
  ];

  const handleNavClick = () => {
    onClose?.();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    onClose?.();
  };

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Icon d={icons.wallet} size={18} stroke="#0a0a0f" />
        </div>
        <span className="sidebar-logo-text">WalletApp</span>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={handleNavClick}
          >
            <Icon d={icon} size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleProfileClick}>
          <div className="sidebar-avatar">
            <Icon d={icons.user} size={14} />
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-username">{user?.name || "User"}</span>
            <span className="sidebar-email">{user?.email || ""}</span>
          </div>
        </div>

        <button className="sidebar-logout" onClick={onLogout} title="Logout">
          <Icon d={icons.logout} size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
