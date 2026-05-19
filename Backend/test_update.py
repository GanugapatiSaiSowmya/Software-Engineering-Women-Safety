from database import SessionLocal
from models import User
from auth import update_stealth
from schemas import StealthSettingsUpdate
from fastapi import HTTPException

db = SessionLocal()
try:
    user = db.query(User).filter(User.id == 2).first()
    print("User:", user.email)
    payload = StealthSettingsUpdate(
        stealth_enabled=True,
        stealth_level=2,
        decoy_skin="calculator",
        # new_secret_key is NOT provided
    )
    res = update_stealth(payload, user, db)
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
