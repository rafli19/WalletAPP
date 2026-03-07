import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Icon, { icons } from "../components/Icon";
import useToast from "../hooks/useToast";
import api from "../services/api";

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

const AVATAR_MAX_SIZE = 2 * 1024 * 1024;

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  current_password: "",
  password: "",
  password_confirmation: "",
};

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  const base = (
    import.meta.env.VITE_API_BASE_URL || "http://walletapi.rafvoid.my.id"
  ).replace(/\/api$/, "");
  return `${base}/storage/avatars/${avatar}`;
};

const validateForm = (formData, showPasswordSection) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Nama lengkap wajib diisi.";
  }

  if (!formData.email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Format email tidak valid.";
  }

  if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
    errors.phone = "Format nomor telepon tidak valid.";
  }

  if (showPasswordSection) {
    if (!formData.current_password) {
      errors.current_password = "Password saat ini wajib diisi.";
    }
    if (formData.password) {
      if (formData.password.length < 8) {
        errors.password = "Password minimal 8 karakter.";
      }
      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = "Konfirmasi password tidak cocok.";
      }
    }
  }

  return errors;
};

const buildFormData = (formData, avatarFile, showPasswordSection) => {
  const payload = new FormData();
  payload.append("_method", "PUT");
  payload.append("name", formData.name);
  payload.append("email", formData.email);
  payload.append("phone", formData.phone || "");

  if (showPasswordSection && formData.password) {
    payload.append("current_password", formData.current_password);
    payload.append("password", formData.password);
    payload.append("password_confirmation", formData.password_confirmation);
  }

  if (avatarFile) {
    payload.append("avatar", avatarFile);
  }

  return payload;
};

const PasswordSection = ({ formData, errors, onChange }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-700 space-y-4">
    <div className="form-field">
      <label>Password Saat Ini</label>
      <input
        type="password"
        className={errors.current_password ? "error" : ""}
        placeholder="••••••••"
        value={formData.current_password}
        onChange={onChange("current_password")}
      />
      {errors.current_password && (
        <div className="form-err">{errors.current_password}</div>
      )}
    </div>

    <div className="form-field">
      <label>Password Baru</label>
      <input
        type="password"
        className={errors.password ? "error" : ""}
        placeholder="Minimal 8 karakter"
        value={formData.password}
        onChange={onChange("password")}
      />
      {errors.password && <div className="form-err">{errors.password}</div>}
    </div>

    <div className="form-field">
      <label>Konfirmasi Password Baru</label>
      <input
        type="password"
        className={errors.password_confirmation ? "error" : ""}
        placeholder="••••••••"
        value={formData.password_confirmation}
        onChange={onChange("password_confirmation")}
      />
      {errors.password_confirmation && (
        <div className="form-err">{errors.password_confirmation}</div>
      )}
    </div>
  </div>
);

const AvatarUpload = ({ preview, error, onChange }) => (
  <div className="form-field text-center mb-6">
    <div className="relative inline-block">
      <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon d={icons.user} size={40} stroke="white" />
        )}
      </div>

      <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 sm:p-2.5 rounded-full cursor-pointer shadow-md transition-colors border-2 border-white dark:border-gray-800">
        <Icon d={icons.camera} size={14} />
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </label>
    </div>

    {error && <div className="form-err">{error}</div>}

    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
      Klik ikon kamera untuk mengubah foto
    </p>
  </div>
);

const Profile = ({ user, onLogout, onUserUpdated }) => {
  const { toasts, addToast } = useToast();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      current_password: "",
      password: "",
      password_confirmation: "",
    });
    setAvatarPreview(getAvatarUrl(user.avatar));
  }, [user]);

  const handleFieldChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "", global: "" }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > AVATAR_MAX_SIZE) {
      setErrors((prev) => ({ ...prev, avatar: "Ukuran gambar maksimal 2MB." }));
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, avatar: "" }));
  };

  const togglePasswordSection = () => {
    setShowPasswordSection((prev) => !prev);
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(formData, showPasswordSection);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/profile",
        buildFormData(formData, avatarFile, showPasswordSection),
      );

      const meRes = await api.get("/me");
      const freshUser = meRes?.data || meRes;

      onUserUpdated?.(freshUser);
      addToast("Profil berhasil diperbarui!", "success");
      setShowPasswordSection(false);
      setAvatarFile(null);
    } catch (error) {
      const message =
        error?.data?.message ||
        (error?.data?.errors
          ? Object.values(error.data.errors).flat()[0]
          : "") ||
        "Gagal memperbarui profil.";

      setErrors((prev) => ({ ...prev, global: message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-sub">Kelola informasi akun Anda</p>
      </div>

      <div className="panel panel-sm">
        <div className="panel-title">
          <Icon d={icons.user} size={16} />
          Informasi Profil
        </div>

        {errors.global && <div className="global-err">{errors.global}</div>}

        <AvatarUpload
          preview={avatarPreview}
          error={errors.avatar}
          onChange={handleAvatarChange}
        />

        <div className="form-field">
          <label>Username</label>
          <input
            type="text"
            value={user?.username || ""}
            readOnly
            className="opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Username tidak dapat diubah.
          </p>
        </div>

        <div className="form-field">
          <label>Nama Lengkap</label>
          <input
            type="text"
            className={errors.name ? "error" : ""}
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={handleFieldChange("name")}
          />
          {errors.name && <div className="form-err">{errors.name}</div>}
        </div>

        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            className={errors.email ? "error" : ""}
            placeholder="email@contoh.com"
            value={formData.email}
            onChange={handleFieldChange("email")}
          />
          {errors.email && <div className="form-err">{errors.email}</div>}
        </div>

        <div className="form-field">
          <label>Nomor Telepon</label>
          <input
            type="tel"
            className={errors.phone ? "error" : ""}
            placeholder="081234567890"
            value={formData.phone}
            onChange={handleFieldChange("phone")}
          />
          {errors.phone && <div className="form-err">{errors.phone}</div>}
        </div>

        <div className="form-field">
          <button
            type="button"
            onClick={togglePasswordSection}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
          >
            <Icon
              d={showPasswordSection ? icons.chevronUp : icons.chevronDown}
              size={14}
            />
            {showPasswordSection
              ? "Sembunyikan Ubah Password"
              : "Ubah Password"}
          </button>
        </div>

        {showPasswordSection && (
          <PasswordSection
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />
        )}

        <button
          className="btn-action btn-accent w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <Icon d={icons.save} size={16} />
          )}
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </Layout>
  );
};

export default Profile;
