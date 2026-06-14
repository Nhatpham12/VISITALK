/**
 * routes/predict.routes.js
 *
 * Sử dụng vsl_model.joblib (MLPClassifier + StandardScaler).
 * Python process chạy nền (predict_server.py), load model 1 lần.
 *
 * POST /api/predict  — { "features": [84 số] }
 */

const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// ── Đường dẫn ────────────────────────────────────────────────
const PREDICT_SERVER = path.resolve(__dirname, "../predict_server.py");
const MODEL_PATH = path.resolve(
  __dirname, "../..", "frontend/public/model/vsl_model.joblib",
);

function getPythonCmd() {
  if (process.env.PYTHON_PATH) return [process.env.PYTHON_PATH];
  if (process.platform === "win32") return ["py", "-3"];
  return ["python3"];
}

// ── Python process nền ───────────────────────────────────────
const pythonCmd = getPythonCmd();
let pythonProc = null;
let requestQueue = [];
let isProcessing = false;
let buffer = "";

function startPython() {
  if (pythonProc) {
    try { pythonProc.kill(); } catch (_) {}
  }

  pythonProc = spawn(pythonCmd[0], [...pythonCmd.slice(1), PREDICT_SERVER, MODEL_PATH], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  pythonProc.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const result = JSON.parse(trimmed);
        if (requestQueue.length > 0) {
          const { resolve } = requestQueue.shift();
          resolve(result);
        }
      } catch (_) {
        console.error("[predict] Invalid JSON from Python:", trimmed.slice(0, 200));
      }
    }
    isProcessing = false;
    processQueue();
  });

  pythonProc.stderr.on("data", (chunk) => {
    console.error("[predict] Python stderr:", chunk.toString().slice(0, 200));
  });

  pythonProc.on("close", (code) => {
    console.warn(`[predict] Python process exited (code ${code}), restarting...`);
    pythonProc = null;
    isProcessing = false;
    startPython();
  });

  pythonProc.on("error", (err) => {
    console.error("[predict] Python process error:", err.message);
    pythonProc = null;
    isProcessing = false;
  });
}

function processQueue() {
  if (!pythonProc || isProcessing || requestQueue.length === 0) return;
  isProcessing = true;
  const { features, resolve } = requestQueue[0];
  pythonProc.stdin.write(JSON.stringify({ features }) + "\n");
}

// ── Khởi động Python server ──────────────────────────────────
if (fs.existsSync(MODEL_PATH)) {
  startPython();
} else {
  console.warn(`[predict] Model not found at ${MODEL_PATH}, predict API will be unavailable.`);
}

// ── POST /api/predict ─────────────────────────────────────────
router.post("/", express.json(), (req, res) => {
  const { features } = req.body;

  if (!features || !Array.isArray(features)) {
    return res.status(400).json({ error: "Thiếu trường 'features' (mảng 84 số)" });
  }

  if (!pythonProc || !fs.existsSync(MODEL_PATH)) {
    return res.status(503).json({ error: "Predict service unavailable" });
  }

  requestQueue.push({
    features,
    resolve: (result) => {
      if (result.error) return res.status(400).json(result);
      return res.json(result);
    },
  });

  processQueue();
});

// Dọn dẹp khi server shutdown
process.on("exit", () => {
  if (pythonProc) pythonProc.kill();
});
process.on("SIGINT", () => {
  if (pythonProc) pythonProc.kill();
  process.exit();
});
process.on("SIGTERM", () => {
  if (pythonProc) pythonProc.kill();
  process.exit();
});

module.exports = router;
