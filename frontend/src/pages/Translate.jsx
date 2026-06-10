import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import "../CSS/Translate.css";

const CLASSES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "del",
  "nothing",
  "space",
];

// FIX #6/#7: Đúng ngưỡng theo yêu cầu
const CONF_THRESH = 0.8; // 80%
const STABLE_FRAMES = 12; // 12 frame liên tiếp
const MODEL_URL = "/model/model.json";
const MODEL_TIMEOUT_MS = 120_000;

// ─────────────────────────────────────────────────────────────────
// WEB WORKER SOURCE
// FIX #1: Không dùng tf.browser.fromPixels() trong Worker (không có DOM)
//         → tách RGB thủ công từ RGBA Uint8Array
// FIX #2: Dùng đúng GlobalAveragePooling2D (mean over spatial dims)
//         thay vì reshape([n, 32768]) (Flatten – sai kiến trúc)
// FIX #8: fromPixels thay bằng tf.tensor3d trực tiếp từ Float32Array RGB
// ─────────────────────────────────────────────────────────────────
const WORKER_SRC = `
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js");

let weights = null;

// ── Helpers ──────────────────────────────────────────────────────
function joinModelPath(base, rel) {
  return new URL(rel, base).href;
}

function concatBuffers(buffers) {
  const total = buffers.reduce((s, b) => s + b.byteLength, 0);
  const out   = new Uint8Array(total);
  let   off   = 0;
  for (const b of buffers) { out.set(new Uint8Array(b), off); off += b.byteLength; }
  return out.buffer;
}

async function fetchBuf(url, onProg) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(url + " → HTTP " + res.status);
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body) {
    const buf = await res.arrayBuffer();
    if (onProg) onProg(buf.byteLength, buf.byteLength || total);
    return buf;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.byteLength;
    if (onProg) onProg(got, total);
  }
  return concatBuffers(chunks.map(c => c.buffer.slice(c.byteOffset, c.byteOffset + c.byteLength)));
}

// ── Batch Normalization ───────────────────────────────────────────
function applyBN(x, name) {
  return tf.batchNorm(
    x,
    weights[name + "/moving_mean"],
    weights[name + "/moving_variance"],
    weights[name + "/beta"],
    weights[name + "/gamma"],
    0.001
  );
}

// ── Conv block: Conv2D → BN → ReLU → MaxPool ─────────────────────
function convBlock(x, convName, bnName) {
  return tf.tidy(() => {
    const conv = tf.conv2d(x, weights[convName + "/kernel"], [1,1], "same")
                   .add(weights[convName + "/bias"]);
    const bn   = applyBN(conv, bnName);
    return tf.maxPool(bn.relu(), [2,2], [2,2], "valid");
  });
}

// ── Forward pass ─────────────────────────────────────────────────
// Architecture từ model.json:
//   Input [1,128,128,3]
//   Rescaling ÷255        → đã xử lý trước khi gọi hàm này
//   convBlock1 → [1,64,64,32]
//   convBlock2 → [1,32,32,64]
//   convBlock3 → [1,16,16,128]
//   GlobalAveragePooling2D → mean over axes [1,2] → [1,128]   ← FIX #2 & #9
//   Dense(256, relu)       → [1,256]
//   Dropout(0.4)           → bypass khi inference
//   Dense(29, softmax)     → [1,29]
function predictTensor(input) {
  return tf.tidy(() => {
    // Rescaling: ÷255 (scale = 0.00392156862745098 từ model.json)
    let x = input.toFloat().mul(0.00392156862745098);

    x = convBlock(x, "conv1", "bn1");   // → [1, 64, 64,  32]
    x = convBlock(x, "conv2", "bn2");   // → [1, 32, 32,  64]
    x = convBlock(x, "conv3", "bn3");   // → [1, 16, 16, 128]

    // FIX #2: GlobalAveragePooling2D = mean over spatial axes (1 và 2)
    x = x.mean([1, 2]);                 // → [1, 128]

    // Dense fc1: relu
    x = tf.matMul(x, weights["fc1/kernel"])
          .add(weights["fc1/bias"])
          .relu();                       // → [1, 256]

    // Dropout bỏ qua khi inference (training=false là mặc định)

    // Dense output: softmax
    x = tf.matMul(x, weights["output/kernel"])
          .add(weights["output/bias"]); // → [1, 29]

    return tf.softmax(x);
  });
}

// ── Load model weights từ model.json + .bin ───────────────────────
async function loadWeights(modelUrl) {
  const res = await fetch(modelUrl);
  if (!res.ok) throw new Error("Không tải được model.json: HTTP " + res.status);
  const json     = await res.json();
  const manifest = json.weightsManifest || [];
  const specs    = manifest.flatMap(g => g.weights || []);
  const paths    = manifest.flatMap(g => g.paths   || []);

  const buffers = [];
  let done = 0;
  for (const p of paths) {
    const url = joinModelPath(modelUrl, p);
    const buf = await fetchBuf(url, (got, total) => {
      const base  = done / paths.length;
      const share = 1   / paths.length;
      const pct   = Math.min(95, Math.round(10 + (base + share * (total > 0 ? got / total : 0)) * 85));
      self.postMessage({ type: "progress", pct, msg: "Đang tải trọng số... " + pct + "%" });
    });
    buffers.push(buf);
    done++;
  }

  self.postMessage({ type: "progress", pct: 97, msg: "Đang khởi tạo bộ nhớ tensor..." });
  weights = tf.io.decodeWeights(concatBuffers(buffers), specs);

  // Kiểm tra đủ weights
  const required = [
    "conv1/kernel","conv1/bias","bn1/gamma","bn1/beta","bn1/moving_mean","bn1/moving_variance",
    "conv2/kernel","conv2/bias","bn2/gamma","bn2/beta","bn2/moving_mean","bn2/moving_variance",
    "conv3/kernel","conv3/bias","bn3/gamma","bn3/beta","bn3/moving_mean","bn3/moving_variance",
    "fc1/kernel","fc1/bias","output/kernel","output/bias",
  ];
  const missing = required.filter(n => !weights[n]);
  if (missing.length) throw new Error("Thiếu weights: " + missing.join(", "));
}

// ── FIX #1 & #8: Chuyển RGBA Uint8Array → Float32 RGB tensor ─────
// Web Worker không có DOM, không có ImageData interface cho tf.browser.fromPixels
// → tách thủ công: bỏ kênh Alpha, giữ R,G,B
function rgbaToRgbTensor(rgbaUint8, w, h) {
  const n      = w * h;
  const rgb32  = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    rgb32[i * 3]     = rgbaUint8[i * 4];     // R
    rgb32[i * 3 + 1] = rgbaUint8[i * 4 + 1]; // G
    rgb32[i * 3 + 2] = rgbaUint8[i * 4 + 2]; // B
  }
  // Shape: [h, w, 3] rồi resize bên dưới
  return tf.tensor3d(rgb32, [h, w, 3]);
}

// ── Message handler ───────────────────────────────────────────────
self.onmessage = async ({ data }) => {

  // ── LOAD ──
  if (data.type === "load") {
    try {
      self.postMessage({ type: "progress", pct: 3, msg: "Đang khởi động luồng nền..." });
      await tf.setBackend("cpu");
      await tf.ready();
      self.postMessage({ type: "progress", pct: 8, msg: "Đang tải model.json..." });

      await loadWeights(data.modelUrl);

      // Warm-up: chạy thử một tensor rỗng để JIT compile kernel
      const dummy  = tf.zeros([1, 128, 128, 3]);
      const warmup = predictTensor(dummy);
      warmup.dispose();
      dummy.dispose();

      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({ type: "error", msg: "Lỗi tải model: " + err.message });
    }
    return;
  }

  // ── PREDICT ──
  if (data.type === "predict" && weights) {
    try {
      // FIX #1/#8: Tách RGB từ RGBA, không dùng tf.browser.fromPixels
      const rgba   = new Uint8Array(data.pixels);
      const scores = tf.tidy(() => {
        const rgb3d   = rgbaToRgbTensor(rgba, data.width, data.height); // [H, W, 3]
        const resized = tf.image.resizeBilinear(rgb3d, [128, 128]);      // [128, 128, 3]
        const batched = resized.expandDims(0);                           // [1, 128, 128, 3]
        return predictTensor(batched);
      });

      const arr = await scores.data();
      scores.dispose();

      let maxIdx = 0;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] > arr[maxIdx]) maxIdx = i;
      }

      self.postMessage({
        type:  "result",
        label: data.classes[maxIdx],
        conf:  arr[maxIdx],
      });
    } catch (err) {
      self.postMessage({ type: "predictError", msg: err.message });
    } finally {
      self.postMessage({ type: "idle" });
    }
  }
};
`;

// ─────────────────────────────────────────────────────────────────
function createWorker() {
  const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}

// ─────────────────────────────────────────────────────────────────
export default function Translate() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const workerRef = useRef(null);
  const rafRef = useRef(null);

  // Dùng ref cho các giá trị loop cần đọc nhưng không trigger re-render
  const stableRef = useRef(0);
  const lastLabelRef = useRef(null);
  const busyRef = useRef(false);
  const camReadyRef = useRef(false);
  const modelReadyRef = useRef(false);
  // FIX #3: Tránh loop re-create do dependency [prediction]
  const predictionRef = useRef(null);
  const pausedRef = useRef(false);

  const [phase, setPhase] = useState("model"); // "model" | "cam" | "ready" | "error"
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("Đang khởi tạo...");
  const [errorMsg, setErrorMsg] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [stablePct, setStablePct] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [paused, setPaused] = useState(false);

  // ── Xử lý kết quả từ worker ──────────────────────────────────────
  const handleResult = useCallback((label, conf) => {
    if (label !== "nothing" && conf >= CONF_THRESH) {
      predictionRef.current = label;
      setPrediction(label);
      setConfidence(Math.round(conf * 100));

      if (label === lastLabelRef.current) {
        stableRef.current = Math.min(stableRef.current + 1, STABLE_FRAMES);
      } else {
        lastLabelRef.current = label;
        stableRef.current = 1;
      }

      const pct = Math.round((stableRef.current / STABLE_FRAMES) * 100);
      setStablePct(pct);

      if (stableRef.current === STABLE_FRAMES) {
        if (label === "space") setOutputText((t) => t + " ");
        else if (label === "del") setOutputText((t) => t.slice(0, -1));
        else setOutputText((t) => t + label);
        stableRef.current = 0;
        setStablePct(0);
      }
    } else {
      stableRef.current = Math.max(0, stableRef.current - 1);
      setStablePct(Math.round((stableRef.current / STABLE_FRAMES) * 100));
      if (stableRef.current === 0) {
        predictionRef.current = null;
        setPrediction(null);
        setConfidence(0);
        lastLabelRef.current = null;
      }
    }
  }, []);

  const markReady = useCallback(() => {
    if (camReadyRef.current && modelReadyRef.current) setPhase("ready");
  }, []);

  // ── Khởi tạo Worker + load model ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (!modelReadyRef.current) {
        workerRef.current?.terminate();
        if (!cancelled) {
          setPhase("error");
          setErrorMsg("Quá thời gian tải model.");
        }
      }
    }, MODEL_TIMEOUT_MS);

    const worker = createWorker();
    workerRef.current = worker;

    worker.onmessage = ({ data }) => {
      if (cancelled) return;
      switch (data.type) {
        case "progress":
          setLoadPct(data.pct);
          setLoadMsg(data.msg);
          break;
        case "ready":
          modelReadyRef.current = true;
          window.clearTimeout(timeoutId);
          setLoadPct(100);
          markReady();
          break;
        case "result":
          handleResult(data.label, data.conf);
          break;
        case "idle":
          busyRef.current = false;
          break;
        case "predictError":
          console.error("[Worker predict]", data.msg);
          break;
        case "error":
          setPhase("error");
          setErrorMsg(data.msg);
          break;
      }
    };

    worker.postMessage({
      type: "load",
      modelUrl: new URL(MODEL_URL, window.location.origin).href,
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      worker.terminate();
    };
  }, [handleResult, markReady]);

  // ── Khởi tạo webcam ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        camReadyRef.current = true;
        markReady();
      } catch (e) {
        if (!cancelled) {
          setPhase("error");
          setErrorMsg("Không mở được camera: " + e.message);
        }
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [markReady]);

  // ── Vẽ ROI overlay ───────────────────────────────────────────────
  const drawROI = useCallback(() => {
    const oc = overlayRef.current;
    if (!oc) return;
    const ctx = oc.getContext("2d");
    const W = oc.width,
      H = oc.height;
    ctx.clearRect(0, 0, W, H);

    const size = Math.floor(Math.min(W, H) * 0.72);
    const x0 = Math.floor((W - size) / 2);
    const y0 = Math.floor((H - size) / 2);
    const color = predictionRef.current ? "#00e676" : "#2979ff";

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, W, y0);
    ctx.fillRect(0, y0 + size, W, H - y0 - size);
    ctx.fillRect(0, y0, x0, size);
    ctx.fillRect(x0 + size, y0, W, size);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x0, y0, size, size);

    // Góc nhấn mạnh
    const c = 18;
    ctx.lineWidth = 4;
    [
      [x0, y0],
      [x0 + size, y0],
      [x0, y0 + size],
      [x0 + size, y0 + size],
    ].forEach(([cx, cy]) => {
      const dx = cx === x0 ? c : -c;
      const dy = cy === y0 ? c : -c;
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy);
      ctx.stroke();
    });
  }, []);

  // ── Inference loop ────────────────────────────────────────────────
  // FIX #3: KHÔNG có [prediction] trong dependency → loop ổn định
  const loop = useCallback(() => {
    drawROI();
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      video?.readyState >= 2 &&
      !busyRef.current &&
      modelReadyRef.current &&
      !pausedRef.current
    ) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Mirror video (selfie)
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const W = canvas.width,
        H = canvas.height;
      const size = Math.floor(Math.min(W, H) * 0.72);
      const sx = Math.floor((W - size) / 2);
      const sy = Math.floor((H - size) / 2);

      const { data } = ctx.getImageData(sx, sy, size, size);
      busyRef.current = true;
      workerRef.current?.postMessage(
        {
          type: "predict",
          pixels: data.buffer,
          width: size,
          height: size,
          classes: CLASSES,
        },
        [data.buffer],
      );
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [drawROI]); // chỉ depend drawROI

  // ── Bắt / dừng loop khi phase thay đổi ───────────────────────────
  useEffect(() => {
    if (phase !== "ready") return;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, loop]);

  // Sync pausedRef để loop đọc được mà không cần re-create
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="translate-page">
        <div className="main-content">
          <div className="content-wrapper">
            {/* Header */}
            <div className="tl-header">
              <div className="tl-title">
                <span className="tl-icon">🤟</span>
                <div>
                  <h1>VSL Translator</h1>
                  <p>Nhận diện ngôn ngữ ký hiệu thời gian thực</p>
                </div>
              </div>
              <div className="tl-header-right">
                {/* FIX #4: class phải là ${phase} để khớp CSS .status-dot.loading / .ready / .error */}
                <div className="tl-status">
                  <span
                    className={`status-dot ${phase === "ready" ? "ready" : phase === "error" ? "error" : "loading"}`}
                  />
                  <span>
                    {phase === "ready"
                      ? "Hệ thống sẵn sàng"
                      : phase === "error"
                        ? "Lỗi hệ thống"
                        : loadMsg}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="tl-body">
              {/* Camera panel */}
              <div className="cam-panel">
                <div className="cam-viewport">
                  {/* FIX #5: class đúng là "error" thay vì "is-error" để khớp .cam-loading.error */}
                  {phase !== "ready" && (
                    <div
                      className={`cam-loading${phase === "error" ? " error" : ""}`}
                    >
                      {phase === "error" ? (
                        <>
                          <span className="err-icon">⚠️</span>
                          <p className="err-msg">{errorMsg}</p>
                          <p className="err-hint">
                            Kiểm tra quyền truy cập camera và thư mục
                            /public/model/
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="spinner load-ring" />
                          <p className="load-msg">{loadMsg}</p>
                          {loadPct > 0 && (
                            <p className="load-hint">{loadPct}%</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    className="cam-video"
                    playsInline
                    muted
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {/* Canvas ẩn để capture frame */}
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    style={{ display: "none" }}
                  />
                  {/* Overlay ROI */}
                  <canvas
                    ref={overlayRef}
                    className="cam-overlay"
                    width={640}
                    height={480}
                  />

                  {/* Badge chữ nhận diện */}
                  {prediction && phase === "ready" && (
                    <div className="pred-badge">
                      <span className="pred-letter">{prediction}</span>
                    </div>
                  )}

                  {/* Stable progress bar ở đáy viewport */}
                  {stablePct > 0 && phase === "ready" && (
                    <div className="stable-bar">
                      <div
                        className="stable-fill"
                        style={{ width: stablePct + "%" }}
                      />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="cam-controls">
                  <button
                    className={`btn-ctrl ${paused ? "btn-play" : "btn-pause"}`}
                    onClick={() => setPaused((p) => !p)}
                    disabled={phase !== "ready"}
                  >
                    {paused ? "▶ Tiếp tục" : "⏸ Tạm dừng"}
                  </button>
                  <div className="hint-row">
                    <span className="hint">📐 Đặt tay vào khung vuông</span>
                    <span className="hint">
                      ⏱ Giữ {STABLE_FRAMES} frame để xác nhận
                    </span>
                    <span className="hint">
                      🎯 Ngưỡng: {CONF_THRESH * 100}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Output panel */}
              <div className="output-panel">
                {/* Ký hiệu hiện tại */}
                <div className="current-sign">
                  <p className="section-label">Ký hiệu hiện tại</p>
                  <div className={`sign-display ${prediction ? "active" : ""}`}>
                    {prediction ?? "—"}
                  </div>
                  <div className="conf-text">
                    {prediction
                      ? `Độ tin cậy: ${confidence}%`
                      : "Chưa phát hiện ký hiệu"}
                  </div>
                  {stablePct > 0 && (
                    <div className="stable-label">
                      Đang phân tích: {stablePct}%
                    </div>
                  )}
                </div>

                {/* Văn bản đầu ra */}
                <div className="text-output-block">
                  <div className="output-header">
                    <p className="section-label">Văn bản dịch</p>
                    <div className="output-actions">
                      <button
                        className="btn-sm"
                        onClick={() => {
                          if (outputText)
                            navigator.clipboard?.writeText(outputText);
                        }}
                      >
                        📋 Copy
                      </button>
                      <button
                        className="btn-sm btn-danger"
                        onClick={() => setOutputText("")}
                      >
                        🗑 Xoá
                      </button>
                    </div>
                  </div>
                  <div className="text-output">
                    {outputText || (
                      <span className="placeholder">
                        Ký tự nhận diện sẽ xuất hiện tại đây...
                      </span>
                    )}
                    <span className="cursor-blink">|</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="legend-block">
                  <p className="section-label">Ký hiệu đặc biệt</p>
                  <div className="legend-grid">
                    {[
                      ["space", "Thêm khoảng trắng"],
                      ["del", "Xoá ký tự cuối"],
                      ["nothing", "Không có ký hiệu"],
                    ].map(([badge, desc]) => (
                      <div key={badge} className="legend-item">
                        <span className="legend-badge">{badge}</span>
                        <span className="legend-desc">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alphabet grid */}
                <div className="alphabet-block">
                  <p className="section-label">Bảng chữ cái</p>
                  <div className="alphabet-grid">
                    {CLASSES.filter((c) => c.length === 1).map((c) => (
                      <div
                        key={c}
                        className={`alpha-cell ${prediction === c ? "alpha-active" : ""}`}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
