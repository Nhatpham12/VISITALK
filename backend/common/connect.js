const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  timezone: "+07:00",
  charset: "utf8mb4",
  waitForConnections: true,
  queueLimit: 0,
});

pool.on("connection", (connection) => {
  connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
});

pool.on("error", (err) => console.log("DB pool error: " + err));

module.exports = pool;
