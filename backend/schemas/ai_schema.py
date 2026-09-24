"""
CROPWISE AI - Pydantic Schemas for Conversational Agriculture AI Assistant
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text content")
    timestamp: Optional[str] = Field(None, description="ISO timestamp or formatted time")


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1, description="Conversation history")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Client-side agronomic context")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Assistant response text")
    status: str = Field("success", description="'success', 'warning', 'error', or 'unconfigured'")
    referenced_data: Optional[Dict[str, Any]] = Field(None, description="Real application data used in answer")
    suggestions: Optional[List[str]] = Field(default_factory=list, description="Follow-up quick action prompts")


class AIContextResponse(BaseModel):
    latest_disease_scan: Optional[Dict[str, Any]] = None
    latest_yield_prediction: Optional[Dict[str, Any]] = None
    farm_settings: Optional[Dict[str, Any]] = None
    is_ai_configured: bool = False
    ai_model: str = "gpt-4o-mini"
