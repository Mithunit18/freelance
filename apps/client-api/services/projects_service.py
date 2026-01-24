# services/projects_service.py
from config.clients import db
import uuid, time
from typing import Dict

PROJECTS_COLLECTION = "ProjectRequests"

ALLOWED_FIELDS = {
    "clientId",
    "creatorId",
    "package",
    "serviceType",
    "eventDate",
    "duration",
    "location",
    "message",
    "creatorName",
    "creatorSpecialisation"
}

def create_project_request(request_data: Dict) -> Dict:
    try:
        request_id = f"req_{uuid.uuid4().hex[:8]}"
        doc_ref = db.collection(PROJECTS_COLLECTION).document(request_id)

        safe_data = {k: v for k, v in request_data.items() if k in ALLOWED_FIELDS}

        payload = {
            "id": request_id,
            **safe_data,
            "status": "pending_creator",
            "createdAt": int(time.time() * 1000),
            "updatedAt": int(time.time() * 1000)
        }

        doc_ref.set(payload)
        return payload

    except Exception as e:
        print("create_project_request error:", e)
        return {"error": "Failed to create project request"}
