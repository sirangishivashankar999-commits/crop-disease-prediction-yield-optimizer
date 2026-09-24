"""
CROPWISE AI - Crop Disease Inference Pipeline
Provides cascaded multi-stage inference:
Stage 1: File & Image Quality Validation
Stage 2: ML-based Leaf vs Non-Leaf Detection
Stage 3: ML-based Crop Species Identification & OOD Rejection (Tomato, Potato, Corn, Rice, UNKNOWN)
Stage 4: Supported-Crop Disease Classification (MobileNetV2)
The disease model is strictly gated and NEVER executed on non-leaf or unsupported plant samples.
"""

import os
import sys
import io
from typing import Dict, Any, List, Union
from PIL import Image
import torch
import torch.nn.functional as F

import importlib.util

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(CURRENT_DIR, "model")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

from ml.disease.config import (
    SUPPORTED_CROPS,
    CROP_CLASSES,
    DISEASE_CLASSES,
    CROP_TO_DISEASE_CLASSES,
    CROP_DISPLAY_NAMES,
    DISEASE_THRESHOLD,
)
from ml.disease.models_arch import build_disease_model
from ml.disease.validator import validate_image_pipeline
from ml.disease.preprocess import preprocess_image_for_inference, enrich_prediction

_CACHED_DISEASE_MODEL = None
_CACHED_DISEASE_CLASSES = None


def load_inference_model(model_path: str = None) -> tuple:
    """Loads and caches the PyTorch MobileNetV2 disease model."""
    global _CACHED_DISEASE_MODEL, _CACHED_DISEASE_CLASSES

    if _CACHED_DISEASE_MODEL is not None and _CACHED_DISEASE_CLASSES is not None:
        return _CACHED_DISEASE_MODEL, _CACHED_DISEASE_CLASSES

    if model_path is None:
        model_path = os.path.join(MODEL_DIR, "crop_disease_model.pt")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Trained disease model checkpoint not found at '{model_path}'. "
            "Please run 'python ml/disease/train.py' to generate the model weights."
        )

    checkpoint = torch.load(model_path, map_location=DEVICE)
    classes = checkpoint.get("classes", DISEASE_CLASSES)
    num_classes = len(classes)

    model = build_disease_model(num_classes, pretrained=False).to(DEVICE)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    _CACHED_DISEASE_MODEL = model
    _CACHED_DISEASE_CLASSES = classes
    return _CACHED_DISEASE_MODEL, _CACHED_DISEASE_CLASSES


def predict_crop_disease(
    image_input: Union[str, bytes, Image.Image] = None,
    top_k: int = 3,
    model_path: str = None,
    file_bytes: bytes = None,
    filename: str = "uploaded_leaf.jpg",
    image: Union[str, bytes, Image.Image] = None
) -> Dict[str, Any]:
    """
    Master Cascaded Prediction Pipeline:
    1. Loads and validates image format
    2. Runs Stage 1: File & Photometric Quality Check
    3. Runs Stage 2: ML-based Leaf vs Non-Leaf Classifier
    4. Runs Stage 3: ML-based Crop Species Classifier (with UNKNOWN & OOD Rejection)
    5. Checks Stage 4: Supported Crop Verification
       -> If non-leaf or unsupported, SHORT-CIRCUITS IMMEDIATELY without calling disease model.
    6. Runs Stage 4: Crop-Specific MobileNetV2 Disease Classification.
    """
    if image_input is None and image is not None:
        image_input = image
    if image_input is None:
        raise ValueError("No image provided for crop disease prediction.")

    # 1. Load image and raw bytes
    raw_bytes = file_bytes
    if isinstance(image_input, str):
        if not os.path.exists(image_input):
            raise FileNotFoundError(f"Image path does not exist: {image_input}")
        with open(image_input, "rb") as f:
            raw_bytes = f.read()
        img = Image.open(io.BytesIO(raw_bytes))
    elif isinstance(image_input, bytes):
        raw_bytes = image_input
        img = Image.open(io.BytesIO(image_input))
    elif isinstance(image_input, Image.Image):
        img = image_input
    else:
        raise ValueError("Unsupported image input type. Expected file path, raw bytes, or PIL.Image.")

    # 2. Sequential Validation (Stage 1 -> Stage 2 -> Stage 3)
    validation = validate_image_pipeline(img, file_bytes=raw_bytes, filename=filename)

    # SHORT-CIRCUIT: Gating enforcement
    # Under NO circumstances will the disease model run if validation failed
    if not validation["valid"]:
        result_state = validation.get("result_state", "INVALID_IMAGE")
        verified_crop = validation.get("crop", "None")
        crop_conf = validation.get("crop_confidence", 0.0)

        # Ensure confidence is strictly <= 100.0
        crop_conf = min(100.0, max(0.0, float(crop_conf)))

        if result_state == "UNKNOWN_LEAF":
            crop_disp = validation.get("crop_display_name", "Undefined Leaf")
            is_ambig = ("ambiguous" in str(validation.get("reason", "")).lower())
            reason_msg = validation.get("reason", "Leaf detected, but the plant is not recognized as Tomato, Potato, Corn, or Rice.")
            return {
                "disease": crop_disp,
                "raw_class": "UNSUPPORTED_CROP",
                "crop": None,
                "crop_display_name": crop_disp,
                "confidence": 0.0,  # No disease prediction generated
                "crop_confidence": 0.0,
                "crop_status": "UNKNOWN",
                "result_state": "UNKNOWN_LEAF",
                "is_leaf": True,
                "leaf_status": "VALID_LEAF",
                "disease_analysis_status": "BLOCKED",
                "severity": "None",
                "is_valid": False,
                "validation_stage": "crop_identification",
                "validation_reason": reason_msg,
                "supported_crops": SUPPORTED_CROPS,
                "symptoms": [
                    reason_msg,
                    "Plant outside supported agricultural crop species domain." if not is_ambig else "Foliar features insufficient for conclusive crop species determination.",
                ],
                "treatment": [
                    "Please upload a foliar photo of a supported crop (Tomato, Potato, Corn, Rice).",
                    "Ensure the leaf is well-lit, in sharp focus, and photographed against a neutral background.",
                ],
                "prevention": [
                    "Only supported agricultural crops can receive pathological diagnosis.",
                ],
                "top_predictions": [],
                "model_status": "Gated Rejection: Unsupported Plant Species" if not is_ambig else "Gated Rejection: Ambiguous Leaf",
                "is_real_ml": True,
                "error": None,
            }

        elif result_state == "NON_LEAF":
            return {
                "disease": "No Crop Leaf Detected",
                "raw_class": "NON_LEAF",
                "crop": None,
                "crop_display_name": None,
                "confidence": 0.0,
                "crop_confidence": 0.0,
                "crop_status": "NON_LEAF",
                "result_state": "NON_LEAF",
                "is_leaf": False,
                "leaf_status": "NON_LEAF",
                "disease_analysis_status": "BLOCKED",
                "severity": "None",
                "is_valid": False,
                "validation_stage": "leaf_detection",
                "validation_reason": validation.get("reason", "The uploaded image does not appear to contain a crop leaf."),
                "supported_crops": SUPPORTED_CROPS,
                "symptoms": [
                    "The uploaded image does not appear to contain living plant foliage.",
                    "Classified as non-leaf sample (e.g. document, signature, screen, person, object, or surface).",
                ],
                "treatment": [
                    "Please upload a clear, focused photograph of a genuine crop leaf.",
                    "Avoid photographing documents, handwriting, digital displays, or non-plant objects.",
                ],
                "prevention": [
                    "Capture single leaves in natural daylight with visible vein architecture.",
                ],
                "top_predictions": [],
                "model_status": "Gated Rejection: Non-Leaf Sample",
                "is_real_ml": True,
                "error": None,
            }

        else:  # INVALID_IMAGE or POOR_QUALITY
            return {
                "disease": "Image Quality Insufficient" if result_state == "POOR_QUALITY" else "Image Rejected",
                "raw_class": "INVALID_IMAGE",
                "crop": None,
                "crop_display_name": None,
                "confidence": 0.0,
                "crop_confidence": 0.0,
                "crop_status": "NON_LEAF",
                "result_state": result_state,
                "is_leaf": False,
                "leaf_status": result_state,
                "disease_analysis_status": "BLOCKED",
                "severity": "None",
                "is_valid": False,
                "validation_stage": validation.get("stage", "quality_inspection"),
                "validation_reason": validation.get("reason", "Image quality is insufficient for foliar analysis."),
                "supported_crops": SUPPORTED_CROPS,
                "symptoms": [
                    validation.get("reason", "Image quality is insufficient."),
                ],
                "treatment": [
                    "Ensure proper lighting without heavy blur, dark shadows, or extreme glare.",
                    "Minimum image resolution is 100x100 pixels.",
                ],
                "prevention": [],
                "top_predictions": [],
                "model_status": f"Gated Rejection: {result_state}",
                "is_real_ml": True,
                "error": None,
            }

    # 3. STAGE 4: CROP-SPECIFIC DISEASE CLASSIFICATION
    # Reached ONLY when: is_leaf == True AND crop in SUPPORTED_CROPS!
    verified_crop = validation.get("crop")
    if verified_crop not in SUPPORTED_CROPS:
        raise ValueError(f"Unexpected crop '{verified_crop}' routed to disease model. Supported: {SUPPORTED_CROPS}")

    crop_conf = min(100.0, max(0.0, float(validation.get("crop_confidence", 85.0))))

    tensor = preprocess_image_for_inference(img).to(DEVICE)
    model, classes = load_inference_model(model_path)

    # Identify candidate disease classes for this verified crop
    valid_disease_classes = CROP_TO_DISEASE_CLASSES.get(verified_crop, classes)
    valid_indices = [i for i, c in enumerate(classes) if c in valid_disease_classes]

    with torch.no_grad():
        logits = model(tensor).squeeze(0)  # [num_classes]

        # Crop-Specific Logit Masking:
        # Mask out classes belonging to other crops so predictions strictly align with the verified crop!
        masked_logits = logits.clone()
        for i in range(len(classes)):
            if i not in valid_indices:
                masked_logits[i] = -1e9  # Negative infinity mask

        probabilities = F.softmax(masked_logits, dim=0)

    # Top-K Disease Probabilities among crop-specific candidates
    top_k_count = min(top_k, len(valid_indices))
    top_probs, top_indices = torch.topk(probabilities, k=top_k_count)
    top_probs = top_probs.cpu().tolist()
    top_indices = top_indices.cpu().tolist()

    best_idx = top_indices[0]
    best_class = classes[best_idx]
    primary_confidence = round(top_probs[0] * 100.0, 1)

    # Enforce DISEASE_THRESHOLD
    is_low_conf = (top_probs[0] < DISEASE_THRESHOLD)
    conf_warning = (
        f"Diagnostic confidence ({primary_confidence}%) is below clinical verification threshold ({DISEASE_THRESHOLD * 100:.0f}%). Visual inspection recommended."
        if is_low_conf else None
    )

    top_predictions: List[Dict[str, Any]] = []
    for i, idx in enumerate(top_indices):
        c_name = classes[idx]
        top_predictions.append({
            "class_name": c_name,
            "display_name": c_name.replace("_", " "),
            "confidence": round(top_probs[i] * 100.0, 1)
        })

    # Enrich with agronomic pathology knowledge
    result = enrich_prediction(best_class, primary_confidence)
    result["is_valid"] = True
    result["result_state"] = "SUPPORTED_CROP"
    result["is_leaf"] = True
    result["leaf_status"] = "VALID_LEAF"
    result["crop"] = verified_crop
    result["crop_display_name"] = validation.get("crop_display_name", CROP_DISPLAY_NAMES.get(verified_crop, verified_crop))
    result["crop_status"] = "SUPPORTED"
    result["crop_confidence"] = crop_conf
    result["disease_analysis_status"] = "ALLOWED"
    result["validation_stage"] = "passed"
    result["validation_reason"] = None
    result["is_low_confidence"] = is_low_conf
    result["confidence_warning"] = conf_warning
    result["quality_status"] = "Verified Crop Leaf"
    result["top_predictions"] = top_predictions
    result["model_status"] = "Verified Foliar Inference (MobileNetV2)"
    result["is_real_ml"] = True
    result["supported_crops"] = SUPPORTED_CROPS
    result["error"] = None

    return result
