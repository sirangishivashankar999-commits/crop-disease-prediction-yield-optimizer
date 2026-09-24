"""
CROPWISE AI - Training Pipeline for Stage 3 Crop Species Classifier
Trains MobileNetV2 across: Tomato, Potato, Corn, Rice, and mandatory UNKNOWN class.
Includes open-set rejection evaluation and confusion matrix serialization.
"""

import os
import sys
import json
import time
from typing import Dict, Any
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import confusion_matrix, classification_report

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(CURRENT_DIR, "model")
DATASET_DIR = os.path.join(CURRENT_DIR, "crop_identification") if os.path.exists(os.path.join(CURRENT_DIR, "crop_identification", "train")) else os.path.join(CURRENT_DIR, "dataset_crop")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

from models_arch import build_crop_classifier_model
from dataset_builder import build_all_datasets
from config import CROP_CLASSES

# Transforms
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]

train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.15, contrast=0.15),
    transforms.ToTensor(),
    transforms.Normalize(NORM_MEAN, NORM_STD),
])

eval_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(NORM_MEAN, NORM_STD),
])


def train_crop_classifier(epochs: int = 5, batch_size: int = 16, lr: float = 0.0003) -> Dict[str, Any]:
    """Trains and serializes the 5-class Crop Species Classifier with UNKNOWN class."""
    train_dir = os.path.join(DATASET_DIR, "train")
    val_dir = os.path.join(DATASET_DIR, "validation") if os.path.exists(os.path.join(DATASET_DIR, "validation")) else os.path.join(DATASET_DIR, "val")

    if not os.path.exists(train_dir) or len(os.listdir(train_dir)) == 0:
        print("[Info] Crop dataset not found. Building datasets...")
        build_all_datasets()

    print("=" * 70)
    print("   TRAINING STAGE 3: CROP SPECIES CLASSIFIER (WITH UNKNOWN CLASS)")
    print(f"   Compute Device: {DEVICE}")
    print("=" * 70)

    train_data = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_data = datasets.ImageFolder(val_dir, transform=eval_transforms)

    class_names = train_data.classes
    num_classes = len(class_names)
    print(f"[Crop Classifier] Target classes ({num_classes}): {class_names}")

    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False, num_workers=0)

    model = build_crop_classifier_model(num_classes=num_classes, pretrained=True).to(DEVICE)
    for p in model.features.parameters():
        p.requires_grad = True

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=lr)

    best_val_acc = 0.0
    best_val_loss = float("inf")
    best_state = None
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        epoch_train_loss = running_loss / total
        epoch_train_acc = (correct / total) * 100.0

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        all_preds = []
        all_labels = []

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)

                all_preds.extend(preds.cpu().tolist())
                all_labels.extend(labels.cpu().tolist())

        epoch_val_loss = val_loss / val_total
        epoch_val_acc = (val_correct / val_total) * 100.0

        print(f"Epoch [{epoch}/{epochs}] "
              f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc:.1f}% | "
              f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc:.1f}%")

        if epoch_val_acc > best_val_acc or (epoch_val_acc == best_val_acc and epoch_val_loss <= best_val_loss):
            best_val_acc = epoch_val_acc
            best_val_loss = epoch_val_loss
            best_state = {k: v.clone() for k, v in model.state_dict().items()}

    duration = time.time() - start_time
    print(f"\n[Crop Classifier] Training completed in {duration:.1f}s. Best Val Accuracy: {best_val_acc:.1f}%")

    # Compute Multi-class Confusion Matrix
    cm = confusion_matrix(all_labels, all_preds)
    print("\n[Crop Classifier Multi-Class Confusion Matrix]:")
    header = "          " + "".join([f"{c[:7]:>8s}" for c in class_names])
    print(header)
    for i, row in enumerate(cm):
        row_str = f"{class_names[i][:7]:<9s} " + "".join([f"{val:>8d}" for val in row])
        print(row_str)

    # Dedicated Rice vs. Corn Discrimination Evaluation
    rice_idx = class_names.index("Rice") if "Rice" in class_names else -1
    corn_idx = class_names.index("Corn") if "Corn" in class_names else -1

    if rice_idx != -1 and corn_idx != -1:
        val_rice_as_rice = int(cm[rice_idx, rice_idx])
        val_rice_as_corn = int(cm[rice_idx, corn_idx])
        val_corn_as_corn = int(cm[corn_idx, corn_idx])
        val_corn_as_rice = int(cm[corn_idx, rice_idx])

        print("\n" + "=" * 70)
        print("   DEDICATED RICE VS. CORN DISCRIMINATION REPORT (VALIDATION SET)")
        print("=" * 70)
        print(f"   Rice predicted as Rice : {val_rice_as_rice:>4d}")
        print(f"   Rice predicted as Corn : {val_rice_as_corn:>4d}")
        print(f"   Corn predicted as Corn : {val_corn_as_corn:>4d}")
        print(f"   Corn predicted as Rice : {val_corn_as_rice:>4d}")
        print("=" * 70)

    # Dedicated Test Set Evaluation (rice_corn_test/ with 50 Rice + 50 Corn samples)
    rc_test_dir = os.path.join(DATASET_DIR, "rice_corn_test")
    rc_metrics = {}
    if os.path.exists(rc_test_dir):
        print("\n[Dedicated Test Set] Evaluating Rice vs. Corn test suite (100 samples)...")
        eval_model = build_crop_classifier_model(num_classes=num_classes, pretrained=False).to(DEVICE)
        eval_model.load_state_dict(best_state)
        eval_model.eval()

        rc_data = datasets.ImageFolder(rc_test_dir, transform=eval_transforms)
        rc_loader = DataLoader(rc_data, batch_size=8, shuffle=False, num_workers=0)
        rc_preds, rc_targets = [], []

        with torch.no_grad():
            for imgs, lbls in rc_loader:
                imgs = imgs.to(DEVICE)
                outs = eval_model(imgs)
                _, p = torch.max(outs, 1)
                rc_preds.extend([class_names[idx] for idx in p.cpu().tolist()])
                rc_targets.extend([rc_data.classes[idx] for idx in lbls.tolist()])

        rc_rice_as_rice = sum(1 for p, t in zip(rc_preds, rc_targets) if t == "Rice" and p == "Rice")
        rc_rice_as_corn = sum(1 for p, t in zip(rc_preds, rc_targets) if t == "Rice" and p == "Corn")
        rc_corn_as_corn = sum(1 for p, t in zip(rc_preds, rc_targets) if t == "Corn" and p == "Corn")
        rc_corn_as_rice = sum(1 for p, t in zip(rc_preds, rc_targets) if t == "Corn" and p == "Rice")

        print("=" * 70)
        print("   DEDICATED RICE VS. CORN TEST SUITE CONFUSION MATRIX (100 SAMPLES)")
        print("=" * 70)
        print(f"   Rice predicted as Rice : {rc_rice_as_rice:>4d} / 50")
        print(f"   Rice predicted as Corn : {rc_rice_as_corn:>4d} / 50")
        print(f"   Corn predicted as Corn : {rc_corn_as_corn:>4d} / 50")
        print(f"   Corn predicted as Rice : {rc_corn_as_rice:>4d} / 50")
        print("=" * 70)

        rc_metrics = {
            "rice_as_rice": rc_rice_as_rice,
            "rice_as_corn": rc_rice_as_corn,
            "corn_as_corn": rc_corn_as_corn,
            "corn_as_rice": rc_corn_as_rice,
        }

    # Serialize Model & Metadata
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_save_path = os.path.join(MODEL_DIR, "crop_classifier_model.pt")
    torch.save({
        "model_state_dict": best_state,
        "classes": class_names,
        "best_val_acc": best_val_acc,
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }, model_save_path)
    print(f"[Crop Classifier] Checkpoint saved to: {model_save_path}")

    meta_path = os.path.join(MODEL_DIR, "crop_classifier_metadata.json")
    metadata = {
        "model_name": "CropClassifierModel",
        "architecture": "MobileNetV2 5-Class Species Classifier (with UNKNOWN class)",
        "classes": class_names,
        "best_val_acc": best_val_acc,
        "confusion_matrix": cm.tolist(),
        "rice_vs_corn_metrics": rc_metrics,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


if __name__ == "__main__":
    train_crop_classifier(epochs=6, batch_size=16, lr=0.0003)
