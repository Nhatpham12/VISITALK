const users_sessions = require("../models/userSessions.model");

// Lấy tất cả phiên của chính mình (lấy từ req.user do middleware gắn)
const getMySessions = (req, res) => {
  users_sessions.getByUserId(req.user.id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
};

// Lấy tất cả phiên của 1 user theo id — chỉ admin
const getByUserId = (req, res) => {
  const { userId } = req.params;
  users_sessions.getByUserId(userId, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
};

// Lấy 1 phiên theo sessions_id
const getById = (req, res) => {
  const { id } = req.params;
  users_sessions.getById(id, (err, session) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!session)
      return res.status(404).json({ message: "Không tìm thấy phiên" });
    res.status(200).json(session);
  });
};

// Xóa toàn bộ phiên của 1 user — chỉ admin
const deleteByUserId = (req, res) => {
  const { userId } = req.params;
  users_sessions.deleteByUserId(userId, (err) => {
    if (err) return res.status(500).json({ message: "Lỗi xóa phiên" });
    res.status(200).json({ message: "Đã xóa toàn bộ phiên của user" });
  });
};

module.exports = { getMySessions, getByUserId, getById, deleteByUserId };
