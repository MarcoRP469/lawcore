from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, ai_utils
from ..database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from .auth import SECRET_KEY, ALGORITHM, get_current_user

router = APIRouter(
    tags=["anuncios"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.Anuncio])
def get_anuncios(
    skip: int = 0, 
    limit: int = 100, 
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Anuncio)
    if type:
        query = query.filter(models.Anuncio.tipo == type)
    
    anuncios = query.order_by(models.Anuncio.creado_en.desc()).offset(skip).limit(limit).all()
    
    # Enriquecer con datos del usuario
    for anuncio in anuncios:
        if anuncio.usuario:
            anuncio.userDisplayName = anuncio.usuario.nombre
            anuncio.userPhotoURL = anuncio.usuario.foto_url
            
    return anuncios

@router.post("/", response_model=schemas.Anuncio)
def create_anuncio(
    anuncio: schemas.AnuncioCreate,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_anuncio = models.Anuncio(
        **anuncio.model_dump(by_alias=True, exclude_unset=True),
        usuario_id=current_user.id
    )
    db.add(db_anuncio)
    db.commit()
    db.refresh(db_anuncio)
    
    # Enriquecer respuesta
    db_anuncio.userDisplayName = current_user.nombre
    db_anuncio.userPhotoURL = current_user.foto_url
    
    return db_anuncio

@router.get("/{anuncio_id}", response_model=schemas.Anuncio)
def get_anuncio(anuncio_id: int, db: Session = Depends(get_db)):
    anuncio = db.query(models.Anuncio).filter(models.Anuncio.id == anuncio_id).first()
    if anuncio is None:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    if anuncio.usuario:
        anuncio.userDisplayName = anuncio.usuario.nombre
        anuncio.userPhotoURL = anuncio.usuario.foto_url
        
    return anuncio

@router.delete("/{anuncio_id}")
def delete_anuncio(
    anuncio_id: int,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    anuncio = db.query(models.Anuncio).filter(models.Anuncio.id == anuncio_id).first()
    if anuncio is None:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    # Verificar permisos: solo el dueño o un admin pueden borrar
    if anuncio.usuario_id != current_user.id and current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este anuncio")
    
    db.delete(anuncio)
    db.commit()
    return {"message": "Anuncio eliminado exitosamente"}
