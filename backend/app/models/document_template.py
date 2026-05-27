from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class DocumentTemplate(Base):
    __tablename__ = "document_templates"

    id = Column(Integer, primary_key=True, index=True)

    document_type = Column(String)

    show_fees = Column(Boolean)
    show_taxes = Column(Boolean)
    show_logo = Column(Boolean)