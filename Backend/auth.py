from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

from database import get_db
from models import User
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    FaceEnrollRequest, FaceVerifyRequest, FaceVerifyResponse,
    UserResponse
)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router        = APIRouter(prefix="/auth", tags=["auth"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password [:72])

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
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
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

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token, face_enrolled=False)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

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
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    """Compare incoming face hash against the stored hash."""
    if not current_user.face_enrolled or not current_user.face_hash:
        raise HTTPException(status_code=400, detail="No face registered for this account.")

    matched = face_hashes_match(current_user.face_hash, payload.face_hash)

    if matched:
        return FaceVerifyResponse(verified=True,  message="Face verified successfully.")
    else:
        return FaceVerifyResponse(verified=False, message="Face not recognised.")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return current logged-in user's profile."""
    return current_user