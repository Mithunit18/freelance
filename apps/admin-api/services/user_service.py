from models.user import User

class UserService:
    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        return User(
            id=user_id,
            name="Admin User",
            email="admin@example.com",
            role="admin"
        )
    
    @staticmethod
    def get_greeting(name: str) -> str:
        return f"Hello, {name}! Welcome to Admin Dashboard."

user_service = UserService()