import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { userService } from "../services/api";
import "../CSS/Admin.css";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    userService
      .getAll()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa người dùng này?")) return;
    try {
      await userService.delete(id);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await userService.updateStatus(id, newStatus);
      setUsers(
        users.map((u) => (u._id === id ? { ...u, u_status: newStatus } : u)),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-page">
        <div className="main-content">
          <div className="admin-profile">
            <div className="admin-avatar">
              <img
                src="/Assets/Images/Personal.png"
                className="avatar-icon"
                alt="Admin"
              />
            </div>
            <p className="admin-label">QUẢN TRỊ VIÊN</p>
          </div>
          <div className="admin-actions">
            <button className="action-btn">
              <img
                src="/Assets/Images/Adduser.png"
                className="btn-icon"
                alt="Thêm"
              />
            </button>
            <button className="action-btn">
              <img
                src="/Assets/Images/Deluser.png"
                className="btn-icon"
                alt="Xóa"
              />
            </button>
          </div>
        </div>

        <div className="table-section">
          <div className="table-wrapper">
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Họ và tên</th>
                    <th>Ngày sinh</th>
                    <th>Giới tính</th>
                    <th>Email</th>
                    <th>Tên đăng nhập</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8">Chưa có dữ liệu người dùng</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr className="user-row" key={u._id}>
                        <td>{u.full_name}</td>
                        <td>{u.dob}</td>
                        <td>{u.gender}</td>
                        <td>{u.email}</td>
                        <td>{u.username}</td>
                        <td>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                            : "-"}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleToggleStatus(u._id, u.u_status)
                            }
                            style={{
                              color: u.u_status === "active" ? "green" : "gray",
                              fontSize: "12px",
                            }}
                          >
                            {u.u_status === "active" ? "Hoạt động" : "Vô hiệu"}
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(u._id)}
                            style={{ color: "red", fontSize: "12px" }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
