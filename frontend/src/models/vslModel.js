import * as tf from "@tensorflow/tfjs";

const MODEL_URL = "/model/model.json";

const VSL_CLASSES = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "space", "del", "nothing",
];

const IMG_SIZE = 128;

let model = null;

export async function loadVslModel(onProgress) {
  if (model) return model;
  model = await tf.loadLayersModel(MODEL_URL, onProgress ? { onProgress } : {});
  return model;
}

export function isModelLoaded() {
  return model !== null;
}

export async function predict(imageData) {
  if (!model) throw new Error("Model chưa được load");

  const tensor = tf.tidy(() => {
    const img = tf.browser.fromPixels(imageData, 3).toFloat();
    const resized = tf.image.resizeBilinear(img, [IMG_SIZE, IMG_SIZE]);
    return resized.expandDims(0);
  });

  const output = model.predict(tensor);
  const scores = await output.data();
  tf.dispose([tensor, output]);

  const allNaN = scores.every((s) => isNaN(s));
  if (allNaN) {
    return { label: "?", confidence: 0, scores: [], top3: [] };
  }

  const scoresArr = Array.from(scores);
  const maxIdx = scoresArr.indexOf(Math.max(...scoresArr));
  const label = VSL_CLASSES[maxIdx] || "?";
  const conf = maxIdx >= 0 ? scoresArr[maxIdx] : 0;

  const top3 = scoresArr
    .map((s, i) => ({ label: VSL_CLASSES[i] || "?", score: s }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return { label, confidence: conf, scores: scoresArr, top3 };
}

export { VSL_CLASSES };
