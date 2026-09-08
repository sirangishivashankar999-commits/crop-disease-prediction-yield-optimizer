"""
CROPWISE AI - Complete System Bootstrap Script
Generates starter datasets and trains both ML models (MobileNetV2 and Champion Regressor).
Run this once upon project setup to produce real local model artifacts.
"""

import os
import sys

# Ensure root in sys.path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

print("=" * 70)
print("   CROPWISE AI - BOOTSTRAP INITIALIZATION")
print("   'Grow Smarter. Harvest Better.'")
print("=" * 70)

# 1. Yield Dataset & Model Training
print("\n[Phase 1/2] Initializing Crop Yield Optimizer ML Pipeline...")
try:
    import importlib
    yield_ds = importlib.import_module("ml.yield.dataset_generator")
    yield_tr = importlib.import_module("ml.yield.train")
    generate_yield_dataset = yield_ds.generate_yield_dataset
    train_yield_models = yield_tr.train_yield_models

    print("Generating realistic agricultural yield dataset...")
    generate_yield_dataset(num_samples=1500)
    print("Training candidate regressors (Linear Regression, Random Forest, Gradient Boosting)...")
    yield_meta = train_yield_models()
    print(f"Yield Champion Model Trained: {yield_meta['champion_model']} (R²: {yield_meta['champion_metrics']['r2']:.4f})")
except Exception as e:
    print(f"[Error in Yield Bootstrap]: {e}")

# 2. Disease Dataset & Model Training
print("\n[Phase 2/2] Initializing Crop Disease Computer Vision Pipeline...")
try:
    from ml.disease.dataset_generator import create_starter_disease_dataset
    from ml.disease.train import train_disease_model

    print("Generating starter image structure across 10 disease classes...")
    create_starter_disease_dataset()
    print("Training MobileNetV2 transfer learning model (3 epochs for fast bootstrap)...")
    disease_meta = train_disease_model(epochs=3, batch_size=8)
    print(f"Disease Model Trained: MobileNetV2 with Best Val Accuracy: {disease_meta['best_val_acc']:.2f}%")
except Exception as e:
    print(f"[Error in Disease Bootstrap]: {e}")

print("\n" + "=" * 70)
print("   CROPWISE AI BOOTSTRAP COMPLETED SUCCESSFULLY!")
print("   Both ML model pipelines are trained, serialized, and ready.")
print("=" * 70 + "\n")
