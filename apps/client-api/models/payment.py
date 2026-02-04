from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class PaymentStatus(str, Enum):
    """Payment status flow: PENDING → ESCROWED → COMPLETED/REFUNDED"""
    PENDING = "pending"      # Payment created, awaiting PhonePe payment
    ESCROWED = "escrowed"    # Paid, funds held in company account
    COMPLETED = "completed"  # Client confirmed, funds released to creator
    REFUNDED = "refunded"    # Funds returned to client


class Payment(BaseModel):
    """Payment record model"""
    id: str
    request_id: str  # Project request ID
    client_id: str
    creator_id: str
    amount: float
    status: PaymentStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    phonepe_transaction_id: Optional[str] = None
    description: Optional[str] = None


class CreatePaymentRequest(BaseModel):
    """Request body for creating a new payment"""
    client_id: str
    creator_id: str
    request_id: str  # Project request ID
    amount: float
    description: str
    redirect_url: str  # URL to redirect after payment
    callback_url: str  # Webhook URL for payment status


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
