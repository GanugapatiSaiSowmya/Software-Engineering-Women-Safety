# Backend/metadata_agent.py
import exifread

def strip_gps(filepath):
    """Remove GPS EXIF tags from an image in-place.

    Returns True if GPS tags were present and removed, False if no GPS tags
    were found or on failure.
    """
    try:
        import piexif
    except Exception as e:
        # piexif is required for writing EXIF; bubble up a helpful error
        raise RuntimeError("piexif is required to strip EXIF data: " + str(e))

    try:
        exif_dict = piexif.load(filepath)
        gps_ifd = exif_dict.get("GPS", {}) or {}
        had_gps = bool(gps_ifd)

        if not had_gps:
            return False

        # Remove GPS IFD
        exif_dict["GPS"] = {}

        exif_bytes = piexif.dump(exif_dict)
        piexif.insert(exif_bytes, filepath)
        return True
    except Exception:
        return False

def get_gps_data(filepath):
    with open(filepath, 'rb') as f:
        tags = exifread.process_file(f)
        
    # EXIF data stores GPS in a complex format. 
    # For now, we just check if the tags exist.
    lat = tags.get('GPS GPSLatitude')
    lon = tags.get('GPS GPSLongitude')

    if lat and lon:
        # Returns a readable string of the raw metadata
        return f"{lat} {tags.get('GPS GPSLatitudeRef')}, {lon} {tags.get('GPS GPSLongitudeRef')}"
    
    return None