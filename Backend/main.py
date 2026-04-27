import os
import shutil
import mimetypes
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from database import engine, Base
from auth import router as auth_router
from sos_routes import router as sos_router
from metadata_agent import get_gps_data, strip_gps
from vision_agent import detect_deepfake
from legal_agent import generate_evidence_report
from image_protection import protect_image
from PIL import Image

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SHIELD.ai API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(sos_router)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


@app.get("/")
def read_root():
    return {"message": "SHIELD.ai Backend is Active", "version": "2.0.0"}


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. GPS metadata check
    gps_info = get_gps_data(file_path)

    # 2. AI deepfake detection
    ai_results = detect_deepfake(file_path)

    # 3. Apply image protection (adversarial noise, watermark, honey pixels, smart blur)
    try:
        img = Image.open(file_path).convert("RGB")
        protected_img = protect_image(img)
        base, ext = os.path.splitext(file.filename)
        protected_filename = f"{base}-protected{ext if ext else '.jpg'}"
        protected_path = os.path.join(UPLOAD_DIR, protected_filename)
        protected_img.save(protected_path)
    except Exception as e:
        print(f"[image_protection] Failed: {e}")
        protected_filename = None

    # 4. Evidence report
    report_file = generate_evidence_report(file.filename, ai_results['score'], gps_info)

    return {
        "filename":           file.filename,
        "gps":                gps_info,
        "ai_results":         ai_results,
        "protected_filename": protected_filename,
        "protected_url":      f"http://127.0.0.1:8000/download-protected/{protected_filename}" if protected_filename else None,
        "report_url":         f"http://127.0.0.1:8000/download/{report_file}",
    }


@app.post("/strip")
async def strip_image(filename: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    base, ext     = os.path.splitext(filename)
    stripped_name  = f"{base}-stripped{ext}"
    stripped_path  = os.path.join(UPLOAD_DIR, stripped_name)

    try:
        shutil.copyfile(file_path, stripped_path)
        removed = strip_gps(stripped_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    gps_found_after = get_gps_data(stripped_path)

    return {
        "status":            "Success",
        "original":          filename,
        "stripped_filename": stripped_name,
        "gps_removed":       bool(removed),
        "gps_found":         gps_found_after is not None,
        "coordinates":       gps_found_after if gps_found_after else None,
    }


@app.get("/download-protected/{filename}") # Added {filename}
async def download_protected(filename: str):
    protected_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(protected_path):
        raise HTTPException(status_code=404, detail="Protected file not found")
    mime_type, _ = mimetypes.guess_type(protected_path)
    return FileResponse(
        path       = protected_path,
        filename   = filename,
        media_type = mime_type or "application/octet-stream",
    )


@app.get("/download")
async def download(filename: str):
    base, ext     = os.path.splitext(filename)
    stripped_name  = f"{base}-stripped{ext}"
    stripped_path  = os.path.join(UPLOAD_DIR, stripped_name)

    if not os.path.exists(stripped_path):
        raise HTTPException(status_code=404, detail="Stripped file not found")

    mime_type, _ = mimetypes.guess_type(stripped_path)
    return FileResponse(
        path       = stripped_path,
        filename   = stripped_name,
        media_type = mime_type or "application/octet-stream",
    )