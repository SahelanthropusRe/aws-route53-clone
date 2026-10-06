import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_zone_id() -> str:
    # Route53 hosted zone IDs start with 'Z' followed by alphanumeric characters
    return f"Z{uuid.uuid4().hex[:13].upper()}"

class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(String, primary_key=True, default=generate_zone_id, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String, default="")
    type = Column(String, default="Public hosted zone")
    vpc_id = Column(String, nullable=True)
    vpc_region = Column(String, nullable=True)
    record_count = Column(Integer, default=2)  # Route53 defaults to NS + SOA
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- NEW: Link to User ---
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="hosted_zones")

    records = relationship("Record", back_populates="hosted_zone", cascade="all, delete-orphan")