from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from pydantic import BaseModel

class ProfileResponse(BaseModel):

    name: str
    email: str

    decoy_enabled: bool
    decoy_ui: str
    secret_key: str

    upload_count: int
    takedown_reports: int

    guardian_count: int

    bio: str | None


class UpdateProfileRequest(BaseModel):

    name: str | None = None

    bio: str | None = None

    decoy_enabled: bool | None = None

    decoy_ui: str | None = None

    secret_key: str | None = None

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

# ── Stealth & Safety ──────────────────────────────────────────────────────────

class StealthSettingsUpdate(BaseModel):
    stealth_enabled: Optional[bool] = None
    stealth_level: Optional[int] = None
    decoy_skin: Optional[str] = None
    new_secret_key: Optional[str] = None

class StealthSettingsResponse(BaseModel):
    stealth_enabled: bool
    stealth_level: int
    decoy_skin: str

    class Config:
        from_attributes = True



class AccessLogResponse(BaseModel):
    id: str
    event_type: str
    timestamp: datetime
    ip_address: Optional[str]
    device_info: Optional[str]
    status: str

    class Config:
        from_attributes = True

class VerifyDecoyRequest(BaseModel):
    email: EmailStr
    secret_key: str