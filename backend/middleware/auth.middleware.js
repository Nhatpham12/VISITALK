const jwt = require("jsonwebtoken");
const users_sessions = require("../models/userSessions.model");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token xác thực" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token đã hết hạn" });
      }
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Kiểm tra session còn active không (logout_at == NULL)
    users_sessions.getActiveSessionById(decoded.sessions_id, (err, session) => {
      if (err) return res.status(500).json({ message: "Lỗi server" });

      if (!session) {
        return res.status(401).json({
          message: "Phiên đăng nhập đã kết thúc, vui lòng đăng nhập lại",
        });
      }

      // Gắn thông tin user vào request để các middleware/controller sau dùng
      req.user = {
        id: decoded.id,
        username: decoded.username,
        u_role: decoded.u_role,
        sessions_id: decoded.sessions_id,
      };

      next();
    });
  });
};

module.exports = { verifyToken };
