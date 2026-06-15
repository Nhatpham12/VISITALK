import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { userService } from "../services/api";
import "../CSS/Update.css";

const Update = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    dob: user?.dob?.split('T')[0] || "",
    gender: user?.gender || "",
    email: user?.email || "",
    username: user?.username || "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const updated = await userService.update(user.id, form);
      if (typeof updateUser === "function") updateUser(updated);
      setMessage("Cập nhật thành công!");
      setTimeout(() => navigate("/personal"), 1500);
    } catch (err) {
      setMessage(err.message || "Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="Navbar2">
        <div className="img-left">
          <Link to="/personal">
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
          <h1>CẬP NHẬT THÔNG TIN</h1>
        </div>

        <form className="form-group" onSubmit={handleUpdate}>
          <div className="field">
            <label htmlFor="full_name">Họ và tên</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="full_name"
                value={form.full_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="dob">Ngày sinh</label>
            <div className="input-wrapper">
              <input
                type="date"
                id="dob"
                value={form.dob}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="gender">Giới tính</label>
            <div className="input-wrapper">
              <select
                id="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="" disabled>
                  -- Chọn --
                </option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="field">
            <label>Tên đăng nhập</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                value={form.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {message && (
            <p
              className={
                message.includes("thành công") ? "success-msg" : "error-msg"
              }
            >
              {message}
            </p>
          )}

          <div className="sign-up-but">
            <button type="submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Update;
