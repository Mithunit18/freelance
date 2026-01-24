# Quick script to add phone_number to a client in Firestore
# Run this after creating a client via signup

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.clients import db

def add_phone_to_client(client_email: str, phone_number: str):
    """Add phone_number to an existing client in the users collection"""
    
    # Find the user by email
    users_query = db.collection("users").where("email", "==", client_email).limit(1).stream()
    
    user_doc = None
    for doc in users_query:
        user_doc = doc
        break
    
    if not user_doc:
        print(f"❌ User with email '{client_email}' not found in users collection")
        return False
    
    # Update with phone_number
    db.collection("users").document(user_doc.id).update({
        "phone_number": phone_number
    })
    
    print(f"✅ Phone number '{phone_number}' added to user '{client_email}'")
    return True


if __name__ == "__main__":
    # Change these values as needed
    CLIENT_EMAIL = "client@gmail.com"  # The email used during signup
    PHONE_NUMBER = "7695843923"  # Phone number without country code
    
    add_phone_to_client(CLIENT_EMAIL, PHONE_NUMBER)
