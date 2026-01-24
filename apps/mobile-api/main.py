from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import user_router
from config import settings

app = FastAPI(title="Mobile API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router.router)

@app.get("/")
def read_root():
    return {"message": "Mobile API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}