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

    # Nuevos campos
    role = Column(String(20), default="public", nullable=False) # superadmin, client, public
    bio = Column(Text, nullable=True)
    telefono = Column(String(20), nullable=True)
    updated_by = Column(String(128), nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True, onupdate=func.now())

    # Mantener es_admin por compatibilidad legacy inmediata, pero el source of truth será role
    es_admin = Column(Boolean, default=False, nullable=False)
    
    creado_en = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    hashed_password = Column(String(255), nullable=True) 

    comentarios = relationship("Comentario", back_populates="usuario")
    notarias = relationship("Notaria", back_populates="usuario")
    anuncios = relationship("Anuncio", back_populates="usuario")

class RegistroBusqueda(Base):
    __tablename__ = "registros_busqueda"

    id = Column(Integer, primary_key=True, autoincrement=True)
    termino = Column(String(255), nullable=False, index=True)
    usuario_id = Column(String(128), nullable=True) # Opcional, si está logueado
    fecha = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    cantidad_resultados = Column(Integer, default=0)

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

    # Geolocalización para cálculo de distancia
    latitud = Column(Float, nullable=True, comment="Latitud para búsqueda por proximidad")
    longitud = Column(Float, nullable=True, comment="Longitud para búsqueda por proximidad")
    
    # Métricas de conversión (actualizar automáticamente)
    total_visitas = Column(Integer, default=0, nullable=False)
    total_comentarios = Column(Integer, default=0, nullable=False)
    tasa_conversion = Column(Float, default=0.0, nullable=False, comment="Comentarios / Visitas")
    relevancia_score = Column(Float, default=0.0, nullable=False, comment="Score de relevancia del algoritmo de ranking")

    # Nuevo campo de propietario
    usuario_id = Column(String(128), ForeignKey("usuarios.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)

    # Relaciones
    usuario = relationship("Usuario", back_populates="notarias")
    servicios_generales = relationship("NotariaServicioGeneral", back_populates="notaria", cascade="all, delete-orphan")
    servicios_detallados = relationship("ServicioDetallado", back_populates="notaria", cascade="all, delete-orphan")
    comentarios = relationship("Comentario", back_populates="notaria", cascade="all, delete-orphan")
    visitas = relationship("NotariaVisita", back_populates="notaria", cascade="all, delete-orphan")

class NotariaVisita(Base):
    __tablename__ = "notaria_visitas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    notaria_id = Column(Integer, ForeignKey("notarias.id", ondelete="CASCADE"), nullable=False)
    creado_en = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    notaria = relationship("Notaria", back_populates="visitas")

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

class Anuncio(Base):
    __tablename__ = "anuncios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(String(128), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    precio = Column(DECIMAL(10, 2), nullable=True)
    tipo = Column(String(50), nullable=False) # oferta, demanda, promocion
    imagen_url = Column(Text, nullable=True)
    contacto = Column(String(255), nullable=True)
    creado_en = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    usuario = relationship("Usuario", back_populates="anuncios")

