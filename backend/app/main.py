import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base

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
from app.models.invoice_configuration import InvoiceConfiguration
from app.models.freight_configuration import FreightConfiguration
from app.models.email_settings import EmailSettings, EmailSendConfiguration
from app.models.company_settings import CompanySettings

from app.routers import auth, trips, customers, vendors, products, fees, taxes, shipto, invoice_config, freight_config, document_templates, email_routes, company_settings, pdf

load_dotenv()

app = FastAPI()

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://enterprise-trip-management-system.vercel.app",
]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return {"message": "Backend Running Successfully"}

app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(customers.router)
app.include_router(vendors.router)
app.include_router(products.router)
app.include_router(fees.router)
app.include_router(taxes.router)
app.include_router(shipto.router)
app.include_router(invoice_config.router)
app.include_router(freight_config.router)
app.include_router(document_templates.router)
app.include_router(email_routes.router)
app.include_router(company_settings.router)
app.include_router(pdf.router)