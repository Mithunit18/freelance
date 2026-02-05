from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services import payment_service


router = APIRouter(prefix="/api/escrow", tags=["Escrow Payments"])


class CreateOrderRequest(BaseModel):
    """Request to create a Razorpay order"""
    client_id: str
    creator_id: str
    request_id: str
    amount: float
    description: str


class VerifyPaymentRequest(BaseModel):
    """Request to verify Razorpay payment"""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class ConfirmPaymentRequest(BaseModel):
    """Request to confirm and release payment"""
    payment_id: str


@router.post("/create-order")
async def create_order(request: CreateOrderRequest):
    """
    Create a Razorpay order for payment.
    Returns order_id and key_id for Razorpay Checkout.
    """
    try:
        result = payment_service.create_razorpay_order(
            client_id=request.client_id,
            creator_id=request.creator_id,
            request_id=request.request_id,
            amount=request.amount,
            description=request.description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-payment")
async def verify_payment(request: VerifyPaymentRequest):
    """
    Verify Razorpay payment and mark as escrowed.
    Called after Razorpay Checkout success callback.
    """
    try:
        result = payment_service.verify_razorpay_payment(
            razorpay_order_id=request.razorpay_order_id,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_signature=request.razorpay_signature
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check-status/{order_or_payment_id}")
async def check_status(order_or_payment_id: str):
    """Check payment status by order ID or payment ID"""
    try:
        result = payment_service.check_payment_status(order_or_payment_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/confirm")
async def confirm_payment(request: ConfirmPaymentRequest):
    """
    Client confirms delivery and releases payment to creator.
    """
    try:
        result = payment_service.confirm_and_release_payment(request.payment_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{payment_id}")
async def get_payment(payment_id: str):
    """Get payment details by ID"""
    payment = payment_service.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.get("/balance/{user_id}")
async def get_user_balance(user_id: str):
    """Get user's available balance"""
    balance = payment_service.get_user_balance(user_id)
    return {"user_id": user_id, "balance": balance}


@router.get("/{request_id}/status")
async def get_payment_status_by_request(request_id: str):
    """
    Get the status of a payment for a specific request ID.
    Useful for restoring state across devices.
    """
    try:
        payment = payment_service.get_payment_by_request(request_id)
        if not payment:
            return {
                "success": False, 
                "message": "No payment found for this request"
            }
            
        return {
            "success": True,
            "payment": payment,
            "status": payment["status"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== CREATOR PAYOUT ENDPOINTS ==============

class PayoutRequest(BaseModel):
    """Request for creator to withdraw their balance"""
    amount: Optional[float] = None  # If None, withdraw full balance


@router.post("/payout/request")
async def request_payout(
    request: PayoutRequest,
    current_user = None  # TODO: Add Depends(get_current_user(allowed_roles=['photographer', 'videographer']))
):
    """
    Creator requests a payout of their available balance.
    Money will be transferred to their verified bank account.
    
    Note: Requires verified bank account setup.
    """
    from auth.get_current_user import get_current_user
    from fastapi import Depends
    
    # For now, we'll get creator email from request or use a placeholder
    # In production, use: current_user = Depends(get_current_user(...))
    creator_email = "test@example.com"  # Replace with current_user.email
    
    try:
        # Get creator's current balance
        balance = payment_service.get_user_balance(creator_email)
        
        if balance <= 0:
            raise HTTPException(status_code=400, detail="No balance available for payout")
        
        # Determine payout amount
        payout_amount = request.amount if request.amount else balance
        
        if payout_amount > balance:
            raise HTTPException(
                status_code=400, 
                detail=f"Requested amount ₹{payout_amount} exceeds available balance ₹{balance}"
            )
        
        # Minimum payout amount
        if payout_amount < 100:
            raise HTTPException(status_code=400, detail="Minimum payout amount is ₹100")
        
        # Process the payout
        result = await payment_service.process_creator_payout(
            creator_email=creator_email,
            amount=payout_amount,
            payment_id=f"PAYOUT_{creator_email}"
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/payout/history/{creator_email}")
async def get_payout_history(creator_email: str):
    """Get payout history for a creator"""
    from config.clients import db
    
    try:
        payouts = db.collection("payouts").where(
            "creator_email", "==", creator_email
        ).order_by("created_at", direction="DESCENDING").limit(50).stream()
        
        payout_list = [doc.to_dict() for doc in payouts]
        
        return {
            "success": True,
            "payouts": payout_list,
            "count": len(payout_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== AUTO-RELEASE ENDPOINTS ==============

@router.post("/auto-release/run")
async def run_auto_release():
    """
    Manually trigger the auto-release check for escrowed payments.
    Payments that are 3+ days past the event date will be automatically released.
    
    This endpoint can be used for:
    - Testing the auto-release functionality
    - Admin manual trigger if needed
    - Cron job webhook (external scheduler)
    """
    try:
        result = payment_service.auto_release_escrowed_payments()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/auto-release/pending")
async def get_pending_auto_releases():
    """
    Get list of escrowed payments that are ready for auto-release.
    These are payments where 3+ days have passed since the event date.
    """
    try:
        payments = payment_service.get_escrowed_payments_ready_for_auto_release()
        return {
            "success": True,
            "count": len(payments),
            "payments": [
                {
                    "payment_id": p["payment_id"],
                    "event_date": p["event_date"].isoformat(),
                    "auto_release_date": p["auto_release_date"].isoformat(),
                    "days_overdue": p["days_overdue"],
                    "amount": p["payment_data"].get("amount"),
                    "creator_id": p["payment_data"].get("creator_id")
                }
                for p in payments
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

