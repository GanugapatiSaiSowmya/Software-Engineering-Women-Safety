import os
import shutil
from fractions import Fraction
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
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


def parse_coord(raw):
    """
    Convert raw EXIF GPS tuple like [43, 28, 149399999/100000000]
    into a clean decimal degree string like '43.4708° N'
    """
    try:
        parts = str(raw).strip("[]").split(",")
        degrees = float(Fraction(parts[0].strip()))
        minutes = float(Fraction(parts[1].strip()))
        seconds = float(Fraction(parts[2].strip()))
        decimal = degrees + (minutes / 60) + (seconds / 3600)
        return round(decimal, 6)
    except Exception:
        return None


def format_coordinates(raw_coords):
    """
    Takes raw EXIF string e.g. '[43, 28, ...] N, [11, 53, ...] E'
    Returns clean string e.g. '43.4708° N, 11.8983° E'
    """
    try:
        # Split into lat and lon parts
        parts = raw_coords.split("] ")
        lat_raw = parts[0].replace("[", "").strip()
        lat_ref = parts[1][0]          # 'N' or 'S'
        lon_raw = parts[1][2:].replace("[", "").strip()
        lon_ref = parts[2][0]          # 'E' or 'W'

        lat = parse_coord(lat_raw)
        lon = parse_coord(lon_raw)

        if lat is None or lon is None:
            return raw_coords          # fall back to raw if parsing fails

        return f"{lat}° {lat_ref}, {lon}° {lon_ref}"
    except Exception:
        return raw_coords              # fall back to raw if anything breaks


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    real_gps = get_gps_data(file_path)

    coordinates = ""
    if real_gps:
        coordinates = format_coordinates(str(real_gps))

    return {
        "status": "Success",
        "gps_found": real_gps is not None,
        "coordinates": coordinates if coordinates else "No GPS data found",
    }


@app.post("/strip")
async def strip_image(filename: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return {"status": "Error", "message": "File not found"}

    try:
        removed = strip_gps(file_path)
    except Exception as e:
        return {"status": "Error", "message": str(e)}

    real_gps = get_gps_data(file_path)

    coordinates = ""
    if real_gps:
        coordinates = format_coordinates(str(real_gps))

    return {
        "status": "Success",
        "gps_removed": bool(removed),
        "gps_found": real_gps is not None,
        "coordinates": coordinates if coordinates else "",
    }