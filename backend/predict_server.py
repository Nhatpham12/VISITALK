import sys
import json
import joblib
import numpy as np

MODEL_PATH = sys.argv[1] if len(sys.argv) > 1 else "frontend/public/model/vsl_model.joblib"

pipeline = joblib.load(MODEL_PATH)

model = pipeline["model"]
scaler = pipeline["scaler"]
inv_mapping = {v: k for k, v in pipeline["label_mapping"].items()}

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    try:
        data = json.loads(line)
    except json.JSONDecodeError:
        continue

    features = data.get("features")
    if not features or len(features) != scaler.n_features_in_:
        print(json.dumps({"error": f"Expected {scaler.n_features_in_} features"}), flush=True)
        continue

    X = np.array([features], dtype=np.float64)
    X_scaled = scaler.transform(X)

    preds = model.predict_proba(X_scaled)[0]
    classes = model.classes_

    top3_idx = np.argsort(preds)[::-1][:3]

    result = {
        "label": inv_mapping[int(classes[top3_idx[0]])],
        "confidence": float(preds[top3_idx[0]]),
        "top3": [
            {"label": inv_mapping[int(classes[i])], "score": float(preds[i])}
            for i in top3_idx
        ],
    }
    print(json.dumps(result), flush=True)
