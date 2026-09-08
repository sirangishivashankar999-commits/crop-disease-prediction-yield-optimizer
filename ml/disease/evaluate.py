"""
CROPWISE AI - Crop Disease Model Evaluation
Evaluates the trained MobileNetV2 model on the test partition, computing
Accuracy, Precision, Recall, F1-score, and Confusion Matrix.
"""

import os
import sys
import json
import torch
import numpy as np
from torch.utils.data import DataLoader
from torchvision import datasets
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
for path in [PROJECT_ROOT, CURRENT_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

from preprocess import get_eval_transforms
from train import build_disease_model, DEVICE, MODEL_DIR, DATASET_DIR

def evaluate_disease_model(
    test_dir: str = os.path.join(DATASET_DIR, "test"),
    model_path: str = os.path.join(MODEL_DIR, "crop_disease_model.pt")
) -> dict:
    """Evaluates test set performance and outputs detailed metrics."""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model checkpoint not found at: {model_path}. Please train the model first.")

    if not os.path.exists(test_dir) or len(os.listdir(test_dir)) == 0:
        raise FileNotFoundError(f"Test dataset partition not found at: {test_dir}")

    checkpoint = torch.load(model_path, map_location=DEVICE)
    classes = checkpoint["classes"]
    num_classes = len(classes)

    model = build_disease_model(num_classes, pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    test_data = datasets.ImageFolder(test_dir, transform=get_eval_transforms())
    test_loader = DataLoader(test_data, batch_size=8, shuffle=False)

    y_true = []
    y_pred = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(DEVICE)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            y_true.extend(labels.cpu().numpy())
            y_pred.extend(preds.cpu().numpy())

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    acc = accuracy_score(y_true, y_pred)
    report_dict = classification_report(
        y_true,
        y_pred,
        target_names=[classes[i] for i in sorted(list(set(y_true) | set(y_pred)))],
        output_dict=True,
        zero_division=0
    )
    conf_mat = confusion_matrix(y_true, y_pred).tolist()

    print("\n" + "=" * 65)
    print("CROPWISE AI - CROP DISEASE MODEL EVALUATION REPORT")
    print("=" * 65)
    print(f"Overall Test Accuracy: {acc * 100:.2f}%")
    print("-" * 65)
    print(f"{'Class':<30} {'Precision':<10} {'Recall':<10} {'F1-Score':<10}")
    print("-" * 65)
    for class_name, metrics in report_dict.items():
        if isinstance(metrics, dict):
            print(
                f"{class_name:<30} "
                f"{metrics['precision']:<10.3f} "
                f"{metrics['recall']:<10.3f} "
                f"{metrics['f1-score']:<10.3f}"
            )
    print("=" * 65)

    eval_results = {
        "accuracy": round(float(acc) * 100, 2),
        "classification_report": report_dict,
        "confusion_matrix": conf_mat,
        "classes_evaluated": classes,
        "total_test_samples": len(y_true)
    }

    eval_out_path = os.path.join(MODEL_DIR, "evaluation_metrics.json")
    with open(eval_out_path, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)

    print(f"[Results Saved] Evaluation report saved to: {eval_out_path}")
    return eval_results

if __name__ == "__main__":
    evaluate_disease_model()
