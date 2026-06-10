from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.vendor import Vendor
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class VendorCreate(BaseModel):
    name: str
    address: str
    email: str

@router.post("/vendors")
async def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_vendor = Vendor(name=vendor.name, address=vendor.address, email=vendor.email)
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return {"id": new_vendor.id, "name": new_vendor.name, "address": new_vendor.address, "email": new_vendor.email}

@router.get("/vendors")
async def get_vendors(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vendors = db.query(Vendor).all()
    return [{"id": v.id, "name": v.name, "address": v.address, "email": v.email} for v in vendors]

@router.put("/vendors/{vendor_id}")
async def update_vendor(vendor_id: int, vendor: VendorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Vendor not found")
    existing.name = vendor.name
    existing.address = vendor.address
    existing.email = vendor.email
    db.commit()
    db.refresh(existing)
    return {"id": existing.id, "name": existing.name, "address": existing.address, "email": existing.email}

@router.delete("/vendors/{vendor_id}")
async def delete_vendor(vendor_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(existing)
    db.commit()
    return {"message": "Vendor deleted successfully"}