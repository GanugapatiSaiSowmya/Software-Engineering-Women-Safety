from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(100), nullable=False)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    face_hash       = Column(Text, nullable=True)
    face_enrolled   = Column(Boolean, default=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())


class Guardian(Base):
    __tablename__ = "guardians"

    id         = Column(String(36), primary_key=True)  # UUID
    user_id    = Column(String, nullable=False, index=True)
    name       = Column(String(100), nullable=False)
    phone      = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SOSEvent(Base):
    __tablename__ = "sos_events"

    id         = Column(String(36), primary_key=True)
    user_id    = Column(String, nullable=False)
    status     = Column(String(20), default="triggered")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HighAlert(Base):
    __tablename__ = "high_alerts"

    user_id = Column(String, primary_key=True)
    enabled = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class StealthSettings(Base):
    __tablename__ = "stealth_settings"

    user_id           = Column(Integer, ForeignKey("users.id"), primary_key=True)
    stealth_enabled   = Column(Boolean, default=False)
    stealth_level     = Column(Integer, default=1)
    decoy_skin        = Column(String(50), default="calculator")
    hashed_secret_key = Column(String(255), nullable=True)
    updated_at        = Column(DateTime(timezone=True), onupdate=func.now())



class AccessLog(Base):
    __tablename__ = "access_logs"

    id          = Column(String(36), primary_key=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    event_type  = Column(String(50), nullable=False)
    timestamp   = Column(DateTime(timezone=True), server_default=func.now())
    ip_address  = Column(String(50), nullable=True)
    device_info = Column(String(255), nullable=True)
    status      = Column(String(20), nullable=False)