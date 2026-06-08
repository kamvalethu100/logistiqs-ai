import { useState, useEffect } from "react";
import api from "../api/client";

const statusLabels = {
  matched: "Matched", preview_sent: "Preview Sent", preview_opened: "Preview Opened",
  deposit_pending: "Deposit Pending", deposit_received: "Deposit Received",
  in_progress: "In Progress", completed: "Completed", declined: "Declined", cancelled: "Cancelled",
};

export default function DealsPage() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    api.get("/deals").then((res) => setDeals(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22 }}>Deals Pipeline</h2>
        <button className="btn btn-primary">+ New Deal</button>
      </div>
      <div className="kanban-board">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="kanban-column">
            <div className="kanban-column-header">
              <span>{label}</span>
              <span className="badge badge-new">{deals.filter((d) => (d.status || d.status) === key).length}</span>
            </div>
            {deals.filter((d) => (d.status || d.status) === key).map((deal) => (
              <div key={deal.id} className="kanban-card">
                <div className="kanban-card-company">{deal.companyName || deal.company_name}</div>
                <div className="kanban-card-meta">
                  <span>R{deal.priceZar || deal.price_zar}</span>
                  {deal.contactName && <span>• {deal.contactName}</span>}
                </div>
              </div>
            ))}
            {deals.filter((d) => (d.status || d.status) === key).length === 0 && (
              <div className="text-sm text-muted" style={{ padding: "8px", textAlign: "center" }}>No deals</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}