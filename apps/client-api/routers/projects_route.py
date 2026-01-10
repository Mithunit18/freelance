# routes/project_requests.py
from fastapi import APIRouter, HTTPException
from config.clients import db  # Use Firestore from clients.py
from uuid import uuid4
import time
from models.projectRequest import (
    ProjectRequest,
    ProjectRequestCreate,
    ProjectRequestResponse
)
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

# Collection names
PROJECT_REQUESTS_COLLECTION = "ProjectRequests"
PROJECT_MESSAGES_COLLECTION = "ProjectMessages"
PAYMENTS_COLLECTION = "Payments"
BOOKINGS_COLLECTION = "Bookings"
REVIEWS_COLLECTION = "Reviews"


# =========================
# PYDANTIC MODELS
# =========================
class NegotiationMessage(BaseModel):
    sender: str  # 'client' or 'creator'
    senderId: str
    message: str
    price: Optional[float] = None
    deliverables: Optional[str] = None
    type: str = "text"  # 'text', 'offer', 'counter', 'accepted'

class PaymentCreate(BaseModel):
    requestId: str
    clientId: str
    amount: float
    paymentMethod: str
    transactionId: Optional[str] = None

class ReviewCreate(BaseModel):
    bookingId: str
    clientId: str
    creatorId: str
    overallRating: int
    aspects: dict  # {quality: 5, communication: 4, ...}
    review: str
    recommend: bool = True


# =========================
# CREATE PROJECT REQUEST
# =========================
@router.post("/projects/request")
def create_project_request(payload: ProjectRequestCreate):
    try:
        request_id = f"req_{uuid4().hex[:8]}"

        # Use Firestore collection
        doc_ref = db.collection(PROJECT_REQUESTS_COLLECTION).document(request_id)

        data = {
            "id": request_id,
            "clientId": payload.clientId,

            "creatorId": payload.creatorId,
            "package": {
                "id": payload.packageId,
                "name": payload.packageName or "Custom Inquiry",
                "price": payload.packagePrice or "To be discussed"
            },
            
            "isInquiry": payload.isInquiry or False,

            "serviceType": payload.serviceType,
            "category": payload.category,
            "eventDate": payload.eventDate,
            "duration": payload.duration,
            "location": payload.location,
            "budget": payload.budget,
            
            "selectedStyles": payload.selectedStyles or [],
            "styleNotes": payload.styleNotes,
            "pinterestLink": payload.pinterestLink,
            "referenceImages": payload.referenceImages or [],

            "message": payload.message,

            "creatorName": payload.creatorName,
            "creatorSpecialisation": payload.creatorSpecialisation,

            "status": "pending_creator",
            "createdAt": int(time.time() * 1000),
            "updatedAt": int(time.time() * 1000)
        }

        doc_ref.set(data)

        return {
            "success": True,
            "requestId": request_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# GET SINGLE REQUEST BY ID
# =========================
@router.get("/projects/request/{request_id}")
def get_request_by_id(request_id: str):
    """Get a single project request by ID"""
    doc_ref = db.collection(PROJECT_REQUESTS_COLLECTION).document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Request not found")

    return {
        "success": True,
        "data": doc.to_dict()
    }


# =========================
# RESPOND TO REQUEST
# =========================
@router.post("/project-request/{request_id}/respond")
def respond_to_request(request_id: str, payload: ProjectRequestResponse):
    doc_ref = db.collection(PROJECT_REQUESTS_COLLECTION).document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Request not found")

    if payload.action not in ["accept", "decline", "negotiate"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    update = {
        "status": (
            "accepted" if payload.action == "accept" else
            "declined" if payload.action == "decline" else
            "negotiation_proposed"
        ),
        "creator_message": payload.message,
        "updatedAt": int(time.time() * 1000)
    }

    doc_ref.update(update)
    return {"success": True}


# =========================
# GET REQUESTS BY CLIENT
# =========================
@router.get("/projects/requests/{clientId}")
def get_requests_by_client(clientId: str):
    # Query Firestore for requests by this client
    docs = db.collection(PROJECT_REQUESTS_COLLECTION).where("clientId", "==", clientId).stream()

    client_requests = []
    for doc in docs:
        client_requests.append(doc.to_dict())

    return {
        "success": True,
        "count": len(client_requests),
        "data": client_requests
    }


# =========================
# GET REQUESTS BY CREATOR
# =========================
@router.get("/projects/creator-requests/{creatorId}")
def get_requests_by_creator(creatorId: str):
    """Get all project requests sent to a specific creator"""
    # Query Firestore for requests by this creator
    docs = db.collection(PROJECT_REQUESTS_COLLECTION).where("creatorId", "==", creatorId).stream()

    creator_requests = []
    for doc in docs:
        creator_requests.append(doc.to_dict())

    # Sort by createdAt descending (newest first)
    creator_requests.sort(key=lambda x: x.get("createdAt", 0), reverse=True)

    return {
        "success": True,
        "count": len(creator_requests),
        "data": creator_requests
    }


# =========================
# NEGOTIATION / CHAT ENDPOINTS
# =========================
@router.post("/projects/{request_id}/messages")
def send_negotiation_message(request_id: str, payload: NegotiationMessage):
    """Send a message in the negotiation chat"""
    try:
        # Verify request exists
        request_ref = db.collection(PROJECT_REQUESTS_COLLECTION).document(request_id)
        request_doc = request_ref.get()
        if not request_doc.exists:
            raise HTTPException(status_code=404, detail="Request not found")
        
        request_data = request_doc.to_dict()

        # Create message
        message_id = f"msg_{uuid4().hex[:8]}"
        message_ref = db.collection(PROJECT_MESSAGES_COLLECTION).document(request_id).collection("messages").document(message_id)
        
        message_data = {
            "id": message_id,
            "sender": payload.sender,
            "senderId": payload.senderId,
            "message": payload.message,
            "type": payload.type,
            "timestamp": int(time.time() * 1000),
            "status": "sent"
        }
        
        # Add price/deliverables for offer messages
        if payload.price is not None:
            message_data["price"] = payload.price
        if payload.deliverables:
            message_data["deliverables"] = payload.deliverables
            
        message_ref.set(message_data)

        # Update request status if it's an offer/counter
        if payload.type in ["offer", "counter"]:
            request_ref.update({
                "currentOffer": {
                    "price": payload.price,
                    "deliverables": payload.deliverables,
                    "from": payload.sender
                },
                "status": "negotiating",
                "updatedAt": int(time.time() * 1000)
            })
        elif payload.type == "accepted":
            request_ref.update({
                "status": "accepted",
                "finalOffer": {
                    "price": payload.price,
                    "deliverables": payload.deliverables
                },
                "updatedAt": int(time.time() * 1000)
            })

        return {"success": True, "messageId": message_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{request_id}/messages")
def get_negotiation_messages(request_id: str):
    """Get all messages for a negotiation"""
    try:
        messages_ref = db.collection(PROJECT_MESSAGES_COLLECTION).document(request_id).collection("messages")
        docs = messages_ref.stream()
        
        message_list = []
        for doc in docs:
            message_list.append(doc.to_dict())
        
        # Sort by timestamp
        message_list.sort(key=lambda x: x.get("timestamp", 0))
        
        return {
            "success": True,
            "messages": message_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# PAYMENT ENDPOINTS
# =========================
@router.post("/payments/create")
def create_payment(payload: PaymentCreate):
    """Create a payment record and booking"""
    try:
        # Verify request exists and is accepted
        request_ref = db.collection(PROJECT_REQUESTS_COLLECTION).document(payload.requestId)
        request_doc = request_ref.get()
        if not request_doc.exists:
            raise HTTPException(status_code=404, detail="Request not found")
        
        request_data = request_doc.to_dict()
        
        if request_data.get("status") not in ["accepted", "negotiating"]:
            raise HTTPException(status_code=400, detail="Request must be accepted before payment")

        # Create payment record
        payment_id = f"pay_{uuid4().hex[:8]}"
        payment_ref = db.collection(PAYMENTS_COLLECTION).document(payment_id)
        
        payment_data = {
            "id": payment_id,
            "requestId": payload.requestId,
            "clientId": payload.clientId,
            "creatorId": request_data.get("creatorId"),
            "amount": payload.amount,
            "platformFee": round(payload.amount * 0.05, 2),  # 5% platform fee
            "gst": round(payload.amount * 0.18, 2),  # 18% GST
            "totalAmount": round(payload.amount * 1.23, 2),  # Total with fees
            "paymentMethod": payload.paymentMethod,
            "transactionId": payload.transactionId or f"txn_{uuid4().hex[:12]}",
            "status": "completed",
            "createdAt": int(time.time() * 1000)
        }
        payment_ref.set(payment_data)

        # Create booking record
        booking_id = f"book_{uuid4().hex[:8]}"
        booking_ref = db.collection(BOOKINGS_COLLECTION).document(booking_id)
        
        booking_data = {
            "id": booking_id,
            "requestId": payload.requestId,
            "paymentId": payment_id,
            "clientId": payload.clientId,
            "creatorId": request_data.get("creatorId"),
            "creatorName": request_data.get("creatorName"),
            "creatorSpecialisation": request_data.get("creatorSpecialisation"),
            "package": request_data.get("package"),
            "serviceType": request_data.get("serviceType"),
            "eventDate": request_data.get("eventDate"),
            "location": request_data.get("location"),
            "finalAmount": payload.amount,
            "deliverables": request_data.get("finalOffer", {}).get("deliverables") or request_data.get("package", {}).get("name"),
            "status": "confirmed",
            "escrowStatus": "held",  # Funds held in escrow
            "createdAt": int(time.time() * 1000)
        }
        booking_ref.set(booking_data)

        # Update request status
        request_ref.update({
            "status": "paid",
            "bookingId": booking_id,
            "paymentId": payment_id,
            "updatedAt": int(time.time() * 1000)
        })

        return {
            "success": True,
            "paymentId": payment_id,
            "bookingId": booking_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/payments/{payment_id}")
def get_payment(payment_id: str):
    """Get payment details"""
    doc_ref = db.collection(PAYMENTS_COLLECTION).document(payment_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"success": True, "data": doc.to_dict()}


# =========================
# BOOKING ENDPOINTS
# =========================
@router.get("/bookings/{booking_id}")
def get_booking(booking_id: str):
    """Get booking details"""
    doc_ref = db.collection(BOOKINGS_COLLECTION).document(booking_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"success": True, "data": doc.to_dict()}


@router.get("/bookings/client/{client_id}")
def get_client_bookings(client_id: str):
    """Get all bookings for a client"""
    docs = db.collection(BOOKINGS_COLLECTION).where("clientId", "==", client_id).stream()
    
    client_bookings = []
    for doc in docs:
        client_bookings.append(doc.to_dict())
    
    return {
        "success": True,
        "count": len(client_bookings),
        "data": client_bookings
    }


@router.post("/bookings/{booking_id}/confirm-event")
def confirm_event_completion(booking_id: str, payload: dict):
    """Client confirms event happened successfully"""
    try:
        doc_ref = db.collection(BOOKINGS_COLLECTION).document(booking_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        confirmed = payload.get("confirmed", True)
        
        if confirmed:
            # Release escrow to creator
            doc_ref.update({
                "status": "completed",
                "escrowStatus": "released",
                "eventConfirmedAt": int(time.time() * 1000),
                "updatedAt": int(time.time() * 1000)
            })
        else:
            # Start dispute process
            doc_ref.update({
                "status": "disputed",
                "escrowStatus": "held",
                "disputeReason": payload.get("reason", ""),
                "disputedAt": int(time.time() * 1000),
                "updatedAt": int(time.time() * 1000)
            })
        
        return {"success": True, "status": "completed" if confirmed else "disputed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# REVIEW ENDPOINTS
# =========================
@router.post("/reviews/create")
def create_review(payload: ReviewCreate):
    """Submit a review for a booking"""
    try:
        # Verify booking exists and is completed
        booking_ref = db.collection(BOOKINGS_COLLECTION).document(payload.bookingId)
        booking_doc = booking_ref.get()
        if not booking_doc.exists:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Create review
        review_id = f"rev_{uuid4().hex[:8]}"
        review_ref = db.collection(REVIEWS_COLLECTION).document(review_id)
        
        review_data = {
            "id": review_id,
            "bookingId": payload.bookingId,
            "clientId": payload.clientId,
            "creatorId": payload.creatorId,
            "overallRating": payload.overallRating,
            "aspects": payload.aspects,
            "review": payload.review,
            "recommend": payload.recommend,
            "createdAt": int(time.time() * 1000)
        }
        review_ref.set(review_data)

        # Update booking with review
        booking_ref.update({
            "reviewId": review_id,
            "reviewed": True,
            "updatedAt": int(time.time() * 1000)
        })

        # Update creator's average rating
        _update_creator_rating(payload.creatorId)

        return {"success": True, "reviewId": review_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _update_creator_rating(creator_id: str):
    """Helper to update creator's average rating"""
    try:
        # Get all reviews for this creator
        docs = db.collection(REVIEWS_COLLECTION).where("creatorId", "==", creator_id).stream()
        
        creator_reviews = []
        for doc in docs:
            creator_reviews.append(doc.to_dict())
        
        if creator_reviews:
            avg_rating = sum(r.get("overallRating", 0) for r in creator_reviews) / len(creator_reviews)
            
            # Update in creators collection
            creator_ref = db.collection("creators").document(creator_id)
            creator_ref.update({
                "rating": round(avg_rating, 1),
                "reviewCount": len(creator_reviews)
            })
    except Exception as e:
        print(f"Failed to update creator rating: {e}")


@router.get("/reviews/creator/{creator_id}")
def get_creator_reviews(creator_id: str):
    """Get all reviews for a creator"""
    docs = db.collection(REVIEWS_COLLECTION).where("creatorId", "==", creator_id).stream()
    
    creator_reviews = []
    for doc in docs:
        creator_reviews.append(doc.to_dict())
    
    # Sort by date descending
    creator_reviews.sort(key=lambda x: x.get("createdAt", 0), reverse=True)
    
    return {
        "success": True,
        "count": len(creator_reviews),
        "data": creator_reviews
    }
