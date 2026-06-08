import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime, timedelta
from app.models.email_settings import EmailSettings, EmailSendConfiguration
from app.models.freight_configuration import FreightConfiguration
from app.models.invoice_configuration import InvoiceConfiguration
from app.models.company_settings import CompanySettings
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
from reportlab.platypus import Table, TableStyle
from reportlab.lib.units import inch

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

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI()

Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://YOUR-VERCEL-URL.vercel.app",
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

class CompanySettingsCreate(BaseModel):
    company_name: str
    address: str
    phone: str
    email: str
    website: Optional[str] = None
    payment_terms: Optional[str] = "Net 30"


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
    new_user = User(username=user.username, email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user": {"id": new_user.id, "username": new_user.username, "email": new_user.email}}


@app.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = jwt.encode({"sub": str(existing_user.id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": {"id": existing_user.id, "username": existing_user.username, "email": existing_user.email}}


# ─── Company Settings ─────────────────────────────────────────
@app.post("/company-settings")
async def create_company_settings(settings: CompanySettingsCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_settings = CompanySettings(
        company_name=settings.company_name,
        address=settings.address,
        phone=settings.phone,
        email=settings.email,
        website=settings.website,
        payment_terms=settings.payment_terms
    )
    db.add(new_settings)
    db.commit()
    db.refresh(new_settings)
    return {"id": new_settings.id, "company_name": new_settings.company_name, "address": new_settings.address, "phone": new_settings.phone, "email": new_settings.email, "website": new_settings.website, "payment_terms": new_settings.payment_terms}


@app.get("/company-settings")
async def get_company_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(CompanySettings).all()
    return [{"id": s.id, "company_name": s.company_name, "address": s.address, "phone": s.phone, "email": s.email, "website": s.website, "payment_terms": s.payment_terms} for s in settings]


@app.put("/company-settings/{settings_id}")
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


@app.delete("/company-settings/{settings_id}")
async def delete_company_settings(settings_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(CompanySettings).filter(CompanySettings.id == settings_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Company settings not found")
    db.delete(existing)
    db.commit()
    return {"message": "Company settings deleted successfully"}


# ─── Trips ────────────────────────────────────────────────────
@app.get("/trips")
async def get_trips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trips = db.query(Trip).all()
    return [{"id": t.id, "driver_name": t.driver_name, "total_gallons": t.total_gallons, "total_stops": t.total_stops, "status": t.status} for t in trips]


@app.get("/trips/{trip_id}")
async def get_single_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"id": trip.id, "driver_name": trip.driver_name, "total_gallons": trip.total_gallons, "total_stops": trip.total_stops, "status": trip.status}


@app.post("/trips")
async def create_trip(trip: TripCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_trip = Trip(driver_name=trip.driver_name, total_gallons=trip.total_gallons, total_stops=trip.total_stops, status=trip.status)
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return {"message": "Trip created successfully", "trip": {"id": new_trip.id, "driver_name": new_trip.driver_name, "total_gallons": new_trip.total_gallons, "total_stops": new_trip.total_stops, "status": new_trip.status}}


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
    return {"message": "Trip updated successfully", "trip": {"id": trip.id, "driver_name": trip.driver_name, "total_gallons": trip.total_gallons, "total_stops": trip.total_stops, "status": trip.status}}


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
    new_customer = Customer(name=customer.name, billing_address=customer.billing_address, email=customer.email)
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return {"id": new_customer.id, "name": new_customer.name, "billing_address": new_customer.billing_address, "email": new_customer.email}


@app.get("/customers")
async def get_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customers = db.query(Customer).all()
    return [{"id": c.id, "name": c.name, "billing_address": c.billing_address, "email": c.email} for c in customers]


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
    new_shipto = ShipTo(customer_id=shipto.customer_id, name=shipto.name, address=shipto.address)
    db.add(new_shipto)
    db.commit()
    db.refresh(new_shipto)
    return {"id": new_shipto.id, "customer_id": new_shipto.customer_id, "name": new_shipto.name, "address": new_shipto.address}


@app.get("/shipto")
async def get_shipto(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shiptos = db.query(ShipTo).all()
    return [{"id": s.id, "customer_id": s.customer_id, "name": s.name, "address": s.address} for s in shiptos]


@app.get("/shipto/customer/{customer_id}")
async def get_shipto_by_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shiptos = db.query(ShipTo).filter(ShipTo.customer_id == customer_id).all()
    return [{"id": s.id, "customer_id": s.customer_id, "name": s.name, "address": s.address} for s in shiptos]


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
    new_vendor = Vendor(name=vendor.name, address=vendor.address, email=vendor.email)
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
    new_template = DocumentTemplate(document_type=template.document_type, show_fees=template.show_fees, show_taxes=template.show_taxes, show_logo=template.show_logo)
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return {"id": new_template.id, "document_type": new_template.document_type, "show_fees": new_template.show_fees, "show_taxes": new_template.show_taxes, "show_logo": new_template.show_logo}


@app.get("/document-templates")
async def get_document_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    templates = db.query(DocumentTemplate).all()
    return [{"id": t.id, "document_type": t.document_type, "show_fees": t.show_fees, "show_taxes": t.show_taxes, "show_logo": t.show_logo} for t in templates]


# ─── Invoice Configurations ───────────────────────────────────
@app.post("/invoice-configurations")
async def create_invoice_configuration(config: InvoiceConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_config = InvoiceConfiguration(customer_id=config.customer_id, shipto_id=config.shipto_id, invoice_time=config.invoice_time, products=config.products, fees=config.fees, taxes=config.taxes)
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {"id": new_config.id, "customer_id": new_config.customer_id, "shipto_id": new_config.shipto_id, "invoice_time": new_config.invoice_time, "products": new_config.products, "fees": new_config.fees, "taxes": new_config.taxes}


@app.get("/invoice-configurations")
async def get_invoice_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(InvoiceConfiguration).all()
    return [{"id": c.id, "customer_id": c.customer_id, "shipto_id": c.shipto_id, "invoice_time": c.invoice_time, "products": c.products, "fees": c.fees, "taxes": c.taxes} for c in configs]


@app.get("/invoice-configurations/{config_id}")
async def get_invoice_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")
    return {"id": config.id, "customer_id": config.customer_id, "shipto_id": config.shipto_id, "invoice_time": config.invoice_time, "products": config.products, "fees": config.fees, "taxes": config.taxes}


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
    return {"id": existing.id, "customer_id": existing.customer_id, "shipto_id": existing.shipto_id, "invoice_time": existing.invoice_time, "products": existing.products, "fees": existing.fees, "taxes": existing.taxes}


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
    new_config = FreightConfiguration(vendor_id=config.vendor_id, categories=config.categories, fees=config.fees)
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {"id": new_config.id, "vendor_id": new_config.vendor_id, "categories": new_config.categories, "fees": new_config.fees}


@app.get("/freight-configurations")
async def get_freight_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(FreightConfiguration).all()
    return [{"id": c.id, "vendor_id": c.vendor_id, "categories": c.categories, "fees": c.fees} for c in configs]


@app.get("/freight-configurations/{config_id}")
async def get_freight_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    return {"id": config.id, "vendor_id": config.vendor_id, "categories": config.categories, "fees": config.fees}


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
    return {"id": existing.id, "vendor_id": existing.vendor_id, "categories": existing.categories, "fees": existing.fees}


@app.delete("/freight-configurations/{config_id}")
async def delete_freight_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Freight configuration not found")
    db.delete(existing)
    db.commit()
    return {"message": "Freight configuration deleted successfully"}


# ─── PDF HELPER FUNCTIONS ─────────────────────────────────────
def draw_table(pdf, data, col_widths, x, y, header_color=colors.HexColor("#1a1a2e"), row_color=colors.white, alt_color=colors.HexColor("#f9f9fb")):
    row_height = 22
    for row_idx, row in enumerate(data):
        for col_idx, cell in enumerate(row):
            cell_x = x + sum(col_widths[:col_idx])
            cell_y = y - row_idx * row_height
            if row_idx == 0:
                pdf.setFillColor(header_color)
                pdf.rect(cell_x, cell_y - row_height, col_widths[col_idx], row_height, fill=1, stroke=0)
                pdf.setFillColor(colors.white)
                pdf.setFont("Helvetica-Bold", 9)
            else:
                bg = alt_color if row_idx % 2 == 0 else row_color
                pdf.setFillColor(bg)
                pdf.rect(cell_x, cell_y - row_height, col_widths[col_idx], row_height, fill=1, stroke=0)
                pdf.setFillColor(colors.HexColor("#1a1a2e"))
                pdf.setFont("Helvetica", 9)
            pdf.setStrokeColor(colors.HexColor("#e0e0e5"))
            pdf.rect(cell_x, cell_y - row_height, col_widths[col_idx], row_height, fill=0, stroke=1)
            text_x = cell_x + 5
            text_y = cell_y - row_height + 7
            pdf.drawString(text_x, text_y, str(cell))
    return y - len(data) * row_height


# ─── PROFESSIONAL INVOICE PDF ─────────────────────────────────
@app.get("/generate-invoice-from-config/{config_id}")
async def generate_invoice_from_config(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")

    customer = db.query(Customer).filter(Customer.id == config.customer_id).first()
    shipto = db.query(ShipTo).filter(ShipTo.id == config.shipto_id).first()
    company = db.query(CompanySettings).first()

    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"invoice_{config_id}.pdf"
    file_path = f"generated_documents/{file_name}"

    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    margin = 50

    # ── HEADER ──────────────────────────────────────────────
    if company:
        pdf.setFont("Helvetica-Bold", 10)
        pdf.setFillColor(colors.HexColor("#1a1a2e"))
        pdf.drawString(margin, height - 50, company.company_name or "")
        pdf.setFont("Helvetica", 9)
        pdf.setFillColor(colors.HexColor("#555555"))
        pdf.drawString(margin, height - 63, company.address or "")
        pdf.drawString(margin, height - 75, f"Tel: {company.phone or ''}")
        pdf.drawString(margin, height - 87, f"Email: {company.email or ''}")
        if company.website:
            pdf.drawString(margin, height - 99, company.website)

    # INVOICE title
    pdf.setFont("Helvetica-Bold", 28)
    pdf.setFillColor(colors.HexColor("#1a1a2e"))
    pdf.drawCentredString(width / 2, height - 60, "INVOICE")

    # Invoice info box (top right)
    box_x = width - 200
    box_y = height - 40
    pdf.setStrokeColor(colors.HexColor("#1a1a2e"))
    pdf.setLineWidth(1)
    pdf.rect(box_x, box_y - 60, 150, 60, fill=0, stroke=1)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.setFillColor(colors.HexColor("#1a1a2e"))
    invoice_no = f"INV-{config_id:04d}-{datetime.now().strftime('%m%d')}"
    pdf.drawString(box_x + 5, box_y - 15, f"Invoice No: {invoice_no}")
    pdf.setFont("Helvetica", 9)
    pdf.drawString(box_x + 5, box_y - 28, f"Invoice Date: {datetime.now().strftime('%B %d, %Y')}")
    pdf.drawString(box_x + 5, box_y - 41, f"SO#: SO-{config_id:06d}")

    # Divider line
    pdf.setStrokeColor(colors.HexColor("#1a1a2e"))
    pdf.setLineWidth(1.5)
    pdf.line(margin, height - 115, width - margin, height - 115)

    # ── PAYMENT TERMS BAR ────────────────────────────────────
    bar_y = height - 155
    bar_w = (width - 2 * margin) / 3
    terms = [
        ("Payment Terms", company.payment_terms if company else "Net 30"),
        ("Invoice Date", datetime.now().strftime("%B %d, %Y")),
        ("Due Date", (datetime.now() + timedelta(days=30)).strftime("%B %d, %Y")),
    ]
    for i, (label, value) in enumerate(terms):
        bx = margin + i * bar_w
        pdf.setStrokeColor(colors.HexColor("#1a1a2e"))
        pdf.setLineWidth(0.5)
        pdf.rect(bx, bar_y - 30, bar_w, 30, fill=0, stroke=1)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.setFillColor(colors.HexColor("#555555"))
        pdf.drawCentredString(bx + bar_w / 2, bar_y - 12, label)
        pdf.setFont("Helvetica", 9)
        pdf.setFillColor(colors.HexColor("#1a1a2e"))
        pdf.drawCentredString(bx + bar_w / 2, bar_y - 24, value)

    # ── BILL TO / DELIVERED TO ───────────────────────────────
    addr_y = bar_y - 50
    half = (width - 2 * margin) / 2
    pdf.setStrokeColor(colors.HexColor("#1a1a2e"))
    pdf.setLineWidth(0.5)
    pdf.rect(margin, addr_y - 70, width - 2 * margin, 70, fill=0, stroke=1)
    pdf.line(margin + half, addr_y, margin + half, addr_y - 70)

    pdf.setFont("Helvetica-Bold", 9)
    pdf.setFillColor(colors.HexColor("#1a1a2e"))
    pdf.drawString(margin + 5, addr_y - 12, "BILL TO:")
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(margin + 5, addr_y - 25, customer.name if customer else "—")
    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(colors.HexColor("#555555"))
    if customer:
        addr_lines = (customer.billing_address or "").split(",")
        for idx, line in enumerate(addr_lines[:3]):
            pdf.drawString(margin + 5, addr_y - 38 - idx * 12, line.strip())

    pdf.setFont("Helvetica-Bold", 9)
    pdf.setFillColor(colors.HexColor("#1a1a2e"))
    pdf.drawString(margin + half + 5, addr_y - 12, "DELIVERED TO:")
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(margin + half + 5, addr_y - 25, shipto.name if shipto else "—")
    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(colors.HexColor("#555555"))
    if shipto:
        addr_lines = (shipto.address or "").split(",")
        for idx, line in enumerate(addr_lines[:3]):
            pdf.drawString(margin + half + 5, addr_y - 38 - idx * 12, line.strip())

    # ── PRODUCTS TABLE ───────────────────────────────────────
    table_y = addr_y - 90
    pdf.setFont("Helvetica-Bold", 9)
    pdf.setFillColor(colors.HexColor("#1a1a2e"))

    col_widths_prod = [220, 100, 80, 80]
    prod_header = [["PRODUCT", "QTY", "UNIT PRICE", "AMOUNT"]]
    subtotal = 0

    prod_rows = []
    if config.products:
        for item in config.products:
            product = db.query(Product).filter(Product.id == item.get("product_id")).first()
            prod_name = product.name if product else f"Product {item.get('product_id')}"
            qty = item.get("quantity", 0)
            unit_price = item.get("unit_price", 0)
            amount = qty * unit_price
            subtotal += amount
            prod_rows.append([prod_name, f"{qty} gallons", f"${unit_price:.2f}", f"${amount:.2f}"])

    table_data = prod_header + prod_rows
    table_y = draw_table(pdf, table_data, col_widths_prod, margin, table_y)
    table_y -= 15

    # ── FEES TABLE ───────────────────────────────────────────
    total_fees = 0
    if config.fees:
        col_widths_fees = [220, 100, 80, 80]
        fees_header = [["FEES", "QTY", "RATE", "AMOUNT"]]
        fee_rows = []
        for item in config.fees:
            fee = db.query(Fee).filter(Fee.id == item.get("fee_id")).first()
            fee_name = fee.name if fee else f"Fee {item.get('fee_id')}"
            qty = item.get("quantity", 1)
            rate = item.get("rate", fee.default_rate if fee else 0)
            amount = qty * rate
            total_fees += amount
            fee_rows.append([fee_name, str(qty), f"${rate:.2f}", f"${amount:.2f}"])
        table_data = fees_header + fee_rows
        table_y = draw_table(pdf, table_data, col_widths_fees, margin, table_y)
        table_y -= 15

    # ── TAXES TABLE ──────────────────────────────────────────
    total_taxes = 0
    if config.taxes:
        col_widths_taxes = [180, 80, 80, 80, 60]
        taxes_header = [["TAXES", "BASIS", "RATE", "AMOUNT", ""]]
        tax_rows = []
        for item in config.taxes:
            tax = db.query(Tax).filter(Tax.id == item.get("tax_id")).first()
            tax_name = tax.name if tax else f"Tax {item.get('tax_id')}"
            basis = item.get("basis", subtotal)
            rate = tax.percentage if tax else 0
            amount = basis * (rate / 100)
            total_taxes += amount
            tax_rows.append([tax_name, f"${basis:.2f}", f"{rate}%", f"${amount:.2f}", ""])
        table_data = taxes_header + tax_rows
        table_y = draw_table(pdf, table_data, col_widths_taxes, margin, table_y)
        table_y -= 15

    # ── TOTALS BOX ───────────────────────────────────────────
    total_due = subtotal + total_fees + total_taxes
    totals_x = width - margin - 180
    totals_y = table_y - 10

    totals = [
        ("SUBTOTAL:", f"${subtotal:.2f}"),
        ("TAXES & FEES:", f"${total_fees + total_taxes:.2f}"),
        ("TOTAL DUE:", f"${total_due:.2f}"),
    ]

    for i, (label, value) in enumerate(totals):
        ty = totals_y - i * 22
        if i == 2:
            pdf.setFillColor(colors.HexColor("#1a1a2e"))
            pdf.rect(totals_x - 5, ty - 16, 185, 20, fill=1, stroke=0)
            pdf.setFillColor(colors.white)
            pdf.setFont("Helvetica-Bold", 10)
        else:
            pdf.setStrokeColor(colors.HexColor("#e0e0e5"))
            pdf.setLineWidth(0.5)
            pdf.line(totals_x - 5, ty - 16, totals_x + 180, ty - 16)
            pdf.setFillColor(colors.HexColor("#1a1a2e"))
            pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(totals_x, ty - 10, label)
        pdf.drawRightString(totals_x + 180, ty - 10, value)

    # ── FOOTER ───────────────────────────────────────────────
    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(colors.HexColor("#888888"))
    if company and company.website:
        pdf.drawCentredString(width / 2, 60, company.website)
    if company:
        pdf.drawCentredString(width / 2, 48, f"{company.company_name}  |  {company.address}  |  {company.phone}")
    pdf.setStrokeColor(colors.HexColor("#e0e0e5"))
    pdf.line(margin, 70, width - margin, 70)
    pdf.setFont("Helvetica-Oblique", 8)
    pdf.drawCentredString(width / 2, 35, "Thank you for your business.")

    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


# ─── PROFESSIONAL DELIVERY TICKET PDF ────────────────────────
@app.get("/generate-delivery-ticket-from-config/{config_id}")
async def generate_delivery_ticket_from_config(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")

    customer = db.query(Customer).filter(Customer.id == config.customer_id).first()
    shipto = db.query(ShipTo).filter(ShipTo.id == config.shipto_id).first()
    company = db.query(CompanySettings).first()

    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"delivery_ticket_{config_id}.pdf"
    file_path = f"generated_documents/{file_name}"

    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    margin = 50

    # ── HEADER ──────────────────────────────────────────────
    if company:
        pdf.setFont("Helvetica-Bold", 11)
        pdf.setFillColor(colors.HexColor("#1a1a2e"))
        pdf.drawRightString(width - margin, height - 45, company.company_name or "")
        pdf.setFont("Helvetica", 9)
        pdf.setFillColor(colors.HexColor("#555555"))
        pdf.drawRightString(width - margin, height - 57, company.address or "")
        pdf.drawRightString(width - margin, height - 69, company.phone or "")
        if company.website:
            pdf.setFont("Helvetica", 8)
            pdf.drawString(margin, height - 100, company.website)

    # DELIVERY TICKET title
    pdf.setFont("Helvetica-Bold", 22)
    pdf.setFillColor(colors.HexColor("#e94560"))
    pdf.drawCentredString(width / 2, height - 120, "DELIVERY TICKET")

    pdf.setStrokeColor(colors.HexColor("#e0e0e5"))
    pdf.setLineWidth(0.5)
    pdf.line(margin, height - 130, width - margin, height - 130)

    # ── BILL TO / DELIVERY ADDRESS ───────────────────────────
    now = datetime.now()
    addr_y = height - 150

    pdf.setFont("Helvetica-Bold", 9)
    pdf.setFillColor(colors.HexColor("#1a1a2e"))
    pdf.drawString(margin, addr_y, "Bill to:")
    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(colors.HexColor("#555555"))
    pdf.drawString(margin, addr_y - 13, customer.name if customer else "—")
    if customer:
        addr_lines = (customer.billing_address or "").split(",")
        for idx, line in enumerate(addr_lines[:3]):
            pdf.drawString(margin, addr_y - 26 - idx * 12, line.strip())

    pdf.setFont("Helvetica-Bold", 9)
    pdf.setFillColor(colors.HexColor("#1a1a2e"))
    pdf.drawString(margin, addr_y - 65, "Delivery address:")
    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(colors.HexColor("#555555"))
    if shipto:
        addr_lines = (shipto.address or "").split(",")
        for idx, line in enumerate(addr_lines[:3]):
            pdf.drawString(margin, addr_y - 78 - idx * 12, line.strip())

    # Right side order details
    right_x = width / 2 + 50
    details = [
        ("Order #:", f"SO-{config_id:06d}"),
        ("Arrived At:", now.strftime("%m/%d/%Y %I:%M %p")),
        ("Completed At:", (now + timedelta(minutes=40)).strftime("%m/%d/%Y %I:%M %p")),
        ("Delivered By:", "Driver"),
        ("Truck #:", "Truck 001"),
    ]
    for idx, (label, value) in enumerate(details):
        dy = addr_y - idx * 18
        pdf.setFont("Helvetica-Bold", 9)
        pdf.setFillColor(colors.HexColor("#1a1a2e"))
        pdf.drawRightString(right_x + 60, dy, label)
        pdf.setFont("Helvetica", 9)
        pdf.setFillColor(colors.HexColor("#555555"))
        pdf.drawString(right_x + 65, dy, value)

    # ── PRODUCTS TABLE ───────────────────────────────────────
    table_y = addr_y - 120
    col_widths = [160, 200, 120]
    table_data = [["ITEM", "DESCRIPTION", "DELIVERED QUANTITY"]]

    if config.products:
        for item in config.products:
            product = db.query(Product).filter(Product.id == item.get("product_id")).first()
            prod_name = product.name if product else "—"
            qty = item.get("quantity", 0)
            table_data.append([prod_name, prod_name, f"{qty:.2f} gallons"])

    table_y = draw_table(pdf, table_data, col_widths, margin, table_y)
    table_y -= 20

    # ── FOOTER ───────────────────────────────────────────────
    pdf.setStrokeColor(colors.HexColor("#e0e0e5"))
    pdf.line(margin, 80, width - margin, 80)
    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(colors.HexColor("#888888"))
    if company:
        pdf.drawCentredString(width / 2, 65, f"{company.company_name}  |  {company.address}  |  {company.phone}")
    pdf.setFont("Helvetica-Oblique", 8)
    pdf.drawCentredString(width / 2, 50, "Thank you for your business.")

    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


# ─── OLD PDF ENDPOINTS (kept for backward compat) ─────────────
@app.get("/generate-invoice/{trip_id}")
async def generate_invoice(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"invoice_trip_{trip.id}.pdf"
    file_path = f"generated_documents/{file_name}"
    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(200, height - 80, "Trip Invoice")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, height - 120, f"Invoice #: {trip.id:04d}")
    pdf.drawString(50, height - 140, f"Driver Name: {trip.driver_name}")
    pdf.drawString(50, height - 160, f"Total Gallons: {trip.total_gallons}")
    pdf.drawString(50, height - 180, f"Total Stops: {trip.total_stops}")
    pdf.drawString(50, height - 200, f"Status: {trip.status}")
    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


@app.get("/generate-delivery-ticket/{trip_id}")
async def generate_delivery_ticket(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"delivery_ticket_trip_{trip.id}.pdf"
    file_path = f"generated_documents/{file_name}"
    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(180, height - 80, "Delivery Ticket")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, height - 120, f"Delivery #: {trip.id:04d}")
    pdf.drawString(50, height - 140, f"Driver: {trip.driver_name}")
    pdf.drawString(50, height - 160, f"Gallons: {trip.total_gallons}")
    pdf.drawString(50, height - 180, f"Stops: {trip.total_stops}")
    pdf.drawString(50, height - 200, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
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
    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"freight_invoice_{config.id}.pdf"
    file_path = f"generated_documents/{file_name}"
    pdf = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(170, height - 80, "Freight Invoice")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, height - 120, f"Vendor: {vendor.name}")
    pdf.drawString(50, height - 140, f"Address: {vendor.address}")
    pdf.drawString(50, height - 160, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
    subtotal = 0
    y = height - 200
    if config.categories:
        for cat in config.categories:
            category = db.query(ProductCategory).filter(ProductCategory.id == cat.get("product_category_id")).first()
            cat_name = category.name if category else "—"
            qty = cat.get("quantity", 0)
            rate = cat.get("freight_rate", 0)
            total = qty * rate
            subtotal += total
            pdf.drawString(50, y, f"{cat_name}: {qty} x ${rate:.4f} = ${total:.2f}")
            y -= 20
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y - 10, f"Total: ${subtotal:.2f}")
    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


# ─── Email Settings ───────────────────────────────────────────
@app.post("/email-settings")
async def create_email_settings(settings: EmailSettingsCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_settings = EmailSettings(provider=settings.provider, email=settings.email, oauth_token=settings.oauth_token, smtp_host=settings.smtp_host, smtp_port=settings.smtp_port, smtp_password=settings.smtp_password, is_active=settings.is_active)
    db.add(new_settings)
    db.commit()
    db.refresh(new_settings)
    return {"id": new_settings.id, "provider": new_settings.provider, "email": new_settings.email, "is_active": new_settings.is_active}


@app.get("/email-settings")
async def get_email_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(EmailSettings).all()
    return [{"id": s.id, "provider": s.provider, "email": s.email, "smtp_host": s.smtp_host, "smtp_port": s.smtp_port, "is_active": s.is_active} for s in settings]


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
    return {"id": existing.id, "provider": existing.provider, "email": existing.email, "is_active": existing.is_active}


@app.delete("/email-settings/{settings_id}")
async def delete_email_settings(settings_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(EmailSettings).filter(EmailSettings.id == settings_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Email settings not found")
    db.delete(existing)
    db.commit()
    return {"message": "Email settings deleted successfully"}


@app.post("/email-send-configurations")
async def create_email_send_configuration(config: EmailSendConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_config = EmailSendConfiguration(document_type=config.document_type, destination_email=config.destination_email, is_active=config.is_active)
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {"id": new_config.id, "document_type": new_config.document_type, "destination_email": new_config.destination_email, "is_active": new_config.is_active}


@app.get("/email-send-configurations")
async def get_email_send_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(EmailSendConfiguration).all()
    return [{"id": c.id, "document_type": c.document_type, "destination_email": c.destination_email, "is_active": c.is_active} for c in configs]


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
    return {"id": existing.id, "document_type": existing.document_type, "destination_email": existing.destination_email, "is_active": existing.is_active}


@app.delete("/email-send-configurations/{config_id}")
async def delete_email_send_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(EmailSendConfiguration).filter(EmailSendConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Email send configuration not found")
    db.delete(existing)
    db.commit()
    return {"message": "Email send configuration deleted successfully"}


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
    send_config = db.query(EmailSendConfiguration).filter(EmailSendConfiguration.document_type == document_type, EmailSendConfiguration.is_active == True).first()
    if not send_config:
        raise HTTPException(status_code=404, detail="No active email send configuration found")
    subject_map = {"invoice": f"Invoice #{os.path.basename(file_path)}", "delivery_ticket": f"Delivery Ticket #{os.path.basename(file_path)}", "freight_invoice": f"Freight Invoice #{os.path.basename(file_path)}"}
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
    return {"message": "Email sent successfully", "to": send_config.destination_email, "subject": subject}