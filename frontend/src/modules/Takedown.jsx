import { useState, useEffect } from "react";
import axios from "axios";
import RiskBadge from "../components/RiskBadge";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { CASES } from "../utils/data";
import { useTheme } from "../context/ThemeContext";

const API = "http://127.0.0.1:8000";

const EVIDENCE_STEPS = [
  { label: "Analyzing deepfake signature", threshold: 25 },
  { label: "Generating forensic report", threshold: 50 },
  { label: "Creating platform complaints", threshold: 75 },
  { label: "Alerting trusted guardians", threshold: 100 },
];

export default function Takedown() {
  const t = useTheme();
  const [progress, setProgress] = useState(0);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);
  const [hasDeepfake, setHasDeepfake] = useState(false);
  const [deepfakeData, setDeepfakeData] = useState(null);
  const [reports, setReports] = useState({});
  const [guardianAlerts, setGuardianAlerts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [urls, setUrls] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Fetch user info from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");

    if (token && email && name) {
      setUserInfo({ token, email, name, id: email.split("@")[0] });
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Generate Alert Report
  // ─────────────────────────────────────────────────────────────────────────
  const buildEvidence = async () => {
    console.log("BUILD EVIDENCE CLICKED");
    // Simulate: Check if there's a recent deepfake from uploads
    // In real app, this would come from UploadGuard context
    const sampleDeepfakeData = {
      filename: "suspicious_video.mp4",
      deepfake_score: 0.87,
      gps_data: "28.6139°N, 77.2090°E",
    };

    setDeepfakeData(sampleDeepfakeData);
    setHasDeepfake(true);
    setBuilding(true);
    setProgress(0);
    setActiveStep(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setBuilding(false);
          setBuilt(true);
          return 100;
        }

        // Update active step based on progress
        if (p < 25) setActiveStep(0);
        else if (p < 50) setActiveStep(1);
        else if (p < 75) setActiveStep(2);
        else setActiveStep(3);

        return p + 5;
      });
    }, 80);

    // Actually call backend to generate alert
    if (userInfo && sampleDeepfakeData) {
      try {
        const formData = new FormData();
        formData.append("user_id", userInfo.id);
        formData.append("user_email", userInfo.email);
        formData.append("user_name", userInfo.name);
        formData.append("filename", sampleDeepfakeData.filename);
        formData.append("deepfake_score", sampleDeepfakeData.deepfake_score);
        formData.append("gps_data", sampleDeepfakeData.gps_data);

        console.log("BUILD EVIDENCE CLICKED");
        console.log(userInfo);
        console.log("Sending request...");

        const response = await axios.post(
          `${API}/takedown/alert`,
          formData
        );

        if (response.data.alert_report) {
          setReports((prev) => ({
            ...prev,
            alert: response.data.alert_report,
          }));
        }
      } catch (error) {
        console.error("Error generating alert:", error);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Proceed to Full Takedown
  // ─────────────────────────────────────────────────────────────────────────
  const proceedToFullTakedown = async () => {
    if (!platforms.length || !urls.trim()) {
      alert("Please select platforms and enter URLs");
      return;
    }

    if (!userInfo) {
      alert("Error: User information not found. Please refresh the page and log in again.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", userInfo.id);
      formData.append("user_email", userInfo.email);
      formData.append("user_name", userInfo.name);
      formData.append("filename", deepfakeData.filename);
      formData.append("deepfake_score", deepfakeData.deepfake_score);
      formData.append("gps_data", deepfakeData.gps_data);
      formData.append("platforms", JSON.stringify(platforms));
      formData.append(
        "urls",
        JSON.stringify(urls.split("\n").filter((u) => u.trim()))
      );

      const response = await axios.post(
        `${API}/takedown/generate-package`,
        formData
      );

      setReports(response.data.package_documents);
      setGuardianAlerts(response.data.guardian_alerts);
      setShowPlatformModal(false);

      // Download all documents
      downloadAllDocuments(response.data.package_documents);

      alert(
        `✅ Takedown package generated!\n\nAlerts sent to ${response.data.guardian_alerts.total_guardians} guardians.`
      );
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating takedown package: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Helper: Download documents
  // ─────────────────────────────────────────────────────────────────────────
  const downloadFile = (filename, displayName) => {
    const url = `${API}/download-report/${filename}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllDocuments = (documents) => {
    if (documents.master_forensic) {
      downloadFile(documents.master_forensic, "Master_Forensic_Report.pdf");
    }
    // Platform complaints
    Object.entries(documents.platform_complaints || {}).forEach(([key, value]) => {
      downloadFile(
        value,
        `${key.replace("platform_", "").toUpperCase()}_Complaint.pdf`
      );
    });
    if (documents.police_complaint) {
      downloadFile(documents.police_complaint, "Police_FIR_Complaint.pdf");
    }
    if (documents.evidence_bundle) {
      downloadFile(documents.evidence_bundle, "Evidence_Bundle.pdf");
    }
    if (documents.lawyer_brief) {
      downloadFile(documents.lawyer_brief, "Lawyer_Brief.pdf");
    }
  };

  const downloadAlert = () => {
    if (reports.alert) {
      downloadFile(reports.alert, "Deepfake_Alert_Report.pdf");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN UI
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* LEFT: Evidence Bundle Generator */}
      <div style={{ ...card(t) }}>
        
        <div
        style={{
          ...cardTitle(t),
          display: "flex",
          alignItems: "center",
          gap: 10
        }}
      >
        <span style={dot(t.red)} />

        <span>
          EVIDENCE BUNDLE GENERATOR
        </span>

        <span
          style={{
            fontSize: 9,
            padding: "3px 8px",
            borderRadius: 20,
            background: `${t.amber}22`,
            border: `1px solid ${t.amber}`,
            color: t.amber,
            fontWeight: 700,
            letterSpacing: 1
          }}
        >
          BETA
        </span>
      </div>

        <div style={{ marginTop: 20 }}>
          {EVIDENCE_STEPS.map((s, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${progress >= s.threshold ? t.green : t.borderMid}`,
                  background: progress >= s.threshold ? `${t.green}22` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: t.green,
                  transition: "all 0.4s",
                  flexShrink: 0,
                }}
              >
                {progress >= s.threshold ? "✓" : i + 1}
              </div>

              <div
                style={{
                  fontSize: 12,
                  transition: "color 0.4s",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                marginBottom: 6,
              }}
            >
              <span>{built ? "Bundle ready" : "Building bundle…"}</span>
              <span>{progress}%</span>
            </div>

            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: t.border,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${t.green}, #06d6a0)`,
                  borderRadius: 3,
                  transition: "width 0.1s",
                }}
              />
            </div>
          </div>

          {!building && !built && (
            <button
              onClick={buildEvidence}
              style={{
                ...actionBtn(t.green),
                marginTop: 20,
                width: "100%",
                padding: "12px",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              ⊕ BUILD EVIDENCE BUNDLE
            </button>
          )}

          {built && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 16px",
                borderRadius: 8,
                background: `${t.green}14`,
                border: `1px solid ${t.green}`,
                fontSize: 12,
                color: t.green,
              }}
            >
              ✓ Alert report ready — Review & proceed
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Case Details & Actions */}
      <div style={{ ...card(t)}}>
        <div style={{ ...cardTitle(t)}}>
          <span style={dot(t.amber)} />
          CASE DETAILS & ACTIONS
        </div>

        {/* Deepfake Detected Section */}
        {hasDeepfake && deepfakeData && (
          <div
            style={{
              marginTop: 16,
              padding: "14px",
              borderRadius: 8,
              background: `${t.red}0d`,
              border: `1px solid ${t.red}22`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#dcd4d4",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              ⚠️ DEEPFAKE DETECTED
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#dcd4d4",
                lineHeight: 1.6,
                marginBottom: 10,
              }}
            >
              <div>
                <strong>File:</strong> {deepfakeData.filename}
              </div>
              <div>
                <strong>Confidence:</strong> {(deepfakeData.deepfake_score * 100).toFixed(1)}%
              </div>
              <div>
                <strong>Location:</strong> {deepfakeData.gps_data || "N/A"}
              </div>
            </div>

            {built && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={downloadAlert}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: t.amber,
                    color: "#000",
                    fontSize: 10,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  📥 Download Alert
                </button>

                <button
                  onClick={() => setShowPlatformModal(true)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: t.red,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  ⚖️ Proceed to Takedown
                </button>
              </div>
            )}
          </div>
        )}

        {/* Guardian Alerts Section */}
        {guardianAlerts && (
          <div
            style={{
              marginTop: 16,
              padding: "14px",
              borderRadius: 8,
              background: `${t.green}0d`,
              border: `1px solid ${t.green}22`,
            }}
          >
            <div style={{ fontSize: 11, color: t.green, marginBottom: 8, fontWeight: 700 }}>
              ✓ GUARDIANS NOTIFIED
            </div>
            <div style={{ fontSize: 10, color: "#dcd4d4", lineHeight: 1.6 }}>
              Alerts sent to <strong>{guardianAlerts.total_guardians}</strong> trusted contacts
              {guardianAlerts.total_guardians > 0 && (
                <>
                  <br />
                  📱 SMS: {guardianAlerts.alerts_sent} sent
                  <br />
                  📧 Emails: {guardianAlerts.alerts_sent} sent
                </>
              )}
            </div>
          </div>
        )}

        {/* Package Ready Section */}
        {Object.keys(reports).length > 1 && (
          <div
            style={{
              marginTop: 16,
              padding: "14px",
              borderRadius: 8,
              background: `${t.green}0d`,
              border: `1px solid ${t.green}22`,
            }}
          >
            <div style={{ fontSize: 11, color: t.green, marginBottom: 8, fontWeight: 700 }}>
              ✓ TAKEDOWN PACKAGE READY
            </div>
            <div style={{ fontSize: 10, color: "#dcd4d4", lineHeight: 1.6 }}>
              All documents generated:
              <br />✓ Master Forensic Report
              <br />✓ Platform Complaints (5)
              <br />✓ Police FIR Document
              <br />✓ Evidence Bundle
              <br />✓ Lawyer Brief
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasDeepfake && (
          <div
            style={{
              marginTop: 16,
              fontSize: 10,
              color: t.textFaint,
              textAlign: "center",
              padding: "20px",
            }}
          >
            Click "Build Evidence Bundle" to analyze a deepfake and generate legal documents.
          </div>
        )}
      </div>

      {/* MODAL: Platform Selection */}
      {showPlatformModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setShowPlatformModal(false)}
        >
          <div
            style={{
              background: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              padding: "24px",
              maxWidth: 500,
              maxHeight: "80vh",
              overflow: "auto",
              fontFamily: "'Courier New', monospace",
              color: t.text,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: t.green }}>
              Select Platforms & Enter URLs
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8 }}>
                Which platforms should we target?
              </div>
              {["instagram", "twitter", "facebook", "youtube", "tiktok"].map((platform) => (
                <label
                  key={platform}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPlatforms([...platforms, platform]);
                      } else {
                        setPlatforms(platforms.filter((p) => p !== platform));
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 11 }}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8 }}>
                Paste URLs (one per line):
              </div>
              <textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://instagram.com/video1&#10;https://twitter.com/video2"
                style={{
                  width: "100%",
                  height: 100,
                  padding: "10px",
                  borderRadius: 6,
                  border: `1px solid ${t.borderMid}`,
                  background: t.input,
                  color: t.text,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10,
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={proceedToFullTakedown}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 6,
                  background: t.green,
                  color: "#000",
                  fontSize: 11,
                  fontWeight: 700,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Generating…" : "Generate Full Package"}
              </button>

              <button
                onClick={() => setShowPlatformModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 6,
                  background: "transparent",
                  color: t.textDim,
                  fontSize: 11,
                  border: `1px solid ${t.borderMid}`,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
