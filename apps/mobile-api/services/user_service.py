from models.user import User

class UserService:
    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        return User(
            id=user_id,
            name="Mobile User",
            email="mobile@example.com",
            role="mobile"
        )
    
    @staticmethod
    def get_greeting(name: str) -> str:
        return f"Hello, {name}! Welcome to Mobile App."

user_service = UserService()