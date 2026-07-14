from pathlib import Path

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from .db import init_db
from .routes import threads, replies, uploads

app = FastAPI(title="FastAPI Backend")

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

init_db()

app.include_router(threads, prefix="/api")
app.include_router(replies, prefix="/api")
app.include_router(uploads, prefix="/api")

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
@app.get("/healthz")
@app.get("/api/health")
def health():
    return {"status": "ok"}
