/**
 * routes/predict.routes.js
 *
 * Endpoint nhận diện ngôn ngữ ký hiệu Việt Nam.
 * Nhận frame webcam (multipart/form-data), gọi Python predict.py,
 * trả về kết quả JSON.
 *
 * Được mount trong index.js:
 *   app.use("/api/predict", predictLimiter, predictRoutes);
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// ── Multer: lưu frame tạm vào memory ──────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh"), false);
    }
    cb(null, true);
  },
});

// Đường dẫn tới Python script và model
// __dirname = .../server/routes/ → lên 2 cấp → gốc project → model/
const PREDICT_SCRIPT = path.resolve(__dirname, "../predict.py");
const MODEL_PATH = path.resolve(
  __dirname,
  `../Model/vietnamese_sign_language_model.keras`,
);

// ── POST /api/predict ──────────────────────────────────────────
router.post("/", upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Thiếu trường 'image' trong form-data" });
  }

  // Kiểm tra model tồn tại (báo lỗi rõ ràng thay vì crash)
  if (!fs.existsSync(MODEL_PATH)) {
    return res.status(503).json({
      message: "Model chưa được cấu hình",
      detail: `Không tìm thấy: ${MODEL_PATH}`,
    });
  }

  // Ghi buffer ra file tạm để Python đọc
  const tmpPath = path.join(
    require("os").tmpdir(),
    `vsl_frame_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
  );

  try {
    fs.writeFileSync(tmpPath, req.file.buffer);
  } catch (e) {
    return next(new Error("Không thể ghi file tạm: " + e.message));
  }

  // Gọi Python
  const python = spawn("python3", [PREDICT_SCRIPT, tmpPath, MODEL_PATH]);

  let stdout = "";
  let stderr = "";

  python.stdout.on("data", (d) => {
    stdout += d.toString();
  });
  python.stderr.on("data", (d) => {
    stderr += d.toString();
  });

  python.on("close", (code) => {
    // Dọn file tạm
    try {
      fs.unlinkSync(tmpPath);
    } catch (_) {}

    if (code !== 0) {
      console.error("[predict] Python exit", code, stderr.slice(0, 300));
      return res.status(500).json({
        message: "Lỗi khi chạy mô hình",
        detail: stderr.slice(0, 300),
      });
    }

    try {
      const result = JSON.parse(stdout.trim());
      return res.json(result);
    } catch (_) {
      return res.status(500).json({
        message: "Không parse được kết quả từ Python",
        raw: stdout.slice(0, 200),
      });
    }
  });

  python.on("error", (err) => {
    try {
      fs.unlinkSync(tmpPath);
    } catch (_) {}
    if (err.code === "ENOENT") {
      return res.status(500).json({
        message: "Không tìm thấy python3. Hãy cài Python 3.9+ và tensorflow.",
      });
    }
    next(err);
  });
});

module.exports = router;
