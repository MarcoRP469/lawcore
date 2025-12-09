from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Any
from .. import models, schemas, database
from .auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", tags=["metricas"])
def get_dashboard_metrics(
    owner_id: Optional[str] = Query(None, description="Filtrar por propietario"),
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Security Check: Clients can only see their own metrics
    if current_user.role == 'client':
        if not owner_id or owner_id != current_user.id:
             # Force filter to their ID if they try to access others or no filter
             owner_id = current_user.id

    # Base queries
    notarias_query = db.query(models.Notaria)
    if owner_id:
        notarias_query = notarias_query.filter(models.Notaria.usuario_id == owner_id)

    mis_notarias = notarias_query.all()
    mis_notarias_ids = [n.id for n in mis_notarias]

    if not mis_notarias_ids:
        return {
            "kpi": {
                "totalVisitas": 0, "cambioVisitas": 0,
                "nuevosUsuarios": 0, "cambioNuevosUsuarios": 0,
                "comentariosPublicados": 0, "cambioComentarios": 0,
                "activosAhora": 0, "cambioActivosAhora": 0
            },
            "visitas": [],
            "topNotarias": [],
            "comentariosRecientes": [],
            "fuentesTrafico": []
        }

    # 1. KPIs
    # Visitas
    visitas_query = db.query(models.NotariaVisita).filter(models.NotariaVisita.notaria_id.in_(mis_notarias_ids))
    total_visitas = visitas_query.count()

    # Comentarios
    comentarios_query = db.query(models.Comentario).filter(models.Comentario.notaria_id.in_(mis_notarias_ids))
    total_comentarios = comentarios_query.count()

    # "Nuevos Usuarios" - For a client, this is vague. We'll map it to "Unique Users commenting"?
    # Or just global users if superadmin?
    # Let's stick to "Unique Commenters" for Client scope, or Global for Superadmin.
    if owner_id:
        # Unique users who commented on my notaries
        nuevos_usuarios = comentarios_query.distinct(models.Comentario.usuario_id).count()
    else:
        # Global new users (last 30 days logic would be better but simple count for now)
        nuevos_usuarios = db.query(models.Usuario).count()

    # 2. Charts Data
    # Visitas por Mes (Last 6 months)
    # SQLite/MySQL date extraction varies. Assuming standard SQL or Python processing.
    # Group by date is safer done in python for cross-db compatibility in this context unless strict.
    # Let's fetch all visits with timestamp and process in memory (careful with large data, but ok for MVP)
    # Optimally: db.query(func.date(models.NotariaVisita.creado_en), func.count(...))

    # We will aggregate by Month for the Line Chart
    raw_visits = visitas_query.with_entities(models.NotariaVisita.creado_en).all()

    visits_by_month = {}
    for v in raw_visits:
        date = v.creado_en
        if date:
            key = date.strftime("%b") # Jan, Feb...
            visits_by_month[key] = visits_by_month.get(key, 0) + 1

    # Sort by month order (naive approach)
    months_order = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    # English to Spanish mapping if needed, Python %b is locale dependent.
    # Let's just use the keys present.
    datos_visitas = [{"date": k, "visits": v} for k, v in visits_by_month.items()]

    # Top Notarias
    # Count visits per notary
    top_notarias = []
    for n in mis_notarias:
        v_count = db.query(models.NotariaVisita).filter(models.NotariaVisita.notaria_id == n.id).count()
        top_notarias.append({"name": n.nombre, "views": v_count})
    top_notarias.sort(key=lambda x: x["views"], reverse=True)
    top_notarias = top_notarias[:5]

    # Comentarios Recientes
    recientes = comentarios_query.order_by(desc(models.Comentario.creado_en)).limit(5).all()
    comentarios_recientes_data = []
    for c in recientes:
        # Fetch user details
        u = db.query(models.Usuario).filter(models.Usuario.id == c.usuario_id).first()
        n = db.query(models.Notaria).filter(models.Notaria.id == c.notaria_id).first()
        comentarios_recientes_data.append({
            "id": c.id,
            "userName": u.nombre if u else "Anónimo",
            "userEmail": u.correo if u else "",
            "notaryName": n.nombre if n else "Desconocida",
            "rating": c.puntaje,
            "date": c.creado_en.isoformat() if c.creado_en else ""
        })

    return {
        "kpi": {
            "totalVisitas": total_visitas,
            "cambioVisitas": 0, # TODO: Calculate vs last month
            "nuevosUsuarios": nuevos_usuarios,
            "cambioNuevosUsuarios": 0,
            "comentariosPublicados": total_comentarios,
            "cambioComentarios": 0,
            "activosAhora": 0, # Realtime not impl
            "cambioActivosAhora": 0
        },
        "visitas": datos_visitas,
        "topNotarias": top_notarias,
        "comentariosRecientes": comentarios_recientes_data,
        "fuentesTrafico": [ # Placeholder/Static as we don't track source
            { "source": "Directo", "visitors": 100, "fill": "var(--color-visits)" },
        ]
    }
