from pydantic import BaseModel,Field
from typing import Optional

class PricingSetupRequest(BaseModel):
    user_id: Optional[str]= None
    starting_price: float = Field(default=0.0)
    currency: str = "INR"
    price_unit: str = "per day"
    negotiable: bool = True

class PricingSetupResponse(BaseModel):
    message: str
    user_id: str
    starting_price: float
