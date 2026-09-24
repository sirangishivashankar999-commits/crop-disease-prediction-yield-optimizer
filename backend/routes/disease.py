"""
CROPWISE AI - Crop Disease API Endpoints
Handles image upload, format validation, transfer-learning inference, and diagnostic history.
"""

import io
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from sqlalchemy.orm import Session
from PIL import Image

from backend.database import get_db
from backend.models.db_models import DiseasePredictionLog
from backend.schemas.disease_schema import DiseasePredictionResponse, DiseaseClassItem
from backend.services.disease_service import (
    execute_disease_prediction,
    is_disease_model_ready,
    get_all_disease_classes,
)
from ml.disease.preprocess import SUPPORTED_EXTENSIONS

router = APIRouter(prefix="/disease", tags=["Crop Disease Detection"])


@router.post(
    "/predict",
    response_model=DiseasePredictionResponse,
    summary="Detect crop disease from uploaded leaf image"
)
async def predict_disease_endpoint(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts crop/leaf image, performs PyTorch MobileNetV2 inference,
    and returns predicted disease, confidence, severity, symptoms, and treatment.
    """
    # 1. Check ML Model Availability
    if not is_disease_model_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "ML model unavailable: The Crop Disease PyTorch model weights have not been generated yet. "
                "Please run 'python ml/disease/train.py' or 'python bootstrap_models.py' to train and save the model."
            )
        )

    # 2. Validate File Format
    filename = image.filename or "uploaded_leaf.jpg"
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{ext}'. Allowed formats: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    # 3. Read and Validate Image Content
    try:
        contents = await image.read()
        if len(contents) > 15 * 1024 * 1024:  # 15 MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image file size exceeds maximum limit of 15MB."
            )
        pil_img = Image.open(io.BytesIO(contents))
        pil_img.verify()  # Verify integrity
        # Re-open after verify() closes it
        pil_img = Image.open(io.BytesIO(contents))
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image file: {str(err)}"
        )

    # 4. Run Real PyTorch Inference
    try:
        result = execute_disease_prediction(
            image=pil_img,
            filename=filename,
            db=db,
            file_bytes=contents
        )
        return result
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(fnf))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error encountered during model inference: {str(e)}"
        )


@router.get("/classes", response_model=List[DiseaseClassItem], summary="List all supported disease classes")
def list_disease_classes():
    """Returns directory of all detectable disease categories."""
    return get_all_disease_classes()


@router.get("/history", summary="Get recent disease diagnostic logs")
def get_disease_history(limit: int = 15, db: Session = Depends(get_db)):
    """Fetches recently logged leaf scans."""
    records = (
        db.query(DiseasePredictionLog)
        .order_by(DiseasePredictionLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "crop": r.crop,
            "disease": r.predicted_disease,
            "confidence": r.confidence,
            "severity": r.severity,
            "is_valid": r.is_real_ml,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "N/A"
        }
        for r in records
    ]
