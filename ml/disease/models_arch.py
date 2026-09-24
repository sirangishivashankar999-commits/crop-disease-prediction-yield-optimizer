"""
CROPWISE AI - PyTorch Neural Network Architectures
Provides unified MobileNetV2 architectures for:
- Stage 2: Leaf Detector (LEAF vs NON_LEAF)
- Stage 3: Crop Species Classifier (Tomato, Potato, Corn, Rice, UNKNOWN)
- Stage 4: Disease Classifier (10 Agricultural Disease Classes)
"""

import torch
import torch.nn as nn
from torchvision import models


def build_leaf_detector_model(pretrained: bool = False) -> nn.Module:
    """
    Stage 2 Model: Binary classifier for Leaf vs Non-Leaf.
    Outputs 2 logits: [NON_LEAF, LEAF].
    """
    try:
        weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
        model = models.mobilenet_v2(weights=weights)
    except Exception:
        model = models.mobilenet_v2(weights=None)

    for param in model.features.parameters():
        param.requires_grad = False

    # Unfreeze the last convolutional block for fine-tuning foliar tissue features
    for param in model.features[-2:].parameters():
        param.requires_grad = True

    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 128),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(128, 2),
    )
    return model


def build_crop_classifier_model(num_classes: int = 5, pretrained: bool = False) -> nn.Module:
    """
    Stage 3 Model: Crop Species Classifier with mandatory UNKNOWN class.
    Outputs logits across: [Tomato, Potato, Corn, Rice, UNKNOWN].
    """
    try:
        weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
        model = models.mobilenet_v2(weights=weights)
    except Exception:
        model = models.mobilenet_v2(weights=None)

    for param in model.features.parameters():
        param.requires_grad = True

    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 192),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(192, num_classes),
    )
    return model


def build_disease_model(num_classes: int = 10, pretrained: bool = False) -> nn.Module:
    """
    Stage 4 Model: Agricultural Disease Classifier.
    Outputs logits across the 10 supported disease/healthy classes.
    """
    try:
        weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
        model = models.mobilenet_v2(weights=weights)
    except Exception:
        model = models.mobilenet_v2(weights=None)

    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes),
    )
    return model
