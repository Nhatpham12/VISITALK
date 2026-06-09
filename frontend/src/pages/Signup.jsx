// frontend/src/pages/Signup.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import "../CSS/Signup.css";

const Signup = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    dob: "",
    gender: "",
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
    const { fullname, dob, gender, email, username, password, password2 } =
      form;

    if (
      !fullname ||
      !dob ||
      !gender ||
      !email ||
      !username ||
      !password ||
      !password2
    ) {
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
        gender,
        email,
        username,
        password,
      });
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
            { id: "dob", label: "Ngày tháng năm sinh", type: "date" }, // Đổi thành type="date" cho hợp lý hơn
            {
              id: "gender",
              label: "Giới tính",
              type: "select", // Đổi thành dạng select
              options: [
                { value: "male", label: "Nam (Male)" },
                { value: "female", label: "Nữ (Female)" },
                { value: "other", label: "Khác (Other)" },
              ],
            },
            { id: "email", label: "Email", type: "email" },
            { id: "username", label: "Tên đăng nhập", type: "text" },
            { id: "password", label: "Mật khẩu", type: "password" },
            { id: "password2", label: "Nhập lại mật khẩu", type: "password" },
          ].map(({ id, label, type, options }) => (
            <div className="field" key={id}>
              <label htmlFor={id}>{label}</label>
              <div className="input-wrapper">
                {/* Logic render có điều kiện: nếu là select thì hiện dropdown, ngược lại hiện input thường */}
                {type === "select" ? (
                  <select
                    id={id}
                    value={form[id]}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="" disabled>
                      -- Vui lòng chọn --
                    </option>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type}
                    id={id}
                    value={form[id]}
                    onChange={handleChange}
                    disabled={loading}
                  />
                )}
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
