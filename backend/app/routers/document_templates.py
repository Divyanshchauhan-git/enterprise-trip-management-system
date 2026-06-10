from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.document_template import DocumentTemplate
from app.models.user import User
from app.routers.auth import get_db, get_current_user

router = APIRouter()

class DocumentTemplateCreate(BaseModel):
    document_type: str
    show_fees: bool
    show_taxes: bool
    show_logo: bool

@router.post("/document-templates")
async def create_document_template(template: DocumentTemplateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_template = DocumentTemplate(document_type=template.document_type, show_fees=template.show_fees, show_taxes=template.show_taxes, show_logo=template.show_logo)
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return {"id": new_template.id, "document_type": new_template.document_type, "show_fees": new_template.show_fees, "show_taxes": new_template.show_taxes, "show_logo": new_template.show_logo}

@router.get("/document-templates")
async def get_document_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    templates = db.query(DocumentTemplate).all()
    return [{"id": t.id, "document_type": t.document_type, "show_fees": t.show_fees, "show_taxes": t.show_taxes, "show_logo": t.show_logo} for t in templates]

@router.delete("/document-templates/{template_id}")
async def delete_document_template(template_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(DocumentTemplate).filter(DocumentTemplate.id == template_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(existing)
    db.commit()
    return {"message": "Template deleted successfully"}