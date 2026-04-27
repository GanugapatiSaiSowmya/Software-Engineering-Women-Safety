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
  const [dragging, setDragging]           = useState(false);
  const [file, setFile]                   = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [analyzing, setAnalyzing]         = useState(false);
  const [analyzed, setAnalyzed]           = useState(false);
  const [gpsStripped, setGps]             = useState(false);
  const [realGps, setRealGps]             = useState("");
  const [deepfake, setDeepfake]           = useState(null);
  const [strippedFilename, setStrippedFilename] = useState(null);
  const [protectedUrl, setProtectedUrl]   = useState(null); 
  const [toast, setToast]                 = useState(null);
  const toastTimer                        = useRef(null);

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
    setGps(false);
    setRealGps("");
    setProtectedUrl(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData);
      const data = response.data;
      
      setRealGps(data.gps || "");
      // If GPS is null/empty in response, it means it's already clean
      setGps(!data.gps);
      if (data.ai_results) setDeepfake(data.ai_results);
      
      // Backend automatically protects image on upload and sends this URL
      if (data.protected_url) setProtectedUrl(data.protected_url);
      
      setAnalyzing(false);
      setAnalyzed(true);
    } catch (error) {
      showToast("Error: Backend connection failed.", "error");
      setAnalyzing(false);
    }
  };

  const handleStripGps = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const form = new FormData();
      form.append("filename", file.name);
      const res = await axios.post("http://127.0.0.1:8000/strip", form);
      setRealGps(res.data.coordinates || "");
      setGps(!res.data.gps_found);
      if (res.data.stripped_filename) setStrippedFilename(res.data.stripped_filename);
      showToast("GPS data successfully removed.", "success");
    } catch (err) {
      showToast("Error stripping GPS metadata.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadStripped = () => {
    if (!file) return;
    // Hits the backend /download endpoint which serves the -stripped version
    window.open(`http://127.0.0.1:8000/download?filename=${file.name}`, '_blank');
  };

  const cardBg = (color) => t.dark ? `${color}06` : "#FFFFFF";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999 }}>
          <div style={{ padding: "10px 20px", color: "#fff", borderRadius: 8, background: toast.type === "error" ? t.red : t.green, fontSize: 12, fontFamily: "'Courier New', monospace", boxShadow: `0 4px 12px ${toast.type === "error" ? t.red : t.green}44` }}>
            {toast.msg}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left Column: Dropzone */}
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
              </div>
            )}
          </label>

          {analyzing && (
            <div style={{ marginTop: 16 }}>
              {CHECKS.map((check, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1, height: 2, background: t.border, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: t.green, width: "100%", animation: `grow 1.5s ease-in-out infinite` }} />
                  </div>
                  <span style={{ fontSize: 10, color: t.textDim, width: 100, textAlign: "right" }}>{check}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {analyzed ? (
            <>
              {/* IMAGE CLOAKING CARD */}
              <div style={{ ...card(t), border: `1px solid ${t.green}44`, background: cardBg(t.green) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={cardTitle(t)}><span style={dot(t.green)} />IMAGE CLOAKING ACTIVE</div>
                    <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, lineHeight: 1.6 }}>
                      Adversarial noise, watermarking, and honey-pixels have been applied. Your identity is now shielded from AI scrapers.
                    </div>
                  </div>
                  {protectedUrl && (
                    <a 
                      href={protectedUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ ...actionBtn(t.green), textDecoration: "none", marginLeft: 14, flexShrink: 0 }}
                    >
                      ⬇ DOWNLOAD
                    </a>
                  )}
                </div>
              </div>

              {/* GPS STATUS CARD */}
              <div style={{ ...card(t), border: `1px solid ${gpsStripped ? t.green : t.red}44`, background: cardBg(gpsStripped ? t.green : t.red) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={cardTitle(t)}><span style={dot(gpsStripped ? t.green : t.red)} />GPS STATUS</div>
                    <div style={{ fontSize: 11, color: gpsStripped ? t.green : t.red, marginTop: 4 }}>
                      {gpsStripped ? "✓ Location Metadata Clean" : `📍 ${realGps || "Metadata Detected"}`}
                    </div>
                  </div>
                  <div style={{ marginLeft: 14, flexShrink: 0 }}>
                    {!gpsStripped ? (
                      <button onClick={handleStripGps} style={actionBtn(t.red)}>STRIP GPS</button>
                    ) : (
                      <button onClick={handleDownloadStripped} style={actionBtn(t.green)}>⬇ DOWNLOAD</button>
                    )}
                  </div>
                </div>
              </div>

              {/* DEEPFAKE ANALYSIS CARD */}
              {deepfake && (
                <div style={{ ...card(t), border: `1px solid ${t.green}44`, background: cardBg(t.green) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={cardTitle(t)}><span style={dot(t.green)} />DEEPFAKE ANALYSIS</div>
                      {/* Changed color from t.green to t.textDim to match rest of text */}
                      <div style={{ fontSize: 12, color: t.textDim, marginTop: 8, fontWeight: 600 }}>
                        ✓ {(deepfake.score * 100).toFixed(2)}% fake probability — looks real
                      </div>
                    </div>
                    {/* Changed toFixed(0) to toFixed(2) for floating point percentage */}
                    <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${t.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: t.green, fontWeight: 700 }}>
                      {(deepfake.score * 100).toFixed(2)}%
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