from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Credenciales MySQL (las mismas que usas en Workbench)
USER = 'root'
PASSWORD = 'Marco#090604'
HOST = 'localhost'
PORT = '3306'
DB_NAME = 'lawcore_db'

# URL por defecto (MySQL)
DEFAULT_DATABASE_URL = (
    f"mysql+mysqlconnector://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}"
    "?charset=utf8mb4"
)

# Obtener URL desde variable de entorno o usar la por defecto
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

# Configuración del engine según el tipo de base de datos
connect_args = {}
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    connect_args = {"check_same_thread": False}

# Crear el engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,          # Muestra SQL en consola
    # pool_pre_ping solo soportado en algunos dialectos, lo hacemos condicional o lo quitamos para sqlite
    pool_pre_ping=True if "mysql" in SQLALCHEMY_DATABASE_URL else False,
    connect_args=connect_args
)

# Sesión de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Dependencia para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
