import json
from urllib.parse import unquote
from fastapi import Request, HTTPException
from models.Auth import authmeschema
from jwt_handler import decode_jwt_token  # Import the decoder

async def get_current_user(request: Request) -> authmeschema:
    cookie_str = request.cookies.get("token")
    if not cookie_str:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # 1. Decode the URL-encoded JSON string
        decoded_data = unquote(cookie_str)
        data = json.loads(decoded_data)
        user_session = authmeschema(**data)

        # 2. VALIDATE THE TOKEN
        # This ensures the user hasn't tampered with the 'role' or 'email' in the JSON
        payload = decode_jwt_token(user_session.token)
        
        if payload is None:
            raise HTTPException(status_code=401, detail="Session expired or invalid token")
            
        # 3. Double-check that the token belongs to the email in the JSON
        if payload.get("sub") != user_session.email:
            raise HTTPException(status_code=401, detail="Token mismatch")

        return user_session
        
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session data")