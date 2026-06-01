<<<<<<< HEAD
// Worker file: src/workers/tfWorker.js (Vite sẽ tự handle)
// Model:       public/model/model.json + public/model/group1-shard1of1.bin
// Package:     npm install @tensorflow/tfjs  (vẫn cần cho type hints, ko dùng trực tiếp)

import React, { useEffect, useRef, useState, useCallback } from "react";
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

const CONF_THRESH = 0.8;
const STABLE_FRAMES = 12;

export default function Translate() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const workerRef = useRef(null);
  const rafRef = useRef(null);
  const stableRef = useRef(0);
  const lastLblRef = useRef(null);
  const busyRef = useRef(false); // worker đang xử lý?

  const [phase, setPhase] = useState("model"); // model|cam|ready|error
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("Đang khởi tạo...");
  const [errorMsg, setErrorMsg] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [stablePct, setStablePct] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [paused, setPaused] = useState(false);

  // ── Bước 1: Tạo Worker, load model bên trong Worker ──
  useEffect(() => {
    // Tạo worker từ file public với Vite URL
    const worker = new Worker(new URL("../workers/tfWorker.js", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case "progress":
          setLoadPct(data.pct);
          setLoadMsg(data.msg);
          break;

        case "ready":
          // Model xong trong worker → mở webcam ở main thread
          setPhase("cam");
          break;

        case "result":
          busyRef.current = false;
          handleResult(data.label, data.conf);
          break;

        case "error":
          setPhase("error");
          setErrorMsg(data.msg);
          break;

        case "cacheCleared":
          alert("Đã xoá cache. Tải lại trang để load model mới.");
          break;

        default:
          break;
      }
    };

    worker.onerror = (e) => {
      setPhase("error");
      setErrorMsg("Worker lỗi: " + e.message);
    };

    // Gửi lệnh load model — URL tuyệt đối để worker fetch được
    worker.postMessage({
      type: "load",
      url: window.location.origin + "/model/model.json",
    });

    return () => {
      worker.terminate();
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line

  // ── Bước 2: Mở webcam sau khi model sẵn sàng ─────────
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
      } catch (err) {
        setPhase("error");
        setErrorMsg("Webcam: " + err.message);
      }
    })();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [phase]);

  // ── Xử lý kết quả predict từ Worker ──────────────────
  const handleResult = useCallback((label, conf) => {
    if (conf >= CONF_THRESH && label !== "nothing") {
      setPrediction(label);
      setConfidence(Math.round(conf * 100));

      if (label === lastLblRef.current) {
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
        lastLblRef.current = label;
        stableRef.current = 1;
        setStablePct(0);
      }
    } else {
      setPrediction(null);
      setConfidence(0);
      stableRef.current = 0;
      lastLblRef.current = null;
      setStablePct(0);
    }
  }, []);

  // ── Bước 3: RAF loop — capture frame, gửi Worker ─────
  const loop = useCallback(() => {
    drawROI(); // vẽ overlay mỗi frame — luôn mượt

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video?.readyState >= 2 && !busyRef.current && workerRef.current) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Vẽ mirror
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Crop ROI vuông chính giữa
      const side = Math.min(canvas.width, canvas.height);
      const sx = (canvas.width - side) / 2;
      const sy = (canvas.height - side) / 2;
      const { data } = ctx.getImageData(sx, sy, side, side);

      // Transferable → zero-copy, không block main thread
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

  // ── Vẽ ROI overlay ────────────────────────────────────
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

    // Làm tối vùng ngoài ROI
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, W, y0);
    ctx.fillRect(0, y0 + size, W, H);
    ctx.fillRect(0, y0, x0, size);
    ctx.fillRect(x0 + size, y0, W, size);

    // Viền glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.strokeRect(x0, y0, size, size);

    // Góc accent
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

  const clearCache = () =>
    workerRef.current?.postMessage({ type: "clearCache" });

  const phaseLabel = {
    model: "Đang tải model...",
    cam: "Đang mở webcam...",
    ready: "Sẵn sàng",
    error: "Lỗi",
  };

=======
import React from "react";
import Navbar from "../components/Navbar";
import "../CSS/Translate.css";
const Translate = () => {
>>>>>>> 61a5838 (sửa 1)
  return (
    <>
      <Navbar />
      <div className="translate-page">
        <div className="main-content">
          <div className="content-wrapper">
            <div className="form-group"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Translate;
