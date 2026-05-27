from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from reportlab.pdfgen import canvas

from app.database import SessionLocal
from app.database import engine
from app.database import Base

from app.models.trip import Trip
from app.models.user import User
from app.models.customer import Customer
from app.models.vendor import Vendor
from app.models.product_category import ProductCategory
from app.models.product import Product
from app.models.fee import Fee
from app.models.tax import Tax
from app.models.document_template import DocumentTemplate


app = FastAPI()

Base.metadata.create_all(bind=engine)

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


@app.get("/")
async def root():
    return {"message": "Backend Running Successfully"}


@app.get("/trips")
async def get_trips():
    db = SessionLocal()

    trips = db.query(Trip).all()

    result = []

    for trip in trips:
        result.append({
            "id": trip.id,
            "driver_name": trip.driver_name,
            "total_gallons": trip.total_gallons,
            "total_stops": trip.total_stops,
            "status": trip.status
        })

    db.close()

    return result


@app.get("/trips/{trip_id}")
async def get_single_trip(trip_id: int):
    db = SessionLocal()

    trip = db.query(Trip).filter(
        Trip.id == trip_id
    ).first()

    if not trip:
        db.close()
        return {"message": "Trip not found"}

    result = {
        "id": trip.id,
        "driver_name": trip.driver_name,
        "total_gallons": trip.total_gallons,
        "total_stops": trip.total_stops,
        "status": trip.status
    }

    db.close()

    return result


@app.post("/trips")
async def create_trip(trip: dict):
    db = SessionLocal()

    new_trip = Trip(
        driver_name=trip["driver_name"],
        total_gallons=trip["total_gallons"],
        total_stops=trip.get("total_stops", 0),
        status=trip["status"]
    )

    db.add(new_trip)

    db.commit()

    db.refresh(new_trip)

    result = {
        "message": "Trip created successfully",
        "trip": {
            "id": new_trip.id,
            "driver_name": new_trip.driver_name,
            "total_gallons": new_trip.total_gallons,
            "total_stops": new_trip.total_stops,
            "status": new_trip.status
        }
    }

    db.close()

    return result


@app.delete("/trips/{trip_id}")
async def delete_trip(trip_id: int):
    db = SessionLocal()

    trip = db.query(Trip).filter(
        Trip.id == trip_id
    ).first()

    if not trip:
        db.close()
        return {"message": "Trip not found"}

    db.delete(trip)

    db.commit()

    db.close()

    return {"message": "Trip deleted successfully"}


@app.put("/update-trip/{trip_id}")
async def update_trip(trip_id: int, updated_trip: dict):
    db = SessionLocal()

    trip = db.query(Trip).filter(
        Trip.id == trip_id
    ).first()

    if trip is None:
        db.close()
        return {"message": "Trip not found"}

    trip.driver_name = updated_trip["driver_name"]
    trip.total_gallons = updated_trip["total_gallons"]
    trip.total_stops = updated_trip["total_stops"]
    trip.status = updated_trip["status"]

    db.commit()

    db.refresh(trip)

    result = {
        "message": "Trip updated successfully",
        "trip": {
            "id": trip.id,
            "driver_name": trip.driver_name,
            "total_gallons": trip.total_gallons,
            "total_stops": trip.total_stops,
            "status": trip.status
        }
    }

    db.close()

    return result


@app.post("/signup")
async def signup(user: dict):
    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user["email"]
    ).first()

    if existing_user:
        db.close()
        return {"message": "User already exists"}

    new_user = User(
        username=user["username"],
        email=user["email"],
        password=user["password"]
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    result = {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }

    db.close()

    return result


@app.post("/login")
async def login(user: dict):
    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.email == user["email"]
    ).first()

    if not existing_user:
        db.close()
        return {"message": "User not found"}

    if existing_user.password != user["password"]:
        db.close()
        return {"message": "Incorrect password"}

    result = {
        "message": "Login successful",
        "user": {
            "id": existing_user.id,
            "username": existing_user.username,
            "email": existing_user.email
        }
    }

    db.close()

    return result


@app.post("/customers")
async def create_customer(customer: dict):
    db = SessionLocal()

    new_customer = Customer(
        name=customer["name"],
        billing_address=customer["billing_address"],
        email=customer["email"]
    )

    db.add(new_customer)

    db.commit()

    db.refresh(new_customer)

    result = {
        "id": new_customer.id,
        "name": new_customer.name,
        "billing_address": new_customer.billing_address,
        "email": new_customer.email
    }

    db.close()

    return result


@app.get("/customers")
async def get_customers():
    db = SessionLocal()

    customers = db.query(Customer).all()

    result = []

    for customer in customers:
        result.append({
            "id": customer.id,
            "name": customer.name,
            "billing_address": customer.billing_address,
            "email": customer.email
        })

    db.close()

    return result


@app.post("/vendors")
async def create_vendor(vendor: dict):
    db = SessionLocal()

    new_vendor = Vendor(
        name=vendor["name"],
        address=vendor["address"],
        email=vendor["email"]
    )

    db.add(new_vendor)

    db.commit()

    db.refresh(new_vendor)

    result = {
        "id": new_vendor.id,
        "name": new_vendor.name,
        "address": new_vendor.address,
        "email": new_vendor.email
    }

    db.close()

    return result


@app.get("/vendors")
async def get_vendors():
    db = SessionLocal()

    vendors = db.query(Vendor).all()

    result = []

    for vendor in vendors:
        result.append({
            "id": vendor.id,
            "name": vendor.name,
            "address": vendor.address,
            "email": vendor.email
        })

    db.close()

    return result


@app.post("/product-categories")
async def create_product_category(category: dict):
    db = SessionLocal()

    new_category = ProductCategory(
        name=category["name"]
    )

    db.add(new_category)

    db.commit()

    db.refresh(new_category)

    result = {
        "id": new_category.id,
        "name": new_category.name
    }

    db.close()

    return result


@app.get("/product-categories")
async def get_product_categories():
    db = SessionLocal()

    categories = db.query(ProductCategory).all()

    result = []

    for category in categories:
        result.append({
            "id": category.id,
            "name": category.name
        })

    db.close()

    return result


@app.post("/products")
async def create_product(product: dict):
    db = SessionLocal()

    new_product = Product(
        name=product["name"],
        product_category_id=product["product_category_id"]
    )

    db.add(new_product)

    db.commit()

    db.refresh(new_product)

    result = {
        "id": new_product.id,
        "name": new_product.name,
        "product_category_id": new_product.product_category_id
    }

    db.close()

    return result


@app.get("/products")
async def get_products():
    db = SessionLocal()

    products = db.query(Product).all()

    result = []

    for product in products:
        result.append({
            "id": product.id,
            "name": product.name,
            "product_category_id": product.product_category_id
        })

    db.close()

    return result


@app.post("/fees")
async def create_fee(fee: dict):
    db = SessionLocal()

    new_fee = Fee(
        name=fee["name"],
        default_rate=fee["default_rate"]
    )

    db.add(new_fee)

    db.commit()

    db.refresh(new_fee)

    result = {
        "id": new_fee.id,
        "name": new_fee.name,
        "default_rate": new_fee.default_rate
    }

    db.close()

    return result


@app.get("/fees")
async def get_fees():
    db = SessionLocal()

    fees = db.query(Fee).all()

    result = []

    for fee in fees:
        result.append({
            "id": fee.id,
            "name": fee.name,
            "default_rate": fee.default_rate
        })

    db.close()

    return result


@app.post("/taxes")
async def create_tax(tax: dict):
    db = SessionLocal()

    new_tax = Tax(
        name=tax["name"],
        percentage=tax["percentage"]
    )

    db.add(new_tax)

    db.commit()

    db.refresh(new_tax)

    result = {
        "id": new_tax.id,
        "name": new_tax.name,
        "percentage": new_tax.percentage
    }

    db.close()

    return result


@app.get("/taxes")
async def get_taxes():
    db = SessionLocal()

    taxes = db.query(Tax).all()

    result = []

    for tax in taxes:
        result.append({
            "id": tax.id,
            "name": tax.name,
            "percentage": tax.percentage
        })

    db.close()

    return result


@app.post("/document-templates")
async def create_document_template(template: dict):
    db = SessionLocal()

    new_template = DocumentTemplate(
        document_type=template["document_type"],
        show_fees=template["show_fees"],
        show_taxes=template["show_taxes"],
        show_logo=template["show_logo"]
    )

    db.add(new_template)

    db.commit()

    db.refresh(new_template)

    result = {
        "id": new_template.id,
        "document_type": new_template.document_type,
        "show_fees": new_template.show_fees,
        "show_taxes": new_template.show_taxes,
        "show_logo": new_template.show_logo
    }

    db.close()

    return result


@app.get("/document-templates")
async def get_document_templates():
    db = SessionLocal()

    templates = db.query(DocumentTemplate).all()

    result = []

    for template in templates:
        result.append({
            "id": template.id,
            "document_type": template.document_type,
            "show_fees": template.show_fees,
            "show_taxes": template.show_taxes,
            "show_logo": template.show_logo
        })

    db.close()

    return result


@app.get("/generate-invoice/{trip_id}")
async def generate_invoice(trip_id: int):
    db = SessionLocal()

    trip = db.query(Trip).filter(
        Trip.id == trip_id
    ).first()

    if not trip:
        db.close()
        return {"message": "Trip not found"}

    file_name = f"invoice_{trip.id}.pdf"

    pdf = canvas.Canvas(file_name)

    pdf.setFont("Helvetica-Bold", 22)

    pdf.drawString(
        200,
        800,
        "Trip Invoice"
    )

    pdf.setFont("Helvetica", 14)

    pdf.drawString(
        100,
        730,
        f"Driver Name: {trip.driver_name}"
    )

    pdf.drawString(
        100,
        690,
        f"Total Gallons: {trip.total_gallons}"
    )

    pdf.drawString(
        100,
        650,
        f"Total Stops: {trip.total_stops}"
    )

    pdf.drawString(
        100,
        610,
        f"Status: {trip.status}"
    )

    pdf.save()

    db.close()

    return FileResponse(
        path=file_name,
        filename=file_name,
        media_type="application/pdf"
    )