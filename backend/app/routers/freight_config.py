from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.freight_configuration import FreightConfiguration
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class FreightConfigurationCreate(BaseModel):
    vendor_id: int
    categories: list
    fees: list

@router.post("/freight-configurations")
async def create_freight_configuration(config: FreightConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_config = FreightConfiguration(vendor_id=config.vendor_id, categories=config.categories, fees=config.fees)
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {"id": new_config.id, "vendor_id": new_config.vendor_id, "categories": new_config.categories, "fees": new_config.fees}

@router.get("/freight-configurations")
async def get_freight_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(FreightConfiguration).all()
    return [{"id": c.id, "vendor_id": c.vendor_id, "categories": c.categories, "fees": c.fees} for c in configs]

@router.get("/freight-configurations/{config_id}")
async def get_freight_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    return {"id": config.id, "vendor_id": config.vendor_id, "categories": config.categories, "fees": config.fees}

@router.put("/freight-configurations/{config_id}")
async def update_freight_configuration(config_id: int, config: FreightConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    existing.vendor_id = config.vendor_id
    existing.categories = config.categories
    existing.fees = config.fees
    db.commit()
    db.refresh(existing)
    return {"id": existing.id, "vendor_id": existing.vendor_id, "categories": existing.categories, "fees": existing.fees}

@router.delete("/freight-configurations/{config_id}")
async def delete_freight_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    db.delete(existing)
    db.commit()
    return {"message": "Freight configuration deleted successfully"}