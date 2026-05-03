import uuid
import datetime
import requests

from fastapi import APIRouter
from models import Guardian, SOSRequest, HighAlertToggle
from database import read_db, write_db

router = APIRouter()

# 🔐 Fast2SMS API KEY
API_KEY = "zqhMBegkAOS18VjQZXFRDNywcnJYiIrU7EtsdG9vmuf4PxLCKW0wj8WbKoRCetFXyZhns2gc1IOP6QYz"


# ─────────────────────────────────────────────
# 👥 GUARDIAN MANAGEMENT
# ─────────────────────────────────────────────

@router.post("/guardians/add")
def add_guardian(guardian: dict):
    db = read_db()

    new_guardian = {
        "id": str(uuid.uuid4()),
        "user_id": guardian.get("user_id", "default_user"),
        "name": guardian["name"],
        "phone": guardian["phone"]
    }

    db["guardians"].append(new_guardian)
    write_db(db)

    return {"message": "Guardian added", "data": new_guardian}


@router.get("/guardians")
def get_guardians(user_id: str = "default_user"):
    db = read_db()
    return [g for g in db["guardians"] if g.get("user_id") == user_id]


@router.delete("/guardians/{guardian_id}")
def delete_guardian(guardian_id: str):
    db = read_db()

    db["guardians"] = [
        g for g in db["guardians"] if g["id"] != guardian_id
    ]

    write_db(db)
    return {"message": "Guardian removed"}


@router.put("/guardians/{guardian_id}")
def update_guardian(guardian_id: str, updated: dict):
    db = read_db()

    for g in db["guardians"]:
        if g["id"] == guardian_id:
            g["name"] = updated["name"]
            g["phone"] = updated["phone"]

    write_db(db)
    return {"message": "Guardian updated"}


# ─────────────────────────────────────────────
# ⚡ HIGH ALERT MODE
# ─────────────────────────────────────────────

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

    return {
        "enabled": db["high_alert"].get(user_id, False)
    }


# ─────────────────────────────────────────────
# 🚨 SOS TRIGGER
# ─────────────────────────────────────────────

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

    # 🔔 Send SMS via Fast2SMS
    notifications = []

    for guardian in db["guardians"]:
        if guardian.get("user_id") != request.user_id:
            continue

        try:
            url = "https://www.fast2sms.com/dev/bulkV2"

            payload = {
                "route": "v3",
                "message": f"🚨 SOS ALERT!\n{request.user_id} needs help immediately!",
                "language": "english",
                "numbers": guardian["phone"]
            }

            headers = {
                "authorization": API_KEY,
                "Content-Type": "application/json"
            }

            response = requests.post(url, json=payload, headers=headers)

            print("SMS RESPONSE:", response.text)
            
            notifications.append({
                "guardian": guardian["name"],
                "phone": guardian["phone"],
                "status": "sent"
            })

        except Exception as e:
            notifications.append({
                "guardian": guardian["name"],
                "phone": guardian["phone"],
                "status": "failed",
                "error": str(e)
            })

    write_db(db)

    return {
        "message": "SOS Triggered!",
        "sos_id": sos_id,
        "notified": notifications
    }
    