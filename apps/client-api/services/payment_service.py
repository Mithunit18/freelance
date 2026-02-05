import razorpay
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException
from google.cloud import firestore

from config.env import settings
from config.clients import db
from models.payment import PaymentStatus


# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

# Collection names
PAYMENTS_COLLECTION = "Payments"
USERS_COLLECTION = "Users"  #users collection name
BOOKINGS_COLLECTION = "Bookings"
REQUESTS_COLLECTION = "Requests"

# Auto-release configuration
AUTO_RELEASE_DAYS_AFTER_EVENT = 3  # Release payment 3 days after event date


def generate_payment_id() -> str:
    """Generate unique payment ID"""
    return f"PAY{uuid.uuid4().hex[:12].upper()}"


def generate_booking_id() -> str:
    """Generate unique booking ID"""
    return f"BK{uuid.uuid4().hex[:8].upper()}"


def _create_booking_from_payment(payment_data: Dict[str, Any]) -> Optional[str]:
    """
    Create a booking record when payment is confirmed (escrowed).
    This populates the Confirmed Bookings tab in client dashboard.
    """
    try:
        request_id = payment_data.get("request_id")
        if not request_id:
            print("Warning: No request_id in payment data, cannot create booking")
            return None
        
        # Check if booking already exists for this request
        existing_bookings = db.collection(BOOKINGS_COLLECTION).where(
            "requestId", "==", request_id
        ).limit(1).stream()
        
        for doc in existing_bookings:
            print(f"Booking already exists for request {request_id}")
            return doc.id
        
        # Fetch request details to populate booking info
        request_doc = db.collection(REQUESTS_COLLECTION).document(request_id).get()
        request_data = request_doc.to_dict() if request_doc.exists else {}
        
        # Fetch creator details
        creator_id = payment_data.get("creator_id") or request_data.get("creatorId")
        creator_data = {}
        if creator_id:
            creator_doc = db.collection("creators").document(creator_id).get()
            if creator_doc.exists:
                creator_data = creator_doc.to_dict()
        
        booking_id = generate_booking_id()
        
        # Create comprehensive booking record
        booking_data = {
            "id": booking_id,
            "requestId": request_id,
            "paymentId": payment_data.get("id"),
            
            # Client info
            "clientId": payment_data.get("client_id") or request_data.get("clientId"),
            
            # Creator info
            "creatorId": creator_id,
            "creatorName": creator_data.get("full_name") or request_data.get("creatorName", "Creator"),
            "creatorEmail": creator_id,
            "creatorPhone": creator_data.get("phone_number"),
            "creatorProfileImage": creator_data.get("profile_image"),
            
            # Service details
            "serviceType": request_data.get("serviceType") or request_data.get("category", "Photography"),
            "specialty": request_data.get("package", {}).get("name") or request_data.get("serviceType", "Photography"),
            
            # Event details
            "eventDate": request_data.get("eventDate"),
            "location": request_data.get("location", ""),
            "duration": request_data.get("duration"),
            
            # Package details
            "package": request_data.get("package"),
            "deliverables": request_data.get("deliverables") or request_data.get("package", {}).get("deliverables", []),
            
            # Pricing
            "amount": payment_data.get("amount"),
            "price": f"₹{payment_data.get('amount', 0):,.0f}",
            
            # Status
            "status": "confirmed",
            "paymentStatus": "escrowed",
            "escrowStatus": "held",
            
            # Razorpay details
            "razorpayOrderId": payment_data.get("razorpay_order_id"),
            "razorpayPaymentId": payment_data.get("razorpay_payment_id"),
            
            # Timestamps
            "bookedAt": datetime.now().isoformat(),
            "createdAt": int(datetime.now().timestamp() * 1000),
            "updatedAt": int(datetime.now().timestamp() * 1000),
        }
        
        # Save booking
        db.collection(BOOKINGS_COLLECTION).document(booking_id).set(booking_data)
        
        # Update the request status to 'paid'
        if request_doc.exists:
            db.collection(REQUESTS_COLLECTION).document(request_id).update({
                "status": "paid",
                "paymentId": payment_data.get("id"),
                "bookingId": booking_id,
                "paidAt": datetime.now().isoformat(),
                "updatedAt": int(datetime.now().timestamp() * 1000)
            })
        
        print(f"Booking created: {booking_id} for request {request_id}")
        return booking_id
        
    except Exception as e:
        print(f"Error creating booking: {str(e)}")
        return None


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
    Also creates a booking record for the confirmed booking.
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
        
        # Create booking record for confirmed bookings tab
        _create_booking_from_payment(payment_data)
        
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



def confirm_and_release_payment(payment_id: str, trigger_payout: bool = True) -> Dict[str, Any]:
    """
    Client confirms delivery - release funds from escrow to creator.
    This updates the payment status, adds to creator's balance, AND transfers to bank.
    
    Args:
        payment_id: The payment ID to release
        trigger_payout: If True, also initiate bank transfer (default: True)
    """
    import asyncio
    
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
    
    # Calculate platform fee (e.g., 10%)
    platform_fee_percent = 0.10
    platform_fee = round(amount * platform_fee_percent, 2)
    creator_amount = round(amount - platform_fee, 2)
    
    # Run transaction to ensure atomicity
    transaction = db.transaction()
    _release_funds_transaction(transaction, doc_ref, creator_id, creator_amount, platform_fee)
    
    # Refresh data
    payment_data["status"] = PaymentStatus.COMPLETED
    payment_data["completed_at"] = datetime.now().isoformat()
    payment_data["platform_fee"] = platform_fee
    payment_data["creator_amount"] = creator_amount
    
    print(f"₹{creator_amount} released to {creator_id} (Platform fee: ₹{platform_fee})")
    
    # Trigger actual bank transfer
    payout_result = None
    payout_success = False
    payout_message = ""
    
    if trigger_payout and creator_id and creator_amount > 0:
        try:
            print(f"[PAYOUT] Initiating bank transfer of ₹{creator_amount} to {creator_id}...")
            
            # Run the async payout function
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If already in async context, create a new loop in thread
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = executor.submit(
                            asyncio.run,
                            process_creator_payout(creator_id, creator_amount, payment_id)
                        )
                        payout_result = future.result(timeout=30)
                else:
                    payout_result = asyncio.run(
                        process_creator_payout(creator_id, creator_amount, payment_id)
                    )
            except RuntimeError:
                # No event loop exists, create one
                payout_result = asyncio.run(
                    process_creator_payout(creator_id, creator_amount, payment_id)
                )
            
            payout_success = payout_result.get("success", False)
            payout_message = payout_result.get("message", "")
            
            if payout_success:
                print(f"[PAYOUT] Bank transfer successful for {creator_id}: {payout_message}")
            else:
                print(f"[PAYOUT] Bank transfer failed for {creator_id}: {payout_message}")
                
        except Exception as payout_error:
            payout_message = str(payout_error)
            print(f"[PAYOUT] Bank transfer error for {creator_id}: {payout_message}")
    
    # Update payment with payout info
    db.collection(PAYMENTS_COLLECTION).document(payment_id).update({
        "payout_initiated": payout_success,
        "payout_result": payout_message,
        "payout_attempted_at": datetime.now().isoformat()
    })
    
    return {
        "success": True,
        "message": f"₹{creator_amount} released to creator (Platform fee: ₹{platform_fee})",
        "payment": payment_data,
        "creator_amount": creator_amount,
        "platform_fee": platform_fee,
        "payout_initiated": payout_success,
        "payout_message": payout_message,
        "simulation": settings.PAYMENT_SIMULATION_MODE
    }

@firestore.transactional
def _release_funds_transaction(transaction, payment_ref, creator_id, creator_amount, platform_fee):
    # Read balance first (Read before Write rule)
    balance_ref = db.collection("balances").document(creator_id)
    snapshot = balance_ref.get(transaction=transaction)

    # Update payment status with fee breakdown
    transaction.update(payment_ref, {
        "status": PaymentStatus.COMPLETED,
        "completed_at": datetime.now().isoformat(),
        "platform_fee": platform_fee,
        "creator_amount": creator_amount
    })
    
    # Update creator balance (pending balance - ready for payout)
    if snapshot.exists:
        current = snapshot.to_dict()
        new_balance = current.get("amount", 0) + creator_amount
        transaction.update(balance_ref, {
            "amount": new_balance, 
            "pending_payout": new_balance,
            "updated_at": datetime.now().isoformat()
        })
    else:
        transaction.set(balance_ref, {
            "amount": creator_amount, 
            "pending_payout": creator_amount,
            "total_paid": 0,
            "updated_at": datetime.now().isoformat()
        })


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


async def process_creator_payout(creator_email: str, amount: float, payment_id: str) -> Dict[str, Any]:
    """
    Process payout to creator's bank account using RazorpayX.
    
    This function:
    1. Gets the creator's fund account from Firestore
    2. Creates a payout via RazorpayX
    3. Updates the payment and balance records
    
    Note: Requires RazorpayX activation. In simulation mode, this is skipped.
    """
    from services.bank_validation_service import bank_validation_service
    
    try:
        # First, verify creator has bank details set up
        bank_details = await bank_validation_service.get_bank_details(creator_email)
        
        if not bank_details:
            return {
                "success": False,
                "message": "Creator has not set up bank account for payouts. Please complete bank details in onboarding."
            }
        
        # Extract bank info for display
        bank_name = bank_details.get("bank_name", "Unknown Bank")
        account_last4 = bank_details.get("account_number_last4", "****")
        ifsc_code = bank_details.get("ifsc_code", "")
        account_holder = bank_details.get("account_holder_name", "")
        
        print(f"[PAYOUT] Creator: {creator_email}")
        print(f"[PAYOUT] Bank: {bank_name}, Account: ****{account_last4}, IFSC: {ifsc_code}")
        
        # Check if simulation mode is enabled
        if settings.PAYMENT_SIMULATION_MODE:
            print(f"[SIMULATION MODE] Processing payout of ₹{amount} to {creator_email}")
            print(f"[SIMULATION MODE] Would transfer to: {bank_name} - ****{account_last4}")
            
            # Update balance in Firestore (deduct from pending, add to paid)
            balance_ref = db.collection("balances").document(creator_email)
            balance_doc = balance_ref.get()
            
            if balance_doc.exists:
                current_balance = balance_doc.to_dict().get("amount", 0)
                if current_balance >= amount:
                    balance_ref.update({
                        "amount": current_balance - amount,
                        "total_paid": firestore.Increment(amount),
                        "last_payout_at": datetime.now().isoformat(),
                        "updated_at": datetime.now().isoformat()
                    })
            
            # Record the payout with bank details
            payout_id = f"pout_sim_{uuid.uuid4().hex[:12]}"
            payout_record = {
                "id": payout_id,
                "creator_email": creator_email,
                "amount": amount,
                "payment_id": payment_id,
                "status": "processed",
                "mode": "simulation",
                "bank_details": {
                    "bank_name": bank_name,
                    "account_last4": account_last4,
                    "ifsc_code": ifsc_code,
                    "account_holder_name": account_holder
                },
                "created_at": datetime.now().isoformat()
            }
            db.collection("payouts").document(payout_id).set(payout_record)
            
            return {
                "success": True,
                "payout_id": payout_id,
                "amount": amount,
                "message": f"₹{amount} payout processed to {bank_name} ****{account_last4} (simulation mode)",
                "bank_details": {
                    "bank_name": bank_name,
                    "account_last4": account_last4,
                    "account_holder_name": account_holder
                },
                "simulation": True
            }
        
        # PRODUCTION MODE: Use RazorpayX Payouts
        # Get creator's bank details from Firestore
        bank_details = await bank_validation_service.get_bank_details(creator_email)
        
        if not bank_details:
            return {
                "success": False,
                "message": "Creator has not set up bank account for payouts"
            }
        
        fund_account_id = bank_details.get("razorpay_fund_account_id")
        if not fund_account_id:
            return {
                "success": False,
                "message": "Creator's bank account is not linked to Razorpay"
            }
        
        # Create payout via RazorpayX
        payout_data = {
            "account_number": settings.RAZORPAY_ACCOUNT_NUMBER,  # Your RazorpayX account
            "fund_account_id": fund_account_id,
            "amount": int(amount * 100),  # Amount in paise
            "currency": "INR",
            "mode": "IMPS",  # IMPS/NEFT/RTGS
            "purpose": "payout",
            "queue_if_low_balance": True,
            "reference_id": payment_id,
            "narration": "VisionMatch Creator Payout"
        }
        
        payout = razorpay_client.payout.create(payout_data)
        payout_id = payout.get("id")
        
        # Update balance in Firestore
        balance_ref = db.collection("balances").document(creator_email)
        balance_doc = balance_ref.get()
        
        if balance_doc.exists:
            current_balance = balance_doc.to_dict().get("amount", 0)
            if current_balance >= amount:
                balance_ref.update({
                    "amount": current_balance - amount,
                    "total_paid": firestore.Increment(amount),
                    "last_payout_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                })
        
        # Record the payout with bank details
        payout_record = {
            "id": payout_id,
            "creator_email": creator_email,
            "amount": amount,
            "payment_id": payment_id,
            "razorpay_payout_id": payout_id,
            "status": payout.get("status", "processing"),
            "mode": "razorpayx",
            "bank_details": {
                "bank_name": bank_name,
                "account_last4": account_last4,
                "ifsc_code": ifsc_code,
                "account_holder_name": account_holder,
                "fund_account_id": fund_account_id
            },
            "created_at": datetime.now().isoformat()
        }
        db.collection("payouts").document(payout_id).set(payout_record)
        
        print(f"RazorpayX payout created: {payout_id} to {bank_name} ****{account_last4}")
        
        return {
            "success": True,
            "payout_id": payout_id,
            "amount": amount,
            "message": f"₹{amount} payout initiated to {bank_name} ****{account_last4}",
            "bank_details": {
                "bank_name": bank_name,
                "account_last4": account_last4,
                "account_holder_name": account_holder
            },
            "simulation": False
        }
        
    except Exception as e:
        print(f"Payout error: {str(e)}")
        return {
            "success": False,
            "message": f"Payout failed: {str(e)}"
        }


def get_escrowed_payments_ready_for_auto_release() -> List[Dict[str, Any]]:
    """
    Find all escrowed payments where the event date + 3 days has passed.
    These payments should be automatically released to the creator.
    """
    payments_to_release = []
    
    try:
        # Query all escrowed payments
        query = db.collection(PAYMENTS_COLLECTION).where("status", "==", PaymentStatus.ESCROWED)
        docs = query.stream()
        
        now = datetime.now()
        
        for doc in docs:
            payment_data = doc.to_dict()
            request_id = payment_data.get("request_id")
            
            if not request_id:
                continue
            
            # Get the request to find event date
            request_doc = db.collection(REQUESTS_COLLECTION).document(request_id).get()
            
            if not request_doc.exists:
                # Also check bookings for event date
                booking_query = db.collection(BOOKINGS_COLLECTION).where("requestId", "==", request_id).limit(1)
                booking_docs = booking_query.stream()
                event_date_str = None
                for booking_doc in booking_docs:
                    booking_data = booking_doc.to_dict()
                    event_date_str = booking_data.get("eventDate")
                    break
            else:
                request_data = request_doc.to_dict()
                event_date_str = request_data.get("eventDate")
            
            if not event_date_str:
                print(f"[AUTO-RELEASE] No event date found for payment {payment_data.get('id')}")
                continue
            
            # Parse event date - handle different formats
            try:
                # Try ISO format first
                if "T" in event_date_str:
                    event_date = datetime.fromisoformat(event_date_str.replace("Z", "+00:00"))
                else:
                    # Try common date formats
                    for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"]:
                        try:
                            event_date = datetime.strptime(event_date_str, fmt)
                            break
                        except ValueError:
                            continue
                    else:
                        # Try timestamp (milliseconds)
                        if event_date_str.isdigit():
                            event_date = datetime.fromtimestamp(int(event_date_str) / 1000)
                        else:
                            print(f"[AUTO-RELEASE] Could not parse event date: {event_date_str}")
                            continue
                
                # Make event_date naive if it has timezone info for comparison
                if event_date.tzinfo is not None:
                    event_date = event_date.replace(tzinfo=None)
                
                # Check if 3 days have passed since the event date
                auto_release_date = event_date + timedelta(days=AUTO_RELEASE_DAYS_AFTER_EVENT)
                
                if now >= auto_release_date:
                    payments_to_release.append({
                        "payment_id": payment_data.get("id"),
                        "payment_data": payment_data,
                        "event_date": event_date,
                        "auto_release_date": auto_release_date,
                        "days_overdue": (now - auto_release_date).days
                    })
                    print(f"[AUTO-RELEASE] Payment {payment_data.get('id')} is ready for auto-release "
                          f"(Event: {event_date.date()}, Auto-release after: {auto_release_date.date()})")
                          
            except Exception as parse_error:
                print(f"[AUTO-RELEASE] Error parsing date for payment {payment_data.get('id')}: {parse_error}")
                continue
                
    except Exception as e:
        print(f"[AUTO-RELEASE] Error querying escrowed payments: {str(e)}")
    
    return payments_to_release


def auto_release_escrowed_payments() -> Dict[str, Any]:
    """
    Automatically release all escrowed payments where 3 days have passed since the event date.
    This releases funds from escrow AND transfers to creator's bank account.
    This should be called by a background task/scheduler.
    
    Returns a summary of released payments.
    """
    import asyncio
    
    print("[AUTO-RELEASE] Starting auto-release check...")
    
    payments_to_release = get_escrowed_payments_ready_for_auto_release()
    
    if not payments_to_release:
        print("[AUTO-RELEASE] No payments ready for auto-release")
        return {
            "success": True,
            "message": "No payments ready for auto-release",
            "released_count": 0,
            "released_payments": []
        }
    
    released_payments = []
    failed_payments = []
    
    for payment_info in payments_to_release:
        payment_id = payment_info["payment_id"]
        payment_data = payment_info["payment_data"]
        creator_id = payment_data.get("creator_id")
        
        try:
            print(f"[AUTO-RELEASE] Auto-releasing payment {payment_id}...")
            
            # Step 1: Release from escrow and add to creator's balance
            result = confirm_and_release_payment(payment_id)
            
            if result.get("success"):
                creator_amount = result.get("creator_amount", 0)
                
                # Step 2: Automatically transfer to creator's bank account
                payout_result = None
                payout_success = False
                payout_message = ""
                
                if creator_id and creator_amount > 0:
                    try:
                        print(f"[AUTO-RELEASE] Initiating payout of ₹{creator_amount} to {creator_id}...")
                        
                        # Run the async payout function
                        loop = asyncio.get_event_loop()
                        if loop.is_running():
                            # If already in async context, create a task
                            import concurrent.futures
                            with concurrent.futures.ThreadPoolExecutor() as executor:
                                future = executor.submit(
                                    asyncio.run,
                                    process_creator_payout(creator_id, creator_amount, payment_id)
                                )
                                payout_result = future.result(timeout=30)
                        else:
                            payout_result = asyncio.run(
                                process_creator_payout(creator_id, creator_amount, payment_id)
                            )
                        
                        payout_success = payout_result.get("success", False)
                        payout_message = payout_result.get("message", "")
                        
                        if payout_success:
                            print(f"[AUTO-RELEASE] Payout successful for {creator_id}: {payout_message}")
                        else:
                            print(f"[AUTO-RELEASE] Payout failed for {creator_id}: {payout_message}")
                            
                    except Exception as payout_error:
                        payout_message = str(payout_error)
                        print(f"[AUTO-RELEASE] Payout error for {creator_id}: {payout_message}")
                
                released_payments.append({
                    "payment_id": payment_id,
                    "creator_id": creator_id,
                    "creator_amount": creator_amount,
                    "event_date": payment_info["event_date"].isoformat(),
                    "days_overdue": payment_info["days_overdue"],
                    "auto_released": True,
                    "payout_initiated": payout_success,
                    "payout_message": payout_message
                })
                
                # Update payment to mark it as auto-released with payout info
                db.collection(PAYMENTS_COLLECTION).document(payment_id).update({
                    "auto_released": True,
                    "auto_released_at": datetime.now().isoformat(),
                    "auto_release_reason": f"Auto-released {AUTO_RELEASE_DAYS_AFTER_EVENT} days after event date",
                    "payout_initiated": payout_success,
                    "payout_result": payout_message
                })
                
                print(f"[AUTO-RELEASE] Successfully auto-released payment {payment_id}")
            else:
                failed_payments.append({
                    "payment_id": payment_id,
                    "error": result.get("message", "Unknown error")
                })
                
        except Exception as e:
            print(f"[AUTO-RELEASE] Error releasing payment {payment_id}: {str(e)}")
            failed_payments.append({
                "payment_id": payment_id,
                "error": str(e)
            })
    
    summary = {
        "success": True,
        "message": f"Auto-release complete. Released: {len(released_payments)}, Failed: {len(failed_payments)}",
        "released_count": len(released_payments),
        "failed_count": len(failed_payments),
        "released_payments": released_payments,
        "failed_payments": failed_payments,
        "checked_at": datetime.now().isoformat()
    }
    
    print(f"[AUTO-RELEASE] Summary: {summary['message']}")
    
    return summary
