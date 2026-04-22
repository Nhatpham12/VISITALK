const bcrypt = require("bcrypt");
const users = require("../models/users.model");
const users_sessions = require("../models/userSessions.model");

// đăng ký
const register = (res, req) => {
  const { username, full_name, password, email, avatar_url } = req.body;

  if (!username || !fullname || !password) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }
};

// kiểm tra đã tồn tại chưa
