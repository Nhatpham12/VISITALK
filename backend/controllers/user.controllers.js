const users = require("../models/users.model");

const getAll = (req, res) => {
  users.getAll((err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    res.status(200).json(result);
  });
};

const getById = (req, res) => {
  const { id } = req.params;

  users.getById(id, (err, user) => {
    if (err) return res.status(500).json({ message: "lỗi server" });

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.status(200).json(user);
  });
};

const update = (req, res) => {
  const { id } = req.params;
  const { full_name, email, avatar_url } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: "full name không được để trống" });
  }

  users.getById(id, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const data = { full_name, email, avatar_url };
    users.update(id, data, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi cập nhật" });
      res.status(200).json({ message: "Cập nhật thành công" });
    });
  });
};

const updateStatus = (req, res) => {
  const { id } = req.params;
  const { u_status } = req.body;

  if (!u_status || !["active", "inactive"].includes(u_status)) {
    return res.status(400).json({ message: "u_status không hợp lệ" });
  }

  users.getById(id, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    users.updateStatus(id, u_status, (err, result) => {
      if (err)
        return res.status(500).json({ message: "Lỗi cập nhật trạng thái" });

      const msg =
        u_status === "active" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản";
      res.status(200).json({ message: msg });
    });
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  users.getById(id, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    users.delete(id, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi xóa user" });

      res.status(200).json({ message: "Xóa user thành công" });
    });
  });
};

module.exports = { getAll, getById, update, updateStatus, deleteUser };
