const db = require("../common/connect");

const users_sessions = {};

// Lấy tất cả phiên của 1 user
users_sessions.getByUserId = (users_id, callback) => {
  const sqlString = `
    SELECT * FROM users_sessions 
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
// FIX: chuẩn hóa ip_address (loại bỏ ::ffff:) và giới hạn device 100 ký tự
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
    callback(null, result.affectedRows > 0);
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
    callback(null, result[0]?.duration || 0);
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
