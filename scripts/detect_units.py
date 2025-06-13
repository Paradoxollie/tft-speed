#!/usr/bin/env python3
"""Detect TFT unit portraits in a screenshot using an ONNX YOLOv8-nano model.

Usage:
    python detect_units.py path/to/screenshot.png

Outputs a JSON array to stdout, e.g.
    [{"champ": "Ahri", "x": 123, "y": 456, "conf": 0.88}, ...]

Requirements:
    • Python 3.12
    • onnxruntime
    • pillow (PIL)
    • numpy
    • ultralytics (for non_max_suppression helper)

The model is expected at models/weights.onnx (relative to this script).
If the model is missing, the script exits with status code 1.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import List, Dict

import numpy as np
from PIL import Image
import onnxruntime as ort
from ultralytics.utils import non_max_suppression  # type: ignore

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
MODEL_PATH = SCRIPT_DIR.parent / "models" / "weights.onnx"
CHAMPIONS_JSON = SCRIPT_DIR.parent.parent / "data" / "latest" / "champions.json"

CONF_THRESHOLD = 0.25
IOU_THRESHOLD = 0.45

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def load_champion_mapping() -> List[str]:
    """Return a list mapping class IDs to champion names."""
    try:
        with open(CHAMPIONS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Preserve insertion order (Python ≥3.7) – adjust if training order differs.
        champ_names = [champ["name"] for champ in data["data"].values()]
        return champ_names
    except FileNotFoundError:
        return []


def preprocess_image(img_path: Path, img_size: int) -> np.ndarray:
    """Load image, resize to square (img_size × img_size), return normalized tensor."""
    img = Image.open(img_path).convert("RGB")
    img = img.resize((img_size, img_size), Image.Resampling.BILINEAR)
    img_arr = np.asarray(img, dtype=np.float32) / 255.0  # 0-1
    img_arr = img_arr.transpose(2, 0, 1)  # HWC → CHW
    img_arr = np.expand_dims(img_arr, axis=0)  # add batch dim
    return img_arr


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python detect_units.py screenshot.png", file=sys.stderr)
        sys.exit(1)

    screenshot_path = Path(sys.argv[1])
    if not screenshot_path.exists():
        print(f"Screenshot file not found: {screenshot_path}", file=sys.stderr)
        sys.exit(1)

    if not MODEL_PATH.exists():
        print(f"Model file missing: {MODEL_PATH}", file=sys.stderr)
        sys.exit(1)

    # Load class mapping
    class_names = load_champion_mapping()

    # Load ONNX model
    session = ort.InferenceSession(MODEL_PATH.as_posix(), providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name
    # Infer expected size (assumes static square model input)
    input_shape = session.get_inputs()[0].shape  # e.g. [1,3,640,640]
    img_size = int(input_shape[2] or 640)

    # Pre-process image
    img_tensor = preprocess_image(screenshot_path, img_size)

    # Run inference
    outputs = session.run(None, {input_name: img_tensor})
    preds = outputs[0]

    # NMS
    nms_results = non_max_suppression(
        preds,
        conf_thres=CONF_THRESHOLD,
        iou_thres=IOU_THRESHOLD,
        max_det=300,
    )

    detections: List[Dict] = []
    for det in nms_results[0]:  # first (and only) batch
        x1, y1, x2, y2, conf, cls_id = det.tolist()
        cls_id = int(cls_id)
        champ_name = class_names[cls_id] if 0 <= cls_id < len(class_names) else str(cls_id)
        detections.append(
            {
                "champ": champ_name,
                "x": int(x1),
                "y": int(y1),
                "conf": round(float(conf), 4),
            }
        )

    print(json.dumps(detections, ensure_ascii=False))


if __name__ == "__main__":
    main() 