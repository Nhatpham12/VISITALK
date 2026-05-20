// frontend/src/pages/Signup.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../CSS/Signup.css";

const Signup = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    dob: "",
    email: "",
    username: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { fullname, dob, email, username, password, password2 } = form;

    if (!fullname || !email || !username || !password || !password2) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password !== password2) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await register({
        full_name: fullname,
        dob,
        email,
        username,
        hashedpassword: password, // backend nhận hashedPassword
      });
      // Đăng ký xong → về trang login
      navigate("/login");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
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
          <img
            src="/Assets/Images/Brand.png"
            className="brand-main"
            alt="Brand"
          />
        </div>

        <form className="form-group" onSubmit={handleSignup}>
          {[
            { id: "fullname", label: "Họ và tên", type: "text" },
            { id: "dob", label: "Ngày tháng năm sinh", type: "text" },
            { id: "email", label: "Email", type: "email" },
            { id: "username", label: "Tên đăng nhập", type: "text" },
            { id: "password", label: "Mật khẩu", type: "password" },
            { id: "password2", label: "Nhập lại mật khẩu", type: "password" },
          ].map(({ id, label, type }) => (
            <div className="field" key={id}>
              <label htmlFor={id}>{label}</label>
              <div className="input-wrapper">
                <input
                  type={type}
                  id={id}
                  value={form[id]}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          ))}

          {error && (
            <p className="error-msg" style={{ color: "red", fontSize: "13px" }}>
              {error}
            </p>
          )}

          <div className="sign-up-but">
            <button id="sign-up" type="submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </div>
        </form>

        <div className="al-account">
          <h5>Bạn đã có tài khoản?</h5>
          <Link to="/login">
            <b>Đăng nhập ngay</b>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Signup;
