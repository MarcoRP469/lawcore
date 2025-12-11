import sys
import os
from datetime import datetime, timedelta
import random

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, Usuario, Notaria, NotariaVisita, Comentario, RegistroBusqueda, ServicioDetallado
from backend.database import get_db

# Setup DB
DATABASE_URL = "sqlite:///./lawcore.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed():
    db = SessionLocal()

    # Clean up first (optional, but good for idempotency if simple)
    # db.query(RegistroBusqueda).delete()
    # db.query(Comentario).delete()
    # db.query(NotariaVisita).delete()
    # db.query(Notaria).delete()
    # db.query(Usuario).delete()
    # db.commit()

    # Hash for 'admin123'
    hashed_pwd = "$2b$12$SEYyg3gnkTXbN9pwPeVlRuGur9vHG5bwGuJxCWMp/e4xJSq2LyR1e"

    # 1. Users
    print("Creating users...")
    admin = db.query(Usuario).filter_by(correo="admin@lawcore.com").first()
    if not admin:
        admin = Usuario(
            id="admin_id",
            nombre="Super Admin",
            correo="admin@lawcore.com",
            role="superadmin",
            es_admin=True,
            hashed_password=hashed_pwd
        )
        db.add(admin)
    else:
        admin.hashed_password = hashed_pwd

    client = db.query(Usuario).filter_by(correo="client@lawcore.com").first()
    if not client:
        client = Usuario(
            id="client_id",
            nombre="Notary Client",
            correo="client@lawcore.com",
            role="client",
            es_admin=False,
            hashed_password=hashed_pwd
        )
        db.add(client)
    else:
        client.hashed_password = hashed_pwd

    db.commit()

    # 2. Notarias
    print("Creating notarias...")
    notaria1 = db.query(Notaria).filter_by(nombre="Notaría Principal").first()
    if not notaria1:
        notaria1 = Notaria(
            nombre="Notaría Principal",
            direccion="Av. Principal 123",
            distrito="Central",
            telefono="555-0001",
            correo="contacto@notariaprincipal.com",
            usuario_id=client.id,
            calificacion=4.5,
            creado_en=datetime.now() - timedelta(days=60)
        )
        db.add(notaria1)
        db.commit()

    notaria2 = db.query(Notaria).filter_by(nombre="Notaría Secundaria").first()
    if not notaria2:
        notaria2 = Notaria(
            nombre="Notaría Secundaria",
            direccion="Calle Secundaria 456",
            distrito="Norte",
            telefono="555-0002",
            correo="info@notariasecundaria.com",
            # No owner
            calificacion=4.8,
            creado_en=datetime.now() - timedelta(days=30)
        )
        db.add(notaria2)
        db.commit()

    # 3. Visitas
    print("Creating visits...")
    # Generate visits for the last 6 months
    for i in range(100):
        days_ago = random.randint(0, 180)
        visit_date = datetime.now() - timedelta(days=days_ago)
        visit = NotariaVisita(
            notaria_id=notaria1.id,
            creado_en=visit_date
        )
        db.add(visit)

    for i in range(50):
        days_ago = random.randint(0, 30)
        visit = NotariaVisita(
            notaria_id=notaria2.id,
            creado_en=datetime.now() - timedelta(days=days_ago)
        )
        db.add(visit)

    # 4. Comentarios
    print("Creating comments...")
    # Add high rating high variance comments to trigger alert for notaria2
    scores = [5, 5, 5, 1, 1, 5, 5, 1]
    for s in scores:
        comment = Comentario(
            notaria_id=notaria2.id,
            usuario_id=admin.id, # Admin commenting
            puntaje=s,
            texto="Comentario de prueba",
            creado_en=datetime.now() - timedelta(days=random.randint(0, 30))
        )
        db.add(comment)

    # Normal comments for notaria1
    for i in range(10):
        comment = Comentario(
            notaria_id=notaria1.id,
            usuario_id=admin.id,
            puntaje=random.randint(3, 5),
            texto="Buen servicio",
            creado_en=datetime.now() - timedelta(days=random.randint(0, 60))
        )
        db.add(comment)

    # 5. Registros Busqueda
    print("Creating search records...")
    terms = ["poder", "testamento", "compraventa", "tramite", "notario"]
    for i in range(50):
        term = random.choice(terms)
        days_ago = random.randint(0, 30)
        search = RegistroBusqueda(
            termino=term,
            fecha=datetime.now() - timedelta(days=days_ago),
            cantidad_resultados=random.randint(0, 10)
        )
        db.add(search)

    # Brechas (0 results)
    for i in range(10):
        search = RegistroBusqueda(
            termino="tramite desconocido",
            fecha=datetime.now() - timedelta(days=random.randint(0, 10)),
            cantidad_resultados=0
        )
        db.add(search)

    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed()
