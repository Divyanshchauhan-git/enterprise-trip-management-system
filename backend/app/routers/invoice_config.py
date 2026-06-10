from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.models.invoice_configuration import InvoiceConfiguration
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class InvoiceConfigurationCreate(BaseModel):
    customer_id: int
    shipto_id: int
    vendor_id: Optional[int] = None
    invoice_time: dict
    products: list
    fees: list
    taxes: list

@router.post("/invoice-configurations")
async def create_invoice_configuration(config: InvoiceConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_config = InvoiceConfiguration(
        customer_id=config.customer_id,
        shipto_id=config.shipto_id,
        vendor_id=config.vendor_id,
        invoice_time=config.invoice_time,
        products=config.products,
        fees=config.fees,
        taxes=config.taxes
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {"id": new_config.id, "customer_id": new_config.customer_id, "shipto_id": new_config.shipto_id, "vendor_id": new_config.vendor_id, "invoice_time": new_config.invoice_time, "products": new_config.products, "fees": new_config.fees, "taxes": new_config.taxes}

@router.get("/invoice-configurations")
async def get_invoice_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(InvoiceConfiguration).all()
    return [{"id": c.id, "customer_id": c.customer_id, "shipto_id": c.shipto_id, "vendor_id": c.vendor_id, "invoice_time": c.invoice_time, "products": c.products, "fees": c.fees, "taxes": c.taxes} for c in configs]

@router.get("/invoice-configurations/{config_id}")
async def get_invoice_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")
    return {"id": config.id, "customer_id": config.customer_id, "shipto_id": config.shipto_id, "vendor_id": config.vendor_id, "invoice_time": config.invoice_time, "products": config.products, "fees": config.fees, "taxes": config.taxes}

@router.put("/invoice-configurations/{config_id}")
async def update_invoice_configuration(config_id: int, config: InvoiceConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")
    existing.customer_id = config.customer_id
    existing.shipto_id = config.shipto_id
    existing.vendor_id = config.vendor_id
    existing.invoice_time = config.invoice_time
    existing.products = config.products
    existing.fees = config.fees
    existing.taxes = config.taxes
    db.commit()
    db.refresh(existing)
    return {"id": existing.id, "customer_id": existing.customer_id, "shipto_id": existing.shipto_id, "vendor_id": existing.vendor_id, "invoice_time": existing.invoice_time, "products": existing.products, "fees": existing.fees, "taxes": existing.taxes}

@router.delete("/invoice-configurations/{config_id}")
async def delete_invoice_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")
    db.delete(existing)
    db.commit()
    return {"message": "Invoice configuration deleted successfully"}