const lessons = require("../models/lessons.model");

// Lấy tất cả bài học
const getAll = (req, res) => {
  lessons.getAll((err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
};

// Lấy bài học theo id
const getById = (req, res) => {
  const { id } = req.params;
  lessons.getById(id, (err, lesson) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!lesson)
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    res.status(200).json(lesson);
  });
};

// Thêm bài học mới — chỉ admin
const insert = (req, res) => {
  const { title, img_url, content, meaning } = req.body;
  if (!title)
    return res.status(400).json({ message: "Tiêu đề không được để trống" });

  lessons.insert({ title, img_url, content, meaning }, (err) => {
    if (err) return res.status(500).json({ message: "Lỗi tạo bài học" });
    res.status(201).json({ message: "Tạo bài học thành công" });
  });
};

// Cập nhật bài học — chỉ admin
const update = (req, res) => {
  const { id } = req.params;
  const { title, img_url, content, meaning } = req.body;
  if (!title)
    return res.status(400).json({ message: "Tiêu đề không được để trống" });

  lessons.getById(id, (err, lesson) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!lesson)
      return res.status(404).json({ message: "Không tìm thấy bài học" });

    lessons.update(id, { title, img_url, content, meaning }, (err, updated) => {
      if (err) return res.status(500).json({ message: "Lỗi cập nhật" });
      res.status(200).json({ message: "Cập nhật bài học thành công" });
    });
  });
};

// Xóa bài học — chỉ admin
const deletelesson = (req, res) => {
  const { id } = req.params;

  lessons.getById(id, (err, lesson) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!lesson)
      return res.status(404).json({ message: "Không tìm thấy bài học" });

    lessons.delete(id, (err) => {
      if (err) return res.status(500).json({ message: "Lỗi xóa bài học" });
      res.status(200).json({ message: "Xóa bài học thành công" });
    });
  });
};

module.exports = { getAll, getById, insert, update, deletelesson };
