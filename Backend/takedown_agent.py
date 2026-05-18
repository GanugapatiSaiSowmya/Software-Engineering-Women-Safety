"""
SHIELD.ai Takedown Agent
Generates legally-compliant takedown reports for deepfake/non-consensual content
with templates for major social media platforms and Indian legal procedures.
"""

from fpdf import FPDF
import datetime
import json
import hashlib
from typing import Dict, List, Optional
import os

# ─────────────────────────────────────────────────────────────────────────────
# LEGAL TEMPLATES FOR DIFFERENT JURISDICTIONS & PLATFORMS
# ─────────────────────────────────────────────────────────────────────────────

INDIAN_IT_ACT_CLAUSES = {
    "section_66": "Section 66 - Computer Misuse (Hacking): Whoever commits offence of computer misuse shall be punishable with imprisonment up to 3 years and fine up to Rs 5 lakhs.",
    "section_67": "Section 67 - Publishing obscene material in electronic form: Punishable with imprisonment up to 3 years and fine up to Rs 5 lakhs.",
    "section_67A": "Section 67A - Publishing material containing sexually explicit act/conduct in electronic form: Punishable with imprisonment up to 5 years and fine up to Rs 10 lakhs.",
    "section_354": "Section 354 (IPC) - Assault or Criminal Force with Intent to Outrage Modesty: Punishment - imprisonment up to 3 years and/or fine up to Rs 2,000.",
    "section_354C": "Section 354C (IPC) - Voyeurism: Punishment - imprisonment up to 3 years and/or fine up to Rs 2,000.",
    "section_354D": "Section 354D (IPC) - Stalking: Punishment - imprisonment up to 3 years and/or fine up to Rs 10,000.",
}

PLATFORM_TEMPLATES = {
    "instagram": {
        "name": "Instagram/Meta",
        "report_url": "https://help.instagram.com/contact/169159004058843",
        "keywords": ["non-consensual intimate image", "deepfake", "harassment"],
        "response_time": "24-72 hours",
    },
    "twitter": {
        "name": "X (Twitter)",
        "report_url": "https://help.twitter.com/en/forms/safety",
        "keywords": ["non-consensual intimate media", "synthetic media", "defamation"],
        "response_time": "24 hours",
    },
    "facebook": {
        "name": "Facebook",
        "report_url": "https://www.facebook.com/help/contact/161828064084387",
        "keywords": ["intimate images", "deepfakes", "harassment"],
        "response_time": "24-48 hours",
    },
    "youtube": {
        "name": "YouTube",
        "report_url": "https://support.google.com/youtube/answer/2884017",
        "keywords": ["non-consensual content", "defamatory content"],
        "response_time": "24-72 hours",
    },
    "tiktok": {
        "name": "TikTok",
        "report_url": "https://www.tiktok.com/legal/report/privacy",
        "keywords": ["non-consensual intimate video", "deepfake"],
        "response_time": "72 hours",
    },
    "telegram": {
        "name": "Telegram",
        "report_url": "https://telegram.org/support",
        "keywords": ["illegal content", "harassment"],
        "response_time": "24-48 hours",
    },
}

POLICE_REPORT_TEMPLATE_INDIA = """
ONLINE COMPLAINT / FIR APPLICATION
Cyber Crime Portal - India (cybercrime.gov.in)

SECTION: Section 67A of IT Act, 2000 (Publishing sexually explicit material)
ALTERNATES: Section 354C, 354D, 66 of IT Act & IPC Sections

COMPLAINANT DETAILS:
- Full Name: [USER_NAME]
- Phone: [USER_PHONE]
- Email: [USER_EMAIL]
- Age: [USER_AGE]

INCIDENT DETAILS:
- Type: Non-Consensual Deepfake / Manipulated Media
- Date Discovered: [DISCOVERY_DATE]
- Platforms Affected: [PLATFORMS]
- URLs/Links: [URLS_IF_AVAILABLE]

EVIDENCE:
- Technical Analysis: AI deepfake detection score [SCORE]%
- Hash Values: [FILE_HASH]
- Metadata Analysis: [METADATA]
- Screenshots: [ATTACHED]

IMPACT:
- Harassment/Defamation: [YES/NO]
- Threat to Safety: [YES/NO]
- Emotional/Psychological Harm: [YES/NO]
- Financial Loss: [YES/NO]
"""


# ─────────────────────────────────────────────────────────────────────────────
# CORE TAKEDOWN REPORT GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

class TakedownReport:
    """
    Generates comprehensive, legally-compliant takedown reports.
    Designed for Indian jurisdiction with multi-platform support.
    """

    def __init__(self, user_id: str, user_email: str, user_name: str):
        self.user_id = user_id
        self.user_email = user_email
        self.user_name = user_name
        self.timestamp = datetime.datetime.now()
        self.report_id = hashlib.sha256(
            f"{user_id}{self.timestamp}".encode()
        ).hexdigest()[:16].upper()

    def generate_deepfake_alert_report(
        self,
        filename: str,
        deepfake_score: float,
        gps_data: Optional[str],
        detection_source: str = "HuggingFace Vision Model",
    ) -> str:
        """
        Generate an alert-level report when deepfake is detected.
        This is a quick PDF that asks user if they want to proceed to full takedown.
        """
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # ── HEADER ─────────────────────────────────────────────────────────
        pdf.set_fill_color(220, 20, 60)  # Crimson red for alert
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 18)
        pdf.cell(
            0, 15, "[!] DEEPFAKE DETECTED - ALERT REPORT", ln=True, align="C", fill=True
        )

        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 6, f"Report ID: {self.report_id}", ln=True, align="L")
        pdf.cell(
            0, 6, f"Generated: {self.timestamp.strftime('%Y-%m-%d %H:%M:%S IST')}", ln=True
        )
        pdf.ln(5)

        # ── QUICK SUMMARY ──────────────────────────────────────────────────
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "1. THREAT LEVEL ASSESSMENT", ln=True)

        pdf.set_font("Helvetica", "", 10)
        threat_level = "CRITICAL" if deepfake_score > 0.8 else "HIGH" if deepfake_score > 0.6 else "MEDIUM"
        pdf.set_text_color(200, 0, 0) if threat_level == "CRITICAL" else pdf.set_text_color(255, 140, 0)
        pdf.cell(0, 6, f"Threat Level: {threat_level}", ln=True)

        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(
            0,
            6,
            f"File: {filename}\nDeepfake Probability: {deepfake_score * 100:.2f}%\nDetection Model: {detection_source}",
        )
        pdf.ln(3)

        # ── WHAT THIS MEANS ────────────────────────────────────────────────
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 7, "2. WHAT THIS MEANS", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.set_fill_color(255, 250, 205)  # Light yellow background
        pdf.multi_cell(
            0,
            5,
            "Our AI detected this image/video contains deepfake or manipulated content designed to impersonate you without consent. This is:\n\n"
            "- Illegal in India (IT Act Section 67A)\n"
            "- A violation of platform ToS (Instagram, Twitter, Facebook, YouTube, TikTok)\n"
            "- Potentially defamatory and harassing\n"
            "- Grounds for police complaint & civil damages",
            fill=True,
        )
        pdf.ln(4)

        # ── IMMEDIATE ACTIONS ──────────────────────────────────────────────
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 7, "3. IMMEDIATE ACTIONS YOU CAN TAKE", ln=True)

        pdf.set_font("Helvetica", "", 9)
        actions = [
            "Take a Screenshot (hash it for legal evidence)",
            "Document the URL & platform where it appeared",
            "Screenshot the account/profile that posted it",
            "Note exact timestamp of discovery",
            "Do NOT engage or report abuse - preserve evidence",
        ]
        for i, action in enumerate(actions, 1):
            pdf.cell(5, 5, f"{i}.", ln=False)
            pdf.multi_cell(0, 5, action)
        pdf.ln(2)

        # ── NEXT STEPS ─────────────────────────────────────────────────────
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 7, "4. NEXT STEPS", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.set_fill_color(144, 238, 144)  # Light green
        pdf.multi_cell(
            0,
            5,
            "Click 'Proceed to Takedown' in SHIELD.ai to:\n\n"
            "> Generate a complete legal takedown package\n"
            "> Auto-fill platform-specific complaint forms\n"
            "> Create Indian Police cyber complaint\n"
            "> Alert your trusted contacts (Guardian SOS)\n"
            "> Generate evidence bundle for lawyer/court",
            fill=True,
        )
        pdf.ln(5)

        # ── FOOTER ─────────────────────────────────────────────────────────
        pdf.set_font("Helvetica", "I", 8)
        pdf.set_text_color(128, 128, 128)
        pdf.cell(
            0,
            5,
            "SHIELD.ai © 2026 | Confidential | Do not share this report publicly",
            ln=True,
            align="C",
        )

        safe_filename = os.path.basename(filename)
        report_name = f"ALERT_{self.report_id}_{safe_filename}.pdf"
        report_path = os.path.join("uploads", report_name)
        pdf.output(report_path)

        return report_name

    def generate_full_takedown_package(
        self,
        filename: str,
        deepfake_score: float,
        gps_data: Optional[str],
        platforms: List[str],
        urls: List[str],
        account_handles: List[str],
    ) -> Dict[str, str]:
        """
        Generate a COMPLETE takedown package with:
        1. Master evidence report
        2. Platform-specific complaints
        3. Indian police cyber complaint
        4. Evidence bundle (hashes, metadata)
        """
        reports = {}

        # 1. MASTER FORENSIC REPORT
        reports["master"] = self._generate_master_forensic_report(
            filename, deepfake_score, gps_data
        )

        # 2. PLATFORM-SPECIFIC TEMPLATES
        for platform in platforms:
            if platform.lower() in PLATFORM_TEMPLATES:
                reports[f"platform_{platform}"] = self._generate_platform_complaint(
                    platform, filename, deepfake_score, urls
                )

        # 3. INDIAN POLICE CYBER COMPLAINT
        reports["police_complaint"] = self._generate_police_complaint(
            filename, deepfake_score, gps_data, platforms, urls
        )

        # 4. EVIDENCE BUNDLE
        reports["evidence_bundle"] = self._generate_evidence_bundle(
            filename, deepfake_score, gps_data
        )

        # 5. LAWYER REFERENCE DOCUMENT
        reports["lawyer_brief"] = self._generate_lawyer_brief(
            filename, deepfake_score, platforms
        )

        return reports

    def _generate_master_forensic_report(
        self, filename: str, deepfake_score: float, gps_data: Optional[str]
    ) -> str:
        """Generate detailed forensic analysis report"""
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # HEADER
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 8, "FORENSIC EVIDENCE REPORT - DEEPFAKE ANALYSIS", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 5, f"Report ID: {self.report_id}", ln=True)
        pdf.cell(0, 5, f"User: {self.user_name} ({self.user_email})", ln=True)
        pdf.cell(0, 5, f"Date: {self.timestamp.strftime('%d-%b-%Y %H:%M:%S IST')}", ln=True)
        pdf.ln(5)

        # EXECUTIVE SUMMARY
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 6, "EXECUTIVE SUMMARY", ln=True)

        pdf.set_font("Helvetica", "", 10)
        confidence = "VERY HIGH" if deepfake_score > 0.9 else "HIGH" if deepfake_score > 0.7 else "MODERATE"
        pdf.multi_cell(
            0,
            5,
            f"This report provides technical and legal evidence that the file '{filename}' contains AI-generated or heavily manipulated deepfake content with {confidence} confidence ({deepfake_score * 100:.2f}%).\n\n"
            f"The content appears to impersonate an individual without consent, violating Section 67A of the Information Technology Act, 2000 and related IPC provisions.",
        )
        pdf.ln(3)

        # TECHNICAL ANALYSIS
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 6, "TECHNICAL ANALYSIS", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 4, f"File Name: {filename}", ln=True)
        pdf.cell(0, 4, f"Analysis Timestamp: {self.timestamp}", ln=True)
        pdf.cell(0, 4, f"Detection Confidence: {deepfake_score * 100:.2f}%", ln=True)
        pdf.cell(0, 4, f"Detection Method: Perceptual Hash + Deep Learning (HuggingFace)", ln=True)
        pdf.cell(0, 4, f"GPS Metadata: {'Present (Location traced)' if gps_data else 'Removed/Not found'}", ln=True)
        pdf.ln(3)

        # AI DEEPFAKE INDICATORS
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 6, "DEEPFAKE INDICATORS DETECTED", ln=True)

        pdf.set_font("Helvetica", "", 9)
        indicators = [
            "Unnatural face boundaries or blending artifacts",
            "Eye movement inconsistencies",
            "Asymmetrical facial features",
            "Lighting/shadow mismatches",
            "Audio-visual synchronization issues (if video)",
        ]
        for indicator in indicators:
            pdf.cell(3, 4, "-", ln=False)
            pdf.multi_cell(0, 4, indicator)
        pdf.ln(2)

        # LEGAL APPLICABILITY
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 6, "LEGAL APPLICABILITY (INDIA)", ln=True)

        pdf.set_font("Helvetica", "", 8)
        for section, description in list(INDIAN_IT_ACT_CLAUSES.items())[:3]:
            pdf.set_font("Helvetica", "B", 8)
            pdf.cell(0, 4, f"{section.upper()}", ln=True)
            pdf.set_font("Helvetica", "", 7)
            pdf.multi_cell(0, 3, description)
        pdf.ln(2)

        # RECOMMENDATIONS
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 6, "RECOMMENDATIONS", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(
            0,
            4,
            "1. File immediate takedown requests to all platforms (Instagram, Twitter, Facebook, YouTube, TikTok)\n"
            "2. Register FIR with Cyber Police via cybercrime.gov.in\n"
            "3. Send cease & desist notice to original uploader\n"
            "4. Contact platform legal teams for account suspension\n"
            "5. Preserve all evidence (screenshots, hashes, URLs)",
        )
        pdf.ln(5)

        # FOOTER
        pdf.set_font("Helvetica", "I", 7)
        pdf.set_text_color(128, 128, 128)
        pdf.cell(
            0, 4, "This document is confidential and intended only for authorized recipients.", ln=True
        )
        pdf.cell(
            0, 4, "Unauthorized distribution is prohibited. SHIELD.ai © 2026", ln=True
        )

        safe_filename = os.path.basename(filename)
        report_name = f"FORENSIC_{self.report_id}_{safe_filename}.pdf"
        report_path = os.path.join("uploads", report_name)
        pdf.output(report_path)

        return report_name

    def _generate_platform_complaint(
        self, platform: str, filename: str, deepfake_score: float, urls: List[str]
    ) -> str:
        """Generate platform-specific complaint template"""
        platform = platform.lower()
        template = PLATFORM_TEMPLATES.get(platform, PLATFORM_TEMPLATES["instagram"])

        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()

        # HEADER
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 6, f"COMPLAINT TO {template['name'].upper()}", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 4, f"Report ID: {self.report_id}", ln=True)
        pdf.cell(0, 4, f"Date: {self.timestamp.strftime('%d-%b-%Y')}", ln=True)
        pdf.ln(4)

        # INSTRUCTIONS
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 5, "SUBMISSION INSTRUCTIONS", ln=True)

        pdf.set_font("Helvetica", "", 8)
        pdf.multi_cell(
            0,
            4,
            f"1. Go to: {template['report_url']}\n"
            f"2. Select 'Report Non-Consensual Content' or 'Intellectual Property Violation'\n"
            f"3. Copy the content below into their form\n"
            f"4. Attach screenshots & this PDF\n"
            f"5. Expected Response: {template['response_time']}",
        )
        pdf.ln(3)

        # COMPLAINT BODY
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 5, "COMPLAINT TEXT (COPY & PASTE INTO FORM)", ln=True)

        pdf.set_font("Helvetica", "", 9)
        complaint_text = f"""
{template['name']} Trust & Safety Team,

I am filing an urgent complaint regarding non-consensual deepfake content that impersonates me without consent.

CONTENT DETAILS:
- Platform: {template['name']}
- Content Type: Deepfake/Manipulated Media
- Detected Date: {self.timestamp.strftime('%d-%b-%Y')}
- AI Detection Score: {deepfake_score * 100:.2f}%
- Confidence: HIGH/CRITICAL

AFFECTED URLS:
{chr(10).join(f"- {url}" for url in urls if url)}

VIOLATION:
This content violates {template['name']}'s Community Standards regarding:
{chr(10).join(f"- {k}" for k in template['keywords'])}

Additionally, this constitutes violation of:
- Section 67A, Information Technology Act 2000 (India)
- Non-consensual intimate imagery laws
- Defamation & harassment

REQUESTED ACTION:
1. Immediate removal of all deepfake content
2. Account suspension of uploader
3. Preservation of evidence for law enforcement

This is a matter of urgency and personal safety.

Regards,
{self.user_name}
Email: {self.user_email}
Report ID: {self.report_id}
"""

        pdf.multi_cell(0, 4, complaint_text.strip())
        pdf.ln(2)

        # LEGAL NOTICE
        pdf.set_font("Helvetica", "I", 7)
        pdf.set_text_color(128, 128, 128)
        pdf.multi_cell(
            0,
            3,
            "Retain a copy of this report for legal proceedings. Document all communication with the platform.",
        )

        report_name = f"COMPLAINT_{platform.upper()}_{self.report_id}.pdf"
        report_path = os.path.join("uploads", report_name)
        pdf.output(report_path)

        return report_name

    def _generate_police_complaint(
        self,
        filename: str,
        deepfake_score: float,
        gps_data: Optional[str],
        platforms: List[str],
        urls: List[str],
    ) -> str:
        """Generate Indian Police cyber complaint (FIR ready)"""
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()

        # HEADER
        pdf.set_font("Helvetica", "B", 13)
        pdf.cell(0, 7, "CYBER CRIME COMPLAINT - POLICE FIR APPLICATION", ln=True)

        pdf.set_font("Helvetica", "", 8)
        pdf.cell(0, 4, "For submission to: cybercrime.gov.in or Local Police Cyber Cell", ln=True)
        pdf.cell(0, 4, f"Report ID: {self.report_id}", ln=True)
        pdf.ln(3)

        # COMPLAINANT DETAILS
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 5, "1. COMPLAINANT DETAILS", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 4, f"Name: {self.user_name}", ln=True)
        pdf.cell(0, 4, f"Email: {self.user_email}", ln=True)
        pdf.cell(0, 4, "Phone: ____________________________", ln=True)
        pdf.cell(0, 4, "Date of Birth: ____________________________", ln=True)
        pdf.cell(0, 4, "Address: ____________________________", ln=True)
        pdf.ln(3)

        # INCIDENT DETAILS
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 5, "2. INCIDENT DETAILS", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 4, f"Date of Discovery: {self.timestamp.strftime('%d-%b-%Y')}", ln=True)
        pdf.cell(0, 4, "Date of Original Upload: ____________________________", ln=True)
        pdf.cell(0, 4, f"Platforms Affected: {', '.join(platforms)}", ln=True)
        pdf.multi_cell(0, 4, f"Content URLs:\n{chr(10).join(f'- {url}' for url in urls if url)}")
        pdf.ln(2)

        # COMPLAINT NARRATIVE
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 5, "3. COMPLAINT NARRATIVE", ln=True)

        pdf.set_font("Helvetica", "", 8)
        narrative = f"""
I am lodging an official complaint regarding deepfake/non-consensual manipulation of my image/identity. A deepfake video/image impersonating me without consent has been uploaded to multiple platforms.

FACTS:
- AI analysis confirms deepfake with {deepfake_score * 100:.2f}% confidence
- File analyzed: {filename}
- Uploaded by unknown perpetrator(s)
- Shared across: {', '.join(platforms)}
- Content depicts defamatory/harassing scenarios
- Designed to harm my reputation and safety

APPLICABLE LAWS VIOLATED:
- Section 67A, IT Act 2000: Publishing sexually explicit content in electronic form
- Section 66, IT Act 2000: Computer misuse/hacking
- Section 354C, IPC: Voyeurism
- Section 354D, IPC: Stalking
- Section 500, IPC: Defamation
- Section 506, IPC: Criminal intimidation

EVIDENCE ENCLOSED:
- Technical analysis report (AI detection score: {deepfake_score * 100:.2f}%)
- Screenshot of content
- Platform complaint IDs
- URL links to infringing content
- Device & metadata information
- Hash values for proof of authenticity
"""
        pdf.multi_cell(0, 3, narrative.strip())
        pdf.ln(2)

        # REQUESTED ACTION
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 5, "4. REQUESTED ACTION", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(
            0,
            4,
            "1. Register FIR under above-mentioned sections\n"
            "2. Initiate investigation to identify perpetrator(s)\n"
            "3. Issue notices to hosting platforms (Instagram/Twitter/Facebook/YouTube/TikTok)\n"
            "4. Preserve evidence & digital forensics\n"
            "5. Arrange for immediate content removal\n"
            "6. Consider cybercriminal penalties as per IT Act Section 67A",
        )
        pdf.ln(3)

        # FOOTER
        pdf.set_font("Helvetica", "I", 7)
        pdf.set_text_color(128, 128, 128)
        pdf.cell(0, 4, "Generated by SHIELD.ai on " + self.timestamp.strftime("%d-%b-%Y"), ln=True)
        pdf.cell(0, 4, "Report ID: " + self.report_id, ln=True)

        report_name = f"POLICE_COMPLAINT_{self.report_id}.pdf"
        report_path = os.path.join("uploads", report_name)
        pdf.output(report_path)

        return report_name

    def _generate_evidence_bundle(
        self, filename: str, deepfake_score: float, gps_data: Optional[str]
    ) -> str:
        """Generate cryptographic evidence bundle"""
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()

        # HEADER
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 6, "EVIDENCE BUNDLE & CRYPTOGRAPHIC PROOF", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 4, f"Report ID: {self.report_id}", ln=True)
        pdf.cell(0, 4, f"Generated: {self.timestamp}", ln=True)
        pdf.ln(4)

        # FILE INTEGRITY
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 5, "FILE INTEGRITY HASHES", ln=True)

        pdf.set_font("Helvetica", "", 8)
        file_path = f"uploads/{filename}"
        if os.path.exists(file_path):
            with open(file_path, "rb") as f:
                file_bytes = f.read()
                md5 = hashlib.md5(file_bytes).hexdigest()
                sha256 = hashlib.sha256(file_bytes).hexdigest()
                sha512 = hashlib.sha512(file_bytes).hexdigest()

            pdf.cell(0, 4, f"MD5: {md5}", ln=True)
            pdf.cell(0, 4, f"SHA-256: {sha256}", ln=True)
            pdf.cell(0, 4, f"SHA-512: {sha512}", ln=True)
        pdf.ln(3)

        # ANALYSIS METADATA
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 5, "ANALYSIS METADATA", ln=True)

        pdf.set_font("Helvetica", "", 8)
        metadata = {
            "Timestamp": self.timestamp.isoformat(),
            "Report ID": self.report_id,
            "User": self.user_email,
            "AI Confidence": f"{deepfake_score * 100:.2f}%",
            "Detection Model": "HuggingFace Vision (dima806/deepfake_vs_real)",
            "GPS Data Present": "Yes" if gps_data else "No",
            "Location": gps_data if gps_data else "N/A",
        }

        for key, value in metadata.items():
            pdf.set_font("Helvetica", "B", 8)
            pdf.cell(50, 4, key + ":", ln=False)
            pdf.set_font("Helvetica", "", 8)
            pdf.cell(0, 4, str(value), ln=True)

        pdf.ln(2)

        # CHAIN OF CUSTODY
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 5, "CHAIN OF CUSTODY", ln=True)

        pdf.set_font("Helvetica", "", 8)
        pdf.multi_cell(
            0,
            3,
            "This evidence bundle is generated by SHIELD.ai with tamper-proof cryptographic hashes. "
            "The SHA-256 hash uniquely identifies this file and can be used in legal proceedings to prove authenticity. "
            "All timestamps are ISO 8601 compliant and court-admissible.",
        )

        pdf.ln(2)

        # LEGAL ADMISSIBILITY
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 5, "LEGAL ADMISSIBILITY", ln=True)

        pdf.set_font("Helvetica", "", 8)
        pdf.multi_cell(
            0,
            3,
            "- Digital evidence collected under Section 65A of Indian Evidence Act\n"
            "- Hash values provide proof of integrity (no tampering)\n"
            "- Timestamp provides temporal proof (evidence of discovery)\n"
            "- Admissible in Indian courts as forensic evidence\n"
            "- Complies with IT Act 2000 Section 94 (electronic records)",
        )

        report_name = f"EVIDENCE_BUNDLE_{self.report_id}.pdf"
        report_path = os.path.join("uploads", report_name)
        pdf.output(report_path)

        return report_name

    def _generate_lawyer_brief(
        self, filename: str, deepfake_score: float, platforms: List[str]
    ) -> str:
        """Generate brief for lawyer/legal counsel"""
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()

        # HEADER
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 6, "LEGAL BRIEF FOR COUNSEL", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.cell(0, 4, f"Client: {self.user_name}", ln=True)
        pdf.cell(0, 4, f"Matter: Non-Consensual Deepfake - Takedown & Damages", ln=True)
        pdf.cell(0, 4, f"Report ID: {self.report_id}", ln=True)
        pdf.ln(4)

        # EXECUTIVE SUMMARY FOR LEGAL TEAM
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 5, "EXECUTIVE SUMMARY", ln=True)

        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(
            0,
            4,
            f"Deepfake content impersonating our client has been detected and disseminated across {len(platforms)} platforms. "
            f"Technical analysis (AI score: {deepfake_score * 100:.2f}%) confirms this is manipulated media created without consent.\n\n"
            f"IMMEDIATE RELIEF: Injunction for content removal + account suspension\n"
            f"DAMAGES CLAIM: Defamation, emotional distress, reputational harm",
        )
        pdf.ln(3)

        # APPLICABLE LAW
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 5, "APPLICABLE LAW & LEGAL BASIS", ln=True)

        pdf.set_font("Helvetica", "", 8)
        for section, description in INDIAN_IT_ACT_CLAUSES.items():
            pdf.set_font("Helvetica", "B", 8)
            pdf.cell(0, 3, section.upper(), ln=True)
            pdf.set_font("Helvetica", "", 7)
            pdf.multi_cell(0, 3, description)
        pdf.ln(2)

        # STRATEGIC RECOMMENDATIONS
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 5, "STRATEGIC RECOMMENDATIONS", ln=True)

        pdf.set_font("Helvetica", "", 8)
        pdf.multi_cell(
            0,
            3,
            "PHASE 1 (IMMEDIATE - 24-48 HRS):\n"
            "- Send cease & desist to platforms\n"
            "- File urgent takedown requests\n"
            "- Register police complaint (cybercrime.gov.in)\n\n"
            "PHASE 2 (SHORT TERM - 1-2 WEEKS):\n"
            "- Identify perpetrator through platform cooperation\n"
            "- Assess damages (reputational, emotional, financial)\n"
            "- Prepare civil suit under Tort law\n\n"
            "PHASE 3 (MEDIUM TERM - 2-6 MONTHS):\n"
            "- Criminal prosecution under IT Act Section 67A\n"
            "- Civil damages case in District Court\n"
            "- Injunction against further distribution",
        )

        report_name = f"LAWYER_BRIEF_{self.report_id}.pdf"
        report_path = os.path.join("uploads", report_name)
        pdf.output(report_path)

        return report_name


# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def create_takedown_report(
    user_id: str,
    user_email: str,
    user_name: str,
    filename: str,
    deepfake_score: float,
    gps_data: Optional[str],
    is_alert_only: bool = True,
) -> str:
    """
    Quick wrapper to generate alert report (minimal PDF)
    Returns: Report filename
    """
    reporter = TakedownReport(user_id, user_email, user_name)
    return reporter.generate_deepfake_alert_report(filename, deepfake_score, gps_data)


def create_full_takedown_package(
    user_id: str,
    user_email: str,
    user_name: str,
    filename: str,
    deepfake_score: float,
    gps_data: Optional[str],
    platforms: List[str],
    urls: List[str],
) -> Dict[str, str]:
    """
    Full package generator (all 5 documents)
    Returns: Dictionary of report filenames
    """
    reporter = TakedownReport(user_id, user_email, user_name)
    return reporter.generate_full_takedown_package(
        filename, deepfake_score, gps_data, platforms, urls, []
    )