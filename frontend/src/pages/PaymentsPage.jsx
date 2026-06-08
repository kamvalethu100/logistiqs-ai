import { useState, useEffect } from "react";
import api from "../api/client";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get("/payments").then((res) => setPayments(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 22 }}>Payments</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Amount</th>
            <th>Type</th>
            <th>Method</th>
            <th>Verified</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 && (
            <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 32 }}>No payments recorded.</td></tr>
          )}
          {payments.map((pmt) => (
            <tr key={pmt.id}>
              <td className="font-bold">R{pmt.amountZar || pmt.amount_zar}</td>
              <td><span className="badge badge-new">{(pmt.type || pmt.type)}</span></td>
              <td className="text-sm">{(pmt.method || pmt.method)?.toUpperCase()}</td>
              <td>
                <span className={`badge ${pmt.verified ? "badge-success" : "badge-warning"}`}>
                  {pmt.verified ? "Verified" : "Pending"}
                </span>
              </td>
              <td className="text-sm text-muted">{pmt.createdAt ? new Date(pmt.createdAt).toLocaleDateString() : "-"}</td>
              <td>
                {!pmt.verified && <button className="btn btn-sm btn-primary">Verify</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}