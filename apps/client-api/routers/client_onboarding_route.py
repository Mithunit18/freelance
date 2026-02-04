from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from models.client_onboarding import (
    ClientOnboardingRequest, 
    ClientOnboardingResponse, 
    ClientProfileUpdateRequest
)
from models.Auth import authmeschema
from auth.get_current_user import get_current_user
from services.client_onboarding_service import ClientOnboardingService
from services.claudinary_service import ClaudinaryService

router = APIRouter(prefix="/api/client/onboarding", tags=["Client Onboarding"])


@router.post("/submit", response_model=ClientOnboardingResponse)
async def submit_onboarding(
    request: ClientOnboardingRequest, 
    current_user: authmeschema = Depends(get_current_user)
):
    """
    Submit client onboarding data.
    Saves profile information and marks onboarding as completed.
    """
    try:
        client_email = current_user.email
        
        # Prepare the data dictionary
        onboarding_data = {
            "full_name": request.full_name,
            "phone_number": request.phone_number,
            "gender": request.gender,
            "date_of_birth": request.date_of_birth,
            "profile_photo": request.profile_photo,
            "address": request.address,
            "city": request.city,
            "state": request.state,
            "pincode": request.pincode,
            "occupation": request.occupation,
            "company_name": request.company_name,
            "preferred_categories": request.preferred_categories,
            "role": "client",
        }
        
        # Save to Firestore
        await ClientOnboardingService.save_onboarding_data(client_email, onboarding_data)
        
        return ClientOnboardingResponse(
            message="Client profile saved successfully",
            user_id=client_email,
            onboarding_completed=True
        )
    
    except Exception as e:
        print(f"Error in client onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save client profile: {str(e)}")


@router.get("/get")
async def get_onboarding_data(current_user: authmeschema = Depends(get_current_user)):
    """
    Fetch existing client onboarding/profile data.
    """
    try:
        client_email = current_user.email
        
        client_data = await ClientOnboardingService.get_client_data(client_email)
        
        if not client_data:
            # Return empty data if no profile exists yet
            return {
                "email": client_email,
                "full_name": "",
                "onboarding_completed": False
            }
        
        return {
            "email": client_email,
            "full_name": client_data.get("full_name"),
            "phone_number": client_data.get("phone_number"),
            "gender": client_data.get("gender"),
            "date_of_birth": client_data.get("date_of_birth"),
            "profile_photo": client_data.get("profile_photo"),
            "address": client_data.get("address"),
            "city": client_data.get("city"),
            "state": client_data.get("state"),
            "pincode": client_data.get("pincode"),
            "occupation": client_data.get("occupation"),
            "company_name": client_data.get("company_name"),
            "preferred_categories": client_data.get("preferred_categories", []),
            "onboarding_completed": client_data.get("onboarding_completed", False),
        }
    
    except Exception as e:
        print(f"Error fetching client data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch client data: {str(e)}")


@router.get("/status")
async def get_onboarding_status(current_user: authmeschema = Depends(get_current_user)):
    """
    Check if client has completed onboarding.
    """
    try:
        client_email = current_user.email
        status = await ClientOnboardingService.check_onboarding_status(client_email)
        return status
    
    except Exception as e:
        print(f"Error checking onboarding status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check onboarding status")


@router.put("/update")
async def update_profile(
    request: ClientProfileUpdateRequest,
    current_user: authmeschema = Depends(get_current_user)
):
    """
    Update client profile data.
    Only updates the fields that are provided.
    """
    try:
        client_email = current_user.email
        
        # Convert request to dict, filtering out None values
        update_data = request.model_dump(exclude_none=True)
        
        if not update_data:
            return {"message": "No data to update", "user_id": client_email}
        
        await ClientOnboardingService.update_profile(client_email, update_data)
        
        return {
            "message": "Profile updated successfully",
            "user_id": client_email
        }
    
    except Exception as e:
        print(f"Error updating client profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


@router.post("/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: authmeschema = Depends(get_current_user)
):
    """
    Upload a profile photo to Cloudinary.
    Returns the secure URL of the uploaded image.
    """
    print(f"Profile photo upload initiated by: {current_user.email}")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Upload to Cloudinary with a specific folder for client profile photos
        file_content = await file.read()
        print(f"File size: {len(file_content)} bytes")
        
        image_url = ClaudinaryService.upload_image(
            file_content, 
            folder="client_profile_photos"
        )
        
        print(f"Cloudinary returned URL: {image_url}")
        
        if not image_url:
            raise HTTPException(status_code=500, detail="Failed to get image URL from Cloudinary")
        
        return {
            "success": True,
            "url": image_url,
            "message": "Profile photo uploaded successfully"
        }
    
    except Exception as e:
        print(f"Profile photo upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
