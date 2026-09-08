# Crop Yield Dataset

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
