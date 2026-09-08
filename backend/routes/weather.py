"""
CROPWISE AI - Agricultural Weather API Endpoint
Provides modular weather metrics, agro-climatic indices, and 7-day forecast.
"""

from fastapi import APIRouter, Query
from backend.schemas.common_schema import WeatherResponse
from backend.services.weather_service import get_current_weather

router = APIRouter(prefix="/weather", tags=["Agro-Weather"])


@router.get("", response_model=WeatherResponse, summary="Get current agricultural weather and 7-day forecast")
def get_weather_endpoint(
    location: str = Query("Central Valley Farm", description="Farm location name")
):
    """Returns real-time temperature, humidity, rainfall, wind, weather risk, and 7-day forecast."""
    data = get_current_weather(location=location)
    return data
