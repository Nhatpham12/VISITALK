// frontend/src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import "../CSS/Login.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await login(username, password);

      if (data && data.user && data.user.u_role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="Navbar2">
        <div className="img-left">
          <Link to="/">
            <img src="/Assets/Images/Arrow.png" className="brand" alt="Arrow" />
          </Link>
          <Link to="/">
            <img src="/Assets/Images/Brand.png" className="brand" alt="Brand" />
          </Link>
        </div>
        <div className="img-right">
          <Link to="/setting">
            <img
              src="/Assets/Images/Setting.png"
              className="setting"
              alt="Setting"
            />
          </Link>
        </div>
      </div>

      <div className="form-container">
        <div className="title">
          <h1>CHÀO MỪNG BẠN ĐẾN VỚI</h1>
          <img src="/Assets/Images/Brand.png" className="brand" alt="Brand" />
        </div>

        <form className="form-group" onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <p className="error-msg" style={{ color: "red", fontSize: "13px" }}>
              {error}
            </p>
          )}

          <div className="login-but">
            <button id="login" type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>

        <div className="no-account">
          <h5>Bạn chưa có tài khoản?</h5>
          <Link to="/signup">
            <b>Đăng ký ngay</b>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
