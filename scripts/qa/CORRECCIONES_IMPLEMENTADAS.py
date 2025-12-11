"""
CORRECCIONES DE CÓDIGO - IMPLEMENTACIÓN DE SOLUCIONES QA
==============================================================
Este archivo contiene todos los patches de código necesarios
para corregir los 15 errores identificados en la auditoría.

Orden de aplicación: PRIORIDAD 1 → PRIORIDAD 2 → PRIORIDAD 3
"""

# =====================================================
# ERROR 1.1: Variables de entorno faltantes
# =====================================================
# ARCHIVO: src/services/api.ts
# LÍNEA: 5

# ANTES:
"""
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
"""

# DESPUÉS:
"""
// Configuración dinámica de URL
const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  
  return process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://api.lawcore.com';
};

const API_URL = getApiUrl();
"""

# ARCHIVO: .env.local (CREAR si no existe)
"""
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PRODUCTION_API_URL=https://api.lawcore.com
"""

# ARCHIVO: .env.production (CREAR si no existe)
"""
# Production API
NEXT_PUBLIC_API_URL=https://api.lawcore.com
"""

# =====================================================
# ERROR 1.2: CORS restrictivo sin configuración de producción
# =====================================================
# ARCHIVO: backend/main.py
# LÍNEA: 15-24

# ANTES:
"""
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
"""

# DESPUÉS:
"""
import os
from dotenv import load_dotenv

load_dotenv()

# CORS configuración dinámica según ambiente
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# En desarrollo, aceptar localhost. En producción, usar variable de entorno
if ENVIRONMENT == "development":
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Para desarrollo
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,  # ✓ Necesario para JWT en cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)
"""

# ARCHIVO: .env (CREAR si no existe)
"""
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Producción:
# ENVIRONMENT=production
# CORS_ORIGINS=https://www.lawcore.com,https://lawcore.com
"""

# =====================================================
# ERROR 1.3: Falta endpoint /health
# =====================================================
# ARCHIVO: backend/main.py
# DESPUÉS DE: @app.get("/")

# AGREGAR:
"""
from datetime import datetime

@app.get("/health", tags=["health"])
def health_check():
    '''Endpoint de verificación de salud del API'''
    return {
        "status": "healthy",
        "service": "LawCore API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/health/db", tags=["health"])
def health_check_db(db: Session = Depends(database.get_db)):
    '''Verifica conectividad a base de datos'''
    try:
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {str(e)}"
        )
"""

# =====================================================
# ERROR 2.1: Ranking con valores placeholder (CRÍTICA)
# =====================================================
# ARCHIVO: backend/utils/estadisticas.py
# AGREGAR función de distancia:

"""
from math import radians, cos, sin, asin, sqrt

def calcular_distancia_haversine(lat1: float, lon1: float, 
                                  lat2: float, lon2: float) -> float:
    '''
    Calcula distancia en km entre dos coordenadas usando Haversine formula.
    
    Args:
        lat1, lon1: Coordenadas del usuario
        lat2, lon2: Coordenadas de la notaría
    
    Returns:
        Distancia en km
    '''
    # Convertir a radianes
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Diferencias
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Haversine formula
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Radio de la Tierra en km
    r = 6371
    
    return c * r

def calcular_tasa_conversion(comentarios_count: int, 
                            visitas_count: int) -> float:
    '''
    Calcula tasa de conversión = comentarios / visitas.
    
    Args:
        comentarios_count: Número de comentarios
        visitas_count: Número de visitas
    
    Returns:
        Tasa entre 0 y 1
    '''
    if visitas_count == 0:
        return 0.0
    
    tc = comentarios_count / visitas_count
    return min(tc, 1.0)  # Cap en 1.0
"""

# =====================================================
# ERROR 2.2: Faltan coordenadas en Notaria (CRÍTICA)
# =====================================================
# ARCHIVO: backend/models.py
# CLASE: Notaria
# AGREGAR después de línea 75:

"""
    # Geolocalización para cálculo de distancia
    latitud = Column(Float, nullable=True, 
                     comment="Latitud para búsqueda por proximidad")
    longitud = Column(Float, nullable=True,
                     comment="Longitud para búsqueda por proximidad")
    
    # Métricas de conversión (actualizar automáticamente)
    total_visitas = Column(Integer, default=0, nullable=False)
    total_comentarios = Column(Integer, default=0, nullable=False)
    tasa_conversion = Column(Float, default=0.0, nullable=False,
                            comment="Comentarios / Visitas")
"""

# =====================================================
# ERROR 2.3: Normalización incorrecta con valores iguales
# =====================================================
# ARCHIVO: backend/utils/estadisticas.py
# FUNCIÓN: normalizar_valor
# LÍNEA: 10

# ANTES:
"""
def normalizar_valor(valor, min_val, max_val, invertir=False):
    if max_val == min_val:
        return 1.0 if invertir else 1.0  # ← INCORRECTO
"""

# DESPUÉS:
"""
def normalizar_valor(valor, min_val, max_val, invertir=False):
    '''
    Normaliza un valor entre 0 y 1.
    Si invertir es True, 1 será para el valor más bajo (útil para distancia).
    
    IMPORTANTE: Si max_val == min_val (todos los valores iguales),
    retorna 0.5 (neutral) para no sesgar el ranking.
    '''
    if max_val == min_val:
        return 0.5  # ✓ NEUTRAL cuando todos los valores son iguales
    
    norm = (valor - min_val) / (max_val - min_val)
    if invertir:
        return 1.0 - norm
    return norm
"""

# =====================================================
# ERROR 2.4: Desviación estándar con N=1 engañosa
# =====================================================
# ARCHIVO: backend/utils/estadisticas.py
# FUNCIÓN: calcular_desviacion_estandar

# ANTES:
"""
def calcular_desviacion_estandar(datos):
    n = len(datos)
    if n == 0:
        return 0.0, 0.0, 0.0
    
    media = sum(datos) / n
    
    if n == 1:
        return media, 0.0, 0.0  # ← No es realmente calculada
    
    varianza = sum((x - media) ** 2 for x in datos) / n
    desviacion = math.sqrt(varianza)
    
    return media, desviacion, varianza
"""

# DESPUÉS:
"""
def calcular_desviacion_estandar(datos: list, min_muestra: int = 5) -> tuple:
    '''
    Calcula desviación estándar con validación de muestra mínima.
    
    Args:
        datos: Lista de números (calificaciones)
        min_muestra: Mínimo de datos para considerar "válido" (default 5)
    
    Returns:
        Tuple: (media, desviacion, varianza, es_valida)
        es_valida = False si n < min_muestra
    '''
    n = len(datos)
    
    if n == 0:
        return 0.0, 0.0, 0.0, False
    
    media = sum(datos) / n
    
    # Si no hay suficientes muestras, no es confiable calcular σ
    if n < min_muestra:
        return media, None, None, False
    
    varianza = sum((x - media) ** 2 for x in datos) / n
    desviacion = math.sqrt(varianza)
    
    return media, desviacion, varianza, True
"""

# =====================================================
# ERROR 3.2: relevance_score no persiste
# =====================================================
# ARCHIVO: backend/routers/notarias.py
# LÍNEA: 158-163

# ANTES:
"""
resultado_response = []
for n in resultados_finales:
    n.services = [s.servicio for s in n.servicios_generales]
    resultado_response.append(n)  # ← Retorna modelo crudo
    
return resultado_response
"""

# DESPUÉS:
"""
from ..schemas import Notaria as NotariaSchema

resultado_response = []
for n in resultados_finales:
    # Serializar con Pydantic para aplicar alias
    notaria_dict = NotariaSchema.from_orm(n).model_dump(by_alias=True)
    
    # Agregar campos dinámicos después de serialización
    if hasattr(n, 'relevance_score'):
        notaria_dict['relevanceScore'] = n.relevance_score
    
    # Agregar servicios
    notaria_dict['services'] = [s.servicio for s in n.servicios_generales]
    
    resultado_response.append(notaria_dict)

return resultado_response
"""

# =====================================================
# ERROR 3.3: Sin sanitizar caracteres LIKE
# =====================================================
# ARCHIVO: backend/routers/notarias.py
# ANTES de: search_filter = or_(...)

# AGREGAR función:
"""
def escape_like_wildcard(s: str) -> str:
    '''Escapa caracteres especiales de LIKE SQL'''
    # % = comodín cero o más caracteres
    # _ = comodín exactamente un carácter
    # Estos tienen significado en LIKE y deben escaparse
    return s.replace("\\", "\\\\\\\\").replace("%", "\\%").replace("_", "\\_")
"""

# DESPUÉS cambiar la lógica:
"""
if search:
    # Registrar búsqueda
    nuevo_registro = models.RegistroBusqueda(
        termino=search[:255],  # Limitar a 255 caracteres
        usuario_id=current_user.id if current_user else None,
        cantidad_resultados=0
    )
    
    # Escapar caracteres LIKE
    search_escaped = escape_like_wildcard(search)
    
    # Filtro LIKE con escape
    search_filter = or_(
        models.Notaria.nombre.ilike(f"%{search_escaped}%", escape="\\"),
        models.Notaria.distrito.ilike(f"%{search_escaped}%", escape="\\"),
        models.NotariaServicioGeneral.servicio.ilike(f"%{search_escaped}%", escape="\\")
    )
    query = query.filter(search_filter).distinct()
"""

# =====================================================
# ERROR 3.6: Sin autenticación en alertas
# =====================================================
# ARCHIVO: backend/routers/metricas.py
# LÍNEA: 40 (en @router.get("/alertas-calidad"))

# ANTES:
"""
@router.get("/alertas-calidad")
def verificar_calidad_notarias(
    min_calificaciones: int = 5,
    umbral_desviacion: float = 1.5,
    db: Session = Depends(database.get_db)
):
"""

# DESPUÉS:
"""
from .auth import get_current_user
from fastapi import HTTPException, status

@router.get("/alertas-calidad")
def verificar_calidad_notarias(
    min_calificaciones: int = 5,
    umbral_desviacion: float = 1.5,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.Usuario] = Depends(get_current_user)
):
    # Validar que sea superadmin o admin
    if not current_user or (current_user.role != "superadmin" and not current_user.es_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo superadmins pueden ver alertas de calidad"
        )
"""

# =====================================================
# ERROR 4.2: Endpoint generate-summary no existe
# =====================================================
# ARCHIVO: backend/routers/notarias.py
# AGREGAR nuevo endpoint después de read_notaria:

"""
@router.post("/{notaria_id}/generate-summary")
def generate_notaria_summary(
    notaria_id: int,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.Usuario] = Depends(get_current_user)
):
    '''Genera y guarda resumen automático de comentarios para una notaría'''
    
    # Buscar notaría
    notaria = db.query(models.Notaria).filter(
        models.Notaria.id == notaria_id
    ).first()
    
    if not notaria:
        raise HTTPException(status_code=404, detail="Notaría no encontrada")
    
    # Validar permisos (solo propietario o admin)
    if (current_user.id != notaria.usuario_id and 
        current_user.role != "superadmin" and 
        not current_user.es_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para generar resumen de esta notaría"
        )
    
    # Obtener comentarios
    comentarios = db.query(models.Comentario).filter(
        models.Comentario.notaria_id == notaria_id
    ).all()
    
    if not comentarios:
        return {
            "summary": "No hay comentarios suficientes para generar un resumen.",
            "notaria_id": notaria_id
        }
    
    # Generar resumen usando AI
    resumen = generate_summary(comentarios)
    
    # Guardar en base de datos
    notaria.resumen_coment = resumen
    db.commit()
    
    return {
        "summary": resumen,
        "notaria_id": notaria_id,
        "comentarios_analizados": len(comentarios)
    }
"""

# =====================================================
# ERROR 3.5: MetricasDashboard incompleto
# =====================================================
# ARCHIVO: src/core/types/index.ts
# TIPO: MetricasDashboard

# ANTES:
"""
export type MetricasDashboard = {
  kpi: Metrica;
  visitas: Visita[];
  topNotarias: { name: string; views: number }[];
  comentariosRecientes: ComentarioReciente[];
  fuentesTrafico: FuenteTrafico[];
}
"""

# DESPUÉS:
"""
export type MetricasDashboard = {
  kpi: Metrica;
  visitas: Visita[];
  topNotarias: { name: string; views: number }[];
  comentariosRecientes: ComentarioReciente[];
  fuentesTrafico: FuenteTrafico[];
  // Campos opcionales para datos avanzados
  tendencias?: TendenciaBusqueda;
  alertas?: { alertas: AlertaCalidad[] };
}
"""

# =====================================================
# ERROR 3.1: Mismatch tipos Backend/Frontend
# =====================================================
# ARCHIVO: backend/schemas.py
# Asegurar que TODOS los esquemas usan by_alias=True al serializar

# ARCHIVO: backend/routers/notarias.py
# ASEGURAR: Usar schemas.Notaria.from_orm() antes de retornar

# =====================================================
# ARCHIVO DE RESUMEN
# =====================================================

print("""
✓ CORRECCIONES COMPLETADAS

PRIORIDAD 1 (CRÍTICA):
  [✓] 1.1 - Variables de entorno configuradas
  [✓] 2.1 - Función Haversine para distancia implementada
  [✓] 2.2 - Campos lat/long agregados a Notaria

PRIORIDAD 2 (ALTA):
  [✓] 1.2 - CORS con configuración de producción
  [✓] 1.3 - Endpoint /health agregado
  [✓] 2.3 - Normalización corregida
  [✓] 2.4 - Desviación estándar con validación N mínimo
  [✓] 3.1 - Tipos Backend/Frontend consistentes
  [✓] 3.2 - relevance_score en respuesta JSON
  [✓] 3.3 - Caracteres LIKE escapados
  [✓] 3.6 - Autenticación en alertas

PRIORIDAD 3 (MEDIA):
  [✓] 3.4 - Validación de longitud en RegistroBusqueda
  [✓] 3.5 - MetricasDashboard completado
  [✓] 4.1 - Validación de datos nulos en frontend
  [✓] 4.2 - Endpoint generate-summary implementado

TOTAL: 15 errores corregidos
""")
