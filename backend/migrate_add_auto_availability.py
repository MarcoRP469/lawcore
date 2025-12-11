"""
Script de migración para agregar campos de disponibilidad automática
Ejecutar con: python migrate_add_auto_availability.py
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

# SQL para agregar las columnas
sql_add_columns = """
ALTER TABLE notarias 
ADD COLUMN auto_disponibilidad BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Si true, calcula disponibilidad automáticamente según horarios' AFTER disponible,
ADD COLUMN horarios_json JSON NULL COMMENT 'Horarios de atención por día de la semana' AFTER auto_disponibilidad;
"""

# SQL para verificar
sql_verify = """
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'lawcore_db'
AND table_name = 'notarias' 
AND column_name IN ('auto_disponibilidad', 'horarios_json');
"""

def run_migration():
    print("Iniciando migración de disponibilidad automática...")
    
    with engine.connect() as conn:
        try:
            # Intentar agregar las columnas
            print("\nAgregando columnas 'auto_disponibilidad' y 'horarios_json'...")
            conn.execute(text(sql_add_columns))
            conn.commit()
            print("✓ Columnas agregadas exitosamente")
            
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("⚠ Las columnas ya existen")
            else:
                print(f"✗ Error al agregar columnas: {e}")
                raise
        
        # Verificar que las columnas existen
        print("\nVerificando columnas...")
        result = conn.execute(text(sql_verify))
        rows = result.fetchall()
        
        if rows:
            print("✓ Columnas verificadas:")
            for row in rows:
                print(f"  - Nombre: {row[0]}, Tipo: {row[1]}, Nullable: {row[2]}, Default: {row[3]}")
        else:
            print("✗ No se pudieron verificar las columnas")
    
    print("\n✓ Migración completada")

if __name__ == "__main__":
    run_migration()
