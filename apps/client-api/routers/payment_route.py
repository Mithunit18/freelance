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
