"""
Main FastAPI application entry point for Creator Recommendation API.
Configures the app, middleware, routes, and lifecycle events.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import asyncio

from creator_app.core.config import settings
from creator_app.core.database import DATABASE
from creator_app.services.session_manager import SessionManager
from creator_app.routes import session_routes

# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="Creator Recommendation API",
    description="AI-powered creator matching system with intelligent session management",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize session manager
session_manager = SessionManager(
    session_timeout_minutes=settings.SESSION_TIMEOUT_MINUTES,
    max_conversation_length=settings.MAX_CONVERSATION_LENGTH
)

# Set session manager in routes
session_routes.set_session_manager(session_manager)

# Include routers
app.include_router(session_routes.router)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Creator Recommendation API",
        "version": "2.0.0",
        "features": [
            "Multi-user session management",
            "Intelligent session closure",
            "Requirement refinement",
            "Robust error handling",
            "Memory-efficient conversation tracking"
        ],
        "endpoints": {
            "create_session": "POST /session/create",
            "chat": "POST /session/{session_id}/chat",
            "refine": "POST /session/{session_id}/refine",
            "get_session": "GET /session/{session_id}",
            "delete_session": "DELETE /session/{session_id}",
            "stats": "GET /stats",
            "health": "GET /health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint with detailed stats."""
    stats = session_manager.get_session_stats()
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database_loaded": len(DATABASE.get("videographers", [])) > 0,
        "sessions": stats
    }


@app.get("/stats")
async def get_stats():
    """Get detailed API statistics."""
    stats = session_manager.get_session_stats()
    return {
        "timestamp": datetime.now().isoformat(),
        "sessions": stats,
        "database": {
            "videographers": len(DATABASE.get("videographers", [])),
            "photographers": len(DATABASE.get("photographers", [])),
            "editors": len(DATABASE.get("editors", []))
        }
    }


@app.post("/admin/cleanup")
async def cleanup_sessions():
    """Admin endpoint to cleanup expired sessions."""
    try:
        expired_count = session_manager.cleanup_expired_sessions()
        stats = session_manager.get_session_stats()

        return {
            "message": "Cleanup completed successfully",
            "expired_sessions_removed": expired_count,
            "current_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "timestamp": datetime.now().isoformat()
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler for unexpected errors."""
    return {
        "error": "Internal server error",
        "detail": str(exc),
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# BACKGROUND TASKS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize background tasks."""
    print("🚀 Creator Recommendation API Starting...")
    print(f"📊 Database loaded: {len(DATABASE.get('videographers', []))} videographers, "
          f"{len(DATABASE.get('photographers', []))} photographers, "
          f"{len(DATABASE.get('editors', []))} editors")

    async def periodic_cleanup():
        """Run cleanup every 5 minutes."""
        while True:
            await asyncio.sleep(300)
            try:
                expired = session_manager.cleanup_expired_sessions()
                if expired > 0:
                    print(f"🧹 Cleaned up {expired} expired sessions")
            except Exception as e:
                print(f"⚠️  Cleanup error: {str(e)}")

    asyncio.create_task(periodic_cleanup())
    print("✅ API Ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print("👋 API Shutting down...")
    stats = session_manager.get_session_stats()
    print(f"📊 Final stats: {stats}")


# ============================================================================
# RUN APPLICATION
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL,
        access_log=True
    )
