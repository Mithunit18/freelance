from firebase_admin import firestore
from config.clients import db
from typing import Optional, Dict, Any


class ClientOnboardingService:
    """Service for managing client onboarding and profile data in Firestore"""
    
    COLLECTION_NAME = "clients"
    
    @staticmethod
    def get_client_ref(client_email: str):
        """Get reference to a client document"""
        return db.collection(ClientOnboardingService.COLLECTION_NAME).document(client_email)
    
    @staticmethod
    async def get_client_data(client_email: str) -> Optional[Dict[str, Any]]:
        """Fetch client data from Firestore"""
        doc = ClientOnboardingService.get_client_ref(client_email).get()
        return doc.to_dict() if doc.exists else None
    
    @staticmethod
    async def save_onboarding_data(client_email: str, data: Dict[str, Any]) -> bool:
        """
        Save client onboarding data to Firestore.
        Also marks the onboarding as completed and updates the users collection.
        """
        try:
            ref = ClientOnboardingService.get_client_ref(client_email)
            
            # Prepare the data with metadata
            onboarding_data = {
                **data,
                "email": client_email,
                "onboarding_completed": True,
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
            
            # Save to clients collection
            ref.set(onboarding_data, merge=True)
            
            # Also update the users collection to mark client onboarding as completed
            users_ref = db.collection("users").document(client_email)
            users_ref.set({
                "client_onboarding_completed": True,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }, merge=True)
            
            return True
        except Exception as e:
            print(f"Error saving client onboarding data: {str(e)}")
            raise e
    
    @staticmethod
    async def update_profile(client_email: str, data: Dict[str, Any]) -> bool:
        """
        Update client profile data in Firestore.
        Only updates provided fields.
        """
        try:
            ref = ClientOnboardingService.get_client_ref(client_email)
            
            # Filter out None values
            update_data = {k: v for k, v in data.items() if v is not None}
            
            if not update_data:
                return True
            
            # Add timestamp
            update_data["updated_at"] = firestore.SERVER_TIMESTAMP
            
            # Update the document
            ref.set(update_data, merge=True)
            
            return True
        except Exception as e:
            print(f"Error updating client profile: {str(e)}")
            raise e
    
    @staticmethod
    async def check_onboarding_status(client_email: str) -> Dict[str, Any]:
        """
        Check if a client has completed onboarding.
        """
        try:
            client_data = await ClientOnboardingService.get_client_data(client_email)
            
            if not client_data:
                return {
                    "completed": False,
                    "status": "not_started"
                }
            
            is_completed = client_data.get("onboarding_completed", False)
            
            return {
                "completed": is_completed,
                "status": "completed" if is_completed else "in_progress"
            }
        except Exception as e:
            print(f"Error checking onboarding status: {str(e)}")
            return {
                "completed": False,
                "status": "error"
            }
