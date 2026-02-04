"""
Bank Details Router

Handles bank account validation and storage for creators.
This is used for Razorpay payouts to creators.
"""

from fastapi import APIRouter, HTTPException, Depends
from models.bank_details import (
    BankDetailsRequest,
    BankDetailsResponse,
    IFSCValidationResponse,
    BankVerificationStatus
)
from models.Auth import authmeschema
from auth.get_current_user import get_current_user
from services.bank_validation_service import bank_validation_service

router = APIRouter(prefix="/api/creator/bank", tags=["Bank Details"])


@router.post("/validate-ifsc", response_model=IFSCValidationResponse)
async def validate_ifsc_code(
    ifsc_code: str,
    current_user: authmeschema = Depends(get_current_user)
):
    """
    Validate an IFSC code and return bank/branch details.
    This is a free API call that helps users verify their IFSC before submission.
    """
    try:
        # Clean and uppercase the IFSC code
        ifsc_code = ifsc_code.strip().upper()
        
        # Validate format (11 characters: first 4 letters, 5th is 0, last 6 alphanumeric)
        if len(ifsc_code) != 11:
            return IFSCValidationResponse(
                valid=False,
                message="IFSC code must be exactly 11 characters"
            )
        
        # Validate using Razorpay IFSC API
        result = await bank_validation_service.validate_ifsc(ifsc_code)
        
        return IFSCValidationResponse(
            valid=result.get("valid", False),
            bank_name=result.get("bank_name"),
            branch_name=result.get("branch_name"),
            address=result.get("address"),
            city=result.get("city"),
            state=result.get("state"),
            message=result.get("message", "")
        )
        
    except Exception as e:
        print(f"IFSC Validation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to validate IFSC: {str(e)}")


@router.post("/submit", response_model=BankDetailsResponse)
async def submit_bank_details(
    request: BankDetailsRequest,
    current_user: authmeschema = Depends(get_current_user(allowed_roles=["creator"]))
):
    """
    Submit and validate bank account details.
    
    This endpoint:
    1. Validates the IFSC code
    2. Validates account number format
    3. Creates a Razorpay Fund Account (validates the bank account)
    4. Saves verified details to Firestore
    """
    try:
        creator_email = current_user.email
        
        # Step 1: Validate account numbers match
        if request.account_number != request.confirm_account_number:
            raise HTTPException(
                status_code=400,
                detail="Account numbers do not match"
            )
        
        # Step 2: Clean and validate IFSC
        ifsc_code = request.ifsc_code.strip().upper()
        if len(ifsc_code) != 11:
            raise HTTPException(
                status_code=400,
                detail="IFSC code must be exactly 11 characters"
            )
        
        # Step 3: Validate IFSC to get bank details
        ifsc_result = await bank_validation_service.validate_ifsc(ifsc_code)
        if not ifsc_result.get("valid"):
            raise HTTPException(
                status_code=400,
                detail="Invalid IFSC code. Please check and try again."
            )
        
        bank_name = ifsc_result.get("bank_name", request.bank_name or "")
        branch_name = ifsc_result.get("branch_name", request.branch_name or "")
        
        # Step 4: Validate bank account using Razorpay
        validation_result = await bank_validation_service.validate_bank_account(
            account_number=request.account_number,
            ifsc_code=ifsc_code,
            account_holder_name=request.account_holder_name,
            user_email=creator_email
        )
        
        if not validation_result.get("valid"):
            raise HTTPException(
                status_code=400,
                detail=validation_result.get("message", "Bank account validation failed")
            )
        
        # Step 5: Save verified details to Firestore
        save_success = await bank_validation_service.save_bank_details(
            user_email=creator_email,
            account_holder_name=request.account_holder_name,
            account_number=request.account_number,
            ifsc_code=ifsc_code,
            bank_name=bank_name,
            branch_name=branch_name,
            razorpay_fund_account_id=validation_result.get("razorpay_fund_account_id", ""),
            razorpay_contact_id=validation_result.get("razorpay_contact_id", "")
        )
        
        if not save_success:
            raise HTTPException(
                status_code=500,
                detail="Failed to save bank details"
            )
        
        return BankDetailsResponse(
            message="Bank details verified and saved successfully",
            user_id=creator_email,
            verification_status=BankVerificationStatus.VERIFIED,
            bank_name=bank_name,
            branch_name=branch_name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Bank Details Submit Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process bank details: {str(e)}")


@router.get("/status")
async def get_bank_details_status(
    current_user: authmeschema = Depends(get_current_user(allowed_roles=["creator"]))
):
    """
    Get the current bank details status for the authenticated creator.
    Returns masked account details if already submitted.
    """
    try:
        creator_email = current_user.email
        
        bank_details = await bank_validation_service.get_bank_details(creator_email)
        
        if not bank_details:
            return {
                "has_bank_details": False,
                "verification_status": BankVerificationStatus.NOT_SUBMITTED.value,
                "bank_details": None
            }
        
        return {
            "has_bank_details": True,
            "verification_status": bank_details.get("verification_status", "pending"),
            "bank_details": {
                "account_holder_name": bank_details.get("account_holder_name"),
                "account_number_masked": bank_details.get("account_number_encrypted"),
                "account_number_last4": bank_details.get("account_number_last4"),
                "ifsc_code": bank_details.get("ifsc_code"),
                "bank_name": bank_details.get("bank_name"),
                "branch_name": bank_details.get("branch_name"),
                "verified_at": bank_details.get("verified_at")
            }
        }
        
    except Exception as e:
        print(f"Bank Status Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch bank details status")
