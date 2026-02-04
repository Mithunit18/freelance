from pydantic import BaseModel
from typing import List, Optional


class ClientOnboardingRequest(BaseModel):
    """Request model for client onboarding submission"""
    full_name: str
    phone_number: str
    gender: str
    date_of_birth: str
    profile_photo: str
    address: str
    city: str
    state: str
    pincode: str
    occupation: str
    company_name: Optional[str] = None
    preferred_categories: Optional[List[str]] = []


class ClientOnboardingResponse(BaseModel):
    """Response model for client onboarding"""
    message: str
    user_id: str
    onboarding_completed: bool = True


class ClientProfileUpdateRequest(BaseModel):
    """Request model for updating client profile"""
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    profile_photo: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    occupation: Optional[str] = None
    company_name: Optional[str] = None
    preferred_categories: Optional[List[str]] = None
