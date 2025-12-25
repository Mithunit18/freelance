from pydantic import BaseModel
from typing import Optional
from enum import Enum

class VerificationType(str, Enum):
    AADHAAR = "aadhaar"
    PAN = "pan"
    ID_CARD = "id_card"
    SOCIAL_LINKS = "social_links"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

# models/verification.py

# models/verification.py
class VerificationRequest(BaseModel):
    user_id: Optional[str] = None
    verification_type: VerificationType  # Must be "id_card" or "social_links" etc.
    document_url: str  # The URL returned from the upload-document endpoint

class VerificationResponse(BaseModel):
    message: str
    user_id: str
    verification_status: VerificationStatus
