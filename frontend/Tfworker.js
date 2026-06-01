// public/tfWorker.js  ← đặt file này vào thư mục public/
// Web Worker: load TF.js + model hoàn toàn tách khỏi main thread

importScripts(
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js",
);

let model = null;
const CACHE_KEY = "indexeddb://vsl-model-v1";

// ── Load model (cache-first) ─────────────────────────────
async function loadModel(serverUrl) {
  // 1. Thử IndexedDB cache trước
  try {
    model = await tf.loadLayersModel(CACHE_KEY);
    self.postMessage({ type: "progress", pct: 100, msg: "Đã tải từ cache ✓" });
    self.postMessage({ type: "ready" });
    return;
  } catch {
    // cache miss → fetch từ server
  }

  // 2. Fetch từ server với progress
  self.postMessage({
    type: "progress",
    pct: 0,
    msg: "Đang tải model (~34MB)...",
  });

  model = await tf.loadLayersModel(serverUrl, {
    onProgress(fraction) {
      const pct = Math.round(fraction * 100);
      self.postMessage({
        type: "progress",
        pct,
        msg: `Đang tải model... ${pct}%`,
      });
    },
  });

  // 3. Lưu vào IndexedDB (lần sau load instant)
  self.postMessage({ type: "progress", pct: 99, msg: "Đang lưu cache..." });
  try {
    await model.save(CACHE_KEY);
  } catch (e) {
    console.warn("[Worker] Không lưu được cache:", e.message);
  }

  // 4. Warm-up
  const dummy = tf.zeros([1, 128, 128, 3]);
  model.predict(dummy).dispose();
  dummy.dispose();

  self.postMessage({ type: "progress", pct: 100, msg: "Sẵn sàng" });
  self.postMessage({ type: "ready" });
}

// ── Predict một frame ───────────────────────────────────
async function predict(pixels, width, height, classes) {
  if (!model) return;

  const output = tf.tidy(() => {
    const img = tf.browser.fromPixels({
      data: new Uint8Array(pixels),
      width,
      height,
    });
    const input = img.resizeBilinear([128, 128]).toFloat().expandDims(0);
    return model.predict(input);
  });

  const scores = await output.data();
  output.dispose();

  const maxIdx = scores.indexOf(Math.max(...scores));
  self.postMessage({
    type: "result",
    label: classes[maxIdx],
    conf: scores[maxIdx],
  });
}

// ── Message handler ─────────────────────────────────────
self.onmessage = async ({ data }) => {
  try {
    if (data.type === "load") await loadModel(data.url);
    if (data.type === "predict")
      await predict(data.pixels, data.width, data.height, data.classes);
    if (data.type === "clearCache") {
      await tf.io.removeModel(CACHE_KEY);
      self.postMessage({ type: "cacheCleared" });
    }
  } catch (err) {
    self.postMessage({ type: "error", msg: err.message });
  }
};
