from sqlalchemy import Column, Integer, String
from app.database import Base


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    address = Column(String)
    phone = Column(String)
    email = Column(String)
    website = Column(String, nullable=True)
    payment_terms = Column(String, default="Net 30")