"""
CROPWISE AI - Crop Yield Model Evaluation
Loads trained candidate model bundles and outputs validation and testing benchmark summaries.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
for path in [PROJECT_ROOT, CURRENT_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

from train import MODEL_DIR

def evaluate_yield_models() -> dict:
    """Reads saved metadata and displays comprehensive tournament comparison."""
    meta_path = os.path.join(MODEL_DIR, "yield_metadata.json")
    bundle_path = os.path.join(MODEL_DIR, "yield_best_model.joblib")

    if not os.path.exists(meta_path) or not os.path.exists(bundle_path):
        raise FileNotFoundError(
            f"Trained model artifacts not found at '{MODEL_DIR}'. "
            "Run 'python ml/yield/train.py' first."
        )

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    print("\n" + "=" * 70)
    print("CROPWISE AI - YIELD MODEL BENCHMARK & EXPLAINABILITY REPORT")
    print("=" * 70)
    print(f"Champion Model : {meta['champion_model']}")
    print(f"Trained At     : {meta['trained_at']}")
    print(f"Dataset Size   : {meta['dataset_samples']} rows")
    print("-" * 70)
    print(f"{'Model':<32} {'MAE (tons)':<12} {'RMSE (tons)':<12} {'R² Score':<10}")
    print("-" * 70)

    for m_name, score in meta["comparison"].items():
        is_champ = " * [Best]" if m_name == meta["champion_model"] else ""
        print(f"{m_name + is_champ:<32} {score['mae']:<12.4f} {score['rmse']:<12.4f} {score['r2']:<10.4f}")

    print("\nTop Contributing Agronomic Factors (Feature Importance):")
    print("-" * 50)
    for factor, weight in list(meta.get("feature_importance", {}).items())[:7]:
        bar = "=" * int(weight / 2)
        print(f"{factor.replace('_', ' ').capitalize():<20} {weight:5.2f}% {bar}")
    print("=" * 70 + "\n")

    return meta

if __name__ == "__main__":
    evaluate_yield_models()
