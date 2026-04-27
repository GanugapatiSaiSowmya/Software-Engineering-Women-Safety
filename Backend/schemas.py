from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token:  str
    token_type:    str = "bearer"
    face_enrolled: bool

class FaceEnrollRequest(BaseModel):
    face_hash: str

class FaceVerifyRequest(BaseModel):
    face_hash: str

class FaceVerifyResponse(BaseModel):
    verified: bool
    message:  str

class UserResponse(BaseModel):
    id:            int
    name:          str
    email:         str
    face_enrolled: bool
    created_at:    datetime

    class Config:
        from_attributes = True

# ── Guardian SOS ──────────────────────────────────────────────────────────────
class GuardianCreate(BaseModel):
    name:    str
    phone:   str
    user_id: Optional[str] = "default_user"

class GuardianResponse(BaseModel):
    id:    str
    name:  str
    phone: str

    class Config:
        from_attributes = True

class SOSRequest(BaseModel):
    user_id: str

class HighAlertToggle(BaseModel):
    user_id: str
    enabled: bool