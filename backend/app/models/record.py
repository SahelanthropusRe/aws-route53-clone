import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class Record(Base):
    __tablename__ = "records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    hosted_zone_id = Column(String, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # A, AAAA, CNAME, MX, TXT, NS, SOA, PTR, SRV, CAA
    ttl = Column(Integer, default=300)
    routing_policy = Column(String, default="Simple")
    values = Column(Text, nullable=False)  # Stored as newline-separated values
    created_at = Column(DateTime, default=datetime.utcnow)

    hosted_zone = relationship("HostedZone", back_populates="records")