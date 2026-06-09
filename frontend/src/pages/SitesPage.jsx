import { useState, useEffect } from "react";
import api from "../api/client";
import { ExternalLink, RefreshCw, Globe, Search } from "lucide-react";

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/sites")
      .then((res) => setSites(res.data))
      .catch(() => setSites([]));
  }, []);

  const filtered = sites.filter((site) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (site.companyName || site.company_name || "").toLowerCase().includes(q) ||
      (site.domainUrl || site.domain_url || "").toLowerCase().includes(q)
    );
  });

  const statusBadge = (status) => {
    const map = {
      live: "badge-success",
      building: "badge-warning",
      draft: "badge-new",
      paused: "badge-amber",
      error: "badge-danger",
    };
    return `badge ${map[status] || "badge-new"}`;
  };

  const getStatusIcon = (status) => {
    if (status === "live") return "🟢";
    if (status === "building") return "🔄";
    if (status === "draft") return "📝";
    if (status === "paused") return "⏸️";
    if (status === "error") return "🔴";
    return "❓";
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Sites</h2>
      </div>

      <div className="search-bar">
        <Search size={18} color="var(--gray-400)" />
        <input
          className="search-input"
          placeholder="Search sites by company or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="text-sm text-muted" style={{ marginBottom: 8 }}>
        {filtered.length} site{filtered.length !== 1 ? "s" : ""}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Domain</th>
            <th>Template</th>
            <th>Status</th>
            <th>Maintenance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-state-icon">🌐</div>
                  <div className="empty-state-title">No sites deployed yet</div>
                  <div className="empty-state-desc">Completed deals will appear here as live sites.</div>
                </div>
              </td>
            </tr>
          )}
          {filtered.map((site) => (
            <tr key={site.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Globe size={16} color="var(--primary)" />
                  <strong>{site.companyName || site.company_name}</strong>
                </div>
              </td>
              <td className="text-sm">
                {site.domainUrl || site.domain_url ? (
                  <a href={site.domainUrl || site.domain_url} target="_blank" rel="noopener noreferrer">
                    {site.domainUrl || site.domain_url}
                  </a>
                ) : (
                  <span className="text-muted">Not set</span>
                )}
              </td>
              <td className="text-sm">{site.templateName || site.template_name || "-"}</td>
              <td>
                <span className={statusBadge(site.status)}>
                  {getStatusIcon(site.status)} {site.status}
                </span>
              </td>
              <td className="text-sm">
                <span className={`badge ${site.maintenancePlan ? "badge-success" : "badge-new"}`}>
                  {site.maintenancePlan ? "Monthly" : "None"}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: 4 }}>
                  {(site.domainUrl || site.domain_url) && (
                    <a
                      href={site.domainUrl || site.domain_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-secondary"
                    >
                      <ExternalLink size={12} /> View
                    </a>
                  )}
                  {site.status === "building" && (
                    <button className="btn btn-sm btn-amber">
                      <RefreshCw size={12} /> Rebuild
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}