import requests

API_URL = "http://127.0.0.1:8000"

def test_stealth():
    # 1. Register
    reg_res = requests.post(f"{API_URL}/auth/register", json={
        "name": "Test User",
        "email": "teststealth@example.com",
        "password": "password123"
    })
    
    if reg_res.status_code == 400:
        # Already exists, just login
        log_res = requests.post(f"{API_URL}/auth/login", json={
            "email": "teststealth@example.com",
            "password": "password123"
        })
        token = log_res.json()["access_token"]
    else:
        token = reg_res.json()["access_token"]
        
    print("Token:", token)
    
    # 2. Update stealth
    update_res = requests.post(f"{API_URL}/auth/stealth", json={
        "stealth_enabled": True,
        "stealth_level": 2,
        "decoy_skin": "notes",
        "new_secret_key": "1234"
    }, headers={"Authorization": f"Bearer {token}"})
    
    print("Status Code:", update_res.status_code)
    print("Response:", update_res.text)

if __name__ == "__main__":
    test_stealth()
