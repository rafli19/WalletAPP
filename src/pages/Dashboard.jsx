import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Icon, { icons } from "../components/Icon";
import useWallet from "../hooks/useWallet";
import api from "../services/api";
import { fmt, fmtDate } from "../services/format";

const isIncoming = (type) => type === "topup" || type === "transfer_in";

const getTxLabel = (type) => {
  if (type === "topup") return "Top Up";
  if (type === "transfer_in") return "Masuk";
  return "Transfer";
};

const StatCard = ({ label, value, positive }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className={`stat-value ${positive ? "in" : "out"}`}>{value}</div>
  </div>
);

/* ── Desktop table row ── */
const RecentTxRow = ({ tx }) => {
  const incoming = isIncoming(tx.type);
  return (
    <tr>
      <td>
        <span className={`tx-type ${incoming ? "tx-in" : "tx-out"}`}>
          {incoming ? "+" : "−"} {getTxLabel(tx.type)}
        </span>
      </td>
      <td className="tx-desc">{tx.description || "-"}</td>
      <td className={`tx-amount ${incoming ? "in" : "out"}`}>
        {incoming ? "+" : "-"}
        {fmt(tx.amount)}
      </td>
      <td className="tx-date">{fmtDate(tx.created_at)}</td>
    </tr>
  );
};

/* ── Mobile card ── */
const RecentTxCard = ({ tx }) => {
  const incoming = isIncoming(tx.type);
  return (
    <div className="tx-card">
      <div className="tx-card-left">
        <span className={`tx-type ${incoming ? "tx-in" : "tx-out"}`}>
          {incoming ? "+" : "−"} {getTxLabel(tx.type)}
        </span>
        <span className="tx-desc">{tx.description || "-"}</span>
      </div>
      <div className="tx-card-right">
        <span className={`tx-amount ${incoming ? "in" : "out"}`}>
          {incoming ? "+" : "-"}
          {fmt(tx.amount)}
        </span>
        <span className="tx-date">{fmtDate(tx.created_at)}</span>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { balance } = useWallet();

  const [txs, setTxs] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  const formattedBalance =
    balance === null ? "..." : new Intl.NumberFormat("id-ID").format(balance);

  const loadTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await api.get("/transactions");
      setTxs(res.data || []);
    } catch {
      setTxs([]);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const totalIn = txs
    .filter((t) => isIncoming(t.type))
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = txs
    .filter((t) => !isIncoming(t.type))
    .reduce((s, t) => s + t.amount, 0);
  const recentTxs = txs.slice(0, 5);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Selamat datang, {user?.name || "User"} 👋</p>
      </div>

      <div className="balance-card">
        <div>
          <div className="balance-label">Saldo Tersedia</div>
          <div className="balance-amount">
            <span>Rp</span> {formattedBalance}
          </div>
          <div className="balance-sub">
            Akun: {user?.name || user?.email || "-"}
          </div>
        </div>
        <div className="balance-icon">
          <Icon d={icons.wallet} size={34} />
        </div>
      </div>

      <div className="shortcut-row">
        <button className="shortcut-btn" onClick={() => navigate("/topup")}>
          <Icon d={icons.topup} size={20} />
          Top Up
        </button>
        <button className="shortcut-btn" onClick={() => navigate("/transfer")}>
          <Icon d={icons.transfer} size={20} />
          Transfer
        </button>
        <button
          className="shortcut-btn"
          onClick={() => navigate("/transactions")}
        >
          <Icon d={icons.history} size={20} />
          Riwayat
        </button>
      </div>

      <div className="stat-row">
        <StatCard
          label="Total Pemasukan"
          value={fmt(totalIn)}
          positive={true}
        />
        <StatCard
          label="Total Pengeluaran"
          value={fmt(totalOut)}
          positive={false}
        />
      </div>

      <div className="panel">
        <div className="panel-title">
          <Icon d={icons.history} size={16} />
          Transaksi Terbaru
        </div>

        {loadingTx && (
          <div className="loading-row">
            <span className="spinner light" />
          </div>
        )}

        {!loadingTx && recentTxs.length === 0 && (
          <div className="empty-state">Belum ada transaksi.</div>
        )}

        {!loadingTx && recentTxs.length > 0 && (
          <>
            {/* Desktop — tabel */}
            <table className="tx-table tx-table-desktop">
              <thead>
                <tr>
                  <th>Tipe</th>
                  <th>Keterangan</th>
                  <th>Nominal</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentTxs.map((tx, i) => (
                  <RecentTxRow key={tx.id ?? i} tx={tx} />
                ))}
              </tbody>
            </table>

            {/* Mobile — card list */}
            <div className="tx-card-list">
              {recentTxs.map((tx, i) => (
                <RecentTxCard key={tx.id ?? i} tx={tx} />
              ))}
            </div>

            <button
              className="btn-link mt-3"
              onClick={() => navigate("/transactions")}
            >
              Lihat semua transaksi →
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
