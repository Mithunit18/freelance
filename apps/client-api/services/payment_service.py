import razorpay
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException
from google.cloud import firestore

from config.env import settings
from config.clients import db
from models.payment import Payment, PaymentStatus


# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

# Collection names
PAYMENTS_COLLECTION = "Payments"
USERS_COLLECTION = "Users"  #users collection name


def generate_payment_id() -> str:
    """Generate unique payment ID"""
    return f"PAY{uuid.uuid4().hex[:12].upper()}"


def create_razorpay_order(
    client_id: str,
    creator_id: str,
    request_id: str,
    amount: float,
    description: str
) -> Dict[str, Any]:
    """
    Create a Razorpay order for payment collection.
    Amount is collected to company account (escrow).
    """
    payment_id = generate_payment_id()
    amount_paise = int(amount * 100)  # Razorpay uses paise
    
    # PRODUCTION: Create actual Razorpay order
    try:
        order_data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": payment_id,
            "notes": {
                "request_id": request_id,
                "client_id": client_id,
                "creator_id": creator_id,
                "description": description
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        razorpay_order_id = order["id"]
        
        payment_data = {
            "id": payment_id,
            "request_id": request_id,
            "client_id": client_id,
            "creator_id": creator_id,
            "amount": amount,
            "status": PaymentStatus.PENDING,
            "created_at": datetime.now().isoformat(),
            "razorpay_order_id": razorpay_order_id,
            "description": description
        }
        
        # Save to Firestore
        db.collection(PAYMENTS_COLLECTION).document(payment_id).set(payment_data)
        # Also map order_id to payment (optional, or just query by order_id later)
        
        print(f"Razorpay order created: {razorpay_order_id}")
        
        return {
            "success": True,
            "payment_id": payment_id,
            "order_id": razorpay_order_id,
            "amount": amount,
            "amount_paise": amount_paise,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "message": "Order created. Complete payment using Razorpay Checkout",
            "simulation": False
        }
        
    except Exception as e:
        print(f"Razorpay error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Razorpay error: {str(e)}")


def verify_razorpay_payment(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> Dict[str, Any]:
    """
    Verify Razorpay payment signature and mark as escrowed.
    """
    # Find payment by Razorpay Order ID
    payments_ref = db.collection(PAYMENTS_COLLECTION)
    query = payments_ref.where("razorpay_order_id", "==", razorpay_order_id).limit(1)
    docs = query.stream()
    
    payment_doc_ref = None
    payment_data = None
    
    for doc in docs:
        payment_doc_ref = doc.reference
        payment_data = doc.to_dict()
        break
    
    if not payment_data:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # PRODUCTION: Verify signature
    try:
        params = {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params)
        
        # Signature verified - mark as escrowed
        update_data = {
             "status": PaymentStatus.ESCROWED,
             "razorpay_payment_id": razorpay_payment_id,
             "updated_at": datetime.now().isoformat()
        }
        payment_doc_ref.update(update_data)
        
        # Update local object for response
        payment_data.update(update_data)
        
        print(f" Payment verified and escrowed: {payment_data['id']}")
        
        return {
            "success": True,
            "message": f"₹{payment_data['amount']} received and held in escrow",
            "payment": payment_data,
            "status": "escrowed",
            "simulation": False
        }
        
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment signature verification failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment verification error: {str(e)}")


def check_payment_status(order_id_or_payment_id: str) -> Dict[str, Any]:
    """Check payment status by order ID or payment ID"""
    
    # Try finding by Payment ID first
    doc_ref = db.collection(PAYMENTS_COLLECTION).document(order_id_or_payment_id)
    doc = doc_ref.get()
    
    payment_data = None
    
    if doc.exists:
        payment_data = doc.to_dict()
    else:
        # Try finding by Razorpay Order ID
        query = db.collection(PAYMENTS_COLLECTION).where("razorpay_order_id", "==", order_id_or_payment_id).limit(1)
        docs = query.stream()
        for d in docs:
            doc_ref = d.reference
            payment_data = d.to_dict()
            break
            
    if not payment_data:
         raise HTTPException(status_code=404, detail="Payment not found")
    
    # Success is true for any valid payment status (escrowed or completed)
    is_valid_status = payment_data["status"] in [PaymentStatus.ESCROWED, PaymentStatus.COMPLETED]
    
    return {
        "success": is_valid_status,
        "message": f"Payment status: {payment_data['status']}",
        "payment": payment_data,
        "status": payment_data["status"],
        "simulation": False
    }


def get_payment_by_request(request_id: str) -> Optional[Dict[str, Any]]:
    """Find the latest payment for a request ID"""
    
    # Query for payments with this request ID, ordered by creation (newest first)
    # Note: Firestore queries require composite index for complex ordering, 
    # so we'll just filter in python if needed or simpler query
    
    query = db.collection(PAYMENTS_COLLECTION).where("request_id", "==", request_id)
    docs = query.stream()
    
    # Get the most recent one
    latest_payment = None
    latest_time = None
    
    for doc in docs:
        data = doc.to_dict()
        # Parse created_at string to compare
        try:
            created_at = datetime.fromisoformat(data["created_at"])
            if latest_time is None or created_at > latest_time:
                latest_time = created_at
                latest_payment = data
        except:
            continue
            
    return latest_payment



def confirm_and_release_payment(payment_id: str) -> Dict[str, Any]:
    """
    Client confirms delivery - release funds from escrow to creator.
    """
    doc_ref = db.collection(PAYMENTS_COLLECTION).document(payment_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    payment_data = doc.to_dict()
    
    if payment_data["status"] != PaymentStatus.ESCROWED:
        raise HTTPException(
            status_code=400,
            detail=f"Payment must be in escrow. Current: {payment_data['status']}"
        )
    
    creator_id = payment_data["creator_id"]
    amount = payment_data["amount"]
    
    # Run transaction to ensure atomicity
    transaction = db.transaction()
    _release_funds_transaction(transaction, doc_ref, creator_id, amount)
    
    # Refresh data
    payment_data["status"] = PaymentStatus.COMPLETED
    payment_data["completed_at"] = datetime.now().isoformat()
    
    print(f" ₹{amount} released to {creator_id}")
    
    return {
        "success": True,
        "message": f"₹{amount} released to creator",
        "payment": payment_data,
        "simulation": False
    }

@firestore.transactional
def _release_funds_transaction(transaction, payment_ref, creator_id, amount):
    # Read balance first (Read before Write rule)
    balance_ref = db.collection("balances").document(creator_id)
    snapshot = balance_ref.get(transaction=transaction)

    # Update payment status
    transaction.update(payment_ref, {
        "status": PaymentStatus.COMPLETED,
        "completed_at": datetime.now().isoformat()
    })
    
    # Update creator balance
    if snapshot.exists:
        new_balance = snapshot.get("amount") + amount
        transaction.update(balance_ref, {"amount": new_balance, "updated_at": datetime.now().isoformat()})
    else:
        transaction.set(balance_ref, {"amount": amount, "updated_at": datetime.now().isoformat()})


def get_payment(payment_id: str) -> Optional[Dict[str, Any]]:
    """Get payment by ID"""
    doc = db.collection(PAYMENTS_COLLECTION).document(payment_id).get()
    if doc.exists:
        return doc.to_dict()
    return None


def get_user_balance(user_id: str) -> float:
    """Get user's available balance"""
    doc = db.collection("balances").document(user_id).get()
    if doc.exists:
        return doc.get("amount")
    return 0
