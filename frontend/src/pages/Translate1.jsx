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
const CONF_THRESH = 0.55;
const STABLE_FRAMES = 6;
const MODEL_URL = "/model/model.json";
const MODEL_TIMEOUT_MS = 120000;

const WORKER_SRC = `
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js");
let weights = null;

function joinModelPath(modelUrl, weightPath) {
  return new URL(weightPath, modelUrl).href;
}

function concatArrayBuffers(buffers) {
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  buffers.forEach((buffer) => {
    merged.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });

  return merged.buffer;
}

async function fetchArrayBuffer(url, onProgress) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(url + " returned " + response.status);
  }

  const total = Number(response.headers.get("content-length")) || 0;
  if (!response.body) {
    const buffer = await response.arrayBuffer();
    if (onProgress) onProgress(buffer.byteLength, buffer.byteLength || total);
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    const result = await reader.read();
    if (result.done) break;
    chunks.push(result.value);
    received += result.value.byteLength;
    if (onProgress) onProgress(received, total);
  }

  return concatArrayBuffers(
    chunks.map((chunk) =>
      chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength),
    ),
  );
}

function requireWeights(requiredNames) {
  const missing = requiredNames.filter((name) => !weights[name]);
  if (missing.length > 0) {
    throw new Error("Missing weights: " + missing.join(", "));
  }
}

function applyBatchNorm(x, name) {
  return tf.batchNorm(
    x,
    weights[name + "/moving_mean"],
    weights[name + "/moving_variance"],
    weights[name + "/beta"],
    weights[name + "/gamma"],
    0.001,
  );
}

function convBlock(x, convName, bnName) {
  return tf.tidy(() => {
    const conv = tf
      .conv2d(x, weights[convName + "/kernel"], [1, 1], "same")
      .add(weights[convName + "/bias"]);
    const activated = applyBatchNorm(conv, bnName).relu();
    return tf.maxPool(activated, [2, 2], [2, 2], "valid");
  });
}

function predictTensor(input) {
  return tf.tidy(() => {
    let x = input.toFloat().div(255);
    x = convBlock(x, "conv1", "bn1");
    x = convBlock(x, "conv2", "bn2");
    x = convBlock(x, "conv3", "bn3");
    x = x.reshape([x.shape[0], -1]);
    x = tf.matMul(x, weights["fc1/kernel"]).add(weights["fc1/bias"]).relu();
    x = tf.matMul(x, weights["output/kernel"]).add(weights["output/bias"]);
    return tf.softmax(x);
  });
}

async function loadLocalModel(modelUrl) {
  const modelResponse = await fetch(modelUrl);
  if (!modelResponse.ok) {
    throw new Error(modelUrl + " returned " + modelResponse.status);
  }

  const modelJson = await modelResponse.json();
  const manifest = modelJson.weightsManifest || [];
  const weightSpecs = manifest.flatMap((group) => group.weights || []);
  const weightPaths = manifest.flatMap((group) => group.paths || []);
  const weightBuffers = [];

  let completedFiles = 0;
  for (const weightPath of weightPaths) {
    const weightUrl = joinModelPath(modelUrl, weightPath);
    const buffer = await fetchArrayBuffer(weightUrl, (received, total) => {
      const fileBase = weightPaths.length > 0 ? completedFiles / weightPaths.length : 0;
      const fileShare = weightPaths.length > 0 ? 1 / weightPaths.length : 1;
      const filePct = total > 0 ? received / total : 0;
      const pct = Math.min(90, Math.round(10 + (fileBase + fileShare * filePct) * 80));
      self.postMessage({ type: "progress", pct, msg: "Dang tai weights... " + pct + "%" });
    });
    weightBuffers.push(buffer);
    completedFiles += 1;
  }

  self.postMessage({ type: "progress", pct: 92, msg: "Dang giai ma weights..." });
  const decodedWeights = tf.io.decodeWeights(
    concatArrayBuffers(weightBuffers),
    weightSpecs,
  );

  weights = decodedWeights;
  requireWeights([
    "conv1/kernel",
    "conv1/bias",
    "bn1/gamma",
    "bn1/beta",
    "bn1/moving_mean",
    "bn1/moving_variance",
    "conv2/kernel",
    "conv2/bias",
    "bn2/gamma",
    "bn2/beta",
    "bn2/moving_mean",
    "bn2/moving_variance",
    "conv3/kernel",
    "conv3/bias",
    "bn3/gamma",
    "bn3/beta",
    "bn3/moving_mean",
    "bn3/moving_variance",
    "fc1/kernel",
    "fc1/bias",
    "output/kernel",
    "output/bias",
  ]);

  return decodedWeights;
}

self.onmessage = async ({ data }) => {
  if (data.type === "load") {
    try {
      self.postMessage({ type: "progress", pct: 5, msg: "Dang tai TensorFlow.js..." });
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();

      self.postMessage({ type: "progress", pct: 10, msg: "Dang tai model tu /model..." });
      weights = await loadLocalModel(data.modelUrl);

      self.postMessage({ type: "progress", pct: 96, msg: "Dang khoi dong model..." });
      const dummy = tf.zeros([1, 128, 128, 3]);
      const output = predictTensor(dummy);
      output.dispose();
      dummy.dispose();

      self.postMessage({ type: "ready" });
    } catch (error) {
      self.postMessage({ type: "error", msg: "Load model: " + error.message });
    }
    return;
  }

  if (data.type === "predict" && weights) {
    try {
      const output = tf.tidy(() =>
        predictTensor(
          tf.browser
            .fromPixels({ data: new Uint8Array(data.pixels), width: data.width, height: data.height })
            .resizeBilinear([128, 128])
            .expandDims(0),
        ),
      );
      const scores = await output.data();
      output.dispose();

      const idx = scores.indexOf(Math.max(...scores));
      self.postMessage({ type: "result", label: data.classes[idx], conf: scores[idx] });
    } catch (error) {
      self.postMessage({ type: "predictError", msg: error.message });
    } finally {
      self.postMessage({ type: "idle" });
    }
  }
};
`;

function createModelWorker() {
  const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}

// ── Component ─────────────────────────────────────────────────────────────
export default function Translate() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const workerRef = useRef(null);
  const rafRef = useRef(null);
  const stableRef = useRef(0);
  const lastRef = useRef(null);
  const busyRef = useRef(false);
  const camReadyRef = useRef(false);
  const modelReadyRef = useRef(false);

  const [phase, setPhase] = useState("model");
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("Đang khởi tạo...");
  const [errorMsg, setErrorMsg] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [stablePct, setStablePct] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [paused, setPaused] = useState(false);

  const handleResult = useCallback((label, conf) => {
    if (label !== "nothing") {
      setPrediction(label);
      setConfidence(Math.round(conf * 100));

      if (conf < CONF_THRESH) {
        stableRef.current = 0;
        lastRef.current = null;
        setStablePct(0);
        return;
      }

      if (label === lastRef.current) {
        stableRef.current = Math.min(stableRef.current + 1, STABLE_FRAMES);
        setStablePct(Math.round((stableRef.current / STABLE_FRAMES) * 100));
        if (stableRef.current === STABLE_FRAMES) {
          if (label === "space") setOutputText((t) => t + " ");
          else if (label === "del") setOutputText((t) => t.slice(0, -1));
          else setOutputText((t) => t + label);
          stableRef.current = 0;
          setStablePct(0);
        }
      } else {
        lastRef.current = label;
        stableRef.current = 1;
        setStablePct(0);
      }
    } else {
      setPrediction(null);
      setConfidence(0);
      stableRef.current = 0;
      lastRef.current = null;
      setStablePct(0);
    }
  }, []);

  // ── 1. Load local model ──────────────────────────────────────────────
  const markReadyIfPossible = useCallback(() => {
    if (camReadyRef.current && modelReadyRef.current) {
      setPhase("ready");
    }
  }, [camReadyRef, modelReadyRef]); // Thêm dependencies vào đây

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!modelReadyRef.current) {
        workerRef.current?.terminate();
        setPhase("error");
        setErrorMsg(
          "Load model qua lau. Kiem tra mang/CDN TensorFlow.js hoac reload lai trang.",
        );
      }
    }, MODEL_TIMEOUT_MS);

    const worker = createModelWorker();
    workerRef.current = worker;

    worker.onmessage = ({ data }) => {
      if (cancelled) return;

      if (data.type === "progress") {
        setLoadPct(data.pct);
        setLoadMsg(data.msg);
        return;
      }

      if (data.type === "ready") {
        modelReadyRef.current = true;
        setLoadPct(100);
        setLoadMsg("Model san sang");
        markReadyIfPossible();
        return;
      }

      if (data.type === "result") {
        handleResult(data.label, data.conf);
        return;
      }

      if (data.type === "idle") {
        busyRef.current = false;
        return;
      }

      if (data.type === "predictError") {
        console.error("Predict error:", data.msg);
        setPhase("error");
        setErrorMsg(`Predict: ${data.msg}`);
        return;
      }

      if (data.type === "error") {
        setPhase("error");
        setErrorMsg(data.msg);
      }
    };

    worker.onerror = (error) => {
      if (!cancelled) {
        setPhase("error");
        setErrorMsg(`Worker: ${error.message}`);
      }
    };

    worker.postMessage({
      type: "load",
      modelUrl: new URL(MODEL_URL, window.location.origin).href,
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafRef.current);
      worker.terminate();
      workerRef.current = null;
    };
  }, [handleResult, markReadyIfPossible]);

  // ── 2. Webcam ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let stream;

    async function playVideo(video, currentStream) {
      try {
        await video.play();
      } catch (error) {
        if (
          cancelled ||
          video.srcObject !== currentStream ||
          !String(error.message).includes("interrupted by a new load request")
        ) {
          throw error;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 100));
        if (!cancelled && video.srcObject === currentStream) {
          await video.play();
        }
      }
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        const video = videoRef.current;
        video.srcObject = stream;
        await playVideo(video, stream);
        if (cancelled || video.srcObject !== stream) return;
        camReadyRef.current = true;
        markReadyIfPossible();
      } catch (e) {
        if (cancelled) return;
        setPhase("error");
        setErrorMsg("Webcam: " + e.message);
      }
    })();
    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [markReadyIfPossible]);

  // ── 4. RAF loop ──────────────────────────────────────────────────────
  // Đưa hàm loop vào làm một useCallback để quản lý dependency chuẩn xác
  const loop = useCallback(() => {
    drawROI();
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video?.readyState >= 2 && !busyRef.current && modelReadyRef.current) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const side = Math.min(canvas.width, canvas.height);
      const sx = (canvas.width - side) / 2;
      const sy = (canvas.height - side) / 2;
      const { data } = ctx.getImageData(sx, sy, side, side);

      busyRef.current = true;
      workerRef.current?.postMessage(
        {
          type: "predict",
          pixels: data.buffer,
          width: side,
          height: side,
          classes: CLASSES,
        },
        [data.buffer],
      );
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [prediction]); // Re-bind loop mỗi khi prediction thay đổi để drawROI cập nhật màu sắc chính xác

  // Vòng lặp kích hoạt chính
  useEffect(() => {
    if (phase !== "ready") return;

    if (!paused) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafRef.current);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, paused, loop]);
  useEffect(() => {
    if (phase !== "ready") return;
    if (!paused) rafRef.current = requestAnimationFrame(loop);
    else cancelAnimationFrame(rafRef.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ROI Overlay ──────────────────────────────────────────────────────
  function drawROI() {
    const oc = overlayRef.current;
    if (!oc) return;
    const ctx = oc.getContext("2d");
    const W = oc.width,
      H = oc.height;
    ctx.clearRect(0, 0, W, H);

    const size = Math.min(W, H) * 0.72;
    const x0 = (W - size) / 2;
    const y0 = (H - size) / 2;
    const color = prediction ? "#00e676" : "#2979ff";

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, W, y0);
    ctx.fillRect(0, y0 + size, W, H);
    ctx.fillRect(0, y0, x0, size);
    ctx.fillRect(x0 + size, y0, W, size);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.strokeRect(x0, y0, size, size);

    const L = 24;
    ctx.lineWidth = 4;
    [
      [x0, y0],
      [x0 + size, y0],
      [x0, y0 + size],
      [x0 + size, y0 + size],
    ].forEach(([cx, cy], i) => {
      const dx = i % 2 === 0 ? L : -L,
        dy = i < 2 ? L : -L;
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy);
      ctx.stroke();
    });
  }

  const phaseLabel = {
    model: "Đang tải model...",
    cam: "Đang mở webcam...",
    ready: "Sẵn sàng",
    error: "Lỗi",
  };

  return (
    <>
      <Navbar />
      <div className="translate-page">
        <div className="main-content">
          <div className="content-wrapper">
            <div className="tl-header">
              <div className="tl-title">
                <span className="tl-icon">🤟</span>
                <div>
                  <h1>VSL Translator</h1>
                  <p>Nhận diện ngôn ngữ ký hiệu theo thời gian thực</p>
                </div>
              </div>
              <div className="tl-header-right">
                <div className="tl-status">
                  <span className={`status-dot s-${phase}`} />
                  <span>{phase === "error" ? "Lỗi" : phaseLabel[phase]}</span>
                </div>
              </div>
            </div>

            <div className="tl-body">
              <div className="cam-panel">
                <div className="cam-viewport">
                  {phase !== "ready" && (
                    <div
                      className={`cam-loading ${phase === "error" ? "is-error" : ""}`}
                    >
                      {phase === "error" ? (
                        <>
                          <span className="err-icon">⚠️</span>
                          <p className="err-msg">{errorMsg}</p>
                          <p className="err-hint">
                            Kiểm tra Console (F12) để xem chi tiết
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="load-ring">
                            <svg viewBox="0 0 44 44" width="80" height="80">
                              <circle
                                cx="22"
                                cy="22"
                                r="18"
                                fill="none"
                                stroke="#1a2f50"
                                strokeWidth="4"
                              />
                              <circle
                                cx="22"
                                cy="22"
                                r="18"
                                fill="none"
                                stroke={loadPct === 100 ? "#00e676" : "#2979ff"}
                                strokeWidth="4"
                                strokeDasharray={`${(loadPct / 100) * 113.1} 113.1`}
                                strokeLinecap="round"
                                transform="rotate(-90 22 22)"
                                style={{
                                  transition:
                                    "stroke-dasharray 0.3s ease, stroke 0.3s",
                                }}
                              />
                              <text
                                x="22"
                                y="27"
                                textAnchor="middle"
                                fill="white"
                                fontSize="9"
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                {loadPct}%
                              </text>
                            </svg>
                          </div>
                          <p className="load-msg">{loadMsg}</p>
                          {phase === "model" &&
                            loadPct > 0 &&
                            loadPct < 100 && (
                              <p className="load-hint">
                                ⚡ Lần sau sẽ load từ cache trình duyệt
                              </p>
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
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    style={{ display: "none" }}
                  />
                  <canvas
                    ref={overlayRef}
                    className="cam-overlay"
                    width={640}
                    height={480}
                  />

                  {prediction && phase === "ready" && (
                    <div className="pred-badge">
                      <span className="pred-letter">{prediction}</span>
                    </div>
                  )}

                  {phase === "ready" && (
                    <div className="conf-arc">
                      <svg viewBox="0 0 36 36" width="58" height="58">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#ffffff12"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke={confidence >= 80 ? "#00e676" : "#2979ff"}
                          strokeWidth="3"
                          strokeDasharray={`${confidence} 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                          style={{ transition: "stroke-dasharray 0.15s" }}
                        />
                        <text
                          x="18"
                          y="21.5"
                          textAnchor="middle"
                          fill="white"
                          fontSize="7"
                          fontFamily="monospace"
                        >
                          {confidence}%
                        </text>
                      </svg>
                    </div>
                  )}

                  <div className="stable-bar">
                    <div
                      className="stable-fill"
                      style={{ width: `${stablePct}%` }}
                    />
                  </div>
                </div>

                <div className="cam-controls">
                  <button
                    className={`btn-ctrl ${paused ? "btn-play" : "btn-pause"}`}
                    onClick={() => setPaused((p) => !p)}
                    disabled={phase !== "ready"}
                  >
                    {paused ? "▶ Tiếp tục" : "⏸ Tạm dừng"}
                  </button>
                  <div className="hint-row">
                    <span className="hint">📍 Đặt tay vào khung sáng</span>
                    <span className="hint">
                      ⏱ Giữ {STABLE_FRAMES} frame để xác nhận
                    </span>
                  </div>
                </div>
              </div>

              <div className="output-panel">
                <div className="current-sign">
                  <p className="section-label">Ký hiệu hiện tại</p>
                  <div className={`sign-display ${prediction ? "active" : ""}`}>
                    {prediction ?? "—"}
                  </div>
                  <div className="conf-text">
                    {prediction
                      ? `Độ tin cậy: ${confidence}%`
                      : "Chưa phát hiện"}
                  </div>
                  {stablePct > 0 && (
                    <div className="stable-label">Xác nhận: {stablePct}%</div>
                  )}
                </div>

                <div className="text-output-block">
                  <div className="output-header">
                    <p className="section-label">Văn bản đầu ra</p>
                    <div className="output-actions">
                      <button
                        className="btn-sm"
                        onClick={() =>
                          outputText &&
                          navigator.clipboard.writeText(outputText)
                        }
                      >
                        📋 Sao chép
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
                        Các ký tự sẽ xuất hiện ở đây...
                      </span>
                    )}
                    <span className="cursor-blink">|</span>
                  </div>
                </div>

                <div className="legend-block">
                  <p className="section-label">Ký hiệu đặc biệt</p>
                  <div className="legend-grid">
                    {[
                      { sign: "nothing", desc: "Không có ký hiệu — bỏ qua" },
                      { sign: "space", desc: "Chèn khoảng trắng" },
                      { sign: "del", desc: "Xoá ký tự cuối" },
                    ].map(({ sign, desc }) => (
                      <div key={sign} className="legend-item">
                        <span className="legend-badge">{sign}</span>
                        <span className="legend-desc">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="alphabet-block">
                  <p className="section-label">Bảng chữ cái</p>
                  <div className="alphabet-grid">
                    {CLASSES.slice(0, 26).map((c) => (
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
