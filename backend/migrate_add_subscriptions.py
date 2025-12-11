"""
Script de migración para agregar sistema de suscripciones
Ejecutar con: python migrate_add_subscriptions.py
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# Credenciales MySQL
USER = 'root'
PASSWORD = 'Marco#090604'
HOST = 'localhost'
PORT = '3306'
DB_NAME = 'lawcore_db'

# URL de base de datos
DATABASE_URL = f"mysql+pymysql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}?charset=utf8mb4"

# Crear engine
engine = create_engine(DATABASE_URL, echo=True)

# SQL para agregar campos de suscripción a usuarios
sql_add_user_fields = """
ALTER TABLE usuarios 
ADD COLUMN plan_suscripcion VARCHAR(20) NOT NULL DEFAULT 'ninguno' COMMENT 'Plan de suscripción actual' AFTER es_admin,
ADD COLUMN fecha_inicio_suscripcion TIMESTAMP NULL COMMENT 'Fecha de inicio de la suscripción' AFTER plan_suscripcion,
ADD COLUMN fecha_fin_suscripcion TIMESTAMP NULL COMMENT 'Fecha de fin de la suscripción' AFTER fecha_inicio_suscripcion,
ADD COLUMN estado_suscripcion VARCHAR(20) NOT NULL DEFAULT 'inactiva' COMMENT 'Estado: activa, inactiva, vencida' AFTER fecha_fin_suscripcion;
"""

# SQL para crear tabla de planes
sql_create_planes = """
CREATE TABLE IF NOT EXISTS planes_suscripcion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    limite_anuncios INT NULL COMMENT 'NULL = ilimitado',
    duracion_dias INT NOT NULL DEFAULT 30,
    caracteristicas JSON NULL COMMENT 'Array de características del plan',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);
"""

# SQL para crear tabla de historial de pagos
sql_create_historial = """
CREATE TABLE IF NOT EXISTS historial_pagos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(128) NOT NULL,
    plan_id INT NULL,
    plan_nombre VARCHAR(50) NOT NULL COMMENT 'Guardamos el nombre por si se elimina el plan',
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NULL COMMENT 'transferencia, efectivo, tarjeta, etc',
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' COMMENT 'pendiente, aprobado, rechazado',
    referencia_pago VARCHAR(255) NULL COMMENT 'Número de operación o referencia',
    notas TEXT NULL COMMENT 'Notas del admin sobre el pago',
    aprobado_por VARCHAR(128) NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aprobado_en TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES planes_suscripcion(id) ON DELETE SET NULL,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
"""

# SQL para insertar planes de ejemplo
sql_insert_planes = """
INSERT INTO planes_suscripcion (nombre, descripcion, precio, limite_anuncios, duracion_dias, caracteristicas, activo)
VALUES 
    ('Básico', 'Plan básico para empezar', 29.00, 3, 30, '["Hasta 3 anuncios activos", "1 imagen por anuncio", "Soporte por email"]', TRUE),
    ('Profesional', 'Plan profesional con más beneficios', 59.00, 10, 30, '["Hasta 10 anuncios activos", "3 imágenes por anuncio", "Anuncios destacados", "Soporte prioritario"]', TRUE),
    ('Empresarial', 'Plan empresarial sin límites', 99.00, NULL, 30, '["Anuncios ilimitados", "Imágenes ilimitadas", "Anuncios destacados", "Soporte 24/7", "Estadísticas avanzadas"]', TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;
"""

def run_migration():
    print("Iniciando migración de sistema de suscripciones...")
    
    with engine.connect() as conn:
        try:
            # 1. Agregar campos a usuarios
            print("\n1. Agregando campos de suscripción a tabla usuarios...")
            try:
                conn.execute(text(sql_add_user_fields))
                conn.commit()
                print("✓ Campos agregados a usuarios")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    print("⚠ Los campos ya existen en usuarios")
                else:
                    raise
            
            # 2. Crear tabla de planes
            print("\n2. Creando tabla planes_suscripcion...")
            conn.execute(text(sql_create_planes))
            conn.commit()
            print("✓ Tabla planes_suscripcion creada")
            
            # 3. Crear tabla de historial
            print("\n3. Creando tabla historial_pagos...")
            conn.execute(text(sql_create_historial))
            conn.commit()
            print("✓ Tabla historial_pagos creada")
            
            # 4. Insertar planes de ejemplo
            print("\n4. Insertando planes de ejemplo...")
            conn.execute(text(sql_insert_planes))
            conn.commit()
            print("✓ Planes de ejemplo insertados")
            
        except Exception as e:
            print(f"✗ Error durante la migración: {e}")
            raise
    
    print("\n✓ Migración completada exitosamente")
    print("\nPlanes creados:")
    print("  - Básico: S/ 29/mes - 3 anuncios")
    print("  - Profesional: S/ 59/mes - 10 anuncios")
    print("  - Empresarial: S/ 99/mes - Ilimitados")

if __name__ == "__main__":
    run_migration()
