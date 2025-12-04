from pydantic import BaseModel, Field, validator
from typing import List, Optional, Any
from datetime import datetime

# --- USUARIOS ---
class UsuarioBase(BaseModel):
    email: str = Field(alias="correo")
    displayName: Optional[str] = Field(default=None, alias="nombre")
    photoURL: Optional[str] = Field(default=None, alias="foto_url")
    # es_admin no se expone normalmente al crear, pero sí al leer si es necesario
    
    class Config:
        populate_by_name = True

class UsuarioCreate(UsuarioBase):
    password: str # Para registro

class Usuario(UsuarioBase):
    id: str
    createdAt: Optional[datetime] = Field(default=None, alias="creado_en")
    
    class Config:
        from_attributes = True
        populate_by_name = True

# --- COMENTARIOS ---
class ComentarioBase(BaseModel):
    text: str = Field(alias="texto")
    rating: int = Field(alias="puntaje")
    notaryId: int = Field(alias="notaria_id") # Notaria ID es int en MySQL

class ComentarioCreate(ComentarioBase):
    pass

class Comentario(ComentarioBase):
    id: int # ID es int en MySQL
    userId: str = Field(alias="usuario_id")
    createdAt: Optional[datetime] = Field(default=None, alias="creado_en")
    
    # Campos enriquecidos
    userDisplayName: Optional[str] = None
    userPhotoURL: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True

    @validator('userDisplayName', always=True, pre=True)
    def extract_user_name(cls, v, values):
        # Esta lógica se manejará mejor en el router, pero aquí definimos el campo
        return v

# --- SERVICIOS ---
class ServicioDetallado(BaseModel):
    slug: str
    name: str = Field(alias="nombre")
    price: Optional[float] = Field(default=None, alias="precio")
    requisitos: List[str]
    images: Optional[List[str]] = Field(default=None, alias="imagenes")
    videoUrl: Optional[str] = Field(default=None, alias="video_url")

    class Config:
        from_attributes = True
        populate_by_name = True

# --- NOTARIAS ---
class NotariaBase(BaseModel):
    name: str = Field(alias="nombre")
    address: str = Field(alias="direccion")
    district: str = Field(alias="distrito")
    phone: str = Field(alias="telefono")
    email: str = Field(alias="correo")
    available: bool = Field(default=True, alias="disponible")
    services: List[str] # Se mapeará desde la relación 'servicios_generales'
    avatarUrl: str = Field(alias="avatar_url")
    rating: float = Field(default=0.0, alias="calificacion")
    
    class Config:
        populate_by_name = True

class NotariaCreate(NotariaBase):
    landline: Optional[str] = Field(default=None, alias="telefono_fijo")
    website: Optional[str] = Field(default=None, alias="sitio_web")
    facebookUrl: Optional[str] = Field(default=None, alias="facebook_url")
    instagramUrl: Optional[str] = Field(default=None, alias="instagram_url")
    tiktokUrl: Optional[str] = Field(default=None, alias="tiktok_url")
    linkedinUrl: Optional[str] = Field(default=None, alias="linkedin_url")
    observations: Optional[str] = Field(default=None, alias="observaciones")
    detailedServices: Optional[List[ServicioDetallado]] = Field(default=None, alias="servicios_detallados")

class Notaria(NotariaBase):
    id: int # ID es int en MySQL
    landline: Optional[str] = Field(default=None, alias="telefono_fijo")
    website: Optional[str] = Field(default=None, alias="sitio_web")
    facebookUrl: Optional[str] = Field(default=None, alias="facebook_url")
    instagramUrl: Optional[str] = Field(default=None, alias="instagram_url")
    tiktokUrl: Optional[str] = Field(default=None, alias="tiktok_url")
    linkedinUrl: Optional[str] = Field(default=None, alias="linkedin_url")
    observations: Optional[str] = Field(default=None, alias="observaciones")
    commentSummary: Optional[str] = Field(default=None, alias="resumen_coment")
    detailedServices: Optional[List[ServicioDetallado]] = Field(default=None, alias="servicios_detallados")
    createdAt: Optional[datetime] = Field(default=None, alias="creado_en")

    class Config:
        from_attributes = True
        populate_by_name = True

# --- AUTH ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
