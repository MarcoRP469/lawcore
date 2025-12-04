from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
import uuid

router = APIRouter()

@router.get("/", response_model=List[schemas.Notaria])
def read_notarias(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    notarias_db = db.query(models.Notaria).offset(skip).limit(limit).all()
    
    # Mapeo manual si es necesario, o dejar que Pydantic lo haga con 'from_attributes'
    # Pydantic debería mapear 'servicios_generales' (lista de objetos) a 'services' (lista de strings) si lo configuramos.
    # Pero como la estructura es diferente (Obj vs Str), mejor lo hacemos explícito o usamos un validador en Pydantic.
    # Aquí lo haré transformando los objetos antes de retornarlos.
    
    resultados = []
    for n in notarias_db:
        # Extraer solo el nombre del servicio para la lista de strings
        servicios_list = [s.servicio for s in n.servicios_generales]
        
        # Pydantic usará los alias para mapear n.nombre -> name, n.direccion -> address, etc.
        # Pero necesitamos inyectar 'services' manualmente porque no existe en el modelo DB como tal.
        n.services = servicios_list
        resultados.append(n)
        
    return resultados

@router.get("/{notaria_id}", response_model=schemas.Notaria)
def read_notaria(notaria_id: int, db: Session = Depends(database.get_db)):
    notaria = db.query(models.Notaria).filter(models.Notaria.id == notaria_id).first()
    if not notaria:
        raise HTTPException(status_code=404, detail="Notaria not found")
    
    notaria.services = [s.servicio for s in notaria.servicios_generales]
    return notaria

@router.post("/", response_model=schemas.Notaria)
def create_notaria(notaria: schemas.NotariaCreate, db: Session = Depends(database.get_db)):
    # Crear objeto Notaria sin los servicios primero
    # Excluimos services (generales) y detailedServices (detallados) para crear la notaria base
    db_args = notaria.dict(by_alias=True, exclude={"services", "detailedServices"})
    
    db_notaria = models.Notaria(**db_args)
    db.add(db_notaria)
    db.commit()
    db.refresh(db_notaria)
    
    # Agregar servicios generales
    if notaria.services:
        for servicio_nombre in notaria.services:
            nuevo_servicio = models.NotariaServicioGeneral(notaria_id=db_notaria.id, servicio=servicio_nombre)
            db.add(nuevo_servicio)
    
    # Agregar servicios detallados
    if notaria.detailedServices:
        for ds in notaria.detailedServices:
            # ds es un objeto Pydantic (ServicioDetallado), lo convertimos a dict para el modelo DB
            ds_data = ds.dict(by_alias=True)
            # Asegurar que mapee correctamente
            nuevo_detalle = models.ServicioDetallado(
                notaria_id=db_notaria.id,
                **ds_data
            )
            db.add(nuevo_detalle)
    
    db.commit()
    db.refresh(db_notaria) # Recargar para traer las relaciones
    
    # Inyectar servicios generales manualmente para la respuesta (ya que no es un campo de columna)
    db_notaria.services = [s.servicio for s in db_notaria.servicios_generales]
    return db_notaria

@router.put("/{notaria_id}", response_model=schemas.Notaria)
def update_notaria(notaria_id: int, notaria: schemas.NotariaCreate, db: Session = Depends(database.get_db)):
    db_notaria = db.query(models.Notaria).filter(models.Notaria.id == notaria_id).first()
    if not db_notaria:
        raise HTTPException(status_code=404, detail="Notaria not found")

    # Update basic fields
    # Excluimos services y detailedServices para actualizar solo columnas de la tabla notarias
    notaria_data = notaria.dict(by_alias=True, exclude={"services", "detailedServices"})
    for key, value in notaria_data.items():
        setattr(db_notaria, key, value)

    # Update Services (delete all and re-add)
    # 1. Clear existing
    db.query(models.NotariaServicioGeneral).filter(models.NotariaServicioGeneral.notaria_id == notaria_id).delete()

    # 2. Add new
    if notaria.services:
        for servicio_nombre in notaria.services:
            nuevo_servicio = models.NotariaServicioGeneral(notaria_id=db_notaria.id, servicio=servicio_nombre)
            db.add(nuevo_servicio)

    # Update Detailed Services (delete all and re-add)
    # 1. Clear existing
    db.query(models.ServicioDetallado).filter(models.ServicioDetallado.notaria_id == notaria_id).delete()

    # 2. Add new
    if notaria.detailedServices:
        for ds in notaria.detailedServices:
             ds_data = ds.dict(by_alias=True)
             nuevo_detalle = models.ServicioDetallado(
                notaria_id=db_notaria.id,
                **ds_data
            )
             db.add(nuevo_detalle)

    db.commit()
    db.refresh(db_notaria)

    # Inject manually
    db_notaria.services = [s.servicio for s in db_notaria.servicios_generales]
    return db_notaria
