from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..routers.auth import SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.Usuario).filter(models.Usuario.correo == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/", response_model=List[schemas.Comentario])
def read_comentarios(notaria_id: int = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Comentario)
    if notaria_id:
        query = query.filter(models.Comentario.notaria_id == notaria_id)
    
    comentarios = query.all()
    
    # Enriquecer con datos del usuario
    for c in comentarios:
        if c.usuario:
            c.userDisplayName = c.usuario.nombre
            c.userPhotoURL = c.usuario.foto_url
            
    return comentarios

@router.post("/", response_model=schemas.Comentario)
def create_comentario(
    comentario: schemas.ComentarioCreate, 
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # Mapear datos
    db_comentario = models.Comentario(
        usuario_id=current_user.id,
        notaria_id=comentario.notaryId,
        puntaje=comentario.rating,
        texto=comentario.text
    )
    db.add(db_comentario)
    db.commit()
    db.refresh(db_comentario)
    
    # Rellenar datos virtuales para la respuesta
    db_comentario.userDisplayName = current_user.nombre
    db_comentario.userPhotoURL = current_user.foto_url
    
    return db_comentario
