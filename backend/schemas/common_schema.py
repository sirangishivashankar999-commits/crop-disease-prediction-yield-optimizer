"""
CROPWISE AI - Common Pydantic Schemas
Defines schemas for weather, analytics, recommendations, and model system status.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DailyWeatherForecast(BaseModel):
    day: str
    date: str
    temp_max: float
    temp_min: float
    rainfall_prob: int
    condition: str
    risk_level: str


class WeatherResponse(BaseModel):
    location: str
    temperature: float
    feels_like: float
    humidity: float
    rainfall: float
    wind_speed: float
    wind_direction: str
    solar_radiation: float
    weather_risk: str
    risk_description: str
    condition: str
    forecast_7day: List[DailyWeatherForecast]


class FarmInsightsResponse(BaseModel):
    total_farms: int
    crops_monitored: int
    disease_alerts_active: int
    average_predicted_yield: float
    productivity_score: int
    weather_risk: str
    soil_health_score: int
    irrigation_efficiency: int
    yield_trend: List[Dict[str, Any]]
    crop_distribution: List[Dict[str, Any]]
    disease_distribution: List[Dict[str, Any]]
    soil_moisture_trend: List[Dict[str, Any]]
    active_alerts: List[Dict[str, Any]]


class RecommendationItem(BaseModel):
    id: str
    title: str
    category: str  # Soil, Irrigation, Disease, Nutrient, Weather
    priority: str  # Critical, Warning, Advisory
    description: str
    action_steps: List[str]
    trigger: str


class ModelStatusResponse(BaseModel):
    disease_model_loaded: bool
    disease_model_version: str
    disease_architecture: str
    disease_best_val_acc: Optional[float] = None
    disease_classes_count: int
    yield_model_loaded: bool
    yield_champion_model: str
    yield_model_r2_score: Optional[float] = None
    yield_model_mae: Optional[float] = None
    yield_training_date: Optional[str] = None
    system_health: str
    instructions: str
