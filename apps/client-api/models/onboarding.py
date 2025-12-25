from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class OnboardingStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class CreatorOnboardingState(BaseModel):
    user_id: str
    status: OnboardingStatus = OnboardingStatus.NOT_STARTED
    current_step: int = 0
    portfolio_completed: bool = False
    pricing_completed: bool = False
    details_completed: bool = False
    verification_completed: bool = False
    profile_live: bool = False
