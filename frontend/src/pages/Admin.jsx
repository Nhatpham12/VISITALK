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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterGender("");
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortKey("");
    setSortDir("asc");
    setCurrentPage(1);
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
    setUpdateForm({
      full_name: "",
      dob: "",
      gender: "",
      email: "",
      username: "",
    });
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
              <button className="update-user-btn" onClick={openUpdateModal}>
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
          <div
            className="modal-overlay"
            onClick={() => setShowUpdateModal(false)}
          >
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
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, full_name: e.target.value })
                  }
                  disabled={updateLoading}
                />

                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={updateForm.dob}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, dob: e.target.value })
                  }
                  disabled={updateLoading}
                />

                <label>Giới tính</label>
                <select
                  value={updateForm.gender}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, gender: e.target.value })
                  }
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
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, email: e.target.value })
                  }
                  disabled={updateLoading}
                />

                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  value={updateForm.username}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, username: e.target.value })
                  }
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
          <div className="toolbar-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm theo tên, username, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="filter-bar">
              <div className="filter-group">
                <label>Giới tính:</label>
                <select
                  className="filter-select"
                  value={filterGender}
                  onChange={(e) => {
                    setFilterGender(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Trạng thái:</label>
                <select
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Vô hiệu</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Từ:</label>
                <input
                  type="date"
                  className="filter-date"
                  value={filterDateFrom}
                  onChange={(e) => {
                    setFilterDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="filter-group">
                <label>Đến:</label>
                <input
                  type="date"
                  className="filter-date"
                  value={filterDateTo}
                  onChange={(e) => {
                    setFilterDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button className="filter-reset-btn" onClick={handleResetFilters}>
                Đặt lại
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading &&
              !error &&
              (() => {
                const term = searchTerm.toLowerCase();
                let filteredUsers = users.filter((u) => {
                  const matchSearch =
                    u.full_name?.toLowerCase().includes(term) ||
                    u.username?.toLowerCase().includes(term) ||
                    u.email?.toLowerCase().includes(term);
                  const matchGender = !filterGender || u.gender === filterGender;
                  const matchStatus =
                    !filterStatus || u.u_status === filterStatus;
                  let matchDate = true;
                  if (filterDateFrom && u.created_at) {
                    matchDate =
                      matchDate &&
                      new Date(u.created_at) >= new Date(filterDateFrom);
                  }
                  if (filterDateTo && u.created_at) {
                    const toDate = new Date(filterDateTo);
                    toDate.setHours(23, 59, 59, 999);
                    matchDate = matchDate && new Date(u.created_at) <= toDate;
                  }
                  return matchSearch && matchGender && matchStatus && matchDate;
                });

                if (sortKey) {
                  filteredUsers.sort((a, b) => {
                    let valA = a[sortKey] ?? "";
                    let valB = b[sortKey] ?? "";
                    if (sortKey === "created_at" || sortKey === "dob") {
                      valA = valA ? new Date(valA).getTime() : 0;
                      valB = valB ? new Date(valB).getTime() : 0;
                    } else {
                      valA = String(valA).toLowerCase();
                      valB = String(valB).toLowerCase();
                    }
                    if (valA < valB) return sortDir === "asc" ? -1 : 1;
                    if (valA > valB) return sortDir === "asc" ? 1 : -1;
                    return 0;
                  });
                }

                const totalPages = Math.ceil(
                  filteredUsers.length / rowsPerPage,
                );
                const startIdx = (currentPage - 1) * rowsPerPage;
                const paginatedUsers = filteredUsers.slice(
                  startIdx,
                  startIdx + rowsPerPage,
                );

                const sortIcon = (key) => {
                  if (sortKey !== key)
                    return <span className="sort-icon">⇅</span>;
                  return (
                    <span className="sort-icon active">
                      {sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  );
                };

                return (
                  <>
                    <table className="user-table">
                      <thead>
                        <tr>
                          <th
                            className="sortable"
                            onClick={() => handleSort("full_name")}
                          >
                            Họ và tên {sortIcon("full_name")}
                          </th>
                          <th
                            className="sortable"
                            onClick={() => handleSort("dob")}
                          >
                            Ngày sinh {sortIcon("dob")}
                          </th>
                          <th
                            className="sortable"
                            onClick={() => handleSort("gender")}
                          >
                            Giới tính {sortIcon("gender")}
                          </th>
                          <th
                            className="sortable"
                            onClick={() => handleSort("email")}
                          >
                            Email {sortIcon("email")}
                          </th>
                          <th
                            className="sortable"
                            onClick={() => handleSort("username")}
                          >
                            Tên đăng nhập {sortIcon("username")}
                          </th>
                          <th
                            className="sortable"
                            onClick={() => handleSort("created_at")}
                          >
                            Ngày tạo {sortIcon("created_at")}
                          </th>
                          <th
                            className="sortable"
                            onClick={() => handleSort("u_status")}
                          >
                            Trạng thái {sortIcon("u_status")}
                          </th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.length === 0 ? (
                          <tr>
                            <td colSpan="8">
                              {searchTerm ||
                              filterGender ||
                              filterStatus ||
                              filterDateFrom ||
                              filterDateTo
                                ? "Không tìm thấy kết quả"
                                : "Chưa có dữ liệu người dùng"}
                            </td>
                          </tr>
                        ) : (
                          paginatedUsers.map((u) => (
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
                                  ? new Date(
                                      u.created_at,
                                    ).toLocaleDateString("vi-VN")
                                  : "-"}
                              </td>
                              <td>
                                <button
                                  onClick={() =>
                                    handleToggleStatus(u.id, u.u_status)
                                  }
                                  style={{
                                    color:
                                      u.u_status === "active"
                                        ? "green"
                                        : "gray",
                                    fontSize: "12px",
                                  }}
                                >
                                  {u.u_status === "active"
                                    ? "Hoạt động"
                                    : "Vô hiệu"}
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
                    {filteredUsers.length > rowsPerPage && (
                      <div className="pagination">
                        <button
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                        >
                          ←
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            if (totalPages <= 5) return true;
                            if (p === 1 || p === totalPages) return true;
                            if (Math.abs(p - currentPage) <= 1) return true;
                            return false;
                          })
                          .reduce((acc, p, idx, arr) => {
                            if (idx > 0 && p - arr[idx - 1] > 1)
                              acc.push("...");
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, idx) =>
                            p === "..." ? (
                              <span key={`ellipsis-${idx}`} className="page-info">
                                ...
                              </span>
                            ) : (
                              <button
                                key={p}
                                className={
                                  currentPage === p ? "active-page" : ""
                                }
                                onClick={() => setCurrentPage(p)}
                              >
                                {p}
                              </button>
                            ),
                          )}
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                        >
                          →
                        </button>
                        <span className="page-info">
                          {filteredUsers.length} kết quả
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
