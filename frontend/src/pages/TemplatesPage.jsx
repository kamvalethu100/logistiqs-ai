import { useState, useEffect } from "react";
import api from "../api/client";
import { Plus, X, Edit2, Trash2 } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", tier: "starter",
    priceZar: "", depositZar: "", category: "freight"
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/templates")
      .then((res) => setTemplates(res.data))
      .catch(() => setTemplates([]));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", tier: "starter", priceZar: "", depositZar: "", category: "freight" });
    setShowForm(true);
  };

  const openEdit = (tpl) => {
    setEditing(tpl.id);
    setForm({
      name: tpl.name || "",
      slug: tpl.slug || "",
      description: tpl.description || "",
      tier: tpl.tier || "starter",
      priceZar: tpl.priceZar || tpl.price_zar || "",
      depositZar: tpl.depositZar || tpl.deposit_zar || "",
      category: tpl.category || "freight",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, priceZar: Number(form.priceZar), depositZar: Number(form.depositZar) };
      if (editing) {
        const res = await api.patch(`/templates/${editing}`, payload);
        setTemplates(templates.map((t) => t.id === editing ? res.data : t));
      } else {
        const res = await api.post("/templates", payload);
        setTemplates([...templates, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save template");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    try {
      await api.delete(`/templates/${id}`);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete template");
    }
  };

  const tierBadge = (tier) => {
    const map = {
      starter: "badge-new",
      professional: "badge-warning",
      enterprise: "badge-danger",
    };
    return `badge ${map[tier] || "badge-new"}`;
  };

  const categoryIcon = (cat) => {
    const icons = { freight: "🚛", courier: "📦", warehousing: "🏭" };
    return icons[cat] || "📄";
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Templates</h2>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Template
        </button>
      </div>

      {/* Summary stats */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-card-label">Total Templates</div>
          <div className="kpi-card-value">{templates.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Starter</div>
          <div className="kpi-card-value">{templates.filter((t) => t.tier === "starter").length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Professional</div>
          <div className="kpi-card-value">{templates.filter((t) => t.tier === "professional").length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Enterprise</div>
          <div className="kpi-card-value">{templates.filter((t) => t.tier === "enterprise").length}</div>
        </div>
      </div>

      {/* Template cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {templates.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <div className="empty-state-icon">🎨</div>
            <div className="empty-state-title">No templates yet</div>
            <div className="empty-state-desc">Add your first logistics website template.</div>
          </div>
        )}
        {templates.map((tpl) => (
          <div key={tpl.id} className="kpi-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{categoryIcon(tpl.category)}</div>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{tpl.name}</h3>
              <span className={tierBadge(tpl.tier)}>{tpl.tier}</span>
            </div>
            <div className="text-sm text-muted" style={{ marginBottom: 12, minHeight: 40 }}>
              {tpl.description || tpl.slug || "No description"}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold" style={{ fontSize: 18 }}>R{tpl.priceZar || tpl.price_zar || 0}</div>
                <div className="text-xs text-muted">Deposit: R{tpl.depositZar || tpl.deposit_zar || 0}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(tpl)}>
                  <Edit2 size={12} />
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tpl.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? "Edit Template" : "Add Template"}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Template Name *</label>
                <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="freight-pro" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="freight">Freight</option>
                    <option value="courier">Courier</option>
                    <option value="warehousing">Warehousing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tier</label>
                  <select className="form-select" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price (ZAR) *</label>
                  <input className="form-input" type="number" required value={form.priceZar} onChange={(e) => setForm({ ...form, priceZar: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Deposit (ZAR) *</label>
                  <input className="form-input" type="number" required value={form.depositZar} onChange={(e) => setForm({ ...form, depositZar: e.target.value })} />
                </div>
              </div>
              <button className="btn btn-primary w-full" disabled={busy} style={{ justifyContent: "center" }}>
                {busy ? "Saving..." : editing ? "Update Template" : "Create Template"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}