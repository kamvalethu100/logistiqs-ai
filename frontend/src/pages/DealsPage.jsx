import { useState, useEffect } from "react";
import api from "../api/client";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Plus, GripVertical } from "lucide-react";

const columns = [
  { key: "matched", label: "Matched", color: "#9ca3af" },
  { key: "preview_sent", label: "Preview Sent", color: "#1a365d" },
  { key: "deposit_pending", label: "Deposit Pending", color: "#d97706" },
  { key: "deposit_received", label: "Deposit Received", color: "#16a34a" },
  { key: "in_progress", label: "In Progress", color: "#2563eb" },
  { key: "completed", label: "Completed", color: "#16a34a" },
];

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/deals")
      .then((res) => setDeals(res.data))
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  }, []);

  const getColumnDeals = (statusKey) =>
    deals.filter((d) => (d.status || d.status) === statusKey);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;
    const dealId = draggableId;

    // Optimistic update
    const updated = deals.map((d) =>
      d.id === dealId ? { ...d, status: newStatus } : d
    );
    setDeals(updated);

    // API call
    try {
      await api.patch(`/deals/${dealId}`, { status: newStatus });
    } catch {
      // Rollback on error
      setDeals(deals);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center" style={{ justifyContent: "center", padding: 48 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Deals Pipeline</h2>
        <button className="btn btn-primary">
          <Plus size={16} /> New Deal
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((col) => {
            const colDeals = getColumnDeals(col.key);
            return (
              <Droppable key={col.key} droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: snapshot.isDraggingOver ? "var(--gray-200)" : "var(--gray-100)",
                      transition: "background 0.2s",
                    }}
                  >
                    <div className="kanban-column-header">
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: col.color, display: "inline-block"
                        }} />
                        {col.label}
                      </span>
                      <span className="kanban-column-count">{colDeals.length}</span>
                    </div>
                    {colDeals.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            className="kanban-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              background: snapshot.isDragging ? "white" : "white",
                              boxShadow: snapshot.isDragging ? "var(--shadow-lg)" : "var(--shadow)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                              <div {...provided.dragHandleProps} style={{ color: "var(--gray-400)", cursor: "grab", paddingTop: 2 }}>
                                <GripVertical size={14} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="kanban-card-company">
                                  {deal.companyName || deal.company_name}
                                </div>
                                <div className="kanban-card-meta">
                                  <span style={{ fontWeight: 600, color: "var(--gray-700)" }}>
                                    R{deal.priceZar || deal.price_zar || 0}
                                  </span>
                                  {deal.contactName && <span>• {deal.contactName}</span>}
                                  {deal.templateName && <span>• {deal.templateName}</span>}
                                </div>
                                <div className="kanban-card-meta" style={{ marginTop: 4 }}>
                                  <span className="text-xs text-muted">
                                    {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {colDeals.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-sm text-muted" style={{ padding: "24px 8px", textAlign: "center" }}>
                        Drop deals here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}