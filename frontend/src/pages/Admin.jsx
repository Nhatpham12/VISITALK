import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { userService, authService } from "../services/api";
import "../CSS/Admin.css";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    gender: "",
    email: "",
    username: "",
    password: "",
  });
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    full_name: "",
    dob: "",
    gender: "",
    email: "",
    username: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    userService
      .getAll()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const { full_name, dob, gender, email, username, password } = formData;
    if (!full_name || !dob || !gender || !username || !password) {
      setModalError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    setModalLoading(true);
    setModalError("");
    try {
      await authService.register({
        full_name,
        dob,
        gender,
        email: email || undefined,
        username,
        password,
      });
      setShowModal(false);
      setFormData({
        full_name: "",
        dob: "",
        gender: "",
        email: "",
        username: "",
        password: "",
      });
      fetchUsers();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa người dùng này?")) return;
    try {
      await userService.delete(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await userService.updateStatus(id, newStatus);
      setUsers(
        users.map((u) => (u.id === id ? { ...u, u_status: newStatus } : u)),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUpdateForm({
        full_name: user.full_name || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        gender: user.gender || "",
        email: user.email || "",
        username: user.username || "",
      });
    }
  };

  const openUpdateModal = () => {
    setSelectedUserId("");
    setUpdateForm({ full_name: "", dob: "", gender: "", email: "", username: "" });
    setUpdateError("");
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setUpdateError("Vui lòng chọn người dùng.");
      return;
    }
    if (!updateForm.full_name) {
      setUpdateError("Họ và tên không được để trống.");
      return;
    }
    setUpdateLoading(true);
    setUpdateError("");
    try {
      await userService.update(selectedUserId, updateForm);
      setShowUpdateModal(false);
      fetchUsers();
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
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
            <div className="admin-toolbar">
              <button
                className="add-user-btn"
                onClick={() => setShowModal(true)}
              >
                <img src="/Assets/Images/Adduser.png" alt="Thêm người dùng" />
              </button>
              <button
                className="update-user-btn"
                onClick={openUpdateModal}
              >
                <img
                  src="/Assets/Images/updateUser.png"
                  alt="Thêm người dùng"
                />
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Thêm người dùng</h2>
              <form onSubmit={handleAddUser}>
                <label>Họ và tên *</label>
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={modalLoading}
                />

                <label>Ngày sinh *</label>
                <input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={modalLoading}
                />

                <label>Giới tính *</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={modalLoading}
                >
                  <option value="">-- Chọn --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>

                <label>Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={modalLoading}
                />

                <label>Tên đăng nhập *</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={modalLoading}
                />

                <label>Mật khẩu *</label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={modalLoading}
                />

                {modalError && <p className="modal-error">{modalError}</p>}

                <div className="modal-actions">
                  <button type="submit" disabled={modalLoading}>
                    {modalLoading ? "Đang thêm..." : "Thêm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={modalLoading}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showUpdateModal && (
          <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Cập nhật thông tin người dùng</h2>
              <form onSubmit={handleUpdateSubmit}>
                <label>Chọn người dùng *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  disabled={updateLoading}
                >
                  <option value="">-- Chọn người dùng --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.username})
                    </option>
                  ))}
                </select>

                <label>Họ và tên *</label>
                <input
                  type="text"
                  value={updateForm.full_name}
                  onChange={(e) => setUpdateForm({ ...updateForm, full_name: e.target.value })}
                  disabled={updateLoading}
                />

                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={updateForm.dob}
                  onChange={(e) => setUpdateForm({ ...updateForm, dob: e.target.value })}
                  disabled={updateLoading}
                />

                <label>Giới tính</label>
                <select
                  value={updateForm.gender}
                  onChange={(e) => setUpdateForm({ ...updateForm, gender: e.target.value })}
                  disabled={updateLoading}
                >
                  <option value="">-- Chọn --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>

                <label>Email</label>
                <input
                  type="email"
                  value={updateForm.email}
                  onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                  disabled={updateLoading}
                />

                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  value={updateForm.username}
                  onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })}
                  disabled={updateLoading}
                />

                {updateError && <p className="modal-error">{updateError}</p>}

                <div className="modal-actions">
                  <button type="submit" disabled={updateLoading}>
                    {updateLoading ? "Đang cập nhật..." : "Cập nhật"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    disabled={updateLoading}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                      <tr className="user-row" key={u.id}>
                        <td>{u.full_name}</td>
                        <td>
                          {u.dob
                            ? new Date(u.dob).toLocaleDateString("vi-VN")
                            : "-"}
                        </td>
                        <td>{u.gender}</td>
                        <td>{u.email}</td>
                        <td>{u.username}</td>
                        <td>
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString("vi-VN")
                            : "-"}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(u.id, u.u_status)}
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
                            onClick={() => handleDelete(u.id)}
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
