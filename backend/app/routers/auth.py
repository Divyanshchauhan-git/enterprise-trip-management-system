import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport import requests
from app.database import SessionLocal
from app.models.user import User

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    token: str

@router.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = bcrypt.hashpw(
    user.password.encode("utf-8"),
    bcrypt.gensalt()
    ).decode("utf-8")
    new_user = User(username=user.username, email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user": {"id": new_user.id, "username": new_user.username, "email": new_user.email}}

@router.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not bcrypt.checkpw(
    user.password.encode("utf-8"),
    existing_user.password.encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = jwt.encode({"sub": str(existing_user.id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": existing_user.id, "username": existing_user.username, "email": existing_user.email}}
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "610409536461-l4tu3vl5hcbe0lobaidllk0ac8vje3qh.apps.googleusercontent.com")

@router.post("/google-login")
async def google_login(data: GoogleLogin, db: Session = Depends(get_db)):
    try:
        info = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            CLIENT_ID
        )

        email = info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google token does not contain an email address")

        name = info.get("name") or email.split("@")[0]
        existing_user = db.query(User).filter(User.email == email).first()

        if not existing_user:
            # Generate a secure random placeholder password
            random_pw = os.urandom(24).hex()
            hashed_password = bcrypt.hashpw(
                random_pw.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            # Ensure unique username
            username_candidate = name
            counter = 1
            while db.query(User).filter(User.username == username_candidate).first():
                username_candidate = f"{name}_{counter}"
                counter += 1

            existing_user = User(
                username=username_candidate,
                email=email,
                password=hashed_password
            )

            db.add(existing_user)
            db.commit()
            db.refresh(existing_user)

        token = jwt.encode(
            {"sub": str(existing_user.id)},
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": existing_user.id,
                "username": existing_user.username,
                "email": existing_user.email
            }
        }

    except ValueError as ve:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(ve)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google login server error: {str(e)}")