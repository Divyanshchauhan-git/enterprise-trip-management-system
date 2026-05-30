from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class EmailSettings(Base):
    __tablename__ = "email_settings"

    id = Column(Integer, primary_key=True, index=True)

    provider = Column(String)
    email = Column(String)
    oauth_token = Column(String, nullable=True)
    smtp_host = Column(String, nullable=True)
    smtp_port = Column(Integer, nullable=True)
    smtp_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)


class EmailSendConfiguration(Base):
    __tablename__ = "email_send_configurations"

    id = Column(Integer, primary_key=True, index=True)

    document_type = Column(String)
    destination_email = Column(String)
    is_active = Column(Boolean, default=True)