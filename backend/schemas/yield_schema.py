"""
CROPWISE AI - Pydantic Schemas for Crop Yield Prediction & Optimization
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class YieldPredictionRequest(BaseModel):
    crop: str = Field("Rice", description="Target cultivated crop")
    area: float = Field(5.0, ge=0.1, le=10000.0, description="Farm area in acres")
    location: str = Field("Central Valley", description="Agro-ecological region")
    soil_type: str = Field("Loamy", description="Soil texture type")
    growing_season: str = Field("Kharif", description="Crop growing season")
    ph: float = Field(6.5, ge=3.5, le=10.0, description="Soil pH reading")
    temperature: float = Field(27.0, ge=-5.0, le=55.0, description="Mean temperature in Celsius")
    rainfall: float = Field(1200.0, ge=0.0, le=5000.0, description="Precipitation in mm")
    humidity: float = Field(75.0, ge=5.0, le=100.0, description="Relative humidity percentage")
    irrigation: float = Field(500.0, ge=0.0, le=3000.0, description="Irrigation amount applied in mm")
    fertilizer: float = Field(120.0, ge=0.0, le=1000.0, description="Fertilizer dosage in kg/acre")
    previous_yield: float = Field(4.2, ge=0.1, le=100.0, description="Historical yield in tons/acre")
    n_content: Optional[float] = Field(90.0, ge=0.0, le=500.0, description="Available Nitrogen (kg/ha)")
    p_content: Optional[float] = Field(45.0, ge=0.0, le=300.0, description="Available Phosphorus (kg/ha)")
    k_content: Optional[float] = Field(50.0, ge=0.0, le=500.0, description="Available Potassium (kg/ha)")


class FactorImportance(BaseModel):
    factor: str
    display_name: str
    importance_pct: float
    current_value: str


class OptimizationRecommendation(BaseModel):
    category: str
    priority: str
    title: str
    advice: str


class YieldPredictionResponse(BaseModel):
    crop: str
    area_acres: float
    predicted_yield_per_acre: float
    unit: str = "tons/acre"
    total_estimated_production: float
    total_unit: str = "tons"
    previous_yield: float
    productivity_score: int
    risk_level: str
    champion_model: str
    model_r2_score: float
    top_influencing_factors: List[FactorImportance]
    feature_importance_breakdown: Dict[str, float]
    recommendations: List[OptimizationRecommendation]
    is_real_ml: bool = True
    error: Optional[str] = None
