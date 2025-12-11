from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from .. import models, schemas, database
from .auth import get_current_user, get_current_user_optional
import uuid
from ..ai_utils import generate_summary
from ..utils.estadisticas import normalizar_valor, calcular_puntuacion_relevancia, calcular_distancia_haversine, calcular_tasa_conversion
from datetime import datetime

router = APIRouter()

def escape_like_wildcard(s: str) -> str:
    """Escapa caracteres especiales de LIKE SQL para evitar inyección SQL"""
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

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
    "autoAvailability": "auto_disponibilidad",
    "schedule": "horarios_json",
    "commentSummary": "resumen_coment",
    "createdAt": "creado_en",
    "userId": "usuario_id"
}

def map_schema_to_model(data: dict) -> dict:
    return {FIELD_MAPPING.get(k, k): v for k, v in data.items()}

@router.get("/", response_model=List[schemas.Notaria])
def read_notarias(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Término de búsqueda (ej. servicio, nombre, distrito)"),
    lat: Optional[float] = Query(None, description="Latitud del usuario"),
    lng: Optional[float] = Query(None, description="Longitud del usuario"),
    owner_id: Optional[str] = Query(None, description="Filtrar por ID del propietario"),
    db: Session = Depends(database.get_db),
    current_user: Optional[models.Usuario] = Depends(get_current_user_optional) # Puede ser opcional para búsqueda pública
):
    query = db.query(models.Notaria)

    # 1. Filtro básico por Owner ID
    if owner_id:
        query = query.filter(models.Notaria.usuario_id == owner_id)
        return query.offset(skip).limit(limit).all()

    # 2. Lógica de Búsqueda Avanzada
    if search:
        # Validar longitud del término de búsqueda
        if len(search) < 2:
            raise HTTPException(
                status_code=400, 
                detail="El término de búsqueda debe tener al menos 2 caracteres"
            )
        
        # Limitar longitud y limpiar el término de búsqueda
        search = search.strip()[:255]
        
        if search:  # Verificar que no sea vacío después de strip
            # Registrar Búsqueda (Módulo 2)
            nuevo_registro = models.RegistroBusqueda(
                termino=search,
                usuario_id=current_user.id if current_user else None,
                cantidad_resultados=0 # Se actualiza después
            )
            db.add(nuevo_registro)
            
            # Escapar caracteres LIKE para evitar inyección SQL
            search_escaped = escape_like_wildcard(search)
            
            # Unimos con servicios para buscar ahí también
            query = query.outerjoin(models.NotariaServicioGeneral)
            
            # Filtro con escape de caracteres LIKE
            search_filter = or_(
                models.Notaria.nombre.ilike(f"%{search_escaped}%", escape="\\"),
                models.Notaria.distrito.ilike(f"%{search_escaped}%", escape="\\"),
                models.NotariaServicioGeneral.servicio.ilike(f"%{search_escaped}%", escape="\\")
            )
            query = query.filter(search_filter).distinct()

    notarias_db = query.all()
    
    # Actualizar contador de resultados en log
    if search:
        nuevo_registro.cantidad_resultados = len(notarias_db)
        db.commit()

    # 3. Algoritmo de Relevancia Ponderada (Módulo 1)
    if search and notarias_db:
        # Calcular rangos para normalización
        max_calif = 5.0
        min_calif = 0.0
        
        notarias_puntuadas = []
        for n in notarias_db:
            # Variables del ranking
            v_calif = float(n.calificacion or 0.0)
            v_serv = 0.0
            v_dist = 0.0
            v_conv = calcular_tasa_conversion(n.total_comentarios or 0, n.total_visitas or 1)
            
            # 1. Coincidencia de Servicio
            servicios = [s.servicio.lower() for s in n.servicios_generales]
            if any(search.lower() in s for s in servicios):
                v_serv = 1.0
            elif search.lower() in n.nombre.lower(): 
                v_serv = 0.5  # Boost menor si está en nombre
            
            # 2. Distancia (si el usuario proporciona coordenadas)
            if lat and lng and n.latitud and n.longitud:
                v_dist = calcular_distancia_haversine(lat, lng, n.latitud, n.longitud)
                # Normalizar: 0 km = 1.0, 100 km = 0.0
                v_dist = normalizar_valor(v_dist, 0, 100, invertir=True)
            else:
                v_dist = 0.5  # Neutral si no hay coordenadas
            
            # 3. Normalizar calificación
            n_calif = normalizar_valor(v_calif, min_calif, max_calif)
            
            # 4. Conversión ya normalizada (está entre 0 y 1)
            n_conv = v_conv
            
            # 5. Calcular puntuación final
            puntuacion = calcular_puntuacion_relevancia(v_dist, n_calif, v_serv, n_conv)
            
            # Guardar en la BD para análisis posterior
            n.relevancia_score = puntuacion
            notarias_puntuadas.append(n)
        
        # Actualizar scores en la BD (flush, no commit)
        db.flush()
        
        # Ordenar descendente por score
        notarias_puntuadas.sort(key=lambda x: x.relevancia_score, reverse=True)
        
        # Paginación
        start = skip
        end = skip + limit
        resultados_finales = notarias_puntuadas[start:end]
    else:
        # Sin búsqueda, orden default (ej. recientes o ID)
        resultados_finales = notarias_db[skip : skip + limit]

    # Serializar respuesta usando Pydantic schema
    resultado_response = []
    for n in resultados_finales:
        # Usar schema para conversión de alias
        notaria_schema = schemas.Notaria.from_orm(n)
        notaria_dict = notaria_schema.model_dump(by_alias=True)
        
        # Agregar score de relevancia (campo adicional)
        if hasattr(n, 'relevancia_score'):
            notaria_dict['relevanceScore'] = n.relevancia_score
        
        # Agregar servicios
        notaria_dict['services'] = [s.servicio for s in n.servicios_generales]
        
        resultado_response.append(notaria_dict)
    
    return resultado_response

@router.get("/{notaria_id}", response_model=schemas.Notaria)
def read_notaria(notaria_id: int, db: Session = Depends(database.get_db)):
    notaria = db.query(models.Notaria).filter(models.Notaria.id == notaria_id).first()
    if not notaria:
        raise HTTPException(status_code=404, detail="Notaria not found")
    
    # Registrar visita
    nueva_visita = models.NotariaVisita(notaria_id=notaria.id)
    db.add(nueva_visita)
    db.commit()

    notaria.services = [s.servicio for s in notaria.servicios_generales]
    return notaria

@router.post("/", response_model=schemas.Notaria)
def create_notaria(
    notaria: schemas.NotariaCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    if current_user.role == 'public':
        raise HTTPException(status_code=403, detail="No tienes permisos para crear notarias.")

    if current_user.role == 'client':
        existing_notaria = db.query(models.Notaria).filter(models.Notaria.usuario_id == current_user.id).first()
        if existing_notaria:
             raise HTTPException(status_code=400, detail="Ya tienes una notaria registrada. Solo puedes gestionar una.")

    db_args = notaria.dict(exclude={"services", "detailedServices", "ownerId"})
    db_args_mapped = map_schema_to_model(db_args)
    
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
                "category": "categoria",
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

    if current_user.role == 'client':
        if db_notaria.usuario_id != current_user.id:
            raise HTTPException(status_code=403, detail="No puedes editar una notaria que no te pertenece.")
    elif current_user.role == 'public':
         raise HTTPException(status_code=403, detail="No tienes permisos.")

    notaria_data = notaria.dict(exclude={"services", "detailedServices", "ownerId"})
    notaria_data_mapped = map_schema_to_model(notaria_data)

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
                "category": "categoria",
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

    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Solo el administrador puede eliminar notarias.")

    db.delete(db_notaria)
    db.commit()
    return {"message": "Notaria eliminada exitosamente"}

@router.post("/{notaria_id}/generate-summary", response_model=dict)
def generate_notaria_summary(
    notaria_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    db_notaria = db.query(models.Notaria).filter(models.Notaria.id == notaria_id).first()
    if not db_notaria:
        raise HTTPException(status_code=404, detail="Notaria not found")
    
    if current_user.role == 'superadmin' or current_user.es_admin:
        pass 
    elif current_user.role == 'client':
        if db_notaria.usuario_id != current_user.id:
            raise HTTPException(status_code=403, detail="No tienes permisos para esta notaria.")
    elif current_user.role == 'public':
        raise HTTPException(status_code=403, detail="No tienes permisos.")

    comments = db.query(models.Comentario).filter(models.Comentario.notaria_id == notaria_id).all()
    
    summary = generate_summary(comments)
    
    db_notaria.resumen_coment = summary
    db.commit()
    
    return {"summary": summary}
