from pydantic import BaseModel
from typing import List, Optional

class PortfolioImage(BaseModel):
    url: str
    caption: Optional[str] = None
    order: int

class PortfolioVideo(BaseModel):
    url: str
    thumbnail: Optional[str] = None
    title: Optional[str] = None

class CategoryEnum:
    WEDDING = "Wedding"
    PRE_WEDDING = "Pre-wedding"
    EVENT = "Event"
    CORPORATE = "Corporate"
    FASHION = "Fashion"
    PRODUCT = "Product"
    PORTRAIT = "Portrait"
    LANDSCAPE = "Landscape"

class StyleTagEnum:
    CINEMATIC = "Cinematic"
    NATURAL = "Natural"
    BRIGHT_AIRY = "Bright & Airy"
    MOODY = "Moody"
    DOCUMENTARY = "Documentary"
    VINTAGE = "Vintage"
    MODERN = "Modern"
    ARTISTIC = "Artistic"

class PortfolioSetupRequest(BaseModel):
    # Optional in the request because we get it from the cookie
    user_id: Optional[str] = None 
    profile_photo: Optional[str] = None
    portfolio_images: List[str] = []
    portfolio_videos:Optional[List[PortfolioVideo]] = []
    categories: List[str] = []
    style_tags: List[str] = []

class PortfolioSetupResponse(BaseModel):
    message: str
    user_id: str
    embeddings_generated: bool = False
