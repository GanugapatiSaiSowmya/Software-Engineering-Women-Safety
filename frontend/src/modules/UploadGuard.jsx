import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const CHECKS = [
  "GPS Metadata Extraction",
  "Adversarial Noise Injection",
  "Digital Watermark Embedding",
  "Honey-Pixel Traps",
];

export default function UploadGuard() {
  const t = useTheme();
  const [dragging, setDragging]       = useState(false);
  const [file, setFile]               = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [analyzing, setAnalyzing]     = useState(false);
  const [analyzed, setAnalyzed]       = useState(false);
  const [gpsFound, setGpsFound]       = useState(false);
  const [gpsRemoved, setGpsRemoved]   = useState(false);
  const [realGps, setRealGps]         = useState("");
  const [deepfake, setDeepfake]       = useState(null);
  const [protectedUrl, setProtectedUrl] = useState(null);
  const [finalFilename, setFinalFilename] = useState(null);
  const [toast, setToast]             = useState(null);
  const toastTimer                    = useRef(null);

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
    setDeepfake(null);
    setGpsFound(false);
    setGpsRemoved(false);
    setRealGps("");
    setProtectedUrl(null);
    setFinalFilename(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData);
      const data = response.data;

      // GPS
      if (data.gps) {
        setGpsFound(true);
        setRealGps(data.gps);
      }
      setGpsRemoved(data.gps_removed || false);

      // Deepfake
      if (data.ai_results) setDeepfake(data.ai_results);

      // Combined protected file (GPS stripped + cloaked)
      if (data.protected_url)  setProtectedUrl(data.protected_url);
      if (data.final_filename) setFinalFilename(data.final_filename);

      setAnalyzing(false);
      setAnalyzed(true);
    } catch (error) {
      showToast("Error: Backend connection failed.", "error");
      setAnalyzing(false);
    }
  };

  const cardBg = (color) => t.dark ? `${color}06` : "#FFFFFF";

  const deepfakeColor = () => {
    if (!deepfake || deepfake.score === null) return t.textDim;
    if (deepfake.score > 0.7) return t.red;
    if (deepfake.score > 0.4) return t.amber;
    return t.green;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999 }}>
          <div style={{ padding: "10px 20px", color: "#fff", borderRadius: 8, background: toast.type === "error" ? t.red : t.green, fontSize: 12, fontFamily: "'Courier New', monospace", boxShadow: `0 4px 12px ${toast.type === "error" ? t.red : t.green}44` }}>
            {toast.msg}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Drop zone */}
        <div style={{ ...card(t), background: t.dark ? undefined : "#FFFFFF" }}>
          <div style={cardTitle(t)}><span style={dot(t.amber)} />PRE-FLIGHT SANITIZER</div>
          <label
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{ display: "block", marginTop: 16, border: `2px dashed ${dragging ? t.green : t.borderMid}`, borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.3s", background: dragging ? `${t.green}0a` : "transparent" }}
          >
            <input type="file" accept="image/*" onChange={handleDrop} style={{ display: "none" }} />
            {previewUrl ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, objectFit: "contain" }} />
                <div style={{ color: t.textDim, fontSize: 11, fontFamily: "'Courier New', monospace" }}>{file?.name}</div>
              </div>
            ) : (
              <div style={{ padding: "20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8, color: t.textDim }}>⬡</div>
                <div style={{ color: t.textDim, fontSize: 13 }}>Drop photo here to analyze</div>
                <div style={{ color: t.textFaint, fontSize: 11, marginTop: 4 }}>GPS will be stripped and image cloaked automatically</div>
              </div>
            )}
          </label>

          {analyzing && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: t.textMid, marginBottom: 10 }}>Processing your photo…</div>
              {CHECKS.map((check, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: t.border, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: t.green, animation: `grow ${0.6 + i * 0.3}s ease-out forwards`, width: 0 }} />
                  </div>
                  <span style={{ fontSize: 10, color: t.textDim, width: 160, textAlign: "right" }}>{check}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {analyzed ? (
            <>
              {/* ── Merged: GPS Strip + Image Cloaking ── */}
              <div style={{ ...card(t), border: `1px solid ${t.green}44`, background: cardBg(t.green) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={cardTitle(t)}><span style={dot(t.green)} />PHOTO PROTECTION </div>
                    <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, marginBottom: 10, lineHeight: 1.6 }}>
                      GPS has been stripped and image cloaking applied. Download the protected version below.
                    </div>

                    {gpsFound && realGps && (
                      <div style={{ fontSize: 10, color: t.textFaint, marginTop: 8, fontFamily: "monospace" }}>
                       Location Removed: 📍 {realGps}
                      </div>
                    )}
                  </div>

                  {/* Single download button */}
                  {protectedUrl ? (
                    <a
                      href={protectedUrl}
                      download={finalFilename || "protected-image.jpg"}
                      style={{ ...actionBtn(t.green), textDecoration: "none", flexShrink: 0, padding: "10px 18px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, alignSelf: "center" }}
                    >
                      ⬇ DOWNLOAD
                    </a>
                  ) : (
                    <div style={{ fontSize: 10, color: t.textFaint, flexShrink: 0 }}>Processing…</div>
                  )}
                </div>
              </div>

              {/* ── Deepfake Analysis ── */}
              {deepfake && (
                <div style={{ ...card(t), border: `1px solid ${deepfakeColor()}44`, background: cardBg(deepfakeColor()) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={cardTitle(t)}><span style={dot(deepfakeColor())} />DEEPFAKE ANALYSIS</div>
                      <div style={{ fontSize: 12, color: deepfakeColor(), marginTop: 8, fontWeight: 600 }}>
                        {deepfake.is_deepfake
                          ? `⚠ ${(deepfake.score * 100).toFixed(2)}% — likely manipulated`
                          : `✓ ${(deepfake.score * 100).toFixed(2)}% fake probability — looks real`}
                      </div>
                      {deepfake.details && (
                        <div style={{ fontSize: 11, color: t.textDim, marginTop: 4, lineHeight: 1.6 }}>
                          {deepfake.details}
                        </div>
                      )}
                    </div>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${deepfakeColor()}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0, marginLeft: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: deepfakeColor(), lineHeight: 1 }}>{(deepfake.score * 100).toFixed(2)}%</div>
                      <div style={{ fontSize: 8, color: t.textFaint }}>fake</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : !analyzing && (
            <div style={{ ...card(t), background: t.dark ? undefined : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, flexDirection: "column", gap: 12, color: t.textFaint, textAlign: "center", border: `1px dashed ${t.border}` }}>
              <div style={{ fontSize: 40 }}>◈</div>
              <div style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>AWAITING DATA</div>
              <div style={{ fontSize: 10, color: t.textFaint, maxWidth: 180 }}>Upload a photo to initialize security protocols</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}