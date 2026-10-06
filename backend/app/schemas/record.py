from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class RecordBase(BaseModel):
    name: str
    type: str
    ttl: int = 300
    routing_policy: str = "Simple"
    values: str

class RecordCreate(RecordBase):
    pass

class RecordUpdate(BaseModel):
    ttl: Optional[int] = None
    values: Optional[str] = None
    routing_policy: Optional[str] = None

class RecordResponse(RecordBase):
    id: str
    hosted_zone_id: str
    created_at: datetime

    class Config:
        from_attributes = True