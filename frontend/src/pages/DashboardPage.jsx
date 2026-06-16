import { useState, useEffect } from "react";
import api from "../api/client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Funnel, FunnelChart
} from "recharts";
import {
  Users, TrendingUp, DollarSign, CheckCircle, Target, Activity,
  Briefcase, Zap, Send, Banknote, MapPin, Clock, Calendar,
  MousePointerClick, PhoneCall, BarChart3, ListChecks
} from "lucide-react";

// Color palette
const COLORS = {
  primary: "#1a365d", primaryLight: "#dbeafe",
  amber: "#d97706", amberLight: "#fef3c7",
  success: "#16a34a", successLight: "#dcfce7",
  danger: "#dc2626", dangerLight: "#fee2e2",
  purple: "#7c3aed", purpleLight: "#ede9fe",
  teal: "#0d9488", tealLight: "#ccfbf1",
  gray: "#6b7280",
};

const PIE_COLORS = ["#1a365d", "#d97706", "#16a34a", "#7c3aed", "#dc2626"];

// Helpers
const today = () => new Date().toISOString().split("T")[0];
const isToday = (dateStr) => dateStr && dateStr.startsWith(today());

const sampleRevenueData = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 51000 }, { month: "Apr", revenue: 47000 },
  { month: "May", revenue: 62000 }, { month: "Jun", revenue: 58000 },
  { month: "Jul", revenue: 0 }, { month: "Aug", revenue: 0 },
  { month: "Sep", revenue: 0 }, { month: "Oct", revenue: 0 },
  { month: "Nov", revenue: 0 }, { month: "Dec", revenue: 0 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [revenueData, setRevenueData] = useState(sampleRevenueData);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats").catch(() => ({ data: {} })),
      api.get("/deals").catch(() => ({ data: [] })),
      api.get("/leads").catch(() => ({ data: [] })),
      api.get("/payments").catch(() => ({ data: [] })),
    ]).then(([s, d, l, p]) => {
      setStats(s.data);
      setDeals(d.data);
      setLeads(l.data);
      setPayments(p.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center" style={{ justifyContent: "center", padding: 48 }}>
        <div className="spinner" />
      </div>
    );
  }

  // === DERIVED DATA ===

  // Daily snapshot
  const todayDeals = deals.filter((d) => isToday(d.createdAt));
  const todayLeads = leads.filter((l) => isToday(l.discoveredAt));
  const todayPayments = payments.filter((p) => isToday(p.createdAt));
  const dailySnapshot = {
    leadsToday: todayLeads.length,
    qualifiedToday: todayLeads.filter((l) => l.status === "qualified" || l.status === "converted").length,
    previewsSent: todayDeals.filter((d) => d.status === "preview_sent").length,
    depositsReceived: todayPayments.filter((p) => p.verified).length,
    dealsClosed: todayDeals.filter((d) => d.status === "completed").length,
  };

  // Pipeline funnel stages
  const pipelineStages = [
    { name: "Prospects", value: leads.length, fill: "#9ca3af" },
    { name: "Matched", value: deals.filter((d) => d.status === "matched").length, fill: "#1a365d" },
    { name: "Preview Sent", value: deals.filter((d) => d.status === "preview_sent").length, fill: "#d97706" },
    { name: "Deposit Paid", value: deals.filter((d) => d.status === "deposit_received").length, fill: "#16a34a" },
    { name: "Completed", value: deals.filter((d) => d.status === "completed").length, fill: "#0d9488" },
  ];

  // Revenue tracking
  const mtdPayments = payments.filter((p) => {
    if (!p.createdAt) return false;
    const d = new Date(p.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.verified;
  });
  const mtdRevenue = mtdPayments.reduce((sum, p) => sum + (p.amountZar || 0), 0);
  const activeDeals = deals.filter((d) => !["completed","declined","cancelled"].includes(d.status));
  const projectedRevenue = activeDeals.reduce((sum, d) => sum + (d.priceZar || 0), 0);
  const totalExpectedDeposits = activeDeals.reduce((sum, d) => sum + (d.depositAmount || 0), 0);
  const depositCollected = payments.filter((p) => p.type === "deposit" && p.verified).reduce((s, p) => s + (p.amountZar || 0), 0);
  const depositRate = totalExpectedDeposits > 0 ? Math.round((depositCollected / totalExpectedDeposits) * 100) : 0;

  // Lead quality heatmap (by province)
  const provinceMap = {};
  leads.forEach((l) => {
    const prov = l.province || l.city || "Unknown";
    if (!provinceMap[prov]) provinceMap[prov] = { count: 0, totalScore: 0 };
    provinceMap[prov].count++;
    provinceMap[prov].totalScore += l.score || 0;
  });
  const heatmapData = Object.entries(provinceMap).map(([prov, data]) => ({
    province: prov,
    count: data.count,
    avgScore: Math.round(data.totalScore / data.count),
  })).sort((a, b) => b.count - a.count);

  // Activity feed (combine recent deals, payments, and leads)
  const allActivities = [
    ...deals.map((d) => ({
      id: `deal-${d.id}`,
      title: `Deal ${d.status.replace("_", " ")}`,
      description: `${d.companyName} — ${d.status.replace("_", " ")}`,
      time: d.updatedAt || d.createdAt,
      type: d.status === "completed" ? "success" : d.status === "deposit_received" ? "success" : "info",
    })),
    ...payments.filter((p) => p.verified).map((p) => ({
      id: `pay-${p.id}`,
      title: "Payment Verified",
      description: `R${p.amountZar} ${p.type} payment verified`,
      time: p.verifiedAt || p.createdAt,
      type: "success",
    })),
    ...leads.filter((l) => l.score >= 70).map((l) => ({
      id: `lead-${l.id}`,
      title: "Hot Lead Discovered",
      description: `${l.companyName} — Score: ${l.score}`,
      time: l.discoveredAt,
      type: "warning",
    })),
  ].sort((a, b) => {
    const ta = a.time ? new Date(a.time).getTime() : 0;
    const tb = b.time ? new Date(b.time).getTime() : 0;
    return tb - ta;
  }).slice(0, 15);

  // Stats for the top KPI row
  const topStats = stats || {};
  const kpis = [
    { label: "Leads This Week", value: topStats.leadsThisWeek || leads.length, icon: Target, color: COLORS.primary, bg: COLORS.primaryLight, change: null },
    { label: "Active Deals", value: activeDeals.length, icon: Briefcase, color: COLORS.amber, bg: COLORS.amberLight, change: null },
    { label: "Conversion Rate", value: `${topStats.conversionRate || 0}%`, icon: TrendingUp, color: COLORS.success, bg: COLORS.successLight, change: null },
    { label: "Revenue (MTD)", value: `R${mtdRevenue.toLocaleString()}`, icon: DollarSign, color: COLORS.amber, bg: COLORS.amberLight, change: null },
    { label: "Total Leads", value: leads.length, icon: Users, color: COLORS.primary, bg: COLORS.primaryLight, change: null },
    { label: "Completed", value: deals.filter((d) => d.status === "completed").length, icon: CheckCircle, color: COLORS.success, bg: COLORS.successLight, change: null },
  ];

  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
      {/* Main content */}
      <div>
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>Command Center</h2>
            <p className="text-sm text-muted">{new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        {/* KPI Cards */}
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

        {/* Section 1: Daily Snapshot + Revenue Tracker */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Daily Snapshot */}
          <div className="chart-container">
            <h3 className="chart-title">
              <Calendar size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Daily Snapshot
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 16px", background: COLORS.primaryLight, borderRadius: "var(--radius)" }}>
                <div className="text-xs text-muted">Leads Generated</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{dailySnapshot.leadsToday}</div>
              </div>
              <div style={{ padding: "12px 16px", background: COLORS.amberLight, borderRadius: "var(--radius)" }}>
                <div className="text-xs text-muted">Qualified Today</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.amber }}>{dailySnapshot.qualifiedToday}</div>
              </div>
              <div style={{ padding: "12px 16px", background: COLORS.purpleLight, borderRadius: "var(--radius)" }}>
                <div className="text-xs text-muted">Previews Sent</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.purple }}>{dailySnapshot.previewsSent}</div>
              </div>
              <div style={{ padding: "12px 16px", background: COLORS.tealLight, borderRadius: "var(--radius)" }}>
                <div className="text-xs text-muted">Deposits Received</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.teal }}>{dailySnapshot.depositsReceived}</div>
              </div>
              <div style={{ padding: "12px 16px", background: COLORS.successLight, borderRadius: "var(--radius)", gridColumn: "1/-1" }}>
                <div className="text-xs text-muted">Deals Closed Today</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.success }}>{dailySnapshot.dealsClosed}</div>
              </div>
            </div>
          </div>

          {/* Revenue Tracker */}
          <div className="chart-container">
            <h3 className="chart-title">
              <DollarSign size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Revenue Tracker
            </h3>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div>
                <div className="text-xs text-muted">MTD Revenue</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>R{mtdRevenue.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="text-xs text-muted">Projected</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.amber }}>R{(projectedRevenue).toLocaleString()}</div>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-between text-sm" style={{ marginBottom: 4 }}>
                <span className="text-muted">Deposit Collection Rate</span>
                <span style={{ fontWeight: 600 }}>{depositRate}%</span>
              </div>
              <div style={{ height: 8, background: "var(--gray-200)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${depositRate}%`, background: COLORS.success, borderRadius: 4, transition: "width 0.5s" }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div><span className="text-muted">Collected: </span><strong>R{depositCollected.toLocaleString()}</strong></div>
              <div><span className="text-muted">Expected: </span><strong>R{totalExpectedDeposits.toLocaleString()}</strong></div>
            </div>
          </div>
        </div>

        {/* Section 2: Pipeline Funnel + Revenue Trend */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginTop: 16 }}>
          {/* Pipeline Funnel */}
          <div className="chart-container">
            <h3 className="chart-title">
              <BarChart3 size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Pipeline Funnel
            </h3>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={pipelineStages} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {pipelineStages.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="chart-container">
            <h3 className="chart-title">
              <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Revenue Trend (Monthly)
            </h3>
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
        </div>

        {/* Section 3: Lead Quality Heatmap + Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          {/* Heatmap */}
          <div className="chart-container">
            <h3 className="chart-title">
              <MapPin size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Lead Quality by Region
            </h3>
            {heatmapData.length === 0 ? (
              <div className="text-sm text-muted" style={{ padding: 24, textAlign: "center" }}>No lead data to display yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {heatmapData.slice(0, 8).map((item) => {
                  const intensity = Math.min(item.avgScore, 100) / 100;
                  const bg = intensity > 0.7 ? COLORS.dangerLight :
                    intensity > 0.4 ? COLORS.amberLight : COLORS.primaryLight;
                  const color = intensity > 0.7 ? COLORS.danger :
                    intensity > 0.4 ? COLORS.amber : COLORS.primary;
                  return (
                    <div key={item.province} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", borderRadius: "var(--radius)",
                      background: bg, fontSize: 13
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MapPin size={14} color={color} />
                        <span style={{ fontWeight: 500 }}>{item.province}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span className="text-muted">{item.count} leads</span>
                        <span className="badge" style={{ background: bg, color }}>Score: {item.avgScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="chart-container">
            <h3 className="chart-title">
              <Activity size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Recent Activity
            </h3>
            <ul className="activity-feed" style={{ maxHeight: 360, overflowY: "auto" }}>
              {allActivities.length === 0 && (
                <div className="text-sm text-muted" style={{ padding: 24, textAlign: "center" }}>No recent activity.</div>
              )}
              {allActivities.map((act) => (
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
                    <div className="text-sm text-muted">{act.description}</div>
                    <div className="activity-time">
                      {act.time ? new Date(act.time).toLocaleString("en-ZA") : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* === QUICK ACTIONS SIDEBAR === */}
      <div style={{ position: "sticky", top: 88 }}>
        <div className="chart-container" style={{ marginBottom: 16 }}>
          <h3 className="chart-title" style={{ borderBottom: "1px solid var(--gray-200)", paddingBottom: 12 }}>
            <Zap size={16} style={{ marginRight: 6, verticalAlign: "middle", color: COLORS.amber }} />
            Quick Actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="btn btn-primary"
              style={{ justifyContent: "center", width: "100%" }}
              onClick={() => {
                if (confirm("Run lead discovery engine now? This may take a few minutes.")) {
                  api.post("/discovery/run").then(() => alert("Discovery started! Check back in a few minutes.")).catch(() => alert("Discovery endpoint not available yet."));
                }
              }}
            >
              <Zap size={16} /> Generate Leads Now
            </button>

            <button
              className="btn btn-amber"
              style={{ justifyContent: "center", width: "100%" }}
              onClick={() => {
                const matchedDeal = deals.find((d) => d.status === "matched");
                if (matchedDeal) {
                  window.location.href = `/deals#${matchedDeal.id}`;
                } else {
                  alert("No matched deals that need a preview sent. Go to Deals to manage your pipeline.");
                }
              }}
            >
              <Send size={16} /> Send Preview
            </button>

            <button
              className="btn btn-success"
              style={{ justifyContent: "center", width: "100%", background: COLORS.success, color: "white" }}
              onClick={() => window.location.href = "/payments"}
            >
              <Banknote size={16} /> Mark Payment Received
            </button>
          </div>
        </div>

        {/* Mini pipeline summary */}
        <div className="chart-container">
          <h3 className="chart-title" style={{ borderBottom: "1px solid var(--gray-200)", paddingBottom: 12, fontSize: 14 }}>
            <ListChecks size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Pipeline Summary
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
            {pipelineStages.filter((s) => s.name !== "Prospects").map((stage) => (
              <div key={stage.name} className="flex items-center justify-between">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.fill, display: "inline-block" }} />
                  <span>{stage.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{stage.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="chart-container" style={{ marginTop: 16 }}>
          <h3 className="chart-title" style={{ borderBottom: "1px solid var(--gray-200)", paddingBottom: 12, fontSize: 14 }}>
            <Clock size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Today's Summary
          </h3>
          <div className="text-sm">
            <div className="flex items-center justify-between" style={{ padding: "6px 0" }}>
              <span className="text-muted">New leads</span>
              <strong>{dailySnapshot.leadsToday}</strong>
            </div>
            <div className="flex items-center justify-between" style={{ padding: "6px 0" }}>
              <span className="text-muted">Previews sent</span>
              <strong>{dailySnapshot.previewsSent}</strong>
            </div>
            <div className="flex items-center justify-between" style={{ padding: "6px 0" }}>
              <span className="text-muted">Deposits</span>
              <strong>{dailySnapshot.depositsReceived}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}