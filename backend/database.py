from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Credenciales MySQL (las mismas que usas en Workbench)
USER = 'root'
PASSWORD = 'Marco#090604'
HOST = 'localhost'
PORT = '3306'
DB_NAME = 'lawcore_db'

# URL de conexión MySQL usando mysql-connector
SQLALCHEMY_DATABASE_URL = (
    f"mysql+mysqlconnector://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}"
    "?charset=utf8mb4"
)

# Crear el engine para MySQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,          # Muestra SQL en consola (opcional, puedes poner False)
    pool_pre_ping=True  # Evita errores si la conexión se queda colgada
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
