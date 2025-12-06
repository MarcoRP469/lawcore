
import sqlite3
import random
from datetime import datetime, timedelta

def seed_data():
    conn = sqlite3.connect('lawcore.db')
    cursor = conn.cursor()

    # 1. Get Notaria IDs
    cursor.execute("SELECT id FROM notarias")
    notarias = cursor.fetchall()
    notaria_ids = [n[0] for n in notarias]

    if not notaria_ids:
        print("No notarias found. Please create one first.")
        return

    print(f"Found notarias: {notaria_ids}")

    # 2. Insert Visits (Last 6 months)
    print("Seeding visits...")
    visits_to_insert = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)

    for _ in range(500): # 500 visits
        nid = random.choice(notaria_ids)
        # Random date between start and end
        random_days = random.randint(0, 180)
        visit_date = start_date + timedelta(days=random_days)
        visits_to_insert.append((nid, visit_date))

    cursor.executemany("INSERT INTO notaria_visitas (notaria_id, creado_en) VALUES (?, ?)", visits_to_insert)

    # 3. Ensure some comments exist (Optional, but good for dashboard)
    # Check current comments
    cursor.execute("SELECT count(*) FROM comentarios")
    count = cursor.fetchone()[0]
    if count < 5:
        print("Seeding comments...")
        # Get users
        cursor.execute("SELECT id FROM usuarios")
        users = cursor.fetchall()
        user_ids = [u[0] for u in users]

        if user_ids:
            comments_to_insert = []
            for _ in range(10):
                nid = random.choice(notaria_ids)
                uid = random.choice(user_ids)
                rating = random.randint(3, 5)
                text = random.choice(["Excelente servicio", "Muy rápido", "Recomendado", "Buena atención", "Podría mejorar"])
                date = datetime.now() - timedelta(days=random.randint(0, 30))
                comments_to_insert.append((nid, uid, rating, text, date))

            cursor.executemany("INSERT INTO comentarios (notaria_id, usuario_id, puntaje, texto, creado_en) VALUES (?, ?, ?, ?, ?)", comments_to_insert)

    conn.commit()
    print("Seeding complete.")
    conn.close()

if __name__ == "__main__":
    seed_data()
