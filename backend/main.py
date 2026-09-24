"""
CROPWISE AI - FastAPI Backend Application
Tagline: "Grow Smarter. Harvest Better."
Provides high-performance REST APIs for Computer Vision disease diagnosis,
multi-model yield optimization, weather monitoring, and agronomic analytics.
"""

import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Ensure project root in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.database import init_db
from backend.routes.disease import router as disease_router
from backend.routes.yield_prediction import router as yield_router
from backend.routes.weather import router as weather_router
from backend.routes.insights import router as insights_router
from backend.routes.recommendations import router as recommendations_router
from backend.routes.model_status import router as model_status_router
from backend.routes.ai import router as ai_router
from backend.services.disease_service import is_disease_model_ready
from backend.services.yield_service import is_yield_model_ready


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQLite database tables and verifies ML model checkpoints on boot."""
    print("=" * 70)
    print("   Starting CROPWISE AI FastAPI Backend Service...")
    print("=" * 70)
    init_db()
    print("[Database] SQLite database tables initialized.")

    d_status = "LOADED" if is_disease_model_ready() else "NOT FOUND (Run training to generate)"
    y_status = "LOADED" if is_yield_model_ready() else "NOT FOUND (Run training to generate)"
    print(f"[ML Status] Crop Disease Model : {d_status}")
    print(f"[ML Status] Crop Yield Model   : {y_status}")
    print("=" * 70)
    yield
    print("[Shutdown] CROPWISE AI backend shutting down gracefully.")


app = FastAPI(
    title="CROPWISE AI API",
    description="Predictive Crop Disease & Yield Optimizer using Machine Learning",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite default is 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(disease_router, prefix="/api")
app.include_router(yield_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(insights_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(model_status_router, prefix="/api")
app.include_router(ai_router, prefix="/api")


FRONTEND_DIST = os.path.abspath(os.path.join(PROJECT_ROOT, "frontend", "dist"))
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

# Mount static assets if build exists
if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


@app.get("/api", tags=["Root"])
def api_root_endpoint():
    return {
        "status": "healthy",
        "endpoints": [
            "/api/disease/predict",
            "/api/disease/classes",
            "/api/disease/history",
            "/api/yield/predict",
            "/api/yield/models-comparison",
            "/api/weather",
            "/api/farm/insights",
            "/api/recommendations",
            "/api/model/status"
        ]
    }


@app.get("/", tags=["Frontend"])
def serve_frontend_root():
    """Serves the main React web application."""
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "app": "CROPWISE AI",
        "tagline": "Grow Smarter. Harvest Better.",
        "project": "Predictive Crop Disease & Yield Optimizer",
        "status": "online",
        "docs_url": "/docs",
        "api_prefix": "/api"
    }


@app.get("/{full_path:path}", tags=["Frontend"])
def serve_frontend_spa(full_path: str):
    """Fallback handler to support client-side React Router navigation."""
    # Never intercept API or OpenAPI docs routes
    if (
        full_path.startswith("api") or
        full_path.startswith("docs") or
        full_path.startswith("openapi.json") or
        full_path.startswith("redoc")
    ):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Not Found"}
        )

    # If an exact static file exists in dist (e.g. favicon.svg, vite.svg)
    candidate_file = os.path.join(FRONTEND_DIST, full_path)
    if os.path.isfile(candidate_file):
        return FileResponse(candidate_file)

    # SPA routing fallback: serve index.html for React Router (/disease, /yield, etc.)
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Not Found"}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Provides structured, user-friendly JSON error responses."""
    print(f"[Unhandled Server Error]: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "endpoint": str(request.url)
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
