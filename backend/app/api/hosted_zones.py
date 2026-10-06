from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.hosted_zone import HostedZone
from app.models.record import Record
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneResponse

router = APIRouter(prefix="/hostedzones", tags=["Hosted Zones"])

@router.get("", response_model=List[HostedZoneResponse])
def get_hosted_zones(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(HostedZone)
    if search:
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
    return query.order_by(HostedZone.created_at.desc()).all()

@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(payload: HostedZoneCreate, db: Session = Depends(get_db)):
    clean_name = payload.name.strip().rstrip(".")
    
    zone = HostedZone(
        name=clean_name,
        description=payload.description,
        type=payload.type,
        vpc_id=payload.vpc_id,
        vpc_region=payload.vpc_region,
        record_count=2,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)

    # Route53 automatically adds standard NS and SOA records upon creation
    ns_record = Record(
        hosted_zone_id=zone.id,
        name=clean_name,
        type="NS",
        ttl=172800,
        routing_policy="Simple",
        values=f"ns-101.awsdns-12.com.\nns-782.awsdns-33.net.\nns-1342.awsdns-39.org.\nns-1891.awsdns-44.co.uk."
    )
    soa_record = Record(
        hosted_zone_id=zone.id,
        name=clean_name,
        type="SOA",
        ttl=900,
        routing_policy="Simple",
        values=f"ns-101.awsdns-12.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
    )
    db.add_all([ns_record, soa_record])
    db.commit()

    return zone

@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return zone

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    db.delete(zone)
    db.commit()
    return None