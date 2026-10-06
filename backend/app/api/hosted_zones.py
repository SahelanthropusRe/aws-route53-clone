from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.db.session import get_db
from app.models.hosted_zone import HostedZone
from app.models.record import Record
from app.models.user import User
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneResponse
from app.core.security import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/hostedzones", tags=["Hosted Zones"])

# Configures FastAPI to extract the token from the Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("", response_model=List[HostedZoneResponse])
def get_hosted_zones(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Require authentication
):
    # Filter zones to ONLY those owned by the current logged-in user
    query = db.query(HostedZone).filter(HostedZone.user_id == current_user.id)
    if search:
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
    return query.order_by(HostedZone.created_at.desc()).all()

@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    payload: HostedZoneCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_name = payload.name.strip().rstrip(".")
    
    zone = HostedZone(
        name=clean_name,
        description=payload.description,
        type=payload.type,
        vpc_id=payload.vpc_id,
        vpc_region=payload.vpc_region,
        record_count=2,
        user_id=current_user.id # Bind the new zone to the current user
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
def get_hosted_zone(
    zone_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure the requested zone actually belongs to the user
    zone = db.query(HostedZone).filter(
        HostedZone.id == zone_id,
        HostedZone.user_id == current_user.id
    ).first()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return zone

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure the user has permission to delete this zone
    zone = db.query(HostedZone).filter(
        HostedZone.id == zone_id,
        HostedZone.user_id == current_user.id
    ).first()
    
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    db.delete(zone)
    db.commit()
    return None