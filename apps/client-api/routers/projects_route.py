# routes/project_requests.py
from fastapi import APIRouter, HTTPException
from firebase_admin import db
from uuid import uuid4
import time
from models.projectRequest import (
    ProjectRequest,
    ProjectRequestCreate,
    ProjectRequestResponse
)

router = APIRouter()



# CREATE PROJECT REQUEST
@router.post("/projects/request")
def create_project_request(payload: ProjectRequestCreate):
    try:
        request_id = f"req_{uuid4().hex[:8]}"

        ref = db.reference("ProjectRequests").child(request_id)

        data = {
            "id": request_id,
            "clientId": payload.clientId,

            "creatorId": payload.creatorId,
            "package": {
                "id": payload.packageId,
                "name": payload.packageName,
                "price": payload.packagePrice
            },

            "serviceType": payload.serviceType,
            "eventDate": payload.eventDate,
            "duration": payload.duration,
            "location": payload.location,

            "message": payload.message,

            "creatorName": payload.creatorName,
            "creatorSpecialisation": payload.creatorSpecialisation,

            "status": "pending_creator",
            "createdAt": int(time.time() * 1000),
            "updatedAt": int(time.time() * 1000)
        }

        ref.set(data)

        return {
            "success": True,
            "requestId": request_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/project-request/{request_id}/respond")
def respond_to_request(request_id: str, payload: ProjectRequestResponse):
    ref = db.reference(f"ProjectRequests/{request_id}")
    data = ref.get()

    if not data:
        raise HTTPException(status_code=404, detail="Request not found")

    if payload.action not in ["accept", "decline", "negotiate"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    update = {
        "status": (
            "accepted" if payload.action == "accept" else
            "declined" if payload.action == "decline" else
            "negotiation_proposed"
        ),
        "creator_message": payload.message,
        "updated_at": int(time.time() * 1000)
    }

    ref.update(update)
    return {"success": True}



# GET REQUEST DETAILS

@router.get("/projects/requests/{clientId}")
def get_requests_by_client(clientId: str):
    ref = db.reference("ProjectRequests")
    all_requests = ref.get() or {}

    # Filter requests belonging to this client
    client_requests = [
        request
        for request in all_requests.values()
        if request.get("clientId") == clientId
    ]

    return {
        "success": True,
        "count": len(client_requests),
        "data": client_requests
    }
