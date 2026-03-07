import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Topup from "./pages/Topup";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTopups from "./pages/AdminTopups";
import AdminUsers from "./pages/AdminUsers";
import api from "./services/api";
import "./index.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem("wallet_token");
      if (token) {
        try {
          const res = await api.get("/me");
          const userData = res.data || res;
          setUser(userData);
        } catch {
          sessionStorage.removeItem("wallet_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    sessionStorage.removeItem("wallet_token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login — kalau sudah login, redirect sesuai role */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                replace
              />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* ── USER ROUTES ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topup"
          element={
            <ProtectedRoute user={user}>
              <Topup user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute user={user}>
              <Transfer user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute user={user}>
              <Transactions user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile
                user={user}
                onLogout={handleLogout}
                onUserUpdated={setUser}
              />
            </ProtectedRoute>
          }
        />

        {/* ── ADMIN ROUTES ── */}
        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminDashboard user={user} onLogout={handleLogout} />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/topups"
          element={
            <AdminRoute user={user}>
              <AdminTopups user={user} onLogout={handleLogout} />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute user={user}>
              <AdminUsers user={user} onLogout={handleLogout} />
            </AdminRoute>
          }
        />

        {/* Fallback — redirect sesuai role */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
