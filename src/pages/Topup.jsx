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

const PAYMENT_METHODS = [
  {
    id: "qris",
    label: "QRIS",
    sub: "Bayar dengan scan QR",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        width="22"
        height="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M14 21v-2" />
      </svg>
    ),
  },
  {
    id: "mbanking",
    label: "Transfer M-Banking",
    sub: "BCA, Mandiri, BRI, BNI, dll",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        width="22"
        height="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01M9 7h6M9 11h6" />
      </svg>
    ),
  },
  {
    id: "va",
    label: "Virtual Account",
    sub: "Transfer via nomor VA",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        width="22"
        height="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h4M14 15h4" />
      </svg>
    ),
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    sub: "GoPay, OVO, DANA, dll",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        width="22"
        height="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 12V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
      </svg>
    ),
  },
];

const generateCode = (method) => {
  const rand = () => Math.floor(Math.random() * 9000 + 1000);
  if (method === "va") return `8277-${rand()}-${rand()}-${rand()}`;
  if (method === "mbanking") return `${rand()} ${rand()} ${rand()}`;
  if (method === "ewallet")
    return `08${Math.floor(Math.random() * 900000000 + 100000000)}`;
  return null;
};

const FakeQR = () => (
  <svg
    viewBox="0 0 200 200"
    width="180"
    height="180"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="200" height="200" fill="#ffffff" rx="8" />
    <rect x="10" y="10" width="60" height="60" rx="4" fill="#0a0a0f" />
    <rect x="18" y="18" width="44" height="44" rx="2" fill="#ffffff" />
    <rect x="24" y="24" width="32" height="32" rx="1" fill="#0a0a0f" />
    <rect x="130" y="10" width="60" height="60" rx="4" fill="#0a0a0f" />
    <rect x="138" y="18" width="44" height="44" rx="2" fill="#ffffff" />
    <rect x="144" y="24" width="32" height="32" rx="1" fill="#0a0a0f" />
    <rect x="10" y="130" width="60" height="60" rx="4" fill="#0a0a0f" />
    <rect x="18" y="138" width="44" height="44" rx="2" fill="#ffffff" />
    <rect x="24" y="144" width="32" height="32" rx="1" fill="#0a0a0f" />
    {[80, 88, 96, 104, 112, 120].map((x) =>
      [
        10, 18, 26, 34, 42, 50, 58, 80, 88, 96, 104, 112, 120, 130, 138, 146,
        154, 162, 170, 178,
      ].map((y) =>
        Math.sin(x * y) > 0.2 ? (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="7"
            height="7"
            fill="#0a0a0f"
          />
        ) : null,
      ),
    )}
    {[10, 18, 26, 34, 42, 50, 58].map((x) =>
      [80, 88, 96, 104, 112, 120].map((y) =>
        Math.cos(x + y) > 0.1 ? (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="7"
            height="7"
            fill="#0a0a0f"
          />
        ) : null,
      ),
    )}
    {[130, 138, 146, 154, 162, 170, 178].map((x) =>
      [80, 88, 96, 104, 112, 120].map((y) =>
        Math.sin(x - y) > 0 ? (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="7"
            height="7"
            fill="#0a0a0f"
          />
        ) : null,
      ),
    )}
  </svg>
);

const PaymentInstruction = ({
  method,
  code,
  amount,
  onConfirm,
  onCancel,
  loading,
}) => (
  <div className="payment-instruction">
    <div className="payment-instruction-header">
      <div className="payment-instruction-icon">{method.icon}</div>
      <div>
        <div className="payment-instruction-title">{method.label}</div>
        <div className="payment-instruction-amount">
          {fmt(parseInt(amount, 10) || 0)}
        </div>
      </div>
    </div>
    {method.id === "qris" ? (
      <div className="qr-wrap">
        <FakeQR />
        <p className="qr-hint">
          Scan QR code ini menggunakan aplikasi pembayaran kamu
        </p>
      </div>
    ) : (
      <div className="va-wrap">
        <div className="va-label">
          {method.id === "mbanking" && "Nomor Rekening Tujuan"}
          {method.id === "va" && "Nomor Virtual Account"}
          {method.id === "ewallet" && "Nomor Tujuan"}
        </div>
        <div className="va-code">{code}</div>
        <div className="va-bank">
          {method.id === "mbanking" && "Bank WalletApp"}
          {method.id === "va" && "WalletApp Virtual Account"}
          {method.id === "ewallet" && "WalletApp Pay"}
        </div>
        <p className="va-hint">
          Transfer tepat sesuai nominal di atas. Pembayaran akan diverifikasi
          oleh admin.
        </p>
      </div>
    )}
    <div className="payment-instruction-actions">
      <button className="modal-btn-cancel" onClick={onCancel}>
        Batal
      </button>
      <button
        className="modal-btn-confirm btn-green"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? <span className="spinner" /> : null}
        {loading ? "Memproses..." : "Saya Sudah Bayar"}
      </button>
    </div>
  </div>
);

const HOW_IT_WORKS = [
  { icon: "1", text: "Pilih nominal dan metode pembayaran" },
  { icon: "2", text: "Lakukan pembayaran sesuai instruksi" },
  { icon: "3", text: 'Klik "Saya Sudah Bayar" untuk konfirmasi' },
  { icon: "4", text: "Admin akan verifikasi dan saldo ditambahkan" },
];

const Topup = ({ user, onLogout }) => {
  const { toasts, addToast } = useToast();
  const { balance } = useWallet();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [payCode, setPayCode] = useState(null);

  const handleChange = (e) => {
    setAmount(e.target.value);
    setErr("");
  };
  const handleQuickAmount = (v) => {
    setAmount(String(v));
    setErr("");
  };

  const handleProceed = () => {
    const errMsg = validateNominal(amount);
    if (errMsg) {
      setErr(errMsg);
      return;
    }
    if (!method) {
      setErr("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    setPayCode(generateCode(method));
    setStep("payment");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/topup", {
        amount: parseInt(amount, 10),
        payment_method: method,
      });
      setStep("pending");
      addToast("Permintaan top up terkirim!", "success");
    } catch (e) {
      const msg =
        e?.data?.message || e?.data?.errors?.amount?.[0] || "Top-up gagal.";
      setErr(msg);
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setAmount("");
    setMethod(null);
    setPayCode(null);
    setErr("");
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method);
  const formattedBalance =
    balance === null ? "..." : new Intl.NumberFormat("id-ID").format(balance);

  return (
    <Layout user={user} onLogout={onLogout}>
      <ToastContainer toasts={toasts} />

      <Modal show={step === "pending"} onClose={handleReset}>
        <div
          className="modal-icon"
          style={{
            background: "rgba(232,255,60,0.12)",
            color: "var(--accent)",
            border: "1px solid rgba(232,255,60,0.2)",
            width: 64,
            height: 64,
            borderRadius: 20,
            display: "grid",
            placeItems: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="28"
            height="28"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h2 className="modal-title">Menunggu Konfirmasi</h2>
        <p className="modal-sub">Permintaan top up kamu sebesar</p>
        <div className="modal-amount" style={{ color: "var(--accent)" }}>
          {fmt(parseInt(amount, 10) || 0)}
        </div>
        <p className="modal-sub" style={{ marginBottom: 24 }}>
          sedang menunggu konfirmasi admin. Saldo akan bertambah setelah
          disetujui.
        </p>
        <div className="modal-actions">
          <button
            className="modal-btn-confirm btn-accent"
            onClick={handleReset}
          >
            Oke, Mengerti
          </button>
        </div>
      </Modal>

      <div className="page-header">
        <h1 className="page-title">Top Up</h1>
        <p className="page-sub">Tambah saldo wallet kamu</p>
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

          {step === "form" && (
            <>
              <div className="panel" style={{ marginBottom: 16 }}>
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
                    onKeyDown={(e) => e.key === "Enter" && handleProceed()}
                  />
                  {err && <div className="form-err">{err}</div>}
                </div>
              </div>

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
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  Metode Pembayaran
                </div>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      className={`payment-method-btn ${method === m.id ? "active" : ""}`}
                      onClick={() => {
                        setMethod(m.id);
                        setErr("");
                      }}
                    >
                      <div className="payment-method-icon">{m.icon}</div>
                      <div className="payment-method-info">
                        <span className="payment-method-label">{m.label}</span>
                        <span className="payment-method-sub">{m.sub}</span>
                      </div>
                      <div className="payment-method-radio">
                        {method === m.id && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            width="12"
                            height="12"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  className="btn-action btn-green"
                  style={{ marginTop: 20 }}
                  onClick={handleProceed}
                  disabled={!amount}
                >
                  <Icon d={icons.topup} size={16} />
                  Lanjut Pembayaran
                </button>
              </div>
            </>
          )}

          {step === "payment" && selectedMethod && (
            <div className="panel">
              <PaymentInstruction
                method={selectedMethod}
                code={payCode}
                amount={amount}
                loading={loading}
                onConfirm={handleSubmit}
                onCancel={() => setStep("form")}
              />
            </div>
          )}
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
              Cara Top Up
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 4,
              }}
            >
              {HOW_IT_WORKS.map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <div
                    style={{
                      minWidth: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(232,255,60,0.1)",
                      border: "1px solid rgba(232,255,60,0.2)",
                      color: "var(--accent)",
                      fontWeight: 800,
                      fontSize: 12,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-dim)",
                      lineHeight: 1.5,
                      paddingTop: 4,
                    }}
                  >
                    {item.text}
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
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
                "Saldo hanya aktif setelah dikonfirmasi admin",
                "Proses konfirmasi maks. 1×24 jam",
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
