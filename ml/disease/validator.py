"""
CROPWISE AI - Multi-Stage Crop Leaf Image Validation Pipeline
Implements the 4-Stage Architectural Defense:
Stage 1: File Integrity & Image Quality Check (Blur, Exposure, Contrast, Solid/Blank)
Stage 2: ML-based Leaf vs Non-Leaf Detection (MobileNetV2 Binary Classifier)
Stage 3: ML-based Crop Species Identification (Tomato, Potato, Corn, Rice, UNKNOWN + OOD Rejection)
Stage 4: Supported Crop Verification (Only routes verified crops to disease model)
"""

import os
import math
import json
from typing import Dict, Any, Tuple, Optional
from PIL import Image
import numpy as np
from scipy import ndimage
import torch
import torch.nn.functional as F
from torchvision import transforms

from ml.disease.config import (
    SUPPORTED_CROPS,
    CROP_CLASSES,
    LEAF_CLASSES,
    LEAF_THRESHOLD,
    CROP_THRESHOLD,
    CROP_ENTROPY_THRESHOLD,
    CROP_MARGIN_THRESHOLD,
    CROP_OOD_TAU_SIM,
    CROP_OOD_TAU_ENERGY,
    CROP_OOD_TAU_PROB,
    CROP_OOD_TAU_MARGIN,
    STATE_INVALID_IMAGE,
    STATE_POOR_QUALITY,
    STATE_NON_LEAF,
    STATE_UNKNOWN_LEAF,
    STATE_SUPPORTED_CROP,
    STATE_DISEASE_RESULT,
    CROP_TO_DISEASE_CLASSES,
    CROP_DISPLAY_NAMES,
    MSG_UNKNOWN_LEAF,
    MSG_AMBIGUOUS_LEAF,
    MSG_NON_LEAF,
    MSG_POOR_QUALITY,
    MSG_INVALID_IMAGE,
    MIN_IMAGE_DIMENSION,
    MAX_ASPECT_RATIO,
    MIN_FILE_SIZE_BYTES,
    MAX_FILE_SIZE_BYTES,
    BLUR_LAPLACIAN_MIN_VAR,
    BLANK_INTENSITY_STD_MIN,
    OVEREXPOSURE_LUMINANCE_MAX,
    UNDEREXPOSURE_LUMINANCE_MIN,
    MIN_RMS_CONTRAST,
)
from ml.disease.models_arch import build_leaf_detector_model, build_crop_classifier_model

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(CURRENT_DIR, "model")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]

eval_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(NORM_MEAN, NORM_STD),
])

# Global Cached ML Models
_CACHED_LEAF_MODEL = None
_CACHED_LEAF_CLASSES = None
_CACHED_CROP_MODEL = None
_CACHED_CROP_CLASSES = None


def load_leaf_model() -> Tuple[torch.nn.Module, list]:
    """Loads and caches Stage 2 Leaf Detector model."""
    global _CACHED_LEAF_MODEL, _CACHED_LEAF_CLASSES
    if _CACHED_LEAF_MODEL is not None and _CACHED_LEAF_CLASSES is not None:
        return _CACHED_LEAF_MODEL, _CACHED_LEAF_CLASSES

    path = os.path.join(MODEL_DIR, "leaf_detector_model.pt")
    model = build_leaf_detector_model(pretrained=False).to(DEVICE)
    if os.path.exists(path):
        ckpt = torch.load(path, map_location=DEVICE)
        model.load_state_dict(ckpt["model_state_dict"])
        classes = ckpt.get("classes", LEAF_CLASSES)
    else:
        classes = LEAF_CLASSES

    model.eval()
    _CACHED_LEAF_MODEL = model
    _CACHED_LEAF_CLASSES = classes
    return _CACHED_LEAF_MODEL, _CACHED_LEAF_CLASSES


def load_crop_model() -> Tuple[torch.nn.Module, list]:
    """Loads and caches Stage 3 Crop Classifier model."""
    global _CACHED_CROP_MODEL, _CACHED_CROP_CLASSES
    if _CACHED_CROP_MODEL is not None and _CACHED_CROP_CLASSES is not None:
        return _CACHED_CROP_MODEL, _CACHED_CROP_CLASSES

    path = os.path.join(MODEL_DIR, "crop_classifier_model.pt")
    model = build_crop_classifier_model(num_classes=len(CROP_CLASSES), pretrained=False).to(DEVICE)
    if os.path.exists(path):
        ckpt = torch.load(path, map_location=DEVICE)
        model.load_state_dict(ckpt["model_state_dict"])
        classes = ckpt.get("classes", CROP_CLASSES)
    else:
        classes = CROP_CLASSES

    model.eval()
    _CACHED_CROP_MODEL = model
    _CACHED_CROP_CLASSES = classes
    return _CACHED_CROP_MODEL, _CACHED_CROP_CLASSES


_CACHED_CENTROIDS = None
_CACHED_OOD_CALIBRATION = None


def load_crop_centroids() -> Optional[Dict[str, torch.Tensor]]:
    """Loads and caches class centroid embeddings for the 4 supported crops."""
    global _CACHED_CENTROIDS
    if _CACHED_CENTROIDS is not None:
        return _CACHED_CENTROIDS
    path = os.path.join(MODEL_DIR, "crop_centroids.pt")
    if os.path.exists(path):
        ckpt = torch.load(path, map_location=DEVICE)
        _CACHED_CENTROIDS = {k: v.to(DEVICE) for k, v in ckpt.get("centroids", {}).items()}
    return _CACHED_CENTROIDS


def load_ood_calibration() -> Dict[str, float]:
    """Loads and caches empirically calibrated thresholds for OOD rejection."""
    global _CACHED_OOD_CALIBRATION
    if _CACHED_OOD_CALIBRATION is not None:
        return _CACHED_OOD_CALIBRATION
    default_config = {
        "tau_sim": CROP_OOD_TAU_SIM,
        "tau_energy": CROP_OOD_TAU_ENERGY,
        "tau_prob": CROP_OOD_TAU_PROB,
        "tau_margin": CROP_OOD_TAU_MARGIN,
    }
    path = os.path.join(MODEL_DIR, "crop_ood_calibration.json")
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                _CACHED_OOD_CALIBRATION = json.load(f)
        except Exception:
            _CACHED_OOD_CALIBRATION = default_config
    else:
        _CACHED_OOD_CALIBRATION = default_config
    return _CACHED_OOD_CALIBRATION


def ensure_rgb_white_bg(img: Image.Image) -> Image.Image:
    """Converts image to RGB mode. If RGBA or transparent, composites over white background."""
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        rgba = img.convert("RGBA")
        bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        composite = Image.alpha_composite(bg, rgba)
        return composite.convert("RGB")
    return img.convert("RGB")


# ==============================================================================
# STAGE 1: FILE VALIDATION & QUALITY INSPECTION
# ==============================================================================

def inspect_image_quality(img: Image.Image) -> Dict[str, Any]:
    """
    Computes photometric quality metrics:
    - Blur (Laplacian variance)
    - Exposure (mean luminance)
    - Contrast (RMS standard deviation)
    - Uniformity / Blank image check
    """
    rgb = ensure_rgb_white_bg(img)
    gray = rgb.convert("L").resize((256, 256), Image.Resampling.BILINEAR)
    gray_arr = np.array(gray, dtype=np.float32)

    # 1. Blur via Laplacian convolution
    laplacian_kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
    laplacian = ndimage.convolve(gray_arr, laplacian_kernel)
    blur_score = float(laplacian.var())

    # 2. Exposure & Contrast
    mean_luminance = float(gray_arr.mean())
    rms_contrast = float(gray_arr.std())

    failures = []
    if blur_score < BLUR_LAPLACIAN_MIN_VAR:
        failures.append(f"Image is severely blurred (sharpness {blur_score:.1f} < {BLUR_LAPLACIAN_MIN_VAR})")
    if rms_contrast < BLANK_INTENSITY_STD_MIN:
        failures.append(f"Image lacks contrast or is blank (variance {rms_contrast:.1f} < {BLANK_INTENSITY_STD_MIN})")
    if mean_luminance > OVEREXPOSURE_LUMINANCE_MAX:
        failures.append(f"Image is overexposed/blown out (luminance {mean_luminance:.1f} > {OVEREXPOSURE_LUMINANCE_MAX})")
    if mean_luminance < UNDEREXPOSURE_LUMINANCE_MIN:
        failures.append(f"Image is underexposed/too dark (luminance {mean_luminance:.1f} < {UNDEREXPOSURE_LUMINANCE_MIN})")

    return {
        "passed": len(failures) == 0,
        "failures": failures,
        "blur_score": round(blur_score, 1),
        "mean_luminance": round(mean_luminance, 1),
        "rms_contrast": round(rms_contrast, 1),
    }


# ==============================================================================
# STAGE 2: ML-BASED LEAF DETECTION
# ==============================================================================

def detect_leaf_ml(img: Image.Image) -> Dict[str, Any]:
    """
    Stage 2: Runs the binary LeafDetectorModel (LEAF vs NON_LEAF).
    Learned positive examples: Tomato, Potato, Corn, Rice, Mango, Neem, Guava, etc.
    Learned negative examples: People, faces, signatures, documents, phones, laptops, etc.
    """
    model, classes = load_leaf_model()
    tensor = eval_transforms(ensure_rgb_white_bg(img)).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(tensor).squeeze(0)
        probs = F.softmax(logits, dim=0).cpu().tolist()

    classes_lower = [str(c).lower().strip() for c in classes]
    leaf_idx = None
    for idx, c in enumerate(classes_lower):
        if c == "leaf":
            leaf_idx = idx
            break
    if leaf_idx is None:
        for idx, c in enumerate(classes_lower):
            if "non" not in c and "leaf" in c:
                leaf_idx = idx
                break
    if leaf_idx is None:
        leaf_idx = 0

    non_leaf_idx = 1 - leaf_idx if len(classes) == 2 else (0 if leaf_idx != 0 else 1)

    leaf_prob = float(probs[leaf_idx])
    non_leaf_prob = float(probs[non_leaf_idx])

    is_leaf = leaf_prob >= LEAF_THRESHOLD

    return {
        "is_leaf": is_leaf,
        "leaf_confidence": round(leaf_prob * 100.0, 1),
        "non_leaf_confidence": round(non_leaf_prob * 100.0, 1),
        "probabilities": {classes[i]: round(p * 100.0, 1) for i, p in enumerate(probs)},
    }


# ==============================================================================
# STAGE 3: ML-BASED CROP IDENTIFICATION & OOD REJECTION
# ==============================================================================

def identify_crop_species_ml(img: Image.Image) -> Dict[str, Any]:
    """
    Stage 3: Crop Species Identification & Multi-Layer Open-Set OOD Defense.
    The system strictly accepts ONLY the four supported agricultural crops:
    1. Tomato
    2. Potato
    3. Corn
    4. Rice
    Any other foliar species (Mango, Neem, Guava, Banana, Apple, Grape, Papaya, etc.)
    is rejected via deep penultimate feature embedding cosine distance, free energy
    scoring, and calibrated probability & margin boundaries.
    """
    model, classes = load_crop_model()
    tensor = eval_transforms(ensure_rgb_white_bg(img)).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        features = model.features(tensor)
        pooled = F.adaptive_avg_pool2d(features, (1, 1)).flatten(1)
        norm_feat = F.normalize(pooled, dim=1).squeeze(0)
        logits = model.classifier(pooled).squeeze(0)

        # Full distribution across all classes (including UNKNOWN)
        full_probs = F.softmax(logits, dim=0)
        full_probs_dict = {classes[i]: round(full_probs[i].item() * 100.0, 1) for i in range(len(classes))}
        entropy = -torch.sum(full_probs * torch.log(full_probs + 1e-7)).item()

        # Subset of supported agricultural crops: Corn, Potato, Rice, Tomato
        supp_indices = [i for i, c in enumerate(classes) if c in SUPPORTED_CROPS]
        if not supp_indices:
            supp_indices = list(range(min(4, len(classes))))
        supp_classes = [classes[i] for i in supp_indices]
        supp_logits = logits[supp_indices]

        # Free Energy score on supported crop logits: E(x) = -T * logsumexp(logits / T)
        T = 1.0
        energy = float((-T * torch.logsumexp(supp_logits / T, dim=0)).item())

        # Softmax probability strictly over the supported crops
        supp_probs = F.softmax(supp_logits, dim=0)
        best_supp_subidx = int(supp_probs.argmax().item())
        best_crop = supp_classes[best_supp_subidx]
        best_prob = float(supp_probs[best_supp_subidx].item())

        # Top-1 vs Top-2 Margin among supported crops
        sorted_supp = sorted(supp_probs.tolist(), reverse=True)
        margin = sorted_supp[0] - sorted_supp[1] if len(sorted_supp) > 1 else 1.0

        # Cosine similarity to class centroid in 1280-d embedding space
        centroids = load_crop_centroids()
        if centroids and best_crop in centroids:
            sim = float(torch.dot(norm_feat, centroids[best_crop].to(norm_feat.device)).item())
        else:
            sim = 1.0

    # Retrieve calibrated empirical thresholds
    calib = load_ood_calibration()
    tau_sim = float(calib.get("tau_sim", CROP_OOD_TAU_SIM))
    tau_energy = float(calib.get("tau_energy", CROP_OOD_TAU_ENERGY))
    tau_prob = float(calib.get("tau_prob", CROP_OOD_TAU_PROB))
    tau_margin = float(calib.get("tau_margin", CROP_OOD_TAU_MARGIN))

    # Multi-Layer Open-Set OOD Gating:
    # 1. Did model explicitly classify as UNKNOWN?
    is_unknown_class = (classes[int(full_probs.argmax().item())] == "UNKNOWN")
    # 2. Embedding Cosine Similarity Gate (distance to known crop manifold)
    is_low_sim = (sim < tau_sim)
    # 3. Energy Gate (free energy must be negative enough to indicate in-distribution density)
    is_high_energy = (energy > tau_energy)
    # 4. Calibrated Probability Gate
    is_low_prob = (best_prob < tau_prob)
    # 5. Ambiguity Margin Gate
    is_ambiguous = (margin < tau_margin)
    # 6. High Shannon Entropy Gate
    is_high_entropy = (entropy > CROP_ENTROPY_THRESHOLD)

    if is_unknown_class or is_low_sim or is_high_energy or is_low_prob or is_ambiguous or is_high_entropy:
        disp_name = "Undefined Leaf"
        reason = MSG_UNKNOWN_LEAF
        return {
            "supported": False,
            "crop": None,
            "crop_display_name": disp_name,
            "crop_status": "UNKNOWN",
            "confidence": 0.0,
            "crop_confidence": 0.0,
            "raw_crop": best_crop,
            "raw_confidence": round(best_prob * 100.0, 1),
            "sim": round(sim, 4),
            "energy": round(energy, 2),
            "margin": round(margin, 3),
            "entropy": round(entropy, 3),
            "distribution": full_probs_dict,
            "rejection_reason": reason,
        }

    disp_name = CROP_DISPLAY_NAMES.get(best_crop, best_crop)
    confidence_pct = round(best_prob * 100.0, 1)
    return {
        "supported": True,
        "crop": best_crop,
        "crop_display_name": disp_name,
        "crop_status": "SUPPORTED",
        "confidence": confidence_pct,
        "crop_confidence": confidence_pct,
        "sim": round(sim, 4),
        "energy": round(energy, 2),
        "margin": round(margin, 3),
        "entropy": round(entropy, 3),
        "distribution": full_probs_dict,
        "rejection_reason": None,
    }


def evaluate_crop_probabilities(prob_dict: Dict[str, float], entropy: Optional[float] = None) -> Dict[str, Any]:
    """
    Evaluates crop prediction probabilities with multi-stage rejection:
    1. UNKNOWN class detection
    2. Minimum confidence threshold (CROP_THRESHOLD)
    3. Shannon entropy threshold (CROP_ENTROPY_THRESHOLD)
    4. Top-1 vs Top-2 ambiguity margin threshold (CROP_MARGIN_THRESHOLD)
    """
    best_class = max(prob_dict, key=prob_dict.get)
    best_prob = prob_dict[best_class]
    confidence_pct = round(best_prob * 100.0, 1)

    if entropy is None:
        p_arr = np.array(list(prob_dict.values()), dtype=np.float32)
        p_arr = p_arr / (np.sum(p_arr) + 1e-7)
        entropy = float(-np.sum(p_arr * np.log(p_arr + 1e-7)))

    # Calculate top-1 and top-2 margin for ambiguity detection
    sorted_probs = sorted(prob_dict.values(), reverse=True)
    top1_prob = sorted_probs[0]
    top2_prob = sorted_probs[1] if len(sorted_probs) > 1 else 0.0
    prob_margin = top1_prob - top2_prob

    # Rejection Logic:
    # 1. Did the model explicitly predict UNKNOWN?
    is_unknown_class = (best_class == "UNKNOWN")
    # 2. Is confidence below threshold?
    is_low_confidence = (best_prob < CROP_THRESHOLD)
    # 3. Is entropy too high (high uncertainty / out of distribution)?
    is_high_entropy = (entropy > CROP_ENTROPY_THRESHOLD)
    # 4. Is the prediction ambiguous (top 2 classes too close)?
    is_ambiguous = (prob_margin < CROP_MARGIN_THRESHOLD)

    if is_unknown_class or is_low_confidence or is_high_entropy or is_ambiguous:
        disp_name = "Undefined Leaf"
        reason = MSG_UNKNOWN_LEAF
        return {
            "supported": False,
            "crop": None,
            "crop_display_name": disp_name,
            "crop_status": "UNKNOWN",
            "confidence": 0.0,
            "crop_confidence": 0.0,
            "raw_crop": best_class,
            "raw_confidence": confidence_pct,
            "margin": round(prob_margin, 3),
            "entropy": round(entropy, 3),
            "distribution": {c: round(p * 100.0, 1) for c, p in prob_dict.items()},
            "rejection_reason": reason,
        }

    disp_name = CROP_DISPLAY_NAMES.get(best_class, best_class)
    return {
        "supported": True,
        "crop": best_class,
        "crop_display_name": disp_name,
        "crop_status": "SUPPORTED",
        "confidence": confidence_pct,
        "crop_confidence": confidence_pct,
        "margin": round(prob_margin, 3),
        "entropy": round(entropy, 3),
        "distribution": {c: round(p * 100.0, 1) for c, p in prob_dict.items()},
        "rejection_reason": None,
    }


# ==============================================================================
# MASTER MULTI-STAGE VALIDATION PIPELINE
# ==============================================================================

def validate_image_pipeline(
    image: Image.Image,
    file_bytes: Optional[bytes] = None,
    filename: str = "uploaded_leaf.jpg"
) -> Dict[str, Any]:
    """
    Sequential 4-Stage Architectural Gate:
    Stage 1: File Integrity & Image Quality
    Stage 2: Leaf vs Non-Leaf Detection (ML Model)
    Stage 3: Crop Species Identification & OOD Rejection (ML Model with UNKNOWN class)
    Stage 4: Supported Crop Verification
    Short-circuits immediately at the earliest failure stage.
    """
    # --------------------------------------------------------------------------
    # STAGE 1A: File Bounds & Resolution Validation
    # --------------------------------------------------------------------------
    if file_bytes is not None:
        if len(file_bytes) < MIN_FILE_SIZE_BYTES:
            return {
                "valid": False,
                "result_state": "INVALID_IMAGE",
                "stage": "file_validation",
                "is_leaf": False,
                "leaf_status": "INVALID_IMAGE",
                "crop": None,
                "crop_status": "NON_LEAF",
                "crop_confidence": 0.0,
                "disease": "Image Rejected",
                "disease_confidence": 0.0,
                "disease_analysis_status": "BLOCKED",
                "reason": "Uploaded file is empty or corrupted (< 1 KB).",
            }
        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            return {
                "valid": False,
                "result_state": "INVALID_IMAGE",
                "stage": "file_validation",
                "is_leaf": False,
                "leaf_status": "INVALID_IMAGE",
                "crop": None,
                "crop_status": "NON_LEAF",
                "crop_confidence": 0.0,
                "disease": "Image Rejected",
                "disease_confidence": 0.0,
                "disease_analysis_status": "BLOCKED",
                "reason": "File size exceeds the 15 MB limit.",
            }

    width, height = image.size
    if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
        return {
            "valid": False,
            "result_state": "INVALID_IMAGE",
            "stage": "dimension_validation",
            "is_leaf": False,
            "leaf_status": "INVALID_IMAGE",
            "crop": None,
            "crop_status": "NON_LEAF",
            "crop_confidence": 0.0,
            "disease": "Image Rejected",
            "disease_confidence": 0.0,
            "disease_analysis_status": "BLOCKED",
            "reason": f"Image resolution is too low ({width}x{height}px). Minimum supported resolution is 100x100px.",
        }

    aspect_ratio = max(width, height) / max(1, min(width, height))
    if aspect_ratio > MAX_ASPECT_RATIO:
        return {
            "valid": False,
            "result_state": "INVALID_IMAGE",
            "stage": "dimension_validation",
            "is_leaf": False,
            "leaf_status": "INVALID_IMAGE",
            "crop": None,
            "crop_status": "NON_LEAF",
            "crop_confidence": 0.0,
            "disease": "Image Rejected",
            "disease_confidence": 0.0,
            "disease_analysis_status": "BLOCKED",
            "reason": f"Image aspect ratio is distorted ({aspect_ratio:.1f}:1). Please upload a standard photo.",
        }

    # --------------------------------------------------------------------------
    # STAGE 1B: Image Quality Inspection
    # --------------------------------------------------------------------------
    quality = inspect_image_quality(image)
    if not quality["passed"]:
        reason_str = quality["failures"][0] if quality["failures"] else "Image quality insufficient"
        return {
            "valid": False,
            "result_state": "POOR_QUALITY",
            "stage": "quality_inspection",
            "is_leaf": False,
            "leaf_status": "POOR_QUALITY",
            "crop": None,
            "crop_status": "NON_LEAF",
            "crop_confidence": 0.0,
            "disease": "Image Quality Insufficient",
            "disease_confidence": 0.0,
            "disease_analysis_status": "BLOCKED",
            "reason": f"{reason_str}. Please upload a clear, focused photograph of a crop leaf.",
            "quality_metrics": quality,
        }

    # --------------------------------------------------------------------------
    # STAGE 2: ML-based Leaf Detection
    # --------------------------------------------------------------------------
    leaf_res = detect_leaf_ml(image)
    if not leaf_res["is_leaf"]:
        return {
            "valid": False,
            "result_state": "NON_LEAF",
            "stage": "leaf_detection",
            "is_leaf": False,
            "leaf_status": "NON_LEAF",
            "crop": None,
            "crop_status": "NON_LEAF",
            "crop_confidence": 0.0,
            "disease": "No Crop Leaf Detected",
            "disease_confidence": 0.0,
            "disease_analysis_status": "BLOCKED",
            "reason": MSG_NON_LEAF,
            "leaf_confidence": leaf_res["leaf_confidence"],
            "quality_metrics": quality,
        }

    # --------------------------------------------------------------------------
    # STAGE 3 & 4: ML-based Crop Species Identification & Supported Crop Verification
    # --------------------------------------------------------------------------
    crop_res = identify_crop_species_ml(image)
    if not crop_res["supported"]:
        return {
            "valid": False,
            "result_state": "UNKNOWN_LEAF",
            "stage": "crop_identification",
            "is_leaf": True,
            "leaf_status": "VALID_LEAF",
            "crop": None,
            "crop_display_name": crop_res.get("crop_display_name", "Undefined Leaf"),
            "crop_status": "UNKNOWN",
            "crop_confidence": 0.0,
            "raw_crop": crop_res.get("raw_crop"),
            "raw_confidence": crop_res.get("raw_confidence", 0.0),
            "disease": crop_res.get("crop_display_name", "Undefined Leaf"),
            "disease_confidence": 0.0,
            "disease_analysis_status": "BLOCKED",
            "reason": crop_res.get("rejection_reason", MSG_UNKNOWN_LEAF),
            "crop_distribution": crop_res["distribution"],
            "entropy": crop_res["entropy"],
            "margin": crop_res.get("margin"),
            "quality_metrics": quality,
        }

    # --------------------------------------------------------------------------
    # ALL STAGES PASSED: Crop Verified (Tomato, Potato, Corn, Rice)
    # --------------------------------------------------------------------------
    return {
        "valid": True,
        "result_state": "SUPPORTED_CROP",
        "stage": "crop_verified",
        "is_leaf": True,
        "leaf_status": "VALID_LEAF",
        "crop": crop_res["crop"],
        "crop_display_name": crop_res.get("crop_display_name", crop_res["crop"]),
        "crop_status": "SUPPORTED",
        "crop_confidence": crop_res["crop_confidence"],
        "crop_distribution": crop_res["distribution"],
        "entropy": crop_res["entropy"],
        "margin": crop_res.get("margin"),
        "disease_analysis_status": "ALLOWED",
        "reason": None,
        "quality_metrics": quality,
    }
