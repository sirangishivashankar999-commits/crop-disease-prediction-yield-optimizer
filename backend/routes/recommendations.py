"""
CROPWISE AI - Agricultural Recommendations API Endpoint
Provides dynamic advisories generated from ML outputs, soil metrics, and weather conditions.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas.common_schema import RecommendationItem
from backend.services.recommendations_service import generate_farm_recommendations

router = APIRouter(prefix="/recommendations", tags=["Agronomic Recommendations"])


@router.get("", response_model=List[RecommendationItem], summary="Get dynamic farming recommendations")
def get_recommendations_endpoint(
    crop: Optional[str] = Query(None, description="Current cultivated crop"),
    soil_moisture: Optional[float] = Query(31.0, description="Current soil moisture %"),
    soil_ph: Optional[float] = Query(6.5, description="Current soil pH"),
    db: Session = Depends(get_db)
):
    """Generates context-aware agronomic action items based on field readings and ML diagnostic states."""
    recs = generate_farm_recommendations(
        crop=crop,
        soil_moisture=soil_moisture,
        soil_ph=soil_ph,
        db=db
    )
    return recs
