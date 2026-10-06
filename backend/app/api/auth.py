from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    account_id: str = "1234-5678-9012"
    username: str = "admin"
    password: str = "password"

@router.post("/login")
def login(creds: LoginRequest):
    return {
        "status": "success",
        "user": {
            "account_id": creds.account_id,
            "username": creds.username,
            "role": "AdministratorAccess",
            "region": "us-east-1",
        },
        "token": "mock-jwt-token-route53-access"
    }

@router.post("/logout")
def logout():
    return {"status": "logged_out"}