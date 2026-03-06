export const validateNominal = (value) => {
  if (value === "" || value === null || value === undefined)
    return "Nominal tidak boleh kosong.";
  if (!/^\d+$/.test(String(value).trim())) return "Nominal harus berupa angka.";
  const num = parseInt(value, 10);
  if (num <= 0) return "Nominal harus lebih dari 0.";
  if (num > 50_000_000) return "Nominal melebihi batas maksimum transaksi.";
  return null;
};

export const validateAuthForm = (mode, form) => {
  const errors = {};
  if (mode === "register" && !form.name.trim())
    errors.name = "Nama lengkap wajib diisi.";
  if (!form.email.trim()) errors.email = "Email wajib diisi.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Format email tidak valid.";
  if (!form.password) errors.password = "Password wajib diisi.";
  else if (form.password.length < 8)
    errors.password = "Password minimal 8 karakter.";
  return errors;
};
