import { NavLink, useNavigate } from "react-router-dom";
import Icon, { icons } from "./Icon";

const AdminSidebar = ({ user, onLogout, open, onClose }) => {
  const navigate = useNavigate();

  const adminLinks = [
    { to: "/admin", icon: icons.wallet, label: "Dashboard" },
    { to: "/admin/topups", icon: icons.topup, label: "Riwayat Top Up" },
    { to: "/admin/users", icon: icons.user, label: "Kelola User" },
  ];

  const handleNavClick = () => onClose?.();
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
        <div>
          <span className="sidebar-logo-text">WalletApp</span>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginTop: 1,
            }}
          >
            Admin Panel
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {adminLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
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
            <span className="sidebar-username">{user?.name || "Admin"}</span>
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

export default AdminSidebar;
