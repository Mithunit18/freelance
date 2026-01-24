import os
import sys
# Add current directory to path so imports work
sys.path.append(os.getcwd())

from config.env import settings
import razorpay

print(f"Checking Razorpay Configuration...")
print(f"Key ID: {settings.RAZORPAY_KEY_ID}")
print(f"Key Secret: {'*' * len(settings.RAZORPAY_KEY_SECRET)}")
print(f"Simulation Mode: {settings.PAYMENT_SIMULATION_MODE}")

try:
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    # Try to fetch a dummy order to test auth
    print("Testing connection to Razorpay API...")
    client.order.all({'count': 1})
    print("Connection Successful! Credentials are valid.")
except Exception as e:
    print(f"Connection Failed: {str(e)}")
