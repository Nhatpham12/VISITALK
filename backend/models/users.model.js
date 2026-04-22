const db = require("../common/connect");

// khởi tạo đối tượng users
const users = (users) => {
  //   this.id = users.id;
  //   this.role = users.role;
  //   this.email = users.mail;
  //   this.u_status = users.u_status;
  //   this.last_login = users.last_login;
  //   this.password_hash = users.password_hash;
  //   this.created_at = users.created_at;
  //   this.fullname = users.fullname;
  //   this.avatar_url = users.avatar_url;
};

// phương thức lấy tất cả giá trị
users.getAll = (callback) => {
  const sqlString = "SELECT * FROM users ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};

// phương thức lấy theo id người dùng
users.getById = (id, callback) => {
  const sqlString = "SELECT * FROM users where id = ?";
  db.query(sqlString, [id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};

// phương thức lấy theo username
users.getByUsername = (username, callback) => {
  const sqlString = "SELECT * FROM users where username = ?";
  db.query(sqlString, [username], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};

// phương thức lấy theo email
users.getByEmail = (email, callback) => {
  const sqlString = "SELECT * FROM users where email = ?";
  db.query(sqlString, [email], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};

// phương thức thêm người dùng mới
users.insert = (data, callback) => {
  const sqlString =
    "INSERT INTO users (username, full_name, password_hash, email, avatar_url) VALUES (?,?,?,?,?)";
  const values = [
    data.username,
    data.full_name,
    data.password_hash,
    data.email || null,
    data.avatar_url || null,
  ];
  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.insertId);
  });
};

// phương thức update thông tin người dùng theo id
users.update = (id, data, callback) => {
  const sqlString = `
    UPDATE users
    SET full_name = ?, email = ?, avatar_url = ?
    WHERE id = ?
  `;
  const values = [data.full_name, data.email, data.avatar_url, id];
  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// phương thức xóa thông tin người dùng
users.delete = (id, callback) => {
  db.query(`DELETE FROM users WHERE id = ?`, [id], (err, res) => {
    if (err) return callback(err, null);
    callback(
      null,
      result.affectedRows > 0,
      "xóa băng đĩa id = " + id + " thành công",
    );
  });
};

// update last login và last seen khi đăng nhập
users.updateLastLogin = (id, callback) => {
  const sqlString = `UPDATE users SET last_login = NOW(), last_seen = NOW()
    WHERE id = ?`;
  db.query(sqlString, [id], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, result.affectedRows > 0);
  });
};

users.updateOnlineTime = (id, sessionDuration, callback) => {
  const sqlString = `
    UPDATE users
    SET last_seen = NOW(),
        total_online_time = total_online_time + ?
    WHERE id = ? `;
  db.query(sqlString, [sessionDuration, id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

module.exports = users;
