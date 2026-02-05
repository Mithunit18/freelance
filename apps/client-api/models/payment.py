from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class PaymentStatus(str, Enum):
    """Payment status flow: PENDING → ESCROWED → COMPLETED/REFUNDED"""
    PENDING = "pending"      # Payment created, awaiting Razorpay payment
    ESCROWED = "escrowed"    # Paid, funds held in company account
    COMPLETED = "completed"  # Client confirmed, funds released to creator
    REFUNDED = "refunded"    # Funds returned to client


class ConfirmPaymentRequest(BaseModel):
    """Request body for confirming delivery and releasing payment"""
    payment_id: str


class PaymentResponse(BaseModel):
    """Standard payment API response"""
    success: bool
    message: str
    payment_id: Optional[str] = None
    payment_url: Optional[str] = None
    transaction_id: Optional[str] = None
    simulation: bool = False
