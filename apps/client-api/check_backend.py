import sys
import os
sys.path.append(os.getcwd())

print("Attempting to import payment_service...")
try:
    from services import payment_service
    print("payment_service imported successfully")
except Exception as e:
    print(f"Failed to import payment_service: {e}")

print("Checking DB connection...")
from config.clients import db
if db is None:
    print("DB is None! This will cause crashes.")
else:
    print("DB is initialized")
