from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class ShipTo(Base):
    __tablename__ = "shipto_locations"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    name = Column(String)
    address = Column(String)