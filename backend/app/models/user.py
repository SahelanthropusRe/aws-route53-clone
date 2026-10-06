from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # A user can have multiple hosted zones
    hosted_zones = relationship("HostedZone", back_populates="owner")