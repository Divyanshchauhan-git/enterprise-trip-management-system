from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.shipto import ShipTo
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class ShipToCreate(BaseModel):
    customer_id: int
    name: str
    address: str

@router.post("/shipto")
async def create_shipto(shipto: ShipToCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_shipto = ShipTo(customer_id=shipto.customer_id, name=shipto.name, address=shipto.address)
    db.add(new_shipto)
    db.commit()
    db.refresh(new_shipto)
    return {"id": new_shipto.id, "customer_id": new_shipto.customer_id, "name": new_shipto.name, "address": new_shipto.address}

@router.get("/shipto")
async def get_shipto(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shiptos = db.query(ShipTo).all()
    return [{"id": s.id, "customer_id": s.customer_id, "name": s.name, "address": s.address} for s in shiptos]

@router.get("/shipto/customer/{customer_id}")
async def get_shipto_by_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shiptos = db.query(ShipTo).filter(ShipTo.customer_id == customer_id).all()
    return [{"id": s.id, "customer_id": s.customer_id, "name": s.name, "address": s.address} for s in shiptos]

@router.delete("/shipto/{shipto_id}")
async def delete_shipto(shipto_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shipto = db.query(ShipTo).filter(ShipTo.id == shipto_id).first()
    if not shipto:
        raise HTTPException(status_code=404, detail="ShipTo not found")
    db.delete(shipto)
    db.commit()
    return {"message": "ShipTo deleted successfully"}