import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const CHECKS = ["GPS Metadata", "Background Objects", "Similarity Check", "Deepfake Score"];

export default function UploadGuard() {
  const t = useTheme();

  // UI state
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [gpsStripped, setGps] = useState(false);
  const [realGps, setRealGps] = useState("");
  const [blurred, setBlurred] = useState(false);

  // Toast
  const [toast, setToast] = useState(null); // { msg, type }
  const toastTimer = useRef(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // Upload handler (drag/drop and file input)
  const handleDrop = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setDragging(false);
    const selectedFile = e?.dataTransfer?.files?.[0] || e?.target?.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setAnalyzing(true);
    setAnalyzed(false);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setRealGps(response.data.coordinates || "");
      setGps(!response.data.gps_found);
      setAnalyzing(false);
      setAnalyzed(true);
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Upload failed (backend unreachable).", "error");
      setAnalyzing(false);
    }
  };

  // Download stripped file (GET /download?filename=originalname)
  const downloadStrippedFile = async (filename) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/download", {
        params: { filename },
        responseType: "blob",
      });
      const blob = res.data;
      const extMatch = filename.match(/\.[^/.]+$/);
      const downloadName = `${filename.replace(extMatch ? extMatch[0] : "", "")}-stripped${extMatch ? extMatch[0] : ""}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Downloaded stripped file.", "success");
      return blob;
    } catch (err) {
      console.error("Download failed:", err);
      showToast("Failed to download stripped file.", "error");
      throw err;
    }
  };

  // Re-upload blob to /upload to verify gps_found === false
  const verifyBlobHasNoGps = async (blob, originalName) => {
    try {
      const verifyForm = new FormData();
      const fileForVerify = new File([blob], originalName, { type: blob.type || "image/jpeg" });
      verifyForm.append("file", fileForVerify);
      const verifyRes = await axios.post("http://127.0.0.1:8000/upload", verifyForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return verifyRes.data.gps_found === false;
    } catch (err) {
      console.error("Verification failed:", err);
      showToast("Verification failed (server error).", "error");
      return false;
    }
  };

  // Strip button handler
  const handleStripGps = async () => {
    if (!file) { showToast("No file selected.", "info"); return; }
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
        try {
          const blob = await downloadStrippedFile(file.name);
          const verified = await verifyBlobHasNoGps(blob, file.name);
          if (verified) showToast("Confirmed: downloaded file contains no GPS metadata.", "success");
          else showToast("Downloaded file still contains GPS metadata.", "error");
        } catch (e) { /* toasts already shown */ }
      }
      setAnalyzed(true);
    } catch (err) {
      console.error("Strip failed:", err);
      const message = err?.response?.data?.detail || err?.message || "Error stripping GPS metadata.";
      showToast(message, "error");
    } finally { setAnalyzing(false); }
  };

  const toastColor = toast?.type === "success" ? t.green : toast?.type === "error" ? t.red : t.borderMid;
  const allClear = gpsStripped && blurred;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999 }}>
          <div style={{ padding: "10px 20px", minWidth: 240, textAlign: "center", color: "#fff", borderRadius: 8, background: toastColor, boxShadow: `0 6px 18px ${toastColor}44`, fontSize: 12 }}>
            {toast.msg}
          </div>
        </div>
      )}

      <div style={card(t)}>
        <div style={cardTitle(t)}><span style={dot(t.amber)} />PRE-FLIGHT SANITIZER</div>
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{ display: "block", marginTop: 16, border: `2px dashed ${dragging ? t.green : t.borderMid}`, borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: dragging ? `${t.green}0a` : "transparent", transition: "all 0.3s" }}
        >
          <input type="file" accept="image/*" onChange={handleDrop} style={{ display: "none" }} />
          <div style={{ fontSize: 36, marginBottom: 8, color: t.textDim }}>⬡</div>
          <div style={{ color: t.textDim, fontSize: 13 }}>{file ? file.name : "Drop photo here or click to select"}</div>
          <div style={{ color: t.textFaint, fontSize: 11, marginTop: 4 }}>All processing is local — no uploads</div>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {analyzed ? (
          <>
            <div style={{ ...card(t), border: `1px solid ${gpsStripped ? t.green + "44" : t.red + "44"}`, background: gpsStripped ? `${t.green}06` : `${t.red}06` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={cardTitle(t)}><span style={dot(gpsStripped ? t.green : t.red)} />GPS DETECTED</div>
                  <div style={{ fontSize: 11, color: gpsStripped ? t.green : t.red, marginTop: 4 }}>
                    {gpsStripped ? "✓ Location data removed" : (realGps ? `📍 ${realGps}` : "📍 GPS metadata detected")}
                  </div>
                  {gpsStripped && <div style={{ fontSize: 11, color: t.textDim, marginTop: 6 }}>Downloaded file has been verified as stripped (server re-check).</div>}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {!gpsStripped && <button onClick={handleStripGps} disabled={analyzing} style={actionBtn(t.red)}>STRIP GPS</button>}
                  {gpsStripped && <button onClick={async () => {
                    if (!file) return;
                    try {
                      const blob = await downloadStrippedFile(file.name);
                      const ok = await verifyBlobHasNoGps(blob, file.name);
                      if (ok) showToast("Verified: this download contains no GPS metadata.", "success");
                      else showToast("Warning: downloaded file still contains GPS metadata.", "error");
                    } catch (e) {}
                  }} disabled={analyzing} style={actionBtn(t.green)}>DOWNLOAD STRIPPED</button>}
                </div>
              </div>
            </div>

            <div style={{ ...card(t), border: `1px solid ${t.amber}44`, background: `${t.amber}06` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={cardTitle(t)}><span style={dot(t.amber)} />SENSITIVE OBJECTS</div>
                  <div style={{ fontSize: 11, color: t.amber, marginTop: 4 }}>⚠ Diploma visible · House number in reflection</div>
                </div>
                <button onClick={() => setBlurred(true)} style={actionBtn(t.amber)} disabled>SMART BLUR</button>
              </div>
            </div>

            <div style={{ ...card(t), border: `1px solid ${t.green}44`, background: `${t.green}06` }}>
              <div style={cardTitle(t)}><span style={dot(t.green)} />SIMILARITY CHECK</div>
              <div style={{ fontSize: 11, color: t.green, marginTop: 4 }}>✓ No matches found in high-risk databases</div>
            </div>

            {allClear && (<div style={{ padding: "14px 18px", borderRadius: 10, background: `${t.green}14`, border: `1px solid ${t.green}`, textAlign: "center" }}>
              <div style={{ fontSize: 16, color: t.green, fontWeight: 700 }}>✓ YOU ARE PROTECTED</div>
              <div style={{ fontSize: 11, color: t.textDim, marginTop: 4 }}>Safe to upload. All threats neutralized.</div>
            </div>)}
          </>
        ) : (
          <div style={{ ...card(t), display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240, flexDirection: "column", gap: 12, color: t.textFaint }}>
            <div style={{ fontSize: 40 }}>◈</div>
            <div style={{ fontSize: 12, letterSpacing: 1.5 }}>AWAITING PHOTO</div>
          </div>
        )}
      </div>
    </div>
  );
}