const bcrypt = require("bcrypt");
const db = require("../common/connect");

const seedAdmin = async () => {
  try {
    const username = process.env.ADMIN_USERNAME || "nhat pham";
    const password = process.env.ADMIN_PASSWORD || "08012005";
    const email = process.env.ADMIN_EMAIL || "nhat88672@gmail.com";

    const checkSql = "SELECT * FROM users WHERE u_role = 'admin'";
    const [results] = await db.promise().query(checkSql);

    if (results.length === 0) {
      console.log("Chưa có Super Admin, đang tạo mới...");
      const hash = await bcrypt.hash(password, 10);
      const insertSql = `
    INSERT INTO users (username, full_name, password_hash, email, u_role, dob, gender) 
    VALUES (?, ?, ?, ?, 'admin', ?, ?)`;

      await db.promise().query(insertSql, [username, "Super Admin", hash, email, "1990-01-01", "male"]);
      console.log("Đã tạo Super Admin thành công!");
    }
  } catch (err) {
    console.error("Lỗi seed admin:", err);
  }
};

module.exports = seedAdmin;
