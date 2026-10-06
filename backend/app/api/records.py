import uuid
from typing import List, Optional
import dns.exception
import dns.rdatatype
import dns.zone
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.hosted_zone import HostedZone
from app.models.record import Record
from app.schemas.record import RecordCreate, RecordResponse, RecordUpdate

router = APIRouter(prefix="/hostedzones/{zone_id}/records", tags=["Records"])


@router.get("", response_model=List[RecordResponse])
def get_records(
    zone_id: str,
    search: Optional[str] = Query(None),
    record_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
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

    # Enforce single SOA record rule
    if payload.type.upper() == "SOA":
        existing_soa = (
            db.query(Record)
            .filter(Record.hosted_zone_id == zone_id, Record.type == "SOA")
            .first()
        )
        if existing_soa:
            raise HTTPException(
                status_code=400,
                detail="A hosted zone can only have exactly one SOA record.",
            )

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
def update_record(
    zone_id: str,
    record_id: str,
    payload: RecordUpdate,
    db: Session = Depends(get_db),
):
    record = (
        db.query(Record)
        .filter(Record.id == record_id, Record.hosted_zone_id == zone_id)
        .first()
    )
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
    record = (
        db.query(Record)
        .filter(Record.id == record_id, Record.hosted_zone_id == zone_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Prevent accidental deletion of fundamental root NS/SOA
    if record.type in ["NS", "SOA"] and record.name == record.hosted_zone.name:
        raise HTTPException(
            status_code=400, detail="Cannot delete default NS or SOA records"
        )

    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if zone and zone.record_count > 0:
        zone.record_count -= 1

    db.delete(record)
    db.commit()
    return None


@router.post("/import")
async def import_bind_file(
    zone_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        content = await file.read()
        # Use utf-8-sig to automatically remove Windows BOM, and strip carriage returns
        text = content.decode("utf-8-sig").replace("\r", "")

        # Verify the zone exists
        zone_db = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
        if not zone_db:
            raise HTTPException(status_code=404, detail="Hosted zone not found.")

        # Ensure origin has a trailing dot for dnspython
        origin_str = (
            zone_db.name if zone_db.name.endswith(".") else f"{zone_db.name}."
        )

        # Parse the BIND file content
        # Parse the BIND file content, allowing partial zone uploads
        zone_data = dns.zone.from_text(text, origin=origin_str, relativize=False, check_origin=False)

        records_created = 0
        for name, node in zone_data.nodes.items():
            # Strip trailing dot from the name for the DB (matching AWS style)
            clean_name = name.to_text().rstrip(".")

            for rdataset in node.rdatasets:
                type_str = dns.rdatatype.to_text(rdataset.rdtype)
                ttl = rdataset.ttl
                # Join multiple values with a newline (standard for AWS Route53 style)
                values = "\n".join([rdata.to_text() for rdata in rdataset])

                # Gracefully overwrite existing SOA instead of duplicating
                if type_str == "SOA":
                    existing_soa = (
                        db.query(Record)
                        .filter(
                            Record.hosted_zone_id == zone_id,
                            Record.type == "SOA",
                        )
                        .first()
                    )
                    if existing_soa:
                        existing_soa.values = values
                        existing_soa.ttl = ttl
                        continue

                new_record = Record(
                    id=str(uuid.uuid4()),
                    hosted_zone_id=zone_id,
                    name=clean_name,
                    type=type_str,
                    ttl=ttl,
                    routing_policy="Simple",
                    values=values,
                )
                db.add(new_record)
                records_created += 1

        # Update the aggregate count on the hosted zone
        zone_db.record_count += records_created
        db.commit()
        return {"message": f"Successfully imported {records_created} records."}

    except dns.exception.DNSException as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Invalid BIND format: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Failed to import file: {str(e)}"
        )