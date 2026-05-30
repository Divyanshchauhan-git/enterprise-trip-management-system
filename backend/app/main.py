import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from app.models.email_settings import EmailSettings, EmailSendConfiguration
from app.scheduler import start_scheduler
from app.models.freight_configuration import FreightConfiguration
from app.models.invoice_configuration import InvoiceConfiguration
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from jose import jwt, JWTError
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors

from app.database import SessionLocal, engine, Base
from app.models.trip import Trip
from app.models.user import User
from app.models.customer import Customer
from app.models.vendor import Vendor
from app.models.product_category import ProductCategory
from app.models.product import Product
from app.models.fee import Fee
from app.models.tax import Tax
from app.models.document_template import DocumentTemplate
from app.models.shipto import ShipTo

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI()

Base.metadata.create_all(bind=engine)
scheduler = start_scheduler()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── DB Dependency ───────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Pydantic Schemas ─────────────────────────────────────────
class TripCreate(BaseModel):
    driver_name: str
    total_gallons: int
    total_stops: int = 0
    status: str

class TripUpdate(BaseModel):
    driver_name: str
    total_gallons: int
    total_stops: int
    status: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class CustomerCreate(BaseModel):
    name: str
    billing_address: str
    email: str

class VendorCreate(BaseModel):
    name: str
    address: str
    email: str

class ProductCategoryCreate(BaseModel):
    name: str

class ProductCreate(BaseModel):
    name: str
    product_category_id: int

class FeeCreate(BaseModel):
    name: str
    default_rate: float

class TaxCreate(BaseModel):
    name: str
    percentage: float

class DocumentTemplateCreate(BaseModel):
    document_type: str
    show_fees: bool
    show_taxes: bool
    show_logo: bool

class ShipToCreate(BaseModel):
    customer_id: int
    name: str
    address: str

class InvoiceConfigurationCreate(BaseModel):
    customer_id: int
    shipto_id: int
    invoice_time: dict
    products: list
    fees: list
    taxes: list

class FreightConfigurationCreate(BaseModel):
    vendor_id: int
    categories: list
    fees: list

class EmailSettingsCreate(BaseModel):
    provider: str
    email: str
    oauth_token: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_password: Optional[str] = None
    is_active: bool = True

class EmailSendConfigurationCreate(BaseModel):
    document_type: str
    destination_email: str
    is_active: bool = True


# ─── Auth Helper ──────────────────────────────────────────────
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


# ─── Root ─────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "Backend Running Successfully"}


# ─── Auth ─────────────────────────────────────────────────────
@app.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = pwd_context.hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }


@app.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = jwt.encode({"sub": str(existing_user.id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "username": existing_user.username,
            "email": existing_user.email
        }
    }


# ─── Trips ────────────────────────────────────────────────────
@app.get("/trips")
async def get_trips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trips = db.query(Trip).all()
    return [
        {
            "id": t.id,
            "driver_name": t.driver_name,
            "total_gallons": t.total_gallons,
            "total_stops": t.total_stops,
            "status": t.status
        }
        for t in trips
    ]


@app.get("/trips/{trip_id}")
async def get_single_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {
        "id": trip.id,
        "driver_name": trip.driver_name,
        "total_gallons": trip.total_gallons,
        "total_stops": trip.total_stops,
        "status": trip.status
    }


@app.post("/trips")
async def create_trip(trip: TripCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_trip = Trip(
        driver_name=trip.driver_name,
        total_gallons=trip.total_gallons,
        total_stops=trip.total_stops,
        status=trip.status
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return {
        "message": "Trip created successfully",
        "trip": {
            "id": new_trip.id,
            "driver_name": new_trip.driver_name,
            "total_gallons": new_trip.total_gallons,
            "total_stops": new_trip.total_stops,
            "status": new_trip.status
        }
    }


@app.put("/trips/{trip_id}")
async def update_trip(trip_id: int, updated_trip: TripUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.driver_name = updated_trip.driver_name
    trip.total_gallons = updated_trip.total_gallons
    trip.total_stops = updated_trip.total_stops
    trip.status = updated_trip.status
    db.commit()
    db.refresh(trip)
    return {
        "message": "Trip updated successfully",
        "trip": {
            "id": trip.id,
            "driver_name": trip.driver_name,
            "total_gallons": trip.total_gallons,
            "total_stops": trip.total_stops,
            "status": trip.status
        }
    }


@app.delete("/trips/{trip_id}")
async def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}


# ─── Customers ────────────────────────────────────────────────
@app.post("/customers")
async def create_customer(customer: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_customer = Customer(
        name=customer.name,
        billing_address=customer.billing_address,
        email=customer.email
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return {
        "id": new_customer.id,
        "name": new_customer.name,
        "billing_address": new_customer.billing_address,
        "email": new_customer.email
    }


@app.get("/customers")
async def get_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customers = db.query(Customer).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "billing_address": c.billing_address,
            "email": c.email
        }
        for c in customers
    ]


@app.put("/customers/{customer_id}")
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


@app.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Customer).filter(Customer.id == customer_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(existing)
    db.commit()
    return {"message": "Customer deleted successfully"}


# ─── ShipTo ───────────────────────────────────────────────────
@app.post("/shipto")
async def create_shipto(shipto: ShipToCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_shipto = ShipTo(
        customer_id=shipto.customer_id,
        name=shipto.name,
        address=shipto.address
    )
    db.add(new_shipto)
    db.commit()
    db.refresh(new_shipto)
    return {
        "id": new_shipto.id,
        "customer_id": new_shipto.customer_id,
        "name": new_shipto.name,
        "address": new_shipto.address
    }


@app.get("/shipto")
async def get_shipto(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shiptos = db.query(ShipTo).all()
    return [
        {
            "id": s.id,
            "customer_id": s.customer_id,
            "name": s.name,
            "address": s.address
        }
        for s in shiptos
    ]


@app.get("/shipto/customer/{customer_id}")
async def get_shipto_by_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shiptos = db.query(ShipTo).filter(ShipTo.customer_id == customer_id).all()
    return [
        {
            "id": s.id,
            "customer_id": s.customer_id,
            "name": s.name,
            "address": s.address
        }
        for s in shiptos
    ]


@app.delete("/shipto/{shipto_id}")
async def delete_shipto(shipto_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shipto = db.query(ShipTo).filter(ShipTo.id == shipto_id).first()
    if not shipto:
        raise HTTPException(status_code=404, detail="ShipTo not found")
    db.delete(shipto)
    db.commit()
    return {"message": "ShipTo deleted successfully"}


# ─── Vendors ──────────────────────────────────────────────────
@app.post("/vendors")
async def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_vendor = Vendor(
        name=vendor.name,
        address=vendor.address,
        email=vendor.email
    )
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return {"id": new_vendor.id, "name": new_vendor.name, "address": new_vendor.address, "email": new_vendor.email}


@app.get("/vendors")
async def get_vendors(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vendors = db.query(Vendor).all()
    return [{"id": v.id, "name": v.name, "address": v.address, "email": v.email} for v in vendors]


@app.put("/vendors/{vendor_id}")
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


@app.delete("/vendors/{vendor_id}")
async def delete_vendor(vendor_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(existing)
    db.commit()
    return {"message": "Vendor deleted successfully"}


# ─── Product Categories ───────────────────────────────────────
@app.post("/product-categories")
async def create_product_category(category: ProductCategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_category = ProductCategory(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return {"id": new_category.id, "name": new_category.name}


@app.get("/product-categories")
async def get_product_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    categories = db.query(ProductCategory).all()
    return [{"id": c.id, "name": c.name} for c in categories]


@app.delete("/product-categories/{category_id}")
async def delete_product_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(existing)
    db.commit()
    return {"message": "Category deleted successfully"}


# ─── Products ─────────────────────────────────────────────────
@app.post("/products")
async def create_product(product: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_product = Product(name=product.name, product_category_id=product.product_category_id)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"id": new_product.id, "name": new_product.name, "product_category_id": new_product.product_category_id}


@app.get("/products")
async def get_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).all()
    return [{"id": p.id, "name": p.name, "product_category_id": p.product_category_id} for p in products]


@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Product).filter(Product.id == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(existing)
    db.commit()
    return {"message": "Product deleted successfully"}


# ─── Fees ─────────────────────────────────────────────────────
@app.post("/fees")
async def create_fee(fee: FeeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_fee = Fee(name=fee.name, default_rate=fee.default_rate)
    db.add(new_fee)
    db.commit()
    db.refresh(new_fee)
    return {"id": new_fee.id, "name": new_fee.name, "default_rate": new_fee.default_rate}


@app.get("/fees")
async def get_fees(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fees = db.query(Fee).all()
    return [{"id": f.id, "name": f.name, "default_rate": f.default_rate} for f in fees]


@app.delete("/fees/{fee_id}")
async def delete_fee(fee_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Fee).filter(Fee.id == fee_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Fee not found")
    db.delete(existing)
    db.commit()
    return {"message": "Fee deleted successfully"}


# ─── Taxes ────────────────────────────────────────────────────
@app.post("/taxes")
async def create_tax(tax: TaxCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_tax = Tax(name=tax.name, percentage=tax.percentage)
    db.add(new_tax)
    db.commit()
    db.refresh(new_tax)
    return {"id": new_tax.id, "name": new_tax.name, "percentage": new_tax.percentage}


@app.get("/taxes")
async def get_taxes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    taxes = db.query(Tax).all()
    return [{"id": t.id, "name": t.name, "percentage": t.percentage} for t in taxes]


@app.delete("/taxes/{tax_id}")
async def delete_tax(tax_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Tax).filter(Tax.id == tax_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Tax not found")
    db.delete(existing)
    db.commit()
    return {"message": "Tax deleted successfully"}


# ─── Document Templates ───────────────────────────────────────
@app.post("/document-templates")
async def create_document_template(template: DocumentTemplateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_template = DocumentTemplate(
        document_type=template.document_type,
        show_fees=template.show_fees,
        show_taxes=template.show_taxes,
        show_logo=template.show_logo
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return {
        "id": new_template.id,
        "document_type": new_template.document_type,
        "show_fees": new_template.show_fees,
        "show_taxes": new_template.show_taxes,
        "show_logo": new_template.show_logo
    }


@app.get("/document-templates")
async def get_document_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    templates = db.query(DocumentTemplate).all()
    return [
        {
            "id": t.id,
            "document_type": t.document_type,
            "show_fees": t.show_fees,
            "show_taxes": t.show_taxes,
            "show_logo": t.show_logo
        }
        for t in templates
    ]


# ─── Invoice Configurations ───────────────────────────────────
@app.post("/invoice-configurations")
async def create_invoice_configuration(config: InvoiceConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_config = InvoiceConfiguration(
        customer_id=config.customer_id,
        shipto_id=config.shipto_id,
        invoice_time=config.invoice_time,
        products=config.products,
        fees=config.fees,
        taxes=config.taxes
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {
        "id": new_config.id,
        "customer_id": new_config.customer_id,
        "shipto_id": new_config.shipto_id,
        "invoice_time": new_config.invoice_time,
        "products": new_config.products,
        "fees": new_config.fees,
        "taxes": new_config.taxes
    }


@app.get("/invoice-configurations")
async def get_invoice_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(InvoiceConfiguration).all()
    return [
        {
            "id": c.id,
            "customer_id": c.customer_id,
            "shipto_id": c.shipto_id,
            "invoice_time": c.invoice_time,
            "products": c.products,
            "fees": c.fees,
            "taxes": c.taxes
        }
        for c in configs
    ]


@app.get("/invoice-configurations/{config_id}")
async def get_invoice_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")
    return {
        "id": config.id,
        "customer_id": config.customer_id,
        "shipto_id": config.shipto_id,
        "invoice_time": config.invoice_time,
        "products": config.products,
        "fees": config.fees,
        "taxes": config.taxes
    }


@app.put("/invoice-configurations/{config_id}")
async def update_invoice_configuration(config_id: int, config: InvoiceConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")
    existing.customer_id = config.customer_id
    existing.shipto_id = config.shipto_id
    existing.invoice_time = config.invoice_time
    existing.products = config.products
    existing.fees = config.fees
    existing.taxes = config.taxes
    db.commit()
    db.refresh(existing)
    return {
        "id": existing.id,
        "customer_id": existing.customer_id,
        "shipto_id": existing.shipto_id,
        "invoice_time": existing.invoice_time,
        "products": existing.products,
        "fees": existing.fees,
        "taxes": existing.taxes
    }


@app.delete("/invoice-configurations/{config_id}")
async def delete_invoice_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")
    db.delete(existing)
    db.commit()
    return {"message": "Invoice configuration deleted successfully"}


# ─── Freight Configurations ───────────────────────────────────
@app.post("/freight-configurations")
async def create_freight_configuration(config: FreightConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_config = FreightConfiguration(
        vendor_id=config.vendor_id,
        categories=config.categories,
        fees=config.fees
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {
        "id": new_config.id,
        "vendor_id": new_config.vendor_id,
        "categories": new_config.categories,
        "fees": new_config.fees
    }


@app.get("/freight-configurations")
async def get_freight_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(FreightConfiguration).all()
    return [
        {
            "id": c.id,
            "vendor_id": c.vendor_id,
            "categories": c.categories,
            "fees": c.fees
        }
        for c in configs
    ]


@app.get("/freight-configurations/{config_id}")
async def get_freight_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    return {
        "id": config.id,
        "vendor_id": config.vendor_id,
        "categories": config.categories,
        "fees": config.fees
    }


@app.put("/freight-configurations/{config_id}")
async def update_freight_configuration(config_id: int, config: FreightConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    existing.vendor_id = config.vendor_id
    existing.categories = config.categories
    existing.fees = config.fees
    db.commit()
    db.refresh(existing)
    return {
        "id": existing.id,
        "vendor_id": existing.vendor_id,
        "categories": existing.categories,
        "fees": existing.fees
    }


@app.delete("/freight-configurations/{config_id}")
async def delete_freight_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    db.delete(existing)
    db.commit()
    return {"message": "Freight configuration deleted successfully"}


# ─── PDF Generation ───────────────────────────────────────────
@app.get("/generate-invoice/{trip_id}")
async def generate_invoice(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    template = db.query(DocumentTemplate).filter(DocumentTemplate.document_type == "invoice").first()
    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"invoice_{trip.id}.pdf"
    file_path = f"generated_documents/{file_name}"
    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    if template and template.show_logo:
        pdf.setFont("Helvetica-Bold", 10)
        pdf.setFillColor(colors.grey)
        pdf.drawString(50, height - 50, "[ COMPANY LOGO ]")
        pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(200, height - 80, "Trip Invoice")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, height - 120, f"Invoice #: {trip.id:04d}")
    pdf.drawString(50, height - 140, f"Driver Name: {trip.driver_name}")
    pdf.drawString(50, height - 160, f"Total Gallons: {trip.total_gallons}")
    pdf.drawString(50, height - 180, f"Total Stops: {trip.total_stops}")
    pdf.drawString(50, height - 200, f"Status: {trip.status}")
    y = height - 240
    if template and template.show_fees:
        fees = db.query(Fee).all()
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(50, y, "Fees:")
        y -= 20
        pdf.setFont("Helvetica", 12)
        total_fees = 0
        for fee in fees:
            pdf.drawString(70, y, f"{fee.name}: ${fee.default_rate:.2f}")
            total_fees += fee.default_rate
            y -= 20
        pdf.drawString(70, y, f"Total Fees: ${total_fees:.2f}")
        y -= 30
    if template and template.show_taxes:
        taxes = db.query(Tax).all()
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(50, y, "Taxes:")
        y -= 20
        pdf.setFont("Helvetica", 12)
        for tax in taxes:
            pdf.drawString(70, y, f"{tax.name}: {tax.percentage}%")
            y -= 20
        y -= 10
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(50, y, f"Grand Total Gallons: {trip.total_gallons}")
    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


@app.get("/generate-delivery-ticket/{trip_id}")
async def generate_delivery_ticket(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    template = db.query(DocumentTemplate).filter(DocumentTemplate.document_type == "delivery_ticket").first()
    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"delivery_ticket_{trip.id}.pdf"
    file_path = f"generated_documents/{file_name}"
    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    if template and template.show_logo:
        pdf.setFont("Helvetica-Bold", 10)
        pdf.setFillColor(colors.grey)
        pdf.drawString(50, height - 50, "[ COMPANY LOGO ]")
        pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(180, height - 80, "Delivery Ticket")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, height - 120, f"Delivery #: {trip.id:04d}")
    pdf.drawString(50, height - 140, f"Driver Name: {trip.driver_name}")
    pdf.drawString(50, height - 160, f"Total Stops: {trip.total_stops}")
    pdf.drawString(50, height - 180, f"Status: {trip.status}")
    pdf.drawString(50, height - 200, f"Delivery Date: {datetime.now().strftime('%Y-%m-%d')}")
    pdf.drawString(50, height - 220, f"Delivery Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    y = height - 260
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(50, y, "Products Delivered:")
    y -= 20
    pdf.setFont("Helvetica", 12)
    pdf.drawString(70, y, f"Total Gallons Delivered: {trip.total_gallons}")
    y -= 20
    pdf.drawString(70, y, f"Total Stops: {trip.total_stops}")
    y -= 30
    pdf.setFont("Helvetica-Bold", 11)
    pdf.setFillColor(colors.grey)
    pdf.drawString(50, y, "* No pricing, fees, or taxes on delivery tickets")
    pdf.setFillColor(colors.black)
    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


@app.get("/generate-freight-invoice/{config_id}")
async def generate_freight_invoice(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    vendor = db.query(Vendor).filter(Vendor.id == config.vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    template = db.query(DocumentTemplate).filter(DocumentTemplate.document_type == "freight_invoice").first()
    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"freight_invoice_{config.id}.pdf"
    file_path = f"generated_documents/{file_name}"
    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    if template and template.show_logo:
        pdf.setFont("Helvetica-Bold", 10)
        pdf.setFillColor(colors.grey)
        pdf.drawString(50, height - 50, "[ COMPANY LOGO ]")
        pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(170, height - 80, "Freight Invoice")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, height - 120, f"Freight Invoice #: {config.id:04d}")
    pdf.drawString(50, height - 140, f"Vendor: {vendor.name}")
    pdf.drawString(50, height - 160, f"Vendor Address: {vendor.address}")
    pdf.drawString(50, height - 180, f"Invoice Date: {datetime.now().strftime('%Y-%m-%d')}")
    pdf.drawString(50, height - 200, f"Due Date: {datetime.now().strftime('%Y-%m-%d')}")
    y = height - 240
    subtotal = 0
    total_fees = 0
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(50, y, "Freight Charges:")
    y -= 20
    pdf.setFont("Helvetica", 12)
    if config.categories:
        for cat in config.categories:
            category = db.query(ProductCategory).filter(ProductCategory.id == cat.get("product_category_id")).first()
            cat_name = category.name if category else f"Category {cat.get('product_category_id')}"
            quantity = cat.get("quantity", 0)
            rate = cat.get("freight_rate", 0)
            total = quantity * rate
            subtotal += total
            pdf.drawString(70, y, f"{cat_name} — Qty: {quantity} x Rate: ${rate:.4f} = ${total:.2f}")
            y -= 20
    if config.fees:
        y -= 10
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(50, y, "Fees:")
        y -= 20
        pdf.setFont("Helvetica", 12)
        for fee_item in config.fees:
            fee = db.query(Fee).filter(Fee.id == fee_item.get("fee_id")).first()
            fee_name = fee.name if fee else f"Fee {fee_item.get('fee_id')}"
            quantity = fee_item.get("quantity", 1)
            rate = fee_item.get("rate", fee.default_rate if fee else 0)
            total = quantity * rate
            total_fees += total
            pdf.drawString(70, y, f"{fee_name} — Qty: {quantity} x ${rate:.2f} = ${total:.2f}")
            y -= 20
    y -= 10
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(50, y, f"Subtotal: ${subtotal:.2f}")
    y -= 20
    pdf.drawString(50, y, f"Total Fees: ${total_fees:.2f}")
    y -= 20
    pdf.drawString(50, y, f"Grand Total: ${subtotal + total_fees:.2f}")
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(colors.grey)
    pdf.drawString(50, y - 30, "* No taxes on freight invoices")
    pdf.setFillColor(colors.black)
    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


# ─── Email Settings ───────────────────────────────────────────
@app.post("/email-settings")
async def create_email_settings(settings: EmailSettingsCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_settings = EmailSettings(
        provider=settings.provider,
        email=settings.email,
        oauth_token=settings.oauth_token,
        smtp_host=settings.smtp_host,
        smtp_port=settings.smtp_port,
        smtp_password=settings.smtp_password,
        is_active=settings.is_active
    )
    db.add(new_settings)
    db.commit()
    db.refresh(new_settings)
    return {
        "id": new_settings.id,
        "provider": new_settings.provider,
        "email": new_settings.email,
        "is_active": new_settings.is_active
    }


@app.get("/email-settings")
async def get_email_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(EmailSettings).all()
    return [
        {
            "id": s.id,
            "provider": s.provider,
            "email": s.email,
            "smtp_host": s.smtp_host,
            "smtp_port": s.smtp_port,
            "is_active": s.is_active
        }
        for s in settings
    ]


@app.put("/email-settings/{settings_id}")
async def update_email_settings(settings_id: int, settings: EmailSettingsCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(EmailSettings).filter(EmailSettings.id == settings_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Email settings not found")
    existing.provider = settings.provider
    existing.email = settings.email
    existing.oauth_token = settings.oauth_token
    existing.smtp_host = settings.smtp_host
    existing.smtp_port = settings.smtp_port
    existing.smtp_password = settings.smtp_password
    existing.is_active = settings.is_active
    db.commit()
    db.refresh(existing)
    return {
        "id": existing.id,
        "provider": existing.provider,
        "email": existing.email,
        "is_active": existing.is_active
    }


@app.delete("/email-settings/{settings_id}")
async def delete_email_settings(settings_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(EmailSettings).filter(EmailSettings.id == settings_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Email settings not found")
    db.delete(existing)
    db.commit()
    return {"message": "Email settings deleted successfully"}


# ─── Email Send Configurations ────────────────────────────────
@app.post("/email-send-configurations")
async def create_email_send_configuration(config: EmailSendConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_config = EmailSendConfiguration(
        document_type=config.document_type,
        destination_email=config.destination_email,
        is_active=config.is_active
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {
        "id": new_config.id,
        "document_type": new_config.document_type,
        "destination_email": new_config.destination_email,
        "is_active": new_config.is_active
    }


@app.get("/email-send-configurations")
async def get_email_send_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(EmailSendConfiguration).all()
    return [
        {
            "id": c.id,
            "document_type": c.document_type,
            "destination_email": c.destination_email,
            "is_active": c.is_active
        }
        for c in configs
    ]


@app.put("/email-send-configurations/{config_id}")
async def update_email_send_configuration(config_id: int, config: EmailSendConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(EmailSendConfiguration).filter(EmailSendConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Email send configuration not found")
    existing.document_type = config.document_type
    existing.destination_email = config.destination_email
    existing.is_active = config.is_active
    db.commit()
    db.refresh(existing)
    return {
        "id": existing.id,
        "document_type": existing.document_type,
        "destination_email": existing.destination_email,
        "is_active": existing.is_active
    }


@app.delete("/email-send-configurations/{config_id}")
async def delete_email_send_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(EmailSendConfiguration).filter(EmailSendConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Email send configuration not found")
    db.delete(existing)
    db.commit()
    return {"message": "Email send configuration deleted successfully"}


# ─── Send Email ───────────────────────────────────────────────
@app.post("/send-email")
async def send_email(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document_type = payload.get("document_type")
    file_path = payload.get("file_path")

    if not document_type or not file_path:
        raise HTTPException(status_code=400, detail="document_type and file_path are required")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")

    email_settings = db.query(EmailSettings).filter(EmailSettings.is_active == True).first()
    if not email_settings:
        raise HTTPException(status_code=404, detail="No active email settings found")

    send_config = db.query(EmailSendConfiguration).filter(
        EmailSendConfiguration.document_type == document_type,
        EmailSendConfiguration.is_active == True
    ).first()
    if not send_config:
        raise HTTPException(status_code=404, detail="No active email send configuration found for this document type")

    subject_map = {
        "invoice": f"Invoice #{os.path.basename(file_path)}",
        "delivery_ticket": f"Delivery Ticket #{os.path.basename(file_path)}",
        "freight_invoice": f"Freight Invoice #{os.path.basename(file_path)}"
    }
    subject = subject_map.get(document_type, "Document")

    msg = MIMEMultipart()
    msg["From"] = email_settings.email
    msg["To"] = send_config.destination_email
    msg["Subject"] = subject
    msg.attach(MIMEText(f"Please find attached your {document_type.replace('_', ' ')}.", "plain"))

    with open(file_path, "rb") as f:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(file_path)}")
        msg.attach(part)

    try:
        if email_settings.provider == "smtp":
            server = smtplib.SMTP(email_settings.smtp_host, email_settings.smtp_port)
            server.starttls()
            server.login(email_settings.email, email_settings.smtp_password)
            server.sendmail(email_settings.email, send_config.destination_email, msg.as_string())
            server.quit()
        elif email_settings.provider == "gmail":
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(email_settings.email, email_settings.oauth_token)
            server.sendmail(email_settings.email, send_config.destination_email, msg.as_string())
            server.quit()
        else:
            raise HTTPException(status_code=400, detail="Unsupported email provider")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {
        "message": "Email sent successfully",
        "to": send_config.destination_email,
        "subject": subject
    }