"""
API routes for session management.
Handles all session-related endpoints including chat, refinement, and session lifecycle.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import traceback

from creator_app.models.schemas import (
    SessionCreateResponse,
    ChatRequest,
    ChatResponse,
    SessionInfo,
    RefinementRequest
)
from creator_app.models.enums import SessionStatus
from creator_app.services.session_manager import session_manager

# Create router
router = APIRouter(prefix="/session", tags=["sessions"])


@router.post("/create", response_model=SessionCreateResponse)
async def create_session():
    """
    Create a new conversation session.
    Returns a unique session_id to use for subsequent requests.
    """
    try:
        session_id = session_manager.create_session()
        session = session_manager.get_session(session_id)

        if not session:
            raise HTTPException(status_code=500, detail="Failed to retrieve created session")

        # Get the initial greeting
        greeting = None
        if session["conversation_history"]:
            last_msg = session["conversation_history"][-1]
            if hasattr(last_msg, 'content'):
                greeting = last_msg.content

        return SessionCreateResponse(
            session_id=session_id,
            message="Session created successfully",
            greeting=greeting,
            status=session["state"]["status"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.post("/{session_id}/chat", response_model=ChatResponse)
async def chat(session_id: str, request: ChatRequest):
    """
    Send a message in an existing session.
    Handles intelligent conversation flow, requirement collection, and session closure.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    # Check if session is closed
    if session["state"]["status"] in [SessionStatus.CLOSED, SessionStatus.COMPLETED]:
        return ChatResponse(
            session_id=session_id,
            message=request.message,
            agent_response="This session has been closed. Please create a new session to continue.",
            conversation_length=len(session["conversation_history"]),
            session_status=session["state"]["status"],
            metadata={
                "close_reason": session["state"].get("close_reason"),
                "closed_at": session["state"].get("closed_at")
            }
        )

    try:
        # Validate message
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Add user message to history
        conversation_history = session["conversation_history"]
        conversation_history.append({"role": "user", "content": request.message})

        # Get agent response
        agent = session["agent"]
        response = agent.invoke({"messages": conversation_history})

        # Update session
        session_manager.update_session(session_id, response["messages"], request.message)

        # Extract agent's response
        agent_response = ""
        if response["messages"]:
            last_msg = response["messages"][-1]
            if hasattr(last_msg, 'content') and last_msg.content:
                agent_response = last_msg.content

        # Prepare metadata
        metadata = {
            "requirements_complete": session["state"].get("results_shown", False),
            "last_update": session["state"].get("last_update"),
            "message_count": session["message_count"]
        }

        # Check if response contains creator results (JSON delimiters)
        has_results = "<<<CREATORS_JSON_START>>>" in agent_response and "<<<CREATORS_JSON_END>>>" in agent_response

        # Return raw agent_response - frontend handles delimiter parsing
        return ChatResponse(
            session_id=session_id,
            message=request.message,
            agent_response=agent_response,  # Raw response with markers if present
            conversation_length=len(session["conversation_history"]),
            session_status=session["state"]["status"],
            has_results=has_results,
            metadata=metadata
        )

    except HTTPException:
        raise
    except Exception as e:
        error_details = {
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        print(f"❌ Error in chat endpoint: {error_details}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error processing message: {str(e)}",
                "error_type": type(e).__name__
            }
        )


@router.post("/{session_id}/refine")
async def refine_requirements(session_id: str, request: RefinementRequest):
    """
    Refine specific requirements after seeing results.
    Automatically triggers new search with updated criteria.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    if session["state"]["status"] != SessionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Cannot refine closed session")

    try:
        # Create refinement message
        refinement_msg = f"I'd like to change the {request.field} to {request.value}"

        # Process through chat endpoint
        chat_request = ChatRequest(message=refinement_msg)
        return await chat(session_id, chat_request)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refining requirements: {str(e)}")


@router.get("/{session_id}", response_model=SessionInfo)
async def get_session_info(session_id: str):
    """
    Get detailed information about a session including current requirements and state.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    return SessionInfo(
        session_id=session_id,
        created_at=session["created_at"].isoformat(),
        last_activity=session["last_activity"].isoformat(),
        conversation_length=len(session["conversation_history"]),
        message_count=session["message_count"],
        requirements=session["requirements"],
        state=session["state"],
        status=session["state"]["status"]
    )


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """
    Manually delete a session.
    """
    if session_manager.delete_session(session_id):
        return {
            "message": "Session deleted successfully",
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
    raise HTTPException(status_code=404, detail="Session not found")
