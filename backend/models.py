from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, JSON, DECIMAL, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(String(128), primary_key=True)
    nombre = Column(String(255), nullable=True)
    correo = Column(String(255), unique=True, index=True, nullable=False)
    foto_url = Column(Text, nullable=True)
    es_admin = Column(Boolean, default=False, nullable=False)
    creado_en = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    
    # Campo extra para auth (no está en el script SQL original pero necesario para login simple)
    # En un escenario real, si el SQL es estricto, esto debería manejarse aparte o alterar la tabla.
    # Asumiré que puedo agregarlo o que la autenticación se maneja externamente. 
    # Para que funcione este ejemplo, lo añadiré al modelo SQLAlchemy pero ten en cuenta que 
    # si la tabla MySQL ya existe sin esta columna, fallará. 
    # OPCIÓN: El script SQL no tiene password. Asumo que el ID viene de un proveedor externo o falta la columna.
    # Agregaré 'hashed_password' mapeado a una columna hipotética o lo omitiré si usamos Auth externo.
    # Dado que el usuario pidió Login, agregaré la columna al modelo.
    hashed_password = Column(String(255), nullable=True) 

    comentarios = relationship("Comentario", back_populates="usuario")

class Notaria(Base):
    __tablename__ = "notarias"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    direccion = Column(String(255), nullable=False)
    distrito = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=False)
    telefono_fijo = Column(String(20), nullable=True)
    correo = Column(String(255), nullable=False)
    sitio_web = Column(String(255), nullable=True)
    facebook_url = Column(String(255), nullable=True)
    instagram_url = Column(String(255), nullable=True)
    tiktok_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    disponible = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(Text, nullable=True)
    calificacion = Column(DECIMAL(3, 2), default=0.00, nullable=False)
    observaciones = Column(Text, nullable=True)
    resumen_coment = Column(Text, nullable=True)
    creado_en = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relaciones
    servicios_generales = relationship("NotariaServicioGeneral", back_populates="notaria", cascade="all, delete-orphan")
    servicios_detallados = relationship("ServicioDetallado", back_populates="notaria", cascade="all, delete-orphan")
    comentarios = relationship("Comentario", back_populates="notaria", cascade="all, delete-orphan")

class NotariaServicioGeneral(Base):
    __tablename__ = "notaria_servicios_generales"

    notaria_id = Column(Integer, ForeignKey("notarias.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    servicio = Column(String(100), primary_key=True)

    notaria = relationship("Notaria", back_populates="servicios_generales")

class ServicioDetallado(Base):
    __tablename__ = "servicios_detallados"

    id = Column(Integer, primary_key=True, autoincrement=True)
    notaria_id = Column(Integer, ForeignKey("notarias.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    slug = Column(String(255), nullable=False)
    nombre = Column(String(255), nullable=False)
    precio = Column(DECIMAL(10, 2), nullable=True)
    requisitos = Column(JSON, nullable=True)
    imagenes = Column(JSON, nullable=True)
    video_url = Column(Text, nullable=True)

    notaria = relationship("Notaria", back_populates="servicios_detallados")

class Comentario(Base):
    __tablename__ = "comentarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    notaria_id = Column(Integer, ForeignKey("notarias.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    usuario_id = Column(String(128), ForeignKey("usuarios.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    puntaje = Column(Integer, nullable=False)
    texto = Column(Text, nullable=False)
    creado_en = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    notaria = relationship("Notaria", back_populates="comentarios")
    usuario = relationship("Usuario", back_populates="comentarios")
