const db = require("../common/connect");

const users_sessions = (users_sessions) => {
  // this.sessions_id = users_sessions.sessions_id;
  // this.users_id    = users_sessions.users_id;
  // this.login_at    = users_sessions.login_at;
  // this.logout_at   = users_sessions.logout_at;
  // this.duration    = users_sessions.duration;
  // this.ip_address  = users_sessions.ip_address;
  // this.device      = users_sessions.device;
};

// lấy tất cả phiên của 1 user
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

// lấy 1 phiên theo sessions_id
users_sessions.getById = (sessions_id, callback) => {
  const sqlString = `SELECT * FROM users_sessions WHERE sessions_id = ?`;
  db.query(sqlString, [sessions_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0] || null);
  });
};

// lấy phiên đang hoạt động (chưa logout) của user
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

// tạo phiên mới khi user đăng nhập
users_sessions.insert = (data, callback) => {
  const sqlString = `
    INSERT INTO users_sessions (users_id, ip_address, device) 
    VALUES (?, ?, ?)`;
  const values = [data.users_id, data.ip_address || null, data.device || null];
  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// đóng phiên khi user đăng xuất
// tự tính duration = logout_at - login_at (giây)
users_sessions.closeSession = (sessions_id, callback) => {
  const sqlString = `
    UPDATE users_sessions
    SET logout_at = NOW(),
        duration  = TIMESTAMPDIFF(SECOND, login_at, NOW())
    WHERE sessions_id = ?`;
  db.query(sqlString, [sessions_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// lấy duration sau khi đóng phiên
// dùng để cộng vào users.total_online_time
users_sessions.getDuration = (sessions_id, callback) => {
  const sqlString = `SELECT duration FROM users_sessions WHERE sessions_id = ?`;
  db.query(sqlString, [sessions_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0]?.duration || 0);
  });
};

// xóa tất cả phiên của 1 user
users_sessions.deleteByUserId = (users_id, callback) => {
  const sqlString = `DELETE FROM users_sessions WHERE users_id = ?`;
  db.query(sqlString, [users_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

module.exports = users_sessions;
