"""
CROPWISE AI - Contextual Agricultural Recommendation Engine
Generates dynamic agronomic advisories based on recent ML predictions, soil conditions, and agro-climatic states.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models.db_models import DiseasePredictionLog, YieldPredictionLog


def generate_farm_recommendations(
    crop: Optional[str] = None,
    soil_moisture: Optional[float] = 31.0,
    soil_ph: Optional[float] = 6.4,
    recent_disease: Optional[str] = None,
    predicted_yield: Optional[float] = None,
    db: Optional[Session] = None
) -> List[Dict[str, Any]]:
    """
    Synthesizes active conditions, recent database diagnostics, and agronomic thresholds
    into prioritized, actionable farming directives.
    """
    recommendations: List[Dict[str, Any]] = []

    # 1. Fetch latest disease diagnostic if not passed directly
    if not recent_disease and db is not None:
        try:
            latest_disease_log = db.query(DiseasePredictionLog).order_by(DiseasePredictionLog.created_at.desc()).first()
            if latest_disease_log and latest_disease_log.severity in ["Moderate", "High"]:
                recent_disease = latest_disease_log.predicted_disease
        except Exception:
            pass

    # 2. Disease Management Advisory
    if recent_disease and "Healthy" not in recent_disease:
        recommendations.append({
            "id": "REC-DISEASE-01",
            "title": f"Foliar Disease Containment Protocol: {recent_disease}",
            "category": "Disease Management",
            "priority": "Critical",
            "description": f"Recent computer vision diagnostic identified {recent_disease}. High risk of spore dispersal to adjacent blocks within 50 meters.",
            "action_steps": [
                "Physically inspect neighboring border plants within a 15-meter radius.",
                "Prune and discard infected leaves in biohazard bags; do not mulch or compost.",
                "Calibrate sprayer pressure and apply targeted contact protectant (copper/chlorothalonil).",
                "Sanitize pruning equipment with alcohol solution before moving to uninfected sectors."
            ],
            "trigger": f"Computer Vision classification flagged '{recent_disease}'"
        })

    # 3. Soil Moisture & Irrigation Advisory
    if soil_moisture is not None:
        if soil_moisture < 28.0:
            recommendations.append({
                "id": "REC-IRRIG-01",
                "title": "Immediate Deficit Irrigation Initiation",
                "category": "Irrigation",
                "priority": "Critical",
                "description": f"Root-zone soil moisture is currently at {soil_moisture:.1f}%, which is below the permanent wilting point threshold.",
                "action_steps": [
                    "Initiate pressurized drip fertigation cycle for 90 minutes immediately.",
                    "Check drip emitters for sediment clogging or pressure drop.",
                    "Monitor tensiometer readings 3 hours post-irrigation to ensure recharge above 32%."
                ],
                "trigger": f"Soil moisture reading ({soil_moisture:.1f}%) < 28% threshold"
            })
        elif soil_moisture > 42.0:
            recommendations.append({
                "id": "REC-IRRIG-02",
                "title": "Waterlogging Risk & Drainage Discharge",
                "category": "Irrigation",
                "priority": "Warning",
                "description": f"Soil moisture is at {soil_moisture:.1f}%, indicating saturated pores that threaten anaerobic root hypoxia.",
                "action_steps": [
                    "Suspend all scheduled irrigation pump runs for the next 48 hours.",
                    "Open surface drainage gates to relieve standing water in low-lying quadrants.",
                    "Inspect roots for signs of Pythium or Phytophthora root rot."
                ],
                "trigger": f"Soil moisture reading ({soil_moisture:.1f}%) > 42% upper threshold"
            })
        else:
            recommendations.append({
                "id": "REC-IRRIG-03",
                "title": "Optimal Soil Moisture Maintenance",
                "category": "Irrigation",
                "priority": "Advisory",
                "description": f"Soil moisture ({soil_moisture:.1f}%) is in the optimal agronomic comfort zone (28% - 40%).",
                "action_steps": [
                    "Maintain current pulsed drip irrigation schedule.",
                    "Verify soil moisture probes every 72 hours."
                ],
                "trigger": "Soil moisture within normal range"
            })

    # 4. Soil pH Advisory
    if soil_ph is not None:
        if soil_ph < 6.0:
            recommendations.append({
                "id": "REC-SOIL-01",
                "title": "Soil Acidification Remediation via Liming",
                "category": "Soil Health",
                "priority": "Warning",
                "description": f"Soil pH of {soil_ph:.2f} locks up available Phosphorus and stimulates Aluminum/Manganese toxicity.",
                "action_steps": [
                    "Broadcast agricultural calcitic or dolomitic limestone at 1.5 tons/acre.",
                    "Incorporate into top 15 cm of soil prior to next tillage or irrigation event.",
                    "Retest pH 4 weeks post-application."
                ],
                "trigger": f"Soil pH ({soil_ph:.2f}) < 6.0"
            })
        elif soil_ph > 7.6:
            recommendations.append({
                "id": "REC-SOIL-02",
                "title": "Alkaline Soil Salinity & Micronutrient Correction",
                "category": "Soil Health",
                "priority": "Warning",
                "description": f"Soil pH of {soil_ph:.2f} inhibits Zinc, Iron, and Manganese uptake, causing interveinal leaf chlorosis.",
                "action_steps": [
                    "Apply elemental sulfur or iron sulfate at 250 kg/acre.",
                    "Provide foliar chelated iron (Fe-EDDHA) and zinc sprays to bypassed root lock.",
                    "Ensure irrigation water EC is below 1.2 dS/m."
                ],
                "trigger": f"Soil pH ({soil_ph:.2f}) > 7.6"
            })

    # 5. Yield Optimizer Advisory
    if predicted_yield is not None:
        if predicted_yield < 3.5:
            recommendations.append({
                "id": "REC-YIELD-01",
                "title": "Low Yield Projection Intervention",
                "category": "Yield Optimization",
                "priority": "Critical",
                "description": f"Predicted yield ({predicted_yield:.2f} tons/acre) is below regional commercial profitability targets.",
                "action_steps": [
                    "Audit nitrogen-phosphorus-potassium balance and split application timing.",
                    "Verify that soil compaction layer is not restricting rooting depth beyond 20 cm.",
                    "Evaluate weed competition density; apply selective post-emergence herbicide if needed."
                ],
                "trigger": f"ML predicted yield ({predicted_yield:.2f} tons/acre) underperforming baseline"
            })

    # 6. Seasonal General Practice
    recommendations.append({
        "id": "REC-GEN-01",
        "title": "Pre-Flowering Nutrient Top-Dressing",
        "category": "Nutrient Management",
        "priority": "Advisory",
        "description": "Crops entering critical vegetative-to-reproductive transition stage require elevated potassium (K) and boron (B).",
        "action_steps": [
            "Apply foliar potassium nitrate (KNO3) at 2% concentration early morning.",
            "Supplement with 100g/acre Solubor to ensure pollen tube viability."
        ],
        "trigger": "Seasonal physiological development stage"
    })

    return recommendations
