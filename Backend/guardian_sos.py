from fastapi import APIRouter
from models import Guardian, SOSRequest, HighAlertToggle
from database import read_db, write_db
import uuid
import datetime

router = APIRouter()

# -------------------------
# 👥 GUARDIAN MANAGEMENT
# -------------------------

@router.post("/guardians/add")
def add_guardian(guardian: Guardian):
    db = read_db()
    
    new_guardian = {
        "id": str(uuid.uuid4()),
        "name": guardian.name,
        "phone": guardian.phone
    }
    
    db["guardians"].append(new_guardian)
    write_db(db)
    
    return {"message": "Guardian added", "data": new_guardian}


@router.get("/guardians")
def get_guardians():
    db = read_db()
    return db["guardians"]


@router.delete("/guardians/{guardian_id}")
def delete_guardian(guardian_id: str):
    db = read_db()
    
    db["guardians"] = [
        g for g in db["guardians"] if g["id"] != guardian_id
    ]
    
    write_db(db)
    return {"message": "Guardian removed"}


# -------------------------
# 🚨 SOS TRIGGER
# -------------------------

@router.post("/sos/trigger")
def trigger_sos(request: SOSRequest):
    db = read_db()
    
    sos_id = str(uuid.uuid4())

    sos_event = {
        "id": sos_id,
        "user_id": request.user_id,
        "timestamp": str(datetime.datetime.now()),
        "status": "triggered"
    }

    db["sos_events"].append(sos_event)

    # Simulate notification sending
    notifications = []
    for guardian in db["guardians"]:
        notifications.append({
            "guardian": guardian["name"],
            "phone": guardian["phone"],
            "status": "sent"
        })

    write_db(db)

    return {
        "message": "SOS Triggered!",
        "sos_id": sos_id,
        "notified": notifications
    }


# -------------------------
# ⚡ HIGH ALERT MODE
# -------------------------

@router.post("/high-alert/toggle")
def toggle_high_alert(data: HighAlertToggle):
    db = read_db()
    
    db["high_alert"][data.user_id] = data.enabled
    
    write_db(db)
    
    return {
        "message": "High Alert Updated",
        "enabled": data.enabled
    }


@router.get("/high-alert/{user_id}")
def get_high_alert(user_id: str):
    db = read_db()
    
    status = db["high_alert"].get(user_id, False)
    
    return {"enabled": status}