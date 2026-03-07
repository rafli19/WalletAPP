import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon, { icons } from "../components/Icon";
import api from "../services/api";
import { validateAuthForm } from "../services/validation";

const INITIAL_FORM = { name: "", username: "", email: "", password: "" };

const buildPayload = (mode, form) => {
  if (mode === "login") {
    return { email: form.email, password: form.password };
  }
  return {
    name: form.name,
    username: form.username.toLowerCase().replace(/\s+/g, ""),
    email: form.email,
    password: form.password,
    password_confirmation: form.password,
  };
};

const extractErrorMessage = (err) => {
  const data = err?.data;
  if (data?.errors) return Object.values(data.errors).flat()[0];
  return data?.message || "Terjadi kesalahan. Coba lagi.";
};

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setGlobalErr("");
  };

  const handleSwitchMode = (m) => {
    setMode(m);
    setForm(INITIAL_FORM);
    setErrors({});
    setGlobalErr("");
  };

  const handleSubmit = async () => {
    const validationErrors = validateAuthForm(mode, form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const res = await api.post(endpoint, buildPayload(mode, form));

      const token = res.data?.token || res.token;
      const user = res.data?.user || res.user;

      if (token && user) {
        sessionStorage.setItem("wallet_token", token);
        onLogin(user);
        // Redirect sesuai role — admin ke /admin, user ke /dashboard
        navigate(user.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setGlobalErr(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Icon d={icons.wallet} size={20} stroke="#0a0a0f" />
          </div>
          <span className="auth-logo-text">WalletApp</span>
        </div>

        <div className="tab-row">
          <button
            className={`tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => handleSwitchMode("login")}
          >
            Masuk
          </button>
          <button
            className={`tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => handleSwitchMode("register")}
          >
            Daftar
          </button>
        </div>

        <h1 className="auth-title">
          {mode === "login" ? "Selamat datang" : "Buat akun baru"}
        </h1>
        <p className="auth-sub">
          {mode === "login"
            ? "Masuk ke wallet kamu"
            : "Daftar untuk mulai bertransaksi"}
        </p>

        {globalErr && <div className="global-err">{globalErr}</div>}

        {mode === "register" && (
          <>
            <div className="auth-field">
              <label>Nama Lengkap</label>
              <input
                className={errors.name ? "error" : ""}
                placeholder="Masukkan nama lengkap"
                value={form.name}
                onChange={handleChange("name")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {errors.name && <div className="field-err">{errors.name}</div>}
            </div>
            <div className="auth-field">
              <label>Username</label>
              <input
                className={errors.username ? "error" : ""}
                placeholder="Masukkan username"
                value={form.username}
                onChange={handleChange("username")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              {errors.username && (
                <div className="field-err">{errors.username}</div>
              )}
            </div>
          </>
        )}

        <div className="auth-field">
          <label>Email</label>
          <input
            type="text"
            className={errors.email ? "error" : ""}
            placeholder="Masukkan email"
            value={form.email}
            onChange={handleChange("email")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {errors.email && <div className="field-err">{errors.email}</div>}
        </div>

        <div className="auth-field">
          <label>Password</label>
          <div className="field-wrap">
            <input
              type={showPw ? "text" : "password"}
              className={errors.password ? "error" : ""}
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={handleChange("password")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ paddingRight: 44 }}
              autoComplete="current-password"
            />
            <button
              className="eye-btn"
              onClick={() => setShowPw((v) => !v)}
              tabIndex={-1}
            >
              <Icon d={showPw ? icons.eyeOff : icons.eye} size={16} />
            </button>
          </div>
          {errors.password && (
            <div className="field-err">{errors.password}</div>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : mode === "login" ? (
            "Masuk"
          ) : (
            "Daftar Sekarang"
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;
