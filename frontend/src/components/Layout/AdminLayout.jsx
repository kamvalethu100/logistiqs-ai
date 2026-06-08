import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/leads", label: "Leads", icon: "🎯" },
  { to: "/deals", label: "Deals", icon: "💼" },
  { to: "/templates", label: "Templates", icon: "🎨" },
  { to: "/payments", label: "Payments", icon: "💰" },
  { to: "/sites", label: "Sites", icon: "🌐" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🚛 Logistiqs AI</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "active" : ""}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--gray-700)" }}>
          <div style={{ fontSize: 13, color: "var(--gray-400)", marginBottom: 4 }}>{user?.username}</div>
          <button className="btn btn-sm" style={{ color: "var(--gray-300)", background: "transparent", border: "1px solid var(--gray-600)" }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <h1 className="topbar-title">Logistiqs AI</h1>
          <div className="topbar-right">
            <span className="text-sm text-muted">{user?.email}</span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}