import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import Icon, { icons } from "../components/Icon";
import api from "../services/api";
import { fmt, fmtDate } from "../services/format";

const STATUS_TABS = [
  { key: "approved", label: "Disetujui" },
  { key: "rejected", label: "Ditolak" },
];

const AdminTopups = ({ user, onLogout }) => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("approved");

  const loadTopups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/topups?status=${status}`);
      setTxs(res.data || []);
    } catch {
      setTxs([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadTopups();
  }, [loadTopups]);

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Riwayat Top Up</h1>
        <p className="page-sub">Histori semua transaksi top up user</p>
      </div>

      {/* Status Tabs */}
      <div className="admin-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${status === tab.key ? "active" : ""}`}
            onClick={() => setStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">
          <Icon d={icons.topup} size={16} />
          {status === "approved" ? "Top Up Disetujui" : "Top Up Ditolak"}
        </div>

        {loading && (
          <div className="loading-row">
            <span className="spinner light" />
          </div>
        )}

        {!loading && txs.length === 0 && (
          <div className="empty-state">Tidak ada data.</div>
        )}

        {/* Desktop */}
        {!loading && txs.length > 0 && (
          <table className="tx-table tx-table-desktop">
            <thead>
              <tr>
                <th>User</th>
                <th>Nominal</th>
                <th>Status</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {tx.user?.name || "-"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-dim)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      @{tx.user?.username}
                    </div>
                  </td>
                  <td className="tx-amount in">{fmt(tx.amount)}</td>
                  <td>
                    <span
                      className={`tx-type ${tx.status === "approved" ? "tx-in" : "tx-out"}`}
                    >
                      {tx.status === "approved" ? "Disetujui" : "Ditolak"}
                    </span>
                  </td>
                  <td className="tx-date">{fmtDate(tx.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Mobile */}
        {!loading && txs.length > 0 && (
          <div className="tx-card-list">
            {txs.map((tx) => (
              <div key={tx.id} className="tx-card">
                <div className="tx-card-left">
                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                    {tx.user?.name || "-"}
                  </span>
                  <span className="tx-desc">@{tx.user?.username}</span>
                </div>
                <div className="tx-card-right">
                  <span className="tx-amount in">{fmt(tx.amount)}</span>
                  <span className="tx-date">{fmtDate(tx.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTopups;
