import requests
import sys

BASE_URL = "http://localhost:8000"

def get_token(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    print(f"Login failed: {response.status_code} {response.text}")
    return None

def test_generate_summary():
    token = get_token("admin@lawcore.com", "admin123")
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}

    # Try generating summary for notary 1
    url = f"{BASE_URL}/notarias/1/generate-summary"
    print(f"Testing {url}...")
    response = requests.post(url, headers=headers)

    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_generate_summary()
