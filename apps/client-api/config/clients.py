import firebase_admin
from firebase_admin import credentials, firestore
from .env import settings

# Global variables to hold the initialized app and database client
firebase_app = None
db = None

try:
    # Verify that the private key exists before attempting to initialize
    if settings.FIREBASE_PRIVATE_KEY and "BEGIN PRIVATE KEY" in settings.FIREBASE_PRIVATE_KEY:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
            "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "client_id": settings.FIREBASE_CLIENT_ID,
            "auth_uri": settings.FIREBASE_AUTH_URI,
            "token_uri": settings.FIREBASE_TOKEN_URI,
            "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_CERT_URL,
            "client_x509_cert_url": settings.FIREBASE_CLIENT_CERT_URL
        })

        # Initialize the Firebase app
        firebase_app = firebase_admin.initialize_app(cred)
        
        # Initialize the Firestore Client
        db = firestore.client()

        print(f"🔥 Firestore successfully connected to project: {settings.FIREBASE_PROJECT_ID}")

    else:
        print("⚠️ Error: FIREBASE_PRIVATE_KEY not found or invalid format in environment.")

except Exception as e:
    print(f"❌ Failed to initialize Firebase: {e}")