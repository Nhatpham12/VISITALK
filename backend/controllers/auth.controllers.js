const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../models/users.model");
const users_sessions = require("../models/userSessions.model");

const SALT_ROUNDS = 10;

// Đăng ký
const register = (req, res) => {
  const { username, full_name, dob, gender, password, email, avatar_url } =
    req.body;

  if (!username || !full_name || !password || !dob || !gender) {
    console.log(`[REGISTER] Thiếu thông tin bắt buộc: username=${!!username}, full_name=${!!full_name}, password=${!!password}, dob=${!!dob}, gender=${!!gender}`);
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }

  if (password.length < 8) {
    console.log(`[REGISTER] Mật khẩu quá ngắn (${password.length} ký tự): username=${username}`);
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 8 ký tự" });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    console.log(`[REGISTER] Username không hợp lệ: ${username}`);
    return res.status(400).json({ message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới" });
  }

  const doInsert = () => {
    bcrypt.hash(password, SALT_ROUNDS, (err, password_hash) => {
      if (err) {
        console.error(`[REGISTER] Lỗi mã hóa password:`, err.message);
        return res.status(500).json({ message: "Lỗi mã hóa password" });
      }
      const data = { username, dob, gender, full_name, password_hash, email, avatar_url };
      users.insert(data, (err, insertId) => {
        if (err) {
          console.error(`[REGISTER] Lỗi insert user: ${err.message}, username=${username}`);
          return res.status(500).json({ message: "Lỗi tạo tài khoản" });
        }
        console.log(`[REGISTER] Đăng ký thành công: username=${username}, id=${insertId}`);

        // Auto-login: tạo session và trả token
        users.getByUsername(username, (err, newUser) => {
          if (err) {
            console.log(`[REGISTER] Đăng ký thành công nhưng auto-login thất bại`);
            return res.status(201).json({ message: "Đăng ký thành công" });
          }

          users.updateLastLogin(newUser.id, (err) => {
            if (err) {
              console.log(`[REGISTER] Đăng ký thành công nhưng auto-login thất bại`);
              return res.status(201).json({ message: "Đăng ký thành công" });
            }

            const sessionData = {
              users_id: newUser.id,
              ip_address: req.ip,
              device: req.headers["user-agent"] || null,
            };

            users_sessions.insert(sessionData, (err, session_id) => {
              if (err) {
                console.log(`[REGISTER] Đăng ký thành công nhưng auto-login thất bại`);
                return res.status(201).json({ message: "Đăng ký thành công" });
              }

              users_sessions.getActiveSession(newUser.id, (err, session) => {
                if (err || !session) {
                  console.log(`[REGISTER] Đăng ký thành công nhưng auto-login thất bại`);
                  return res.status(201).json({ message: "Đăng ký thành công" });
                }

                const token = jwt.sign(
                  {
                    id: newUser.id,
                    username: newUser.username,
                    u_role: newUser.u_role,
                    sessions_id: session.sessions_id,
                  },
                  process.env.JWT_SECRET || "visitalk_secret",
                  { expiresIn: "7d" },
                );

                res.status(201).json({
                  message: "Đăng ký thành công",
                  token,
                  user: {
                    id: newUser.id,
                    username: newUser.username,
                    full_name: newUser.full_name,
                    email: newUser.email,
                    u_role: newUser.u_role,
                    avatar_url: newUser.avatar_url,
                    dob: newUser.dob,
                    gender: newUser.gender,
                  },
                });
              });
            });
          });
        });
      });
    });
  };

  users.getByUsername(username, (err, existingUser) => {
    if (err) {
      console.error(`[REGISTER] Lỗi query username:`, err.message);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (existingUser) {
      console.log(`[REGISTER] Username đã tồn tại: ${username}`);
      return res.status(400).json({ message: "Username đã tồn tại" });
    }

    if (email) {
      users.getByEmail(email, (err, existingEmail) => {
        if (err) {
          console.error(`[REGISTER] Lỗi query email:`, err.message);
          return res.status(500).json({ message: "Lỗi server" });
        }
        if (existingEmail) {
          console.log(`[REGISTER] Email đã tồn tại: ${email}`);
          return res.status(400).json({ message: "Email đã được sử dụng" });
        }
        doInsert();
      });
    } else {
      doInsert();
    }
  });
};

// Đăng nhập
const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log(`[LOGIN] Thiếu thông tin: username=${!!username}, password=${!!password}`);
    return res
      .status(400)
      .json({ message: "Vui lòng nhập username và password" });
  }

  users.getByUsername(username, (err, user) => {
    if (err) {
      console.error(`[LOGIN] Lỗi query user:`, err.message);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (!user) {
      console.log(`[LOGIN] Tài khoản không tồn tại: ${username}`);
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }
    if (user.u_status === "inactive") {
      console.log(`[LOGIN] Tài khoản đã bị khóa: ${username}`);
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) {
        console.error(`[LOGIN] Lỗi bcrypt compare:`, err.message);
        return res.status(500).json({ message: "Lỗi server" });
      }
      if (!isMatch) {
        console.log(`[LOGIN] Sai mật khẩu: ${username}`);
        return res.status(401).json({ message: "Sai mật khẩu" });
      }
      console.log(`[LOGIN] Đăng nhập thành công: ${username}`);
      users.updateLastLogin(user.id, (err) => {
        if (err)
          return res.status(500).json({ message: "Lỗi cập nhật đăng nhập" });

        const sessionData = {
          users_id: user.id,
          ip_address: req.ip,
          device: req.headers["user-agent"] || null,
        };

        users_sessions.insert(sessionData, (err, session_id) => {
          if (err) return res.status(500).json({ message: "Lỗi tạo phiên" });
          if (!session_id)
            return res
              .status(500)
              .json({ message: "Không lấy được session_id" });

          users_sessions.getActiveSession(user.id, (err, session) => {
            if (err) return res.status(500).json({ message: "Lỗi lấy phiên" });

            // Ký JWT
            const token = jwt.sign(
              {
                id: user.id,
                username: user.username,
                u_role: user.u_role,
                sessions_id: session.sessions_id,
              },
              process.env.JWT_SECRET || "visitalk_secret",
              { expiresIn: "7d" },
            );

            res.status(200).json({
              message: "Đăng nhập thành công",
              token,
              user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                u_role: user.u_role,
                avatar_url: user.avatar_url,
                dob: user.dob,
                gender: user.gender,
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
  if (!req.user) {
    return res.status(401).json({ message: "Người dùng chưa đăng nhập" });
  }
  const { sessions_id, id: users_id } = req.user;

  users_sessions.closeSession(sessions_id, (err) => {
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
