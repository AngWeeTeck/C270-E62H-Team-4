from pathlib import Path
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    destination = UPLOAD_DIR / file.filename
    with destination.open("wb") as buffer:
        content = await file.read()
        buffer.write(content)

    return {"url": f"/uploads/{file.filename}"}
