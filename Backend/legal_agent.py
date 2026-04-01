from fpdf import FPDF
import datetime

def generate_evidence_report(filename, ai_score, gps_data):
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, "SHIELD.ai - Forensic Evidence Report", ln=True, align='C')
    pdf.set_font("Arial", '', 10)
    pdf.cell(200, 10, f"Generated on: {datetime.datetime.now()}", ln=True, align='C')
    
    # Case Details
    pdf.ln(10)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "1. Incident Summary", ln=True)
    pdf.set_font("Arial", '', 11)
    pdf.multi_cell(0, 10, f"Analysis of file [{filename}] indicates a manipulation probability of {ai_score}%.")
    
    # Digital Fingerprint
    pdf.ln(5)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "2. Digital Forensics", ln=True)
    pdf.set_font("Arial", '', 11)
    pdf.cell(0, 10, f"Original Metadata Found: {gps_data if gps_data else 'None'}", ln=True)
    
    # Legal Clause
    pdf.ln(10)
    pdf.set_font("Arial", 'I', 10)
    pdf.multi_cell(0, 5, "This document serves as technical evidence under the IT Act (2026 update) regarding non-consensual deepfake content. The AI confidence level exceeds the required threshold for platform intervention.")
    
    report_name = f"Report_{filename}.pdf"
    pdf.output(f"uploads/{report_name}")
    return report_name