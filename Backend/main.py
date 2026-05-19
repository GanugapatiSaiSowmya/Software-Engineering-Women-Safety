import os
import shutil
import mimetypes
import json

from typing import Optional

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Form,
    HTTPException,
    Depends
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from profile_routes import router as profile_router

from database import (
    engine,
    Base,
    get_db
)

from auth import (
    router as auth_router,
    get_current_user
)

from sos_routes import router as sos_router

from metadata_agent import (
    get_gps_data,
    strip_gps
)

from vision_agent import detect_deepfake

from legal_agent import generate_evidence_report

from image_protection import protect_image

from takedown_agent import (
    create_takedown_report,
    TakedownReport
)

from guardian_alert import (
    alert_guardians_on_deepfake_detection
)

from models import (
    Guardian,
    User
)

from PIL import Image
from whatsapp_sender import send_sos_message


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SHIELD.ai API",
    version="2.0.0"
)

app.include_router(profile_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(sos_router)


UPLOAD_DIR = "uploads"

if not os.path.exists(
    UPLOAD_DIR
):
    os.makedirs(
        UPLOAD_DIR
    )


@app.get("/")
def read_root():

    return {

        "message":

        "SHIELD.ai Backend is Active",

        "version":

        "2.0.0"
    }

@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    safe_filename = os.path.basename(
        file.filename
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        safe_filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    gps_info = get_gps_data(
        file_path
    )

    ai_results = detect_deepfake(
        file_path
    )

    gps_removed = False

    try:

        gps_removed = strip_gps(
            file_path
        )

    except Exception:

        pass


    protected_filename = None

    try:

        img = Image.open(
            file_path
        ).convert(
            "RGB"
        )

        protected_img = protect_image(
            img
        )

        base, ext = os.path.splitext(
            file.filename
        )

        protected_filename = (

            f"{base}-protected"

            f"{ext if ext else '.jpg'}"

        )

        protected_path = os.path.join(

            UPLOAD_DIR,

            protected_filename
        )

        protected_img.save(
            protected_path
        )

    except Exception as e:

        print(e)


    report_file = generate_evidence_report(

        safe_filename,

        ai_results["score"],

        gps_info
    )


    return {

        "filename":
        safe_filename,

        "gps":
        gps_info,

        "gps_removed":
        gps_removed,

        "ai_results":
        ai_results,

        "protected_filename":
        protected_filename,

        "final_filename":
        protected_filename,

        "protected_url":

        f"http://127.0.0.1:8000/download-protected/{protected_filename}"

        if protected_filename

        else None,

        "report_url":

        f"http://127.0.0.1:8000/download-report/{report_file}"

    }

# FIXED UPLOAD ROUTE




@app.post("/strip")
async def strip_image(
    filename: str = Form(...)
):

    safe_filename = os.path.basename(
        filename
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        safe_filename
    )

    if not os.path.exists(
        file_path
    ):

        raise HTTPException(

            status_code=404,

            detail="File not found"
        )

    base, ext = os.path.splitext(
        safe_filename
    )

    stripped_name = (
        f"{base}-stripped{ext}"
    )

    stripped_path = os.path.join(
        UPLOAD_DIR,
        stripped_name
    )

    shutil.copyfile(
        file_path,
        stripped_path
    )

    removed = strip_gps(
        stripped_path
    )

    gps_found_after = get_gps_data(
        stripped_path
    )

    return {

        "status":

        "Success",

        "original":

        safe_filename,

        "stripped_filename":

        stripped_name,

        "gps_removed":

        bool(
            removed
        ),

        "gps_found":

        gps_found_after is not None,

        "coordinates":

        gps_found_after
    }


@app.get(
    "/download-protected/{filename}"
)
async def download_protected(
    filename: str
):

    safe_filename = os.path.basename(
        filename
    )

    protected_path = os.path.join(

        UPLOAD_DIR,

        safe_filename
    )

    if not os.path.exists(
        protected_path
    ):

        raise HTTPException(

            status_code=404,

            detail=
            "Protected file not found"
        )

    mime_type, _ = mimetypes.guess_type(
        protected_path
    )

    return FileResponse(
        path       = stripped_path,
        filename   = stripped_name,
        media_type = mime_type or "application/octet-stream",
    )


# ─────────────────────────────────────────────────────────────────────────────
# TAKEDOWN & GUARDIAN ALERT ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/takedown/alert")
async def create_deepfake_alert(
    user_id: str = Form(...),
    user_email: str = Form(...),
    user_name: str = Form(...),
    filename: str = Form(...),
    deepfake_score: float = Form(...),
    gps_data: Optional[str] = Form(None),
):
    """
    When user sees deepfake detected result, create ALERT report
    This is a quick PDF asking if they want to proceed to full takedown
    """
    try:
        safe_filename = os.path.basename(filename)
        alert_report = create_takedown_report(
            user_id=user_id,
            user_email=user_email,
            user_name=user_name,
            filename=safe_filename,
            deepfake_score=deepfake_score,
            gps_data=gps_data,
            is_alert_only=True,
        )

        return {
            "status": "success",
            "message": "Deepfake alert report generated",
            "alert_report": alert_report,
            "alert_url": f"http://127.0.0.1:8000/download-report/{alert_report}",
            "next_action": "User should review and click 'Proceed to Takedown'",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/takedown/generate-package")
async def generate_takedown_package(
    user_id: str = Form(...),
    user_email: str = Form(...),
    user_name: str = Form(...),
    filename: str = Form(...),
    deepfake_score: float = Form(...),
    gps_data: Optional[str] = Form(None),
    platforms: str = Form(...),  # JSON string: ["instagram", "twitter"]
    urls: str = Form(...),  # JSON string: ["url1", "url2"]
    db: Session = Depends(get_db),
):
    """
    Generate FULL takedown package when user confirms
    This includes all 5 documents + guardian alerts
    """
    try:
        platforms_list = json.loads(platforms)
        urls_list = json.loads(urls)

        # Generate complete package
        safe_filename = os.path.basename(filename)
        reporter = TakedownReport(user_id, user_email, user_name)
        package = reporter.generate_full_takedown_package(
            filename=safe_filename,
            deepfake_score=deepfake_score,
            gps_data=gps_data,
            platforms=platforms_list,
            urls=urls_list,
            account_handles=[],
        )

        # Get guardians from database
        guardians = db.query(Guardian).filter(Guardian.user_id == user_id).all()
        guardians_list = [
            {"name": g.name, "phone": g.phone, "email": g.email} for g in guardians
        ]

        # Alert guardians if they exist
        alert_summary = {}
        if guardians_list:
            alert_summary = alert_guardians_on_deepfake_detection(
                user_id=user_id,
                user_name=user_name,
                user_email=user_email,
                guardians=guardians_list,
                deepfake_score=deepfake_score,
                platforms=platforms_list,
                filename=filename,
                report_id=reporter.report_id,
                urls=urls_list,
            )

        return {
            "status": "success",
            "message": "Complete takedown package generated",
            "report_id": reporter.report_id,
            "package_documents": {
                "master_forensic": package.get("master"),
                "platform_complaints": {
                    k: v for k, v in package.items() if k.startswith("platform_")
                },
                "police_complaint": package.get("police_complaint"),
                "evidence_bundle": package.get("evidence_bundle"),
                "lawyer_brief": package.get("lawyer_brief"),
            },
            "guardian_alerts": {
                "total_guardians": len(guardians_list),
                "alerts_sent": alert_summary.get("sent_sms", 0)
                + alert_summary.get("sent_email", 0),
                "delivery_summary": alert_summary.get("delivery_log", []),
            },
            "next_steps": [
                "1. Download all documents from /downloads/{report_id}",
                "2. Review platform-specific complaints",
                "3. Submit to cybercrime.gov.in for police FIR",
                "4. Contact a lawyer with evidence bundle",
                "5. Guardians have been notified and can provide support",
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/download-report/{report_name}")
async def download_report(report_name: str):
    """Download any generated takedown report"""
    safe_report_name = os.path.basename(report_name)
    report_path = os.path.join(UPLOAD_DIR, safe_report_name)
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not found")

    return FileResponse(

        path=
        report_path,

        filename=
        safe_name,

        media_type=
        "application/pdf"
    )


@app.post("/sos")
async def trigger_sos():

    send_sos_message()

    return {

        "status":

        "success"
    }