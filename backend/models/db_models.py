"""
CROPWISE AI - SQLAlchemy Database Models
Stores logs of disease diagnostics, yield predictions, and farm settings.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from backend.database import Base


class DiseasePredictionLog(Base):
    __tablename__ = "disease_predictions"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=True)
    crop = Column(String(100), default="Crop")
    predicted_disease = Column(String(150), nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False)
    symptoms_json = Column(Text, nullable=True)
    treatment_json = Column(Text, nullable=True)
    prevention_json = Column(Text, nullable=True)
    top_predictions_json = Column(Text, nullable=True)
    is_real_ml = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class YieldPredictionLog(Base):
    __tablename__ = "yield_predictions"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String(100), nullable=False)
    area = Column(Float, nullable=False)
    location = Column(String(100), nullable=False)
    soil_type = Column(String(100), nullable=False)
    ph = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    irrigation = Column(Float, nullable=False)
    fertilizer = Column(Float, nullable=False)
    previous_yield = Column(Float, nullable=False)
    predicted_yield = Column(Float, nullable=False)
    total_production = Column(Float, nullable=False)
    productivity_score = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)
    champion_model = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FarmSetting(Base):
    __tablename__ = "farm_settings"

    id = Column(Integer, primary_key=True, index=True)
    farm_name = Column(String(150), default="Green Valley AgTech Farm")
    owner_name = Column(String(100), default="Pavan Kumar")
    location = Column(String(150), default="Midwest Agro-Climatic Zone")
    total_acres = Column(Float, default=120.0)
    primary_crop = Column(String(100), default="Corn")
    preferred_units = Column(String(20), default="metric")  # metric / imperial
    notifications_enabled = Column(Boolean, default=True)
    theme = Column(String(20), default="light")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
