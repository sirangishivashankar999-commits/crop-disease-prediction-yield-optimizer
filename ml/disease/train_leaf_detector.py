"""
CROPWISE AI - Training Pipeline for Stage 2 Leaf Detector
Trains MobileNetV2 binary classifier to distinguish LEAF vs NON_LEAF.
Computes validation metrics, confusion matrix, and serializes model weights.
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
DATASET_DIR = os.path.join(CURRENT_DIR, "dataset_leaf")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

from models_arch import build_leaf_detector_model
from dataset_builder import build_all_datasets
from config import LEAF_CLASSES

# Transforms
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]

train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.1, contrast=0.1),
    transforms.ToTensor(),
    transforms.Normalize(NORM_MEAN, NORM_STD),
])

eval_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(NORM_MEAN, NORM_STD),
])


def train_leaf_detector(epochs: int = 5, batch_size: int = 8, lr: float = 0.001) -> Dict[str, Any]:
    """Trains and serializes the Leaf vs Non-Leaf detector model."""
    train_dir = os.path.join(DATASET_DIR, "train")
    val_dir = os.path.join(DATASET_DIR, "validation")

    if not os.path.exists(train_dir) or len(os.listdir(train_dir)) == 0:
        print("[Info] Leaf dataset not found. Building datasets...")
        build_all_datasets()

    print("=" * 70)
    print("   TRAINING STAGE 2: LEAF DETECTOR MODEL")
    print(f"   Compute Device: {DEVICE}")
    print("=" * 70)

    train_data = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_data = datasets.ImageFolder(val_dir, transform=eval_transforms)

    class_names = train_data.classes
    print(f"[Leaf Detector] Target classes: {class_names}")

    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False, num_workers=0)

    model = build_leaf_detector_model(pretrained=True).to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=lr)

    best_val_acc = 0.0
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

        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc
            best_state = model.state_dict()

    duration = time.time() - start_time
    print(f"\n[Leaf Detector] Training completed in {duration:.1f}s. Best Val Accuracy: {best_val_acc:.1f}%")

    # Compute Confusion Matrix on Validation Set
    cm = confusion_matrix(all_labels, all_preds)
    print("\n[Leaf Detector Confusion Matrix]:")
    print(f"               Pred NON_LEAF  Pred LEAF")
    print(f"True NON_LEAF: {cm[0][0]:13d} {cm[0][1]:10d}")
    print(f"True LEAF:     {cm[1][0]:13d} {cm[1][1]:10d}")

    # Serialize Model & Metadata
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_save_path = os.path.join(MODEL_DIR, "leaf_detector_model.pt")
    torch.save({
        "model_state_dict": best_state,
        "classes": class_names,
        "best_val_acc": best_val_acc,
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }, model_save_path)
    print(f"[Leaf Detector] Checkpoint saved to: {model_save_path}")

    meta_path = os.path.join(MODEL_DIR, "leaf_detector_metadata.json")
    metadata = {
        "model_name": "LeafDetectorModel",
        "architecture": "MobileNetV2 Binary Classifier",
        "classes": class_names,
        "best_val_acc": best_val_acc,
        "confusion_matrix": cm.tolist(),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


if __name__ == "__main__":
    train_leaf_detector(epochs=6, lr=0.0005)
