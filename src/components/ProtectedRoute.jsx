import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  const token = sessionStorage.getItem("wallet_token");

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return children;
};

export default ProtectedRoute;
