import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const CHECKS = ["GPS Metadata", "Background Objects", "Similarity Check", "Deepfake Score"];

export default function UploadGuard() {
  const t = useTheme();
  const [dragging, setDragging]   = useState(false);
  const [file, setFile]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed]   = useState(false);
  const [gpsStripped, setGps]     = useState(false);
  const [realGps, setRealGps]     = useState("");
  const [toast, setToast]         = useState(null);
  const toastTimer                = useRef(null);

  useEffect(() => {
    return () => { 
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl); 
    };
  }, [previewUrl]);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const selectedFile = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!selectedFile) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    
    setAnalyzing(true);
    setAnalyzed(false);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRealGps(response.data.coordinates || "");
      if (response.data.gps_found) setGps(false);
      else setGps(true);
      setAnalyzing(false);
      setAnalyzed(true);
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("Error: Backend not connected.", "error");
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRealGps(res.data.coordinates || "");
      if (res.data.gps_found) {
        setGps(false);
        showToast("GPS still present after strip attempt.", "info");
      } else {
        setGps(true);
        showToast("GPS stripped successfully.", "success");
      }
      setAnalyzed(true);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Error stripping GPS metadata.";
      showToast(message, "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const toastColor = toast?.type === "success" ? t.green : toast?.type === "error" ? t.red : t.borderMid;

  // Helper for white background in light mode
  const getCardBg = (statusColor) => {
    if (t.dark) return `${statusColor}06`; // Tinted dark in dark mode
    return "#FFFFFF"; // Pure white in light mode
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999 }}>
          <div style={{ padding: "10px 20px", minWidth: 240, textAlign: "center", color: "#fff", borderRadius: 8, background: toastColor, boxShadow: `0 6px 18px ${toastColor}44`, fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
            {toast.msg}
          </div>
        </div>
      )}

      {/* Drop zone (LEFT SIDE) */}
      <div style={{ ...card(t), background: t.dark ? undefined : "#FFFFFF" }}>
        <div style={cardTitle(t)}><span style={dot(t.amber)} />PRE-FLIGHT SANITIZER</div>
        <label
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{ 
            display: "block", 
            marginTop: 16, 
            border: `2px dashed ${dragging ? t.green : t.borderMid}`, 
            borderRadius: 12, 
            padding: previewUrl ? "20px" : "40px 20px", 
            textAlign: "center", 
            cursor: "pointer", 
            background: dragging ? `${t.green}0a` : "transparent", 
            transition: "all 0.3s" 
          }}
        >
          <input type="file" accept="image/*" onChange={handleDrop} style={{ display: "none" }} />
          
          {previewUrl ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: "100%", height: "180px", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", borderRadius: 8, background: t.dark ? `${t.bg}33` : "#f8fafc" }}>
                <img 
                  src={previewUrl} 
                  alt="Upload preview" 
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
                />
              </div>
              <div style={{ color: t.textDim, fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: 1, wordBreak: "break-all" }}>
                {file?.name}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 8, color: t.textDim }}>⬡</div>
              <div style={{ color: t.textDim, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Drop photo here or click to select</div>
              <div style={{ color: t.textFaint, fontSize: 11, marginTop: 4 }}>All processing is local — no uploads</div>
            </>
          )}
        </label>

        {analyzing && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: t.textMid, marginBottom: 8 }}>Running pre-flight checks…</div>
            {CHECKS.map((check, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: t.border, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: t.green, animation: `grow ${0.5 + i * 0.3}s ease-out forwards`, width: 0 }} />
                </div>
                <span style={{ fontSize: 11, color: t.textDim, width: 120 }}>{check}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results (RIGHT SIDE) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {analyzed && (
          <>
            {/* GPS Card */}
            <div style={{ 
              ...card(t), 
              border: `1px solid ${gpsStripped ? t.green + "44" : t.red + "44"}`, 
              background: getCardBg(gpsStripped ? t.green : t.red) 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={cardTitle(t)}><span style={dot(gpsStripped ? t.green : t.red)} />GPS DETECTED</div>
                  <div style={{ fontSize: 11, color: gpsStripped ? t.green : t.red, marginTop: 4 }}>
                    {gpsStripped ? "✓ Location data removed" : (realGps ? `📍 ${realGps}` : "📍 GPS metadata detected")}
                  </div>
                </div>
                {!gpsStripped && <button onClick={handleStripGps} style={actionBtn(t.red)}>STRIP GPS</button>}
              </div>
            </div>

            {/* Sensitive Objects Card */}
            <div style={{ 
              ...card(t), 
              border: `1px solid ${t.amber}44`, 
              background: getCardBg(t.amber) 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={cardTitle(t)}><span style={dot(t.amber)} />SENSITIVE OBJECTS</div>
                  <div style={{ fontSize: 11, color: t.amber, marginTop: 4 }}>⚠ Diploma visible · House number in reflection</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <button style={{ ...actionBtn(t.amber), opacity: 0.4, cursor: "not-allowed" }} disabled>SMART BLUR</button>
                </div>
              </div>
            </div>

            {/* Similarity Check Card */}
            <div style={{ 
              ...card(t), 
              border: `1px solid ${t.green}44`, 
              background: getCardBg(t.green) 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={cardTitle(t)}><span style={dot(t.green)} />SIMILARITY CHECK</div>
                  <div style={{ fontSize: 11, color: t.green, marginTop: 4 }}>✓ No matches found in high-risk databases</div>
                </div>
              </div>
            </div>
          </>
        )}

        {!analyzed && !analyzing && (
          <div style={{ ...card(t), background: t.dark ? undefined : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240, flexDirection: "column", gap: 12, color: t.textFaint }}>
            <div style={{ fontSize: 40 }}>◈</div>
            <div style={{ fontSize: 12, letterSpacing: 1.5 }}>AWAITING PHOTO</div>
          </div>
        )}
      </div>
    </div>
  );
}