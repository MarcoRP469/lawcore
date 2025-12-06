from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import auth, notarias, comentarios, usuarios, upload, metricas
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, status
# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LawCore API",
    description="Backend de LawCore: notarías, usuarios, comentarios y más.",
    version="1.0.0",
    docs_url="/docs",       # puedes cambiar la ruta, ej: "/api-docs"
    redoc_url="/redoc",     # doc alternativa (más limpia)
)

# Configurar CORS para permitir peticiones desde Next.js (puerto 3000)
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

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(notarias.router, prefix="/notarias", tags=["notarias"])
app.include_router(comentarios.router, prefix="/comentarios", tags=["comentarios"])
app.include_router(usuarios.router)
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(metricas.router, prefix="/metricas", tags=["metricas"])

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "API Notarias funcionando"}
