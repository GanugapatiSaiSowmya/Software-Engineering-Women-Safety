from database import SessionLocal
from models import User, StealthSettings
from schemas import StealthSettingsResponse

db = SessionLocal()
try:
    user = db.query(User).filter(User.id == 2).first()
    if not user:
        print("User 2 not found")
        exit()
        
    settings = db.query(StealthSettings).filter(StealthSettings.user_id == user.id).first()
    if not settings:
        settings = StealthSettings(user_id=user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    print("Settings after refresh:", settings.stealth_enabled, settings.stealth_level, settings.decoy_skin)
    
    # Simulate Pydantic response
    resp = StealthSettingsResponse.model_validate(settings)
    print("Response:", resp)
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
