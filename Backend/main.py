import os
import shutil
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from metadata_agent import get_gps_data, strip_gps


app = FastAPI()

# Allow your React app to talk to Python
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
    
    # REAL CHECK HERE
    real_gps = get_gps_data(file_path)
    
    return {
        "status": "Success",
        "gps_found": real_gps is not None,
        "coordinates": real_gps if real_gps else "No GPS data found"
    }


@app.post("/strip")
async def strip_image(filename: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return {"status": "Error", "message": "file not found"}

    try:
        removed = strip_gps(file_path)
    except Exception as e:
        return {"status": "Error", "message": str(e)}

    # Re-check GPS after attempting strip
    real_gps = get_gps_data(file_path)

    return {
        "status": "Success",
        "gps_removed": bool(removed),
        "gps_found": real_gps is not None,
        "coordinates": real_gps if real_gps else ""
    }