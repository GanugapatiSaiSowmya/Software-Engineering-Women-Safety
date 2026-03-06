# Backend/metadata_agent.py
import os
import tempfile
from typing import Optional, Tuple

from PIL import Image
import piexif


def get_gps_data(filepath: str) -> Optional[str]:
    """
    Return a human-readable "lat, lon" string if GPS EXIF is present, otherwise None.
    """
    try:
        exif_dict = piexif.load(filepath)
        gps_ifd = exif_dict.get("GPS", {})
        if not gps_ifd:
            return None

        def _to_deg(value, ref):
            d = value[0][0] / value[0][1]
            m = value[1][0] / value[1][1]
            s = value[2][0] / value[2][1]
            deg = d + (m / 60.0) + (s / 3600.0)
            if ref in (b"S", b"W", "S", "W"):
                deg = -deg
            return deg

        lat_ref = gps_ifd.get(piexif.GPSIFD.GPSLatitudeRef)
        lon_ref = gps_ifd.get(piexif.GPSIFD.GPSLongitudeRef)
        lat_val = gps_ifd.get(piexif.GPSIFD.GPSLatitude)
        lon_val = gps_ifd.get(piexif.GPSIFD.GPSLongitude)

        if lat_ref and lon_ref and lat_val and lon_val:
            lat = _to_deg(lat_val, lat_ref)
            lon = _to_deg(lon_val, lon_ref)
            return f"{lat:.6f}, {lon:.6f}"

        return None
    except Exception:
        return None


def strip_gps(filepath: str) -> bool:
    """
    Remove GPS EXIF from the image at `filepath` safely:
    - Load the image and EXIF, zero out the GPS IFD, dump new exif bytes.
    - Write to a temporary file and atomically replace the original to avoid corruption.
    Returns True on success, False on failure.
    """
    try:
        # Open image to preserve format information
        img = Image.open(filepath)
        img_format = img.format  # e.g., "JPEG", "PNG"

        try:
            exif_dict = piexif.load(filepath)
            if "GPS" in exif_dict and exif_dict["GPS"]:
                exif_dict["GPS"] = {}
            exif_bytes = piexif.dump(exif_dict)
        except Exception:
            # If piexif can't load/dump, we'll save without EXIF (this strips metadata)
            exif_bytes = None

        # If saving as JPEG, ensure RGB mode to avoid corrupted files
        if img_format and img_format.upper() in ("JPEG", "JPG") and img.mode != "RGB":
            img = img.convert("RGB")

        # Write to temporary file first
        dir_name = os.path.dirname(filepath) or "."
        fd, tmp_path = tempfile.mkstemp(suffix=os.path.splitext(filepath)[1], dir=dir_name)
        os.close(fd)
        try:
            if exif_bytes and img_format:
                # Preserve format and exif
                img.save(tmp_path, format=img_format, exif=exif_bytes)
            else:
                # Save without exif (strips metadata)
                if img_format:
                    img.save(tmp_path, format=img_format)
                else:
                    # Fallback to binary copy if format unknown
                    with open(filepath, "rb") as srcf, open(tmp_path, "wb") as dstf:
                        dstf.write(srcf.read())
            # Replace original file atomically
            os.replace(tmp_path, filepath)
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

        return True
    except Exception:
        return False