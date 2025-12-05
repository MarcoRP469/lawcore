from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm  # <--- Importación clave para el botón
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uuid

# Configuración JWT
SECRET_KEY = "tu_clave_secreta_super_segura" # CAMBIAR EN PRODUCCION
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UsuarioCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.correo == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.Usuario(
        id=str(uuid.uuid4()),
        correo=user.email,
        nombre=user.displayName,
        foto_url=user.photoURL,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.correo})
    return {"access_token": access_token, "token_type": "bearer"}

# --- ESTA ES LA FUNCIÓN CORREGIDA PARA SWAGGER ---
@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 1. Swagger envía el correo en el campo 'username'
    user = db.query(models.Usuario).filter(models.Usuario.correo == form_data.username).first()
    
    # 2. Validaciones
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generar Token
    access_token = create_access_token(data={"sub": user.correo})
    return {"access_token": access_token, "token_type": "bearer"}