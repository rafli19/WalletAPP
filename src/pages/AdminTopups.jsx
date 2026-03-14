import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import AdminLayout from "../components/AdminLayout";
import Icon, { icons } from "../components/Icon";
import api from "../services/api";
import { fmt, fmtDate } from "../services/format";

const exportExcel = (txs) => {
  const rows = txs.map((tx) => ({
    Nama: tx.user?.name || "-",
    Username: `@${tx.user?.username || "-"}`,
    Nominal: tx.amount,
    Status: "Berhasil",
    Waktu: fmtDate(tx.created_at),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Riwayat Top Up");
  XLSX.writeFile(wb, `riwayat-topup-${Date.now()}.xlsx`);
};

const AdminTopups = ({ user, onLogout }) => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTopups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/topups?status=approved");
      setTxs(res.data || []);
    } catch {
      setTxs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopups();
  }, [loadTopups]);

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Riwayat Top Up</h1>
        <p className="page-sub">Histori semua transaksi top up user</p>
      </div>

      <div className="panel">
        <div
          className="panel-title"
          style={{ justifyContent: "space-between" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d={icons.topup} size={16} />
            Top Up Berhasil
          </span>
          {txs.length > 0 && (
            <button
              className="btn-action btn-green"
              style={{ width: "auto", padding: "8px 16px", marginTop: 0 }}
              onClick={() => exportExcel(txs)}
            >
              <Icon d={icons.arrow} size={14} />
              Export Excel
            </button>
          )}
        </div>

        {loading && (
          <div className="loading-row">
            <span className="spinner light" />
          </div>
        )}

        {!loading && txs.length === 0 && (
          <div className="empty-state">Belum ada transaksi top up.</div>
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
                <th></th>
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
                    <span className="tx-type tx-in">Berhasil</span>
                  </td>
                  <td className="tx-date">{fmtDate(tx.created_at)}</td>
                  <td></td>
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
