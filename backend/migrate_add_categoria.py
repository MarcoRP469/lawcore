"""
Script de migración para agregar la columna 'categoria' a la tabla 'servicios_detallados'
Ejecutar con: python migrate_add_categoria.py
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

# SQL para agregar la columna
sql_add_column = """
ALTER TABLE servicios_detallados 
ADD COLUMN categoria VARCHAR(100) NULL AFTER nombre;
"""

# SQL para verificar
sql_verify = """
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'lawcore_db'
AND table_name = 'servicios_detallados' 
AND column_name = 'categoria';
"""

def run_migration():
    print("Iniciando migración...")
    
    with engine.connect() as conn:
        try:
            # Intentar agregar la columna
            print("\nAgregando columna 'categoria'...")
            conn.execute(text(sql_add_column))
            conn.commit()
            print("✓ Columna agregada exitosamente")
            
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("⚠ La columna 'categoria' ya existe")
            else:
                print(f"✗ Error al agregar columna: {e}")
                raise
        
        # Verificar que la columna existe
        print("\nVerificando columna...")
        result = conn.execute(text(sql_verify))
        rows = result.fetchall()
        
        if rows:
            print("✓ Columna 'categoria' verificada:")
            for row in rows:
                print(f"  - Nombre: {row[0]}, Tipo: {row[1]}, Nullable: {row[2]}")
        else:
            print("✗ No se pudo verificar la columna")
    
    print("\n✓ Migración completada")

if __name__ == "__main__":
    run_migration()
