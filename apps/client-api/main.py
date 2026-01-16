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

app = FastAPI(title="Client API")

# CORS
# trigger redeploy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

@app.get("/")
def read_root():
    return {"message": "Client API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}