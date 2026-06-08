import { useState, useEffect } from "react";
import api from "../api/client";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get("/leads").then((res) => setLeads(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22 }}>Leads</h2>
        <button className="btn btn-primary">+ Add Lead</button>
      </div>
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
          {leads.length === 0 && (
            <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 32 }}>No leads yet. Import or add manually.</td></tr>
          )}
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td><strong>{lead.companyName || lead.company_name}</strong></td>
              <td className="text-sm">{lead.email || "-"}</td>
              <td className="text-sm">{lead.city || "-"}</td>
              <td><span className="badge badge-new">{lead.score || 0}</span></td>
              <td><span className={`badge badge-${lead.status === "new" ? "new" : "warning"}`}>{lead.status}</span></td>
              <td className="text-sm text-muted">{lead.discoveredAt ? new Date(lead.discoveredAt).toLocaleDateString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}