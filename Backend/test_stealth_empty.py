import requests

API_URL = "http://127.0.0.1:8000"

def test_stealth_empty():
    log_res = requests.post(f"{API_URL}/auth/login", json={
        "email": "teststealth@example.com",
        "password": "password123"
    })
    token = log_res.json()["access_token"]
    
    update_res = requests.post(f"{API_URL}/auth/stealth", json={
        "stealth_enabled": False,
        "stealth_level": 1,
        "decoy_skin": "calculator"
    }, headers={"Authorization": f"Bearer {token}"})
    
    print("Status:", update_res.status_code)
    print("Response:", update_res.text)

if __name__ == "__main__":
    test_stealth_empty()
