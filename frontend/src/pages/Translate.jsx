// ============================================================
// Translate.jsx — VSL Real-time Recognition
// Vietnamese Sign Language Translator
// ============================================================

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import Navbar from "../components/Navbar";
import "../CSS/Translate.css";

// ─── Cấu hình ─────────────────────────────────────────────
const MODEL_PATH = "/model/model.json";
const WEIGHTS_PATH = "/model/group1-shard1of1.bin";
const STABLE_FRAMES = 10; // số frame liên tiếp giống nhau để ghi chữ

// 29 lớp VSL chuẩn từ Dataset
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

// ─── Vá lỗi tương thích định dạng Keras v3 ──────────────────
function patchModelJson(json) {
  const layers = json?.modelTopology?.model_config?.config?.layers;
  if (!layers) return json;
  layers.forEach((layer) => {
    const cfg = layer.config;
    if (
      layer.class_name === "InputLayer" &&
      cfg?.batch_shape &&
      !cfg?.batchInputShape
    ) {
      cfg.batchInputShape = cfg.batch_shape;
    }
    if (
      layer.inbound_nodes?.length > 0 &&
      !Array.isArray(layer.inbound_nodes[0]) &&
      typeof layer.inbound_nodes[0] === "object"
    ) {
      layer.inbound_nodes = layer.inbound_nodes.map((node) => {
        const result = [];
        if (node.args && Array.isArray(node.args)) {
          node.args.forEach((arg) => {
            if (
              arg.class_name === "__keras_tensor__" &&
              arg.config?.keras_history
            ) {
              const h = arg.config.keras_history;
              result.push([h[0], h[1], h[2], node.kwargs || {}]);
            }
          });
        }
        return result;
      });
    }
  });
  return json;
}

export default function Translate() {
  // ── Refs kiểm soát (Tránh kích hoạt re-render không cần thiết) ──
  const videoRef = useRef(null);
  const roiCanvasRef = useRef(null);
  const modelRef = useRef(null);
  const streamRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const stableRef = useRef({ label: null, count: 0 });
  const confThreshRef = useRef(0.55);
  const swapRef = useRef(false);

  // ── States quản lý giao diện UI ──
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
  const [confThresh, setConfThresh] = useState(0.55);
  const [swapChannels, setSwapChannels] = useState(false);

  // Đồng bộ thời gian thực các State điều khiển vào Refs để Vòng lặp AI luôn nhận dữ liệu mới nhất
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    confThreshRef.current = confThresh;
  }, [confThresh]);
  useEffect(() => {
    swapRef.current = swapChannels;
  }, [swapChannels]);

  // ════════════════════════════════════════════════════════
  // BƯỚC 1 — Tải & Cấu hình môi trường TensorFlow.js
  // ════════════════════════════════════════════════════════
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadMsg("Đang thiết lập WebGL Backend...");
        await tf.setBackend("webgl");
        await tf.ready();

        // 1a. Tải tệp cấu trúc mạng model.json
        setLoadMsg("Đang tải tệp kiến trúc mạng...");
        setLoadPct(10);
        const res = await fetch(MODEL_PATH);
        if (!res.ok)
          throw new Error(`HTTP ${res.status} khi đọc cấu trúc model`);
        let modelJson = patchModelJson(await res.json());

        // 1b. Tải tệp nhị phân trọng số weights
        setLoadMsg("Đang liên kết dữ liệu trọng số...");
        setLoadPct(35);
        const wRes = await fetch(WEIGHTS_PATH);
        if (!wRes.ok)
          throw new Error(`HTTP ${wRes.status} khi đọc file weights`);
        const weightData = await wRes.arrayBuffer();

        if (cancelled) return;

        // 1c. Biên dịch mô hình trong bộ nhớ WebGL
        setLoadMsg("Đang biên dịch mô hình...");
        setLoadPct(65);
        const model = await tf.loadLayersModel(
          tf.io.fromMemory({
            modelTopology: modelJson.modelTopology,
            weightSpecs: modelJson.weightsManifest[0].weights,
            weightData: weightData,
          }),
        );

        if (cancelled) {
          model.dispose();
          return;
        }

        // 1d. Chạy kích hoạt giả lập (Warm-up) để tăng tốc cho lần chạy đầu tiên
        setLoadMsg("Đang tối ưu hóa GPU (Warm-up)...");
        setLoadPct(90);
        const dummy = tf.zeros([1, 128, 128, 3]);
        const warmOut = model.predict(dummy);
        await warmOut.data();
        dummy.dispose();
        warmOut.dispose();

        modelRef.current = model;

        if (!cancelled) {
          setLoadPct(100);
          setLoadMsg("Mô hình sẵn sàng!");
          setPhase("cam");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Lỗi khởi tạo mô hình:", err);
          setPhase("error");
          setErrorMsg(`Không thể tải mô hình AI: ${err.message}`);
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
  // BƯỚC 3 — Vòng lặp nhận diện thực tế (Flat Loop Queue)
  // ════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== "ready") return;

    runningRef.current = true;

    // Tạo canvas xử lý ảnh tạm ẩn
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 128;
    tmpCanvas.height = 128;
    const tmpCtx = tmpCanvas.getContext("2d");

    async function loop() {
      if (!runningRef.current) return;

      const video = videoRef.current;
      const model = modelRef.current;

      if (
        !video ||
        !model ||
        pausedRef.current ||
        video.readyState < 2 ||
        video.videoWidth === 0
      ) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      let scoreArray = null;

      try {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const size = Math.min(vw, vh) * 0.7;
        const sx = (vw - size) / 2;
        const sy = (vh - size) / 2;

        // 🟢 SỬA LỖI LẬT ẢNH (Mirror View): Đồng bộ hướng ảnh thực với CSS của video
        tmpCtx.clearRect(0, 0, 128, 128);
        tmpCtx.save();
        tmpCtx.translate(128, 0);
        tmpCtx.scale(-1, 1); // Lật ngang canvas để khớp góc nhìn tay của bạn khi chụp
        tmpCtx.drawImage(video, sx, sy, size, size, 0, 0, 128, 128);
        tmpCtx.restore();

        // Đẩy ảnh đã sửa lật lên khung preview nhỏ trên màn hình
        if (roiCanvasRef.current) {
          const roiCtx = roiCanvasRef.current.getContext("2d");
          if (roiCtx) {
            roiCtx.clearRect(0, 0, 128, 128);
            roiCtx.drawImage(tmpCanvas, 0, 0, 128, 128);
          }
        }

        // 🟢 XỬ LÝ TENSOR ĐỒNG BỘ: Tách khối async hoàn toàn khỏi tf.tidy
        const outputTensor = tf.tidy(() => {
          let t = tf.browser.fromPixels(tmpCanvas).asType("float32");

          // SỬA LỖI ĐẢO KÊNH MÀU: Dùng hàm hệ thống .reverse(2) thay vì split/concat lỗi
          if (swapRef.current) {
            t = t.reverse(2);
          }

          const input = t.expandDims(0); // Chuẩn hóa Shape đầu vào thành [1, 128, 128, 3]
          return model.predict(input); // Trả ra Tensor kết quả dạng Softmax [1, 29]
        });

        // Chuyển dữ liệu mảng số từ GPU sang CPU một cách an toàn nhất
        const rawData = await outputTensor.data();
        scoreArray = Array.from(rawData);

        // Giải phóng ngay lập tức vùng nhớ trên bộ nhớ đồ họa WebGL
        outputTensor.dispose();
      } catch (err) {
        console.error("Lỗi trong chu kỳ Inference:", err);
      }

      // Xử lý dữ liệu số trả về và cập nhật đồng bộ trực tiếp lên UI
      if (scoreArray && scoreArray.length > 0 && !isNaN(scoreArray[0])) {
        let maxIdx = 0;
        for (let i = 1; i < scoreArray.length; i++) {
          if (scoreArray[i] > scoreArray[maxIdx]) maxIdx = i;
        }

        const label = CLASSES[maxIdx] ?? `cls_${maxIdx}`;
        const conf = scoreArray[maxIdx];

        // Lọc cấu trúc Top 3 hiển thị bảng tần suất
        const top3 = scoreArray
          .map((s, i) => ({
            label: CLASSES[i] ?? `cls_${i}`,
            score: isNaN(s) ? 0 : s,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        setDebugTop3(top3);

        setConfidence(Math.round(conf * 100));
        setPrediction(label === "nothing" ? null : label);

        // Logic tích lũy nhận diện chuỗi ký tự (Debounce Frames)
        const s = stableRef.current;
        if (conf >= confThreshRef.current && label !== "nothing") {
          if (label === s.label) {
            s.count++;
            setStablePct(Math.round((s.count / STABLE_FRAMES) * 100));

            if (s.count >= STABLE_FRAMES) {
              if (label === "space") {
                setOutputText((prev) => prev + " ");
              } else if (label === "del") {
                setOutputText((prev) => prev.slice(0, -1));
              } else {
                setOutputText((prev) => prev + label);
              }
              s.label = null;
              s.count = 0;
              setStablePct(0);
            }
          } else {
            s.label = label;
            s.count = 1;
            setStablePct(Math.round((1 / STABLE_FRAMES) * 100));
          }
        } else {
          s.label = null;
          s.count = 0;
          setStablePct(0);
        }
      }

      // 🟢 VÒNG LẶP PHẲNG: Chỉ xếp hàng yêu cầu frame tiếp theo khi frame hiện tại đã dọn dẹp sạch vùng nhớ
      if (runningRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    // Kích hoạt chu kỳ chạy đầu tiên
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
                            justifycontent: "space-between",
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

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={swapChannels}
                          onChange={(e) => setSwapChannels(e.target.checked)}
                          style={{
                            width: 16,
                            height: 16,
                            cursor: "pointer",
                            accentColor: "#2979ff",
                          }}
                        />
                        <span style={{ fontSize: "0.79rem", color: "#7a9acc" }}>
                          Đảo định dạng màu RGB ↔ BGR (Dùng khi train bằng
                          OpenCV)
                        </span>
                      </label>
                    </div>
                  </div>

                  {phase === "ready" && (
                    <div
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid rgba(41,121,255,0.3)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          color: "#3a5a8a",
                          fontSize: "0.68rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          width: "100%",
                        }}
                      >
                        Vùng trích xuất gửi sang AI (128×128)
                      </div>
                      <canvas
                        ref={roiCanvasRef}
                        width={128}
                        height={128}
                        style={{
                          width: 128,
                          height: 128,
                          border: "2px solid rgba(41,121,255,0.35)",
                          borderRadius: 8,
                          background: "#000",
                        }}
                      />
                    </div>
                  )}

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
