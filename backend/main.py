from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import auth, usuarios, notarias, comentarios, anuncios, upload, metricas
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, status
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LawCore API",
    description="Backend de LawCore: notarías, usuarios, comentarios y más.",
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

# En desarrollo, aceptar localhost
if ENVIRONMENT == "development":
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    max_age=3600,
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(notarias.router, prefix="/notarias", tags=["notarias"])
app.include_router(comentarios.router, prefix="/comentarios", tags=["comentarios"])
app.include_router(anuncios.router, prefix="/anuncios", tags=["anuncios"])
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

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {
        "status": "healthy",
        "service": "lawcore-api",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "environment": ENVIRONMENT
    }

