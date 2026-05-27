from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    product_category_id = Column(
        Integer,
        ForeignKey("product_categories.id")
    )