from pydantic import BaseModel

class Guardian(BaseModel):
    name: str
    phone: str

class SOSRequest(BaseModel):
    user_id: str

class HighAlertToggle(BaseModel):
    user_id: str
    enabled: bool