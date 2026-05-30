from sqlalchemy import Column, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class InvoiceConfiguration(Base):
    __tablename__ = "invoice_configurations"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, ForeignKey("customers.id"))
    shipto_id = Column(Integer, ForeignKey("shipto_locations.id"))

    invoice_time = Column(JSON)

    products = Column(JSON)
    fees = Column(JSON)
    taxes = Column(JSON)

    customer = relationship("Customer")
    shipto = relationship("ShipTo")