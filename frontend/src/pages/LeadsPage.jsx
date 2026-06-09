import { useState, useEffect } from "react";
import api from "../api/client";
import { Search, Plus, X, Filter } from "lucide-react";

const statusOptions = ["new", "contacted", "qualified", "proposal", "converted", "lost"];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ companyName: "", email: "", phone: "", city: "", notes: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/leads").then((res) => setLeads(res.data)).catch(() => setLeads([]));
  }, []);

  const filtered = leads.filter((lead) => {
    const name = (lead.companyName || lead.company_name || "").toLowerCase();
    const email = (lead.email || "").toLowerCase();
    const q = search.toLowerCase();
    if (search && !name.includes(q) && !email.includes(q)) return false;
    if (statusFilter && (lead.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (scoreFilter) {
      const score = lead.score || 0;
      if (scoreFilter === "high" && score < 70) return false;
      if (scoreFilter === "medium" && (score < 30 || score >= 70)) return false;
      if (scoreFilter === "low" && score >= 30) return false;
    }
    return true;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/leads", form);
      setLeads([res.data, ...leads]);
      setShowAdd(false);
      setForm({ companyName: "", email: "", phone: "", city: "", notes: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add lead");
    } finally {
      setBusy(false);
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return { label: "Hot", cls: "badge-danger" };
    if (score >= 30) return { label: "Warm", cls: "badge-warning" };
    return { label: "Cold", cls: "badge-new" };
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Leads</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Search & Filters */}
      <div className="search-bar">
        <Search size={18} color="var(--gray-400)" />
        <input
          className="search-input"
          placeholder="Search by company name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Filter size={16} color="var(--gray-400)" style={{ marginLeft: "auto" }} />
      </div>

      {/* Status filters */}
      <div className="filter-bar">
        <span className={`filter-chip ${statusFilter === "" ? "active" : ""}`} onClick={() => setStatusFilter("")}>All</span>
        {statusOptions.map((s) => (
          <span
            key={s}
            className={`filter-chip ${statusFilter === s ? "active" : ""}`}
            onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      {/* Score filter chips */}
      <div className="filter-bar" style={{ marginTop: -8 }}>
        {["high", "medium", "low"].map((s) => (
          <span
            key={s}
            className={`filter-chip ${scoreFilter === s ? "active" : ""}`}
            onClick={() => setScoreFilter(scoreFilter === s ? "" : s)}
          >
            {s === "high" ? "Hot (70+)" : s === "medium" ? "Warm (30-69)" : "Cold (<30)"}
          </span>
        ))}
      </div>

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Lead</h3>
              <button className="modal-close" onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-input" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button className="btn btn-primary w-full" disabled={busy} style={{ justifyContent: "center" }}>
                {busy ? "Saving..." : "Add Lead"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted" style={{ marginBottom: 8 }}>
        {filtered.length} lead{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* Leads Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>City</th>
            <th>Score</th>
            <th>Status</th>
            <th>Discovered</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-state-icon">🎯</div>
                  <div className="empty-state-title">No leads found</div>
                  <div className="empty-state-desc">Try adjusting your filters or add a new lead.</div>
                </div>
              </td>
            </tr>
          )}
          {filtered.map((lead) => {
            const score = getScoreLabel(lead.score || 0);
            return (
              <tr key={lead.id}>
                <td><strong>{lead.companyName || lead.company_name}</strong></td>
                <td className="text-sm">{lead.email || lead.phone || "-"}</td>
                <td className="text-sm">{lead.city || "-"}</td>
                <td><span className={`badge ${score.cls}`}>{score.label} ({lead.score || 0})</span></td>
                <td>
                  <span className={`badge ${
                    lead.status === "new" ? "badge-new" :
                    lead.status === "contacted" ? "badge-amber" :
                    lead.status === "qualified" ? "badge-warning" :
                    lead.status === "converted" ? "badge-success" :
                    lead.status === "lost" ? "badge-danger" : "badge-new"
                  }`}>
                    {lead.status || "new"}
                  </span>
                </td>
                <td className="text-sm text-muted">
                  {lead.discoveredAt ? new Date(lead.discoveredAt).toLocaleDateString() :
                   lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}