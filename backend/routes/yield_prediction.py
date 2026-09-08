"""
CROPWISE AI - Crop Yield Prediction API Endpoints
Accepts farm agronomic parameters and returns supervised regression predictions,
explainability metrics, and optimization advice.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas.yield_schema import (
    YieldPredictionRequest,
    YieldPredictionResponse,
)
from backend.models.db_models import YieldPredictionLog
from backend.services.yield_service import (
    execute_yield_prediction,
    is_yield_model_ready,
    get_yield_model_info,
)

router = APIRouter(prefix="/yield", tags=["Crop Yield Optimization"])


@router.post(
    "/predict",
    response_model=YieldPredictionResponse,
    summary="Predict crop yield and obtain optimization advice"
)
def predict_yield_endpoint(
    request_data: YieldPredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Accepts agronomic field inputs, runs champion regression model,
    and returns predicted yield, total expected production, productivity score,
    risk level, top influencing factors, and dynamic recommendations.
    """
    if not is_yield_model_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "ML model unavailable: The Crop Yield champion model has not been trained yet. "
                "Please run 'python ml/yield/train.py' or 'python bootstrap_models.py' to fit and save the pipeline."
            )
        )

    try:
        payload = request_data.model_dump()
        result = execute_yield_prediction(payload=payload, db=db)
        return result
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(fnf))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Yield prediction failed: {str(e)}"
        )


@router.get("/models-comparison", summary="Get multi-model tournament benchmark results")
def get_model_tournament_results():
    """Returns MAE, RMSE, and R2 metrics comparing Linear Regression, Random Forest, and Gradient Boosting."""
    info = get_yield_model_info()
    return info


@router.get("/history", summary="Get recent crop yield predictions")
def get_yield_history(limit: int = 15, db: Session = Depends(get_db)):
    """Fetches recent crop yield optimization predictions from SQLite."""
    records = (
        db.query(YieldPredictionLog)
        .order_by(YieldPredictionLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "crop": r.crop,
            "area": r.area,
            "location": r.location,
            "soil_type": r.soil_type,
            "predicted_yield": r.predicted_yield,
            "total_production": r.total_production,
            "productivity_score": r.productivity_score,
            "risk_level": r.risk_level,
            "champion_model": r.champion_model,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "N/A"
        }
        for r in records
    ]

