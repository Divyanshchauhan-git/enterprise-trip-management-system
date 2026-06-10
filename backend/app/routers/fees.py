from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.fee import Fee
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class FeeCreate(BaseModel):
    name: str
    default_rate: float

@router.post("/fees")
async def create_fee(fee: FeeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_fee = Fee(name=fee.name, default_rate=fee.default_rate)
    db.add(new_fee)
    db.commit()
    db.refresh(new_fee)
    return {"id": new_fee.id, "name": new_fee.name, "default_rate": new_fee.default_rate}

@router.get("/fees")
async def get_fees(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fees = db.query(Fee).all()
    return [{"id": f.id, "name": f.name, "default_rate": f.default_rate} for f in fees]

@router.delete("/fees/{fee_id}")
async def delete_fee(fee_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Fee).filter(Fee.id == fee_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Fee not found")
    db.delete(existing)
    db.commit()
    return {"message": "Fee deleted successfully"}