const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const users_sessions = require("../models/userSessions.model");

// GET /api/user-sessions/me — user xem lịch sử phiên của chính mình
router.get("/me", verifyToken, (req, res) => {
  users_sessions.getByUserId(req.user.id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
});

// GET /api/user-sessions/:userId — chỉ admin xem phiên của bất kỳ user
router.get("/:userId", verifyToken, requireRole("admin"), (req, res) => {
  users_sessions.getByUserId(req.params.userId, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
});

// DELETE /api/user-sessions/:userId — chỉ admin xóa toàn bộ phiên của 1 user
router.delete("/:userId", verifyToken, requireRole("admin"), (req, res) => {
  users_sessions.deleteByUserId(req.params.userId, (err, deleted) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json({ message: "Đã xóa toàn bộ phiên" });
  });
});

module.exports = router;
