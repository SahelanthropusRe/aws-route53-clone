from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import Base, engine
from app.api import hosted_zones, records, auth

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AWS Route53 Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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