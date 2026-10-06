import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.db.session import Base, engine
from app.api import hosted_zones, records, auth

# Load environment variables from .env file
load_dotenv()

# CRITICAL: Import all models here so SQLAlchemy registers them 
# before attempting to build the database tables.
from app.models.user import User
from app.models.hosted_zone import HostedZone
# Assuming you have a record.py model, import it too:
# from app.models.record import Record 

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AWS Route53 Clone API", version="1.0.0")

# Allow localhost for dev, and the live frontend URL for prod
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(hosted_zones.router, prefix="/api")
app.include_router(records.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "healthy", "service": "route53-backend"}