const accessTo = require("../models/accessTo.model");

// Lấy tất cả bài học mà 1 user đã truy cập
const getByUserId = (req, res) => {
  const userId = req.params.userId || req.user.id;
  accessTo.getByUserId(userId, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
};

// Lấy tất cả user đã truy cập 1 bài học — chỉ admin
const getByLessonId = (req, res) => {
  const { lessonId } = req.params;
  accessTo.getByLessonId(lessonId, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.status(200).json(result);
  });
};

// Ghi lại lượt truy cập bài học của user
// Gọi khi user mở 1 bài học
const recordAccess = (req, res) => {
  const users_id = req.user.id;
  const { les_id } = req.body;

  if (!les_id) return res.status(400).json({ message: "Thiếu les_id" });

  accessTo.insert({ users_id, les_id }, (err) => {
    if (err) {
      // Nếu đã tồn tại (duplicate primary key) thì cập nhật accessed_at
      if (err.code === "ER_DUP_ENTRY") {
        accessTo.updateAccessedAt(users_id, les_id, (err2) => {
          if (err2)
            return res.status(500).json({ message: "Lỗi cập nhật truy cập" });
          return res.status(200).json({ message: "Đã cập nhật lượt truy cập" });
        });
        return;
      }
      return res.status(500).json({ message: "Lỗi ghi nhận truy cập" });
    }
    res.status(201).json({ message: "Ghi nhận truy cập thành công" });
  });
};

// Xóa lịch sử truy cập 1 bài học của user — chỉ admin
const deleteAccess = (req, res) => {
  const { userId, lessonId } = req.params;
  accessTo.delete(userId, lessonId, (err, deleted) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy bản ghi" });
    res.status(200).json({ message: "Đã xóa lịch sử truy cập" });
  });
};

module.exports = { getByUserId, getByLessonId, recordAccess, deleteAccess };
