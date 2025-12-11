from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class AdminUpdate(BaseModel):
    id: str

class RoleUpdate(BaseModel):
    role: str

@router.get("/usuarios", response_model=List[schemas.Usuario], tags=["usuarios"])
def read_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    usuarios = db.query(models.Usuario).offset(skip).limit(limit).all()
    return usuarios

@router.put("/usuarios/me", response_model=schemas.Usuario, tags=["usuarios"])
def update_own_profile(
    user_update: schemas.UsuarioUpdate,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Permite al usuario autenticado actualizar su propio perfil (nombre, bio, telefono, foto).
    """
    if user_update.displayName is not None:
        current_user.nombre = user_update.displayName
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.phoneNumber is not None:
        current_user.telefono = user_update.phoneNumber
    if user_update.photoURL is not None:
        current_user.foto_url = user_update.photoURL

    current_user.updated_by = current_user.id
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/usuarios/{user_id}/role", tags=["admins"])
def update_user_role(
    user_id: str,
    role_data: RoleUpdate,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Endpoint para que un superadmin cambie el rol de cualquier usuario.
    """
    if current_user.role != 'superadmin' and not current_user.es_admin:
         raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")

    user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    new_role = role_data.role
    if new_role not in ['superadmin', 'client', 'public']:
        raise HTTPException(status_code=400, detail="Rol inválido")

    user.role = new_role
    # Sync legacy field
    user.es_admin = (new_role == 'superadmin')

    db.commit()
    return {"message": f"Rol actualizado a {new_role}"}

# Endpoints Legacy (Opcional mantenerlos o redirigirlos)
@router.get("/admins", response_model=List[schemas.Usuario], tags=["admins"])
def read_admins(db: Session = Depends(database.get_db)):
    admins = db.query(models.Usuario).filter(models.Usuario.role == 'superadmin').all()
    return admins

# Deprecated/Legacy endpoints for older frontend compatibility if needed
# We encourage using the generic role update endpoint above.
@router.post("/admins", tags=["admins"])
def add_admin(admin_data: AdminUpdate, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.id == admin_data.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.role = 'superadmin'
    user.es_admin = True
    db.commit()
    return {"message": "Usuario ahora es admin"}

@router.delete("/admins/{user_id}", tags=["admins"])
def remove_admin(user_id: str, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.role = 'public' # Default fallback
    user.es_admin = False
    db.commit()
    return {"message": "Usuario ya no es admin"}
