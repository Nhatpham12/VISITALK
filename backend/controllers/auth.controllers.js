const bcrypt = require("bcrypt");
const users = require("../models/users.model");
const users_sessions = require("../models/userSessions.model");

const SALT_ROUNDS = 10;
// đăng ký
const register = (res, req) => {
  const { username, full_name, password, email, avatar_url } = req.body;

  if (!username || !fullname || !password) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }
  // kiểm tra đã tồn tại chưa
  users.getByUsername(username, (err, exitsingUser) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (exitsingUser) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }

    bcrypt.hash(password, SALT_ROUNDS, (err, password_hash) => {
      if (err) return res.status(500).json({ message: "Lỗi mã hóa password" });

      const data = { username, full_name, password_hash, email, avatar_url };
      users.insert(data, (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi tạo tài khoản" });

        res.status(201).json({ message: "Đăng ký thành công" });
      });
    });
  });
};
