import os
import json
import secrets
import urllib.request
import urllib.error
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError
from app.database import SessionLocal
from app.models.user import User

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")[:72]
    return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))

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

def verify_google_id_token(credential: str) -> dict:
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
    req = urllib.request.Request(url, headers={"User-Agent": "Enterprise-Trip-Management/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status != 200:
                raise HTTPException(status_code=401, detail="Failed to verify Google token")
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = "Invalid Google token"
        try:
            err_data = json.loads(e.read().decode("utf-8"))
            err_msg = err_data.get("error_description", err_msg)
        except Exception:
            pass
        raise HTTPException(status_code=401, detail=f"Google authentication failed: {err_msg}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Google verification network error: {str(e)}")

    email_verified = data.get("email_verified")
    if email_verified not in [True, "true", "True"]:
        raise HTTPException(status_code=400, detail="Google email is not verified")

    if GOOGLE_CLIENT_ID and data.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Google token client ID mismatch")

    return data

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str

@router.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = hash_password(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        auth_provider="local"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "avatar_url": new_user.avatar_url,
            "auth_provider": new_user.auth_provider,
        }
    }

@router.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not existing_user.password or not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = jwt.encode({"sub": str(existing_user.id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "username": existing_user.username,
            "email": existing_user.email,
            "avatar_url": existing_user.avatar_url,
            "auth_provider": existing_user.auth_provider or "local",
        }
    }

@router.post("/google")
@router.post("/auth/google")
async def google_login(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    if not request.credential:
        raise HTTPException(status_code=400, detail="Google credential token is required")

    google_data = verify_google_id_token(request.credential)
    google_id = google_data.get("sub")
    email = google_data.get("email")
    name = google_data.get("name") or (email.split("@")[0] if email else "Operator")
    picture = google_data.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google account")

    # Look up existing user by google_id or email
    user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()

    if user:
        if not user.google_id:
            user.google_id = google_id
        if picture and not user.avatar_url:
            user.avatar_url = picture
        if not user.auth_provider:
            user.auth_provider = "google"
        db.commit()
        db.refresh(user)
    else:
        # Generate unique username
        base_username = "".join(c for c in name if c.isalnum() or c in ("_", "-")).lower()
        if not base_username:
            base_username = email.split("@")[0]
        
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{counter}"
            counter += 1

        dummy_pwd = hash_password(secrets.token_urlsafe(32))
        user = User(
            username=username,
            email=email,
            password=dummy_pwd,
            google_id=google_id,
            avatar_url=picture,
            auth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = jwt.encode({"sub": str(user.id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "auth_provider": user.auth_provider,
        }
    }