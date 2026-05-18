import os
import json
import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
import shutil

# Use a test database
TEST_DB_URL = "sqlite:///./test_shieldai.db"
os.environ["DATABASE_URL"] = TEST_DB_URL

@pytest.fixture(scope="module")
def client():
    # Setup
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    # Teardown
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_shieldai.db"):
        os.remove("./test_shieldai.db")
    if os.path.exists("uploads"):
        # shutil.rmtree("uploads")
        pass

def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "SHIELD.ai Backend is Active"

def test_auth_flow(client):
    # Register
    reg_data = {
        "name": "Integration User",
        "email": "integration@test.com",
        "password": "password123"
    }
    response = client.post("/auth/register", json=reg_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token is not None

    # Login
    login_data = {
        "email": "integration@test.com",
        "password": "password123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert response.json()["access_token"] == token

    # Me
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "integration@test.com"

def test_upload_and_takedown_flow(client):
    # 1. Upload
    if not os.path.exists("test_image.jpg"):
        with open("test_image.jpg", "wb") as f:
            f.write(b"dummy image data")

    with open("test_image.jpg", "rb") as f:
        response = client.post("/upload", files={"file": ("test_image.jpg", f, "image/jpeg")})

    assert response.status_code == 200
    res_data = response.json()
    assert res_data["filename"] == "test_image.jpg"
    assert "ai_results" in res_data

    # 2. Alert
    alert_data = {
        "user_id": "1",
        "user_email": "integration@test.com",
        "user_name": "Integration User",
        "filename": "test_image.jpg",
        "deepfake_score": res_data["ai_results"]["score"] if res_data["ai_results"]["score"] is not None else 0.8,
        "gps_data": None
    }
    response = client.post("/takedown/alert", data=alert_data)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    alert_report = response.json()["alert_report"]

    # 3. Generate Package
    package_data = {
        "user_id": "1",
        "user_email": "integration@test.com",
        "user_name": "Integration User",
        "filename": "test_image.jpg",
        "deepfake_score": 0.9,
        "gps_data": None,
        "platforms": json.dumps(["instagram"]),
        "urls": json.dumps(["https://instgram.com/p/test"])
    }
    response = client.post("/takedown/generate-package", data=package_data)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert "package_documents" in response.json()

    # 4. Download Report
    response = client.get(f"/download-report/{alert_report}")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"

def test_guardian_flow(client):
    # Add Guardian
    guardian_data = {
        "name": "Guardian One",
        "phone": "+1234567890",
        "user_id": "1"
    }
    response = client.post("/guardians/add", json=guardian_data)
    assert response.status_code == 200
    guardian_id = response.json()["id"]

    # Get Guardians
    response = client.get("/guardians?user_id=1")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Trigger SOS
    response = client.post("/sos/trigger", json={"user_id": "1"})
    assert response.status_code == 200
    assert response.json()["message"] == "SOS Triggered!"
    assert len(response.json()["notified"]) >= 1
