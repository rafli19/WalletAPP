import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import Icon, { icons } from "../components/Icon";
import Modal from "../components/Modal";
import useToast from "../hooks/useToast";
import api from "../services/api";
import { fmtDate } from "../services/format";

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

const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
};

const AdminUsers = ({ user, onLogout }) => {
  const { toasts, addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [formModal, setFormModal] = useState(false); // create / edit
  const [deleteModal, setDeleteModal] = useState(null); // { id, name }
  const [editTarget, setEditTarget] = useState(null); // user obj being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Open create modal ─────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setFormModal(true);
  };

  // ── Open edit modal ───────────────────────────────────────────
  const openEdit = (u) => {
    setEditTarget(u);
    setForm({
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone || "",
      password: "",
      role: u.role,
    });
    setFormErr({});
    setFormModal(true);
  };

  // ── Submit create / edit ──────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setFormErr({});
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // kalau edit & kosong, skip
      if (!payload.phone) payload.phone = null;

      if (editTarget) {
        await api.put(`/admin/users/${editTarget.id}`, payload);
        addToast("User berhasil diperbarui.", "success");
      } else {
        await api.post("/admin/users", payload);
        addToast("User berhasil dibuat.", "success");
      }
      setFormModal(false);
      loadUsers();
    } catch (e) {
      const errors = e?.data?.errors;
      if (errors) {
        // Flatten Laravel validation errors
        const flat = {};
        Object.keys(errors).forEach((k) => {
          flat[k] = errors[k][0];
        });
        setFormErr(flat);
      } else {
        addToast(e?.data?.message || "Gagal menyimpan.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteModal.id}`);
      addToast("User berhasil dihapus.", "success");
      setDeleteModal(null);
      loadUsers();
    } catch (e) {
      addToast(e?.data?.message || "Gagal menghapus.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setFormErr((p) => ({ ...p, [key]: "" }));
    },
  });

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      <ToastContainer toasts={toasts} />

      {/* ── Form Modal (Create / Edit) ── */}
      <Modal show={formModal} onClose={() => setFormModal(false)}>
        <h2 className="modal-title">
          {editTarget ? "Edit User" : "Tambah User"}
        </h2>
        <p className="modal-sub" style={{ marginBottom: 20 }}>
          {editTarget ? "Perbarui data akun user." : "Buat akun user baru."}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            textAlign: "left",
          }}
        >
          {/* Name */}
          <div className="form-field">
            <label>Nama Lengkap</label>
            <input
              placeholder="Nama lengkap"
              className={formErr.name ? "error" : ""}
              {...field("name")}
            />
            {formErr.name && <div className="form-err">{formErr.name}</div>}
          </div>

          {/* Username */}
          <div className="form-field">
            <label>Username</label>
            <input
              placeholder="Username (huruf & angka)"
              className={formErr.username ? "error" : ""}
              {...field("username")}
            />
            {formErr.username && (
              <div className="form-err">{formErr.username}</div>
            )}
          </div>

          {/* Email */}
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              className={formErr.email ? "error" : ""}
              {...field("email")}
            />
            {formErr.email && <div className="form-err">{formErr.email}</div>}
          </div>

          {/* Phone */}
          <div className="form-field">
            <label>
              No. HP{" "}
              <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>
                (opsional)
              </span>
            </label>
            <input
              placeholder="08xxxxxxxxxx"
              className={formErr.phone ? "error" : ""}
              {...field("phone")}
            />
            {formErr.phone && <div className="form-err">{formErr.phone}</div>}
          </div>

          {/* Password */}
          <div className="form-field">
            <label>
              Password
              {editTarget && (
                <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>
                  {" "}
                  (kosongkan jika tidak diubah)
                </span>
              )}
            </label>
            <input
              type="password"
              placeholder="Min. 8 karakter"
              className={formErr.password ? "error" : ""}
              {...field("password")}
            />
            {formErr.password && (
              <div className="form-err">{formErr.password}</div>
            )}
          </div>

          {/* Role */}
          <div className="form-field">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                width: "100%",
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 24 }}>
          <button
            className="modal-btn-cancel"
            onClick={() => setFormModal(false)}
          >
            Batal
          </button>
          <button
            className="modal-btn-confirm btn-green"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <span className="spinner" /> : null}
            {submitting
              ? "Menyimpan..."
              : editTarget
                ? "Simpan Perubahan"
                : "Buat User"}
          </button>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal show={!!deleteModal} onClose={() => setDeleteModal(null)}>
        <div className="modal-icon modal-icon-red">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h2 className="modal-title">Hapus User?</h2>
        <p className="modal-sub">
          Akun berikut akan dihapus permanen beserta seluruh datanya.
        </p>
        <p className="modal-recipient">{deleteModal?.name}</p>
        <div className="modal-actions">
          <button
            className="modal-btn-cancel"
            onClick={() => setDeleteModal(null)}
          >
            Batal
          </button>
          <button
            className="modal-btn-confirm btn-red"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <span className="spinner" /> : null}
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </Modal>

      {/* ── Page ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola User</h1>
          <p className="page-sub">Daftar semua pengguna WalletApp</p>
        </div>
        <button
          className="btn-action btn-green"
          style={{ marginTop: 8 }}
          onClick={openCreate}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="16"
            height="16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah User
        </button>
      </div>

      <div className="stat-row" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total User</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Admin</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>
            {users.filter((u) => u.role === "admin").length}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <Icon d={icons.user} size={16} />
          Semua Pengguna
        </div>

        <div className="form-field" style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Cari nama, username, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <div className="loading-row">
            <span className="spinner light" />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">Tidak ada user ditemukan.</div>
        )}

        {/* Desktop */}
        {!loading && filtered.length > 0 && (
          <table className="tx-table tx-table-desktop">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>No. HP</th>
                <th>Role</th>
                <th>Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {u.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-dim)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      @{u.username}
                    </div>
                  </td>
                  <td className="tx-desc">{u.email}</td>
                  <td className="tx-desc">{u.phone || "-"}</td>
                  <td>
                    <span
                      className={`tx-type ${u.role === "admin" ? "tx-admin" : "tx-user-role"}`}
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="tx-date">{fmtDate(u.created_at)}</td>
                  <td>
                    <div className="admin-action-btns">
                      <button
                        className="admin-btn-approve"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-btn-reject"
                        onClick={() =>
                          setDeleteModal({ id: u.id, name: u.name })
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Mobile */}
        {!loading && filtered.length > 0 && (
          <div className="tx-card-list">
            {filtered.map((u) => (
              <div
                key={u.id}
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
                      {u.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-dim)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      @{u.username}
                    </div>
                  </div>
                  <span
                    className={`tx-type ${u.role === "admin" ? "tx-admin" : "tx-user-role"}`}
                  >
                    {u.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  {u.email} · {u.phone || "No HP -"}
                </div>
                <div className="admin-action-btns">
                  <button
                    className="admin-btn-approve"
                    onClick={() => openEdit(u)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn-reject"
                    onClick={() => setDeleteModal({ id: u.id, name: u.name })}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
