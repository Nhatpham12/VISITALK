const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  timezone: "+07:00",
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.on("connection", () => {
  console.log("[DB] Kết nối MySQL thành công!");
});

pool.on("error", (err) => {
  console.error("[DB] Pool error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("[DB] Mất kết nối database.");
  }
});

module.exports = pool;
