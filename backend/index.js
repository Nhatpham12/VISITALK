const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

app.use(helmet());

// Cho phép cả file:// (origin: null) lẫn localhost khi dev
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5500", // Live Server
  "http://127.0.0.1:5500", // Live Server (IP)
  "null", // file:// protocol
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép nếu không có origin (Postman) hoặc nằm trong danh sách
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: origin không được phép"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Quá nhiều request, vui lòng thử lại sau" },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: "Quá nhiều lần thử đăng nhập, vui lòng chờ 5 phút" },
});

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const lessonsRoutes = require("./routes/lessons.routes");
const userSessionRoutes = require("./routes/userSessions.routes");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/user-sessions", userSessionRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} không tồn tại` });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Lỗi server không xác định" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;
