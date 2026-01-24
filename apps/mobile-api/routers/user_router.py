from fastapi import APIRouter, HTTPException
from models.user import UserResponse
from services.user_service import user_service

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
def get_current_user():
    """Get current mobile user greeting"""
    try:
        user = user_service.get_user_by_id(1)
        greeting = user_service.get_greeting(user.name)
        return UserResponse(name=user.name, message=greeting)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
def get_user(user_id: int):
    """Get user by ID"""
    user = user_service.get_user_by_id(user_id)
    return user