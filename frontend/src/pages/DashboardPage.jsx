import { useState, useEffect } from "react";
import api from "../api/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Users, TrendingUp, DollarSign, CheckCircle, Target, Activity, Briefcase
} from "lucide-react";

const sampleRevenueData = [
  { month: "Jan", revenue: 0 }, { month: "Feb", revenue: 0 },
  { month: "Mar", revenue: 0 }, { month: "Apr", revenue: 0 },
  { month: "May", revenue: 0 }, { month: "Jun", revenue: 0 },
  { month: "Jul", revenue: 0 }, { month: "Aug", revenue: 0 },
  { month: "Sep", revenue: 0 }, { month: "Oct", revenue: 0 },
  { month: "Nov", revenue: 0 }, { month: "Dec", revenue: 0 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(sampleRevenueData);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats({
        leadsThisWeek: 0, activeDeals: 0, conversionRate: 0, revenueMTD: 0,
        totalLeads: 0, completedProjects: 0, leadsChange: 0, revenueChange: 0,
        conversionChange: 0, pipelineMatched: 0, pipelinePreview: 0, pipelineDeposit: 0,
        pipelineProgress: 0, pipelineCompleted: 0
      }));
    api.get("/dashboard/revenue")
      .then((res) => setRevenueData(res.data))
      .catch(() => {});
    api.get("/dashboard/activity")
      .then((res) => setActivities(res.data))
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center" style={{ justifyContent: "center", padding: 48 }}>
        <div className="spinner" />
      </div>
    );
  }

  const kpis = [
    { label: "Leads This Week", value: stats.leadsThisWeek || 0, icon: Target, color: "#1a365d", bg: "#dbeafe", change: stats.leadsChange },
    { label: "Active Deals", value: stats.activeDeals || 0, icon: Briefcase, color: "#d97706", bg: "#fef3c7", change: null },
    { label: "Conversion Rate", value: `${stats.conversionRate || 0}%`, icon: TrendingUp, color: "#16a34a", bg: "#dcfce7", change: stats.conversionChange },
    { label: "Revenue (MTD)", value: `R${(stats.revenueMTD || 0).toLocaleString()}`, icon: DollarSign, color: "#d97706", bg: "#fef3c7", change: stats.revenueChange },
    { label: "Total Leads", value: stats.totalLeads || 0, icon: Users, color: "#1a365d", bg: "#dbeafe", change: null },
    { label: "Completed", value: stats.completedProjects || 0, icon: CheckCircle, color: "#16a34a", bg: "#dcfce7", change: null },
  ];

  const sampleActivities = [
    { id: 1, title: "Welcome to Logistiqs AI", description: "Dashboard is ready. Connect your backend API to see live data.", time: "now", type: "info" },
    { id: 2, title: "System Online", description: "Admin dashboard is fully operational.", time: "just now", type: "success" },
  ];

  const activityList = activities.length > 0 ? activities : sampleActivities;

  const pipelineData = [
    { stage: "Matched", count: stats.pipelineMatched || 0 },
    { stage: "Preview", count: stats.pipelinePreview || 0 },
    { stage: "Deposit", count: stats.pipelineDeposit || 0 },
    { stage: "In Progress", count: stats.pipelineProgress || 0 },
    { stage: "Completed", count: stats.pipelineCompleted || 0 },
  ];

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h2>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="kpi-card">
              <div className="kpi-card-icon" style={{ background: kpi.bg }}>
                <Icon size={20} color={kpi.color} />
              </div>
              <div className="kpi-card-label">{kpi.label}</div>
              <div className="kpi-card-value">{kpi.value}</div>
              {kpi.change !== null && kpi.change !== undefined && (
                <div className={`kpi-card-change ${kpi.change >= 0 ? "up" : "down"}`}>
                  {kpi.change >= 0 ? "↑" : "↓"} {Math.abs(kpi.change)}% vs last week
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Revenue Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Revenue Trend</h3>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a365d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1a365d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`R${(v || 0).toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#1a365d" fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="chart-container">
          <h3 className="chart-title">
            <Activity size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Recent Activity
          </h3>
          <ul className="activity-feed">
            {activityList.map((act) => (
              <li key={act.id} className="activity-item">
                <div
                  className="activity-icon"
                  style={{
                    background: act.type === "success" ? "var(--success-light)" :
                      act.type === "warning" ? "var(--warning-light)" : "var(--primary-light)"
                  }}
                >
                  <Activity size={14} color={
                    act.type === "success" ? "var(--success)" :
                    act.type === "warning" ? "var(--warning)" : "var(--primary)"
                  } />
                </div>
                <div className="activity-content">
                  <div className="activity-title">{act.title}</div>
                  {act.description && <div className="text-sm text-muted">{act.description}</div>}
                  <div className="activity-time">{act.time || act.createdAt || ""}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pipeline Snapshot */}
      <div className="chart-container" style={{ marginTop: 16 }}>
        <h3 className="chart-title">Pipeline Snapshot</h3>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1a365d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}