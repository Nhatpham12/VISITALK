import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lessonService } from "../services/api";
import "../CSS/LessonsControl.css";

const LessonsControl = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    img_url: "",
    content: "",
    meaning: "",
  });
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    title: "",
    img_url: "",
    content: "",
    meaning: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const fetchLessons = () => {
    setLoading(true);
    lessonService
      .getAll()
      .then((data) => setLessons(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    const { title, img_url, content, meaning } = formData;
    if (!title) {
      setModalError("Tiêu đề bài học không được để trống.");
      return;
    }
    setModalLoading(true);
    setModalError("");
    try {
      await lessonService.create({ title, img_url, content, meaning });
      setShowModal(false);
      setFormData({ title: "", img_url: "", content: "", meaning: "" });
      fetchLessons();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài học này?")) return;
    try {
      await lessonService.delete(id);
      setLessons(lessons.filter((l) => l.les_id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
    const lesson = lessons.find((l) => l.les_id === lessonId);
    if (lesson) {
      setUpdateForm({
        title: lesson.title || "",
        img_url: lesson.img_url || "",
        content: lesson.content || "",
        meaning: lesson.meaning || "",
      });
    }
  };

  const openUpdateModal = () => {
    setSelectedLessonId("");
    setUpdateForm({ title: "", img_url: "", content: "", meaning: "" });
    setUpdateError("");
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLessonId) {
      setUpdateError("Vui lòng chọn bài học.");
      return;
    }
    if (!updateForm.title) {
      setUpdateError("Tiêu đề bài học không được để trống.");
      return;
    }
    setUpdateLoading(true);
    setUpdateError("");
    try {
      await lessonService.update(selectedLessonId, updateForm);
      setShowUpdateModal(false);
      fetchLessons();
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleContentHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltip = e.currentTarget.querySelector(".tooltip-text");
    if (tooltip) {
      tooltip.style.top = `${rect.top - 8}px`;
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
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
            <p className="admin-label">QUẢN LÝ BÀI HỌC</p>
            <div className="admin-toolbar">
              <button
                className="add-user-btn"
                onClick={() => setShowModal(true)}
              >
                <img src="/Assets/Images/Addlessons.png" alt="Thêm bài học" />
              </button>
              <button className="update-user-btn" onClick={openUpdateModal}>
                <img
                  src="/Assets/Images/UpdateLessons.png"
                  alt="Cập nhật bài học"
                />
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Thêm bài học mới</h2>
              <form onSubmit={handleAddLesson}>
                <label>Tiêu đề *</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={modalLoading}
                />

                <label>URL hình ảnh</label>
                <input
                  id="img_url"
                  type="text"
                  value={formData.img_url}
                  onChange={handleChange}
                  disabled={modalLoading}
                />

                <label>Nội dung</label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={handleChange}
                  disabled={modalLoading}
                  rows="3"
                />

                <label>Ý nghĩa</label>
                <input
                  id="meaning"
                  type="text"
                  value={formData.meaning}
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
              <h2>Cập nhật bài học</h2>
              <form onSubmit={handleUpdateSubmit}>
                <label>Chọn bài học *</label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => handleSelectLesson(e.target.value)}
                  disabled={updateLoading}
                >
                  <option value="">-- Chọn bài học --</option>
                  {lessons.map((l) => (
                    <option key={l.les_id} value={l.les_id}>
                      {l.title}
                    </option>
                  ))}
                </select>

                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={updateForm.title}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, title: e.target.value })
                  }
                  disabled={updateLoading}
                />

                <label>URL hình ảnh</label>
                <input
                  type="text"
                  value={updateForm.img_url}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, img_url: e.target.value })
                  }
                  disabled={updateLoading}
                />

                <label>Nội dung</label>
                <textarea
                  value={updateForm.content}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, content: e.target.value })
                  }
                  disabled={updateLoading}
                  rows="3"
                />

                <label>Ý nghĩa</label>
                <input
                  type="text"
                  value={updateForm.meaning}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, meaning: e.target.value })
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
          <div className="table-wrapper">
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Hình ảnh</th>
                    <th>Nội dung</th>
                    <th>Ý nghĩa</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan="6">Chưa có dữ liệu bài học</td>
                    </tr>
                  ) : (
                    lessons.map((l) => (
                      <tr className="user-row" key={l.les_id}>
                        <td>{l.les_id.substring(0, 8)}...</td>
                        <td>{l.title}</td>
                        <td>
                          {l.img_url ? (
                            <img
                              src={l.img_url}
                              alt={l.title}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          ) : (
                            "Không có"
                          )}
                        </td>
                        <td>
                          <div
                            className="content-cell"
                            onMouseEnter={handleContentHover}
                          >
                            <span>{l.content || "-"}</span>
                            {l.content && (
                              <span className="tooltip-text">{l.content}</span>
                            )}
                          </div>
                        </td>
                        <td>{l.meaning || "-"}</td>
                        <td>
                          <button
                            onClick={() => handleDelete(l.les_id)}
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

export default LessonsControl;
