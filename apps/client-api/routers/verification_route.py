from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from models.verification import VerificationRequest, VerificationResponse, VerificationStatus
from models.Auth import authmeschema
from auth.get_current_user import get_current_user
from services.onboard_service import CreatorOnboardingService as service
from firebase_admin import firestore
from datetime import datetime, timezone
from config.clients import db 
from services.claudinary_service import ClaudinaryService

# Prefix matches your standard API structure
router = APIRouter(prefix="/api/creator/verification", tags=["Verification"])

@router.post("/submit", response_model=VerificationResponse)
async def submit_verification(request: VerificationRequest, current_user: authmeschema = Depends(get_current_user(allowed_roles=['photographer', 'videographer']))):
    """
    Submits verification documents to the 'creators' collection.
    """
    try:
        # 1. Use verified email from cookie as the unique identifier
        creator_email = current_user.email
        
        # 2. Prepare the document entry
        # Firestore cannot handle SERVER_TIMESTAMP inside nested lists, so we use datetime.now
        verification_entry = {
            "verification_type": request.verification_type.value,
            "document_url": request.document_url,
            "status": VerificationStatus.PENDING.value,
            "submitted_at": datetime.now(timezone.utc) 
        }
        
        # 3. Fetch current creator data to manage the document list
        creator_ref = db.collection("creators").document(creator_email)
        creator_doc = creator_ref.get()
        
        user_data = creator_doc.to_dict() if creator_doc.exists else {}
        current_docs = user_data.get("verification_documents", [])
        current_docs.append(verification_entry)

        # 4. Update the 'creators' collection
        update_data = {
            "verification_documents": current_docs,
            "verification_status": VerificationStatus.PENDING.value,
            "updated_at": firestore.SERVER_TIMESTAMP,
            "email": creator_email # Ensure email linkage
        }

        # Update via service logic
        await service.update_step_data(
            user_id=creator_email,
            data=update_data,
            next_step=4,
            flag_name="verification_completed"
        )

        return VerificationResponse(
            message="Verification submitted successfully",
            user_id=creator_email,
            verification_status=VerificationStatus.PENDING
        )
    except Exception as e:
        print(f"Verification Submit Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
    
@router.post("/upload-document")
async def upload_verification_document(
    file: UploadFile = File(...), 
    current_user: authmeschema = Depends(get_current_user(allowed_roles=['photographer', 'videographer']))
):
    """
    Uploads verification documents to Cloudinary and returns the secure URL.
    """
    print(f"Document upload initiated by: {current_user.email}")
    
    try:
        # We use the document-specific method
        secure_url = ClaudinaryService.upload_document(file.file)
        
        return {
            "message": "Document uploaded successfully",
            "url": secure_url
        }
    except Exception as e:
        print(f"Document Upload Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to upload document to storage"
        )

@router.get("/status")
async def get_verification_status(current_user: authmeschema = Depends(get_current_user(allowed_roles=['photographer', 'videographer']))):
    """
    Retrieves verification status from the 'creators' collection.
    """
    try:
        creator_email = current_user.email
        creator_doc = db.collection("creators").document(creator_email).get()
        
        if not creator_doc.exists:
            return {
                "user_id": creator_email,
                "verification_status": "not_started",
                "verification_documents": []
            }
        
        user_data = creator_doc.to_dict()
        
        return {
            "user_id": creator_email,
            "verification_status": user_data.get("verification_status", "not_started"),
            "verification_documents": user_data.get("verification_documents", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching status: {str(e)}")