const bcrypt = require("bcrypt");
const db = require("../common/connect");

const seedAdmin = async () => {
  const username = process.env.ADMIN_USERNAME || "nhat pham";
  const password = process.env.ADMIN_PASSWORD || "08012005";
  const email = process.env.ADMIN_EMAIL || "nhat88672@gmail.com";

  // Kiểm tra xem đã có admin chưa
  const checkSql = "SELECT * FROM users WHERE u_role = 'admin'";
  db.query(checkSql, async (err, results) => {
    if (err) return console.error("Lỗi kiểm tra admin:", err);

    if (results.length === 0) {
      console.log("Chưa có Super Admin, đang tạo mới...");
      const hash = await bcrypt.hash(password, 10);
      const insertSql = `
    INSERT INTO users (username, full_name, password_hash, email, u_role, dob, gender) 
    VALUES (?, ?, ?, ?, 'admin', ?, ?)`;

      db.query(
        insertSql,
        [username, "Super Admin", hash, email, "1990-01-01", "male"],
        (err) => {
          if (err) return console.error("Lỗi tạo admin:", err);
          console.log("Đã tạo Super Admin thành công!");
        },
      );
    }
  });
};

module.exports = seedAdmin;
