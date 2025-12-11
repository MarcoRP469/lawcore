from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..database import get_db
from .auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(
    tags=["suscripciones"],
    responses={404: {"description": "Not found"}},
)

# ===== PLANES DE SUSCRIPCIÓN =====

@router.get("/planes", response_model=List[schemas.PlanSuscripcion])
def get_planes(
    solo_activos: bool = True,
    db: Session = Depends(get_db)
):
    """Obtener todos los planes de suscripción (públicos)"""
    query = db.query(models.PlanSuscripcion)
    if solo_activos:
        query = query.filter(models.PlanSuscripcion.activo == True)
    return query.all()

@router.post("/planes", response_model=schemas.PlanSuscripcion)
def create_plan(
    plan: schemas.PlanSuscripcionCreate,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear un nuevo plan de suscripción (solo admin)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear planes")
    
    # Verificar que no exista un plan con el mismo nombre
    existing = db.query(models.PlanSuscripcion).filter(
        models.PlanSuscripcion.nombre == plan.nombre
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un plan con ese nombre")
    
    db_plan = models.PlanSuscripcion(**plan.model_dump(by_alias=True))
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.put("/planes/{plan_id}", response_model=schemas.PlanSuscripcion)
def update_plan(
    plan_id: int,
    plan: schemas.PlanSuscripcionCreate,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualizar un plan de suscripción (solo admin)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden editar planes")
    
    db_plan = db.query(models.PlanSuscripcion).filter(models.PlanSuscripcion.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    
    for key, value in plan.model_dump(by_alias=True, exclude_unset=True).items():
        setattr(db_plan, key, value)
    
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.delete("/planes/{plan_id}")
def delete_plan(
    plan_id: int,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar un plan de suscripción (solo admin)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar planes")
    
    db_plan = db.query(models.PlanSuscripcion).filter(models.PlanSuscripcion.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    
    db.delete(db_plan)
    db.commit()
    return {"message": "Plan eliminado exitosamente"}

# ===== GESTIÓN DE SUSCRIPCIONES DE USUARIOS =====

@router.post("/activar/{usuario_id}")
def activar_suscripcion(
    usuario_id: str,
    plan_id: int,
    metodo_pago: str,
    referencia_pago: str = None,
    notas: str = None,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activar suscripción para un usuario (solo admin)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden activar suscripciones")
    
    # Verificar que el usuario existe
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Verificar que el plan existe
    plan = db.query(models.PlanSuscripcion).filter(models.PlanSuscripcion.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    
    # Crear registro de pago
    pago = models.HistorialPago(
        usuario_id=usuario_id,
        plan_id=plan_id,
        plan_nombre=plan.nombre,
        monto=plan.precio,
        metodo_pago=metodo_pago,
        estado='aprobado',
        referencia_pago=referencia_pago,
        notas=notas,
        aprobado_por=current_user.id,
        aprobado_en=datetime.now()
    )
    db.add(pago)
    
    # Actualizar suscripción del usuario
    fecha_inicio = datetime.now()
    fecha_fin = fecha_inicio + timedelta(days=plan.duracion_dias)
    
    usuario.plan_suscripcion = plan.nombre
    usuario.fecha_inicio_suscripcion = fecha_inicio
    usuario.fecha_fin_suscripcion = fecha_fin
    usuario.estado_suscripcion = 'activa'
    
    db.commit()
    
    return {
        "message": "Suscripción activada exitosamente",
        "usuario": usuario.nombre or usuario.correo,
        "plan": plan.nombre,
        "fecha_fin": fecha_fin
    }

@router.post("/desactivar/{usuario_id}")
def desactivar_suscripcion(
    usuario_id: str,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Desactivar suscripción de un usuario (solo admin)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Solo administradores pueden desactivar suscripciones")
    
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    usuario.estado_suscripcion = 'inactiva'
    db.commit()
    
    return {"message": "Suscripción desactivada exitosamente"}

@router.get("/mi-plan")
def get_mi_plan(
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener información del plan actual del usuario autenticado"""
    # Contar anuncios activos del usuario
    total_anuncios = db.query(models.Anuncio).filter(
        models.Anuncio.usuario_id == current_user.id
    ).count()
    
    # Obtener información del plan
    plan_info = None
    if current_user.plan_suscripcion != 'ninguno':
        plan = db.query(models.PlanSuscripcion).filter(
            models.PlanSuscripcion.nombre == current_user.plan_suscripcion
        ).first()
        if plan:
            plan_info = {
                "id": plan.id,
                "nombre": plan.nombre,
                "descripcion": plan.descripcion,
                "limite_anuncios": plan.limite_anuncios,
                "caracteristicas": plan.caracteristicas
            }
    
    return {
        "plan": plan_info,
        "estado": current_user.estado_suscripcion,
        "fecha_inicio": current_user.fecha_inicio_suscripcion,
        "fecha_fin": current_user.fecha_fin_suscripcion,
        "anuncios_usados": total_anuncios,
        "anuncios_disponibles": plan_info["limite_anuncios"] - total_anuncios if plan_info and plan_info["limite_anuncios"] else None
    }

@router.get("/historial-pagos", response_model=List[schemas.HistorialPago])
def get_historial_pagos(
    usuario_id: str = None,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener historial de pagos (admin: todos, usuario: solo los suyos)"""
    if current_user.role == 'superadmin' and usuario_id:
        # Admin puede ver pagos de cualquier usuario
        query = db.query(models.HistorialPago).filter(models.HistorialPago.usuario_id == usuario_id)
    elif current_user.role == 'superadmin':
        # Admin puede ver todos los pagos
        query = db.query(models.HistorialPago)
    else:
        # Usuario solo ve sus propios pagos
        query = db.query(models.HistorialPago).filter(models.HistorialPago.usuario_id == current_user.id)
    
    return query.order_by(models.HistorialPago.creado_en.desc()).all()
