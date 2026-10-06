from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.hosted_zone import HostedZone
from app.models.record import Record
from app.schemas.record import RecordCreate, RecordUpdate, RecordResponse

router = APIRouter(prefix="/hostedzones/{zone_id}/records", tags=["Records"])

@router.get("", response_model=List[RecordResponse])
def get_records(
    zone_id: str,
    search: Optional[str] = Query(None),
    record_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Record).filter(Record.hosted_zone_id == zone_id)
    if search:
        query = query.filter(Record.name.ilike(f"%{search}%"))
    if record_type:
        query = query.filter(Record.type == record_type)
    return query.order_by(Record.name.asc()).all()

@router.post("", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(zone_id: str, payload: RecordCreate, db: Session = Depends(get_db)):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    record = Record(
        hosted_zone_id=zone_id,
        name=payload.name.strip(),
        type=payload.type.upper(),
        ttl=payload.ttl,
        routing_policy=payload.routing_policy,
        values=payload.values.strip(),
    )
    db.add(record)
    zone.record_count += 1
    db.commit()
    db.refresh(record)
    return record

@router.put("/{record_id}", response_model=RecordResponse)
def update_record(zone_id: str, record_id: str, payload: RecordUpdate, db: Session = Depends(get_db)):
    record = db.query(Record).filter(Record.id == record_id, Record.hosted_zone_id == zone_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    if payload.ttl is not None:
        record.ttl = payload.ttl
    if payload.values is not None:
        record.values = payload.values.strip()
    if payload.routing_policy is not None:
        record.routing_policy = payload.routing_policy

    db.commit()
    db.refresh(record)
    return record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(zone_id: str, record_id: str, db: Session = Depends(get_db)):
    record = db.query(Record).filter(Record.id == record_id, Record.hosted_zone_id == zone_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Prevent accidental deletion of fundamental root NS/SOA
    if record.type in ["NS", "SOA"] and record.name == record.hosted_zone.name:
        raise HTTPException(status_code=400, detail="Cannot delete default NS or SOA records")

    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if zone and zone.record_count > 0:
        zone.record_count -= 1

    db.delete(record)
    db.commit()
    return None