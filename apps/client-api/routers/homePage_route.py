from fastapi import APIRouter, HTTPException
from models.homePage import HomePage
from services.homePage_service import send_contact_email

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.post("/")
async def contact_form(payload: HomePage):
    sent = send_contact_email(
        name=payload.name,
        email=payload.email,
        message=payload.message,
    )

    if not sent:
        raise HTTPException(status_code=500, detail="Failed to send message")

    return {"success": True, "message": "Message sent successfully!"}