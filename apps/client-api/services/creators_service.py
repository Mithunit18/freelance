# apps/client-api/services/creators_service.py
from config.clients import db
from typing import Optional, Dict, Any, List
from models.creatorDetails import CreatorDetails

CREATORS_COLLECTION = "creators"  # Make sure this matches your Firebase collection name
ALLOWED_ROLES = ["photographer", "videographer", "both"]

def transform_creator_data(doc_data: Dict, doc_id: str) -> Dict:
    """Transform Firebase creator data to match frontend expectations"""
    return {
        "id": doc_id,
        # Map Firebase fields to frontend expected fields
        "name": doc_data.get("full_name", ""),
        "full_name": doc_data.get("full_name", ""),
        "email": doc_data.get("email", ""),
        "role": doc_data.get("role", ""),
        "specialisation": doc_data.get("role", "").title() if doc_data.get("role") else "Creator",
        "bio": doc_data.get("bio", ""),
        
        # Profile image
        "profileImage": doc_data.get("profile_photo", ""),
        "profile_photo": doc_data.get("profile_photo", ""),
        
        # Location
        "location": {
            "city": doc_data.get("city", ""),
            "country": "India"  # Default or fetch from data if available
        },
        "city": doc_data.get("city", ""),
        "operating_locations": doc_data.get("operating_locations", []),
        "travel_available": doc_data.get("travel_available", False),
        
        # Categories and Tags
        "categories": doc_data.get("categories", []),
        "tags": doc_data.get("style_tags", []),
        "style_tags": doc_data.get("style_tags", []),
        
        # Experience
        "years_experience": doc_data.get("years_experience", 0),
        "experience": f"{doc_data.get('years_experience', 0)} years" if doc_data.get('years_experience') else None,
        
        # Languages and Gear
        "languages": doc_data.get("languages", []),
        "gear": doc_data.get("gear_list", []),
        "gear_list": doc_data.get("gear_list", []),
        
        # Pricing
        "starting_price": doc_data.get("starting_price", 0),
        "price_unit": doc_data.get("price_unit", ""),
        "currency": doc_data.get("currency", "INR"),
        "negotiable": doc_data.get("negotiable", False),
        "price": f"₹{doc_data.get('starting_price', 0):,} {doc_data.get('price_unit', '')}" if doc_data.get('starting_price') else None,
        
        # Portfolio
        "portfolioImages": doc_data.get("portfolio_images", []),
        "portfolio_images": doc_data.get("portfolio_images", []),
        "portfolio_videos": doc_data.get("portfolio_videos", []),
        
        # Verification
        "verified": doc_data.get("verification_status") == "verified",
        "verification_status": doc_data.get("verification_status", "pending"),
        "profile_live": doc_data.get("profile_live", False),
        "profile_completeness": doc_data.get("profile_completeness", 0),
        
        # Rating (placeholder - can be calculated from reviews)
        "rating": doc_data.get("rating", 4.5),  # Default rating or calculate
        "reviews": doc_data.get("reviews", 0),
    }

def get_featured_creators() -> List[Dict]:
    """Fetch all live creators from Firebase"""
    try:
        creators_ref = db.collection(CREATORS_COLLECTION)
        # Only fetch creators with profile_live = true
        query = creators_ref.where("profile_live", "==", True)
        creators_docs = query.get()
        
        creators = []
        for doc in creators_docs:
            doc_data = doc.to_dict()
            transformed = transform_creator_data(doc_data, doc.id)
            creators.append(transformed)
        
        print(f"✅ Fetched {len(creators)} live creators")
        return creators

    except Exception as e:
        print(f"❌ Firestore error in get_featured_creators: {e}")
        # Fallback: try to get all creators without filter
        try:
            creators_ref = db.collection(CREATORS_COLLECTION)
            creators_docs = creators_ref.get()
            creators = []
            for doc in creators_docs:
                doc_data = doc.to_dict()
                transformed = transform_creator_data(doc_data, doc.id)
                creators.append(transformed)
            print(f"✅ Fetched {len(creators)} creators (fallback)")
            return creators
        except Exception as e2:
            print(f"❌ Fallback error: {e2}")
            return []

def get_creator_by_id(creator_id: str) -> Optional[Dict]:
    """Fetch a single creator by ID"""
    try:
        doc_ref = db.collection(CREATORS_COLLECTION).document(creator_id)
        doc = doc_ref.get()
        if doc.exists:
            doc_data = doc.to_dict()
            return transform_creator_data(doc_data, doc.id)
        return None
    except Exception as e:
        print(f"❌ get_creator_by_id error: {e}")
        return None

# small helpers for creators to add content
def push_gallery_item(creator_id: str, image_url: str) -> bool:
    try:
        from google.cloud.firestore import ArrayUnion
        doc_ref = db.collection(CREATORS_COLLECTION).document(creator_id)
        doc_ref.update({"gallery": ArrayUnion([image_url])})
        return True
    except Exception as e:
        print("push_gallery_item error:", e)
        return False

def upsert_creator_section(creator_id: str, section: str, value):
    try:
        doc_ref = db.collection(CREATORS_COLLECTION).document(creator_id)
        doc_ref.update({section: value})
        return True
    except Exception as e:
        print("upsert_creator_section error:", e)
        return False