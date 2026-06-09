import { useState, useEffect } from "react";
import api from "../api/client";
import { CheckCircle, XCircle, Eye, X, Search } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [proofUrl, setProofUrl] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api.get("/payments")
      .then((res) => setPayments(res.data))
      .catch(() => setPayments([]));
  }, []);

  const handleVerify = async (id) => {
    setBusyId(id);
    try {
      await api.patch(`/payments/${id}/verify`);
      setPayments(payments.map((p) => p.id === id ? { ...p, verified: true } : p));
    } catch (err) {
      alert("Failed to verify payment");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      await api.patch(`/payments/${id}/reject`);
      setPayments(payments.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to reject payment");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = payments.filter((pmt) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (pmt.companyName || pmt.company_name || "").toLowerCase().includes(q) ||
      (pmt.reference || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Payments</h2>
      </div>

      <div className="search-bar">
        <Search size={18} color="var(--gray-400)" />
        <input
          className="search-input"
          placeholder="Search by company or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="text-sm text-muted" style={{ marginBottom: 8 }}>
        {filtered.length} payment{filtered.length !== 1 ? "s" : ""}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Reference</th>
            <th>Proof</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-state-icon">💰</div>
                  <div className="empty-state-title">No payments found</div>
                  <div className="empty-state-desc">Payments will appear here once clients start paying.</div>
                </div>
              </td>
            </tr>
          )}
          {filtered.map((pmt) => (
            <tr key={pmt.id}>
              <td><strong>{pmt.companyName || pmt.company_name || "-"}</strong></td>
              <td className="font-bold">R{pmt.amountZar || pmt.amount_zar || 0}</td>
              <td>
                <span className={`badge ${
                  (pmt.type || "") === "deposit" ? "badge-amber" :
                  (pmt.type || "") === "final" ? "badge-success" : "badge-new"
                }`}>
                  {pmt.type || "payment"}
                </span>
              </td>
              <td className="text-sm">{pmt.reference || "-"}</td>
              <td>
                {pmt.proofUrl || pmt.proof_url ? (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setProofUrl(pmt.proofUrl || pmt.proof_url)}
                  >
                    <Eye size={14} /> View
                  </button>
                ) : (
                  <span className="text-xs text-muted">No proof</span>
                )}
              </td>
              <td>
                <span className={`badge ${pmt.verified ? "badge-success" : "badge-warning"}`}>
                  {pmt.verified ? "Verified" : "Pending"}
                </span>
              </td>
              <td className="text-sm text-muted">
                {pmt.createdAt ? new Date(pmt.createdAt).toLocaleDateString() : "-"}
              </td>
              <td>
                <div style={{ display: "flex", gap: 4 }}>
                  {!pmt.verified && (
                    <>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleVerify(pmt.id)}
                        disabled={busyId === pmt.id}
                      >
                        <CheckCircle size={12} /> Verify
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleReject(pmt.id)}
                        disabled={busyId === pmt.id}
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Proof Image Viewer Modal */}
      {proofUrl && (
        <div className="modal-overlay" onClick={() => setProofUrl(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3 className="modal-title">Payment Proof</h3>
              <button className="modal-close" onClick={() => setProofUrl(null)}><X size={20} /></button>
            </div>
            <div className="proof-image-container">
              <img src={proofUrl} alt="Payment proof" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}