from sqlalchemy import Column, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class FreightConfiguration(Base):
    __tablename__ = "freight_configurations"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(Integer, ForeignKey("vendors.id"))

    categories = Column(JSON)
    fees = Column(JSON)

    vendor = relationship("Vendor")