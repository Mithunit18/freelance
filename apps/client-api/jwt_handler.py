import jwt
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

# --- Configuration ---
# In production, these should be in a .env file
# SECRET_KEY = os.getenv("SECRET_KEY", "your-fallback-secret-key")
SECRET_KEY = "your_super_secret_random_string_here" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

def create_jwt_token(email: str, role: str) -> str:
    """
    Generates a signed JWT token.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 'sub' is the standard key for the subject (the user's unique ID/Email)
    payload = {
        "sub": email,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_jwt_token(token: str) -> Optional[dict]:
    """
    Decodes and validates a JWT token. 
    Returns the payload if valid, None if expired or tampered with.
    """
    try:
        decoded_payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_payload
    except jwt.ExpiredSignatureError:
        # Token has passed its expiration time
        return None
    except jwt.InvalidTokenError:
        # Token is malformed or the signature doesn't match
        return None