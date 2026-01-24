from fastapi import APIRouter, Depends, HTTPException
from auth.get_current_user import get_current_user
from models.Auth import authmeschema
from services.onboard_service import CreatorOnboardingService as service
from config.clients import db

router = APIRouter(prefix="/api/creator/onboarding", tags=["Onboarding"])

@router.get("/status")
async def get_onboarding_status(current_user: authmeschema = Depends(get_current_user)):
    """
    Fetches the current progress of the creator from the 'creators' collection.
    """
    try:
        # 1. Use current_user.email (object access) instead of ["id"]
        creator_email = current_user.email
        
        # 2. Check the 'creators' collection for progress
        creator_doc = db.collection("creators").document(creator_email).get()
        
        if not creator_doc.exists:
            # If no entry exists in the creators collection yet, they are at Step 1
            return {
                "current_step": 1,
                "status": "not_started",
                "profile_live": False
            }
        
        user_data = creator_doc.to_dict()
        
        # 3. Use data from the creators collection
        current_step = user_data.get("current_step", 1)
        onboarding_status = user_data.get("onboarding_status", "not_started")
        
        return {
            "current_step": current_step,
            "status": "completed" if onboarding_status == "completed" else "in_progress",
            "profile_live": user_data.get("profile_live", False)
        }
    except Exception as e:
        # Detailed logging helps debug if the service call fails
        print(f"Onboarding Status Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch onboarding status")

@router.post("/complete")
async def complete_onboarding(current_user: authmeschema = Depends(get_current_user)):
    """
    Finalizes the profile in the 'creators' collection.
    """
    try:
        creator_email = current_user.email
        
        # Update the 'creators' document to finalize
        db.collection("creators").document(creator_email).update({
            "onboarding_status": "completed",
            "profile_live": True,
            "current_step": 4 # Final step
        })
        
        return {"message": "Profile is now live!"}
    except Exception as e:
        print(f"Finalize Profile Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to finalize profile")