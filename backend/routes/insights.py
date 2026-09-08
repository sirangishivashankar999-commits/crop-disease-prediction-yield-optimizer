from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import FarmSetting
from backend.schemas.common_schema import FarmInsightsResponse
from backend.services.insights_service import get_farm_insights

router = APIRouter(prefix="/farm", tags=["Farm Insights & Analytics"])


@router.get("/insights", response_model=FarmInsightsResponse, summary="Get comprehensive farm analytics")
def get_insights_endpoint(
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    location: Optional[str] = Query(None, description="Filter by farm location"),
    season: Optional[str] = Query(None, description="Filter by season"),
    db: Session = Depends(get_db)
):
    """Returns analytics on historical yield, predicted yield, disease alerts, crop distribution, and soil moisture."""
    return get_farm_insights(
        crop_filter=crop,
        location_filter=location,
        season_filter=season,
        db=db
    )


@router.get("/profile", summary="Retrieve saved farmer profile")
def get_farmer_profile(db: Session = Depends(get_db)):
    """Fetches the saved farmer identity profile from SQLite."""
    profile = db.query(FarmSetting).first()
    if not profile:
        profile = FarmSetting(
            farm_name="Green Valley AgTech Farm",
            owner_name="Pavan Kumar",
            location="Central Valley Agro-Climatic Zone",
            total_acres=120.0,
            primary_crop="Corn",
            preferred_units="metric",
            theme="system"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "id": profile.id,
        "farm_name": profile.farm_name,
        "owner_name": profile.owner_name,
        "location": profile.location,
        "total_acres": profile.total_acres,
        "primary_crop": profile.primary_crop,
        "preferred_units": profile.preferred_units,
        "theme": profile.theme or "system",
        "notifications_enabled": profile.notifications_enabled,
        "updated_at": profile.updated_at.strftime("%Y-%m-%d %H:%M:%S") if profile.updated_at else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }


@router.post("/profile", summary="Save or update farmer profile")
def update_farmer_profile(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """Saves farmer credentials and preferences."""
    profile = db.query(FarmSetting).first()
    if not profile:
        profile = FarmSetting()
        db.add(profile)

    if "farm_name" in payload:
        profile.farm_name = payload["farm_name"]
    if "owner_name" in payload:
        profile.owner_name = payload["owner_name"]
    if "location" in payload:
        profile.location = payload["location"]
    if "total_acres" in payload:
        profile.total_acres = float(payload["total_acres"])
    if "primary_crop" in payload:
        profile.primary_crop = payload["primary_crop"]
    if "preferred_units" in payload:
        profile.preferred_units = payload["preferred_units"]
    if "theme" in payload:
        profile.theme = payload["theme"]
    if "notifications_enabled" in payload:
        profile.notifications_enabled = bool(payload["notifications_enabled"])

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)

    return {
        "status": "success",
        "message": "Farmer profile updated successfully",
        "profile": {
            "farm_name": profile.farm_name,
            "owner_name": profile.owner_name,
            "location": profile.location,
            "total_acres": profile.total_acres,
            "primary_crop": profile.primary_crop,
            "preferred_units": profile.preferred_units,
            "theme": profile.theme,
            "updated_at": profile.updated_at.strftime("%Y-%m-%d %H:%M:%S")
        }
    }
