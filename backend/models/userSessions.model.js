const db = require("../common/connect");

const users_sessions = {};

// Lấy tất cả phiên của 1 user
// userSessions.model.js — sửa getByUserId
users_sessions.getByUserId = (users_id, callback) => {
  const sqlString = `
    SELECT *,
      CASE 
        WHEN logout_at IS NULL 
        THEN TIMESTAMPDIFF(SECOND, login_at, NOW())  -- ✅ tính realtime khi còn active
        ELSE duration                                  -- dùng giá trị đã lưu nếu đã logout
      END AS current_duration
    FROM users_sessions 
    WHERE users_id = ? 
    ORDER BY login_at DESC`;
  db.query(sqlString, [users_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

// Lấy 1 phiên theo sessions_id
users_sessions.getById = (sessions_id, callback) => {
  const sqlString = `SELECT * FROM users_sessions WHERE sessions_id = ?`;
  db.query(sqlString, [sessions_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0] || null);
  });
};

// Lấy phiên đang hoạt động (chưa logout) mới nhất của user
users_sessions.getActiveSession = (users_id, callback) => {
  const sqlString = `
    SELECT * FROM users_sessions 
    WHERE users_id = ? AND logout_at IS NULL
    ORDER BY login_at DESC 
    LIMIT 1`;
  db.query(sqlString, [users_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0] || null);
  });
};

// Lấy phiên đang hoạt động theo sessions_id
users_sessions.getActiveSessionById = (sessions_id, callback) => {
  const sqlString = `
    SELECT * FROM users_sessions
    WHERE sessions_id = ? AND logout_at IS NULL`;
  db.query(sqlString, [sessions_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0] || null);
  });
};

// Tạo phiên mới khi user đăng nhập
users_sessions.insert = (data, callback) => {
  const rawIp = (data.ip_address || "").replace("::ffff:", "").trim();
  const ip_address = rawIp.length > 0 ? rawIp.substring(0, 45) : null;
  const device = data.device ? data.device.substring(0, 100) : null;

  const sqlString = `
    INSERT INTO users_sessions (users_id, ip_address, device) 
    VALUES (?, ?, ?)`;
  const values = [data.users_id, ip_address, device];

  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    // FIX: bảng dùng UUID tự sinh nên insertId = 0, kiểm tra affectedRows
    callback(null, result.insertId || result.affectedRows > 0);
  });
};

// Đóng phiên khi user đăng xuất — tự tính duration (giây)
users_sessions.closeSession = (sessions_id, callback) => {
  const sqlString = `
    UPDATE users_sessions
    SET logout_at = NOW(),
        duration  = TIMESTAMPDIFF(SECOND, login_at, NOW())
    WHERE sessions_id = ? AND logout_at IS NULL`;
  db.query(sqlString, [sessions_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// Lấy duration sau khi đóng phiên
// Dùng để cộng vào users.total_online_time
users_sessions.getDuration = (sessions_id, callback) => {
  const sqlString = `SELECT duration FROM users_sessions WHERE sessions_id = ?`;
  db.query(sqlString, [sessions_id], (err, result) => {
    if (err) return callback(err, null);
    if (!result[0]) return callback(new Error("Session không tồn tại"), null);

    const duration = result[0].duration ?? 0;
    callback(null, duration);
  });
};

// Xóa tất cả phiên của 1 user (admin)
users_sessions.deleteByUserId = (users_id, callback) => {
  const sqlString = `DELETE FROM users_sessions WHERE users_id = ?`;
  db.query(sqlString, [users_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

module.exports = users_sessions;
