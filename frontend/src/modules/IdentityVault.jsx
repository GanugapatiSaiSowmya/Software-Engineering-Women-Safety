import { useState } from "react";
import ShieldIcon from "../components/ShieldIcon";
import RiskBadge from "../components/RiskBadge";
import Toggle from "../components/Toggle";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { ALIASES } from "../utils/data";
import { useTheme } from "../context/ThemeContext";

export default function IdentityVault() {
  const t = useTheme();
  const [scanned, setScanned]     = useState(false);
  const [scanning, setScanning]   = useState(false);
  const [localOnly, setLocalOnly] = useState(true);
  const [aliases]                 = useState(ALIASES);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setScanned(true); }, 2200);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div style={card(t)}>
        <div style={cardTitle(t)}><span style={dot(t.green)} />BIOMETRIC ENROLLMENT</div>
        <div onClick={!scanned ? handleScan : undefined}
          style={{ position: "relative", margin: "20px auto", width: 200, height: 200, borderRadius: "50%", border: `2px solid ${scanned ? t.green : t.borderMid}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: scanned ? "default" : "pointer", overflow: "hidden", background: `${t.green}06`, transition: "border-color 0.4s" }}>
          {scanning && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 40%, ${t.green}66 50%, transparent 60%)`, animation: "scan 1.5s linear infinite" }} />}
          {scanned
            ? <div style={{ textAlign: "center" }}><div style={{ fontSize: 48, color: t.green }}>◈</div><div style={{ color: t.green, fontSize: 12, marginTop: 8, letterSpacing: 2 }}>ENROLLED</div></div>
            : scanning
            ? <div style={{ color: t.green, fontSize: 13, letterSpacing: 1 }}>SCANNING…</div>
            : <div style={{ textAlign: "center", color: t.textFaint }}><div style={{ fontSize: 40 }}>◈</div><div style={{ fontSize: 11, marginTop: 8, letterSpacing: 1.5 }}>TAP TO SCAN</div></div>
          }
          {scanned && [0,60,120,180,240,300].map(deg => (
            <div key={deg} style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: t.green, top: "50%", left: "50%", transform: `rotate(${deg}deg) translateY(-95px)`, boxShadow: `0 0 6px ${t.green}` }} />
          ))}
        </div>
        {scanned && (
          <div style={{ background: `${t.green}10`, border: `1px solid ${t.green}33`, borderRadius: 8, padding: "10px 16px", fontSize: 12, color: t.textMid, lineHeight: 1.8 }}>
            <div>🔑 128-d embedding extracted</div>
            <div>🔒 AES-256 encrypted locally</div>
            <div>✓ Face ID hash: <span style={{ color: t.green, fontFamily: "monospace" }}>a4f2…9c1b</span></div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={card(t)}>
          <div style={cardTitle(t)}><span style={dot(t.amber)} />LOCAL ENCRYPTION</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: t.text }}>Store biometrics locally only</div>
              <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>No cloud sync, ever.</div>
            </div>
            <Toggle value={localOnly} onChange={setLocalOnly} />
          </div>
          {localOnly && (
            <div style={{ marginTop: 12, fontSize: 11, color: t.green, display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldIcon size={14} /> Your biometric data is stored only on this device
            </div>
          )}
        </div>

        <div style={card(t)}>
          <div style={cardTitle(t)}><span style={dot(t.purple)} />ALIAS MANAGEMENT</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {aliases.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 6, background: a.linked ? `${t.green}0a` : t.bgCard, border: `1px solid ${a.linked ? t.green + "33" : t.border}` }}>
                <div>
                  <div style={{ fontSize: 12, color: t.text }}>{a.platform}</div>
                  <div style={{ fontSize: 11, color: a.linked ? t.green : t.textDim, fontFamily: "monospace" }}>{a.linked ? a.handle : "Not linked"}</div>
                </div>
                <RiskBadge level={a.linked ? "green" : "red"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}