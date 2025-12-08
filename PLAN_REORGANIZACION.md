# 📋 Plan de Reorganización de Estructura - LawCore

**Fecha:** 8 de diciembre de 2025
**Estado:** Análisis completado, listos para implementar cambios

---

## 🔍 Análisis Actual

### Frontend (`src/`)
**Total:** 67 archivos
- ✅ **Bien Organizado:** `components/ui/`, `app/`, `hooks/`, `services/`
- ⚠️ **Mejorables:**
  - `components/` tiene elementos dispares (auth, filtros, tarjetas)
  - `core/` mezcla datos, tipos y mock-data
  - `app/` tiene componentes locales en `_components` dentro de rutas

### Backend (`backend/`)
**Total:** 12 archivos Python + caché
- ✅ **Bien Organizado:** `routers/` agrupa endpoints
- ⚠️ **Mejorables:**
  - `__pycache__/` hay archivos de Python 3.12 y 3.14 (limpiar)
  - Archivos base (`main.py`, `database.py`, etc.) podrían tener una estructura clara

---

## 🎯 Reorganización Propuesta

### FRONTEND

#### 1. **Agrupar componentes por contexto**

```
src/components/
├── ui/                          (Componentes primitivos - SIN CAMBIOS)
│   ├── button.tsx, card.tsx, etc.
│
├── common/                       (⭐ NUEVO - Componentes reutilizables generales)
│   ├── encabezado.tsx          (Header del sitio)
│   ├── pie-de-pagina.tsx       (Footer del sitio)
│   └── auth-dialog.tsx         (Diálogo de autenticación)
│
├── notarias/                     (⭐ NUEVO - Componentes específicos de búsqueda)
│   ├── filtros-notaria.tsx
│   ├── tarjeta-notaria.tsx
│   ├── dialogo-comparacion.tsx
│   └── index.ts               (Exporta todo)
│
└── comentarios/                  (⭐ NUEVO - Componentes de comentarios)
    ├── formulario-comentario.tsx
    ├── lista-comentarios.tsx
    └── index.ts               (Exporta todo)
```

**Ventajas:**
- Fácil encontrar componentes relacionados
- Imports más limpios: `import { FiltrosNotaria } from '@/components/notarias'`
- Escalable si creces

#### 2. **Mejorar `core/` - Separar responsabilidades**

```
src/core/
├── types/                        (⭐ NUEVO)
│   ├── index.ts
│   └── notaria.ts, usuario.ts, etc. (Tipos separados por dominio)
│
├── constants/                    (⭐ NUEVO)
│   ├── servicios.ts            (TODOS_LOS_SERVICIOS, DISTRITOS)
│   └── config.ts               (URLs, timeouts, etc.)
│
└── mock/                         (⭐ NUEVO - RENOMBRADO de mock-data)
    └── notarias.ts
```

**Cambios:**
- `tipos.ts` → `types/index.ts` (o archivo específico)
- `datos.ts` → `constants/servicios.ts`
- `mock-data.ts` → `mock/notarias.ts`

#### 3. **Crear carpeta `styles/` para gestión centralizada**

```
src/styles/
├── theme.ts                     (Tokens: COLORS, SIZES, COMPONENTS)
├── global.css                   (Variables CSS base)
├── components.css               (Clases @apply reutilizables)
└── README.md                    (Documentación)
```

(Ya existe `src/styles/theme.ts`)

---

### BACKEND

#### 1. **Crear estructura clara**

```
backend/
├── main.py                      (Entrada principal - SIN CAMBIOS)
│
├── config/                      (⭐ NUEVO)
│   ├── __init__.py
│   ├── database.py             (Conexión BD, movido de raíz)
│   └── settings.py             (Configuración general)
│
├── core/                        (⭐ NUEVO)
│   ├── __init__.py
│   ├── models.py               (BD models, movido de raíz)
│   └── schemas.py              (Validación, movido de raíz)
│
├── services/                    (⭐ NUEVO)
│   ├── __init__.py
│   ├── ai_service.py           (ai_utils.py renombrado)
│   ├── notarias_service.py
│   ├── usuarios_service.py
│   └── comentarios_service.py
│
├── routers/                     (Endpoints - ESTRUCTURA MANTIENE PERO MEJORADA)
│   ├── __init__.py
│   ├── auth.py
│   ├── notarias.py
│   ├── usuarios.py
│   ├── comentarios.py
│   ├── metricas.py
│   └── upload.py
│
└── uploads/                     (Archivos subidos - SIN CAMBIOS)
```

**Cambios:**
- `database.py` → `config/database.py`
- `models.py` → `core/models.py`
- `schemas.py` → `core/schemas.py`
- `ai_utils.py` → `services/ai_service.py`
- **Eliminar** `__pycache__/` (se regenera automáticamente)

---

## 📊 Matriz de Cambios

| Elemento | Antes | Después | Tipo | Riesgo |
|----------|-------|---------|------|--------|
| `src/components/` | Plano | Agrupado por contexto | Reorganizar | 🟡 Bajo |
| `src/core/` | 3 archivos | Carpetas temáticas | Reorganizar | 🟡 Bajo |
| `backend/database.py` | Raíz | `config/` | Mover | 🟠 Medio (imports) |
| `backend/models.py` | Raíz | `core/` | Mover | 🟠 Medio (imports) |
| `backend/schemas.py` | Raíz | `core/` | Mover | 🟠 Medio (imports) |
| `backend/ai_utils.py` | Raíz | `services/ai_service.py` | Mover+Renombrar | 🟠 Medio (imports) |
| `backend/__pycache__/` | Existente | Eliminar (se regenera) | Limpiar | 🟢 Nulo |

---

## ✅ Plan de Ejecución

### Fase 1: Frontend (Bajo Riesgo)
1. Crear carpetas nuevas: `components/common/`, `components/notarias/`, `components/comentarios/`
2. Mover archivos a nuevas ubicaciones
3. Actualizar imports en archivos que las usen
4. Crear `index.ts` en cada carpeta para exportar
5. Verificar que se carga el sitio

### Fase 2: Core (Bajo Riesgo)
1. Crear `src/core/types/`, `src/core/constants/`, `src/core/mock/`
2. Mover archivos
3. Actualizar imports
4. Verificar que se carga el sitio

### Fase 3: Backend (Medio Riesgo)
1. Crear carpetas: `config/`, `core/`, `services/`
2. Mover archivos (con cuidado en imports)
3. Actualizar imports en `main.py` y routers
4. Probar endpoints
5. Eliminar `__pycache__/`

---

## 🔗 Imports que Cambiarán

### Frontend

**Antes:**
```typescript
import { FiltrosNotaria } from '@/components/filtros-notaria';
import { TarjetaNotaria } from '@/components/tarjeta-notaria';
import { TODOS_LOS_SERVICIOS } from '@/core/datos';
import type { Notaria } from '@/core/tipos';
```

**Después:**
```typescript
import { FiltrosNotaria, TarjetaNotaria } from '@/components/notarias';
import { TODOS_LOS_SERVICIOS } from '@/core/constants/servicios';
import type { Notaria } from '@/core/types';
```

### Backend

**Antes:**
```python
from database import SessionLocal
from models import Usuario
from schemas import UsuarioSchema
from ai_utils import resumir
```

**Después:**
```python
from config.database import SessionLocal
from core.models import Usuario
from core.schemas import UsuarioSchema
from services.ai_service import resumir
```

---

## 🛡️ Verificaciones Post-Cambio

Después de cada fase:
- ✅ Frontend carga sin errores (`npm run dev`)
- ✅ Backend API responde (`python main.py`)
- ✅ No hay imports rotos
- ✅ TypeScript compila sin errores
- ✅ Python ejecuta sin import errors

---

## 💾 Eliminaciones Seguras

Estos archivos/carpetas se pueden eliminar sin riesgo:
- `backend/__pycache__/` → Se regenera automáticamente
- `backend/routers/__pycache__/` → Se regenera automáticamente

---

## 🚀 ¿Listo para Implementar?

**¿Por dónde empezamos?**
- Opción A: Frontend primero (menor riesgo)
- Opción B: Backend primero (quieres que esté limpio)
- Opción C: Ambos simultáneamente (más eficiente)

**¿Prefieres que:**
1. Te muestre exactamente qué imports cambiarán en cada archivo?
2. Ejecute los cambios paso a paso (te muestro cada movimiento)?
3. Haga un test piloto en 1 componente primero?
