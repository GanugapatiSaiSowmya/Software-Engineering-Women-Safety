import os
import pytest
from takedown_agent import TakedownReport, create_takedown_report, create_full_takedown_package

UPLOAD_DIR = "uploads"

@pytest.fixture(scope="module", autouse=True)
def setup_upload_dir():
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    yield
    # Clean up uploaded files after tests
    # for f in os.listdir(UPLOAD_DIR):
    #     os.remove(os.path.join(UPLOAD_DIR, f))

def test_generate_deepfake_alert_report():
    user_id = "user123"
    user_email = "test@example.com"
    user_name = "Test User"
    filename = "test_image.jpg"
    deepfake_score = 0.85
    gps_data = "12.9716, 77.5946"

    # Create dummy file to hash
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(b"dummy image data")

    report_name = create_takedown_report(
        user_id, user_email, user_name, filename, deepfake_score, gps_data
    )

    assert report_name.startswith("ALERT_")
    assert report_name.endswith(".pdf")
    assert os.path.exists(os.path.join(UPLOAD_DIR, report_name))

def test_generate_full_takedown_package():
    user_id = "user123"
    user_email = "test@example.com"
    user_name = "Test User"
    filename = "test_image.jpg"
    deepfake_score = 0.95
    gps_data = None
    platforms = ["instagram", "twitter"]
    urls = ["https://instagram.com/p/123", "https://twitter.com/status/456"]

    package = create_full_takedown_package(
        user_id, user_email, user_name, filename, deepfake_score, gps_data, platforms, urls
    )

    assert "master" in package
    assert "platform_instagram" in package
    assert "platform_twitter" in package
    assert "police_complaint" in package
    assert "evidence_bundle" in package
    assert "lawyer_brief" in package

    for report_name in package.values():
        assert os.path.exists(os.path.join(UPLOAD_DIR, report_name))

def test_path_traversal_protection():
    user_id = "user123"
    user_email = "test@example.com"
    user_name = "Test User"
    filename = "../../../etc/passwd"
    deepfake_score = 0.5
    gps_data = None

    report_name = create_takedown_report(
        user_id, user_email, user_name, filename, deepfake_score, gps_data
    )

    # The filename in report_name should be "passwd" and not containing "../"
    assert "../" not in report_name
    assert "passwd" in report_name
    assert os.path.exists(os.path.join(UPLOAD_DIR, report_name))
