"""
G.A.T.E - Database connection setup (SQLAlchemy + PostgreSQL/Neon)
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()  # loads variables from backend/.env

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Make sure backend/.env exists and contains "
        "a valid DATABASE_URL pointing to your Neon PostgreSQL database."
    )

# pool_pre_ping avoids stale-connection errors with cloud databases like Neon
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a database session per-request, closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
