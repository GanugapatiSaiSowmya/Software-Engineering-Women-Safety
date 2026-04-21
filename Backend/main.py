from image_protection import protect_image
from PIL import Image
import os
import shutil
import mimetypes
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from metadata_agent import get_gps_data, strip_gps
from vision_agent import detect_deepfake
from legal_agent import generate_evidence_report
from guardian_sos import router as sos_router
from database import init_db

# add auth router import
# from auth import router as auth_router

app = FastAPI()

# initialize database
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include Guardian SOS routes
app.include_router(sos_router)


@app.get("/")
def read_root():
    return {"message": "SHIELD.ai Backend is Active", "version": "1.0.0"}
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# include auth endpoints under /auth
# app.include_router(auth_router, prefix="/auth", tags=["auth"])

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


@app.post("/upload-guard/")
async def upload_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    img = Image.open(file_path).convert("RGB")
    img = Image.open(file_path).convert("RGB")

    #Apply full protection pipeline (includes smart blur)
    img = protect_image(img)

    img.save(file_path)  
    
    # 1. Run the Metadata Scan (Existing)
    gps_info = get_gps_data(file_path)
    
    # 2. RUN THE AI SCAN (NEW)
    ai_results = detect_deepfake(file_path)

    # 3. Generate the PDF Report (NEW)
    report_file = generate_evidence_report(file.filename, ai_results['score'], gps_info)
    
    return {
    "filename": file.filename,
    "gps": gps_info,
    "ai_results": ai_results,
    "report_url": f"http://127.0.0.1:8000/download/{report_file}",
    "image_url": f"http://127.0.0.1:8000/uploads/{file.filename}"
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