import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import Icon, { icons } from "../components/Icon";
import Modal from "../components/Modal";
import useToast from "../hooks/useToast";
import api from "../services/api";
import { fmt, fmtDate } from "../services/format";

const ToastContainer = ({ toasts }) => (
  <div className="toast-wrap">
    {toasts.map((t) => (
      <div key={t.id} className={`toast ${t.type}`}>
        <div className="toast-dot" />
        <span>{t.msg}</span>
      </div>
    ))}
  </div>
);

const STATUS_TABS = [
  { key: "pending", label: "Menunggu" },
  { key: "approved", label: "Disetujui" },
  { key: "rejected", label: "Ditolak" },
];

const AdminTopups = ({ user, onLogout }) => {
  const { toasts, addToast } = useToast();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [confirm, setConfirm] = useState(null);
  const [processing, setProcessing] = useState(false);

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

  const handleAction = async () => {
    if (!confirm) return;
    setProcessing(true);
    try {
      await api.post(`/admin/topups/${confirm.id}/${confirm.action}`);
      addToast(
        confirm.action === "approve" ? "Top up disetujui!" : "Top up ditolak.",
        confirm.action === "approve" ? "success" : "error",
      );
      setConfirm(null);
      loadTopups();
    } catch {
      addToast("Gagal memproses, coba lagi.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      <ToastContainer toasts={toasts} />

      {/* Confirm Modal */}
      <Modal show={!!confirm} onClose={() => setConfirm(null)}>
        <div
          className={`modal-icon ${confirm?.action === "approve" ? "modal-icon-green" : "modal-icon-red"}`}
        >
          <Icon
            d={confirm?.action === "approve" ? icons.check : icons.topup}
            size={24}
          />
        </div>
        <h2 className="modal-title">
          {confirm?.action === "approve" ? "Setujui Top Up?" : "Tolak Top Up?"}
        </h2>
        <p className="modal-sub">
          {confirm?.action === "approve"
            ? "Saldo user akan langsung bertambah setelah disetujui."
            : "Top up akan dibatalkan dan saldo tidak akan bertambah."}
        </p>
        <p className="modal-recipient">{confirm?.name}</p>
        <div className="modal-amount">{fmt(confirm?.amount || 0)}</div>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={() => setConfirm(null)}>
            Batal
          </button>
          <button
            className={`modal-btn-confirm ${confirm?.action === "approve" ? "btn-green" : "btn-red"}`}
            onClick={handleAction}
            disabled={processing}
          >
            {processing ? <span className="spinner" /> : null}
            {confirm?.action === "approve" ? "Ya, Setujui" : "Ya, Tolak"}
          </button>
        </div>
      </Modal>

      <div className="page-header">
        <h1 className="page-title">Riwayat Top Up</h1>
        <p className="page-sub">Konfirmasi dan kelola permintaan top up user</p>
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
          {status === "pending"
            ? "Menunggu Konfirmasi"
            : status === "approved"
              ? "Sudah Disetujui"
              : "Ditolak"}
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
                {status === "pending" && <th>Aksi</th>}
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
                      className={`tx-type ${tx.status === "approved" ? "tx-in" : tx.status === "rejected" ? "tx-out" : "tx-pending"}`}
                    >
                      {tx.status === "approved"
                        ? "Disetujui"
                        : tx.status === "rejected"
                          ? "Ditolak"
                          : "Pending"}
                    </span>
                  </td>
                  <td className="tx-date">{fmtDate(tx.created_at)}</td>
                  {status === "pending" && (
                    <td>
                      <div className="admin-action-btns">
                        <button
                          className="admin-btn-approve"
                          onClick={() =>
                            setConfirm({
                              id: tx.id,
                              action: "approve",
                              name: tx.user?.name,
                              amount: tx.amount,
                            })
                          }
                        >
                          Setujui
                        </button>
                        <button
                          className="admin-btn-reject"
                          onClick={() =>
                            setConfirm({
                              id: tx.id,
                              action: "reject",
                              name: tx.user?.name,
                              amount: tx.amount,
                            })
                          }
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Mobile */}
        {!loading && txs.length > 0 && (
          <div className="tx-card-list">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="tx-card"
                style={{
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
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
                  </div>
                  <span className="tx-amount in">{fmt(tx.amount)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    className={`tx-type ${tx.status === "approved" ? "tx-in" : tx.status === "rejected" ? "tx-out" : "tx-pending"}`}
                  >
                    {tx.status === "approved"
                      ? "Disetujui"
                      : tx.status === "rejected"
                        ? "Ditolak"
                        : "Pending"}
                  </span>
                  <span className="tx-date">{fmtDate(tx.created_at)}</span>
                </div>
                {status === "pending" && (
                  <div className="admin-action-btns">
                    <button
                      className="admin-btn-approve"
                      onClick={() =>
                        setConfirm({
                          id: tx.id,
                          action: "approve",
                          name: tx.user?.name,
                          amount: tx.amount,
                        })
                      }
                    >
                      Setujui
                    </button>
                    <button
                      className="admin-btn-reject"
                      onClick={() =>
                        setConfirm({
                          id: tx.id,
                          action: "reject",
                          name: tx.user?.name,
                          amount: tx.amount,
                        })
                      }
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTopups;
