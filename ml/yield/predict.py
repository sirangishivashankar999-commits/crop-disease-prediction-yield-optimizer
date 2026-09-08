"""
CROPWISE AI - Crop Yield Inference & Optimization Engine
Loads the champion trained regression pipeline, calculates predicted yield,
total production, productivity score, risk level, feature importance explainability,
and generates actionable agronomic optimization recommendations.
"""

import os
import sys
import json
from typing import Dict, Any, List
import joblib
import pandas as pd
import numpy as np

import importlib.util

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(CURRENT_DIR, "model")

# Load local preprocess module directly by path
spec = importlib.util.spec_from_file_location("yield_preprocess", os.path.join(CURRENT_DIR, "preprocess.py"))
yield_preprocess = importlib.util.module_from_spec(spec)
spec.loader.exec_module(yield_preprocess)
prepare_input_dataframe = yield_preprocess.prepare_input_dataframe

_CACHED_YIELD_BUNDLE = None


def load_yield_model(bundle_path: str = None) -> dict:
    """Loads and caches the champion model bundle."""
    global _CACHED_YIELD_BUNDLE
    if _CACHED_YIELD_BUNDLE is not None:
        return _CACHED_YIELD_BUNDLE

    if bundle_path is None:
        bundle_path = os.path.join(MODEL_DIR, "yield_best_model.joblib")

    if not os.path.exists(bundle_path):
        raise FileNotFoundError(
            f"Trained yield model bundle not found at '{bundle_path}'. "
            "Please run 'python ml/yield/train.py' to train and persist the champion model."
        )

    bundle = joblib.load(bundle_path)
    _CACHED_YIELD_BUNDLE = bundle
    return _CACHED_YIELD_BUNDLE


def generate_optimization_recommendations(
    inputs: Dict[str, Any],
    pred_yield: float,
    prev_yield: float,
    crop: str
) -> List[Dict[str, str]]:
    """
    Generates dynamic agronomic optimization recommendations based on input thresholds and ML predictions.
    """
    recs = []
    ph = float(inputs.get("ph", 6.5))
    rainfall = float(inputs.get("rainfall", 800))
    irrigation = float(inputs.get("irrigation", 400))
    fertilizer = float(inputs.get("fertilizer", 120))
    temp = float(inputs.get("temperature", 25))
    total_water = rainfall + irrigation

    # 1. Soil pH Optimization
    if ph < 6.0:
        recs.append({
            "category": "Soil Chemistry",
            "priority": "High",
            "title": "Soil Acidification Remediation",
            "advice": f"Current pH of {ph:.1f} is acidic for {crop}. Apply agricultural lime (calcium carbonate) or dolomitic limestone at 1.5 - 2.0 tons/acre to raise pH toward optimal 6.2 - 6.8 range."
        })
    elif ph > 7.5:
        recs.append({
            "category": "Soil Chemistry",
            "priority": "Medium",
            "title": "Alkaline Soil Management",
            "advice": f"Current pH of {ph:.1f} restricts micronutrient availability (Zinc, Iron). Apply elemental sulfur or gypsum to gradually buffer soil alkalinity."
        })

    # 2. Water Management
    if total_water < 750:
        recs.append({
            "category": "Irrigation",
            "priority": "Critical" if total_water < 550 else "High",
            "title": "Severe Deficit Irrigation Alert",
            "advice": f"Combined water supply ({total_water:.0f} mm) is below {crop}'s evapotranspiration baseline. Increase irrigation schedule by 25-35% during critical vegetative and flowering stages."
        })
    elif total_water > 1800:
        recs.append({
            "category": "Irrigation",
            "priority": "High",
            "title": "Waterlogging Risk Alert",
            "advice": f"Total moisture ({total_water:.0f} mm) exceeds optimal drainage threshold. Inspect field drainage tiles and reduce supplemental furrow irrigation to avoid root hypoxia."
        })
    else:
        recs.append({
            "category": "Irrigation",
            "priority": "Low",
            "title": "Optimal Moisture Balance",
            "advice": f"Total moisture ({total_water:.0f} mm) satisfies {crop} growth requirements. Maintain soil moisture tension between 25-35 kPa."
        })

    # 3. Nutrient / Fertilizer Optimization
    if fertilizer < 80:
        recs.append({
            "category": "Nutrient Management",
            "priority": "Medium",
            "title": "Fertilizer Top-Dressing Needed",
            "advice": f"Dosage of {fertilizer:.0f} kg/acre may cap yield potential. Conduct soil leaf-tissue testing and apply split nitrogen/potassium top-dressings."
        })
    elif fertilizer > 220:
        recs.append({
            "category": "Nutrient Management",
            "priority": "Medium",
            "title": "Fertilizer Over-Application Warning",
            "advice": f"Fertilizer rate of {fertilizer:.0f} kg/acre risks diminishing marginal returns and leaching. Consider variable rate application (VRA) based on electrical conductivity mapping."
        })

    # 4. Temperature / Climate Stress
    if temp > 33:
        recs.append({
            "category": "Climate Protection",
            "priority": "High",
            "title": "Thermal Stress Mitigation",
            "advice": f"High ambient temperatures ({temp:.1f}°C) accelerate blossom drop. Schedule light sprinkler cooling or apply kaolin clay foliar sprays to reduce leaf canopy temperature."
        })

    # 5. Yield Comparison Insight
    diff = pred_yield - prev_yield
    if diff > 0.3:
        recs.append({
            "category": "Yield Potential",
            "priority": "Low",
            "title": "Positive Growth Trajectory",
            "advice": f"Predicted yield ({pred_yield:.2f} tons/acre) represents a +{(diff/max(0.1, prev_yield))*100:.1f}% increase over previous season ({prev_yield:.2f} tons/acre). Preserve current soil management regimen."
        })
    elif diff < -0.3:
        recs.append({
            "category": "Yield Risk",
            "priority": "High",
            "title": "Yield Decline Warning",
            "advice": f"Model projects a -{(abs(diff)/max(0.1, prev_yield))*100:.1f}% yield deficit compared to historical baseline ({prev_yield:.2f} tons/acre). Review drainage, pest scouting logs, and soil salinity."
        })

    return recs


def predict_crop_yield(
    input_data: Dict[str, Any],
    bundle_path: str = None
) -> Dict[str, Any]:
    """
    Executes end-to-end yield prediction:
    1. Prepares input feature frame
    2. Runs inference through trained champion pipeline
    3. Calculates production aggregates (yield/acre, total production)
    4. Computes productivity score & risk level
    5. Formulates feature importance explainability and optimization actions
    """
    bundle = load_yield_model(bundle_path)
    pipeline = bundle["pipeline"]
    champion_name = bundle["champion_name"]
    feature_importance = bundle.get("feature_importance", {})

    df = prepare_input_dataframe(input_data)
    raw_pred = float(pipeline.predict(df)[0])
    pred_yield_per_acre = round(max(0.1, raw_pred), 2)

    area = float(df["area"].iloc[0])
    total_production = round(pred_yield_per_acre * area, 2)
    prev_yield = float(df["previous_yield"].iloc[0])
    crop = str(df["crop"].iloc[0])

    # Productivity Score (0 - 100) based on ratio to previous yield & agronomic baseline
    ratio = pred_yield_per_acre / max(0.1, prev_yield)
    score = int(np.clip(ratio * 75.0, 10, 99))

    # Risk level assignment
    if score >= 80:
        risk_level = "Low"
    elif score >= 55:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    # Explainability: Top 5 contributing factors
    top_factors = []
    for factor, weight in list(feature_importance.items())[:5]:
        top_factors.append({
            "factor": factor,
            "display_name": factor.replace("_", " ").title(),
            "importance_pct": weight,
            "current_value": str(input_data.get(factor, df[factor].iloc[0] if factor in df else "N/A"))
        })

    # Actionable optimization recommendations
    recommendations = generate_optimization_recommendations(
        input_data, pred_yield_per_acre, prev_yield, crop
    )

    return {
        "crop": crop,
        "area_acres": area,
        "predicted_yield_per_acre": pred_yield_per_acre,
        "unit": "tons/acre",
        "total_estimated_production": total_production,
        "total_unit": "tons",
        "previous_yield": prev_yield,
        "productivity_score": score,
        "risk_level": risk_level,
        "champion_model": champion_name,
        "model_r2_score": bundle["metrics"].get("r2", 0.0),
        "top_influencing_factors": top_factors,
        "feature_importance_breakdown": feature_importance,
        "recommendations": recommendations,
        "is_real_ml": True
    }


if __name__ == "__main__":
    sample_input = {
        "crop": "Rice",
        "area": 5.0,
        "location": "Central Valley",
        "soil_type": "Loamy",
        "growing_season": "Kharif",
        "ph": 6.5,
        "temperature": 27.0,
        "rainfall": 1200.0,
        "humidity": 75.0,
        "irrigation": 500.0,
        "fertilizer": 120.0,
        "previous_yield": 4.2,
        "n_content": 95.0,
        "p_content": 40.0,
        "k_content": 60.0
    }
    print("Testing yield prediction engine...")
    try:
        res = predict_crop_yield(sample_input)
        import pprint
        pprint.pprint(res)
    except Exception as e:
        print(f"Prediction note: {e}")
