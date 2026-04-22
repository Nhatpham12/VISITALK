const db = require("../common/connect");

const access_to = (access_to) => {
  // this.users_id = access_to.users_id;
  // this.les_id = access_to.les_id;
  // this.accessed_at = access_to.accessed_at;
};

// lấy bài học mà 1 user đã truy cập
access_to.getByUserId = (user_id, callback) => {
  const sqlString = "SELECT * FROM access_to WHERE users_id = ?";
  db.query(sqlString, [user_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

// lấy tất cả users đã truy cập vào 1 bài học
access_to.getByLessonId = (les_id, callback) => {
  const sqlString = "SELECT * FROM access_to WHERE les_id = ?";
  db.query(sqlString, [les_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

// kiểm tra user đã học bài này chưa
access_to.checkAccess = (users_id, les_id, callback) => {
  const sqlString = `SELECT * FROM access_to WHERE users_id = ? AND les_id = ?`;
  db.query(sqlString, [users_id, les_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.length > 0);
  });
};

// thêm bản ghi khi user truy cập bài học lần đầu
access_to.insert = (data, callback) => {
  const sqlString = `INSERT INTO access_to (users_id, les_id) VALUES (?,?)`;
  const values = [data.users_id, data.les_id];
  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// cập nhật access_to khi user truy cập lại bài học
access_to.updateAccessedAt = (users_id, les_id, callback) => {
  const sqlString = `
    UPDATE access_to 
    SET accessed_at = NOW() 
    WHERE users_id = ? AND les_id = ?`;
  db.query(sqlString, [users_id, les_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

// xóa 1 bản truy cập
access_to.delete = (users_id, les_id, callback) => {
  const sqlString = `DELETE FROM access_to WHERE users_id = ? AND les_id = ?`;
  db.query(sqlString, [users_id, les_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};
