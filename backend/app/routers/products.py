from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class ProductCategoryCreate(BaseModel):
    name: str

class ProductCreate(BaseModel):
    name: str
    product_category_id: int

@router.post("/product-categories")
async def create_product_category(category: ProductCategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_category = ProductCategory(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return {"id": new_category.id, "name": new_category.name}

@router.get("/product-categories")
async def get_product_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    categories = db.query(ProductCategory).all()
    return [{"id": c.id, "name": c.name} for c in categories]

@router.delete("/product-categories/{category_id}")
async def delete_product_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(existing)
    db.commit()
    return {"message": "Category deleted successfully"}

@router.post("/products")
async def create_product(product: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_product = Product(name=product.name, product_category_id=product.product_category_id)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"id": new_product.id, "name": new_product.name, "product_category_id": new_product.product_category_id}

@router.get("/products")
async def get_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).all()
    return [{"id": p.id, "name": p.name, "product_category_id": p.product_category_id} for p in products]

@router.delete("/products/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Product).filter(Product.id == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(existing)
    db.commit()
    return {"message": "Product deleted successfully"}
    