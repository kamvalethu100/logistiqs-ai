import { useParams } from "react-router-dom";

export default function PreviewPage() {
  const { token } = useParams();

  return (
    <div className="preview-page">
      <div className="preview-header">
        <h1>🚛 Your Logistics Website Preview</h1>
        <p>Token: {token}</p>
        <p style={{ marginTop: 16 }}>This preview is for demonstration purposes.</p>
        <div style={{ marginTop: 32 }}>
          <div style={{
            background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)",
            padding: 32, maxWidth: 600, margin: "0 auto", boxShadow: "var(--shadow-lg)"
          }}>
            <h2 style={{ marginBottom: 16 }}>Interested in this website?</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              Fill in your details and we'll get in touch within 24 hours.
            </p>
            <form>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="john@company.co.za" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+27 82 123 4567" />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                I'm Interested
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}