import bcrypt
from config.clients import db
from jwt_handler import create_jwt_token

def signup_service(name, email, password, role):
    try:
        users_ref = db.collection("users")
        existing = users_ref.where("email", "==", email).limit(1).get()
        if len(existing) > 0:
            return {"error": "Email already registered"}
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user_data = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
        }
        
        _, new_user_ref = users_ref.add(user_data)
        user_id = new_user_ref.id
        
        token = create_jwt_token(email, role)
        # Return all fields needed for authmeschema
        return {"email": email, "token": token, "role": role}
        
    except Exception as e:
        print(f"Creator Signup Error: {e}")
        return {"error": "Internal server error"}

def login_service(email, password):
    try:
        query = db.collection("users").where("email", "==", email).limit(1).get()
        if not query:
            return {"error": "Invalid email or password"}

        user_doc = query[0]
        user_data = user_doc.to_dict()

        if not bcrypt.checkpw(password.encode('utf-8'), user_data["password"].encode('utf-8')):
            return {"error": "Invalid email or password"}

        role = user_data.get("role")
        token = create_jwt_token(email, role)
        
        return {"email": email, "token": token, "role": role}
        
    except Exception as e:
        print(f"Creator Login Error: {e}")
        return {"error": "Internal server error"}