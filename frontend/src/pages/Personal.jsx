// frontend/src/pages/Personal.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/authContext";
import "../CSS/Personal.css";

const Personal = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
                { id: "full_name", label: "Họ và tên", value: user?.full_name },
                { id: "dob", label: "Ngày tháng năm sinh", value: user?.dob?.split('T')[0] },
                { id: "gender", label: "Giới tính", value: user?.gender },
                { id: "email", label: "Email", value: user?.email },
                { id: "username", label: "Tên đăng nhập", value: user?.username },
              ].map(({ id, label, value }) => (
                <div className="field" key={id}>
                  <label htmlFor={id}>{label}</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id={id}
                      value={value || ""}
                      readOnly
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="right-panel">
            <div className="avatar"></div>
            <div className="change-del-avt">
              <button id="change-avt">Đổi ảnh đại diện</button>
              <button id="del-avt">Xóa ảnh đại diện</button>
            </div>
            <div className="change-inf">
              <button id="change" onClick={() => navigate("/update")}>
                Thay đổi thông tin cá nhân
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
