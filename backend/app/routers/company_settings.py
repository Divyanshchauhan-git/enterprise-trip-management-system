from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.models.company_settings import CompanySettings
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class CompanySettingsCreate(BaseModel):
    company_name: str
    address: str
    phone: str
    email: str
    website: Optional[str] = None
    payment_terms: Optional[str] = "Net 30"

@router.post("/company-settings")
async def create_company_settings(settings: CompanySettingsCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_settings = CompanySettings(company_name=settings.company_name, address=settings.address, phone=settings.phone, email=settings.email, website=settings.website, payment_terms=settings.payment_terms)
    db.add(new_settings)
    db.commit()
    db.refresh(new_settings)
    return {"id": new_settings.id, "company_name": new_settings.company_name, "address": new_settings.address, "phone": new_settings.phone, "email": new_settings.email, "website": new_settings.website, "payment_terms": new_settings.payment_terms}

@router.get("/company-settings")
async def get_company_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(CompanySettings).all()
    return [{"id": s.id, "company_name": s.company_name, "address": s.address, "phone": s.phone, "email": s.email, "website": s.website, "payment_terms": s.payment_terms} for s in settings]

@router.put("/company-settings/{settings_id}")
async def update_company_settings(settings_id: int, settings: CompanySettingsCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(CompanySettings).filter(CompanySettings.id == settings_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Company settings not found")
    existing.company_name = settings.company_name
    existing.address = settings.address
    existing.phone = settings.phone
    existing.email = settings.email
    existing.website = settings.website
    existing.payment_terms = settings.payment_terms
    db.commit()
    db.refresh(existing)
    return {"id": existing.id, "company_name": existing.company_name, "address": existing.address, "phone": existing.phone, "email": existing.email, "website": existing.website, "payment_terms": existing.payment_terms}

@router.delete("/company-settings/{settings_id}")
async def delete_company_settings(settings_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(CompanySettings).filter(CompanySettings.id == settings_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Company settings not found")
    db.delete(existing)
    db.commit()
    return {"message": "Company settings deleted successfully"}