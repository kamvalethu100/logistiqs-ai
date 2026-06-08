import { useState, useEffect } from "react";
import api from "../api/client";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    api.get("/templates").then((res) => setTemplates(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22 }}>Templates</h2>
        <button className="btn btn-primary">+ Add Template</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {templates.length === 0 && (
          <div className="text-center text-muted" style={{ gridColumn: "1/-1", padding: 48 }}>No templates yet.</div>
        )}
        {templates.map((tpl) => (
          <div key={tpl.id} className="kpi-card">
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <h3 style={{ fontSize: 16 }}>{tpl.name}</h3>
              <span className={`badge badge-${tpl.tier === "enterprise" ? "danger" : tpl.tier === "professional" ? "warning" : "new"}`}>
                {tpl.tier}
              </span>
            </div>
            <div className="text-sm text-muted" style={{ marginBottom: 8 }}>{tpl.description || tpl.slug}</div>
            <div className="font-bold">R{tpl.priceZar || tpl.price_zar}</div>
            <div className="text-xs text-muted">Deposit: R{tpl.depositZar || tpl.deposit_zar}</div>
          </div>
        ))}
      </div>
    </div>
  );
}