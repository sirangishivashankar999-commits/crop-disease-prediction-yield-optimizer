"""
CROPWISE AI - Pydantic Schemas for Crop Disease Detection
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TopPrediction(BaseModel):
    class_name: str
    display_name: str
    confidence: float


class DiseasePredictionResponse(BaseModel):
    disease: str = Field(..., description="Name of the detected crop disease or condition")
    raw_class: str
    crop: str
    confidence: float = Field(..., description="Model prediction confidence percentage (0-100)")
    severity: str = Field(..., description="Severity level: None, Low, Moderate, High")
    symptoms: List[str] = Field(default_factory=list)
    treatment: List[str] = Field(default_factory=list)
    prevention: List[str] = Field(default_factory=list)
    top_predictions: List[TopPrediction] = Field(default_factory=list)
    model_status: str
    is_real_ml: bool = True
    is_low_confidence: bool = False
    confidence_warning: Optional[str] = None
    supported_crops: List[str] = Field(default_factory=list)
    error: Optional[str] = None


class DiseaseClassItem(BaseModel):
    id: str
    name: str
    crop: str
    severity: str
