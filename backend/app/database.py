import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = None

if DATABASE_URL:
    try:
        url = DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        
        test_engine = create_engine(
            url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 4} if "postgres" in url else {}
        )
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        print("[Database] Successfully connected to remote PostgreSQL database.")
    except Exception as e:
        print(f"[Database] Remote database connection failed ({e}). Falling back to local SQLite database.")
        engine = None

if engine is None:
    DATABASE_URL = "sqlite:///./enterprise_trip.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
    print(f"[Database] Running on local SQLite database: {DATABASE_URL}")

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()