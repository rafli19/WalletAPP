import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import Icon, { icons } from "../components/Icon";
import api from "../services/api";
import { fmt, fmtDate } from "../services/format";

const isIncoming = (type) => type === "topup" || type === "transfer_in";

const getTxLabel = (type) => {
  if (type === "topup") return "Top Up";
  if (type === "transfer_in") return "Masuk";
  return "Transfer";
};

/* ── Desktop table row ── */
const TxRow = ({ tx }) => {
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
const TxCard = ({ tx }) => {
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

const Transactions = ({ user, onLogout }) => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions");
      setTxs(res.data || []);
    } catch {
      setTxs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="page-header">
        <h1 className="page-title">Riwayat Transaksi</h1>
        <p className="page-sub">Semua histori mutasi masuk & keluar</p>
      </div>

      <div className="panel">
        <div className="panel-title">
          <Icon d={icons.history} size={16} />
          Mutasi Transaksi
        </div>

        {loading && (
          <div className="loading-row">
            <span className="spinner light" />
          </div>
        )}

        {!loading && txs.length === 0 && (
          <div className="empty-state">Belum ada transaksi.</div>
        )}

        {/* Desktop — tabel */}
        {!loading && txs.length > 0 && (
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
              {txs.map((tx, i) => (
                <TxRow key={tx.id ?? i} tx={tx} />
              ))}
            </tbody>
          </table>
        )}

        {/* Mobile — card list */}
        {!loading && txs.length > 0 && (
          <div className="tx-card-list">
            {txs.map((tx, i) => (
              <TxCard key={tx.id ?? i} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Transactions;
