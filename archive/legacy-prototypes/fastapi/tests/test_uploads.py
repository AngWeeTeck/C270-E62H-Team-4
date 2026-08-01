from fastapi.testclient import TestClient
from app.main import app

def test_upload_rejects_unsupported_type():
    client = TestClient(app)
    resp = client.post(
        "/api/upload",
        files={"file": ("virus.exe", b"fake-bytes", "application/x-msdownload")},
    )
    assert resp.status_code == 400

def test_upload_accepts_png():
    client = TestClient(app)
    resp = client.post(
        "/api/upload",
        files={"file": ("pic.png", b"\x89PNG\r\n", "image/png")},
    )
    assert resp.status_code == 200