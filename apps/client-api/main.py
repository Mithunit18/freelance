from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import user_router
from config import settings

app = FastAPI(title="Client API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router.router)

@app.get("/")
def read_root():
    return {"message": "Client API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}