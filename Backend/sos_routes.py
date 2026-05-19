from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models import (
    Guardian,
    SOSEvent,
    HighAlert,
    User
)

from schemas import (
    GuardianCreate,
    GuardianResponse,
    SOSRequest,
    HighAlertToggle
)

from auth import get_current_user

import uuid
import threading

from whatsapp_sender import send_sos_message

router = APIRouter(
    tags=["Guardian SOS"]
)


# ── Guardians ───────────────────────────────────────────────

@router.post(
    "/guardians/add",

    response_model=
    GuardianResponse
)
def add_guardian(

    payload: GuardianCreate,

    db: Session =
    Depends(get_db),

    current_user: User =
    Depends(get_current_user)

):

    guardian = Guardian(

        id=str(uuid.uuid4()),

        user_id=current_user.email,

        name=payload.name,

        phone=payload.phone,

    )

    db.add(
        guardian
    )

    db.commit()

    db.refresh(
        guardian
    )

    return guardian


@router.get(
    "/guardians",

    response_model=
    list[GuardianResponse]
)
def get_guardians(

    db: Session =
    Depends(get_db),

    current_user: User =
    Depends(get_current_user)

):

    return db.query(
        Guardian
    ).filter(

        Guardian.user_id

        ==

        current_user.email

    ).all()


@router.delete(
    "/guardians/{guardian_id}"
)
def delete_guardian(

    guardian_id: str,

    db: Session =
    Depends(get_db)

):

    guardian = db.query(
        Guardian
    ).filter(

        Guardian.id

        ==

        guardian_id

    ).first()

    if not guardian:

        raise HTTPException(

            status_code=404,

            detail=
            "Guardian not found"
        )

    db.delete(
        guardian
    )

    db.commit()

    return {

        "message":

        "Guardian removed"
    }


# ── SOS Trigger ─────────────────────────────────────────────

@router.post("/sos/trigger")
def trigger_sos(

    request: SOSRequest,

    db: Session =
    Depends(get_db)

):

    try:

        sos_event = SOSEvent(

            id=str(uuid.uuid4()),

            user_id=request.user_id,

            status="triggered",
        )

        db.add(
            sos_event
        )

        db.commit()

        guardians = db.query(
            Guardian
        ).filter(

            Guardian.user_id

            ==

            request.user_id

        ).all()

        notifications = []

        for g in guardians:

            notifications.append({

                "guardian":
                g.name,

                "phone":
                g.phone,

                "status":
                "sent"

            })

        for g in guardians:

            phone = g.phone

            if not phone.startswith(
                "+91"
            ):

                phone = f"+91{phone}"

            threading.Thread(
                target=send_sos_message,
                args=(phone, request.user_id)
            ).start()

        return {
            "status": "success",
            "message": "Trusted contacts notified!",
            "sos_id": sos_event.id,
            "notified": notifications,
        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# ── High Alert ──────────────────────────────────────────────

@router.post("/high-alert/toggle")
def toggle_high_alert(

    data: HighAlertToggle,

    db: Session =
    Depends(get_db)

):

    record = db.query(
        HighAlert
    ).filter(

        HighAlert.user_id

        ==

        data.user_id

    ).first()

    if record:

        record.enabled = data.enabled

    else:

        record = HighAlert(

            user_id=data.user_id,

            enabled=data.enabled
        )

        db.add(
            record
        )

    db.commit()

    return {

        "message":

        "High Alert Updated",

        "enabled":

        data.enabled
    }


@router.get(
    "/high-alert/{user_id}"
)
def get_high_alert(

    user_id: str,

    db: Session =
    Depends(get_db)

):

    record = db.query(
        HighAlert
    ).filter(

        HighAlert.user_id

        ==

        user_id

    ).first()

    return {

        "enabled":

        record.enabled

        if record

        else False
    }