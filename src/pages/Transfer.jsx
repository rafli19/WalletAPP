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

const INITIAL_FORM = { identifier: "", amount: "" };

const QUICK_AMOUNTS = [
  { label: "50K", value: 50_000 },
  { label: "100K", value: 100_000 },
  { label: "200K", value: 200_000 },
  { label: "500K", value: 500_000 },
];

const validateForm = (form) => {
  const errors = {};
  if (!form.identifier.trim()) {
    errors.identifier = "Email atau nomor HP penerima wajib diisi.";
  }
  const amountErr = validateNominal(form.amount);
  if (amountErr) errors.amount = amountErr;
  return errors;
};

const Transfer = ({ user, onLogout }) => {
  const { toasts, addToast } = useToast();
  const { balance, refetch } = useWallet();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "", global: "" }));
    if (key === "identifier") setReceiver(null);
  };

  const handleQuickAmount = (value) => {
    setForm((prev) => ({ ...prev, amount: String(value) }));
    setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const handleIdentifierBlur = async () => {
    const id = form.identifier.trim();
    if (!id) return;

    setLookupLoading(true);
    setReceiver(null);
    try {
      const res = await api.get(
        `/user/lookup?identifier=${encodeURIComponent(id)}`,
      );
      setReceiver(res?.data || res);
      setErrors((prev) => ({ ...prev, identifier: "" }));
    } catch (e) {
      const msg = e?.data?.message || "Pengguna tidak ditemukan.";
      setErrors((prev) => ({ ...prev, identifier: msg }));
    } finally {
      setLookupLoading(false);
    }
  };

  const handleConfirm = () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await api.post("/transfer", {
        identifier: form.identifier,
        amount: parseInt(form.amount, 10),
      });
      setSuccessData(res.data || res);
      refetch?.();
      setShowSuccess(true);
      addToast("Transfer berhasil!", "success");
    } catch (e) {
      const msg =
        e?.data?.message ||
        (e?.data?.errors ? Object.values(e.data.errors).flat()[0] : "") ||
        "Transfer gagal.";
      setErrors((prev) => ({ ...prev, global: msg }));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSuccessData(null);
    setReceiver(null);
    setForm(INITIAL_FORM);
  };

  const formattedBalance =
    balance === null ? "..." : new Intl.NumberFormat("id-ID").format(balance);

  return (
    <Layout user={user} onLogout={onLogout}>
      <ToastContainer toasts={toasts} />

      <Modal show={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="modal-icon modal-icon-accent">
          <Icon d={icons.transfer} size={24} />
        </div>
        <h2 className="modal-title">Konfirmasi Transfer</h2>
        <p className="modal-sub">Kamu akan mengirim saldo ke</p>
        <div className="modal-recipient">
          {receiver?.name || form.identifier}
        </div>
        {receiver?.username && (
          <div className="modal-sub" style={{ fontSize: 12, marginBottom: 0 }}>
            @{receiver.username}
          </div>
        )}
        <div className="modal-amount">
          {fmt(parseInt(form.amount, 10) || 0)}
        </div>
        <div className="modal-actions">
          <button
            className="modal-btn-cancel"
            onClick={() => setShowConfirm(false)}
          >
            Batal
          </button>
          <button
            className="modal-btn-confirm btn-accent"
            onClick={handleSubmit}
          >
            Ya, Kirim
          </button>
        </div>
      </Modal>

      <Modal show={showSuccess} onClose={handleSuccessClose}>
        <div className="modal-icon modal-icon-green">
          <Icon d={icons.check} size={24} />
        </div>
        <h2 className="modal-title">Transfer Berhasil!</h2>
        <p className="modal-sub">
          Berhasil dikirim ke{" "}
          <span className="modal-highlight">
            {successData?.receiver_name || form.identifier}
          </span>
        </p>
        <div className="modal-amount">
          {fmt(parseInt(form.amount, 10) || 0)}
        </div>
        <div className="modal-actions">
          <button
            className="modal-btn-confirm btn-accent"
            onClick={handleSuccessClose}
          >
            Selesai
          </button>
        </div>
      </Modal>

      <div className="page-header">
        <h1 className="page-title">Transfer</h1>
        <p className="page-sub">Kirim saldo ke pengguna lain</p>
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
          <Icon d={icons.transfer} size={16} />
          Detail Transfer
        </div>

        {errors.global && <div className="global-err">{errors.global}</div>}

        <div className="form-field">
          <label>Email / No. HP Penerima</label>
          <input
            type="text"
            className={errors.identifier ? "error" : ""}
            placeholder="Masukkan email atau nomor telepon penerima"
            value={form.identifier}
            onChange={handleChange("identifier")}
            onBlur={handleIdentifierBlur}
          />
          {lookupLoading && (
            <div className="receiver-lookup">
              <span
                className="spinner light"
                style={{ width: 12, height: 12 }}
              />
              <span>Mencari pengguna...</span>
            </div>
          )}
          {receiver && !lookupLoading && (
            <div className="receiver-found">
              <div className="receiver-avatar">
                <Icon d={icons.user} size={14} />
              </div>
              <div>
                <div className="receiver-name">{receiver.name}</div>
                <div className="receiver-username">@{receiver.username}</div>
              </div>
            </div>
          )}
          {errors.identifier && (
            <div className="form-err">{errors.identifier}</div>
          )}
        </div>

        <div className="quick-amounts">
          {QUICK_AMOUNTS.map(({ label, value }) => (
            <button
              key={value}
              className={`quick-amount-btn ${form.amount === String(value) ? "active" : ""}`}
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
            className={errors.amount ? "error" : ""}
            placeholder="Contoh: 50000"
            value={form.amount}
            onChange={handleChange("amount")}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
          {errors.amount && <div className="form-err">{errors.amount}</div>}
        </div>

        <button
          className="btn-action btn-accent"
          onClick={handleConfirm}
          disabled={loading || !form.identifier || !form.amount}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <Icon d={icons.arrow} size={16} />
          )}
          {loading ? "Memproses..." : "Kirim Sekarang"}
        </button>
      </div>
    </Layout>
  );
};

export default Transfer;
