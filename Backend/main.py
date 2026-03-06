import os
import shutil
import mimetypes
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from metadata_agent import get_gps_data, strip_gps

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    real_gps = get_gps_data(file_path)
    return {
        "status": "Success",
        "filename": file.filename,
        "gps_found": real_gps is not None,
        "coordinates": real_gps if real_gps else None,
    }


@app.post("/strip")
async def strip_image(filename: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    base, ext = os.path.splitext(filename)
    stripped_name = f"{base}-stripped{ext}"
    stripped_path = os.path.join(UPLOAD_DIR, stripped_name)

    try:
        shutil.copyfile(file_path, stripped_path)
        removed = strip_gps(stripped_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    gps_found_after = get_gps_data(stripped_path)

    return {
        "status": "Success",
        "original": filename,
        "stripped_filename": stripped_name,
        "gps_removed": bool(removed),
        "gps_found": gps_found_after is not None,
        "coordinates": gps_found_after if gps_found_after else None,
    }


@app.get("/download")
async def download(filename: str):
    base, ext = os.path.splitext(filename)
    stripped_name = f"{base}-stripped{ext}"
    stripped_path = os.path.join(UPLOAD_DIR, stripped_name)

    if not os.path.exists(stripped_path):
        raise HTTPException(status_code=404, detail="Stripped file not found")

    mime_type, _ = mimetypes.guess_type(stripped_path)
    return FileResponse(path=stripped_path, filename=stripped_name, media_type=mime_type or "application/octet-stream")