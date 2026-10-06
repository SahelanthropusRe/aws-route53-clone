from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class HostedZoneBase(BaseModel):
    name: str
    description: Optional[str] = ""
    type: Optional[str] = "Public hosted zone"
    vpc_id: Optional[str] = None
    vpc_region: Optional[str] = None

class HostedZoneCreate(HostedZoneBase):
    pass

class HostedZoneResponse(HostedZoneBase):
    id: str
    record_count: int
    created_at: datetime

    class Config:
        from_attributes = True