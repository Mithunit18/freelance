"""
Pydantic models for request/response schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from .enums import SessionStatus


class SessionCreateResponse(BaseModel):
    """Response model for session creation."""
    session_id: str
    message: str
    greeting: Optional[str] = None
    status: str = SessionStatus.ACTIVE


class ChatRequest(BaseModel):
    """Request model for chat messages."""
    message: str


class ChatResponse(BaseModel):
    """Response model for chat messages."""
    session_id: str
    message: str
    agent_response: str
    conversation_length: int
    session_status: str
    has_results: bool = False  # True if agent_response contains JSON delimiters
    metadata: Dict = Field(default_factory=dict)


class SessionInfo(BaseModel):
    """Response model for session information."""
    session_id: str
    created_at: str
    last_activity: str
    conversation_length: int
    message_count: int
    requirements: Dict
    state: Dict
    status: str


class RefinementRequest(BaseModel):
    """Request model for requirement refinement."""
    field: str
    value: Any


class ErrorResponse(BaseModel):
    """Response model for errors."""
    error: str
    detail: str
    timestamp: str
