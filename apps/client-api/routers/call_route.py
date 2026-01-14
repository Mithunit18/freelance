# routers/call_route.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.env import settings
from config.clients import db
import requests
from typing import Optional, Literal
import time

router = APIRouter()

# Collection names
CALLS_COLLECTION = "Calls"
PAYMENTS_COLLECTION = "Payments"


class CallRequest(BaseModel):
    request_id: str
    caller_id: str  # ID of the person initiating the call
    caller_phone: str  # Caller's phone number
    caller_type: Literal["client", "creator"]  # Who is making the call


class CallResponse(BaseModel):
    success: bool
    message: str
    call_sid: Optional[str] = None
    status: Optional[str] = None


@router.post("/api/call/connect", response_model=CallResponse)
async def initiate_call(payload: CallRequest):
    """
    Initiate a masked call between client and creator using Exotel.
    Works for both client->creator and creator->client calls.
    The caller's and receiver's real phone numbers are hidden from each other.
    """
    try:
        # Validate Exotel credentials
        if not all([settings.EXOTEL_SID, settings.EXOTEL_API_KEY, 
                   settings.EXOTEL_API_TOKEN, settings.EXOTEL_CALLER_ID]):
            raise HTTPException(
                status_code=500, 
                detail="Exotel credentials not configured"
            )
        
        # Verify payment is escrowed or completed for this request
        payment_ref = db.collection(PAYMENTS_COLLECTION).where(
            "request_id", "==", payload.request_id
        ).limit(1).stream()
        
        payment = None
        for doc in payment_ref:
            payment = doc.to_dict()
            break
        
        if not payment:
            raise HTTPException(
                status_code=403, 
                detail="Payment not found for this request"
            )
        
        if payment.get("status") not in ["escrowed", "completed"]:
            raise HTTPException(
                status_code=403, 
                detail="Call can only be made after payment is secured"
            )
        
        # Get the request to find client_id and creator_id
        request_ref = db.collection("ProjectRequests").document(payload.request_id).get()
        if not request_ref.exists:
            raise HTTPException(status_code=404, detail="Request not found")
        
        request_data = request_ref.to_dict()
        
        # Determine receiver based on caller type
        if payload.caller_type == "client":
            # Client is calling creator
            receiver_id = request_data.get("creatorId")
            receiver_collection = "Users"
        else:
            # Creator is calling client
            receiver_id = request_data.get("clientId")
            receiver_collection = "Users"
        
        if not receiver_id:
            raise HTTPException(status_code=400, detail="Receiver ID not found in request")
        
        # Get receiver's phone number
        receiver_doc = db.collection(receiver_collection).document(receiver_id).get()
        if not receiver_doc.exists:
            raise HTTPException(status_code=404, detail="Receiver not found")
        
        receiver_data = receiver_doc.to_dict()
        receiver_phone = receiver_data.get("phone_number")
        
        if not receiver_phone:
            raise HTTPException(
                status_code=400, 
                detail="Receiver phone number not available"
            )
        
        # Format phone numbers (ensure they have country code)
        def format_phone(phone: str) -> str:
            phone = phone.strip().replace(" ", "").replace("-", "")
            if not phone.startswith("+") and not phone.startswith("91"):
                phone = "91" + phone
            elif phone.startswith("+"):
                phone = phone[1:]
            return phone
        
        caller_phone = format_phone(payload.caller_phone)
        receiver_phone = format_phone(receiver_phone)
        
        # Make Exotel API call
        exotel_url = (
            f"https://{settings.EXOTEL_API_KEY}:{settings.EXOTEL_API_TOKEN}"
            f"@api.exotel.com/v1/Accounts/{settings.EXOTEL_SID}/Calls/connect.json"
        )
        
        call_data = {
            "From": caller_phone,      # Caller (who initiates)
            "To": receiver_phone,      # Receiver
            "CallerId": settings.EXOTEL_CALLER_ID  # Masked number shown to both
        }
        
        response = requests.post(exotel_url, data=call_data)
        
        if response.status_code != 200:
            error_detail = response.json() if response.text else "Unknown error"
            raise HTTPException(
                status_code=500, 
                detail=f"Exotel API error: {error_detail}"
            )
        
        result = response.json()
        call_sid = result.get("Call", {}).get("Sid")
        
        # Log the call in Firestore
        call_log = {
            "call_sid": call_sid,
            "request_id": payload.request_id,
            "caller_id": payload.caller_id,
            "caller_type": payload.caller_type,
            "receiver_id": receiver_id,
            "status": "initiated",
            "created_at": int(time.time() * 1000),
        }
        db.collection(CALLS_COLLECTION).document(call_sid).set(call_log)
        
        return CallResponse(
            success=True,
            message="Call initiated successfully. You will receive a call shortly.",
            call_sid=call_sid,
            status="initiated"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/call/status/{call_sid}")
async def get_call_status(call_sid: str):
    """Get the status of a call from Exotel"""
    try:
        if not all([settings.EXOTEL_SID, settings.EXOTEL_API_KEY, settings.EXOTEL_API_TOKEN]):
            raise HTTPException(status_code=500, detail="Exotel credentials not configured")
        
        exotel_url = (
            f"https://{settings.EXOTEL_API_KEY}:{settings.EXOTEL_API_TOKEN}"
            f"@api.exotel.com/v1/Accounts/{settings.EXOTEL_SID}/Calls/{call_sid}.json"
        )
        
        response = requests.get(exotel_url)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to get call status")
        
        result = response.json()
        call_status = result.get("Call", {}).get("Status")
        
        # Update call log in Firestore
        call_ref = db.collection(CALLS_COLLECTION).document(call_sid)
        if call_ref.get().exists:
            call_ref.update({
                "status": call_status,
                "updated_at": int(time.time() * 1000)
            })
        
        return {
            "success": True,
            "call_sid": call_sid,
            "status": call_status,
            "details": result.get("Call", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
