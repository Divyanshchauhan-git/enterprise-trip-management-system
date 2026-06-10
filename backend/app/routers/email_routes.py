import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.models.email_settings import EmailSettings, EmailSendConfiguration
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

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

@router.post("/email-settings")
async def create_email_settings(settings: EmailSettingsCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_settings = EmailSettings(provider=settings.provider, email=settings.email, oauth_token=settings.oauth_token, smtp_host=settings.smtp_host, smtp_port=settings.smtp_port, smtp_password=settings.smtp_password, is_active=settings.is_active)
    db.add(new_settings)
    db.commit()
    db.refresh(new_settings)
    return {"id": new_settings.id, "provider": new_settings.provider, "email": new_settings.email, "is_active": new_settings.is_active}

@router.get("/email-settings")
async def get_email_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(EmailSettings).all()
    return [{"id": s.id, "provider": s.provider, "email": s.email, "smtp_host": s.smtp_host, "smtp_port": s.smtp_port, "is_active": s.is_active} for s in settings]

@router.put("/email-settings/{settings_id}")
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

@router.delete("/email-settings/{settings_id}")
async def delete_email_settings(settings_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(EmailSettings).filter(EmailSettings.id == settings_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Email settings not found")
    db.delete(existing)
    db.commit()
    return {"message": "Email settings deleted successfully"}

@router.post("/email-send-configurations")
async def create_email_send_configuration(config: EmailSendConfigurationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_config = EmailSendConfiguration(document_type=config.document_type, destination_email=config.destination_email, is_active=config.is_active)
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return {"id": new_config.id, "document_type": new_config.document_type, "destination_email": new_config.destination_email, "is_active": new_config.is_active}

@router.get("/email-send-configurations")
async def get_email_send_configurations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    configs = db.query(EmailSendConfiguration).all()
    return [{"id": c.id, "document_type": c.document_type, "destination_email": c.destination_email, "is_active": c.is_active} for c in configs]

@router.put("/email-send-configurations/{config_id}")
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

@router.delete("/email-send-configurations/{config_id}")
async def delete_email_send_configuration(config_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(EmailSendConfiguration).filter(EmailSendConfiguration.id == config_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Email send configuration not found")
    db.delete(existing)
    db.commit()
    return {"message": "Email send configuration deleted successfully"}

@router.post("/send-email")
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