from fastapi import APIRouter, HTTPException, Depends
from models.creator_details import CreatorDetailsRequest, CreatorDetailsResponse
from models.Auth import authmeschema
from auth.get_current_user import get_current_user
from services.onboard_service import CreatorOnboardingService as service
from config.clients import db 

router = APIRouter(prefix="/api/creator/details", tags=["Creator Details"])

@router.post("/setup", response_model=CreatorDetailsResponse)
async def setup_details(request: CreatorDetailsRequest, current_user: authmeschema = Depends(get_current_user)):
    try:
        # Use the email from the Auth cookie as the unique identifier for the creator document
        # We save this in a NEW collection called 'creators'
        creator_email = current_user.email
        
        details_data = {
            "email": creator_email, # Link to auth
            "full_name": request.full_name,
            "city": request.city,
            "operating_locations": request.operating_locations,
            "years_experience": request.years_experience,
            "bio": request.bio,
            "gear_list": request.gear_list,
            "languages": request.languages,
            "travel_available": request.travel_available,
            "role": current_user.role
        }
        
        # Logic: Update the 'creators' collection instead of 'users'
        # We use the email as the document ID for easy retrieval
        db.collection("creators").document(creator_email).set(details_data, merge=True)
        
        # Calculate completeness via service (passing creator_email instead of user_id)
        completeness = await service.update_step_data(
            user_id=creator_email, 
            data=details_data, 
            next_step=4, 
            flag_name="details_completed"
        )
        
        return CreatorDetailsResponse(
            message="Creator profile details saved successfully",
            user_id=creator_email,
            profile_completeness=completeness
        )
    
    except Exception as e:
        # Detailed error logging helps debug 500 errors
        print(f"Error in setup_details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save creator details: {str(e)}")

@router.get("/get")
async def get_details(current_user: authmeschema = Depends(get_current_user)):
    try:
        creator_email = current_user.email
        
        # Retrieve from the 'creators' collection
        creator_doc = db.collection("creators").document(creator_email).get()
        
        if not creator_doc.exists:
            # If they exist in Auth but haven't filled details yet, return empty defaults
            return {"email": creator_email, "full_name": "", "profile_completeness": 0}
        
        user_data = creator_doc.to_dict()
        
        return {
            "user_id": creator_email,
            "full_name": user_data.get("full_name"),
            "city": user_data.get("city"),
            "operating_locations": user_data.get("operating_locations", []),
            "years_experience": user_data.get("years_experience"),
            "bio": user_data.get("bio"),
            "gear_list": user_data.get("gear_list", []),
            "languages": user_data.get("languages", []),
            "travel_available": user_data.get("travel_available", True),
            "profile_completeness": user_data.get("profile_completeness", 0)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving creator data: {str(e)}")