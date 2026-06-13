// ============================================================
// Translate.jsx — VSL Real-time Recognition
// Vietnamese Sign Language Translator
// ============================================================

import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Navbar from "../components/Navbar";
import "../CSS/Translate.css";
import { detectFingers, classifyLetter } from "../utils/fingerPose";

const STABLE_FRAMES = 10;

// 29 lớp VSL chuẩn từ Dataset
const CLASSES = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "space", "del", "nothing",
];

export default function Translate() {
  // ── Refs ──
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const stableRef = useRef({ label: null, count: 0 });
  const confThreshRef = useRef(0.30);

  // ── States ──
  const [phase, setPhase] = useState("model"); // model | cam | ready | error
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("Đang khởi tạo...");
  const [errorMsg, setErrorMsg] = useState("");

  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [stablePct, setStablePct] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [debugTop3, setDebugTop3] = useState([]);

  const [paused, setPaused] = useState(false);
  const [confThresh, setConfThresh] = useState(0.30);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { confThreshRef.current = confThresh; }, [confThresh]);

  // ════════════════════════════════════════════════════════
  // BƯỚC 1 — Tải HandLandmarker
  // ════════════════════════════════════════════════════════
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadMsg("Đang tải bộ phát hiện bàn tay MediaPipe...");
        setLoadPct(40);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (cancelled) return;

        window.__handLandmarker = handLandmarker;
        setLoadPct(100);
        setLoadMsg("Sẵn sàng! Đang mở camera...");
        setPhase("cam");
      } catch (err) {
        if (!cancelled) {
          console.error("Lỗi khởi tạo:", err);
          setPhase("error");
          setErrorMsg(`Không thể tải AI: ${err.message}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (window.__handLandmarker) {
        window.__handLandmarker.close();
        window.__handLandmarker = null;
      }
    };
  }, []);

  // ════════════════════════════════════════════════════════
  // BƯỚC 2 — Khởi tạo luồng Camera và kết nối phần cứng
  // ════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== "cam") return;
    let cancelled = false;

    (async () => {
      try {
        while (!videoRef.current && !cancelled) {
          await new Promise((r) => setTimeout(r, 50));
        }
        if (cancelled) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = async () => {
          if (cancelled) return;
          try {
            await video.play();
          } catch (e) {
            console.warn("Video không thể phát tự động:", e);
          }
          if (!cancelled) setPhase("ready");
        };
      } catch (err) {
        if (!cancelled) {
          setPhase("error");
          setErrorMsg(`Không thể kết nối Camera: ${err.message}`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // ════════════════════════════════════════════════════════
  // BƯỚC 3 — Vòng lặp nhận diện (MediaPipe + fingerPose)
  // ════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== "ready") return;

    runningRef.current = true;
    let skipCounter = 0;

    function loop() {
      if (!runningRef.current) return;

      const video = videoRef.current;
      const handLandmarker = window.__handLandmarker;

      if (!video || !handLandmarker || pausedRef.current || video.readyState < 2 || video.videoWidth === 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      skipCounter++;
      if (skipCounter % 12 !== 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      try {
        const result = handLandmarker.detectForVideo(video, performance.now());
        if (result.landmarks && result.landmarks.length > 0) {
          const lm = result.landmarks[0];
          const fingers = detectFingers(lm);
          const pred = classifyLetter(fingers, lm);

          setConfidence(Math.round(pred.confidence * 100));
          setPrediction(pred.label);
          setDebugTop3(pred.top3.map(t => ({ label: t[0], score: t[1] })));

          const s = stableRef.current;
          if (pred.confidence >= confThreshRef.current && pred.label !== "?") {
            if (pred.label === s.label) {
              s.count++;
              setStablePct(Math.round((s.count / STABLE_FRAMES) * 100));
              if (s.count >= STABLE_FRAMES) {
                if (pred.label === "space") setOutputText((prev) => prev + " ");
                else if (pred.label === "del") setOutputText((prev) => prev.slice(0, -1));
                else setOutputText((prev) => prev + pred.label);
                s.label = null;
                s.count = 0;
                setStablePct(0);
              }
            } else {
              s.label = pred.label;
              s.count = 1;
              setStablePct(Math.round((1 / STABLE_FRAMES) * 100));
            }
          } else {
            s.label = null;
            s.count = 0;
            setStablePct(0);
          }
        } else {
          setPrediction(null);
          setConfidence(0);
          setDebugTop3([]);
          stableRef.current = { label: null, count: 0 };
          setStablePct(0);
        }
      } catch (err) {
        console.error("Lỗi inference:", err);
      }

      if (runningRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // ════════════════════════════════════════════════════════
  // GIAO DIỆN HIỂN THỊ (RENDER UI)
  // ════════════════════════════════════════════════════════
  return (
    <>
      <Navbar />
      <div className="translate-page">
        {phase === "model" && (
          <div className="main-content">
            <div className="content-wrapper">
              <div style={{ textAlign: "center", padding: "60px 40px" }}>
                <div className="load-ring" style={{ marginBottom: 20 }}>
                  <div className="spinner" />
                </div>
                <div className="load-msg">{loadMsg}</div>
                <div
                  style={{
                    marginTop: 20,
                    height: 8,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${loadPct}%`,
                      background: "linear-gradient(90deg,#2979ff,#00e676)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <div className="load-hint" style={{ marginTop: 8 }}>
                  {loadPct}%
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="main-content">
            <div className="content-wrapper">
              <div style={{ textAlign: "center", padding: "60px 40px" }}>
                <div style={{ fontSize: "3rem", marginBottom: 20 }}>⚠️</div>
                <div className="err-msg">{errorMsg}</div>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: 20,
                    padding: "10px 24px",
                    background: "#ff7043",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  🔄 Tải lại cấu hình
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
                  {phase === "ready" ? "Đang nhận diện" : "Đang mở camera..."}
                </div>
              </div>

              <div className="tl-body">
                {/* Cột hiển thị Camera điều khiển */}
                <div className="cam-panel">
                  <div
                    className="cam-viewport"
                    style={{
                      position: "relative",
                      width: "100%",
                      minHeight: 360,
                      background: "#000",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
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
                        inset: 0,
                        zIndex: 1,
                        transform: "scaleX(-1)",
                      }}
                    />

                    {phase === "cam" && (
                      <div
                        className="cam-loading"
                        style={{
                          zIndex: 2,
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          background: "rgba(7,17,31,0.9)",
                        }}
                      >
                        <div className="spinner" />
                        <div className="load-msg">
                          Đang khởi động webcam phần cứng...
                        </div>
                      </div>
                    )}

                    {phase === "ready" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "15%",
                          left: "17.5%",
                          width: "65%",
                          height: "70%",
                          border: "2px dashed #00e676",
                          borderRadius: 12,
                          boxShadow: "0 0 18px rgba(0,230,118,0.3)",
                          pointerEvents: "none",
                          zIndex: 2,
                        }}
                      />
                    )}

                    {phase === "ready" && prediction && (
                      <div className="pred-badge" style={{ zIndex: 3 }}>
                        <div className="pred-letter">{prediction}</div>
                      </div>
                    )}

                    {phase === "ready" && (
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
                            stroke={confidence >= 75 ? "#00e676" : "#2979ff"}
                            strokeWidth="3"
                            strokeDasharray={`${isNaN(confidence) ? 0 : confidence} 100`}
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
                            {isNaN(confidence) ? 0 : confidence}%
                          </text>
                        </svg>
                      </div>
                    )}

                    {phase === "ready" && (
                      <div className="stable-bar" style={{ zIndex: 3 }}>
                        <div
                          className="stable-fill"
                          style={{
                            width: `${stablePct}%`,
                            transition: "width 0.1s linear",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="cam-controls">
                    <button
                      className={`btn-ctrl ${paused ? "btn-play" : "btn-pause"}`}
                      onClick={() => setPaused((p) => !p)}
                    >
                      {paused ? "▶ Tiếp tục xử lý" : "⏸ Tạm dừng AI"}
                    </button>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.8rem",
                            color: "#7a9acc",
                          }}
                        >
                          <span>Độ tin cậy tối thiểu</span>
                          <span style={{ color: "#00e676", fontWeight: 700 }}>
                            {Math.round(confThresh * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.30"
                          max="0.95"
                          step="0.05"
                          value={confThresh}
                          onChange={(e) =>
                            setConfThresh(parseFloat(e.target.value))
                          }
                          style={{
                            cursor: "pointer",
                            accentColor: "#2979ff",
                            width: "100%",
                          }}
                        />
                      </div>

                    </div>
                  </div>

                  {phase === "ready" && debugTop3.length > 0 && (
                    <div
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid rgba(41,121,255,0.25)",
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
                        Xác suất phân lớp cao nhất (Top 3)
                      </div>
                      {debugTop3.map((s, i) => (
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

                {/* Cột kết quả dịch ngôn ngữ */}
                <div className="output-panel">
                  <div className="current-sign">
                    <p className="section-label">Ký hiệu bắt được</p>
                    <div
                      className={`sign-display ${prediction ? "active" : ""}`}
                    >
                      {prediction ?? "—"}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        justifyContent: "center",
                        gap: 16,
                        fontSize: "0.78rem",
                        color: "#3a5a8a",
                      }}
                    >
                      <span>
                        Độ tin cậy:{" "}
                        <b
                          style={{
                            color:
                              confidence >= Math.round(confThresh * 100)
                                ? "#00e676"
                                : "#2979ff",
                          }}
                        >
                          {isNaN(confidence) ? 0 : confidence}%
                        </b>
                      </span>
                      <span>
                        Giữ tay ổn định:{" "}
                        <b style={{ color: "#2979ff" }}>{stablePct}%</b>
                      </span>
                    </div>
                  </div>

                  <div className="text-output-block">
                    <div className="output-header">
                      <p className="section-label">
                        Văn bản dịch ngôn ngữ ký hiệu
                      </p>
                      <div className="output-actions">
                        <button
                          className="btn-sm"
                          onClick={() =>
                            outputText &&
                            navigator.clipboard?.writeText(outputText)
                          }
                        >
                          📋 Sao chép
                        </button>
                        <button
                          className="btn-sm btn-danger"
                          onClick={() => setOutputText("")}
                        >
                          🗑 Làm sạch
                        </button>
                      </div>
                    </div>
                    <div className="text-output">
                      {outputText || (
                        <span className="placeholder">
                          Bắt đầu đưa tay vào khung nhận diện để ghép chữ...
                        </span>
                      )}
                      <span className="cursor-blink">|</span>
                    </div>
                  </div>

                  <div className="alphabet-block">
                    <p className="section-label">Danh sách ký tự VSL hỗ trợ</p>
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
      </div>
    </>
  );
}
