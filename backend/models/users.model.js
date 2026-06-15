const db = require("../common/connect");

const users = (users) => {};

// Lấy tất cả — KHÔNG trả password_hash
users.getAll = (callback) => {
  const sqlString = `
    SELECT id, username, full_name, dob, gender, email, u_role, u_status,
           avatar_url, last_login, created_at, last_seen, total_online_time
    FROM users`;
  db.query(sqlString, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

// Lấy theo id — trả object hoặc null
users.getById = (id, callback) => {
  const sqlString = `
    SELECT id, username, full_name, dob, gender,email, u_role, u_status,
           avatar_url, last_login, created_at, last_seen, total_online_time
    FROM users WHERE id = ?`;
  db.query(sqlString, [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0] || null);
  });
};

// Lấy theo username — trả object hoặc null
users.getByUsername = (username, callback) => {
  const sqlString = `SELECT * FROM users WHERE username = ?`;
  db.query(sqlString, [username], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0] || null);
  });
};

// Lấy theo email — trả object hoặc null
users.getByEmail = (email, callback) => {
  const sqlString = `SELECT * FROM users WHERE email = ?`;
  db.query(sqlString, [email], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0] || null);
  });
};

// Thêm user mới
users.insert = (data, callback) => {
  const sqlString = `
    INSERT INTO users (username, full_name, dob, gender, password_hash, email, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    data.username,
    data.full_name,
    data.dob,
    data.gender,
    data.password_hash,
    data.email || null,
    data.avatar_url || null,
  ];
  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.insertId);
  });
};

// Update thông tin cá nhân
users.update = (id, data, callback) => {
  const sqlString = `
    UPDATE users
    SET full_name = ?, dob = ?, gender = ?, email = ?, avatar_url = ?, username = ?
    WHERE id = ?`;
  const values = [
    data.full_name,
    data.dob,
    data.gender,
    data.email,
    data.avatar_url,
    data.username,
    id,
  ];
  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// Xóa user
users.delete = (id, callback) => {
  db.query(`DELETE FROM users WHERE id = ?`, [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// Update last_login và last_seen khi đăng nhập
users.updateLastLogin = (id, callback) => {
  const sqlString = `
    UPDATE users SET last_login = NOW(), last_seen = NOW()
    WHERE id = ?`;
  db.query(sqlString, [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// Cộng thêm thời gian online sau khi đăng xuất
users.updateOnlineTime = (id, sessionDuration, callback) => {
  const sqlString = `
    UPDATE users
    SET last_seen = NOW(),
        total_online_time = total_online_time + ?
    WHERE id = ?`;
  db.query(sqlString, [sessionDuration, id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// Update status (active/inactive) — dùng cho admin ban user
users.updateStatus = (id, status, callback) => {
  const sqlString = `UPDATE users SET u_status = ? WHERE id = ?`;
  db.query(sqlString, [status, id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

module.exports = users;
