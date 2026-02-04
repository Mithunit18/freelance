from models.user import User

class UserService:
    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        # In real app, this would query the database
        # For now, return dummy data
        return User(
            id=user_id,
            name="John Doe",
            email="john@example.com",
            role="client"
        )
    
    @staticmethod
    def get_greeting(name: str) -> str:
        return f"Hello, {name}! Welcome to Client Portal."

user_service = UserService()