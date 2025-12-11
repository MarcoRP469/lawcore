from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from typing import List, Dict, Any, Optional
from .. import models, schemas, database
from ..utils.estadisticas import calcular_desviacion_estandar
from .auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

# --- Módulo 2: Análisis Descriptivo (Inteligencia de Mercado) ---

@router.get("/tendencias-busqueda")
def obtener_tendencias_busqueda(
    dias: int = 30,
    db: Session = Depends(database.get_db)
):
    """
    Retorna:
    1. Top 10 términos más buscados.
    2. Tendencia de volumen diario/mensual.
    3. Brechas de datos (términos con 0 resultados).
    """
    fecha_limite = datetime.now() - timedelta(days=dias)
    
    # 1. Moda de Búsqueda (Top 10)
    top_terminos = (
        db.query(
            models.RegistroBusqueda.termino,
            func.count(models.RegistroBusqueda.id).label("frecuencia")
        )
        .filter(models.RegistroBusqueda.fecha >= fecha_limite)
        .group_by(models.RegistroBusqueda.termino)
        .order_by(desc("frecuencia"))
        .limit(10)
        .all()
    )
    
    # 2. Tendencia de Volumen (Agrupado por día para gráficas)
    # Nota: SQLite/MySQL syntax varies. Asumiendo que usamos 'func.date' standard or MySQL.
    # En producción real verificar dialecto. Aquí uso genérico con extract o cast si fuera necesario.
    # Para simplicidad, sacamos los datos y agrupamos en python o usamos func.date() si es MySQL.
    volumen_diario = (
        db.query(
            func.date(models.RegistroBusqueda.fecha).label("dia"),
            func.count(models.RegistroBusqueda.id).label("total")
        )
        .filter(models.RegistroBusqueda.fecha >= fecha_limite)
        .group_by("dia")
        .order_by("dia")
        .all()
    )

    # 3. Brechas de Datos (0 resultados)
    brechas = (
        db.query(
            models.RegistroBusqueda.termino,
            func.count(models.RegistroBusqueda.id).label("intentos_fallidos")
        )
        .filter(models.RegistroBusqueda.fecha >= fecha_limite)
        .filter(models.RegistroBusqueda.cantidad_resultados == 0)
        .group_by(models.RegistroBusqueda.termino)
        .having(func.count(models.RegistroBusqueda.id) > 5) # Umbral: > 5 veces sin resultados
        .order_by(desc("intentos_fallidos"))
        .limit(20)
        .all()
    )

    return {
        "top_terminos": [{"termino": t[0], "frecuencia": t[1]} for t in top_terminos],
        "tendencia": [{"fecha": str(v[0]), "total": v[1]} for v in volumen_diario],
        "brechas_datos": [{"termino": b[0], "intentos": b[1]} for b in brechas]
    }

# --- Módulo 3: Monitoreo de Calidad (Detección de Anomalías) ---

@router.get("/alertas-calidad")
def verificar_calidad_notarias(
    min_calificaciones: int = 5, # Bajamos a 5 para probar más fácil
    umbral_desviacion: float = 1.5,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.Usuario] = Depends(get_current_user)
):
    """
    Detecta notarías con patrones sospechosos (requiere autenticación).
    - Alta calificación promedio (> 4.0) pero alta desviación estándar (> 1.5).
    """
    # Validar que el usuario esté autenticado
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Se requiere autenticación para acceder a las alertas de calidad"
        )
    
    # Solo administradores pueden ver todas las alertas
    if current_user.role not in ['superadmin', 'admin']:
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden acceder a los reportes de calidad"
        )
    
    notarias = db.query(models.Notaria).all()
    alertas = []

    for notaria in notarias:
        # Obtener calificaciones
        calificaciones_objs = db.query(models.Comentario.puntaje).filter(models.Comentario.notaria_id == notaria.id).all()
        calificaciones = [c[0] for c in calificaciones_objs]
        
        if len(calificaciones) < min_calificaciones:
            continue

        media, desviacion, varianza, es_valida = calcular_desviacion_estandar(calificaciones)
        
        # Solo procesar si el cálculo es válido (min_muestra >= 5)
        if not es_valida:
            continue

        # Regla de Alerta
        if media > 4.0 and desviacion > umbral_desviacion:
            alertas.append({
                "notaria_id": notaria.id,
                "nombre": notaria.nombre,
                "media": round(media, 2),
                "desviacion": round(desviacion, 2),
                "cantidad_calificaciones": len(calificaciones),
                "mensaje": "Alta polarización en calificaciones (posible manipulación o inconsistencia)."
            })
            
    return {"alertas": alertas}
