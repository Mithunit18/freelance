from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import user_router
from routers import Auth
from config import settings
from routers import details_route
from routers import onboarding_route
from routers import pricing_route
from routers import portfolio_route
from routers import verification_route
from routers import creators_route
from routers import projects_route
from routers import payment_route
from routers import call_route
from routers import client_onboarding_route
from routers import bank_details_route
from routers import session_routes
from services.session_manager import session_manager


async def cleanup_task():
    """Background task to periodically clean up expired sessions."""
    while True:
        await asyncio.sleep(300)  # Run every 5 minutes
        session_manager.cleanup_expired_sessions()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Start the cleanup task
    task = asyncio.create_task(cleanup_task())
    yield
    # Shutdown: Cancel the cleanup task
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Client API", lifespan=lifespan)

# CORS
# trigger redeploy
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://freelance-client-web.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router.router)
app.include_router(Auth.router)
app.include_router(details_route.router)
app.include_router(onboarding_route.router)
app.include_router(pricing_route.router)
app.include_router(portfolio_route.router)
app.include_router(verification_route.router)
app.include_router(creators_route.router)
app.include_router(projects_route.router)
app.include_router(payment_route.router)
app.include_router(call_route.router)
app.include_router(client_onboarding_route.router)
app.include_router(bank_details_route.router)

# Creator recommendation chat routes
app.include_router(session_routes.router)

@app.get("/")
def read_root():
    return {"message": "Client API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/v1/stats")
def get_stats():
    """Get server statistics including active sessions."""
    return {
        "active_sessions": len(session_manager.sessions),
        "status": "running"
    }