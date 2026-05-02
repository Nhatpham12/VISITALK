import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Admin.css";

const Admin = () => {
  return (
    <>
      <Navbar />
      <div className="admin-page">
        <div className="main-content">
          <div className="admin-profile">
            <div className="admin-avatar">
              <img src="/Assets/Images/Personal.png" className="avatar-icon" />
            </div>
            <p className="admin-label">QUẢN TRỊ VIÊN</p>
          </div>
          <div className="admin-actions">
            <button className="action-btn">
              <img src="/Assets/Images/Adduser.png" className="btn-icon" />
            </button>
            <button className="action-btn">
              <img src="/Assets/Images/Deluser.png" className="btn-icon" />
            </button>
          </div>
        </div>

        <div className="table-section">
          <div className="table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Năm sinh</th>
                  <th>Giới tính</th>
                  <th>Email/SDT</th>
                  <th>Tên đăng nhập</th>
                  <th>Mật khẩu</th>
                  <th>Ngày tạo tài khoản</th>
                  <th>Lần đăng nhập cuối</th>
                </tr>
              </thead>
              <tbody>
                <tr className="user-row">
                  <td colSpan="8">Chưa có dữ liệu người dùng</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
