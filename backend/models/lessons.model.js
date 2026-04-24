const db = require("../common/connect");

const lessons = (lessons) => {
  // this.les_id = lessons.les_id;
  // this.title = lessons.title;
  // this.img_url = lessons.img_url;
  // this.content= lessons.content;
  // this.meaning = lessons.meaning;
};

lessons.getAll = (callback) => {
  const sqlString = `SELECT * FROM  lessons`;
  db.query(sqlString, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

lessons.getById = (id, callback) => {
  const sqlString = `SELECT * FROM lessons WHERE les_id = ?`;
  db.query(sqlString, [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

lessons.getByContent = (content, callback) => {
  const sqlString = "SELECT * FROM lessons WHERE content = ?";
  db.query(sqlString, [content], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

lessons.getByTitle = (title, callback) => {
  const sqlString = "SELECT * FROM lessons WHERE title = ?";
  db.query(sqlString, [title], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

lessons.insert = (data, callback) => {
  const sqlString = `INSERT INTO lessons (title, img_url, content, meaning) VALUES (?,?,?,?)`;
  const values = [
    data.title,
    data.img_url || null,
    data.content || null,
    data.meaning || null,
  ];
  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

lessons.update = (les_id, data, callback) => {
  const sqlString = `
    UPDATE lessons
    SET title = ?, img_url = ?, content = ?, meaning = ? 
    WHERE les_id = ?`;
  const values = [data.title, data.img_url, data.content, data.meaning, les_id];
  db.query(sqlString, values, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

lessons.delete = (les_id, callback) => {
  const sqlString = `DELETE FROM lessons where les_id = ?`;
  db.query(sqlString, [les_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result.affectedRows > 0);
  });
};

module.exports = lessons;
