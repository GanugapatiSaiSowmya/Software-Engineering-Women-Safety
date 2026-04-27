import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ShieldIcon from "../components/ShieldIcon";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const MAX_ATTEMPTS = 3;
const API = "http://127.0.0.1:8000";

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Face presence check
// Uses the browser FaceDetector API where available; falls back to a
// brightness / edge-density heuristic that rejects solid-colour occlusions
// (hands, paper, etc.).
// ─────────────────────────────────────────────────────────────────────────────
async function detectFacePresent(videoEl) {
  // ── Primary: Chrome/Edge FaceDetector API ──────────────────────────────────
  if ("FaceDetector" in window) {
    try {
      const fd = new window.FaceDetector({ fastMode: false, maxDetectedFaces: 1 });
      const faces = await fd.detect(videoEl);
      if (faces.length === 0) return { present: false, reason: "No face detected in frame." };
      // Sanity-check: bounding box must be reasonably large (not a tiny speck)
      const { width, height } = faces[0].boundingBox;
      const frameArea = videoEl.videoWidth * videoEl.videoHeight;
      const faceArea  = width * height;
      if (faceArea / frameArea < 0.04) {
        return { present: false, reason: "Face too small — move closer to the camera." };
      }
      return { present: true, boundingBox: faces[0].boundingBox };
    } catch {
      // FaceDetector threw (e.g. behind a flag) — fall through to heuristic
    }
  }

  // ── Fallback: heuristic checks ─────────────────────────────────────────────
  const SIZE   = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, SIZE, SIZE);
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

  // 1. Brightness: hands/solid objects are often very uniform
  const pixels = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    pixels.push(0.299 * r + 0.587 * g + 0.114 * b);
  }
  const mean   = pixels.reduce((a, b) => a + b, 0) / pixels.length;
  const stddev = Math.sqrt(pixels.reduce((s, p) => s + (p - mean) ** 2, 0) / pixels.length);

  // Too dark (camera covered) or almost no variation (solid colour block)
  if (mean < 30)    return { present: false, reason: "Image too dark — ensure good lighting." };
  if (stddev < 12)  return { present: false, reason: "No face detected — please uncover the camera." };

  // 2. Skin-tone ratio: at least ~15 % of pixels should be in skin range
  let skinCount = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    // Broad multi-ethnicity skin-tone range (RGB heuristic)
    if (
      r > 60 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 10 &&
      (r - b) > 20 &&
      r < 250
    ) skinCount++;
  }
  const skinRatio = skinCount / (SIZE * SIZE);
  if (skinRatio < 0.10) {
    return { present: false, reason: "No face detected — centre your face in the frame." };
  }

  return { present: true, boundingBox: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Biometric perceptual hash
// Crops to the face bounding box when available; otherwise uses the centre
// 60 % of the frame (where the face guide brackets sit).
// Generates a 256-bit DCT-based perceptual hash (pHash) that is stable across
// small lighting changes but very different for different faces.
// ─────────────────────────────────────────────────────────────────────────────
function generateFaceHash(videoEl, boundingBox) {
  const HASH_SIZE = 16; // 16×16 → 256-bit hash

  const vw = videoEl.videoWidth  || videoEl.width  || 640;
  const vh = videoEl.videoHeight || videoEl.height || 480;

  // Crop region — prefer detected bounding box, else centre 60 %
  let sx, sy, sw, sh;
  if (boundingBox) {
    const pad = 0.20; // add 20 % padding around face
    sx = Math.max(0, boundingBox.x - boundingBox.width  * pad);
    sy = Math.max(0, boundingBox.y - boundingBox.height * pad);
    sw = Math.min(vw - sx, boundingBox.width  * (1 + 2 * pad));
    sh = Math.min(vh - sy, boundingBox.height * (1 + 2 * pad));
  } else {
    const margin = 0.20;
    sx = vw * margin; sy = vh * margin;
    sw = vw * (1 - 2 * margin); sh = vh * (1 - 2 * margin);
  }

  // Draw to HASH_SIZE × HASH_SIZE greyscale canvas
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = HASH_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.filter = "grayscale(100%)";
  // Mirror the video (it was mirrored via CSS scaleX(-1)) so the hash is consistent
  ctx.save();
  ctx.translate(HASH_SIZE, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, HASH_SIZE, HASH_SIZE);
  ctx.restore();

  const { data } = ctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE);
  const pixels = [];
  for (let i = 0; i < HASH_SIZE * HASH_SIZE; i++) pixels.push(data[i * 4]); // red channel = grey

  // Simple DCT-based pHash: compute 1-D DCT per row then per column
  function dct1D(row) {
    const N = row.length;
    return row.map((_, k) => {
      const scale = k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
      const sum = row.reduce((s, v, n) => s + v * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N)), 0);
      return scale * sum;
    });
  }

  // Build 2-D DCT
  const N = HASH_SIZE;
  let matrix = [];
  for (let r = 0; r < N; r++) matrix.push(dct1D(pixels.slice(r * N, r * N + N)));
  // Transpose
  const T = matrix[0].map((_, c) => matrix.map(row => row[c]));
  matrix = T.map(row => dct1D(row));
  // Transpose back
  const dct2d = matrix[0].map((_, c) => matrix.map(row => row[c]));

  // Use top-left 8×8 (low-frequency) coefficients, skip DC (0,0)
  const LOW = 8;
  const coeffs = [];
  for (let r = 0; r < LOW; r++) for (let c = 0; c < LOW; c++) {
    if (r === 0 && c === 0) continue;
    coeffs.push(dct2d[r][c]);
  }
  const median = [...coeffs].sort((a, b) => a - b)[Math.floor(coeffs.length / 2)];

  // Encode as 63-bit string (skip DC)
  const bits = coeffs.map(v => v > median ? "1" : "0").join("");
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4).padEnd(4, "0"), 2).toString(16);
  }
  return hex;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FaceVerify({ onVerified, onLogout }) {
  const t = useTheme();
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  const token = localStorage.getItem("shield_token");

  const [faceEnrolled, setFaceEnrolled] = useState(null);
  const [phase, setPhase]               = useState("loading");
  const [countdown, setCountdown]       = useState(3);
  const [progress, setProgress]         = useState(0);
  const [attempts, setAttempts]         = useState(0);
  const [errorMsg, setErrorMsg]         = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaceEnrolled(res.data.face_enrolled);
        setPhase("idle");
      } catch {
        onLogout();
      }
    };
    check();
    return () => stopStream();
  }, []);

  useEffect(() => {
    if (phase === "idle") openCamera();
  }, [phase === "idle"]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async () => {
    setPhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPhase("live");
    } catch (err) {
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "Camera access is required. Please allow it in your browser settings and refresh."
          : "Could not access camera. Make sure no other app is using it."
      );
      setPhase("error");
    }
  };

  const startScan = () => {
    setPhase("scanning"); setCountdown(3); setProgress(0); setErrorMsg("");
    let c = 3;
    const cd = setInterval(() => {
      c--; setCountdown(c);
      if (c <= 0) { clearInterval(cd); runScan(); }
    }, 1000);
  };

  const runScan = () => {
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); processResult(); return 100; }
        return p + 4;
      });
    }, 40);
  };

  const processResult = async () => {
    const video = videoRef.current;

    // ── GATE: face must actually be present ──────────────────────────────────
    setPhase("detecting");
    const detection = await detectFacePresent(video);
    if (!detection.present) {
      const n = attempts + 1;
      setAttempts(n);
      setErrorMsg(detection.reason);
      if (n >= MAX_ATTEMPTS) {
        stopStream();
        setPhase("locked");
      } else {
        setPhase("failed");
      }
      return;
    }

    // ── Generate biometric hash from the confirmed face region ───────────────
    const hash = generateFaceHash(video, detection.boundingBox);
    stopStream();

    try {
      if (!faceEnrolled) {
        await axios.post(
          `${API}/auth/face/enroll`,
          { face_hash: hash },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFaceEnrolled(true);
        setPhase("success");
        setTimeout(() => onVerified(), 1800);
      } else {
        const res = await axios.post(
          `${API}/auth/face/verify`,
          { face_hash: hash },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.verified) {
          setPhase("success");
          setTimeout(() => onVerified(), 1800);
        } else {
          const n = attempts + 1;
          setAttempts(n);
          if (n >= MAX_ATTEMPTS) {
            setPhase("locked");
          } else {
            setErrorMsg(`Face not recognised. ${MAX_ATTEMPTS - n} attempt${MAX_ATTEMPTS - n === 1 ? "" : "s"} remaining.`);
            setPhase("failed");
          }
        }
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.detail || "Something went wrong. Please try again.");
      setPhase("failed");
    }
  };

  const retry = () => {
    setErrorMsg(""); setProgress(0); setCountdown(3);
    openCamera();
  };

  const handleLogout = () => { stopStream(); onLogout(); };

  const isScanning  = phase === "scanning" || phase === "detecting";
  const isSuccess   = phase === "success";
  const isLocked    = phase === "locked";
  const isFailed    = phase === "failed";
  const isError     = phase === "error";
  const isLive      = phase === "live";

  const borderColor =
    isSuccess                         ? t.green :
    isLocked || isFailed || isError   ? t.red   :
    isLive || isScanning              ? t.green  : t.borderMid;

  const CIRC = 754;

  if (phase === "loading" || faceEnrolled === null) {
    return (
      <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace" }}>
        <style>{"@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}"}</style>
        <div style={{ fontSize: 12, color: t.green, letterSpacing: 2, animation: "pulse 1.5s infinite" }}>LOADING…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Courier New', monospace", color: t.text, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:0.55} }
        @keyframes scan       { 0%{top:-20%} 100%{top:120%} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes arcSweep   { from{stroke-dashoffset:754} to{stroke-dashoffset:0} }
        @keyframes arcPulse   { 0%,100%{opacity:1} 50%{opacity:0.6} }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      <div style={{ position: "fixed", width: 400, height: 400, top: "-10%", right: "-10%", borderRadius: "50%", background: `${t.green}0a`, filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${t.border}`, background: t.header, backdropFilter: "blur(12px)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <ShieldIcon size={26} pulse />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, color: t.green }}>SHIELD.AI</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: t.textFaint }}>DIGITAL BODYGUARD</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ThemeToggle />
            <button onClick={handleLogout} style={{ background: "transparent", border: `1px solid ${t.borderMid}`, color: t.textDim, fontSize: 10, letterSpacing: 1.5, padding: "5px 12px", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease both" }}>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#dcd4d4", marginBottom: 10 }}>
              {isLocked ? "🔒 ACCOUNT LOCKED" : "◈ FACE VERIFICATION"}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1, color: t.text }}>
              {!faceEnrolled ? "Register Your Face" : isLocked ? "Too Many Failed Attempts" : "Verify It's You"}
            </h1>
            <p style={{ fontSize: 12, color: "#dcd4d4", marginTop: 8, lineHeight: 1.7 }}>
              {isLocked
                ? "Your account has been locked after 3 failed attempts."
                : !faceEnrolled
                ? "First login — scan your face once to register it. You'll need it every time you log in."
                : "Scan your face to confirm your identity and access your dashboard."}
            </p>
          </div>

          {/* Attempt dots */}
          {faceEnrolled && !isLocked && !isSuccess && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
              {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < attempts ? t.red : t.borderMid, boxShadow: i < attempts ? `0 0 6px ${t.red}` : "none", transition: "all 0.3s" }} />
              ))}
            </div>
          )}

          {/* Camera circle with SVG arc */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

            <div style={{ position: "relative", width: 268, height: 268, display: "flex", alignItems: "center", justifyContent: "center" }}>

              {/* SVG arc layer */}
              <svg width="268" height="268" style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <circle cx="134" cy="134" r="120" fill="none" stroke={borderColor + "33"} strokeWidth="3" />
                {isScanning && (
                  <circle cx="134" cy="134" r="120" fill="none" stroke={t.green} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={CIRC} strokeDashoffset={CIRC} transform="rotate(-90 134 134)" filter="url(#glow)"
                    style={{ animation: "arcSweep 2.5s ease-in-out forwards" }} />
                )}
                {isSuccess && (
                  <circle cx="134" cy="134" r="120" fill="none" stroke={t.green} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={CIRC} strokeDashoffset="0" transform="rotate(-90 134 134)" filter="url(#glow)"
                    style={{ animation: "arcPulse 2s ease-in-out infinite" }} />
                )}
                {isLocked && (
                  <circle cx="134" cy="134" r="120" fill="none" stroke={t.red} strokeWidth="3"
                    strokeDasharray={CIRC} strokeDashoffset="0" filter="url(#glow)" />
                )}
              </svg>

              {/* Camera circle */}
              <div style={{ position: "relative", width: 240, height: 240, borderRadius: "50%", overflow: "hidden", background: t.dark ? "#020810" : "#0a1628", border: `2px solid ${borderColor}`, transition: "border-color 0.4s", zIndex: 1 }}>

                <video ref={videoRef} autoPlay playsInline muted
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: (isLive || isScanning) ? "block" : "none", transform: "scaleX(-1)" }}
                />

                {/* Face guide brackets + sweep line + countdown */}
                {(isLive || isScanning) && (
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                    {[
                      { top: "22%",    left: "22%",  borderTop:    `2px solid ${t.green}`, borderLeft:   `2px solid ${t.green}` },
                      { top: "22%",    right: "22%", borderTop:    `2px solid ${t.green}`, borderRight:  `2px solid ${t.green}` },
                      { bottom: "22%", left: "22%",  borderBottom: `2px solid ${t.green}`, borderLeft:   `2px solid ${t.green}` },
                      { bottom: "22%", right: "22%", borderBottom: `2px solid ${t.green}`, borderRight:  `2px solid ${t.green}` },
                    ].map((s, i) => <div key={i} style={{ position: "absolute", width: 26, height: 26, ...s }} />)}
                    {isScanning && (
                      <div style={{ position: "absolute", left: "18%", right: "18%", height: 2, background: `linear-gradient(90deg, transparent, ${t.green}, transparent)`, animation: "scan 1.2s linear infinite", boxShadow: `0 0 8px ${t.green}` }} />
                    )}
                    {isScanning && countdown > 0 && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 60, fontWeight: 700, color: t.green, textShadow: `0 0 24px ${t.green}`, opacity: 0.9 }}>{countdown}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Detecting sub-phase label */}
                {phase === "detecting" && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: `${t.green}0a` }}>
                    <div style={{ fontSize: 10, color: t.green, letterSpacing: 2, animation: "pulse 1s infinite" }}>DETECTING…</div>
                  </div>
                )}

                {(phase === "idle" || phase === "requesting") && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ fontSize: 36, color: t.textFaint }}>📷</div>
                    <div style={{ fontSize: 10, color: t.textFaint, letterSpacing: 1.5, animation: phase === "requesting" ? "pulse 1.5s infinite" : "none" }}>
                      {phase === "requesting" ? "STARTING…" : "CAMERA OFF"}
                    </div>
                  </div>
                )}

                {isSuccess && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: `${t.green}14` }}>
                    <div style={{ fontSize: 46, color: t.green }}>◈</div>
                    <div style={{ fontSize: 12, color: t.green, letterSpacing: 2, fontWeight: 700 }}>
                      {!faceEnrolled ? "REGISTERED" : "VERIFIED"}
                    </div>
                  </div>
                )}

                {isFailed && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 24, textAlign: "center", background: `${t.red}08` }}>
                    <div style={{ fontSize: 36 }}>✕</div>
                    <div style={{ fontSize: 11, color: t.red, lineHeight: 1.6 }}>{errorMsg}</div>
                  </div>
                )}

                {(isLocked || isError) && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 20, textAlign: "center", background: `${t.red}10` }}>
                    <div style={{ fontSize: 40 }}>{isLocked ? "🔒" : "🚫"}</div>
                    <div style={{ fontSize: 11, color: t.red, letterSpacing: 1, fontWeight: 700, lineHeight: 1.6 }}>
                      {isLocked ? "LOCKED" : errorMsg}
                    </div>
                  </div>
                )}

                {isScanning && phase !== "detecting" && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: t.border }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: t.green, transition: "width 0.05s", boxShadow: `0 0 6px ${t.green}` }} />
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {isLive && (
              <button onClick={startScan} style={{ padding: "11px 36px", borderRadius: 7, border: `1px solid ${t.green}`, background: t.green, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New', monospace", letterSpacing: 1.5 }}>
                ◈ {!faceEnrolled ? "Register My Face" : "Scan Now"}
              </button>
            )}

            {isScanning && phase !== "detecting" && (
              <div style={{ fontSize: 12, color: t.textDim, letterSpacing: 1 }}>Analysing… {progress}%</div>
            )}

            {isFailed && (
              <button onClick={retry} style={{ padding: "11px 36px", borderRadius: 7, border: `1px solid ${t.red}`, background: `${t.red}14`, color: t.red, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
                Try Again
              </button>
            )}

            {(isLocked || isError) && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.7, marginBottom: 16 }}>
                  {isLocked
                    ? "Your account has been locked for security. Please log out and contact support."
                    : "Please check your camera permissions and try again."}
                </div>
                <button onClick={handleLogout} style={{ padding: "11px 36px", borderRadius: 7, border: `1px solid ${t.borderMid}`, background: "transparent", color: t.textDim, fontSize: 12, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
                  Back to Login
                </button>
              </div>
            )}

            {(isLive || isScanning || phase === "idle" || phase === "requesting") && (
              <div style={{ fontSize: 10, color: t.textFaint, textAlign: "center", maxWidth: 240, lineHeight: 1.7 }}>
                {isLive        && `Centre your face in the frame and tap "${!faceEnrolled ? "Register My Face" : "Scan Now"}".`}
                {isScanning    && "Hold still — reading your face."}
                {phase === "idle"       && "Camera starting…"}
                {phase === "requesting" && "Allow camera access when prompted."}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}