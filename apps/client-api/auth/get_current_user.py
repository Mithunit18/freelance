import json
from urllib.parse import unquote
from fastapi import Request, HTTPException, Depends
from models.Auth import authmeschema
from jwt_handler import decode_jwt_token

# 1. CHANGE: The outer function now accepts the roles configuration
def get_current_user(allowed_roles: list[str] = None):
    """
    Factory function that returns the actual dependency.
    Usage: Depends(get_current_user(allowed_roles=["admin"]))
    """
    
    # 2. CHANGE: Your original logic moves inside this inner function
    async def user_dependency(request: Request) -> authmeschema:
        cookie_str = request.cookies.get("token")
        if not cookie_str:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        try:
            # --- Your Existing Decoding Logic ---
            decoded_data = unquote(cookie_str)
            data = json.loads(decoded_data)
            user_session = authmeschema(**data)

            # --- Your Existing Token Validation ---
            payload = decode_jwt_token(user_session.token)
            
            if payload is None:
                raise HTTPException(status_code=401, detail="Session expired or invalid token")
                
            if payload.get("sub") != user_session.email:
                raise HTTPException(status_code=401, detail="Token mismatch")

            # 3. ADDED: Verify the Role
            # If roles were specified in the Depends(), check them here
            if allowed_roles is not None:
                # We assume user_session.role is a string. 
                # If your user can have multiple roles, adjust logic accordingly.
                if user_session.role not in allowed_roles:
                     raise HTTPException(
                        status_code=403, 
                        detail=f"Operation not permitted. Requires: {allowed_roles}"
                    )

            return user_session
            
        except HTTPException as he:
            raise he
        except Exception as e:
            # It's good practice to log 'e' here for debugging
            raise HTTPException(status_code=401, detail="Invalid session data")

    # 4. CHANGE: Return the inner function
    return user_dependency