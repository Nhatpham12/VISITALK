import React, { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import "../CSS/Translate.css";
import Tfworker from "../../public/Tfworker";

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
const CONF_THRESH = 0.8;
const STABLE_FRAMES = 12;

// ── Worker source ─────────────────────────────────────────────────────────
// Không dùng IndexedDB cache (hay bị lỗi trong Worker context một số browser)
// → Load thẳng từ server, dùng HTTP cache của browser (nhanh lần 2+)
const WORKER_SRC = `
let model = null;

self.onmessage = async ({ data }) => {
  if (data.type === "load") {
    try {
      self.postMessage({ type: "progress", pct: 5, msg: "Đang tải TF.js..." });

      // loadLayersModel với progress callback
      model = await tf.loadLayersModel(data.url, {
        onProgress(fraction) {
          const p = Math.round(fraction * 100);
          self.postMessage({ type: "progress", pct: p, msg: "Đang tải model... " + p + "%" });
        }
      });

      // Warm-up nhẹ
      self.postMessage({ type: "progress", pct: 100, msg: "Hoàn tất!" });
      const dummy = tf.zeros([1, 128, 128, 3]);
      const out   = model.predict(dummy);
      out.dispose();
      dummy.dispose();

      self.postMessage({ type: "ready" });
    } catch(e) {
      self.postMessage({ type: "error", msg: e.message });
    }
    return;
  }

  if (data.type === "predict" && model) {
    try {
      const tensor = tf.tidy(() =>
        model.predict(
          tf.browser
            .fromPixels({ data: new Uint8Array(data.pixels), width: data.width, height: data.height })
            .resizeBilinear([128, 128])
            .toFloat()
            .expandDims(0)
        )
      );
      const scores = await tensor.data();
      tensor.dispose();
      const idx = scores.indexOf(Math.max(...scores));
      self.postMessage({ type: "result", label: data.classes[idx], conf: scores[idx] });
    } catch(_) {
      self.postMessage({ type: "idle" }); // thả busy lock dù lỗi
    }
  }
};
`;

function createWorker() {
  const tfCDN =
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js";
  const full = `importScripts("${tfCDN}");\n${WORKER_SRC}`;
  const blob = new Blob([full], { type: "application/javascript" });
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

  const [phase, setPhase] = useState("model");
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("Đang khởi tạo...");
  const [errorMsg, setErrorMsg] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [stablePct, setStablePct] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [paused, setPaused] = useState(false);

  // ── 1. Worker + load model ───────────────────────────────────────────
  useEffect(() => {
    const worker = createWorker();
    workerRef.current = worker;

    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case "progress":
          setLoadPct(data.pct);
          setLoadMsg(data.msg);
          break;

        case "ready":
          // Model OK trong Worker → giờ mở webcam ở main thread
          setPhase("cam");
          break;

        case "result":
        case "idle":
          busyRef.current = false;
          if (data.type === "result") handleResult(data.label, data.conf);
          break;

        case "error":
          setPhase("error");
          setErrorMsg(data.msg);
          break;

        default:
          break;
      }
    };

    worker.onerror = (e) => {
      setPhase("error");
      setErrorMsg(e.message || "Worker lỗi không xác định");
    };

    worker.postMessage({
      type: "load",
      url: window.location.origin + "/model/model.json",
    });

    return () => {
      worker.terminate();
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line

  // ── 2. Webcam ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "cam") return;
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setPhase("ready");
      } catch (e) {
        setPhase("error");
        setErrorMsg("Webcam: " + e.message);
      }
    })();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [phase]);

  // ── 3. Kết quả predict ──────────────────────────────────────────────
  const handleResult = useCallback((label, conf) => {
    if (conf >= CONF_THRESH && label !== "nothing") {
      setPrediction(label);
      setConfidence(Math.round(conf * 100));
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

  // ── 4. RAF loop ──────────────────────────────────────────────────────
  const loop = useCallback(() => {
    drawROI();
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video?.readyState >= 2 && !busyRef.current && workerRef.current) {
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
      workerRef.current.postMessage(
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
  }, []); // eslint-disable-line

  useEffect(() => {
    if (phase !== "ready") return;
    if (!paused) rafRef.current = requestAnimationFrame(loop);
    else cancelAnimationFrame(rafRef.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, paused, loop]);

  // ── ROI Overlay ──────────────────────────────────────────────────────
  const drawROI = () => {
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
  };

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
