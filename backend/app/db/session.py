import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables (like DATABASE_URL)
load_dotenv()

# Pull the Neon database URL from the environment, fallback to SQLite locally
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./route53.db")

# Fix for SQLAlchemy: If a URL starts with 'postgres://', it needs to be 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite requires a specific argument that PostgreSQL does not
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL (Neon) connection
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()