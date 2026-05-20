// frontend/src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Đang check token (F5) → chưa biết đã login chưa → không redirect vội
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--color-text-secondary)",
          fontSize: "14px",
        }}
      >
        Đang tải...
      </div>
    );
  }

  // Chưa đăng nhập → về /login, nhớ trang đang vào để redirect lại sau
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã login nhưng không đúng role → về trang chủ
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
