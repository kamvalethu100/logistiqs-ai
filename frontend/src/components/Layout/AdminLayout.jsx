import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Target, Briefcase, Palette, Banknote, Globe, LogOut, Truck
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Target },
  { to: "/deals", label: "Deals", icon: Briefcase },
  { to: "/templates", label: "Templates", icon: Palette },
  { to: "/payments", label: "Payments", icon: Banknote },
  { to: "/sites", label: "Sites", icon: Globe },
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
        <div className="sidebar-logo">
          <Truck size={22} />
          Logistiqs AI
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "active" : ""}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--gray-700)", marginTop: "auto" }}>
          <div style={{ fontSize: 13, color: "var(--gray-400)", marginBottom: 4 }}>{user?.username}</div>
          <button
            className="btn btn-sm"
            style={{ color: "var(--gray-300)", background: "transparent", border: "1px solid var(--gray-600)", width: "100%" }}
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <h1 className="topbar-title">
            <Truck size={20} style={{ color: "var(--amber)", marginRight: 8, verticalAlign: "middle" }} />
            Logistiqs AI
          </h1>
          <div className="topbar-right">
            <span className="text-sm text-muted">{user?.email || user?.username}</span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}