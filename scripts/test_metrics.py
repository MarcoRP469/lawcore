import sys
import os
import requests
import json
from datetime import datetime

# URL
BASE_URL = "http://localhost:8000"

def get_token(username, password):
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": username,
        "password": password
    }
    response = requests.post(url, data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Failed to login: {response.status_code} {response.text}")
        return None

def test_metrics():
    print("Testing metrics...")

    # 1. Login
    token = get_token("admin@lawcore.com", "admin123")
    if not token:
        print("Aborting test due to login failure.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Dashboard Metrics (GET /metricas)
    print("\nTesting /metricas...")
    resp = requests.get(f"{BASE_URL}/metricas/", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        print("KPIs:", json.dumps(data["kpi"], indent=2))
        print("Visitas Chart Points:", len(data["visitas"]))
    else:
        print(f"Error /metricas: {resp.status_code} {resp.text}")

    # 3. Test Trends (GET /metricas/tendencias-busqueda)
    # This is public, but let's see.
    print("\nTesting /metricas/tendencias-busqueda...")
    resp = requests.get(f"{BASE_URL}/metricas/tendencias-busqueda", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        print("Top Terms:", len(data["top_terminos"]))
        print("Trend Points:", len(data["tendencia"]))
    else:
        print(f"Error /metricas/tendencias-busqueda: {resp.status_code} {resp.text}")

    # 4. Test Alerts (GET /metricas/alertas-calidad)
    print("\nTesting /metricas/alertas-calidad...")
    resp = requests.get(f"{BASE_URL}/metricas/alertas-calidad", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        print("Alerts found:", len(data["alertas"]))
        if data["alertas"]:
            print(json.dumps(data["alertas"][0], indent=2))
    else:
        print(f"Error /metricas/alertas-calidad: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    test_metrics()
