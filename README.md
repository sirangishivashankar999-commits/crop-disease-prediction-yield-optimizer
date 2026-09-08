# CROPWISE AI 🌿
### *Grow Smarter. Harvest Better.*

**Predictive Crop Disease & Yield Optimizer using Machine Learning**

---

## 1. Project Overview

**CROPWISE AI** is a full-stack, enterprise-grade agricultural intelligence platform built to assist farmers, agronomists, and agribusiness operators in detecting foliar crop diseases early and maximizing harvest yield through machine learning.

Unlike purely decorative UI dashboards, CROPWISE AI is engineered as a **genuine machine learning application** where:
- Image diagnostics are executed through a real deep learning **PyTorch MobileNetV2** transfer learning classifier.
- Harvest yield projections are computed by a multi-model **scikit-learn / XGBoost** tournament regression pipeline with feature explainability.
- A high-performance **FastAPI** backend serves typed REST endpoints with SQLite/PostgreSQL persistence.
- A modern **React 18 + Vite** SaaS frontend delivers responsive telemetry charts, interactive simulators, and real-time model status badges.

---

## 2. Key Features

- 🔬 **Crop Disease Computer Vision**:
  - Image validation, resizing (224x224), ImageNet normalization, and data augmentation.
  - Detects 10 classes across Tomato, Potato, Corn, and Rice.
  - Outputs top-3 class probabilities, confidence percentage, severity level, symptoms, immediate treatments, and long-term prevention protocols.
  - Transparent model status handling: alerts user if model checkpoint requires training.

- 📈 **Multi-Model Yield Optimizer**:
  - Predicts yield (tons/acre) and total tonnage from 14 agronomic parameters (Crop, Area, Soil pH, Temp, Rainfall, Humidity, Irrigation, Fertilizer, Historical Yield, NPK).
  - Multi-model tournament comparing **Linear Regression (Baseline)**, **Random Forest Regressor**, and **Gradient Boosting / XGBoost** on MAE, RMSE, and $R^2$.
  - Computes a 0–100 **Productivity Score** and assigns a **Risk Level** (Low, Moderate, High).
  - **Feature Explainability**: Top contributing factors and feature importance breakdown chart.
  - Prescribes dynamic agronomic recommendations (liming, deficit irrigation, nutrient top-dressing).

- 📊 **Farm Analytics & Insights**:
  - Multi-season historical vs. predicted harvest trends.
  - Acreage allocation breakdown and crop health indexes.
  - Soil fertility radar analysis (pH, N, P, K, Organic Carbon, Microbial activity).
  - Irrigation efficiency by sector (applied mm vs. baseline demand).
  - Filtering by crop, location, and season.

- 🌦️ **Agro-Meteorological Monitoring**:
  - Current ambient temperature, humidity, 24h precipitation, wind speed/direction, and solar radiation.
  - Agro-climatic disease risk indicator.
  - 7-day meteorological forecast with rain probabilities and diurnal temperature shifts.
  - Modular design ready for external API integration (OpenWeatherMap, Tomorrow.io).

- 💧 **Soil & Automated Irrigation Engine**:
  - Real-time soil moisture tensiometer monitoring (optimal 28%–40% safe band).
  - Interactive simulator sliders for soil pH, moisture, and N-P-K balance.
  - Automated irrigation schedule calculator (calculates required pump runtimes in minutes and application depth in mm).

- 💡 **Contextual Advisory Feed**:
  - Prioritized recommendations (Critical, Warning, Advisory) triggered dynamically by ML predictions, low soil moisture, or pH imbalances.
  - Interactive standard operating procedure checklist.

- ⚙️ **Enterprise Configuration**:
  - Farm profile and acre management.
  - Metric vs. Imperial units toggle.
  - Live ML engine telemetry and FastAPI gateway connectivity tester.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript (ES Modules), HTML5, Modern CSS Design System, Lucide React Icons, Recharts |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy, SQLite (PostgreSQL-ready), python-multipart, httpx |
| **Machine Learning** | PyTorch 2.x, Torchvision, Scikit-learn, XGBoost, Pandas, NumPy, Pillow, Joblib |
| **Serialization** | `.pt` (PyTorch Checkpoint), `.joblib` (Champion Pipeline Bundle), `.json` (Metadata & Metrics) |

---

## 4. Project Folder Structure

```
cropwise-ai/
├── backend/
│   ├── main.py                     # FastAPI application entrypoint & CORS
│   ├── database.py                 # SQLite/PostgreSQL connection engine
│   ├── requirements.txt            # Backend dependencies
│   ├── models/
│   │   └── db_models.py            # SQLAlchemy tables (predictions, settings)
│   ├── schemas/
│   │   ├── disease_schema.py       # Pydantic schemas for disease detection
│   │   ├── yield_schema.py         # Pydantic schemas for yield optimizer
│   │   └── common_schema.py        # Schemas for weather, insights, status
│   ├── services/
│   │   ├── disease_service.py      # Disease model loader & predictor
│   │   ├── yield_service.py        # Yield regressor loader & tournament
│   │   ├── weather_service.py      # Modular agro-meteorological service
│   │   ├── insights_service.py     # Analytical metrics aggregator
│   │   └── recommendations_service.py # Dynamic agronomic advisory engine
│   └── routes/
│       ├── disease.py              # POST /api/disease/predict, /history
│       ├── yield_prediction.py     # POST /api/yield/predict, /models-comparison
│       ├── weather.py              # GET /api/weather
│       ├── insights.py             # GET /api/farm/insights
│       ├── recommendations.py      # GET /api/recommendations
│       └── model_status.py         # GET /api/model/status
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # Collapsible SaaS navigation
│   │   │   ├── Header.jsx          # Farm selector & live status
│   │   │   ├── MetricCard.jsx      # Reusable KPI card
│   │   │   └── ModelStatusBanner.jsx # Real ML transparency banner
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main executive overview
│   │   │   ├── DiseaseDetection.jsx# Leaf image upload & pathology report
│   │   │   ├── YieldOptimizer.jsx  # Supervised yield optimizer form & explainability
│   │   │   ├── FarmInsights.jsx    # Historical charts & radar analysis
│   │   │   ├── WeatherPage.jsx     # 7-day agro-weather & risk
│   │   │   ├── SoilIrrigation.jsx  # Moisture simulator & irrigation calculator
│   │   │   ├── RecommendationsPage.jsx # Prioritized agronomic protocols
│   │   │   └── SettingsPage.jsx    # Profiles & ML telemetry
│   │   ├── services/
│   │   │   └── api.js              # Centralized fetch API client
│   │   ├── App.jsx                 # App root & tab controller
│   │   ├── main.jsx                # React root mount
│   │   └── index.css               # Agriculture SaaS design tokens
│   ├── package.json
│   ├── vite.config.js              # Vite config with /api proxy
│   └── index.html
│
├── ml/
│   ├── disease/
│   │   ├── dataset/                # train/, validation/, test/ folders
│   │   ├── dataset_generator.py    # Starter dataset generator
│   │   ├── preprocess.py           # Normalization & transforms
│   │   ├── train.py                # MobileNetV2 transfer learning training
│   │   ├── evaluate.py             # Test set accuracy & confusion matrix
│   │   ├── predict.py              # Inference pipeline
│   │   └── model/                  # crop_disease_model.pt & metadata
│   │
│   ├── yield/
│   │   ├── dataset/                # yield_data.csv
│   │   ├── dataset_generator.py    # 1,500-sample agricultural generator
│   │   ├── preprocess.py           # OneHotEncoder & StandardScaler
│   │   ├── train.py                # Multi-model tournament (Linear vs RF vs GB)
│   │   ├── evaluate.py             # Model comparison & explainability
│   │   ├── predict.py              # Supervised inference & advice engine
│   │   └── model/                  # yield_best_model.joblib & metadata
│   └── requirements.txt
│
├── data/
│   └── sample/
│       └── sample_yield_dataset.csv
│
├── bootstrap_models.py             # 1-click script to generate data & train both models
├── README.md
└── .gitignore
```

---

## 5. Step-by-Step Installation (Windows PowerShell)

### Prerequisites
- **Python 3.10+ or 3.11** installed.
- **Node.js v18+** and **npm** installed.

---

### Step 1: Create Python Virtual Environment
Open PowerShell in the project root directory:
```powershell
# Navigate to project root
cd "c:\Users\pavan\OneDrive\Desktop\crop disease projest"

# Create a clean virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
```

---

### Step 2: Install Python & ML Dependencies
```powershell
# Upgrade pip
python -m pip install --upgrade pip

# Install backend core packages
pip install -r backend/requirements.txt

# Install PyTorch & torchvision (CPU build)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

---

### Step 3: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

## 6. One-Click Bootstrap (Dataset & Model Training)

To generate starter agricultural datasets and train both ML models locally:

```powershell
# Ensure venv is active
.\venv\Scripts\Activate.ps1

# Run the complete bootstrap script
python bootstrap_models.py
```

What this does:
1. Generates 1,500 realistic agricultural observations in `ml/yield/dataset/yield_data.csv`.
2. Runs the multi-model tournament (Linear Regression, Random Forest, Gradient Boosting), selects the champion based on $R^2$, and saves `ml/yield/model/yield_best_model.joblib`.
3. Creates starter leaf image datasets across 10 disease classes in `ml/disease/dataset/`.
4. Trains MobileNetV2 with transfer learning and saves `ml/disease/model/crop_disease_model.pt`.

---

## 7. Standalone Training & Evaluation Commands

You can train and evaluate each model independently:

### Crop Yield Regressor:
```powershell
# Train candidate models & select champion
python ml/yield/train.py

# Inspect benchmark comparison & explainability
python ml/yield/evaluate.py
```

### Crop Disease Detection:
```powershell
# Train MobileNetV2 classifier
python ml/disease/train.py

# Evaluate test-set accuracy, precision, recall & confusion matrix
python ml/disease/evaluate.py
```

---

## 8. Running the Application

Open **two** PowerShell terminal windows:

### Terminal 1: Start FastAPI Backend
```powershell
cd "c:\Users\pavan\OneDrive\Desktop\crop disease projest"
.\venv\Scripts\Activate.ps1
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at: `http://127.0.0.1:8000`*  
*Swagger Documentation: `http://127.0.0.1:8000/docs`*

### Terminal 2: Start React Frontend
```powershell
cd "c:\Users\pavan\OneDrive\Desktop\crop disease projest\frontend"
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

Open your browser and navigate to **`http://localhost:5173`**.

---

## 9. API Endpoints Specification

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/disease/predict` | Upload leaf image (multipart/form-data) -> returns predicted disease, confidence, severity, symptoms, and treatment |
| `GET` | `/api/disease/classes` | Directory of 10 detectable disease categories |
| `GET` | `/api/disease/history` | Historical leaf diagnostics logged to SQLite database |
| `POST` | `/api/yield/predict` | Input 14 agronomic parameters -> returns yield/acre, total tonnage, score, risk, and explainability factors |
| `GET` | `/api/yield/models-comparison` | Benchmark metrics (MAE, RMSE, $R^2$) across Linear Regression, Random Forest, and Gradient Boosting |
| `GET` | `/api/weather` | Current temperature, humidity, rainfall, wind, solar radiation, and 7-day forecast |
| `GET` | `/api/farm/insights` | Farm KPIs, historical vs. predicted trends, crop distribution, and active alerts |
| `GET` | `/api/recommendations` | Dynamically formulated agronomic action items based on field readings and ML outputs |
| `GET` | `/api/model/status` | Real-time health status of both PyTorch and Regressor models |

---

## 10. Replacing Models with Custom Datasets

### A. Replacing the Disease Detection Dataset:
1. Download a certified agricultural leaf dataset (e.g., [PlantVillage on Kaggle](https://www.kaggle.com/datasets/emmarex/plantdisease)).
2. Place images into their respective folders under `ml/disease/dataset/train/`, `validation/`, and `test/` (e.g., `Tomato_Early_Blight`, `Tomato_Healthy`, etc.).
3. Run `python ml/disease/train.py` with custom epochs (e.g., `epochs=15`). The new weights will automatically save to `crop_disease_model.pt`.

### B. Replacing the Yield Dataset:
1. Prepare your historical farm harvest logbook adhering to:
   ```csv
   crop,location,soil_type,growing_season,ph,temperature,rainfall,humidity,irrigation,fertilizer,previous_yield,area,n_content,p_content,k_content,yield
   ```
2. Save as `ml/yield/dataset/yield_data.csv`.
3. Run `python ml/yield/train.py`. The tournament will re-evaluate all regressors, select the new champion, and save it to `yield_best_model.joblib`.

---

## 11. Production Deployment

### Production Backend (Uvicorn / Gunicorn):
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Production Frontend Build:
```bash
cd frontend
npm run build
```
The compiled static assets will be located in `frontend/dist/` ready to be served by Nginx or CDN.

### Database Migration:
To switch from SQLite to PostgreSQL, set the environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/cropwise_db"
```
SQLAlchemy will automatically configure the PostgreSQL connection pool.

---

## 12. License & Agricultural Advisory Notice

> [!NOTE]
> CROPWISE AI is designed as a decision-support platform for agricultural producers.
> Chemical dosages and fungicide protocols must comply with registered product label instructions and local agricultural extension guidance.
