const bcrypt = require("bcrypt");
const users = require("../models/users.model");
const users_sessions = require("../models/userSessions.model");

const SALT_ROUNDS = 10;
// đăng ký
const register = (req, res) => {
  const { username, full_name, password, email, avatar_url } = req.body;

  if (!username || !full_name || !password) {
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

// log In
const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập username và password" });
  }

  users.getByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (!user)
      return res.status(404).json({ message: "Tài khoản không tồn tại" });

    if (user.u_status === "inactive") {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Lỗi server" });

      if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

      users.updateLastLogin(user.id, (err) => {
        if (err)
          return res.status(500).json({ message: "Lỗi cập nhật đăng nhập" });

        const sessionData = {
          users_id: user.id,
        };

        users_sessions.insert(sessionData, (err, result) => {
          if (err) return res.status(500).json({ message: "Lỗi tạo phiên" });

          users_sessions.getActiveSession(user.id, (err, session) => {
            if (err) return res.status(500).json({ message: "Lỗi lấy phiên" });

            res.status(200).json({
              message: "Đăng nhập thành công",
              sessions_id: session.sessions_id,
              user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                u_role: user.u_role,
                avatar_url: user.avatar_url,
              },
            });
          });
        });
      });
    });
  });
};

// Đăng xuất
const logout = (req, res) => {
  const { sessions_id, users_id } = req.body;

  if (!sessions_id || !users_id) {
    return res.status(400).json({ message: "Thiếu thông tin phiên" });
  }

  users_sessions.closeSession(sessions_id, (err, success) => {
    if (err) return res.status(500).json({ message: "Lỗi đóng phiên" });

    users_sessions.getDuration(sessions_id, (err, duration) => {
      if (err) return res.status(500).json({ message: "Lỗi lấy duration" });

      users.updateOnlineTime(users_id, duration, (err) => {
        if (err)
          return res.status(500).json({ message: "Lỗi cập nhật thời gian" });

        res.status(200).json({ message: "Đăng xuất thành công" });
      });
    });
  });
};

module.exports = { register, login, logout };
