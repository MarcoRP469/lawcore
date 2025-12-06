from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from .. import models, schemas, database
from .auth import get_current_user
import uuid

router = APIRouter()

FIELD_MAPPING = {
    "name": "nombre",
    "address": "direccion",
    "district": "distrito",
    "phone": "telefono",
    "email": "correo",
    "available": "disponible",
    "avatarUrl": "avatar_url",
    "rating": "calificacion",
    "landline": "telefono_fijo",
    "website": "sitio_web",
    "facebookUrl": "facebook_url",
    "instagramUrl": "instagram_url",
    "tiktokUrl": "tiktok_url",
    "linkedinUrl": "linkedin_url",
    "observations": "observaciones",
    "commentSummary": "resumen_coment",
    "createdAt": "creado_en",
    "userId": "usuario_id"
}

def map_schema_to_model(data: dict) -> dict:
    return {FIELD_MAPPING.get(k, k): v for k, v in data.items()}

@router.get("/", response_model=List[schemas.Notaria])
def read_notarias(
    skip: int = 0,
    limit: int = 100,
    owner_id: Optional[str] = Query(None, description="Filtrar por ID del propietario"),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Notaria)

    if owner_id:
        query = query.filter(models.Notaria.usuario_id == owner_id)

    notarias_db = query.offset(skip).limit(limit).all()
    
    resultados = []
    for n in notarias_db:
        # Pydantic ORM mode will read fields from 'n' using validation_alias (e.g. 'nombre')
        # and serialize them using field name (e.g. 'name').
        # However, 'services' is not on 'n', so we inject it.
        servicios_list = [s.servicio for s in n.servicios_generales]
        n.services = servicios_list
        resultados.append(n)
        
    return resultados

@router.get("/{notaria_id}", response_model=schemas.Notaria)
def read_notaria(notaria_id: int, db: Session = Depends(database.get_db)):
    notaria = db.query(models.Notaria).filter(models.Notaria.id == notaria_id).first()
    if not notaria:
        raise HTTPException(status_code=404, detail="Notaria not found")
    
    # Registrar visita
    # Omitimos user-agent/IP por simplicidad, solo contamos que se vio
    nueva_visita = models.NotariaVisita(notaria_id=notaria.id)
    db.add(nueva_visita)
    db.commit() # Commit inmediato para registrar la visita aunque luego falle algo (poco probable)

    notaria.services = [s.servicio for s in notaria.servicios_generales]
    return notaria

@router.post("/", response_model=schemas.Notaria)
def create_notaria(
    notaria: schemas.NotariaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Validaciones de Rol
    if current_user.role == 'public':
        raise HTTPException(status_code=403, detail="No tienes permisos para crear notarias.")

    # Validación Cliente: Solo 1 notaria
    if current_user.role == 'client':
        existing_notaria = db.query(models.Notaria).filter(models.Notaria.usuario_id == current_user.id).first()
        if existing_notaria:
             raise HTTPException(status_code=400, detail="Ya tienes una notaria registrada. Solo puedes gestionar una.")

    # Get English keys
    db_args = notaria.dict(exclude={"services", "detailedServices", "ownerId"})
    # Map to Spanish DB keys
    db_args_mapped = map_schema_to_model(db_args)
    
    # Asignar propietario
    # Si es superadmin y envía ownerId, usar ese. Si no, usar el suyo propio (o dejarlo NULL si prefiere)
    # Por defecto, asignamos al creador.
    if current_user.role == 'superadmin' and notaria.ownerId:
         db_args_mapped['usuario_id'] = notaria.ownerId
    else:
         db_args_mapped['usuario_id'] = current_user.id

    db_notaria = models.Notaria(**db_args_mapped)
    db.add(db_notaria)
    db.commit()
    db.refresh(db_notaria)
    
    if notaria.services:
        for servicio_nombre in notaria.services:
            nuevo_servicio = models.NotariaServicioGeneral(notaria_id=db_notaria.id, servicio=servicio_nombre)
            db.add(nuevo_servicio)

    if notaria.detailedServices:
        for ds in notaria.detailedServices:
            ds_data = ds.dict()
            ds_mapping = {
                "name": "nombre",
                "price": "precio",
                "images": "imagenes",
                "videoUrl": "video_url"
            }
            ds_data_mapped = {ds_mapping.get(k, k): v for k, v in ds_data.items()}

            nuevo_detalle = models.ServicioDetallado(
                notaria_id=db_notaria.id,
                **ds_data_mapped
            )
            db.add(nuevo_detalle)
    
    db.commit()
    db.refresh(db_notaria)
    
    db_notaria.services = [s.servicio for s in db_notaria.servicios_generales]
    return db_notaria

@router.put("/{notaria_id}", response_model=schemas.Notaria)
def update_notaria(
    notaria_id: int,
    notaria: schemas.NotariaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    db_notaria = db.query(models.Notaria).filter(models.Notaria.id == notaria_id).first()
    if not db_notaria:
        raise HTTPException(status_code=404, detail="Notaria not found")

    # Verificar propiedad
    if current_user.role == 'client':
        if db_notaria.usuario_id != current_user.id:
            raise HTTPException(status_code=403, detail="No puedes editar una notaria que no te pertenece.")
    elif current_user.role == 'public':
         raise HTTPException(status_code=403, detail="No tienes permisos.")
    # Superadmin can edit anyone's notary

    notaria_data = notaria.dict(exclude={"services", "detailedServices", "ownerId"})
    notaria_data_mapped = map_schema_to_model(notaria_data)

    # Permitir cambio de dueño solo si es superadmin
    if current_user.role == 'superadmin' and notaria.ownerId:
        notaria_data_mapped['usuario_id'] = notaria.ownerId

    for key, value in notaria_data_mapped.items():
        setattr(db_notaria, key, value)

    # Update Services
    db.query(models.NotariaServicioGeneral).filter(models.NotariaServicioGeneral.notaria_id == notaria_id).delete()
    if notaria.services:
        for servicio_nombre in notaria.services:
            nuevo_servicio = models.NotariaServicioGeneral(notaria_id=db_notaria.id, servicio=servicio_nombre)
            db.add(nuevo_servicio)

    # Update Detailed Services
    db.query(models.ServicioDetallado).filter(models.ServicioDetallado.notaria_id == notaria_id).delete()
    if notaria.detailedServices:
        for ds in notaria.detailedServices:
             ds_data = ds.dict()
             ds_mapping = {
                "name": "nombre",
                "price": "precio",
                "images": "imagenes",
                "videoUrl": "video_url"
            }
             ds_data_mapped = {ds_mapping.get(k, k): v for k, v in ds_data.items()}

             nuevo_detalle = models.ServicioDetallado(
                notaria_id=db_notaria.id,
                **ds_data_mapped
            )
             db.add(nuevo_detalle)

    db.commit()
    db.refresh(db_notaria)

    db_notaria.services = [s.servicio for s in db_notaria.servicios_generales]
    return db_notaria

@router.delete("/{notaria_id}")
def delete_notaria(
    notaria_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    db_notaria = db.query(models.Notaria).filter(models.Notaria.id == notaria_id).first()
    if not db_notaria:
        raise HTTPException(status_code=404, detail="Notaria not found")

    # Regla: Client NO puede eliminar su notaria (solo editar). Solo superadmin elimina.
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Solo el administrador puede eliminar notarias.")

    db.delete(db_notaria)
    db.commit()
    return {"message": "Notaria eliminada exitosamente"}
