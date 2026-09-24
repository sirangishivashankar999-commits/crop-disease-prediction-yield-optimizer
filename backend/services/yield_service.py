"""
CROPWISE AI - Crop Yield Backend Service
Connects FastAPI controllers to the champion scikit-learn/XGBoost regressor.
"""

import os
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session

import importlib

try:
    ml_yield_predict = importlib.import_module("ml.yield.predict")
    predict_crop_yield = ml_yield_predict.predict_crop_yield
    load_yield_model = ml_yield_predict.load_yield_model
except Exception as err:
    print(f"[Warning] Could not import ml.yield.predict: {err}")
    ml_yield_predict = None
    predict_crop_yield = None
    load_yield_model = None

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "yield", "model"))
BUNDLE_PATH = os.path.join(MODEL_DIR, "yield_best_model.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "yield_metadata.json")


def is_yield_model_ready() -> bool:
    """Checks whether the trained champion regressor bundle exists on disk."""
    return os.path.exists(BUNDLE_PATH)


def get_yield_model_info() -> Dict[str, Any]:
    """Reads champion model metadata and tournament metrics."""
    if not os.path.exists(BUNDLE_PATH):
        return {
            "loaded": False,
            "champion_model": "None (Not Loaded)",
            "r2_score": None,
            "mae": None,
            "training_date": None,
        }

    meta = {}
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception:
            pass

    champ_metrics = meta.get("champion_metrics", {})
    return {
        "loaded": True,
        "champion_model": meta.get("champion_model", "Random Forest Regressor"),
        "r2_score": champ_metrics.get("r2", 0.0),
        "mae": champ_metrics.get("mae", 0.0),
        "rmse": champ_metrics.get("rmse", 0.0),
        "training_date": meta.get("trained_at", "N/A"),
        "comparison": meta.get("comparison", {}),
    }


def execute_yield_prediction(
    payload: Dict[str, Any],
    db: Session = None
) -> Dict[str, Any]:
    """Runs yield inference and logs to database."""
    if not is_yield_model_ready():
        raise FileNotFoundError(
            "Crop Yield ML model is not available. Please run the training tournament "
            "using 'python ml/yield/train.py' or 'python bootstrap_models.py'."
        )

    global predict_crop_yield
    if predict_crop_yield is None:
        try:
            import importlib
            mod = importlib.import_module("ml.yield.predict")
            predict_crop_yield = mod.predict_crop_yield
        except Exception as err:
            raise RuntimeError(f"Crop Yield ML engine is unavailable: {err}")

    result = predict_crop_yield(payload, bundle_path=BUNDLE_PATH)

    if db is not None:
        try:
            entry = YieldPredictionLog(
                crop=result["crop"],
                area=result["area_acres"],
                location=str(payload.get("location", "Unknown")),
                soil_type=str(payload.get("soil_type", "Loamy")),
                ph=float(payload.get("ph", 6.5)),
                temperature=float(payload.get("temperature", 25.0)),
                rainfall=float(payload.get("rainfall", 800.0)),
                humidity=float(payload.get("humidity", 65.0)),
                irrigation=float(payload.get("irrigation", 400.0)),
                fertilizer=float(payload.get("fertilizer", 120.0)),
                previous_yield=float(result["previous_yield"]),
                predicted_yield=float(result["predicted_yield_per_acre"]),
                total_production=float(result["total_estimated_production"]),
                productivity_score=int(result["productivity_score"]),
                risk_level=result["risk_level"],
                champion_model=result.get("champion_model", "Random Forest")
            )
            db.add(entry)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[Warning] Failed to persist yield prediction log: {e}")

    return result
