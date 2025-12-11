# GUÍA PASO A PASO: IMPLEMENTACIÓN DE CORRECCIONES
**Sistema:** LawCore Notarías  
**Fecha:** 10 de Diciembre de 2025  
**Prioridad:** 🔴 CRÍTICA → 🟠 ALTA → 🟡 MEDIA

---

## 📋 FASE 1: PREPARACIÓN (5 minutos)

### 1. Crear rama de desarrollo
```bash
git checkout -b fix/audit-issues-qa-001
git pull origin main
```

### 2. Crear archivos de configuración faltantes
```bash
# .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PRODUCTION_API_URL=https://api.lawcore.com
EOF

# backend/.env
cat > backend/.env << 'EOF'
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=sqlite:///./lawcore.db
SECRET_KEY=your-secret-key-here-change-in-prod
EOF
```

### 3. Instalar dependencias faltantes
```bash
cd backend
pip install python-dotenv
pip install requests  # Para tests
```

---

## 🔴 FASE 2: ERRORES CRÍTICOS (20 minutos)

### ERROR 1: Coordenadas faltantes en Notaria

**Archivo:** `backend/models.py`

Buscar la clase `Notaria` (línea ~44) y agregar después del campo `creado_en`:

```python
    # Geolocalización para cálculo de distancia
    latitud = Column(Float, nullable=True, 
                     comment="Latitud para búsqueda por proximidad")
    longitud = Column(Float, nullable=True,
                     comment="Longitud para búsqueda por proximidad")
    
    # Métricas de conversión
    total_visitas = Column(Integer, default=0, nullable=False)
    total_comentarios = Column(Integer, default=0, nullable=False)
    tasa_conversion = Column(Float, default=0.0, nullable=False)
```

**Luego crear migración:**
```bash
# Si usas Alembic (recomendado)
alembic revision --autogenerate -m "add_coordinates_to_notaria"
alembic upgrade head

# Si no, ejecuta esto en SQLite:
sqlite3 backend/lawcore.db << 'EOF'
ALTER TABLE notarias ADD COLUMN latitud FLOAT;
ALTER TABLE notarias ADD COLUMN longitud FLOAT;
ALTER TABLE notarias ADD COLUMN total_visitas INTEGER DEFAULT 0;
ALTER TABLE notarias ADD COLUMN total_comentarios INTEGER DEFAULT 0;
ALTER TABLE notarias ADD COLUMN tasa_conversion FLOAT DEFAULT 0.0;
EOF
```

**Verificar:**
```bash
sqlite3 backend/lawcore.db ".schema notarias"
```

---

### ERROR 2: Función Haversine no existe

**Archivo:** `backend/utils/estadisticas.py`

Reemplazar el archivo completo con:

```python
import math

def normalizar_valor(valor, min_val, max_val, invertir=False):
    """
    Normaliza un valor entre 0 y 1.
    Si invertir es True, 1 será para el valor más bajo (útil para distancia).
    """
    if max_val == min_val:
        return 0.5  # ✓ Valor neutral cuando todos los valores son iguales
    
    norm = (valor - min_val) / (max_val - min_val)
    if invertir:
        return 1.0 - norm
    return norm

def calcular_distancia_haversine(lat1: float, lon1: float, 
                                  lat2: float, lon2: float) -> float:
    '''
    Calcula distancia en km entre dos coordenadas usando Haversine formula.
    '''
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return 6371 * c  # 6371 km = radio de la Tierra

def calcular_tasa_conversion(comentarios_count: int, visitas_count: int) -> float:
    '''Calcula tasa de conversión'''
    if visitas_count == 0:
        return 0.0
    return min(comentarios_count / visitas_count, 1.0)

def calcular_desviacion_estandar(datos: list, min_muestra: int = 5) -> tuple:
    '''
    Calcula desviación estándar con validación de muestra mínima.
    
    Returns: (media, desviacion, varianza, es_valida)
    '''
    n = len(datos)
    
    if n == 0:
        return 0.0, 0.0, 0.0, False
    
    media = sum(datos) / n
    
    if n < min_muestra:
        return media, None, None, False
    
    varianza = sum((x - media) ** 2 for x in datos) / n
    desviacion = math.sqrt(varianza)
    
    return media, desviacion, varianza, True

def calcular_puntuacion_relevancia(distancia_norm, calificacion_norm, 
                                   servicio_match_norm, conversion_norm, 
                                   pesos=None):
    """Calcula el puntaje R del ranking"""
    if pesos is None:
        pesos = {
            "distancia": 0.4,
            "calificacion": 0.3,
            "servicio": 0.2,
            "conversion": 0.1
        }
    
    score = (
        (pesos["distancia"] * distancia_norm) +
        (pesos["calificacion"] * calificacion_norm) +
        (pesos["servicio"] * servicio_match_norm) +
        (pesos["conversion"] * conversion_norm)
    )
    return score
```

**Verificar:**
```bash
cd backend
python -c "from utils.estadisticas import calcular_distancia_haversine; print(calcular_distancia_haversine(-12.05, -77.04, -12.06, -77.05))"
```

---

### ERROR 3: Variables de entorno

**Archivo:** `src/services/api.ts`

Reemplazar líneas 1-10:

```typescript
import axios from 'axios';

// URL del backend - Configuración dinámica
const getApiUrl = (): string => {
  // 1. Variable de entorno (más alta prioridad)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 2. Lógica según ambiente (fallback)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  
  // 3. Producción (último fallback)
  return process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://api.lawcore.com';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

// ... resto del archivo igual
```

**Verificar en navegador:**
```javascript
// Console:
import api from '@/services/api'
api.defaults.baseURL  // Debería mostrar http://localhost:8000
```

---

## 🟠 FASE 3: ERRORES ALTOS (30 minutos)

### ERROR 4: CORS restrictivo

**Archivo:** `backend/main.py`

Reemplazar líneas 1-25:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Depends, HTTPException, status
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

from .database import engine, Base
from .routers import auth, notarias, comentarios, usuarios, upload, metricas

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LawCore API",
    description="Backend de LawCore",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuración dinámica
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:3000"
).split(",")

# En producción, lista explícita
if ENVIRONMENT == "production":
    CORS_ORIGINS = [
        "https://www.lawcore.com",
        "https://lawcore.com",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,  # ✓ Necesario para JWT
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    max_age=3600,
)

# Incluir routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(notarias.router, prefix="/notarias", tags=["notarias"])
app.include_router(comentarios.router, prefix="/comentarios", tags=["comentarios"])
app.include_router(usuarios.router)
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(metricas.router, prefix="/metricas", tags=["metricas"])

# ... resto igual
```

---

### ERROR 5: Falta endpoint /health

**Archivo:** `backend/main.py`

Después de `@app.get("/")`, agregar:

```python
@app.get("/health", tags=["health"])
def health_check():
    """Verifica que el API está disponible"""
    return {
        "status": "healthy",
        "service": "LawCore API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/health/db", tags=["health"])
def health_check_db(db: Session = Depends(database.get_db)):
    """Verifica conectividad a BD"""
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
            detail=f"Database error: {str(e)}"
        )
```

**Verificar:**
```bash
curl http://localhost:8000/health
```

---

### ERROR 6: Ranking con placeholders

**Archivo:** `backend/routers/notarias.py`

Buscar `# 3. Algoritmo de Relevancia Ponderada` (línea ~85)

Reemplazar sección completa:

```python
    # 3. Algoritmo de Relevancia Ponderada (Módulo 1)
    if search and notarias_db:
        from ..utils.estadisticas import (
            calcular_distancia_haversine,
            calcular_tasa_conversion,
            normalizar_valor,
            calcular_puntuacion_relevancia
        )
        
        max_calif = 5.0
        min_calif = 0.0
        
        notarias_puntuadas = []
        
        for n in notarias_db:
            # Variables del ranking
            v_calif = float(n.calificacion or 0.0)
            v_serv = 0.0
            v_dist = 0.0
            v_conv = calcular_tasa_conversion(n.total_comentarios, n.total_visitas)
            
            # 1. Coincidencia de servicio
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
            puntuacion = calcular_puntuacion_relevancia(
                v_dist, n_calif, v_serv, n_conv
            )
            
            # Guardar en el objeto (temporal)
            n.relevance_score = puntuacion
            notarias_puntuadas.append(n)
        
        # Ordenar descendente por score
        notarias_puntuadas.sort(key=lambda x: x.relevance_score, reverse=True)
        
        # Paginación
        start = skip
        end = skip + limit
        resultados_finales = notarias_puntuadas[start:end]
    else:
        # Sin búsqueda, ordenar por recientes
        resultados_finales = notarias_db[skip : skip + limit]
```

---

### ERROR 7: Serialización incompleta

**Archivo:** `backend/routers/notarias.py`

Reemplazar líneas 158-163:

```python
    # Serializar respuesta
    resultado_response = []
    for n in resultados_finales:
        # Usar schema para conversión de alias
        notaria_schema = schemas.Notaria.from_orm(n)
        notaria_dict = notaria_schema.model_dump(by_alias=True)
        
        # Agregar campos dinámicos
        if hasattr(n, 'relevance_score'):
            notaria_dict['relevanceScore'] = n.relevance_score
        
        # Agregar servicios
        notaria_dict['services'] = [s.servicio for s in n.servicios_generales]
        
        resultado_response.append(notaria_dict)
    
    return resultado_response
```

---

### ERROR 8: Caracteres LIKE no escapados

**Archivo:** `backend/routers/notarias.py`

Antes de la línea `query = db.query(models.Notaria)`, agregar:

```python
def escape_like_wildcard(s: str) -> str:
    """Escapa caracteres especiales de LIKE SQL"""
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
```

Luego, reemplazar sección de búsqueda (línea ~62):

```python
    # 2. Lógica de Búsqueda Avanzada
    if search:
        # Limitar longitud y limpiar
        search = search.strip()[:255]
        
        if search:  # Verificar que no sea vacío después de strip
            # Registrar Búsqueda
            nuevo_registro = models.RegistroBusqueda(
                termino=search,
                usuario_id=current_user.id if current_user else None,
                cantidad_resultados=0
            )
            db.add(nuevo_registro)
            
            # Escapar caracteres LIKE
            search_escaped = escape_like_wildcard(search)
            
            # Unir con servicios
            query = query.outerjoin(models.NotariaServicioGeneral)
            
            # Filtro con escape
            search_filter = or_(
                models.Notaria.nombre.ilike(f"%{search_escaped}%", escape="\\"),
                models.Notaria.distrito.ilike(f"%{search_escaped}%", escape="\\"),
                models.NotariaServicioGeneral.servicio.ilike(f"%{search_escaped}%", escape="\\")
            )
            query = query.filter(search_filter).distinct()
```

---

### ERROR 9: Alertas sin autenticación

**Archivo:** `backend/routers/metricas.py`

En función `verificar_calidad_notarias`, modificar firma:

```python
from .auth import get_current_user
from fastapi import status, Optional
from .. import models

@router.get("/alertas-calidad")
def verificar_calidad_notarias(
    min_calificaciones: int = 5,
    umbral_desviacion: float = 1.5,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.Usuario] = Depends(get_current_user)
):
    """
    Detecta notarías con patrones sospechosos.
    ⚠️ Solo accesible para superadmins
    """
    
    # Validar permisos
    if not current_user or (current_user.role != "superadmin" and not current_user.es_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo superadmins pueden ver alertas de calidad"
        )
    
    # ... resto del código igual
```

---

## 🟡 FASE 4: ERRORES MEDIOS (15 minutos)

### ERROR 10: Endpoint generate-summary

**Archivo:** `backend/routers/notarias.py`

Después de `read_notaria()`, agregar:

```python
@router.post("/{notaria_id}/generate-summary")
def generate_notaria_summary(
    notaria_id: int,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.Usuario] = Depends(get_current_user)
):
    """Genera resumen automático de comentarios"""
    
    # Buscar
    notaria = db.query(models.Notaria).filter(
        models.Notaria.id == notaria_id
    ).first()
    
    if not notaria:
        raise HTTPException(status_code=404, detail="Notaria no encontrada")
    
    # Validar permisos
    if (current_user.id != notaria.usuario_id and 
        not current_user.es_admin):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    
    # Obtener comentarios
    comentarios = db.query(models.Comentario).filter(
        models.Comentario.notaria_id == notaria_id
    ).all()
    
    if not comentarios:
        return {
            "summary": "No hay comentarios para resumir.",
            "notaria_id": notaria_id
        }
    
    # Generar con IA
    resumen = generate_summary(comentarios)
    
    # Guardar
    notaria.resumen_coment = resumen
    db.commit()
    
    return {
        "summary": resumen,
        "notaria_id": notaria_id,
        "count": len(comentarios)
    }
```

---

### ERROR 11: MetricasDashboard incompleto

**Archivo:** `src/core/types/index.ts`

Buscar `export type MetricasDashboard` y reemplazar:

```typescript
export type MetricasDashboard = {
  kpi: Metrica;
  visitas: Visita[];
  topNotarias: { name: string; views: number }[];
  comentariosRecientes: ComentarioReciente[];
  fuentesTrafico: FuenteTrafico[];
  // Datos avanzados (opcionales)
  tendencias?: TendenciaBusqueda;
  alertas?: { alertas: AlertaCalidad[] };
}
```

---

## ✅ FASE 5: VALIDACIÓN (10 minutos)

### Test 1: Health Check
```bash
curl http://localhost:8000/health
# Debería retornar JSON con "status": "healthy"
```

### Test 2: CORS
```bash
curl -X OPTIONS http://localhost:8000/notarias \
  -H "Origin: http://localhost:3000" \
  -v
# Debería incluir: access-control-allow-origin: http://localhost:3000
```

### Test 3: Búsqueda con caracteres especiales
```bash
curl "http://localhost:8000/notarias?search=100%25"
# No debería fallar
```

### Test 4: Ranking con distancia
```bash
curl "http://localhost:8000/notarias?search=notaria&lat=-12.05&lng=-77.04"
# Debería retornar notarías ordenadas por proximidad
```

### Test 5: Alertas (autenticado)
```bash
# Primero obtener token
TOKEN=$(curl -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=password" \
  | jq -r '.access_token')

# Luego probar endpoint
curl http://localhost:8000/metricas/alertas-calidad \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 FASE 6: DEPLOY (5 minutos)

```bash
# 1. Commit cambios
git add -A
git commit -m "fix: address 15 critical QA audit issues

- Fix: CORS configuration for production
- Fix: Add /health endpoint for monitoring
- Fix: Implement Haversine distance calculation
- Fix: Add coordinates to Notaria model
- Fix: Fix ranking algorithm with real data
- Fix: Sanitize LIKE queries
- Fix: Add authentication to sensitive endpoints
- Fix: Implement /generate-summary endpoint
- And 7 more issues...

Fixes #[issue-number]"

# 2. Push
git push origin fix/audit-issues-qa-001

# 3. Crear Pull Request en GitHub
# - Incluir descripción de REPORTE_AUDITORIA_QA.md
# - Pedir review a equipo

# 4. Una vez aprobado, mergear a main
git checkout main
git merge fix/audit-issues-qa-001
git push origin main

# 5. Deploy a producción
# (Según tu workflow CI/CD)
```

---

## 📊 CHECKLIST FINAL

- [ ] Fase 1: Archivos de config creados
- [ ] Fase 2: Todos los errores críticos corregidos
- [ ] Fase 3: Todos los errores altos corregidos
- [ ] Fase 4: Todos los errores medios corregidos
- [ ] Fase 5: Tests pasados (al menos los 5 críticos)
- [ ] Fase 6: Cambios commiteados y pusheados
- [ ] Revisión del PR aprobada
- [ ] Mergeado a main
- [ ] Documentación actualizada

---

**Tiempo Total Estimado:** 60 minutos  
**Complejidad:** Media  
**Riesgo:** Bajo (cambios bien definidos)

¡Éxito en la implementación! 🎉
