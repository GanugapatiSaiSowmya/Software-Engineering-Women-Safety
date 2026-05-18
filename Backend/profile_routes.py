from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, Guardian
from schemas import (
    ProfileResponse,
    UpdateProfileRequest
)

from auth import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get(
    "/me",
    response_model=ProfileResponse
)
def get_profile(

    db: Session =
    Depends(get_db),

    current_user: User =
    Depends(
        get_current_user
    )

):

    guardian_count = (

    db.query(
        Guardian
    )

    .filter(

        Guardian.user_id

        ==

        current_user.email

    )

    .count()

)

    return {

        "name":
        current_user.name,

        "email":
        current_user.email,

        "decoy_enabled":
        current_user.decoy_enabled,

        "decoy_ui":
        current_user.decoy_ui,

        "secret_key":
        current_user.secret_key,

        "upload_count":
        current_user.upload_count,

        "takedown_reports":
        current_user.takedown_reports,

        "guardian_count":
        guardian_count,

        "bio":
        current_user.bio
    }


@router.put(
    "/update"
)
def update_profile(

    payload:
    UpdateProfileRequest,

    db: Session =
    Depends(get_db),

    current_user: User =
    Depends(
        get_current_user
    )

):

    data = payload.model_dump(
        exclude_unset=True
    )

    for key, value in data.items():

        setattr(

            current_user,

            key,

            value
        )

    db.commit()

    db.refresh(
        current_user
    )

    return {

        "message":

        "Profile updated"
    }