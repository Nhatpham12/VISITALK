const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const users = require("../models/users.model");

// GET /api/users — chỉ admin mới xem được danh sách tất cả user
router.get("/", verifyToken, requireRole("admin"), (req, res) => {
  users.getAll((err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
});

// GET /api/users/:id — user xem chính mình, admin xem được tất cả
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  if (req.user.id !== id && req.user.u_role !== "admin") {
    return res
      .status(403)
      .json({ message: "Không có quyền xem thông tin này" });
  }

  users.getById(id, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json(user);
  });
});

// PUT /api/users/:id — user chỉ sửa được chính mình
router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  if (req.user.id !== id && req.user.u_role !== "admin") {
    return res.status(403).json({ message: "Không có quyền chỉnh sửa" });
  }

  const { full_name, email, avatar_url } = req.body;
  if (!full_name) {
    return res.status(400).json({ message: "full_name không được để trống" });
  }

  users.update(id, { full_name, email, avatar_url }, (err, updated) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json({ message: "Cập nhật thành công" });
  });
});

// PATCH /api/users/:id/status — chỉ admin ban/unban user
router.patch("/:id/status", verifyToken, requireRole("admin"), (req, res) => {
  const { id } = req.params;
  const { u_status } = req.body;

  if (!["active", "inactive"].includes(u_status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  users.updateStatus(id, u_status, (err, updated) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json({
      message: `Đã ${u_status === "active" ? "mở khóa" : "khóa"} tài khoản`,
    });
  });
});

// DELETE /api/users/:id — chỉ admin
router.delete("/:id", verifyToken, requireRole("admin"), (req, res) => {
  const { id } = req.params;

  users.delete(id, (err, deleted) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json({ message: "Xóa người dùng thành công" });
  });
});

module.exports = router;
