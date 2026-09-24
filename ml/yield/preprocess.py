"""
CROPWISE AI - Yield Prediction Data Preprocessing Pipeline
Provides feature definitions, imputation, one-hot encoding, and scaling transformers.
"""

from typing import List, Tuple, Dict, Any
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

CATEGORICAL_FEATURES: List[str] = [
    "crop",
    "location",
    "soil_type",
    "growing_season"
]

NUMERICAL_FEATURES: List[str] = [
    "ph",
    "temperature",
    "rainfall",
    "humidity",
    "irrigation",
    "fertilizer",
    "previous_yield",
    "area",
    "n_content",
    "p_content",
    "k_content"
]

TARGET_COLUMN: str = "yield"

ALL_INPUT_FEATURES: List[str] = CATEGORICAL_FEATURES + NUMERICAL_FEATURES


def build_preprocessor() -> ColumnTransformer:
    """
    Constructs a robust ColumnTransformer that:
    1. Imputes missing numeric values with the median and scales them with StandardScaler
    2. Imputes missing categorical values with the mode and one-hot encodes them
    """
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )
    return preprocessor


def prepare_input_dataframe(data_dict: Dict[str, Any]) -> pd.DataFrame:
    """
    Validates and formats a single observation dictionary into a 1-row Pandas DataFrame.
    Supplies sensible default medians if optional NPK or secondary factors are omitted.
    """
    raw_season = str(data_dict.get("growing_season", "Kharif")).strip()
    season_mapping = {
        "Monsoon": "Kharif",
        "Winter": "Rabi",
        "Summer": "Summer",
        "Spring": "Spring",
        "Autumn": "Autumn",
        "monsoon": "Kharif",
        "winter": "Rabi",
        "summer": "Summer",
        "spring": "Spring",
        "autumn": "Autumn",
        "Kharif (Monsoon)": "Kharif",
        "Rabi (Winter)": "Rabi",
        "Summer (Zaid)": "Summer",
        "Kharif": "Kharif",
        "Rabi": "Rabi",
    }
    normalized_season = season_mapping.get(raw_season, raw_season)

    row = {
        "crop": str(data_dict.get("crop", "Wheat")),
        "location": str(data_dict.get("location", "Midwest")),
        "soil_type": str(data_dict.get("soil_type", "Loamy")),
        "growing_season": normalized_season,
        "ph": float(data_dict.get("ph", 6.5)),
        "temperature": float(data_dict.get("temperature", 24.0)),
        "rainfall": float(data_dict.get("rainfall", 800.0)),
        "humidity": float(data_dict.get("humidity", 65.0)),
        "irrigation": float(data_dict.get("irrigation", 400.0)),
        "fertilizer": float(data_dict.get("fertilizer", 120.0)),
        "previous_yield": float(data_dict.get("previous_yield", 3.5)),
        "area": float(data_dict.get("area", 5.0)),
        "n_content": float(data_dict.get("n_content", 90.0)),
        "p_content": float(data_dict.get("p_content", 45.0)),
        "k_content": float(data_dict.get("k_content", 50.0)),
    }
    return pd.DataFrame([row])
