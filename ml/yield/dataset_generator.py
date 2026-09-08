"""
CROPWISE AI - Starter Dataset Generator for Crop Yield Prediction
Generates a realistic multi-factorial CSV dataset (1,500+ rows) based on
agronomic production functions (pH response, water balance, NPK response, and crop baselines).
"""

import os
import random
import pandas as pd
import numpy as np

DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset", "yield_data.csv")

CROPS = ["Rice", "Wheat", "Corn", "Potato", "Tomato", "Soybean", "Cotton"]
LOCATIONS = ["Central Valley", "Midwest", "Southeast", "Great Plains", "Delta Region", "Pacific Northwest"]
SOIL_TYPES = ["Loamy", "Clay", "Sandy Loam", "Silt Loam", "Black Soil", "Alluvial"]
SEASONS = ["Kharif", "Rabi", "Summer", "Spring", "Autumn"]

# Typical potential yield baselines (tons / acre)
CROP_BASE_YIELD = {
    "Rice": 3.8,
    "Wheat": 3.2,
    "Corn": 4.6,
    "Potato": 14.5,
    "Tomato": 18.0,
    "Soybean": 2.2,
    "Cotton": 1.8
}

def generate_yield_dataset(num_samples: int = 1500, output_path: str = DATASET_PATH) -> str:
    """Creates a high-variance, realistic agricultural dataset for yield modeling."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    random.seed(42)
    np.random.seed(42)

    data = []

    for _ in range(num_samples):
        crop = random.choice(CROPS)
        location = random.choice(LOCATIONS)
        soil_type = random.choice(SOIL_TYPES)
        season = random.choice(SEASONS)

        area = round(random.uniform(1.0, 50.0), 1)  # acres
        ph = round(random.uniform(5.2, 8.2), 2)
        temp = round(random.uniform(16.0, 36.0), 1)  # Celsius
        rainfall = round(random.uniform(350.0, 1800.0), 1)  # mm
        humidity = round(random.uniform(40.0, 90.0), 1)  # %
        irrigation = round(random.uniform(100.0, 900.0), 1)  # mm
        fertilizer = round(random.uniform(50.0, 280.0), 1)  # kg / acre

        # Primary nutrients (kg / hectare)
        n_content = round(random.uniform(40.0, 180.0), 1)
        p_content = round(random.uniform(15.0, 85.0), 1)
        k_content = round(random.uniform(20.0, 120.0), 1)

        base_y = CROP_BASE_YIELD[crop]
        prev_yield = round(np.clip(np.random.normal(base_y, base_y * 0.15), base_y * 0.5, base_y * 1.5), 2)

        # Agronomic yield calculation simulation (with non-linear penalties)
        # 1. Soil pH penalty (Optimal pH: 6.2 - 7.2)
        ph_factor = 1.0 - (0.18 * abs(ph - 6.6) ** 1.3)
        ph_factor = max(0.65, ph_factor)

        # 2. Water availability (Rainfall + Irrigation)
        total_water = rainfall + irrigation
        # Optimal water range: 900 - 1600 mm
        if total_water < 800:
            water_factor = 0.70 + (total_water / 800.0) * 0.25
        elif total_water > 1900:
            water_factor = 0.85  # Waterlogging penalty
        else:
            water_factor = 1.05

        # 3. Fertilizer diminishing returns (Mitscherlich-Baule law approximation)
        fert_factor = 0.75 + 0.35 * (1.0 - np.exp(-fertilizer / 110.0))

        # 4. Temperature stress factor
        if crop in ["Wheat", "Potato"]:
            # Cool season crops
            temp_factor = 1.05 if temp < 25.0 else 0.82
        else:
            # Warm season crops (Corn, Rice, Tomato, Cotton, Soybean)
            temp_factor = 1.05 if (22.0 <= temp <= 32.0) else 0.88

        # 5. Soil factor
        soil_mult = {
            "Loamy": 1.08,
            "Alluvial": 1.07,
            "Silt Loam": 1.03,
            "Black Soil": 1.04,
            "Clay": 0.94,
            "Sandy Loam": 0.91
        }.get(soil_type, 1.0)

        # Combined synthetic yield with natural noise
        pred_yield = (
            base_y * 0.35
            + prev_yield * 0.40
            + (base_y * 0.25 * ph_factor * water_factor * fert_factor * temp_factor * soil_mult)
        )
        noise = np.random.normal(0, base_y * 0.04)
        final_yield = round(float(np.clip(pred_yield + noise, base_y * 0.4, base_y * 1.65)), 2)

        data.append({
            "crop": crop,
            "location": location,
            "soil_type": soil_type,
            "growing_season": season,
            "ph": ph,
            "temperature": temp,
            "rainfall": rainfall,
            "humidity": humidity,
            "irrigation": irrigation,
            "fertilizer": fertilizer,
            "previous_yield": prev_yield,
            "area": area,
            "n_content": n_content,
            "p_content": p_content,
            "k_content": k_content,
            "yield": final_yield,
        })

    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"[Yield Dataset] Generated {len(df)} sample rows to: {output_path}")

    # Instructions readme
    readme_path = os.path.join(os.path.dirname(output_path), "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("""# Crop Yield Dataset

This directory stores the supervised tabular dataset for training the multi-model Crop Yield Optimizer.

### Target Format (`yield_data.csv`)
Columns:
- `crop`: Name of crop (e.g., Rice, Wheat, Corn, Potato, Tomato, Soybean, Cotton)
- `location`: Agro-climatic zone or region
- `soil_type`: Dominant soil classification (Loamy, Clay, Sandy Loam, etc.)
- `growing_season`: Planting season (Kharif, Rabi, Summer, Spring, Autumn)
- `ph`: Soil pH level (0.0 - 14.0)
- `temperature`: Mean growing temperature in Celsius
- `rainfall`: Total seasonal precipitation in mm
- `humidity`: Mean relative humidity in %
- `irrigation`: Artificial irrigation volume applied in mm
- `fertilizer`: Chemical/organic fertilizer dosage in kg/acre
- `previous_yield`: Historical yield in tons/acre
- `area`: Cultivated area in acres
- `n_content`: Available Nitrogen in kg/ha
- `p_content`: Available Phosphorus in kg/ha
- `k_content`: Available Potassium in kg/ha
- `yield`: Actual harvested yield in tons/acre (Target variable)

### Using Real-World Field Data
Replace `yield_data.csv` with your own farm logbook or municipal harvest datasets adhering to this schema, then run:
```powershell
python ml/yield/train.py
```
""")

    return output_path


if __name__ == "__main__":
    generate_yield_dataset()
