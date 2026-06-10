import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.customer import Customer
from app.models.vendor import Vendor
from app.models.shipto import ShipTo
from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.fee import Fee
from app.models.tax import Tax
from app.models.document_template import DocumentTemplate
from app.models.invoice_configuration import InvoiceConfiguration
from app.models.freight_configuration import FreightConfiguration
from app.models.company_settings import CompanySettings
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()


def generate_invoice_html(config, customer, shipto, vendor, company, products_data, fees_data, taxes_data):
    invoice_no = f"INV-{config.id:04d}-{datetime.now().strftime('%m%d')}"
    invoice_date = datetime.now().strftime("%B %d, %Y")
    due_date = (datetime.now() + timedelta(days=30)).strftime("%B %d, %Y")
    payment_terms = company.payment_terms if company else "Net 30"

    subtotal = sum(p["quantity"] * p["unit_price"] for p in products_data)
    total_fees = sum(f["quantity"] * f["rate"] for f in fees_data)
    total_taxes = sum(t["amount"] for t in taxes_data)
    total_due = subtotal + total_fees + total_taxes

    products_rows = ""
    for p in products_data:
        amount = p["quantity"] * p["unit_price"]
        products_rows += f"""
        <tr>
            <td>{p["name"]}</td>
            <td>{p["quantity"]} gallons</td>
            <td>${p["unit_price"]:.2f}</td>
            <td>${amount:.2f}</td>
        </tr>"""

    fees_rows = ""
    for f in fees_data:
        amount = f["quantity"] * f["rate"]
        fees_rows += f"""
        <tr>
            <td>{f["name"]}</td>
            <td>{f["quantity"]}</td>
            <td>${f["rate"]:.2f}</td>
            <td>${amount:.2f}</td>
        </tr>"""

    taxes_rows = ""
    for t in taxes_data:
        taxes_rows += f"""
        <tr>
            <td>{t["name"]}</td>
            <td>${t["basis"]:.2f}</td>
            <td>{t["rate"]}%</td>
            <td>${t["amount"]:.2f}</td>
        </tr>"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: Arial, sans-serif; font-size: 12px; color: #1a1a2e; padding: 40px; }}
        .header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }}
        .company-info {{ max-width: 300px; }}
        .company-name {{ font-size: 16px; font-weight: bold; margin-bottom: 5px; }}
        .company-detail {{ font-size: 11px; color: #555; line-height: 1.6; }}
        .invoice-title {{ font-size: 32px; font-weight: bold; text-align: center; margin-bottom: 5px; }}
        .invoice-box {{ border: 1px solid #1a1a2e; padding: 10px 15px; min-width: 200px; }}
        .invoice-box-row {{ font-size: 11px; margin-bottom: 4px; }}
        .invoice-box-row span {{ font-weight: bold; }}
        .divider {{ border: 1px solid #1a1a2e; margin: 15px 0; }}
        .terms-bar {{ display: flex; border: 1px solid #ccc; margin: 15px 0; }}
        .terms-cell {{ flex: 1; padding: 8px 12px; text-align: center; border-right: 1px solid #ccc; }}
        .terms-cell:last-child {{ border-right: none; }}
        .terms-label {{ font-size: 10px; font-weight: bold; color: #555; margin-bottom: 3px; }}
        .terms-value {{ font-size: 11px; }}
        .address-box {{ display: flex; border: 1px solid #ccc; margin: 15px 0; }}
        .address-cell {{ flex: 1; padding: 12px 15px; border-right: 1px solid #ccc; }}
        .address-cell:last-child {{ border-right: none; }}
        .address-label {{ font-size: 10px; font-weight: bold; text-decoration: underline; margin-bottom: 6px; }}
        .address-name {{ font-size: 12px; font-weight: bold; margin-bottom: 4px; }}
        .address-detail {{ font-size: 11px; color: #555; line-height: 1.5; }}
        table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
        thead tr {{ background-color: #1a1a2e; color: white; }}
        thead th {{ padding: 8px 10px; text-align: left; font-size: 11px; }}
        tbody tr:nth-child(even) {{ background-color: #f9f9fb; }}
        tbody td {{ padding: 7px 10px; border-bottom: 1px solid #e0e0e5; font-size: 11px; }}
        .totals-box {{ float: right; width: 250px; margin-top: 10px; border: 1px solid #ccc; }}
        .totals-row {{ display: flex; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid #e0e0e5; font-size: 11px; }}
        .totals-row:last-child {{ background: #1a1a2e; color: white; font-weight: bold; border-bottom: none; }}
        .footer {{ margin-top: 60px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #e0e0e5; padding-top: 15px; }}
        .clearfix::after {{ content: ""; display: table; clear: both; }}
    </style>
    </head>
    <body>

    <div class="header">
        <div class="company-info">
            <div class="company-name">{company.company_name if company else "Your Company"}</div>
            <div class="company-detail">
                {company.address if company else ""}<br>
                Tel: {company.phone if company else ""}<br>
                Email: {company.email if company else ""}
            </div>
        </div>
        <div style="text-align:center; flex:1;">
            <div class="invoice-title">INVOICE</div>
        </div>
        <div class="invoice-box">
            <div class="invoice-box-row"><span>Invoice No:</span> {invoice_no}</div>
            <div class="invoice-box-row"><span>Invoice Date:</span> {invoice_date}</div>
            <div class="invoice-box-row"><span>SO#:</span> SO-{config.id:06d}</div>
        </div>
    </div>

    <hr class="divider">

    <div class="terms-bar">
        <div class="terms-cell">
            <div class="terms-label">Payment Terms</div>
            <div class="terms-value">{payment_terms}</div>
        </div>
        <div class="terms-cell">
            <div class="terms-label">Invoice Date</div>
            <div class="terms-value">{invoice_date}</div>
        </div>
        <div class="terms-cell">
            <div class="terms-label">Due Date</div>
            <div class="terms-value">{due_date}</div>
        </div>
    </div>

    <div class="address-box">
        <div class="address-cell">
            <div class="address-label">BILL TO:</div>
            <div class="address-name">{customer.name if customer else "—"}</div>
            <div class="address-detail">{customer.billing_address if customer else "—"}</div>
        </div>
        <div class="address-cell">
            <div class="address-label">DELIVERED TO:</div>
            <div class="address-name">{shipto.name if shipto else "—"}</div>
            <div class="address-detail">{shipto.address if shipto else "—"}</div>
        </div>
        {"<div class='address-cell'><div class='address-label'>VENDOR:</div><div class='address-name'>" + (vendor.name if vendor else "—") + "</div><div class='address-detail'>" + (vendor.address if vendor else "") + "</div></div>" if vendor else ""}
    </div>

    <table>
        <thead>
            <tr>
                <th>PRODUCT</th>
                <th>QTY</th>
                <th>UNIT PRICE</th>
                <th>AMOUNT</th>
            </tr>
        </thead>
        <tbody>
            {products_rows}
        </tbody>
    </table>

    {"<table><thead><tr><th>FEES</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead><tbody>" + fees_rows + "</tbody></table>" if fees_rows else ""}

    {"<table><thead><tr><th>TAXES</th><th>BASIS</th><th>RATE</th><th>AMOUNT</th></tr></thead><tbody>" + taxes_rows + "</tbody></table>" if taxes_rows else ""}

    <div class="clearfix">
        <div class="totals-box">
            <div class="totals-row"><span>SUBTOTAL:</span><span>${subtotal:.2f}</span></div>
            <div class="totals-row"><span>TAXES & FEES:</span><span>${total_fees + total_taxes:.2f}</span></div>
            <div class="totals-row"><span>TOTAL DUE:</span><span>${total_due:.2f}</span></div>
        </div>
    </div>

    <div class="footer">
        {company.website if company and company.website else ""}
        {"<br>" if company and company.website else ""}
        {company.company_name + " | " + company.address + " | " + company.phone if company else ""}
        <br>Thank you for your business.
    </div>

    </body>
    </html>
    """
    return html


def generate_delivery_ticket_html(config, customer, shipto, company, products_data):
    now = datetime.now()
    completed = now + timedelta(minutes=40)

    products_rows = ""
    for p in products_data:
        products_rows += f"""
        <tr>
            <td>{p["name"]}</td>
            <td>{p["name"]}</td>
            <td>{p["quantity"]:.2f} gallons</td>
        </tr>"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: Arial, sans-serif; font-size: 12px; color: #1a1a2e; padding: 40px; }}
        .header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }}
        .company-name {{ font-size: 14px; font-weight: bold; }}
        .company-detail {{ font-size: 11px; color: #555; line-height: 1.6; text-align: right; }}
        .ticket-title {{ font-size: 26px; font-weight: bold; color: #e94560; text-align: center; margin: 15px 0; }}
        .divider {{ border: 0.5px solid #e0e0e5; margin: 10px 0; }}
        .info-section {{ display: flex; justify-content: space-between; margin: 15px 0; }}
        .left-info {{ max-width: 45%; }}
        .right-info {{ text-align: right; }}
        .info-label {{ font-size: 11px; font-weight: bold; margin-bottom: 4px; }}
        .info-value {{ font-size: 11px; color: #555; line-height: 1.6; }}
        .info-row {{ margin-bottom: 5px; font-size: 11px; }}
        .info-row strong {{ color: #1a1a2e; }}
        table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
        thead tr {{ background-color: #1a1a2e; color: white; }}
        thead th {{ padding: 8px 10px; text-align: left; font-size: 11px; }}
        tbody tr:nth-child(even) {{ background-color: #f9f9fb; }}
        tbody td {{ padding: 7px 10px; border-bottom: 1px solid #e0e0e5; font-size: 11px; }}
        .footer {{ margin-top: 60px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #e0e0e5; padding-top: 15px; }}
    </style>
    </head>
    <body>

    <div class="header">
        <div style="width:120px; height:60px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-size:10px; color:#888;">LOGO</div>
        <div class="company-detail">
            <div class="company-name">{company.company_name if company else "Your Company"}</div>
            {company.address if company else ""}<br>
            {company.phone if company else ""}
        </div>
    </div>

    {"<div style='font-size:11px; color:#888; margin-bottom:10px;'>" + company.website + "</div>" if company and company.website else ""}

    <div class="ticket-title">DELIVERY TICKET</div>
    <hr class="divider">

    <div class="info-section">
        <div class="left-info">
            <div class="info-label">Bill to:</div>
            <div class="info-value">
                {customer.name if customer else "—"}<br>
                {customer.billing_address if customer else "—"}
            </div>
            <br>
            <div class="info-label">Delivery address:</div>
            <div class="info-value">
                {shipto.address if shipto else "—"}
            </div>
        </div>
        <div class="right-info">
            <div class="info-row"><strong>Order #:</strong> SO-{config.id:06d}</div>
            <div class="info-row"><strong>Arrived At:</strong> {now.strftime("%m/%d/%Y %I:%M %p")}</div>
            <div class="info-row"><strong>Completed At:</strong> {completed.strftime("%m/%d/%Y %I:%M %p")}</div>
            <div class="info-row"><strong>Delivered By:</strong> Driver</div>
            <div class="info-row"><strong>Truck #:</strong> Truck 001</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>ITEM</th>
                <th>DESCRIPTION</th>
                <th>DELIVERED QUANTITY</th>
            </tr>
        </thead>
        <tbody>
            {products_rows}
        </tbody>
    </table>

    <div class="footer">
        {company.website if company and company.website else ""}
        {"<br>" if company and company.website else ""}
        {company.company_name + " | " + company.address + " | " + company.phone if company else ""}
        <br>Thank you for your business.
    </div>

    </body>
    </html>
    """
    return html


@router.get("/generate-invoice-from-config/{config_id}")
async def generate_invoice_from_config(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")

    customer = db.query(Customer).filter(Customer.id == config.customer_id).first()
    shipto = db.query(ShipTo).filter(ShipTo.id == config.shipto_id).first()
    vendor = db.query(Vendor).filter(Vendor.id == config.vendor_id).first() if config.vendor_id else None
    company = db.query(CompanySettings).first()

    products_data = []
    if config.products:
        for item in config.products:
            product = db.query(Product).filter(Product.id == item.get("product_id")).first()
            products_data.append({
                "name": product.name if product else f"Product {item.get('product_id')}",
                "quantity": item.get("quantity", 0),
                "unit_price": item.get("unit_price", 0)
            })

    fees_data = []
    if config.fees:
        for item in config.fees:
            fee = db.query(Fee).filter(Fee.id == item.get("fee_id")).first()
            fees_data.append({
                "name": fee.name if fee else f"Fee {item.get('fee_id')}",
                "quantity": item.get("quantity", 1),
                "rate": item.get("rate", fee.default_rate if fee else 0)
            })

    taxes_data = []
    if config.taxes:
        for item in config.taxes:
            tax = db.query(Tax).filter(Tax.id == item.get("tax_id")).first()
            basis = item.get("basis", 0)
            rate = tax.percentage if tax else 0
            amount = basis * (rate / 100)
            taxes_data.append({
                "name": tax.name if tax else f"Tax {item.get('tax_id')}",
                "basis": basis,
                "rate": rate,
                "amount": amount
            })

    html = generate_invoice_html(config, customer, shipto, vendor, company, products_data, fees_data, taxes_data)

    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"invoice_{config_id}.pdf"
    file_path = f"generated_documents/{file_name}"

    try:
        import weasyprint
        weasyprint.HTML(string=html).write_pdf(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


@router.get("/generate-delivery-ticket-from-config/{config_id}")
async def generate_delivery_ticket_from_config(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Invoice configuration not found")

    customer = db.query(Customer).filter(Customer.id == config.customer_id).first()
    shipto = db.query(ShipTo).filter(ShipTo.id == config.shipto_id).first()
    company = db.query(CompanySettings).first()

    products_data = []
    if config.products:
        for item in config.products:
            product = db.query(Product).filter(Product.id == item.get("product_id")).first()
            products_data.append({
                "name": product.name if product else f"Product {item.get('product_id')}",
                "quantity": item.get("quantity", 0)
            })

    html = generate_delivery_ticket_html(config, customer, shipto, company, products_data)

    os.makedirs("generated_documents", exist_ok=True)
    file_name = f"delivery_ticket_{config_id}.pdf"
    file_path = f"generated_documents/{file_name}"

    try:
        import weasyprint
        weasyprint.HTML(string=html).write_pdf(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


@router.get("/generate-invoice/{trip_id}")
async def generate_invoice(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
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
    pdf.drawString(50, height - 140, f"Driver: {trip.driver_name}")
    pdf.drawString(50, height - 160, f"Gallons: {trip.total_gallons}")
    pdf.drawString(50, height - 180, f"Stops: {trip.total_stops}")
    pdf.drawString(50, height - 200, f"Status: {trip.status}")
    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


@router.get("/generate-delivery-ticket/{trip_id}")
async def generate_delivery_ticket(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
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
    pdf.drawString(50, height - 180, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    pdf.save()
    return FileResponse(path=file_path, filename=file_name, media_type="application/pdf")


@router.get("/generate-freight-invoice/{config_id}")
async def generate_freight_invoice(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
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