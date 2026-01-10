# apps/client-api/routers/creators_route.py
from fastapi import APIRouter, HTTPException, Query
from services.creators_service import (
    get_creator_by_id, 
    push_gallery_item, 
    upsert_creator_section,
    get_featured_creators,
    get_all_creators
)
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/creators", tags=["Creators"])

@router.get("/")
async def get_creators(
    category: Optional[str] = Query(None, description="Filter by category (photographer/videographer)"),
    location: Optional[str] = Query(None, description="Filter by location/city"),
    price_min: Optional[int] = Query(None, description="Minimum price"),
    price_max: Optional[int] = Query(None, description="Maximum price"),
    rating: Optional[float] = Query(None, description="Minimum rating"),
    styles: Optional[str] = Query(None, description="Comma-separated style tags")
):
    """
    Fetch all creators with optional filters
    """
    filters = {
        "category": category,
        "location": location,
        "price_min": price_min,
        "price_max": price_max,
        "rating": rating,
        "styles": styles.split(",") if styles else None
    }
    creators = get_all_creators(filters)
    return {"success": True, "creators": creators, "count": len(creators)}

@router.get("/featured/")
async def get_featured():
    creators = get_featured_creators()
    return {"success": True, "creators": creators, "count": len(creators)}

@router.get("/{creator_id}")
async def get_creator(creator_id: str):
    data = get_creator_by_id(creator_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Creator not found")
    # inject id
    data["id"] = creator_id
    return {"success": True, "data": data}

# Creator-only endpoints to add content
@router.post("/{creator_id}/gallery")
async def add_gallery(creator_id: str, payload: dict):
    ok = push_gallery_item(creator_id, payload.get("image_url"))
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to add gallery image")
    return {"success": True}
    
@router.post("/{creator_id}/section/{section_name}")
async def update_section(creator_id: str, section_name: str, payload: dict):
    ok = upsert_creator_section(creator_id, section_name, payload.get("value"))
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to update section")
    return {"success": True}