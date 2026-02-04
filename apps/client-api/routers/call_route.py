# routers/call_route.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.env import settings
from config.clients import db
import requests
from typing import Optional, Literal
import time
from datetime import datetime, timedelta

router = APIRouter()

# Configuration for call window
CALL_WINDOW_DAYS_BEFORE_EVENT = 7  # Allow calls 7 days before event
CALL_WINDOW_DAYS_AFTER_EVENT = 3   # Allow calls up to 3 days after event (for follow-up)

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
        
        # Check if call is within allowed time window (before and after event date)
        event_date_str = request_data.get("eventDate")
        if event_date_str:
            try:
                # Parse event date (format: "YYYY-MM-DD" or "DD/MM/YYYY" or timestamp)
                if isinstance(event_date_str, int):
                    # Timestamp in milliseconds
                    event_date = datetime.fromtimestamp(event_date_str / 1000)
                elif "-" in str(event_date_str):
                    event_date = datetime.strptime(str(event_date_str).split("T")[0], "%Y-%m-%d")
                elif "/" in str(event_date_str):
                    event_date = datetime.strptime(str(event_date_str), "%d/%m/%Y")
                else:
                    event_date = None

                now = datetime.now()
                print(f"[DEBUG] event_date_str: {event_date_str}")
                print(f"[DEBUG] event_date (parsed): {event_date}")
                print(f"[DEBUG] now: {now}")
                if event_date:
                    call_start_date = event_date - timedelta(days=CALL_WINDOW_DAYS_BEFORE_EVENT)
                    call_end_date = event_date + timedelta(days=CALL_WINDOW_DAYS_AFTER_EVENT)
                    print(f"[DEBUG] call_start_date: {call_start_date}")
                    print(f"[DEBUG] call_end_date: {call_end_date}")
                    if now < call_start_date:
                        days_until = (call_start_date - now).days
                        print(f"[DEBUG] Decision: BLOCK (too early)")
                        raise HTTPException(
                            status_code=403,
                            detail=f"Calling is available {CALL_WINDOW_DAYS_BEFORE_EVENT} days before the event. Please wait {days_until} more days."
                        )
                    if now > call_end_date:
                        print(f"[DEBUG] Decision: BLOCK (too late)")
                        raise HTTPException(
                            status_code=403,
                            detail=f"Call window has expired. Calls were only available until {CALL_WINDOW_DAYS_AFTER_EVENT} days after the event date."
                        )
                    print(f"[DEBUG] Decision: ALLOW (within window)")
            except HTTPException:
                raise
            except Exception as e:
                # If date parsing fails, log but allow the call
                print(f"Warning: Could not parse event date '{event_date_str}': {e}")
        
        # Determine receiver based on caller type
        if payload.caller_type == "client":
            # Client is calling creator - creators are in "creators" collection with email as doc ID
            receiver_id = request_data.get("creatorId")
            # Creators use email as document ID
            receiver_doc = db.collection("creators").document(receiver_id).get()
            if not receiver_doc.exists:
                raise HTTPException(status_code=404, detail="Creator not found")
            receiver_data = receiver_doc.to_dict()
        else:
            # Creator is calling client - clients are in "users" collection (lowercase)
            # clientId is stored as email, need to query by email field
            receiver_id = request_data.get("clientId")
            if not receiver_id:
                raise HTTPException(status_code=400, detail="Client ID not found in request")
            
            # Query users collection by email since clientId is the email
            users_query = db.collection("users").where("email", "==", receiver_id).limit(1).stream()
            receiver_data = None
            for doc in users_query:
                receiver_data = doc.to_dict()
                break
            
            if not receiver_data:
                raise HTTPException(status_code=404, detail="Client not found")
        
        if not receiver_id:
            raise HTTPException(status_code=400, detail="Receiver ID not found in request")
        
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


# Helper function to create Exotel XML response
def exotel_xml_response(action: str, message: str = None):
    """
    Create proper Exotel XML response.
    IMPORTANT: Exotel requires XML responses, not JSON!
    """
    from fastapi.responses import Response
    
    if action == "hangup":
        if message:
            xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>{message}</Say>
    <Hangup/>
</Response>"""
        else:
            xml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Hangup/>
</Response>"""
    else:
        # Continue/allow the call - return empty response or passthru
        xml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>"""
    
    return Response(content=xml, media_type="application/xml")


@router.api_route("/api/call/passthru", methods=["GET", "POST"])
async def exotel_passthru_webhook(
    CallSid: str = "",
    From: str = "",
    To: str = "",
    CallType: str = "",
    Direction: str = ""
):
    """
    Exotel Passthru Webhook - validates incoming calls to the masked number.
    Configure this URL in Exotel dashboard as the Passthru URL for your ExoPhone.
    
    This endpoint is called by Exotel when someone dials the masked number directly.
    We check if the call is within the allowed time window and return appropriate response.
    
    Returns:
    - 200 with dial action: Allow the call to go through
    - 200 with hangup action: Block the call
    """
    try:
        # Format incoming phone number for lookup
        caller_phone = From.replace("+", "").replace(" ", "").replace("-", "")
        if caller_phone.startswith("91"):
            caller_phone = caller_phone[2:]
        
        # Find the most recent call log for this caller to get the request_id
        calls_query = db.collection(CALLS_COLLECTION).where(
            "status", "in", ["initiated", "in-progress", "ringing"]
        ).order_by("created_at", direction="DESCENDING").limit(10).stream()
        
        matched_call = None
        for doc in calls_query:
            call_data = doc.to_dict()
            # Check if this caller was involved in this call
            # We need to verify by checking the request
            request_id = call_data.get("request_id")
            if request_id:
                request_ref = db.collection("ProjectRequests").document(request_id).get()
                if request_ref.exists:
                    request_data = request_ref.to_dict()
                    event_date_str = request_data.get("eventDate")
                    
                    if event_date_str:
                        try:
                            if isinstance(event_date_str, int):
                                event_date = datetime.fromtimestamp(event_date_str / 1000)
                            elif "-" in str(event_date_str):
                                event_date = datetime.strptime(str(event_date_str).split("T")[0], "%Y-%m-%d")
                            elif "/" in str(event_date_str):
                                event_date = datetime.strptime(str(event_date_str), "%d/%m/%Y")
                            else:
                                continue
                            
                            now = datetime.now()
                            call_end_date = event_date + timedelta(days=CALL_WINDOW_DAYS_AFTER_EVENT)
                            
                            if now > call_end_date:
                                # Call window expired - MUST return XML with Hangup
                                return exotel_xml_response(
                                    "hangup",
                                    "This event has ended. Calling is no longer available."
                                )
                            
                            matched_call = call_data
                            break
                        except:
                            continue
        
        # If no valid call found or window expired, block with explicit Hangup
        if not matched_call:
            return exotel_xml_response(
                "hangup",
                "Unable to connect. Please use the app to initiate calls."
            )
        
        # Allow the call - return empty Response (Exotel will continue)
        return exotel_xml_response("continue")
        
    except Exception as e:
        print(f"Passthru webhook error: {e}")
        # On error, block the call to be safe (prevents Exotel caching issues)
        return exotel_xml_response("hangup", "Service temporarily unavailable. Please try again later.")


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
