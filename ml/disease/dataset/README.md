# Crop Disease Dataset Directory

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
