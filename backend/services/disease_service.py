"""
CROPWISE AI - Crop Disease Backend Service
Bridges API controllers to the PyTorch inference pipeline and manages DB logging.
"""

import os
import json
from typing import Dict, Any, List
from PIL import Image
from sqlalchemy.orm import Session

from backend.models.db_models import DiseasePredictionLog
from ml.disease.preprocess import DISEASE_CLASSES, DISEASE_ADVISORY
from ml.disease.predict import predict_crop_disease, load_inference_model

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "disease", "model"))
MODEL_PATH = os.path.join(MODEL_DIR, "crop_disease_model.pt")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")


def is_disease_model_ready() -> bool:
    """Checks whether the PyTorch model checkpoint exists on disk."""
    return os.path.exists(MODEL_PATH)


def get_disease_model_info() -> Dict[str, Any]:
    """Reads metadata of the currently active disease classifier."""
    if not os.path.exists(MODEL_PATH):
        return {
            "loaded": False,
            "version": "Not Loaded",
            "architecture": "MobileNetV2 (Uninitialized)",
            "best_val_acc": None,
            "num_classes": len(DISEASE_CLASSES),
        }

    meta = {}
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception:
            pass

    return {
        "loaded": True,
        "version": "1.0.0-TransferLearning",
        "architecture": meta.get("architecture", "MobileNetV2 Transfer Learning"),
        "best_val_acc": meta.get("best_val_acc", None),
        "num_classes": len(meta.get("classes", DISEASE_CLASSES)),
        "trained_at": meta.get("created_at", "N/A"),
    }


def execute_disease_prediction(
    image: Image.Image,
    filename: str = "uploaded_leaf.jpg",
    db: Session = None
) -> Dict[str, Any]:
    """Runs prediction and logs record to SQLite database."""
    if not is_disease_model_ready():
        raise FileNotFoundError(
            "Disease ML model is not available. Please run the training pipeline "
            "using 'python ml/disease/train.py' or 'python bootstrap_models.py'."
        )

    # Execute real PyTorch inference
    result = predict_crop_disease(image, top_k=3, model_path=MODEL_PATH)

    # Persist log if database session provided
    if db is not None:
        try:
            log_entry = DiseasePredictionLog(
                filename=filename,
                crop=result.get("crop", "Unknown"),
                predicted_disease=result["disease"],
                confidence=result["confidence"],
                severity=result["severity"],
                symptoms_json=json.dumps(result.get("symptoms", [])),
                treatment_json=json.dumps(result.get("treatment", [])),
                prevention_json=json.dumps(result.get("prevention", [])),
                top_predictions_json=json.dumps(result.get("top_predictions", [])),
                is_real_ml=True
            )
            db.add(log_entry)
            db.commit()
        except Exception as err:
            db.rollback()
            print(f"[Warning] Failed to persist disease prediction log: {err}")

    return result


def get_all_disease_classes() -> List[Dict[str, Any]]:
    """Returns directory of all detectable disease profiles."""
    classes_list = []
    for c in DISEASE_CLASSES:
        adv = DISEASE_ADVISORY.get(c, {})
        classes_list.append({
            "id": c,
            "name": adv.get("display_name", c.replace("_", " ")),
            "crop": adv.get("crop", "General"),
            "severity": adv.get("default_severity", "Moderate")
        })
    return classes_list
