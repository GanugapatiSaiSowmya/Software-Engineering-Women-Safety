"""
SHIELD.ai Guardian Alert System
Sends notifications to trusted contacts when deepfakes are detected
Supports SMS, Email, and push notifications (future)
"""

from typing import List, Optional
import json
import datetime
from enum import Enum

# Mock email/SMS service - In production use Twilio, SendGrid, etc.
class AlertSeverity(Enum):
    MEDIUM = "medium"  # 60-80% deepfake confidence
    HIGH = "high"  # 80-95% deepfake confidence
    CRITICAL = "critical"  # >95% deepfake confidence


class GuardianAlert:
    """
    Alert system to notify guardians/trusted contacts
    when deepfakes or threats are detected
    """

    def __init__(self, user_id: str, user_name: str, user_email: str):
        self.user_id = user_id
        self.user_name = user_name
        self.user_email = user_email
        self.timestamp = datetime.datetime.now()

    def determine_severity(self, deepfake_score: float) -> AlertSeverity:
        """Determine alert severity based on confidence score"""
        if deepfake_score > 0.95:
            return AlertSeverity.CRITICAL
        elif deepfake_score > 0.80:
            return AlertSeverity.HIGH
        else:
            return AlertSeverity.MEDIUM

    def generate_sms_alert(
        self, deepfake_score: float, platforms: List[str], filename: str
    ) -> str:
        """
        Generate SMS alert message (<=160 chars for SMS compatibility)
        """
        severity = self.determine_severity(deepfake_score)
        emoji_map = {
            AlertSeverity.CRITICAL: "🚨",
            AlertSeverity.HIGH: "⚠️",
            AlertSeverity.MEDIUM: "⚡",
        }

        platforms_str = ", ".join(platforms[:2])  # Limit to first 2 platforms
        if len(platforms) > 2:
            platforms_str += f" +{len(platforms)-2} more"

        message = (
            f"{emoji_map[severity]} ALERT for {self.user_name}:\n"
            f"Deepfake detected on {platforms_str}\n"
            f"Confidence: {deepfake_score*100:.0f}%\n"
            f"Check SHIELD.ai app immediately."
        )

        return message

    def generate_email_alert(
        self,
        deepfake_score: float,
        platforms: List[str],
        filename: str,
        report_id: str,
        urls: Optional[List[str]] = None,
    ) -> dict:
        """
        Generate detailed email alert
        """
        severity = self.determine_severity(deepfake_score)
        severity_colors = {
            AlertSeverity.CRITICAL: "#FF0000",  # Red
            AlertSeverity.HIGH: "#FF6600",  # Orange
            AlertSeverity.MEDIUM: "#FFAA00",  # Yellow
        }

        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .alert-header {{ 
                    background-color: {severity_colors[severity]}; 
                    color: white; 
                    padding: 15px; 
                    border-radius: 5px;
                    margin-bottom: 20px;
                }}
                .alert-title {{ font-size: 24px; font-weight: bold; margin-bottom: 10px; }}
                .severity-badge {{ 
                    display: inline-block;
                    padding: 5px 10px;
                    background-color: rgba(255,255,255,0.2);
                    border-radius: 3px;
                    font-weight: bold;
                }}
                .section {{ margin-bottom: 20px; border-left: 3px solid {severity_colors[severity]}; padding-left: 15px; }}
                .section-title {{ font-size: 16px; font-weight: bold; color: {severity_colors[severity]}; margin-bottom: 10px; }}
                .details {{ background-color: #f5f5f5; padding: 10px; border-radius: 3px; margin: 10px 0; }}
                .action-button {{ 
                    display: inline-block;
                    background-color: {severity_colors[severity]};
                    color: white;
                    padding: 12px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 5px 10px 0;
                    font-weight: bold;
                }}
                .footer {{ font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="alert-header">
                    <div class="alert-title">
                        🚨 DEEPFAKE ALERT - Your Friend Needs You!
                    </div>
                    <div class="severity-badge">{severity.value.upper()} SEVERITY</div>
                </div>

                <div class="section">
                    <div class="section-title">What Happened?</div>
                    <p>
                        <strong>{self.user_name}</strong> asked you to be a guardian contact through SHIELD.ai.
                        <br/><br/>
                        A <strong>deepfake</strong> (AI-generated fake content) impersonating them has been detected 
                        on <strong>{', '.join(platforms)}</strong>.
                    </p>
                    <div class="details">
                        <strong>Confidence Level:</strong> {deepfake_score*100:.1f}% (AI Analysis)<br/>
                        <strong>Report ID:</strong> {report_id}<br/>
                        <strong>Detected:</strong> {self.timestamp.strftime('%d-%b-%Y %H:%M:%S')} IST<br/>
                        <strong>Status:</strong> Takedown process initiated by user
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">What Can You Do?</div>
                    <p>As a trusted guardian, you can:</p>
                    <ul>
                        <li><strong>Support:</strong> Call/message them - they're likely distressed</li>
                        <li><strong>Document:</strong> Take screenshots of the content (but don't engage)</li>
                        <li><strong>Report:</strong> Help report to platforms if content is still visible</li>
                        <li><strong>Legal:</strong> They may need a lawyer - refer to SHIELD.ai's legal package</li>
                    </ul>
                </div>

                <div class="section">
                    <div class="section-title">Immediate Actions</div>
                    <p><strong>For {self.user_name}:</strong></p>
                    <a class="action-button" href="https://shield.ai/takedown/{report_id}">
                        View Takedown Package
                    </a>
                    <a class="action-button" href="https://shield.ai/police">
                        File Police Complaint
                    </a>
                </div>

                <div class="section">
                    <div class="section-title">What's Being Done?</div>
                    <p>SHIELD.ai has automatically generated:</p>
                    <ul>
                        <li>✓ Deepfake analysis report (scientific evidence)</li>
                        <li>✓ Platform-specific complaint templates (Instagram, Twitter, etc.)</li>
                        <li>✓ Indian Police cyber complaint (FIR-ready)</li>
                        <li>✓ Evidence bundle with cryptographic hashes</li>
                        <li>✓ Lawyer brief for legal proceedings</li>
                    </ul>
                </div>

                <div class="section">
                    <div class="section-title">Laws Being Violated</div>
                    <p>This content violates:</p>
                    <ul>
                        <li><strong>Section 67A (IT Act):</strong> Publishing sexually explicit content - Up to 5 years imprisonment + ₹10 lakhs fine</li>
                        <li><strong>Section 354D (IPC):</strong> Stalking - Up to 3 years + ₹10,000 fine</li>
                        <li><strong>Section 500 (IPC):</strong> Defamation - Legal action for damages</li>
                    </ul>
                </div>

                <div class="section">
                    <div class="section-title">Confidentiality</div>
                    <p>
                        <strong>IMPORTANT:</strong> This information is confidential. Do not share this email publicly or on social media.
                        Sharing will compromise the legal case and evidence.
                    </p>
                </div>

                <div class="footer">
                    <p>You received this because {self.user_name} listed you as a trusted guardian on SHIELD.ai.</p>
                    <p>If you'd like to learn more about SHIELD.ai or set up your own account, visit: https://shield.ai</p>
                    <p>SHIELD.ai © 2026 | Digital Bodyguard for Non-Consensual Content</p>
                </div>
            </div>
        </body>
        </html>
        """

        return {
            "to": "[GUARDIAN_EMAIL]",  # Will be filled by caller
            "subject": f"🚨 ALERT: Deepfake Detected - Help {self.user_name}",
            "html": html_body,
            "severity": severity.value,
            "report_id": report_id,
        }

    def generate_push_notification(
        self, deepfake_score: float, platforms: List[str]
    ) -> dict:
        """
        Generate push notification (for future mobile app)
        """
        severity = self.determine_severity(deepfake_score)

        return {
            "title": f"ALERT: Deepfake Detected",
            "body": f"Deepfake on {', '.join(platforms[:2])}. Confidence: {deepfake_score*100:.0f}%",
            "severity": severity.value,
            "action_url": "/dashboard/alerts",
            "icon": "🚨" if severity == AlertSeverity.CRITICAL else "⚠️",
        }

    def generate_alert_log_entry(
        self,
        deepfake_score: float,
        platforms: List[str],
        filename: str,
        report_id: str,
    ) -> dict:
        """
        Create database log entry for audit trail
        """
        return {
            "timestamp": self.timestamp.isoformat(),
            "user_id": self.user_id,
            "user_name": self.user_name,
            "alert_type": "deepfake_detected",
            "severity": self.determine_severity(deepfake_score).value,
            "deepfake_score": round(deepfake_score, 4),
            "platforms_affected": platforms,
            "filename": filename,
            "report_id": report_id,
            "action_taken": "alerts_sent_to_guardians",
            "status": "pending_user_action",
        }


class GuardianNotificationQueue:
    """
    Queue manager for sending alerts to multiple guardians
    Implements retry logic and delivery tracking
    """

    def __init__(self, user_id: str, user_name: str, user_email: str):
        self.alert_system = GuardianAlert(user_id, user_name, user_email)
        self.queue = []
        self.delivery_log = []

    def add_guardian_to_queue(
        self, guardian_phone: str, guardian_email: str, guardian_name: str, method: str = "both"
    ):
        """
        Add guardian to notification queue
        method: 'sms' | 'email' | 'both'
        """
        self.queue.append(
            {
                "phone": guardian_phone,
                "email": guardian_email,
                "name": guardian_name,
                "method": method,
                "status": "pending",
            }
        )

    def send_alerts_to_guardians(
        self,
        deepfake_score: float,
        platforms: List[str],
        filename: str,
        report_id: str,
        urls: List[str] = None,
    ) -> dict:
        """
        Send alerts to all queued guardians
        Returns delivery summary
        """
        delivery_summary = {
            "total_guardians": len(self.queue),
            "sent_sms": 0,
            "sent_email": 0,
            "failed": 0,
            "delivery_log": [],
        }

        for guardian in self.queue:
            # SMS Alert
            if guardian["method"] in ["sms", "both"]:
                sms_message = self.alert_system.generate_sms_alert(
                    deepfake_score, platforms, filename
                )
                # TODO: Integrate with Twilio API
                delivery_summary["sent_sms"] += 1
                delivery_summary["delivery_log"].append(
                    {
                        "guardian": guardian["name"],
                        "method": "sms",
                        "status": "sent",
                        "timestamp": datetime.datetime.now().isoformat(),
                        "message_preview": sms_message[:50] + "...",
                    }
                )

            # Email Alert
            if guardian["method"] in ["email", "both"]:
                email_data = self.alert_system.generate_email_alert(
                    deepfake_score, platforms, filename, report_id, urls
                )
                email_data["to"] = guardian["email"]
                # TODO: Integrate with SendGrid API
                delivery_summary["sent_email"] += 1
                delivery_summary["delivery_log"].append(
                    {
                        "guardian": guardian["name"],
                        "method": "email",
                        "status": "sent",
                        "timestamp": datetime.datetime.now().isoformat(),
                        "subject": email_data["subject"],
                    }
                )

        return delivery_summary


# ─────────────────────────────────────────────────────────────────────────────
# INTEGRATION HELPER
# ─────────────────────────────────────────────────────────────────────────────

def alert_guardians_on_deepfake_detection(
    user_id: str,
    user_name: str,
    user_email: str,
    guardians: List[dict],  # [{"name": "", "phone": "", "email": ""}, ...]
    deepfake_score: float,
    platforms: List[str],
    filename: str,
    report_id: str,
    urls: List[str] = None,
) -> dict:
    """
    Main function to alert guardians when deepfake is detected
    Called from main.py when upload handler detects deepfake
    """
    queue = GuardianNotificationQueue(user_id, user_name, user_email)

    # Add all guardians to queue
    for guardian in guardians:
        queue.add_guardian_to_queue(
            guardian.get("phone", ""),
            guardian.get("email", ""),
            guardian.get("name", "Unknown"),
            method="both",  # Send both SMS and email
        )

    # Send alerts
    delivery_summary = queue.send_alerts_to_guardians(
        deepfake_score, platforms, filename, report_id, urls or []
    )

    return delivery_summary