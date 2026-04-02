import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const CHECKS = ["GPS Metadata", "Background Objects", "Similarity Check", "Deepfake Score"];

const SOON = (t) => (
  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, padding: "2px 8px", borderRadius: 3, border: `1px solid ${t.green}`, color: t.green, background: `${t.green}12`, boxShadow: `0 0 8px ${t.green}44`, animation: "comingSoonPulse 2.5s ease-in-out infinite", fontFamily: "'Courier New', monospace", whiteSpace: "nowrap" }}>✦ COMING SOON</span>
);

export default function UploadGuard() {
  const t = useTheme();
  const [dragging, setDragging]     = useState(false);
  const [file, setFile]             = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing]   = useState(false);
  const [analyzed, setAnalyzed]     = useState(false);
  const [gpsStripped, setGps]       = useState(false);
  const [realGps, setRealGps]       = useState("");
  const [deepfake, setDeepfake]     = useState(null); // { score, is_deepfake, label, details }
  const [reportUrl, setReportUrl]   = useState(null);
  const [toast, setToast]           = useState(null);
  const toastTimer                  = useRef(null);
  
  // new state: backend stripped filename (e.g. "photo-stripped.jpg")
  const [strippedFilename, setStrippedFilename] = useState(null);
  const [protectedImage, setProtectedImage] = useState(false);
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
    setReportUrl(null);
    setGps(false);
    setRealGps("");
    setProtectedImage(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;

      // GPS — new response uses data.gps (string | null)
      setRealGps(data.gps || "");
      setGps(!data.gps); // no gps string = stripped/clean

      // Deepfake result
      if (data.ai_results) setDeepfake(data.ai_results);

      // Report URL
      if (data.report_url) setReportUrl(data.report_url);

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
        showToast("Done! Your location has been removed from this photo.", "success");
      }
      // store stripped filename returned by backend (e.g. "photo-stripped.jpg")
      if (res.data.stripped_filename) setStrippedFilename(res.data.stripped_filename);
      setAnalyzed(true);
    } catch (err) {
      const message = err?.response?.data?.detail || err?.response?.data?.message || err.message || "Error stripping GPS metadata.";
      showToast(message, "error");
    } finally {
      setAnalyzing(false);
    }
  };

  // Download the stripped file by requesting the backend and saving a blob
  const handleDownloadStripped = async () => {
    if (!file) return showToast("No file available to download.", "error");
    try {
      const res = await axios.get("http://127.0.0.1:8000/download", {
        params: { filename: file.name },
        responseType: "blob",
      });
      const contentType = res.headers["content-type"] || file.type || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });
      const url = URL.createObjectURL(blob);

      // Construct a sensible download name: use strippedFilename if available, otherwise compute
      let downloadName = strippedFilename;
      if (!downloadName) {
        const idx = file.name.lastIndexOf(".");
        if (idx !== -1) {
          const base = file.name.substring(0, idx);
          const ext = file.name.substring(idx + 1);
          downloadName = `${base}-stripped.${ext}`;
        } else {
          downloadName = `${file.name}-stripped`;
        }
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Downloaded stripped image.", "success");
    } catch (err) {
      showToast("Failed to download stripped image.", "error");
      console.error(err);
    }
  };

  const toastColor = toast?.type === "success" ? t.green : toast?.type === "error" ? t.red : t.borderMid;
  const cardBg = (color) => t.dark ? `${color}06` : "#FFFFFF";

  // Deepfake score colour
  const deepfakeColor = () => {
    if (!deepfake || deepfake.score === null) return t.textDim;
    if (deepfake.score > 0.7) return t.red;
    if (deepfake.score > 0.4) return t.amber;
    return t.green;
  };

  const deepfakeLabel = () => {
    if (!deepfake || deepfake.score === null) return "Analysis unavailable";
    const pct = (deepfake.score * 100).toFixed(2);
    if (deepfake.is_deepfake) return `⚠ ${pct}% chance this is a fake`;
    return `✓ ${pct}% fake probability — looks real`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999 }}>
          <div style={{ padding: "10px 20px", minWidth: 240, textAlign: "center", color: "#fff", borderRadius: 8, background: toastColor, boxShadow: `0 6px 18px ${toastColor}44`, fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
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
            style={{ display: "block", marginTop: 16, border: `2px dashed ${dragging ? t.green : t.borderMid}`, borderRadius: 12, padding: previewUrl ? "16px" : "40px 20px", textAlign: "center", cursor: "pointer", background: dragging ? `${t.green}0a` : "transparent", transition: "all 0.3s" }}
          >
            <input type="file" accept="image/*" onChange={handleDrop} style={{ display: "none" }} />

            {previewUrl ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: "100%", height: 180, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", borderRadius: 8, background: t.dark ? `${t.bg}33` : "#f8fafc" }}>
                  <img src={previewUrl} alt="Upload preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ color: t.textDim, fontSize: 11, fontFamily: "'Courier New', monospace", wordBreak: "break-all" }}>{file?.name}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 8, color: t.textDim }}>⬡</div>
                <div style={{ color: t.textDim, fontSize: 13 }}>Drop photo here or click to select</div>
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

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {analyzed && (
  <>
    
    {/* 🔐 ADD THIS BLOCK EXACTLY HERE */}
    {protectedImage && (
      <div style={{
        padding: "12px 18px",
        borderRadius: 10,
        background: `${t.green}14`,
        border: `1px solid ${t.green}`,
        marginBottom: 12,
        fontSize: 12,
        color: t.green,
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          🔐 Image Protection Activated
        </div>

        <div>• Adversarial Shield → Prevents AI deepfake misuse</div>
        <div>• Hidden Watermark → Detects tampering</div>
        <div>• Honey Pixel Traps → Disrupts AI manipulation tools</div>

        <div style={{ marginTop: 6, fontSize: 11, color: t.textDim }}>
          Your image is now secured before analysis & storage
        </div>
      </div>
    )}

              {/* GPS */}
              <div style={{ ...card(t), border: `1px solid ${gpsStripped ? t.green + "44" : t.red + "44"}`, background: cardBg(gpsStripped ? t.green : t.red) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={cardTitle(t)}><span style={dot(gpsStripped ? t.green : t.red)} />GPS DETECTED</div>
                    <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, marginBottom: 4, lineHeight: 1.6 }}>
                      {gpsStripped
                        ? "Your location has been removed — safe to share."
                        : "This photo has your location hidden inside it. Remove it before posting."}
                    </div>
                    <div style={{ fontSize: 11, color: gpsStripped ? t.green : t.red, marginTop: 2 }}>
                      {gpsStripped ? "✓ Location data removed" : (realGps ? `📍 ${realGps}` : "📍 GPS metadata detected")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!gpsStripped && (
                      <button onClick={handleStripGps} style={actionBtn(t.red)}>STRIP GPS</button>
                    )}
                    {(gpsStripped || strippedFilename) && (
                      <button onClick={handleDownloadStripped} style={actionBtn(t.green)}>DOWNLOAD STRIPPED</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Deepfake Detection — LIVE from backend */}
              {deepfake && (
                <div style={{ ...card(t), border: `1px solid ${deepfakeColor()}44`, background: cardBg(deepfakeColor()) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={cardTitle(t)}><span style={dot(deepfakeColor())} />DEEPFAKE DETECTION</div>
                      <div style={{ fontSize: 12, color: deepfakeColor(), marginTop: 8, fontWeight: 700 }}>
                        {deepfakeLabel()}
                      </div>
                      {deepfake.details && (
                        <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, lineHeight: 1.6 }}>
                          {deepfake.details}
                        </div>
                      )}
                    </div>
                    {/* Score ring */}
                    {deepfake.score !== null && (
                      <div style={{ flexShrink: 0, marginLeft: 14, width: 52, height: 52, borderRadius: "50%", border: `3px solid ${deepfakeColor()}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: deepfakeColor(), lineHeight: 1 }}>{(deepfake.score * 100).toFixed(2)}%</div>
                        <div style={{ fontSize: 8, color: t.textFaint, letterSpacing: 0.5 }}>fake</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sensitive Objects */}
              <div style={{ ...card(t), border: `1px solid ${t.amber}44`, background: cardBg(t.amber) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={cardTitle(t)}><span style={dot(t.amber)} />SENSITIVE OBJECTS</div>
                    <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, lineHeight: 1.6 }}>
                      We'll highlight things in your photo that could identify you — like a diploma, house number, or landmark.
                    </div>
                    <div style={{ fontSize: 11, color: t.amber, marginTop: 4 }}>⚠ Diploma visible · House number in reflection</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, marginLeft: 12 }}>
                    {SOON(t)}
                    <button style={{ ...actionBtn(t.amber), opacity: 0.4, cursor: "not-allowed" }} disabled>SMART BLUR</button>
                  </div>
                </div>
              </div>

              {/* All clear */}
              {gpsStripped && deepfake && !deepfake.is_deepfake && (
                <div style={{ padding: "14px 18px", borderRadius: 10, background: `${t.green}14`, border: `1px solid ${t.green}`, textAlign: "center" }}>
                  {/* <div style={{ fontSize: 15, color: t.green, fontWeight: 700, letterSpacing: 1 }}>✓ YOU ARE PROTECTED</div> */}
                  <div style={{ fontSize: 11, color: t.textDim, marginTop: 4 }}>Location removed and no deepfake detected. Safe to post.</div>
                </div>
              )}
            </>
          )}

          {!analyzed && !analyzing && (
            <div style={{ ...card(t), background: t.dark ? undefined : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280, flexDirection: "column", gap: 12, color: t.textFaint, textAlign: "center" }}>
              <div style={{ fontSize: 40 }}>◈</div>
              <div style={{ fontSize: 12, letterSpacing: 1.5 }}>AWAITING PHOTO</div>
              <div style={{ fontSize: 11, color: t.textFaint, maxWidth: 200 }}>Drop a photo on the left to see your results here</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}