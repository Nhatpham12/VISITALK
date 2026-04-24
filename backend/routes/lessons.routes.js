const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const lessons = require("../models/lessons.model");

// GET /api/lessons — tất cả user đã đăng nhập đều xem được
router.get("/", verifyToken, (req, res) => {
  lessons.getAll((err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
});

// GET /api/lessons/:id
router.get("/:id", verifyToken, (req, res) => {
  lessons.getById(req.params.id, (err, lesson) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!lesson)
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    res.status(200).json(lesson);
  });
});

// POST /api/lessons — chỉ admin thêm bài học
router.post("/", verifyToken, requireRole("admin"), (req, res) => {
  const { title, img_url, content, meaning } = req.body;
  if (!title)
    return res.status(400).json({ message: "Tiêu đề không được để trống" });

  lessons.insert({ title, img_url, content, meaning }, (err) => {
    if (err) return res.status(500).json({ message: "Lỗi tạo bài học" });
    res.status(201).json({ message: "Tạo bài học thành công" });
  });
});

// PUT /api/lessons/:id — chỉ admin sửa bài học
router.put("/:id", verifyToken, requireRole("admin"), (req, res) => {
  const { title, img_url, content, meaning } = req.body;
  if (!title)
    return res.status(400).json({ message: "Tiêu đề không được để trống" });

  lessons.update(
    req.params.id,
    { title, img_url, content, meaning },
    (err, updated) => {
      if (err) return res.status(500).json({ message: "Lỗi server" });
      if (!updated)
        return res.status(404).json({ message: "Không tìm thấy bài học" });
      res.status(200).json({ message: "Cập nhật bài học thành công" });
    },
  );
});

// DELETE /api/lessons/:id — chỉ admin
router.delete("/:id", verifyToken, requireRole("admin"), (req, res) => {
  lessons.delete(req.params.id, (err, deleted) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    res.status(200).json({ message: "Xóa bài học thành công" });
  });
});

module.exports = router;
