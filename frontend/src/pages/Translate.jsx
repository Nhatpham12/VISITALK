// ============================================================
// Translate.jsx — VSL Real-time Recognition
// Optimized model loading with 29 VSL classes (A-Z + space/del/nothing)
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import Navbar from "../components/Navbar";
import "../CSS/Translate.css";

// ─── Configuration ────────────────────────────────────────────────
const MODEL_PATH = "/model/model.json";
const WEIGHTS_PATH = "/model/group1-shard1of1.bin";
const CONF_THRESH = 0.8;
const STABLE_FRAMES = 12;

// 29 VSL classes: A-Z (26) + space + del + nothing
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
  "space",
  "del",
  "nothing",
];

console.log(`✓ VSL Classes loaded: ${CLASSES.length} total`);

// ─── Image preprocessing ──────────────────────────────────────────
function preprocessROI(canvas, sx, sy, size) {
  return tf.tidy(() => {
    const tmp = document.createElement("canvas");
    tmp.width = 128;
    tmp.height = 128;

    const ctx = tmp.getContext("2d");
    ctx.drawImage(canvas, sx, sy, size, size, 0, 0, 128, 128);

    let t = tf.browser.fromPixels(tmp, 3).asType("float32");
    return t.expandDims(0); // [1, 128, 128, 3]
  });
}

// ─── Main Component ───────────────────────────────────────────────
export default function Translate() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const modelRef = useRef(null);
  const rafRef = useRef(null);

  const busyRef = useRef(false);
  const stableRef = useRef(0);
  const lastLblRef = useRef(null);
  const predRef = useRef(null);
  const pausedRef = useRef(false);

  // UI State
  const [phase, setPhase] = useState("model"); // model|cam|ready|error
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("Initializing...");
  const [errorMsg, setErrorMsg] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [stablePct, setStablePct] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [paused, setPaused] = useState(false);

  // Debug & Info
  const [debugScores, setDebugScores] = useState([]);
  const [numClasses, setNumClasses] = useState(0);
  const [modelInfo, setModelInfo] = useState("");

  // Sync refs
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    predRef.current = prediction;
  }, [prediction]);

  // ── STEP 1: Load Model & Patch Keras v3 Compatibility ─────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadMsg("Loading model structure...");
        setLoadPct(5);

        const response = await fetch(MODEL_PATH);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} khi tải file model.json`);
        }
        const modelJson = await response.json();

        // Vá lỗi Keras v3
        if (modelJson.modelTopology?.model_config?.config?.layers) {
          modelJson.modelTopology.model_config.config.layers.forEach(
            (layer) => {
              if (layer.class_name === "InputLayer" && layer.config) {
                if (layer.config.batch_shape && !layer.config.batchInputShape) {
                  layer.config.batchInputShape = layer.config.batch_shape;
                }
              }
              if (layer.inbound_nodes && layer.inbound_nodes.length > 0) {
                if (
                  !Array.isArray(layer.inbound_nodes[0]) &&
                  typeof layer.inbound_nodes[0] === "object"
                ) {
                  const legacyInboundNodes = layer.inbound_nodes.map((node) => {
                    const legacyArgs = [];
                    if (node.args && Array.isArray(node.args)) {
                      node.args.forEach((arg) => {
                        if (
                          arg.class_name === "__keras_tensor__" &&
                          arg.config?.keras_history
                        ) {
                          const history = arg.config.keras_history;
                          legacyArgs.push([
                            history[0],
                            history[1],
                            history[2],
                            node.kwargs || {},
                          ]);
                        }
                      });
                    }
                    return legacyArgs;
                  });
                  layer.inbound_nodes = legacyInboundNodes;
                }
              }
            },
          );
        }

        setLoadMsg("Loading weights...");
        setLoadPct(15);

        const model = await tf.loadLayersModel(tf.io.fromMemory(modelJson), {
          onProgress: (frac) => {
            if (!cancelled) {
              const pct = Math.round(15 + frac * 75);
              setLoadPct(pct);
              setLoadMsg(`Loading weights... ${pct}%`);
            }
          },
        });

        if (cancelled) {
          model.dispose();
          return;
        }

        setLoadMsg("Warming up model...");
        setLoadPct(93);
        const dummy = tf.zeros([1, 128, 128, 3]);
        model.predict(dummy).dispose();
        dummy.dispose();

        modelRef.current = model;
        const outShape = model.outputs[0].shape;
        const numOut = outShape[outShape.length - 1];
        setNumClasses(numOut);

        const modelInfoStr = `Model loaded successfully | Input: ${model.inputs[0].shape.join("×")} | Output: ${numOut} classes`;
        setModelInfo(modelInfoStr);

        if (!cancelled) {
          setLoadPct(100);
          setLoadMsg("Model ready!");
          setPhase("cam");
        }
      } catch (err) {
        if (!cancelled) {
          setPhase("error");
          setErrorMsg(`Failed to load model: ${err.message}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (modelRef.current) {
        modelRef.current.dispose();
        modelRef.current = null;
      }
    };
  }, []);

  // ── STEP 2: Acquire Webcam ────────────────────────────────────────
  useEffect(() => {
    if (phase !== "cam") return;
    let stream;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          if (!cancelled) setPhase("ready");
        };
      } catch (err) {
        if (!cancelled) {
          setPhase("error");
          setErrorMsg(`Camera error: ${err.message}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [phase]);

  // ── Handle Prediction Logic ───────────────────────────────────────
  const handleResult = useCallback((label, conf, allScores) => {
    if (allScores?.length > 0) {
      const top3 = [...allScores]
        .map((s, i) => ({ label: CLASSES[i] ?? `cls_${i}`, score: s }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      setDebugScores(top3);
    }

    if (conf >= CONF_THRESH && label !== "nothing") {
      setPrediction(label);
      setConfidence(Math.round(conf * 100));

      if (label === lastLblRef.current) {
        stableRef.current = Math.min(stableRef.current + 1, STABLE_FRAMES);
        setStablePct(Math.round((stableRef.current / STABLE_FRAMES) * 100));

        if (stableRef.current === STABLE_FRAMES) {
          if (label === "space") {
            setOutputText((t) => t + " ");
          } else if (label === "del") {
            setOutputText((t) => t.slice(0, -1));
          } else {
            setOutputText((t) => t + label);
          }
          stableRef.current = 0;
          lastLblRef.current = null;
        }
      } else {
        stableRef.current = 1;
        lastLblRef.current = label;
        setStablePct(Math.round((1 / STABLE_FRAMES) * 100));
      }
    } else {
      setPrediction(null);
      setConfidence(0);
      setStablePct(0);
      stableRef.current = 0;
      lastLblRef.current = null;
    }
  }, []);

  // ── Main Inference Loop ───────────────────────────────────────────
  const runInference = useCallback(() => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) {
      rafRef.current = requestAnimationFrame(runInference);
      return;
    }

    if (pausedRef.current || busyRef.current) {
      rafRef.current = requestAnimationFrame(runInference);
      return;
    }

    const video = videoRef.current;

    if (video.readyState < 2 || video.videoWidth === 0) {
      rafRef.current = requestAnimationFrame(runInference);
      return;
    }

    busyRef.current = true;

    // Giãn cách 40ms để trình duyệt thoải mái cập nhật hình ảnh lên UI trước khi tính AI
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const size = Math.min(canvas.width, canvas.height) * 0.7;
        const sx = (canvas.width - size) / 2;
        const sy = (canvas.height - size) / 2;

        const input = preprocessROI(canvas, sx, sy, size);
        const output = modelRef.current.predict(input);
        const scores = output.dataSync();

        const label_idx = Array.from(scores).indexOf(Math.max(...scores));
        const label = CLASSES[label_idx];
        const conf = scores[label_idx];

        handleResult(label, conf, Array.from(scores));

        tf.dispose([input, output]);
      } catch (err) {
        console.error("Inference error:", err);
      } finally {
        busyRef.current = false;
        rafRef.current = requestAnimationFrame(runInference);
      }
    }, 40);
  }, [handleResult]);

  // Kích hoạt vòng lặp dự đoán khi ready
  useEffect(() => {
    if (phase === "ready") {
      rafRef.current = requestAnimationFrame(runInference);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, runInference]);

  // ── UI Render ──────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="translate-page">
        {phase === "model" && (
          <div className="main-content">
            <div className="content-wrapper">
              <div style={{ textAlign: "center", padding: "60px 40px" }}>
                <div className="load-ring" style={{ marginBottom: "20px" }}>
                  <div className="spinner"></div>
                </div>
                <div className="load-msg">{loadMsg}</div>
                <div
                  style={{
                    marginTop: "20px",
                    height: "8px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${loadPct}%`,
                      background: "linear-gradient(90deg, #2979ff, #00e676)",
                    }}
                  />
                </div>
                <div className="load-hint">{loadPct}%</div>
              </div>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="main-content">
            <div className="content-wrapper">
              <div style={{ textAlign: "center", padding: "60px 40px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⚠️</div>
                <div className="err-msg">{errorMsg}</div>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "#ff7043",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  🔄 Tải lại
                </button>
              </div>
            </div>
          </div>
        )}

        {(phase === "cam" || phase === "ready") && (
          <div className="main-content">
            <div className="content-wrapper">
              <div className="tl-header">
                <div className="tl-title">
                  <div className="tl-icon">🤲</div>
                  <div>
                    <h1>VISITALK</h1>
                    <p>Vietnamese Sign Language Translator</p>
                  </div>
                </div>
                <div className="tl-status">
                  <div
                    className={`status-dot ${phase === "ready" ? "ready" : "loading"}`}
                  />
                  {phase === "ready" ? "Live" : "Loading"}
                </div>
              </div>

              <div className="tl-body">
                <div className="cam-panel">
                  {/* FIX LỖI CSS HIỂN THỊ: Ép khung bao quanh phải chiếm không gian */}
                  <div
                    className="cam-viewport"
                    style={{
                      position: "relative",
                      width: "100%",
                      minHeight: "360px",
                      background: "#000",
                      borderRadius: "12px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* FIX LỖI VIDEO 0px: Thêm inline-style ép cứng kích thước hiển thị trực quan */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 1,
                      }}
                    />

                    {phase === "cam" && (
                      <div className="cam-loading" style={{ zIndex: 2 }}>
                        <div className="spinner"></div>
                        <div className="load-msg">Starting camera...</div>
                      </div>
                    )}

                    {phase === "ready" && (
                      <>
                        {prediction && (
                          <div className="pred-badge" style={{ zIndex: 3 }}>
                            <div className="pred-letter">{prediction}</div>
                          </div>
                        )}
                        <div className="conf-arc" style={{ zIndex: 3 }}>
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
                              transform="rotate(-90 18 18)"
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
                        <div className="stable-bar" style={{ zIndex: 3 }}>
                          <div
                            className="stable-fill"
                            style={{ width: `${stablePct}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="cam-controls">
                    <button
                      className={`btn-ctrl ${paused ? "btn-play" : "btn-pause"}`}
                      onClick={() => setPaused((p) => !p)}
                    >
                      {paused ? "▶ Tiếp tục" : "⏸ Tạm dừng"}
                    </button>
                  </div>

                  {/* Top 3 Debug */}
                  {phase === "ready" && debugScores.length > 0 && (
                    <div
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid rgba(41,121,255,0.3)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: "0.78rem",
                        fontFamily: "monospace",
                        color: "#7a9acc",
                      }}
                    >
                      <div
                        style={{
                          color: "#3a5a8a",
                          marginBottom: 6,
                          fontSize: "0.68rem",
                          textTransform: "uppercase",
                        }}
                      >
                        Debug — Top 3 Predictions
                      </div>
                      {debugScores.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              minWidth: 52,
                              color: i === 0 ? "#00e676" : "#4a6a9a",
                              fontWeight: i === 0 ? 700 : 400,
                            }}
                          >
                            {s.label}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              background: "rgba(255,255,255,0.07)",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${(s.score * 100).toFixed(1)}%`,
                                background: i === 0 ? "#00e676" : "#2979ff",
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span style={{ minWidth: 46, textAlign: "right" }}>
                            {(s.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="output-panel">
                  <div className="current-sign">
                    <p className="section-label">Ký hiệu hiện tại</p>
                    <div
                      className={`sign-display ${prediction ? "active" : ""}`}
                    >
                      {prediction ?? "—"}
                    </div>
                  </div>

                  <div className="text-output-block">
                    <div className="output-header">
                      <p className="section-label">Văn bản dịch</p>
                      <div className="output-actions">
                        <button
                          className="btn-sm"
                          onClick={() =>
                            outputText &&
                            navigator.clipboard?.writeText(outputText)
                          }
                        >
                          📋 Copy
                        </button>
                        <button
                          className="btn-sm btn-danger"
                          onClick={() => setOutputText("")}
                        >
                          🗑 Clear
                        </button>
                      </div>
                    </div>
                    <div className="text-output">
                      {outputText || (
                        <span className="placeholder">
                          Chữ sẽ xuất hiện ở đây...
                        </span>
                      )}
                      <span className="cursor-blink">|</span>
                    </div>
                  </div>

                  <div className="alphabet-block">
                    <p className="section-label">Bảng chữ cái VSL</p>
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
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
        <canvas ref={overlayRef} style={{ display: "none" }} />
      </div>
    </>
  );
}
