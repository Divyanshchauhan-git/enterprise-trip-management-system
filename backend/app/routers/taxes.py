from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.tax import Tax
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class TaxCreate(BaseModel):
    name: str
    percentage: float

@router.post("/taxes")
async def create_tax(tax: TaxCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_tax = Tax(name=tax.name, percentage=tax.percentage)
    db.add(new_tax)
    db.commit()
    db.refresh(new_tax)
    return {"id": new_tax.id, "name": new_tax.name, "percentage": new_tax.percentage}

@router.get("/taxes")
async def get_taxes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    taxes = db.query(Tax).all()
    return [{"id": t.id, "name": t.name, "percentage": t.percentage} for t in taxes]

@router.delete("/taxes/{tax_id}")
async def delete_tax(tax_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Tax).filter(Tax.id == tax_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Tax not found")
    db.delete(existing)
    db.commit()
    return {"message": "Tax deleted successfully"}