from fastapi import APIRouter, HTTPException, Depends
from models.pricing import PricingSetupRequest, PricingSetupResponse
from models.Auth import authmeschema
from auth.get_current_user import get_current_user
from services.onboard_service import CreatorOnboardingService as service
from config.clients import db 

router = APIRouter(prefix="/api/creator/pricing", tags=["Pricing"])

@router.post("/setup", response_model=PricingSetupResponse)
async def setup_pricing(request: PricingSetupRequest, current_user: authmeschema = Depends(get_current_user(allowed_roles=['photographer', 'videographer']))):
    """
    Setup creator pricing information in the 'creators' collection and advance to Step 3.
    """
    try:
        # 1. Use verified email from the auth cookie as the unique identifier
        creator_email = current_user.email
        
        # 2. Prepare the dictionary for Firestore
        pricing_data = {
            "starting_price": request.starting_price,
            "currency": request.currency,
            "price_unit": request.price_unit,
            "negotiable": request.negotiable,
            "email": creator_email
        }
        
        # 3. Update the 'creators' collection specifically
        db.collection("creators").document(creator_email).set(pricing_data, merge=True)
        
        # 4. Use the centralized service to update onboarding progress
        await service.update_step_data(
            user_id=creator_email, 
            data=pricing_data, 
            next_step=3, 
            flag_name="pricing_completed"
        )
        
        return PricingSetupResponse(
            message="Pricing setup completed successfully",
            user_id=creator_email,
            starting_price=request.starting_price
        )
    
    except Exception as e:
        print(f"Pricing Setup Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save pricing: {str(e)}")


@router.get("/get")
async def get_pricing(current_user: authmeschema = Depends(get_current_user(allowed_roles=['photographer', 'videographer']))):
    """
    Fetch existing pricing data from the 'creators' collection for the frontend.
    """
    try:
        creator_email = current_user.email
        
        # Retrieve from 'creators' collection
        creator_doc = db.collection("creators").document(creator_email).get()
        
        if not creator_doc.exists:
            raise HTTPException(status_code=404, detail="Creator pricing data not found")
        
        user_data = creator_doc.to_dict()
        
        return {
            "user_id": creator_email,
            "starting_price": user_data.get("starting_price"),
            "currency": user_data.get("currency", "INR"),
            "price_unit": user_data.get("price_unit", "per day"),
            "negotiable": user_data.get("negotiable", True)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))