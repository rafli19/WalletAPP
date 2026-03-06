import { useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Icon, { icons } from "../components/Icon";
import useToast from "../hooks/useToast";
import useWallet from "../hooks/useWallet";
import api from "../services/api";
import { validateNominal } from "../services/validation";
import { fmt } from "../services/format";

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

const QUICK_AMOUNTS = [
  { label: "50K", value: 50_000 },
  { label: "100K", value: 100_000 },
  { label: "200K", value: 200_000 },
  { label: "500K", value: 500_000 },
];

const Topup = ({ user, onLogout }) => {
  const { toasts, addToast } = useToast();
  const { balance, refetch } = useWallet();

  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setAmount(e.target.value);
    setErr("");
  };

  const handleQuickAmount = (value) => {
    setAmount(String(value));
    setErr("");
  };

  const handleConfirm = () => {
    const errMsg = validateNominal(amount);
    if (errMsg) {
      setErr(errMsg);
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await api.post("/topup", { amount: parseInt(amount, 10) });
      refetch?.();
      setShowSuccess(true);
      addToast("Top-up berhasil!", "success");
    } catch (e) {
      const msg =
        e?.data?.message || e?.data?.errors?.amount?.[0] || "Top-up gagal.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setAmount("");
  };

  const formattedBalance =
    balance === null ? "..." : new Intl.NumberFormat("id-ID").format(balance);

  return (
    <Layout user={user} onLogout={onLogout}>
      <ToastContainer toasts={toasts} />

      <Modal show={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="modal-icon modal-icon-green">
          <Icon d={icons.topup} size={24} />
        </div>
        <h2 className="modal-title">Konfirmasi Top Up</h2>
        <p className="modal-sub">Kamu akan menambahkan saldo sebesar</p>
        <div className="modal-amount">{fmt(parseInt(amount, 10) || 0)}</div>
        <div className="modal-actions">
          <button
            className="modal-btn-cancel"
            onClick={() => setShowConfirm(false)}
          >
            Batal
          </button>
          <button
            className="modal-btn-confirm btn-green"
            onClick={handleSubmit}
          >
            Ya, Top Up
          </button>
        </div>
      </Modal>

      <Modal show={showSuccess} onClose={handleSuccessClose}>
        <div className="modal-icon modal-icon-green">
          <Icon d={icons.check} size={24} />
        </div>
        <h2 className="modal-title">Top Up Berhasil!</h2>
        <p className="modal-sub">Saldo kamu berhasil ditambahkan sebesar</p>
        <div className="modal-amount">{fmt(parseInt(amount, 10) || 0)}</div>
        <div className="modal-actions">
          <button
            className="modal-btn-confirm btn-green"
            onClick={handleSuccessClose}
          >
            Selesai
          </button>
        </div>
      </Modal>

      <div className="page-header">
        <h1 className="page-title">Top Up</h1>
        <p className="page-sub">Tambah saldo wallet kamu</p>
      </div>

      <div className="balance-card" style={{ maxWidth: 480, marginBottom: 20 }}>
        <div>
          <div className="balance-label">Saldo Saat Ini</div>
          <div className="balance-amount">
            <span>Rp</span> {formattedBalance}
          </div>
        </div>
        <div className="balance-icon">
          <Icon d={icons.wallet} size={28} />
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 480 }}>
        <div className="panel-title">
          <Icon d={icons.topup} size={16} />
          Nominal Top Up
        </div>

        <div className="quick-amounts">
          {QUICK_AMOUNTS.map(({ label, value }) => (
            <button
              key={value}
              className={`quick-amount-btn ${amount === String(value) ? "active" : ""}`}
              onClick={() => handleQuickAmount(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="form-field">
          <label>Atau masukkan nominal lain (IDR)</label>
          <input
            type="text"
            className={err ? "error" : ""}
            placeholder="Contoh: 100000"
            value={amount}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
          {err && <div className="form-err">{err}</div>}
        </div>

        <button
          className="btn-action btn-green"
          onClick={handleConfirm}
          disabled={loading || !amount}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <Icon d={icons.topup} size={16} />
          )}
          {loading ? "Memproses..." : "Top Up Sekarang"}
        </button>
      </div>
    </Layout>
  );
};

export default Topup;
