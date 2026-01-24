from pydantic import BaseModel, EmailStr
from typing import Optional

class signupschema(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str

class loginschema(BaseModel):
    email: EmailStr
    password: str

class authmeschema(BaseModel):
    token: str
    email: EmailStr
    role: str

