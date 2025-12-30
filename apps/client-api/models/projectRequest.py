from pydantic import BaseModel
from typing import Optional, Union, Literal


# =========================
# PACKAGE (STORED IN DB)
# =========================
class PackageInfo(BaseModel):
    id: Optional[Union[str, int]] = None
    name: str
    price: Union[str, int, float]


# =========================
# CREATE REQUEST (FROM FRONTEND)
# =========================
class ProjectRequestCreate(BaseModel):
    # ⚠️ You decided to send this from frontend
    clientId: str

    creatorId: str

    # frontend sends flat package fields
    packageId: Optional[Union[str, int]] = None
    packageName: str
    packagePrice: Union[str, int, float]

    serviceType: Optional[str] = None
    eventDate: str                    # ISO string
    duration: Optional[int] = None
    location: Optional[str] = None

    message: Optional[str] = ""

    creatorName: Optional[str] = None
    creatorSpecialisation: Optional[str] = None


# =========================
# CREATOR RESPONSE
# =========================
class ProjectRequestResponse(BaseModel):
    action: Literal["accept", "decline", "negotiate"]
    message: Optional[str] = ""


# =========================
# STORED PROJECT REQUEST (DB SHAPE)
# =========================
class ProjectRequest(BaseModel):
    id: str

    clientId: str
    creatorId: str

    package: PackageInfo

    serviceType: Optional[str]
    eventDate: str
    duration: Optional[int]
    location: Optional[str]

    message: Optional[str]

    creatorName: Optional[str]
    creatorSpecialisation: Optional[str]

    status: Literal[
        "pending_creator",
        "accepted",
        "declined",
        "negotiation_proposed"
    ]

    creatorMessage: Optional[str] = ""

    createdAt: int
    updatedAt: int
