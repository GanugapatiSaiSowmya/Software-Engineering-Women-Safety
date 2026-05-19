from fastapi import APIRouter, Depends, HTTPException, status, Request
import uuid
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

from database import get_db
from models import User, StealthSettings, AccessLog
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    FaceEnrollRequest, FaceVerifyRequest, FaceVerifyResponse,
    UserResponse,
    StealthSettingsUpdate, StealthSettingsResponse,
    AccessLogResponse, VerifyDecoyRequest
)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(
    schemes=["bcrypt", "argon2"],
    deprecated="auto"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router        = APIRouter(prefix="/auth", tags=["auth"])

# ── Helpers ───────────────────────────────────────────────────────────────────

def log_access(db: Session, user_id: int, event_type: str, status_val: str, request: Request):
    try:
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", None)
        log_entry = AccessLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            event_type=event_type,
            ip_address=client_ip,
            device_info=user_agent,
            status=status_val
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"[log_access error] {e}")

# ── Password Helpers ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Hamming distance on perceptual hash
# Hash is a 64-char hex string = 256 bits
# Convert both to binary, count matching bits
# Require >= 85% bit match — tight enough to reject hands/objects
def face_hashes_match(stored: str, incoming: str, threshold: float = 0.85) -> bool:
    try:
        bits = 256
        a = bin(int(stored,   16))[2:].zfill(bits)
        b = bin(int(incoming, 16))[2:].zfill(bits)
        matches = sum(x == y for x, y in zip(a, b))
        similarity = matches / bits
        print(f"[face_verify] similarity={similarity:.3f} threshold={threshold}")
        return similarity >= threshold
    except Exception as e:
        print(f"[face_verify] error: {e}")
        return False


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        name            = payload.name,
        email           = payload.email,
        hashed_password = hash_password(payload.password),
        face_enrolled   = False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    log_access(db, user.id, "register", "success", request)

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token, face_enrolled=False)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        if user:
            log_access(db, user.id, "login_failed", "failed", request)
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    log_access(db, user.id, "login_success", "success", request)

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token, face_enrolled=user.face_enrolled)


@router.post("/face/enroll")
def enroll_face(
    payload: FaceEnrollRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    """Store the user's face hash for the first time."""
    current_user.face_hash     = payload.face_hash
    current_user.face_enrolled = True
    db.commit()
    return {"message": "Face registered successfully.", "face_enrolled": True}


@router.post("/face/verify", response_model=FaceVerifyResponse)
def verify_face(
    payload:      FaceVerifyRequest,
    request:      Request,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    """Compare incoming face hash against the stored hash."""
    if not current_user.face_enrolled or not current_user.face_hash:
        raise HTTPException(status_code=400, detail="No face registered for this account.")

    matched = face_hashes_match(current_user.face_hash, payload.face_hash)

    if matched:
        log_access(db, current_user.id, "face_verify_success", "success", request)
        return FaceVerifyResponse(verified=True,  message="Face verified successfully.")
    else:
        log_access(db, current_user.id, "face_verify_failed", "failed", request)
        return FaceVerifyResponse(verified=False, message="Face not recognised.")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return current logged-in user's profile."""
    return current_user


# ── Stealth & Safety Routes ───────────────────────────────────────────────────

@router.get("/stealth", response_model=StealthSettingsResponse)
def get_stealth(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(StealthSettings).filter(StealthSettings.user_id == current_user.id).first()
    if not settings:
        settings = StealthSettings(
            user_id=current_user.id,
            stealth_enabled=False,
            stealth_level=1,
            decoy_skin="calculator"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.post("/stealth", response_model=StealthSettingsResponse)
def update_stealth(payload: StealthSettingsUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(StealthSettings).filter(StealthSettings.user_id == current_user.id).first()
    if not settings:
        settings = StealthSettings(
            user_id=current_user.id,
            stealth_enabled=False,
            stealth_level=1,
            decoy_skin="calculator"
        )
        db.add(settings)

    if payload.stealth_enabled is not None:
        settings.stealth_enabled = payload.stealth_enabled
    if payload.stealth_level is not None:
        settings.stealth_level = payload.stealth_level
    if payload.decoy_skin is not None:
        settings.decoy_skin = payload.decoy_skin
    if payload.new_secret_key:
        settings.hashed_secret_key = hash_password(payload.new_secret_key)

    db.commit()
    db.refresh(settings)
    return settings



@router.post("/verify-decoy")
def verify_decoy(payload: VerifyDecoyRequest, request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    user = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload_jwt = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email_from_token = payload_jwt.get("sub")
            if email_from_token:
                user = db.query(User).filter(User.email == email_from_token).first()
        except JWTError:
            pass

    if not user:
        user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid decoy key")

    settings = db.query(StealthSettings).filter(StealthSettings.user_id == user.id).first()
    if not settings or not settings.stealth_enabled or not settings.hashed_secret_key:
        raise HTTPException(status_code=401, detail="Stealth mode not active")

    # Rate limiting: block if 5 failures in the last 15 mins
    recent_failures = db.query(AccessLog).filter(
        AccessLog.user_id == user.id,
        AccessLog.event_type == "secret_key_failed",
        AccessLog.timestamp >= datetime.utcnow() - timedelta(minutes=15)
    ).count()

    if recent_failures >= 5:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")

    if not verify_password(payload.secret_key, settings.hashed_secret_key):
        log_access(db, user.id, "secret_key_failed", "failed", request)
        raise HTTPException(status_code=401, detail="Invalid decoy key")

    log_access(db, user.id, "secret_key_success", "success", request)

    # For Level 3, bypass normal login
    if settings.stealth_level == 3:
        token = create_access_token({"sub": user.email})
        return {"valid": True, "stealth_level": 3, "access_token": token}

    return {"valid": True, "stealth_level": settings.stealth_level}

@router.get("/logs", response_model=list[AccessLogResponse])
def get_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(AccessLog).filter(AccessLog.user_id == current_user.id).order_by(AccessLog.timestamp.desc()).limit(100).all()
    return logs