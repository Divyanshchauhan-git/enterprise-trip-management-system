from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Tax(Base):
    __tablename__ = "taxes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    percentage = Column(Float)