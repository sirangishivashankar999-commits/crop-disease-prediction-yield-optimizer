"""
CROPWISE AI - Conversational Agriculture Assistant API Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas.ai_schema import ChatRequest, ChatResponse, AIContextResponse
from backend.services.ai_service import (
    execute_chat,
    get_ai_config,
    get_latest_disease_scan,
    get_latest_yield_prediction,
    get_farm_settings,
)

router = APIRouter(prefix="/ai", tags=["CropWise AI Conversational Assistant"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with CropWise AI agriculture assistant"
)
async def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Receives conversational chat messages and returns agriculture-specific,
    grounded responses using real leaf scan and yield prediction telemetry.
    """
    response = await execute_chat(
        messages=request.messages,
        db=db,
        client_context=request.context
    )
    return response


@router.get(
    "/context",
    response_model=AIContextResponse,
    summary="Get current real application telemetry for AI assistant"
)
def get_ai_context_endpoint(db: Session = Depends(get_db)):
    """
    Returns the latest authentic leaf disease diagnosis, yield forecast,
    and server AI configuration status.
    """
    config = get_ai_config()
    disease_data = get_latest_disease_scan(db)
    yield_data = get_latest_yield_prediction(db)
    farm_data = get_farm_settings(db)

    return AIContextResponse(
        latest_disease_scan=disease_data,
        latest_yield_prediction=yield_data,
        farm_settings=farm_data,
        is_ai_configured=config["is_configured"],
        ai_model=config["model"]
    )
