const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  timezone: "+07:00",
});
pool.on("error", (err) => console.log("DB pool error: " + err));

module.exports = pool;
