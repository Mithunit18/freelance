from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from services.claudinary_service import ClaudinaryService
from models.portfolio import PortfolioSetupRequest, PortfolioSetupResponse
from models.Auth import authmeschema  # Import the schema
from auth.get_current_user import get_current_user
from services.onboard_service import CreatorOnboardingService as service
from config.clients import db # Ensure Firestore db is imported
from typing import List

router = APIRouter(prefix="/api/creator/portfolio", tags=["Portfolio"])

@router.post("/setup", response_model=PortfolioSetupResponse)
async def setup_portfolio(request: PortfolioSetupRequest, current_user: authmeschema = Depends(get_current_user(allowed_roles=['photographer', 'videographer']))):
    """
    Setup creator portfolio in the 'creators' collection.
    Advances onboarding to Step 2 (Pricing).
    """
    try:
        # Use email from the auth cookie as the unique identifier
        creator_email = current_user.email
        
        # Prepare the data dictionary
        portfolio_data = {
            "profile_photo": request.profile_photo,
            "portfolio_images": request.portfolio_images,
            "portfolio_videos": [video.dict() for video in request.portfolio_videos],
            "categories": request.categories,
            "style_tags": request.style_tags,
            "email": creator_email  # Link to Auth collection
        }
        
        # Update the 'creators' collection specifically
        db.collection("creators").document(creator_email).set(portfolio_data, merge=True)
        
        # Advance onboarding step using the email as the document ID
        await service.update_step_data(
            user_id=creator_email, 
            data=portfolio_data, 
            next_step=2, 
            flag_name="portfolio_completed"
        )
        
        return PortfolioSetupResponse(
            message="Portfolio setup completed successfully",
            user_id=creator_email,
            embeddings_generated=False 
        )
    
    except Exception as e:
        print(f"Portfolio Setup Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save portfolio: {str(e)}")


@router.get("/get")
async def get_portfolio(current_user: authmeschema = Depends(get_current_user(allowed_roles=['photographer', 'videographer']))):
    """
    Fetch portfolio data from the 'creators' collection.
    """
    try:
        creator_email = current_user.email
        
        # Retrieve from 'creators' collection
        creator_doc = db.collection("creators").document(creator_email).get()
        
        if not creator_doc.exists:
            raise HTTPException(status_code=404, detail="Creator portfolio not found")
        
        user_data = creator_doc.to_dict()
        
        return {
            "user_id": creator_email,
            "profile_photo": user_data.get("profile_photo"),
            "portfolio_images": user_data.get("portfolio_images", []),
            "portfolio_videos": user_data.get("portfolio_videos", []),
            "categories": user_data.get("categories", []),
            "style_tags": user_data.get("style_tags", [])
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-image")
async def upload_portfolio_image(
    file: UploadFile = File(...), 
    current_user: authmeschema = Depends(get_current_user(allowed_roles=['photographer', 'videographer']))
):
    """
    Endpoint for uploading images. Now integrates with Cloudinary.
    """
    print(f"Upload initiated by: {current_user.email}")
    
    # Optional: Basic file type validation
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Pass the binary file object to the service
        secure_url = ClaudinaryService.upload_image(file.file)
        
        return {
            "message": "Image uploaded successfully",
            "url": secure_url
        }
    except Exception as e:
        print(f"Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload image to Cloudinary")