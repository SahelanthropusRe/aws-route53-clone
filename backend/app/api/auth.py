from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token

# Since your main.py might already mount this, we keep your prefix and tags
router = APIRouter(prefix="/auth", tags=["Auth"])

# Schema for incoming requests
class UserCredentials(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(creds: UserCredentials, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == creds.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(creds.password)
    new_user = User(username=creds.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    
    return {"status": "success", "message": "User created successfully"}

@router.post("/login")
def login(creds: UserCredentials, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == creds.username).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Generate the real JWT token securely
    access_token = create_access_token(data={"sub": user.username, "user_id": user.id})
    
    # Returning the real token alongside the AWS-style UI variables
    return {
        "status": "success",
        "user": {
            "account_id": "1234-5678-9012", 
            "username": user.username,
            "role": "AdministratorAccess",
            "region": "us-east-1",
        },
        "token": access_token
    }

@router.post("/logout")
def logout():
    return {"status": "logged_out"}