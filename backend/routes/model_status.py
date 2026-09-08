"""
CROPWISE AI - Model Status & Health API Endpoint
Reports live availability, architecture, and evaluation metrics for both ML models.
"""

from fastapi import APIRouter
from backend.schemas.common_schema import ModelStatusResponse
from backend.services.disease_service import get_disease_model_info, is_disease_model_ready
from backend.services.yield_service import get_yield_model_info, is_yield_model_ready

router = APIRouter(prefix="/model", tags=["ML System Status"])


@router.get("/status", response_model=ModelStatusResponse, summary="Check loaded ML models and metrics")
def get_system_model_status():
    """
    Returns real-time status of both ML systems:
    - Crop Disease PyTorch Transfer Learning model
    - Crop Yield Scikit-Learn/XGBoost Champion Regressor
    """
    d_ready = is_disease_model_ready()
    d_info = get_disease_model_info()

    y_ready = is_yield_model_ready()
    y_info = get_yield_model_info()

    if d_ready and y_ready:
        health = "Operational (All ML Models Loaded)"
        instructions = "System fully operational. Both Computer Vision and Regressor models are actively serving predictions."
    elif d_ready or y_ready:
        health = "Degraded (Partial Models Loaded)"
        instructions = "One or more ML models require training. Run 'python ml/disease/train.py' or 'python ml/yield/train.py'."
    else:
        health = "Awaiting Training (No Models Loaded)"
        instructions = "Run 'python bootstrap_models.py' to generate sample datasets and train both models."

    return {
        "disease_model_loaded": d_ready,
        "disease_model_version": d_info.get("version", "1.0.0"),
        "disease_architecture": d_info.get("architecture", "MobileNetV2"),
        "disease_best_val_acc": d_info.get("best_val_acc"),
        "disease_classes_count": d_info.get("num_classes", 10),
        "yield_model_loaded": y_ready,
        "yield_champion_model": y_info.get("champion_model", "None"),
        "yield_model_r2_score": y_info.get("r2_score"),
        "yield_model_mae": y_info.get("mae"),
        "yield_training_date": y_info.get("training_date"),
        "system_health": health,
        "instructions": instructions
    }
