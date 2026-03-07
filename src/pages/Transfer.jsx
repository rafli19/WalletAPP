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
  if (!form.identifier.trim())
    errors.identifier = "Email atau nomor HP penerima wajib diisi.";
  const amountErr = validateNominal(form.amount);
  if (amountErr) errors.amount = amountErr;
  return errors;
};

const TIPS = [
  "Pastikan email / No. HP penerima sudah terdaftar di WalletApp",
  "Transfer langsung masuk ke saldo penerima tanpa perlu konfirmasi",
  "Transfer tidak bisa dibatalkan setelah dikonfirmasi",
  "Maksimal transfer Rp 50.000.000 per transaksi",
];

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
      setErrors((prev) => ({
        ...prev,
        identifier: e?.data?.message || "Pengguna tidak ditemukan.",
      }));
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

      <div className="two-col-layout">
        <div className="two-col-main">
          <div className="balance-card" style={{ marginBottom: 20 }}>
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

          <div className="panel">
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
                    <div className="receiver-username">
                      @{receiver.username}
                    </div>
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
        </div>

        <div className="two-col-side">
          <div className="panel">
            <div className="panel-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="16"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--accent)" }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Tips Transfer
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 4,
              }}
            >
              {TIPS.map((tip, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <span
                    style={{
                      color: "var(--accent)",
                      fontSize: 18,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-dim)",
                      lineHeight: 1.5,
                    }}
                  >
                    {tip}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="16"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--accent)" }}
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Butuh Bantuan?
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-dim)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Jika transfer gagal atau saldo tidak masuk dalam 1×24 jam, hubungi
              tim support kami.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Transfer;
