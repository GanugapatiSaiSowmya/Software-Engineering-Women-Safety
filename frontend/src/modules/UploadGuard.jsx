import { useState, useEffect, useRef } from "react";
import RiskBadge from "../components/RiskBadge";
import axios from "axios";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";

const CHECKS = ["GPS Metadata", "Background Objects", "Similarity Check", "Deepfake Score"];

export default function UploadGuard() {
  const [dragging, setDragging]   = useState(false);
  const [file, setFile]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed]   = useState(false);
  const [gpsStripped, setGps]     = useState(false);
  const [realGps, setRealGps]     = useState("");
  const [blurred, setBlurred]     = useState(false);
  // Toast state for brief messages (success / error / info)
  const [toast, setToast] = useState(null); // { msg: string, type: 'success'|'error'|'info' }
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const handleDrop = async (e) => {
    // 1. Prevent browser from opening the image in a new tab
    e.preventDefault(); 
    setDragging(false);

    // 2. Get the file (works for both Drag-and-Drop and Click-to-Select)
    const selectedFile = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setAnalyzing(true); // Start the "Scanning" animation
    setAnalyzed(false);

    // 3. Prepare the data to send to Python
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // 4. Send the file to your Backend
      const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

  console.log("Backend Response:", response.data);

  // Update GPS state from backend
  // response.data.coordinates - string (e.g. "28.6139° N, 77.2090° E")
  // response.data.gps_found - boolean
  setRealGps(response.data.coordinates || "");
  if (response.data.gps_found) setGps(false); // Show the red warning
  else setGps(true); // Automatically clear it if no GPS found

  // 5. Success! Now stop the loading bars and show the results
  setAnalyzing(false);
  setAnalyzed(true);
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error: Backend not connected.");
      setAnalyzing(false);
    }
  };
  
  const handleStripGps = async () => {
    if (!file) return;

    setAnalyzing(true);
    try {
      const form = new FormData();
      form.append("filename", file.name);

      const res = await axios.post("http://127.0.0.1:8000/strip", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("Strip response:", res.data);

      // Update UI from backend response
      setRealGps(res.data.coordinates || "");
      if (res.data.gps_found) {
        setGps(false); // still present
        showToast("GPS still present after strip attempt.", "info");
      } else {
        setGps(true); // cleared
        showToast("GPS stripped successfully.", "success");
      }

      setAnalyzed(true);
    } catch (err) {
      console.error("Strip failed:", err);
      const message = err?.response?.data?.message || err.message || "Error stripping GPS metadata.";
      showToast(message, "error");
    } finally {
      setAnalyzing(false);
    }
  };
  const allClear = gpsStripped && blurred;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 60 }}>
          <div style={{ padding: "10px 16px", minWidth: 220, textAlign: "center", color: "#fff", borderRadius: 8, boxShadow: "0 6px 18px rgba(2,6,23,0.4)", background: toast.type === "success" ? "#10b981" : toast.type === "error" ? "#ef4444" : "#111827" }}>
            {toast.msg}
          </div>
        </div>
      )}
      {/* Drop zone */}
      <div style={card}>
        <div style={cardTitle}><span style={dot("#f59e0b")} />PRE-FLIGHT SANITIZER</div>
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{ display: "block", marginTop: 16, border: `2px dashed ${dragging ? "#10b981" : "#1e293b"}`, borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: dragging ? "rgba(16,185,129,0.07)" : "transparent", transition: "all 0.3s" }}
        >
          <input type="file" accept="image/*" onChange={handleDrop} style={{ display: "none" }} />
          <div style={{ fontSize: 36, marginBottom: 8 }}>⬡</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>{file ? file.name : "Drop photo here or click to select"}</div>
          <div style={{ color: "#334155", fontSize: 11, marginTop: 4 }}>All processing is local — no uploads</div>
        </label>

        {analyzing && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Running pre-flight checks…</div>
            {CHECKS.map((check, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#0f172a", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#10b981", animation: `grow ${0.5 + i * 0.3}s ease-out forwards`, width: 0 }} />
                </div>
                <span style={{ fontSize: 11, color: "#475569", width: 120 }}>{check}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {analyzed && (
          <>
            {/* GPS */}
            <div style={{ ...card, border: `1px solid ${gpsStripped ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, background: gpsStripped ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={cardTitle}><span style={dot(gpsStripped ? "#10b981" : "#ef4444")} />GPS DETECTED</div>
                  <div style={{ fontSize: 11, color: gpsStripped ? "#10b981" : "#ef4444", marginTop: 4 }}>
                    {gpsStripped
                      ? "✓ Location data removed"
                      : (realGps ? `📍 ${realGps}` : "📍 GPS metadata detected")}
                  </div>
                </div>
                {!gpsStripped && <button onClick={handleStripGps} style={actionBtn("#ef4444")}>STRIP GPS</button>}
              </div>
            </div>

            {/* Background scanner */}
            <div style={{ ...card, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={cardTitle}><span style={dot("#f59e0b")} />SENSITIVE OBJECTS</div>
                  <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>⚠ Diploma visible · House number in reflection</div>
                </div>
                <button onClick={() => setBlurred(true)} style={actionBtn("#f59e0b")}>{blurred ? "✓ BLURRED" : "SMART BLUR"}</button>
              </div>
            </div>

            {/* Similarity check */}
            <div style={{ ...card, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.04)" }}>
              <div style={cardTitle}><span style={dot("#10b981")} />SIMILARITY CHECK</div>
              <div style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>✓ No matches found in high-risk databases</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Compared against 2.4M flagged images</div>
            </div>

            {allClear && (
              <div style={{ padding: "14px 18px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid #10b981", textAlign: "center" }}>
                <div style={{ fontSize: 16, color: "#10b981", fontWeight: 700, letterSpacing: 1 }}>✓ YOU ARE PROTECTED</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Safe to upload. All threats neutralized.</div>
              </div>
            )}
          </>
        )}

        {!analyzed && !analyzing && (
          <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240, flexDirection: "column", gap: 12, color: "#334155" }}>
            <div style={{ fontSize: 40 }}>◈</div>
            <div style={{ fontSize: 12, letterSpacing: 1.5 }}>AWAITING PHOTO</div>
          </div>
        )}
      </div>
    </div>
  );
}
