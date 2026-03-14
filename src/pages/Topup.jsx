import { useState } from "react";
import Layout from "../components/Layout";
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

  const formattedBalance =
    balance === null ? "..." : new Intl.NumberFormat("id-ID").format(balance);

  const handleChange = (e) => {
    setAmount(e.target.value);
    setErr("");
  };

  const handleQuickAmount = (v) => {
    setAmount(String(v));
    setErr("");
  };

  const handleSubmit = async () => {
    const errMsg = validateNominal(amount);
    if (errMsg) {
      setErr(errMsg);
      return;
    }
    setLoading(true);
    try {
      await api.post("/topup", { amount: parseInt(amount, 10) });
      addToast("Top up berhasil! Saldo telah ditambahkan.", "success");
      setAmount("");
      refetch();
    } catch (e) {
      const msg =
        e?.data?.message || e?.data?.errors?.amount?.[0] || "Top-up gagal.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <h1 className="page-title">Top Up</h1>
        <p className="page-sub">Tambah saldo wallet kamu</p>
      </div>

      <div className="two-col-layout">
        <div className="two-col-main">
          {/* Balance */}
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

          {/* Form */}
          <div className="panel">
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
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {err && <div className="form-err">{err}</div>}
            </div>

            <button
              className="btn-action btn-green"
              onClick={handleSubmit}
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
        </div>

        {/* Side info */}
        <div className="two-col-side">
          <div className="panel">
            <div className="panel-title">
              <Icon d={icons.history} size={16} />
              Ketentuan
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 4,
              }}
            >
              {[
                "Minimal top up Rp 1.000",
                "Maksimal top up Rp 50.000.000",
                "Saldo langsung masuk setelah top up",
                "Hanya bilangan bulat yang diterima",
              ].map((t, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
                >
                  <span
                    style={{
                      color: "var(--accent)",
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                  >
                    ·
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-dim)",
                      lineHeight: 1.5,
                    }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Topup;
