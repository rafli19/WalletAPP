import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Icon, { icons } from "../components/Icon";
import api from "../services/api";
import { fmt, fmtDate } from "../services/format";

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [topups, setTopups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [topupRes, userRes] = await Promise.all([
        api.get("/admin/topups?status=approved"),
        api.get("/admin/users"),
      ]);
      setTopups(topupRes.data || []);
      setUsers(userRes.data || []);
    } catch {
      setTopups([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalTopups = topups.length;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Dashboard Admin</h1>
        <p className="page-sub">Selamat datang, {user?.name || "Admin"} 👋</p>
      </div>

      {/* Stat cards */}
      <div className="stat-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total User</div>
          <div className="stat-value">{loading ? "..." : totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Admin</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>
            {loading ? "..." : totalAdmins}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Top Up</div>
          <div className="stat-value" style={{ color: "var(--green)" }}>
            {loading ? "..." : totalTopups}
          </div>
        </div>
      </div>

      {/* Recent topups */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div
          className="panel-title"
          style={{ justifyContent: "space-between" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d={icons.topup} size={16} />
            Top Up Terbaru
          </span>
          <button
            className="btn-link"
            style={{ width: "auto" }}
            onClick={() => navigate("/admin/topups")}
          >
            Lihat semua →
          </button>
        </div>

        {loading && (
          <div className="loading-row">
            <span className="spinner light" />
          </div>
        )}
        {!loading && topups.length === 0 && (
          <div className="empty-state">Belum ada top up.</div>
        )}

        {!loading && topups.length > 0 && (
          <>
            <table className="tx-table tx-table-desktop">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Nominal</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {topups.slice(0, 5).map((tx) => (
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
                    <td className="tx-date">{fmtDate(tx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="tx-card-list">
              {topups.slice(0, 5).map((tx) => (
                <div key={tx.id} className="tx-card">
                  <div className="tx-card-left">
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {tx.user?.name || "-"}
                    </span>
                    <span className="tx-desc">@{tx.user?.username}</span>
                  </div>
                  <div className="tx-card-right">
                    <span className="tx-amount in">{fmt(tx.amount)}</span>
                    <span className="tx-date">{fmtDate(tx.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent users */}
      <div className="panel">
        <div
          className="panel-title"
          style={{ justifyContent: "space-between" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d={icons.user} size={16} />
            User Terbaru
          </span>
          <button
            className="btn-link"
            style={{ width: "auto" }}
            onClick={() => navigate("/admin/users")}
          >
            Lihat semua →
          </button>
        </div>

        {loading && (
          <div className="loading-row">
            <span className="spinner light" />
          </div>
        )}
        {!loading && users.length === 0 && (
          <div className="empty-state">Belum ada user.</div>
        )}

        {!loading && users.length > 0 && (
          <>
            <table className="tx-table tx-table-desktop">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((u) => (
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
                    <td>
                      <span
                        className={`tx-type ${u.role === "admin" ? "tx-admin" : "tx-user-role"}`}
                      >
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="tx-card-list">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="tx-card">
                  <div className="tx-card-left">
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {u.name}
                    </span>
                    <span className="tx-desc">{u.email}</span>
                  </div>
                  <div className="tx-card-right">
                    <span
                      className={`tx-type ${u.role === "admin" ? "tx-admin" : "tx-user-role"}`}
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
