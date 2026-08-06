import os
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors


def generate_all_invoices(db):
    from app.models.trip import Trip
    from app.models.fee import Fee
    from app.models.tax import Tax
    from app.models.document_template import DocumentTemplate
    from app.models.invoice_configuration import InvoiceConfiguration

    try:
        os.makedirs("generated_documents", exist_ok=True)
        template = db.query(DocumentTemplate).filter(
            DocumentTemplate.document_type == "invoice"
        ).first()
        trips = db.query(Trip).all()

        for trip in trips:
            file_path = f"generated_documents/invoice_{trip.id}.pdf"
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
            pdf.drawString(50, height - 220, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

            y = height - 260

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

            pdf.setFont("Helvetica-Bold", 13)
            pdf.drawString(50, y - 10, f"Grand Total Gallons: {trip.total_gallons}")
            pdf.save()
            print(f"[Scheduler] Generated invoice_{trip.id}.pdf")

    except Exception as e:
        print(f"[Scheduler] Invoice error: {e}")


def generate_all_delivery_tickets(db):
    from app.models.trip import Trip
    from app.models.document_template import DocumentTemplate

    try:
        os.makedirs("generated_documents", exist_ok=True)
        template = db.query(DocumentTemplate).filter(
            DocumentTemplate.document_type == "delivery_ticket"
        ).first()
        trips = db.query(Trip).all()

        for trip in trips:
            file_path = f"generated_documents/delivery_ticket_{trip.id}.pdf"
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
            pdf.drawString(50, height - 140, f"Driver: {trip.driver_name}")
            pdf.drawString(50, height - 160, f"Total Stops: {trip.total_stops}")
            pdf.drawString(50, height - 180, f"Status: {trip.status}")
            pdf.drawString(50, height - 200, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
            pdf.drawString(50, height - 220, f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

            y = height - 260
            pdf.setFont("Helvetica-Bold", 13)
            pdf.drawString(50, y, "Products Delivered:")
            y -= 20
            pdf.setFont("Helvetica", 12)
            pdf.drawString(70, y, f"Total Gallons: {trip.total_gallons}")
            pdf.save()
            print(f"[Scheduler] Generated delivery_ticket_{trip.id}.pdf")

    except Exception as e:
        print(f"[Scheduler] Delivery ticket error: {e}")


def generate_all_freight_invoices(db):
    from app.models.vendor import Vendor
    from app.models.fee import Fee
    from app.models.product_category import ProductCategory
    from app.models.document_template import DocumentTemplate
    from app.models.freight_configuration import FreightConfiguration

    try:
        os.makedirs("generated_documents", exist_ok=True)
        template = db.query(DocumentTemplate).filter(
            DocumentTemplate.document_type == "freight_invoice"
        ).first()
        configs = db.query(FreightConfiguration).all()

        for config in configs:
            vendor = db.query(Vendor).filter(Vendor.id == config.vendor_id).first()
            if not vendor:
                continue

            file_path = f"generated_documents/freight_invoice_{config.id}.pdf"
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
            pdf.drawString(50, height - 160, f"Address: {vendor.address}")
            pdf.drawString(50, height - 180, f"Date: {datetime.now().strftime('%Y-%m-%d')}")

            y = height - 220
            subtotal = 0
            total_fees = 0

            pdf.setFont("Helvetica-Bold", 13)
            pdf.drawString(50, y, "Freight Charges:")
            y -= 20
            pdf.setFont("Helvetica", 12)

            if config.categories:
                for cat in config.categories:
                    category = db.query(ProductCategory).filter(
                        ProductCategory.id == cat.get("product_category_id")
                    ).first()
                    cat_name = category.name if category else f"Category {cat.get('product_category_id')}"
                    quantity = cat.get("quantity", 0)
                    rate = cat.get("freight_rate", 0)
                    total = quantity * rate
                    subtotal += total
                    pdf.drawString(70, y, f"{cat_name} — {quantity} x ${rate:.4f} = ${total:.2f}")
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
                    pdf.drawString(70, y, f"{fee_name} — {quantity} x ${rate:.2f} = ${total:.2f}")
                    y -= 20

            y -= 10
            pdf.setFont("Helvetica-Bold", 13)
            pdf.drawString(50, y, f"Subtotal: ${subtotal:.2f}")
            y -= 20
            pdf.drawString(50, y, f"Total Fees: ${total_fees:.2f}")
            y -= 20
            pdf.drawString(50, y, f"Grand Total: ${subtotal + total_fees:.2f}")
            pdf.save()
            print(f"[Scheduler] Generated freight_invoice_{config.id}.pdf")

    except Exception as e:
        print(f"[Scheduler] Freight invoice error: {e}")


def run_daily_generation():
    from app.database import SessionLocal
    print(f"[Scheduler] Running daily generation at {datetime.now()}")
    db = SessionLocal()
    try:
        generate_all_invoices(db)
        generate_all_delivery_tickets(db)
        generate_all_freight_invoices(db)
        print(f"[Scheduler] Daily generation complete at {datetime.now()}")
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        run_daily_generation,
        CronTrigger(hour=8, minute=0),
        id="daily_generation",
        name="Generate all PDFs daily at 8AM",
        replace_existing=True
    )
    scheduler.start()
    # print("[Scheduler] Started — will generate PDFs daily at 8:00 AM")
    return scheduler