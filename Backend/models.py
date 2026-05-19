from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    ForeignKey
)

from sqlalchemy.sql import func
from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=True
    )

    face_hash = Column(
        Text,
        nullable=True
    )

    face_enrolled = Column(
        Boolean,
        default=False
    )

    # PROFILE INFO

    bio = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # DECOY SETTINGS

    decoy_enabled = Column(
        Boolean,
        default=False
    )

    decoy_ui = Column(
        String(50),
        default="calculator"
    )

    secret_key = Column(
        String(100),
        default="1234"
    )

    # ANALYTICS

    upload_count = Column(
        Integer,
        default=0
    )

    takedown_reports = Column(
        Integer,
        default=0
    )


class Guardian(Base):

    __tablename__ = "guardians"

    id = Column(
        String(36),
        primary_key=True
    )

    user_id = Column(
        String,
        nullable=False,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class SOSEvent(Base):

    __tablename__ = "sos_events"

    id = Column(
        String(36),
        primary_key=True
    )

    user_id = Column(
        String,
        nullable=False
    )

    status = Column(
        String(20),
        default="triggered"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class HighAlert(Base):

    __tablename__ = "high_alerts"

    user_id = Column(
        String,
        primary_key=True
    )

    enabled = Column(
        Boolean,
        default=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )