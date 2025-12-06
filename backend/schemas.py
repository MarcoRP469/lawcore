from pydantic import BaseModel, Field, ConfigDict, validator
from typing import List, Optional, Any
from datetime import datetime

# Common config
class BaseConfigModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

# --- USUARIOS ---
class UsuarioBase(BaseConfigModel):
    email: str = Field(validation_alias="correo")
    displayName: Optional[str] = Field(default=None, validation_alias="nombre")
    photoURL: Optional[str] = Field(default=None, validation_alias="foto_url")
    bio: Optional[str] = None
    phoneNumber: Optional[str] = Field(default=None, validation_alias="telefono")

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseConfigModel):
    displayName: Optional[str] = Field(default=None, alias="nombre")
    bio: Optional[str] = None
    phoneNumber: Optional[str] = Field(default=None, alias="telefono")
    photoURL: Optional[str] = Field(default=None, alias="foto_url")

class Usuario(UsuarioBase):
    id: str
    role: str = Field(default="public")
    es_admin: bool = Field(default=False)
    createdAt: Optional[datetime] = Field(default=None, validation_alias="creado_en")
    updatedAt: Optional[datetime] = Field(default=None, validation_alias="updated_at")

# --- COMENTARIOS ---
class ComentarioBase(BaseConfigModel):
    text: str = Field(validation_alias="texto")
    rating: int = Field(validation_alias="puntaje")
    notaryId: int = Field(validation_alias="notaria_id")

class ComentarioCreate(ComentarioBase):
    pass

class Comentario(ComentarioBase):
    id: int
    userId: str = Field(validation_alias="usuario_id")
    createdAt: Optional[datetime] = Field(default=None, validation_alias="creado_en")
    
    # Campos enriquecidos
    userDisplayName: Optional[str] = None
    userPhotoURL: Optional[str] = None

    @validator('userDisplayName', always=True, pre=True)
    def extract_user_name(cls, v, values):
        return v

# --- SERVICIOS ---
class ServicioDetallado(BaseConfigModel):
    slug: str
    name: str = Field(validation_alias="nombre")
    price: Optional[float] = Field(default=None, validation_alias="precio")
    requisitos: List[str]
    images: Optional[List[str]] = Field(default=None, validation_alias="imagenes")
    videoUrl: Optional[str] = Field(default=None, validation_alias="video_url")

# --- NOTARIAS ---
class NotariaBase(BaseConfigModel):
    name: str = Field(validation_alias="nombre")
    address: str = Field(validation_alias="direccion")
    district: str = Field(validation_alias="distrito")
    phone: str = Field(validation_alias="telefono")
    email: str = Field(validation_alias="correo")
    available: bool = Field(default=True, validation_alias="disponible")
    services: List[str]
    avatarUrl: Optional[str] = Field(default=None, validation_alias="avatar_url")
    rating: float = Field(default=0.0, validation_alias="calificacion")

class NotariaCreate(NotariaBase):
    landline: Optional[str] = Field(default=None, alias="telefono_fijo")
    website: Optional[str] = Field(default=None, alias="sitio_web")
    facebookUrl: Optional[str] = Field(default=None, alias="facebook_url")
    instagramUrl: Optional[str] = Field(default=None, alias="instagram_url")
    tiktokUrl: Optional[str] = Field(default=None, alias="tiktok_url")
    linkedinUrl: Optional[str] = Field(default=None, alias="linkedin_url")
    observations: Optional[str] = Field(default=None, alias="observaciones")
    detailedServices: Optional[List[ServicioDetallado]] = Field(default=None, alias="servicios_detallados")
    # Para superadmin que quiera asignar propietario
    ownerId: Optional[str] = Field(default=None, alias="usuario_id")

class Notaria(NotariaBase):
    id: int
    landline: Optional[str] = Field(default=None, validation_alias="telefono_fijo")
    website: Optional[str] = Field(default=None, validation_alias="sitio_web")
    facebookUrl: Optional[str] = Field(default=None, validation_alias="facebook_url")
    instagramUrl: Optional[str] = Field(default=None, validation_alias="instagram_url")
    tiktokUrl: Optional[str] = Field(default=None, validation_alias="tiktok_url")
    linkedinUrl: Optional[str] = Field(default=None, validation_alias="linkedin_url")
    observations: Optional[str] = Field(default=None, validation_alias="observaciones")
    commentSummary: Optional[str] = Field(default=None, validation_alias="resumen_coment")
    detailedServices: Optional[List[ServicioDetallado]] = Field(default=None, validation_alias="servicios_detallados")
    createdAt: Optional[datetime] = Field(default=None, validation_alias="creado_en")

    # Nuevo campo
    userId: Optional[str] = Field(default=None, validation_alias="usuario_id")

# --- AUTH ---
class Token(BaseConfigModel):
    access_token: str
    token_type: str

class TokenData(BaseConfigModel):
    email: Optional[str] = None
