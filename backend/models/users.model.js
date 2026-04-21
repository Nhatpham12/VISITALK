const db = require("../common/connect");

const users = (users) => {
  this.id = users.id;
  this.role = users.role;
  this.email = users.mail;
  this.u_status = users.u_status;
  this.last_login = users.last_login;
  this.password_hash = users.password_hash;
  this.created_at = users.created_at;
  this.fullname = users.fullname;
  this.avatar_url = users.avatar_url;
};

users.getById = (id, callback) => {
  const sqlString = "SELECT * FROM user WHERE id = ?";
  db.query(sqlString, id, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
