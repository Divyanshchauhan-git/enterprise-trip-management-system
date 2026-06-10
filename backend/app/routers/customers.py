from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.customer import Customer
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class CustomerCreate(BaseModel):
    name: str
    billing_address: str
    email: str

@router.post("/customers")
async def create_customer(customer: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_customer = Customer(name=customer.name, billing_address=customer.billing_address, email=customer.email)
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return {"id": new_customer.id, "name": new_customer.name, "billing_address": new_customer.billing_address, "email": new_customer.email}

@router.get("/customers")
async def get_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customers = db.query(Customer).all()
    return [{"id": c.id, "name": c.name, "billing_address": c.billing_address, "email": c.email} for c in customers]

@router.put("/customers/{customer_id}")
async def update_customer(customer_id: int, customer: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Customer).filter(Customer.id == customer_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    existing.name = customer.name
    existing.billing_address = customer.billing_address
    existing.email = customer.email
    db.commit()
    db.refresh(existing)
    return {"id": existing.id, "name": existing.name, "billing_address": existing.billing_address, "email": existing.email}

@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Customer).filter(Customer.id == customer_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(existing)
    db.commit()
    return {"message": "Customer deleted successfully"}