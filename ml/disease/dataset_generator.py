"""
CROPWISE AI - Starter Dataset Generator for Crop Disease Detection
Creates starter image structures for train/validation/test across 10 classes
with synthetic leaf patterns to enable local model training verification out-of-the-box.
"""

import os
import sys
import random
import math
from PIL import Image, ImageDraw, ImageFilter

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
for p in [CURRENT_DIR, PROJECT_ROOT]:
    if p not in sys.path:
        sys.path.insert(0, p)

from preprocess import DISEASE_CLASSES

DATASET_ROOT = os.path.join(os.path.dirname(__file__), "dataset")
SPLITS = {
    "train": 12,      # 12 sample images per class for starter training
    "validation": 4,  # 4 validation images per class
    "test": 4         # 4 test images per class
}

def generate_leaf_image(disease_class: str, seed: int) -> Image.Image:
    """
    Generates a 256x256 image with realistic agricultural leaf characteristics:
    - Base green leaf tissue background
    - Primary and secondary leaf venation
    - Disease-specific visual symptom patterns
    """
    random.seed(seed)
    width, height = 256, 256

    # 1. Base foliage background (chlorophyll green gradient with noise)
    base_color = (
        random.randint(35, 65),
        random.randint(110, 165),
        random.randint(40, 75)
    )
    img = Image.new("RGB", (width, height), base_color)
    draw = ImageDraw.Draw(img)

    # 2. Draw leaf outline contour
    leaf_color = (
        base_color[0] + random.randint(-10, 15),
        base_color[1] + random.randint(-15, 25),
        base_color[2] + random.randint(-10, 15)
    )
    draw.ellipse([16, 16, width - 16, height - 16], fill=leaf_color)

    # 3. Draw central vascular vein and secondary veins
    vein_color = (
        min(255, leaf_color[0] + 30),
        min(255, leaf_color[1] + 35),
        min(255, leaf_color[2] + 20)
    )
    # Main midrib
    draw.line([width // 2, 20, width // 2, height - 20], fill=vein_color, width=3)
    # Lateral secondary veins
    for y in range(40, height - 40, 25):
        draw.line([width // 2, y, width // 2 - 70, y - 20], fill=vein_color, width=2)
        draw.line([width // 2, y, width // 2 + 70, y - 20], fill=vein_color, width=2)

    # 4. Disease-specific pathology manifestation
    if "Early_Blight" in disease_class:
        # Concentric dark-brown rings with chlorotic yellow halo
        for _ in range(random.randint(3, 7)):
            cx = random.randint(50, width - 50)
            cy = random.randint(50, height - 50)
            r = random.randint(18, 32)
            # Yellow halo
            draw.ellipse([cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 4], fill=(210, 190, 40))
            # Brown necrotic core
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(85, 45, 20))
            # Target rings
            draw.ellipse([cx - (r // 2), cy - (r // 2), cx + (r // 2), cy + (r // 2)], outline=(45, 25, 10), width=2)

    elif "Late_Blight" in disease_class:
        # Irregular water-soaked dark grayish lesions
        for _ in range(random.randint(2, 5)):
            cx = random.randint(40, width - 40)
            cy = random.randint(40, height - 40)
            rx = random.randint(25, 55)
            ry = random.randint(20, 45)
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(45, 50, 30))
            # White fuzzy edge sporulation simulation
            draw.arc([cx - rx, cy - ry, cx + rx, cy + ry], 0, 180, fill=(215, 225, 215), width=2)

    elif "Corn_Leaf_Blight" in disease_class:
        # Elongated cigar-shaped grayish-tan lesions parallel to veins
        for _ in range(random.randint(3, 6)):
            cx = random.randint(60, width - 60)
            cy = random.randint(50, height - 50)
            half_w = random.randint(8, 14)
            half_h = random.randint(35, 65)
            draw.ellipse([cx - half_w, cy - half_h, cx + half_w, cy + half_h], fill=(160, 145, 105))
            draw.ellipse([cx - (half_w // 2), cy - half_h + 10, cx + (half_w // 2), cy + half_h - 10], fill=(110, 95, 65))

    elif "Rice_Leaf_Disease" in disease_class:
        # Spindle diamond-shaped lesions with brown border and grayish centers
        for _ in range(random.randint(4, 8)):
            cx = random.randint(50, width - 50)
            cy = random.randint(40, height - 40)
            points = [
                (cx, cy - random.randint(20, 35)),
                (cx + random.randint(10, 18), cy),
                (cx, cy + random.randint(20, 35)),
                (cx - random.randint(10, 18), cy)
            ]
            draw.polygon(points, fill=(120, 60, 25), outline=(190, 180, 160))

    # Healthy leaves remain clean without necrotic lesions!

    # Subtle gaussian blur to blend textures naturally
    img = img.filter(ImageFilter.GaussianBlur(radius=0.8))
    return img


def create_starter_disease_dataset(target_dir: str = DATASET_ROOT):
    """Generates starter dataset structure across all splits and classes."""
    print(f"[Disease Dataset] Initializing dataset directory structure at: {target_dir}")
    os.makedirs(target_dir, exist_ok=True)

    # Generate instructions file
    readme_path = os.path.join(target_dir, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("""# Crop Disease Dataset Directory

This directory contains the dataset structure for the CROPWISE AI crop disease detection pipeline.

### Directory Structure
```
dataset/
├── train/
│   ├── Tomato_Early_Blight/
│   ├── Tomato_Late_Blight/
│   ├── Tomato_Healthy/
│   ├── Potato_Early_Blight/
│   ├── Potato_Late_Blight/
│   ├── Potato_Healthy/
│   ├── Corn_Leaf_Blight/
│   ├── Corn_Healthy/
│   ├── Rice_Leaf_Disease/
│   └── Rice_Healthy/
├── validation/
│   └── [same class subdirectories]
└── test/
    └── [same class subdirectories]
```

### Production Dataset Placement
To train a production-grade model:
1. Download a certified agricultural disease dataset (e.g., [PlantVillage on Kaggle](https://www.kaggle.com/datasets/emmarex/plantdisease) or USDA Agricultural Research Service datasets).
2. Place the respective JPEG/PNG images into their corresponding class folders under `train/`, `validation/`, and `test/`.
3. Recommended distribution: 70% train, 15% validation, 15% test.
4. Run `python ml/disease/train.py` to train MobileNetV2 with transfer learning.
""")

    for split_name, sample_count in SPLITS.items():
        split_dir = os.path.join(target_dir, split_name)
        for d_class in DISEASE_CLASSES:
            class_dir = os.path.join(split_dir, d_class)
            os.makedirs(class_dir, exist_ok=True)
            for i in range(sample_count):
                seed = hash((split_name, d_class, i)) % (2**32)
                img = generate_leaf_image(d_class, seed)
                file_path = os.path.join(class_dir, f"{d_class.lower()}_{i+1:03d}.jpg")
                img.save(file_path, "JPEG", quality=90)

    print(f"[Disease Dataset] Completed generating starter dataset across {len(DISEASE_CLASSES)} classes.")


if __name__ == "__main__":
    create_starter_disease_dataset()
