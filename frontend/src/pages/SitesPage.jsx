import { useState, useEffect } from "react";
import api from "../api/client";

export default function SitesPage() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    api.get("/sites").then((res) => setSites(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22 }}>Sites</h2>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Maintenance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.length === 0 && (
            <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 32 }}>No sites deployed yet.</td></tr>
          )}
          {sites.map((site) => (
            <tr key={site.id}>
              <td><strong>{site.companyName || site.company_name}</strong></td>
              <td className="text-sm">{site.domainUrl || site.domain_url || "-"}</td>
              <td><span className={`badge badge-${site.status === "live" ? "success" : site.status === "building" ? "warning" : "new"}`}>{site.status}</span></td>
              <td className="text-sm">{site.maintenancePlan ? "Monthly" : "None"}</td>
              <td><button className="btn btn-sm btn-secondary">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}