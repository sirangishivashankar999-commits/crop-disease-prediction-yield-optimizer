"""
CROPWISE AI - Central Configuration for Multi-Stage Crop Disease Pipeline
Defines configurable thresholds, class taxonomies, and quality bounds.
"""

from typing import List, Dict

# ==============================================================================
# TAXONOMY DEFINITIONS
# ==============================================================================

# Supported agricultural target crops
SUPPORTED_CROPS: List[str] = ["Tomato", "Potato", "Corn", "Rice"]

# Crop species classifier classes (Stage 3) - UNKNOWN is mandatory
CROP_CLASSES: List[str] = ["Corn", "Potato", "Rice", "Tomato", "UNKNOWN"]

# Leaf vs Non-Leaf classifier classes (Stage 2)
LEAF_CLASSES: List[str] = ["leaf", "non_leaf"]

# Known disease/healthy classes (Stage 4)
DISEASE_CLASSES: List[str] = [
    "Tomato_Early_Blight",
    "Tomato_Late_Blight",
    "Tomato_Healthy",
    "Potato_Early_Blight",
    "Potato_Late_Blight",
    "Potato_Healthy",
    "Corn_Leaf_Blight",
    "Corn_Healthy",
    "Rice_Leaf_Disease",
    "Rice_Healthy",
]

# Mapping of supported crop to valid disease class prefixes
CROP_TO_DISEASE_CLASSES: Dict[str, List[str]] = {
    "Tomato": ["Tomato_Early_Blight", "Tomato_Late_Blight", "Tomato_Healthy"],
    "Potato": ["Potato_Early_Blight", "Potato_Late_Blight", "Potato_Healthy"],
    "Corn": ["Corn_Leaf_Blight", "Corn_Healthy"],
    "Rice": ["Rice_Leaf_Disease", "Rice_Healthy"],
}

# User-facing display names for supported crops (Treat Paddy and Rice as same crop)
CROP_DISPLAY_NAMES: Dict[str, str] = {
    "Rice": "Rice / Paddy",
    "Tomato": "Tomato",
    "Potato": "Potato",
    "Corn": "Corn",
}

# ==============================================================================
# CONFIGURABLE ML & REJECTION THRESHOLDS
# ==============================================================================

# Stage 2: Leaf Detection
# Softmax probability required to confirm the image is genuine plant foliage
LEAF_THRESHOLD: float = 0.50

# Stage 3: Crop Species Identification & Out-of-Distribution Rejection
# Minimum probability to accept Tomato, Potato, Corn, or Rice (empirically calibrated)
CROP_THRESHOLD: float = 0.55

# Calibrated Open-Set / Out-of-Distribution (OOD) parameters
CROP_OOD_TAU_SIM: float = 0.35       # Min cosine similarity of MobileNetV2 embedding to crop centroid
CROP_OOD_TAU_ENERGY: float = -4.5    # Max free energy score (-T * logsumexp(logits))
CROP_OOD_TAU_PROB: float = 0.55      # Min probability for supported crops
CROP_OOD_TAU_MARGIN: float = 0.15    # Min margin between top-1 and top-2 supported crop probabilities

# Maximum allowable Shannon entropy across crop logits.
# High entropy indicates the model is guessing between classes (ambiguous or unseen plant)
CROP_ENTROPY_THRESHOLD: float = 1.40

# Minimum margin between top-1 and top-2 crop softmax probabilities.
# If margin < CROP_MARGIN_THRESHOLD, the sample is ambiguous and rejected as UNKNOWN_LEAF
CROP_MARGIN_THRESHOLD: float = 0.15

# Stage 4: Disease Classification
# Minimum confidence threshold for disease diagnostic report
DISEASE_THRESHOLD: float = 0.45

# Standard Result States
STATE_INVALID_IMAGE: str = "INVALID_IMAGE"
STATE_POOR_QUALITY: str = "POOR_QUALITY"
STATE_NON_LEAF: str = "NON_LEAF"
STATE_UNKNOWN_LEAF: str = "UNKNOWN_LEAF"
STATE_SUPPORTED_CROP: str = "SUPPORTED_CROP"
STATE_DISEASE_RESULT: str = "DISEASE_RESULT"

# Standard User-Facing Messages
MSG_UNKNOWN_LEAF: str = "Leaf detected, but the plant is not recognized as Tomato, Potato, Corn, or Rice."
MSG_AMBIGUOUS_LEAF: str = "The uploaded leaf could not be confidently identified as Tomato, Potato, Corn, or Rice. Please upload a clearer crop leaf image."
MSG_NON_LEAF: str = "The uploaded image does not appear to contain a crop leaf."
MSG_POOR_QUALITY: str = "Image quality is insufficient for foliar analysis."
MSG_INVALID_IMAGE: str = "Invalid or corrupted image file."

# ==============================================================================
# STAGE 1: IMAGE QUALITY & FILE INTEGRITY BOUNDS
# ==============================================================================
MIN_IMAGE_DIMENSION: int = 100         # Min width/height in pixels
MAX_ASPECT_RATIO: float = 5.0          # Max width/height or height/width ratio
MIN_FILE_SIZE_BYTES: int = 1024        # Min 1 KB to prevent empty files
MAX_FILE_SIZE_BYTES: int = 15728640    # 15 MB max

BLUR_LAPLACIAN_MIN_VAR: float = 8.0        # Below this variance indicates unreadable blur
BLANK_INTENSITY_STD_MIN: float = 3.0       # Below this indicates uniform/solid blank color
OVEREXPOSURE_LUMINANCE_MAX: float = 248.0 # Above this mean luminance is blown-out white
UNDEREXPOSURE_LUMINANCE_MIN: float = 16.0 # Below this mean luminance is pitch black
MIN_RMS_CONTRAST: float = 4.0             # Below this indicates a flat washed-out gray image
