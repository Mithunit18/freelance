from firebase_admin import firestore
from config.clients import db

class CreatorOnboardingService:
    @staticmethod
    def get_user_ref(user_id: str):
        return db.collection("creators").document(user_id)

    @staticmethod
    async def get_user_data(user_id: str):
        doc = CreatorOnboardingService.get_user_ref(user_id).get()
        return doc.to_dict() if doc.exists else {}

    @staticmethod
    async def update_step_data(user_id: str, data: dict, next_step: int, flag_name: str):
        """Updates user data, advances step, and sets completion flag."""
        ref = CreatorOnboardingService.get_user_ref(user_id)
        
        update_payload = {
            **data,
            "current_step": next_step,
            flag_name: True,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        ref.set(update_payload, merge=True)
        
        # Recalculate profile completeness for the Dashboard ring
        user_data = ref.get().to_dict()
        completeness = CreatorOnboardingService.calculate_completeness(user_data)
        ref.update({"profile_completeness": completeness})
        
        return completeness

    @staticmethod
    def calculate_completeness(data: dict) -> int:
        # Define fields required for 100% completeness
        fields = ["profile_photo", "portfolio_images", "starting_price", "full_name", "bio"]
        filled = sum(1 for f in fields if data.get(f))
        return int((filled / len(fields)) * 100)

    @staticmethod
    async def finalize_profile(user_id: str):
        """
        Finalizes the onboarding process.
        Marks the profile as live and status as completed.
        """
        ref = CreatorOnboardingService.get_user_ref(user_id)
        
        # Final update payload
        final_payload = {
            "onboarding_status": "completed",
            "profile_live": True,
            "current_step": 4,  # Stay at step 4
            "completed_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        # Set merge=True to preserve all previous onboarding data
        ref.set(final_payload, merge=True)
        
        # Final completeness recalculation
        user_data = ref.get().to_dict()
        completeness = CreatorOnboardingService.calculate_completeness(user_data)
        ref.update({"profile_completeness": completeness})
        
        return True