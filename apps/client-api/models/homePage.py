from pydantic import BaseModel,EmailStr;

class HomePage(BaseModel):
    name:str
    email:EmailStr
    message:str