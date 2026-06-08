import { useState, useEffect } from "react";
import api from "../api/client";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) return <div className="flex items-center" style={{ justifyContent: "center", padding: 48 }}><div className="spinner" /></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 22 }}>Dashboard</h2>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-label">Leads This Week</div>
          <div className="kpi-card-value">{stats.leadsThisWeek || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Active Deals</div>
          <div className="kpi-card-value">{stats.activeDeals || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Conversion Rate</div>
          <div className="kpi-card-value">{stats.conversionRate || 0}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Revenue (MTD)</div>
          <div className="kpi-card-value">R{stats.revenueMTD?.toLocaleString() || 0}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="chart-container">
          <h3 className="chart-title">Pipeline Funnel</h3>
          <div className="text-sm text-muted">Deal pipeline overview will render here</div>
        </div>
        <div className="chart-container">
          <h3 className="chart-title">Recent Activity</h3>
          <div className="text-sm text-muted">Latest activity feed will appear here</div>
        </div>
      </div>
    </div>
  );
}