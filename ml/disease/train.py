"""
CROPWISE AI - Crop Disease Detection Model Training Script
Employs Transfer Learning via MobileNetV2 with fine-tuning, image augmentation,
validation tracking, and checkpoint serialization.
"""

import os
import sys
import json
import time
from typing import Dict, Any, Tuple
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models

import importlib.util

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(CURRENT_DIR, "model")
DATASET_DIR = os.path.join(CURRENT_DIR, "dataset")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

prep_spec = importlib.util.spec_from_file_location("disease_preprocess", os.path.join(CURRENT_DIR, "preprocess.py"))
disease_preprocess = importlib.util.module_from_spec(prep_spec)
prep_spec.loader.exec_module(disease_preprocess)

get_train_transforms = disease_preprocess.get_train_transforms
get_eval_transforms = disease_preprocess.get_eval_transforms
DISEASE_CLASSES = disease_preprocess.DISEASE_CLASSES


def build_disease_model(num_classes: int, pretrained: bool = True) -> nn.Module:
    """
    Constructs MobileNetV2 transfer learning architecture.
    Freezes early feature layers and replaces classifier head for agricultural classes.
    """
    if pretrained:
        try:
            weights = models.MobileNet_V2_Weights.DEFAULT
            model = models.mobilenet_v2(weights=weights)
        except Exception as e:
            print(f"[Notice] Loading MobileNetV2 without pretrained weights ({e}). Initializing standard architecture.")
            model = models.mobilenet_v2(weights=None)
    else:
        model = models.mobilenet_v2(weights=None)

    # Unfreeze feature backbone for fine-tuning on foliar pathological lesions
    for param in model.features.parameters():
        param.requires_grad = True

    # Custom classifier head with Dropout and Linear layer
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes),
    )
    return model.to(DEVICE)


def train_disease_model(
    epochs: int = 5,
    batch_size: int = 8,
    learning_rate: float = 0.0003,
    target_dir: str = DATASET_DIR
) -> Dict[str, Any]:
    """
    Executes end-to-end model training, validation, and serialization.
    """
    train_dir = os.path.join(target_dir, "train")
    val_dir = os.path.join(target_dir, "validation")

    # Bootstrap dataset if absent
    if not os.path.exists(train_dir) or len(os.listdir(train_dir)) == 0:
        print("[Info] No existing dataset detected. Bootstrapping starter dataset...")
        gen_spec = importlib.util.spec_from_file_location("disease_ds_gen", os.path.join(CURRENT_DIR, "dataset_generator.py"))
        disease_ds_gen = importlib.util.module_from_spec(gen_spec)
        gen_spec.loader.exec_module(disease_ds_gen)
        disease_ds_gen.create_starter_disease_dataset(target_dir)

    print(f"[Training] Using compute device: {DEVICE}")
    print(f"[Training] Loading datasets from: {target_dir}")

    train_data = datasets.ImageFolder(train_dir, transform=get_train_transforms())
    val_data = datasets.ImageFolder(val_dir, transform=get_eval_transforms())

    classes = train_data.classes
    num_classes = len(classes)
    print(f"[Training] Detected {num_classes} classes: {classes}")

    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False, num_workers=0)

    model = build_disease_model(num_classes)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=learning_rate,
        weight_decay=1e-4
    )
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    history = {
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": [],
    }

    start_time = time.time()
    best_val_acc = 0.0

    print("=" * 60)
    print(f"Starting MobileNetV2 Training ({epochs} epochs)...")
    print("=" * 60)

    for epoch in range(1, epochs + 1):
        # 1. Training Phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct_train += torch.sum(preds == labels.data).item()
            total_train += labels.size(0)

        scheduler.step()

        epoch_train_loss = running_loss / max(1, total_train)
        epoch_train_acc = (correct_train / max(1, total_train)) * 100.0

        # 2. Validation Phase
        model.eval()
        val_running_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_running_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                correct_val += torch.sum(preds == labels.data).item()
                total_val += labels.size(0)

        epoch_val_loss = val_running_loss / max(1, total_val)
        epoch_val_acc = (correct_val / max(1, total_val)) * 100.0

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 2))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 2))

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:5.2f}% | "
            f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:5.2f}%"
        )

        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc

    total_duration = time.time() - start_time
    print("-" * 60)
    print(f"Training completed in {total_duration:.2f} seconds. Best Val Acc: {best_val_acc:.2f}%")

    # 3. Model Checkpoint Serialization
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_save_path = os.path.join(MODEL_DIR, "crop_disease_model.pt")
    metadata_save_path = os.path.join(MODEL_DIR, "model_metadata.json")

    torch.save({
        "model_state_dict": model.state_dict(),
        "num_classes": num_classes,
        "classes": classes,
        "architecture": "MobileNetV2_TransferLearning",
        "best_val_acc": best_val_acc,
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }, model_save_path)

    metadata = {
        "model_name": "CROPWISE MobileNetV2 Disease Classifier",
        "architecture": "MobileNetV2 Transfer Learning",
        "num_classes": num_classes,
        "classes": classes,
        "history": history,
        "best_val_acc": round(best_val_acc, 2),
        "total_epochs": epochs,
        "duration_seconds": round(total_duration, 2),
        "model_file": "crop_disease_model.pt",
        "device_used": str(DEVICE),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    with open(metadata_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[Checkpoint Saved] Model state saved to: {model_save_path}")
    print(f"[Metadata Saved] Training metadata saved to: {metadata_save_path}")
    return metadata


if __name__ == "__main__":
    train_disease_model(epochs=5, batch_size=8)
