from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class BankVerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    FAILED = "failed"
    NOT_SUBMITTED = "not_submitted"


class BankDetailsRequest(BaseModel):
    """Request model for submitting bank details"""
    account_holder_name: str = Field(..., min_length=2, max_length=100, description="Name as per bank account")
    account_number: str = Field(..., min_length=9, max_length=18, description="Bank account number")
    confirm_account_number: str = Field(..., min_length=9, max_length=18, description="Confirm bank account number")
    ifsc_code: str = Field(..., min_length=11, max_length=11, description="IFSC code of the bank branch")
    bank_name: Optional[str] = Field(None, description="Bank name (auto-filled from IFSC)")
    branch_name: Optional[str] = Field(None, description="Branch name (auto-filled from IFSC)")


class BankDetailsResponse(BaseModel):
    """Response model for bank details operations"""
    message: str
    user_id: str
    verification_status: BankVerificationStatus
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None


class IFSCValidationResponse(BaseModel):
    """Response model for IFSC validation"""
    valid: bool
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    message: str


class BankAccountValidationRequest(BaseModel):
    """Request for validating bank account via Razorpay"""
    account_number: str
    ifsc_code: str
    account_holder_name: str


class BankAccountValidationResponse(BaseModel):
    """Response for bank account validation"""
    valid: bool
    account_holder_name: Optional[str] = None
    message: str
    razorpay_fund_account_id: Optional[str] = None
    razorpay_contact_id: Optional[str] = None
