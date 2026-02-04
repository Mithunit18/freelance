import json
from fastapi import APIRouter, Response, HTTPException, Depends
from models.Auth import loginschema, signupschema, authmeschema
from services.Auth import signup_service, login_service
from auth.get_current_user import get_current_user
from config.clients import db
from urllib.parse import quote
router = APIRouter(prefix="/api/auth", tags=["Creator Authentication"])

COOKIE_NAME = "token"
MAX_AGE = 60 * 60 * 24  # 1 day

@router.post("/signup")
async def signup(request: signupschema, response: Response):
    result = signup_service(request.name, request.email, request.password, request.role)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Map result to your schema
    auth_data = authmeschema(token=result["token"], email=result["email"], role=result["role"])
    json_str = auth_data.model_dump_json()
    response.set_cookie(
        key=COOKIE_NAME,
        value=quote(json_str), # Securely encode for cookie safety
        httponly=True,
        samesite="none",
        secure=True, 
        max_age=MAX_AGE,
        path="/"
    )
    return {"message": "Creator registered successfully", "user": auth_data}

@router.post("/login")
async def login(request: loginschema, response: Response):
    result = login_service(request.email, request.password)

    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    
    auth_data = authmeschema(token=result["token"], email=result["email"], role=result["role"])
    json_str = auth_data.model_dump_json()
    response.set_cookie(
        key=COOKIE_NAME,
        value=quote(json_str), # Securely encode for cookie safety
        httponly=True,
        samesite="none",
        secure=True, 
        max_age=MAX_AGE,
        path="/"
    )
    return {"message": "Login successful", "user": auth_data}

@router.get("/me")
async def get_me(current_user: authmeschema = Depends(get_current_user())):
    user_data = {
        "email": current_user.email,
        "role": current_user.role,
        "token": current_user.token
    }
    
    # For creators, check if they have completed onboarding
    if current_user.role in ["photographer", "videographer", "both", "creator"]:
        try:
            # Check creators collection for profile completeness
            creator_doc = db.collection("creators").document(current_user.email).get()
            if creator_doc.exists:
                creator_data = creator_doc.to_dict()
                user_data["profile_completeness"] = creator_data.get("profile_completeness", 0)
                # Check both onboarding_status and profile_completeness
                onboarding_status = creator_data.get("onboarding_status", "")
                profile_live = creator_data.get("profile_live", False)
                # Creator has completed onboarding if status is "completed" OR profile is live
                user_data["onboarding_completed"] = (
                    onboarding_status == "completed" or 
                    profile_live == True or
                    creator_data.get("profile_completeness", 0) >= 100
                )
            else:
                user_data["profile_completeness"] = 0
                user_data["onboarding_completed"] = False
        except Exception as e:
            print(f"Error checking creator profile: {e}")
            user_data["profile_completeness"] = 0
            user_data["onboarding_completed"] = False
    
    # For clients, check if they have completed onboarding
    if current_user.role == "client":
        try:
            # Check clients collection for onboarding status
            client_doc = db.collection("clients").document(current_user.email).get()
            if client_doc.exists:
                client_data = client_doc.to_dict()
                user_data["client_onboarding_completed"] = client_data.get("onboarding_completed", False)
            else:
                # Also check users collection as fallback
                user_doc = db.collection("users").document(current_user.email).get()
                if user_doc.exists:
                    user_doc_data = user_doc.to_dict()
                    user_data["client_onboarding_completed"] = user_doc_data.get("client_onboarding_completed", False)
                else:
                    user_data["client_onboarding_completed"] = False
        except Exception as e:
            print(f"Error checking client onboarding status: {e}")
            user_data["client_onboarding_completed"] = False
    
    return {"user": user_data}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"message": "Logged out successfully"}