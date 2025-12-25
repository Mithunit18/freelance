import json
from fastapi import APIRouter, Response, HTTPException, Depends
from models.Auth import loginschema, signupschema, authmeschema
from services.Auth import signup_service, login_service
from auth.get_current_user import get_current_user
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
        samesite="lax",
        secure=False, 
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
        samesite="lax",
        secure=False, 
        max_age=MAX_AGE,
        path="/"
    )
    return {"message": "Login successful", "user": auth_data}

@router.get("/me")
async def get_me(current_user: authmeschema = Depends(get_current_user)):
    return {"user": current_user}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"message": "Logged out successfully"}