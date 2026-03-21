import { useState, useRef, useEffect } from "react";
import ShieldIcon from "../components/ShieldIcon";
import Toggle from "../components/Toggle";
import { card, cardTitle, dot } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const PLATFORMS = [
  { name: "Instagram",   icon: "📸", color: "#E1306C" },
  { name: "LinkedIn",    icon: "💼", color: "#0A66C2" },
  { name: "X (Twitter)", icon: "🐦", color: "#1DA1F2" },
  { name: "Facebook",    icon: "👤", color: "#1877F2" },
  { name: "Snapchat",    icon: "👻", color: "#FFFC00" },
  { name: "TikTok",      icon: "🎵", color: "#FF0050" },
  { name: "YouTube",     icon: "▶️",  color: "#FF0000" },
  { name: "Other",       icon: "🔗", color: "#94a3b8" },
];

const STATUS = {
  watching: { label: "Watching",     color: "#10b981" },
  idle:     { label: "Not scanning", color: "#f59e0b" },
  unlinked: { label: "Not linked",   color: "#ef4444" },
};

const INITIAL_ALIASES = [
  { id: 1, platform: "Instagram",   handle: "@priya.sharma",    linked: true,  status: "watching" },
  { id: 2, platform: "LinkedIn",    handle: "priya-sharma-dev", linked: true,  status: "watching" },
  { id: 3, platform: "X (Twitter)", handle: "",                 linked: false, status: "unlinked" },
];

// ── Camera Scanner ────────────────────────────────────────────────────────────
function CameraScanner({ onEnrolled, t }) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [phase, setPhase]         = useState("idle"); // idle|requesting|live|scanning|done|error
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress]   = useState(0);
  const [errorMsg, setErrorMsg]   = useState("");

  useEffect(() => {
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  const startCamera = async () => {
    setPhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPhase("live");
    } catch (err) {
      setErrorMsg(err.name === "NotAllowedError"
        ? "Camera access was denied. Please allow camera access in your browser settings and try again."
        : "Could not access camera. Make sure no other app is using it.");
      setPhase("error");
    }
  };

  const startScan = () => {
    setPhase("scanning"); setCountdown(3);
    let c = 3;
    const cd = setInterval(() => {
      c--; setCountdown(c);
      if (c <= 0) { clearInterval(cd); runScan(); }
    }, 1000);
  };

  const runScan = () => {
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          setPhase("done");
          onEnrolled();
          return 100;
        }
        return p + 3;
      });
    }, 60);
  };

  const reset = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setPhase("idle"); setProgress(0); setCountdown(3); setErrorMsg("");
  };

  // Ring color + glow based on phase
  const ringColor   = phase === "done" ? t.green : phase === "error" ? t.red : phase === "live" || phase === "scanning" ? t.green : t.borderMid;
  const ringGlow    = (phase === "live" || phase === "scanning" || phase === "done") ? `0 0 0 6px ${t.green}22, 0 0 0 12px ${t.green}0a` : "none";
  const ringAnim    = phase === "scanning" ? "pulse 1s ease-in-out infinite" : phase === "done" ? "pulse 2.5s ease-in-out infinite" : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

      {/* ── Circle ── */}
      <div style={{ position: "relative", width: 220, height: 220 }}>

        {/* Outer pulsing ring */}
        <div style={{
          position: "absolute", inset: -8, borderRadius: "50%",
          border: `2px solid ${ringColor}44`,
          boxShadow: ringGlow,
          animation: ringAnim,
          transition: "all 0.4s",
        }} />

        {/* Second ring — shown while scanning/done */}
        {(phase === "scanning" || phase === "done") && (
          <div style={{
            position: "absolute", inset: -16, borderRadius: "50%",
            border: `1px solid ${t.green}18`,
            animation: "pulse 2s ease-in-out infinite 0.4s",
          }} />
        )}

        {/* Main circle */}
        <div style={{
          position: "relative", width: 220, height: 220, borderRadius: "50%",
          overflow: "hidden", background: t.dark ? "#020810" : "#0a1628",
          border: `2px solid ${ringColor}`,
          transition: "border-color 0.4s",
        }}>
          {/* Live video */}
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width: "100%", height: "100%", objectFit: "cover", display: (phase === "live" || phase === "scanning") ? "block" : "none", transform: "scaleX(-1)" }}
          />

          {/* Face guide brackets — only when live/scanning */}
          {(phase === "live" || phase === "scanning") && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {[
                { top: "28%", left: "28%",  borderTop: `2px solid ${t.green}`, borderLeft:  `2px solid ${t.green}` },
                { top: "28%", right: "28%", borderTop: `2px solid ${t.green}`, borderRight: `2px solid ${t.green}` },
                { bottom: "28%", left: "28%",  borderBottom: `2px solid ${t.green}`, borderLeft:  `2px solid ${t.green}` },
                { bottom: "28%", right: "28%", borderBottom: `2px solid ${t.green}`, borderRight: `2px solid ${t.green}` },
              ].map((s, i) => <div key={i} style={{ position: "absolute", width: 24, height: 24, ...s }} />)}

              {/* Scan sweep line */}
              {phase === "scanning" && (
                <div style={{ position: "absolute", left: "20%", right: "20%", height: 2, background: `linear-gradient(90deg, transparent, ${t.green}, transparent)`, animation: "scan 1.2s linear infinite", boxShadow: `0 0 8px ${t.green}` }} />
              )}

              {/* Countdown */}
              {phase === "scanning" && countdown > 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 52, fontWeight: 700, color: t.green, textShadow: `0 0 20px ${t.green}`, opacity: 0.9 }}>{countdown}</div>
                </div>
              )}
            </div>
          )}

          {/* Idle */}
          {phase === "idle" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: t.textFaint }}>
              <div style={{ fontSize: 36 }}>📷</div>
              <div style={{ fontSize: 10, letterSpacing: 1.5 }}>TAP TO START</div>
            </div>
          )}

          {/* Requesting */}
          {phase === "requesting" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 10, color: t.green, letterSpacing: 1, animation: "pulse 1.5s infinite" }}>Requesting…</div>
            </div>
          )}

          {/* Done */}
          {phase === "done" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: `${t.green}12` }}>
              <div style={{ fontSize: 42, color: t.green }}>◈</div>
              <div style={{ fontSize: 11, color: t.green, letterSpacing: 2, fontWeight: 700 }}>FACE ENROLLED</div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>🚫</div>
              <div style={{ fontSize: 10, color: t.red, lineHeight: 1.6 }}>{errorMsg}</div>
            </div>
          )}

          {/* Progress bar at bottom edge */}
          {/* {phase === "scanning" && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: t.border }}>
              <div style={{ height: "100%", width: `${progress}%`, background: t.green, transition: "width 0.1s", boxShadow: `0 0 6px ${t.green}` }} />
            </div>
          )} */}
        </div>
      </div>

      {/* ── Action button ── */}
      {phase === "idle" && (
        <button onClick={startCamera} style={{ padding: "10px 32px", borderRadius: 7, border: `1px solid ${t.green}`, background: `${t.green}14`, color: t.green, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
          Open Camera
        </button>
      )}
      {phase === "live" && (
        <button onClick={startScan} style={{ padding: "10px 32px", borderRadius: 7, border: `1px solid ${t.green}`, background: t.green, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
          ◈ Scan My Face
        </button>
      )}
      {phase === "scanning" && (
        <div style={{ fontSize: 11, color: t.textDim, letterSpacing: 1 }}>Hold still… {progress}%</div>
      )}
      {phase === "done" && (
        <button onClick={reset} style={{ padding: "8px 24px", borderRadius: 7, border: `1px solid ${t.borderMid}`, background: "transparent", color: t.textDim, fontSize: 11, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
          Re-scan
        </button>
      )}
      {phase === "error" && (
        <button onClick={reset} style={{ padding: "10px 24px", borderRadius: 7, border: `1px solid ${t.red}`, background: `${t.red}10`, color: t.red, fontSize: 11, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
          Try Again
        </button>
      )}

      {/* Hint */}
      <div style={{ fontSize: 10, color: t.textFaint, textAlign: "center", maxWidth: 200, lineHeight: 1.6 }}>
        {phase === "idle"     && "No photo is saved. We only create a secure code from your face."}
        {phase === "live"     && "Centre your face in the frame, then tap Scan My Face."}
        {phase === "scanning" && "Hold still — creating your secure face code."}
        {phase === "done"     && "Your face code is saved securely on this device only."}
        {phase === "error"    && "Check your browser camera permissions and try again."}
        {phase === "requesting" && "Allow camera access when your browser asks."}
      </div>
    </div>
  );
}

// ── Alias Manager ─────────────────────────────────────────────────────────────
function AliasManager({ t }) {
  const [aliases, setAliases]         = useState(INITIAL_ALIASES);
  const [adding, setAdding]           = useState(false);
  const [newPlatform, setNewPlatform] = useState("Instagram");
  const [newHandle, setNewHandle]     = useState("");
  const [error, setError]             = useState("");

  const getPlatform = (name) => PLATFORMS.find(p => p.name === name) || PLATFORMS[PLATFORMS.length - 1];

  const addAlias = () => {
    if (!newHandle.trim()) { setError("Please enter a username or profile URL."); return; }
    setAliases(prev => [...prev, {
      id: Date.now(), platform: newPlatform,
      handle: newHandle.trim().startsWith("@") ? newHandle.trim() : `@${newHandle.trim()}`,
      linked: true, status: "watching",
    }]);
    setNewHandle(""); setAdding(false); setError("");
  };

  const removeAlias  = (id) => setAliases(prev => prev.filter(a => a.id !== id));
  const toggleStatus = (id) => setAliases(prev => prev.map(a =>
    a.id === id && a.linked ? { ...a, status: a.status === "watching" ? "idle" : "watching" } : a
  ));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {aliases.map(a => {
        const plat = getPlatform(a.platform);
        const st   = STATUS[a.status];
        return (
          <div key={a.id} style={{ padding: "12px 14px", borderRadius: 8, background: a.linked ? `${t.green}06` : `${t.red}06`, border: `1px solid ${a.linked ? t.green + "33" : t.red + "33"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${plat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {plat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{a.platform}</div>
                <div style={{ fontSize: 11, color: a.linked ? t.green : t.red, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.linked ? a.handle : "Not linked"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, cursor: a.linked ? "pointer" : "default" }} onClick={() => toggleStatus(a.id)} title={a.linked ? "Click to toggle monitoring" : ""}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.color, boxShadow: `0 0 5px ${st.color}` }} />
                <span style={{ fontSize: 9, color: st.color, letterSpacing: 1, whiteSpace: "nowrap" }}>{st.label}</span>
              </div>
              <button onClick={() => removeAlias(a.id)} title="Remove" style={{ background: "transparent", border: "none", color: t.textFaint, cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1 }}>×</button>
            </div>
          </div>
        );
      })}

      {adding ? (
        <div style={{ padding: "14px", borderRadius: 8, border: `1px solid ${t.green}44`, background: `${t.green}06` }}>
          <div style={{ fontSize: 11, color: t.textDim, marginBottom: 10 }}>Which platform do you want to monitor?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 10 }}>
            {PLATFORMS.map(p => (
              <button key={p.name} onClick={() => setNewPlatform(p.name)}
                style={{ padding: "7px 10px", borderRadius: 6, border: `1px solid ${newPlatform === p.name ? t.green : t.border}`, background: newPlatform === p.name ? `${t.green}14` : "transparent", color: newPlatform === p.name ? t.green : t.textDim, fontSize: 11, cursor: "pointer", fontFamily: "'Courier New', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{p.icon}</span> {p.name}
              </button>
            ))}
          </div>
          <input value={newHandle} onChange={e => { setNewHandle(e.target.value); setError(""); }}
            placeholder="Your username or profile URL"
            onKeyDown={e => e.key === "Enter" && addAlias()}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: `1px solid ${error ? t.red : t.borderMid}`, background: t.input, color: t.text, fontSize: 12, fontFamily: "'Courier New', monospace", outline: "none", marginBottom: error ? 6 : 10 }}
          />
          {error && <div style={{ fontSize: 11, color: t.red, marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addAlias} style={{ flex: 1, padding: "9px", borderRadius: 6, border: `1px solid ${t.green}`, background: t.green, color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
              Add & Start Monitoring
            </button>
            <button onClick={() => { setAdding(false); setError(""); setNewHandle(""); }} style={{ padding: "9px 14px", borderRadius: 6, border: `1px solid ${t.borderMid}`, background: "transparent", color: t.textDim, fontSize: 11, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ padding: "10px", borderRadius: 8, border: `1px dashed ${t.borderMid}`, background: "transparent", color: t.textDim, fontSize: 11, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
          + Connect another account
        </button>
      )}
    </div>
  );
}

// ── Main module ───────────────────────────────────────────────────────────────
export default function IdentityVault() {
  const t = useTheme();
  const [enrolled, setEnrolled]   = useState(false);
  const [localOnly, setLocalOnly] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Friendly intro
      <div style={{ padding: "14px 18px", borderRadius: 10, background: `${t.green}08`, border: `1px solid ${t.green}22`, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 20, marginTop: 1 }}>👤</div>
        <div>
          <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginBottom: 4 }}>This is your personal safety profile</div>
          <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.7 }}>
            Scan your face so we can recognize it across the web. Link your social accounts so we can watch them for you. Everything stays on your device — nothing is ever uploaded.
          </div>
        </div>
      </div> */}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Left — Camera + Encryption */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card(t)}>
            <div style={cardTitle(t)}><span style={dot(enrolled ? t.green : t.amber)} />BIOMETRIC ENROLLMENT</div>
            <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, marginBottom: 20, lineHeight: 1.6 }}>
              {enrolled
                ? "Your face is enrolled. We'll use this to detect if your photo appears online without your permission."
                : "Open your camera below and scan your face. No photo is saved — we only create a secure code."}
            </div>
            <CameraScanner onEnrolled={() => setEnrolled(true)} t={t} />
          </div>

          {/* <div style={card(t)}>
            <div style={cardTitle(t)}><span style={dot(localOnly ? t.green : t.textFaint)} />LOCAL ENCRYPTION</div>
            <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, marginBottom: 12, lineHeight: 1.6 }}>
              Keep this on — your face data stays on this device and goes nowhere else.
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, color: t.text }}>Store biometrics locally only</div>
                <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>No cloud sync, ever.</div>
              </div>
              <Toggle value={localOnly} onChange={setLocalOnly} />
            </div>
            {localOnly && (
              <div style={{ marginTop: 12, fontSize: 11, color: t.green, display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldIcon size={13} /> Your biometric data is stored only on this device
              </div>
            )}
          </div> */}
        </div>

        {/* Right — Alias Manager */}
        <div style={card(t)}>
          <div style={cardTitle(t)}><span style={dot(t.purple)} />ALIAS MANAGEMENT</div>
          <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, marginBottom: 16, lineHeight: 1.6 }}>
            These are the accounts we'll monitor for you. A <span style={{ color: t.green }}>green dot</span> means we're actively watching it. Tap a status dot to pause. Hit <b>×</b> to remove.
          </div>
          <AliasManager t={t} />
        </div>
      </div>
    </div>
  );
}