// frontend/src/pages/Personal.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { userService } from "../services/api";
import "../CSS/Personal.css";

const Personal = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    email: user?.email || "",
    username: user?.username || "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const updated = await userService.update(user.userId || user._id, form);
      // Cập nhật lại user trong AuthContext nếu có hàm updateUser
      if (typeof updateUser === "function") updateUser(updated);
      setMessage("Cập nhật thành công!");
    } catch (err) {
      setMessage(err.message || "Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <div className="personal-page">
        <div className="main-content">
          <div className="content-wrapper">
            <h1>THÔNG TIN CÁ NHÂN</h1>
            <div className="form-group">
              {[
                { id: "full_name", label: "Họ và tên" },
                { id: "dob", label: "Ngày tháng năm sinh" },
                { id: "gender", label: "Giới tính" },
                { id: "email", label: "Email" },
                { id: "username", label: "Tên đăng nhập" },
              ].map(({ id, label }) => (
                <div className="field" key={id}>
                  <label htmlFor={id}>{label}</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id={id}
                      value={form[id]}
                      onChange={handleChange}
                      readOnly={id === "username"} // username không cho sửa
                    />
                  </div>
                </div>
              ))}
              {message && (
                <p
                  style={{
                    fontSize: "13px",
                    color: message.includes("thành công") ? "green" : "red",
                  }}
                >
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="right-panel">
            <div className="avatar"></div>
            <div className="change-del-avt">
              <button id="change-avt">Đổi ảnh đại diện</button>
              <button id="del-avt">Xóa ảnh đại diện</button>
            </div>
            <div className="change-inf">
              <button id="change" onClick={handleUpdate} disabled={loading}>
                {loading ? "Đang lưu..." : "Thay đổi thông tin cá nhân"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Personal;
