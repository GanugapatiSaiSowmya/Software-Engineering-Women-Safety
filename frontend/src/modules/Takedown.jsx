import { useState, useEffect } from "react";
import axios from "axios";
import { FileText, ShieldAlert, Gavel, Scale, AlertTriangle, Download, CheckCircle, Smartphone } from "lucide-react";

const API = "http://127.0.0.1:8000";

const EVIDENCE_STEPS = [
  { label: "Analyzing deepfake signature", threshold: 25 },
  { label: "Generating forensic report", threshold: 50 },
  { label: "Creating platform complaints", threshold: 75 },
  { label: "Alerting trusted guardians", threshold: 100 },
];

export default function Takedown() {
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
    const token = localStorage.getItem("shield_token");
    const email = localStorage.getItem("shield_user_email");
    const name = localStorage.getItem("shield_user_name");

    if (token && email && name) {
      setUserInfo({ token, email, name, id: email.split("@")[0] });
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Generate Alert Report
  // ─────────────────────────────────────────────────────────────────────────
  const buildEvidence = async () => {
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

        if (p < 25) setActiveStep(0);
        else if (p < 50) setActiveStep(1);
        else if (p < 75) setActiveStep(2);
        else setActiveStep(3);

        return p + 5;
      });
    }, 80);

    if (userInfo && sampleDeepfakeData) {
      try {
        const formData = new FormData();
        formData.append("user_id", userInfo.id);
        formData.append("user_email", userInfo.email);
        formData.append("user_name", userInfo.name);
        formData.append("filename", sampleDeepfakeData.filename);
        formData.append("deepfake_score", sampleDeepfakeData.deepfake_score);
        formData.append("gps_data", sampleDeepfakeData.gps_data);

        const response = await axios.post(`${API}/takedown/alert`, formData);

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

      downloadAllDocuments(response.data.package_documents);

    } catch (error) {
      console.error("Error:", error);
      alert("Error generating takedown package: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
    if (documents.master_forensic) downloadFile(documents.master_forensic, "Master_Forensic_Report.pdf");
    Object.entries(documents.platform_complaints || {}).forEach(([key, value]) => {
      downloadFile(value, `${key.replace("platform_", "").toUpperCase()}_Complaint.pdf`);
    });
    if (documents.police_complaint) downloadFile(documents.police_complaint, "Police_FIR_Complaint.pdf");
    if (documents.evidence_bundle) downloadFile(documents.evidence_bundle, "Evidence_Bundle.pdf");
    if (documents.lawyer_brief) downloadFile(documents.lawyer_brief, "Lawyer_Brief.pdf");
  };

  const downloadAlert = () => {
    if (reports.alert) {
      downloadFile(reports.alert, "Deepfake_Alert_Report.pdf");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, paddingBottom: 40 }}>
      {/* LEFT: Evidence Bundle Generator */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
          <FileText size={20} color="var(--neon-teal)" />
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, color: "#fff" }}>EVIDENCE BUNDLE GENERATOR</span>
        </div>

        <div style={{ padding: 32, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>
            {EVIDENCE_STEPS.map((s, i) => {
              const isPast = progress >= s.threshold;
              const isActive = building && !isPast && (i === activeStep);
              
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative", zIndex: 2 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: `2px solid ${isPast ? "var(--neon-teal)" : isActive ? "var(--warning-orange)" : "var(--slate-800)"}`,
                    background: isPast ? "var(--neon-teal-dim)" : "var(--bg-navy-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isPast ? "var(--neon-teal)" : isActive ? "var(--warning-orange)" : "var(--slate-500)",
                    transition: "all 0.4s ease", boxShadow: isActive ? "0 0 15px rgba(255, 153, 0, 0.2)" : "none"
                  }}>
                    {isPast ? <CheckCircle size={16} /> : i + 1}
                  </div>

                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontSize: 14, color: isPast || isActive ? "#fff" : "var(--slate-400)", fontWeight: isActive ? 600 : 400, transition: "color 0.4s" }}>
                      {s.label}
                    </div>
                    {isActive && <div style={{ fontSize: 12, color: "var(--warning-orange)", marginTop: 4 }}>Processing...</div>}
                  </div>
                </div>
              );
            })}
            {/* Connecting line */}
            <div style={{ position: "absolute", top: 20, left: 15, width: 2, height: "calc(100% - 40px)", background: "var(--slate-800)", zIndex: 1 }} />
            <div style={{ position: "absolute", top: 20, left: 15, width: 2, height: `${Math.max(0, progress - 10)}%`, background: "var(--neon-teal)", zIndex: 1, transition: "height 0.4s linear", boxShadow: "0 0 10px var(--neon-teal)" }} />
          </div>

          <div style={{ marginTop: 40 }}>
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--slate-300)", marginBottom: 12 }}>
              <span>{built ? "BUNDLE READY" : building ? "COMPILING EVIDENCE..." : "READY TO INITIALIZE"}</span>
              <span style={{ color: "var(--neon-teal)" }}>{progress}%</span>
            </div>

            <div style={{ height: 6, borderRadius: 3, background: "var(--slate-800)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--neon-teal)", transition: "width 0.1s linear", boxShadow: "0 0 10px var(--neon-teal)" }} />
            </div>
          </div>

          {!building && !built && (
            <button
              onClick={buildEvidence}
              className="glass-card"
              style={{
                marginTop: 32, width: "100%", padding: 16, background: "var(--neon-teal)", color: "var(--bg-navy)", 
                border: "none", fontSize: 14, fontWeight: 700, letterSpacing: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "pointer", transition: "all 0.3s", boxShadow: "0 0 20px rgba(0, 255, 204, 0.2)"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 255, 204, 0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 255, 204, 0.2)"; }}
            >
              <FileText size={20} />
              COMPILE EVIDENCE BUNDLE
            </button>
          )}

          {built && (
            <div style={{ marginTop: 32, padding: "16px", borderRadius: 8, background: "var(--neon-teal-dim)", border: "1px solid var(--neon-teal)", display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle size={20} color="var(--neon-teal)" />
              <div style={{ fontSize: 13, color: "var(--neon-teal)", fontWeight: 600 }}>Forensic Alert Report Generated</div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Case Details & Actions */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
          <Gavel size={20} color="var(--warning-orange)" />
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, color: "#fff" }}>CASE DETAILS & ACTIONS</span>
        </div>

        <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {hasDeepfake && deepfakeData ? (
            <>
              {/* Deepfake Detected Section */}
              <div className="glass-card-red" style={{ padding: 20, background: "var(--danger-red-dim)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <AlertTriangle size={24} color="var(--danger-red)" />
                  <div style={{ fontSize: 14, color: "var(--danger-red)", fontWeight: 700, letterSpacing: 1 }}>DEEPFAKE SIGNATURE DETECTED</div>
                </div>
                
                <div className="mono" style={{ fontSize: 12, color: "var(--slate-300)", lineHeight: 1.8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12 }}>
                    <span style={{ color: "var(--slate-400)" }}>Target File:</span>
                    <span>{deepfakeData.filename}</span>
                    <span style={{ color: "var(--slate-400)" }}>Confidence:</span>
                    <span style={{ color: "var(--danger-red)", fontWeight: 600 }}>{(deepfakeData.deepfake_score * 100).toFixed(1)}% MATCH</span>
                    <span style={{ color: "var(--slate-400)" }}>Location:</span>
                    <span>{deepfakeData.gps_data || "N/A"}</span>
                  </div>
                </div>

                {built && (
                  <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <button
                      onClick={downloadAlert}
                      style={{
                        flex: 1, padding: "12px", borderRadius: 8, background: "transparent", border: "1px solid var(--danger-red)", color: "var(--danger-red)",
                        fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,51,51,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <Download size={16} /> DOWNLOAD ALERT
                    </button>

                    <button
                      onClick={() => setShowPlatformModal(true)}
                      style={{
                        flex: 1, padding: "12px", borderRadius: 8, background: "var(--danger-red)", border: "none", color: "#fff",
                        fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", boxShadow: "0 0 15px rgba(255,51,51,0.3)"
                      }}
                    >
                      <Scale size={16} /> PROCEED TO TAKEDOWN
                    </button>
                  </div>
                )}
              </div>
              
              {/* Guardian Alerts Section */}
              {guardianAlerts && (
                <div className="glass-card-teal" style={{ padding: 20, background: "var(--neon-teal-dim)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Smartphone size={20} color="var(--neon-teal)" />
                    <div style={{ fontSize: 13, color: "var(--neon-teal)", fontWeight: 700, letterSpacing: 1 }}>GUARDIANS NOTIFIED</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--slate-300)", lineHeight: 1.6 }}>
                    Emergency alerts transmitted to <strong>{guardianAlerts.total_guardians}</strong> trusted contacts.
                    {guardianAlerts.total_guardians > 0 && (
                      <div className="mono" style={{ marginTop: 8, display: "flex", gap: 24, fontSize: 11, color: "var(--neon-teal)" }}>
                        <span>SMS: {guardianAlerts.alerts_sent} DELIVERED</span>
                        <span>EMAIL: {guardianAlerts.alerts_sent} DELIVERED</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Package Ready Section */}
              {Object.keys(reports).length > 1 && (
                <div className="glass-card-teal" style={{ padding: 20, background: "var(--neon-teal-dim)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <ShieldAlert size={20} color="var(--neon-teal)" />
                    <div style={{ fontSize: 13, color: "var(--neon-teal)", fontWeight: 700, letterSpacing: 1 }}>TAKEDOWN PACKAGE READY</div>
                  </div>
                  <ul className="mono" style={{ fontSize: 12, color: "var(--slate-300)", lineHeight: 2, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                    <li style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--neon-teal)" }}>[✓]</span> Master Forensic Report</li>
                    <li style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--neon-teal)" }}>[✓]</span> Platform Complaints ({Object.keys(reports.platform_complaints || {}).length})</li>
                    <li style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--neon-teal)" }}>[✓]</span> Police FIR Document</li>
                    <li style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--neon-teal)" }}>[✓]</span> Evidence Bundle</li>
                    <li style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--neon-teal)" }}>[✓]</span> Lawyer Brief</li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16, textAlign: "center" }}>
              <FileText size={48} color="var(--slate-800)" />
              <div style={{ fontSize: 12, color: "var(--slate-500)", maxWidth: 220 }}>Compile an evidence bundle to unlock case details and legal actions.</div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Platform Selection */}
      {showPlatformModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10, 15, 26, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowPlatformModal(false)}>
          <div className="glass-card" style={{ padding: 32, maxWidth: 480, width: "100%", borderTop: "4px solid var(--danger-red)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
              <Scale size={24} color="var(--danger-red)" />
              TARGET PLATFORMS
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "var(--slate-400)", marginBottom: 12, fontWeight: 500 }}>Select Platforms to Issue Takedowns:</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {["instagram", "twitter", "facebook", "youtube", "tiktok"].map((platform) => (
                  <label key={platform} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "var(--bg-navy-light)", padding: "10px 14px", borderRadius: 6, border: `1px solid ${platforms.includes(platform) ? "var(--danger-red)" : "var(--slate-800)"}` }}>
                    <input type="checkbox" checked={platforms.includes(platform)} onChange={(e) => {
                      if (e.target.checked) setPlatforms([...platforms, platform]);
                      else setPlatforms(platforms.filter((p) => p !== platform));
                    }} style={{ cursor: "pointer", accentColor: "var(--danger-red)" }} />
                    <span style={{ fontSize: 13, color: platforms.includes(platform) ? "#fff" : "var(--slate-400)" }}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, color: "var(--slate-400)", marginBottom: 12, fontWeight: 500 }}>Target URLs (One per line):</div>
              <textarea
                value={urls} onChange={(e) => setUrls(e.target.value)}
                placeholder="https://instagram.com/p/xxx&#10;https://twitter.com/xxx"
                className="mono"
                style={{
                  width: "100%", height: 120, padding: 16, borderRadius: 8, border: "1px solid var(--slate-800)",
                  background: "var(--bg-navy)", color: "var(--neon-teal)", fontSize: 12, resize: "vertical", outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={() => setShowPlatformModal(false)}
                style={{ flex: 1, padding: 14, borderRadius: 8, background: "transparent", border: "1px solid var(--slate-800)", color: "var(--slate-300)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                CANCEL
              </button>
              
              <button
                onClick={proceedToFullTakedown} disabled={loading}
                style={{ flex: 2, padding: 14, borderRadius: 8, background: "var(--danger-red)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {loading ? "GENERATING..." : "GENERATE LEGAL PACKAGE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}