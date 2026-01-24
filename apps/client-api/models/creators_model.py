# apps/client-api/models/creators_models.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Package(BaseModel):
    id: Optional[str]
    title: str
    price: float
    description: Optional[str] = None
    duration_days: Optional[int] = None

class Review(BaseModel):
    id: Optional[str]
    client_id: Optional[str]
    rating: int
    comment: Optional[str]

class LocationModel(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None

class CreatorProfile(BaseModel):
    id: Optional[str]
    name: Optional[str]
    bio: Optional[str]
    gallery: Optional[List[str]] = []
    packages: Optional[List[Package]] = []
    reviews: Optional[List[Review]] = []
    gear: Optional[List[str]] = []
    location: Optional[LocationModel] = None
    role: Optional[str] = None
    extra: Optional[Dict[str, Any]] = {}