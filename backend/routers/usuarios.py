from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from pydantic import BaseModel

router = APIRouter()

class AdminUpdate(BaseModel):
    id: str

@router.get("/usuarios", response_model=List[schemas.Usuario], tags=["usuarios"])
def read_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    usuarios = db.query(models.Usuario).offset(skip).limit(limit).all()
    return usuarios

@router.get("/admins", response_model=List[schemas.Usuario], tags=["admins"])
def read_admins(db: Session = Depends(database.get_db)):
    admins = db.query(models.Usuario).filter(models.Usuario.es_admin == True).all()
    return admins

@router.post("/admins", tags=["admins"])
def add_admin(admin_data: AdminUpdate, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.id == admin_data.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.es_admin = True
    db.commit()
    return {"message": "Usuario ahora es admin"}

@router.delete("/admins/{user_id}", tags=["admins"])
def remove_admin(user_id: str, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.es_admin = False
    db.commit()
    return {"message": "Usuario ya no es admin"}
