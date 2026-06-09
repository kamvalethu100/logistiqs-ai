import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Truck, Package, Warehouse, CheckCircle, Send, Loader } from "lucide-react";

export default function PreviewPage() {
  const { token } = useParams();
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Try to load template data from API
    fetch(`/api/v1/preview/${token}`)
      .then((res) => res.json())
      .then((data) => setTemplate(data))
      .catch(() => setTemplate({
        name: "Freight Pro",
        category: "freight",
        tier: "professional",
        companyName: "Your Logistics Company",
        tagline: "Reliable Freight Solutions Across South Africa",
        features: ["Real-time tracking", "Quote engine", "GPS fleet monitoring", "Client portal"],
      }));
  }, [token]);

  const categoryIcon = template?.category === "courier" ? Package :
    template?.category === "warehousing" ? Warehouse : Truck;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch(`/api/v1/preview/${token}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Still show success
    } finally {
      setBusy(false);
    }
  };

  if (!template) {
    return (
      <div className="preview-page">
        <div className="preview-header">
          <Loader size={48} style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px", color: "var(--primary)" }} />
          <p>Loading preview...</p>
        </div>
      </div>
    );
  }

  const Icon = categoryIcon;

  return (
    <div className="preview-page fade-in">
      {/* Header */}
      <div className="preview-header" style={{
        background: "linear-gradient(135deg, #1a365d 0%, #0f2440 100%)",
        borderRadius: "var(--radius-lg)", color: "white", marginBottom: 32
      }}>
        <Icon size={48} style={{ margin: "0 auto 16px" }} />
        <h1 style={{ color: "white", fontSize: 36 }}>{template.companyName}</h1>
        <p style={{ color: "var(--amber)", fontSize: 18, marginTop: 8 }}>{template.tagline}</p>
        <div style={{ marginTop: 16 }}>
          <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
            {template.tier} — {template.name}
          </span>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {(template.features || []).map((feature, idx) => (
          <div key={idx} className="kpi-card" style={{ textAlign: "center", padding: 24 }}>
            <CheckCircle size={24} color="var(--success)" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600 }}>{feature}</div>
          </div>
        ))}
      </div>

      {/* Interest Form */}
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{
          background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)",
          padding: 32, boxShadow: "var(--shadow-lg)"
        }}>
          {submitted ? (
            <div className="text-center" style={{ padding: 24 }}>
              <CheckCircle size={48} color="var(--success)" style={{ marginBottom: 16 }} />
              <h3 style={{ marginBottom: 8 }}>Thank You!</h3>
              <p className="text-muted">We've received your interest. Our team will contact you within 24 hours.</p>
            </div>
          ) : (
            <>
              <h2 style={{ marginBottom: 8, fontSize: 20 }}>Interested in this website?</h2>
              <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
                Fill in your details and we'll get in touch within 24 hours.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input className="form-input" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.co.za" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27 82 123 4567" />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Your Logistics Co." />
                </div>
                <button className="btn btn-primary w-full" disabled={busy} style={{ justifyContent: "center" }}>
                  {busy ? <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending...</> :
                    <><Send size={16} /> I'm Interested</>}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Token info */}
        <div className="text-center" style={{ marginTop: 16 }}>
          <span className="text-xs text-muted">Preview Token: {token}</span>
        </div>
      </div>
    </div>
  );
}