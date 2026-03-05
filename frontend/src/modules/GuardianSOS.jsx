import { useState } from "react";
import Toggle from "../components/Toggle";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { GUARDIANS } from "../utils/data";

export default function GuardianSOS() {
  const [highAlert, setHighAlert] = useState(false);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Trusted Circle */}
      <div style={card}>
        <div style={cardTitle}><span style={dot("#818cf8")} />TRUSTED CIRCLE</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {GUARDIANS.map((g, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.2)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(129,140,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#818cf8" }}>
                {g.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>{g.name}</div>
                <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>{g.phone}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            </div>
          ))}
          <button style={{ ...actionBtn("#818cf8"), marginTop: 6, fontSize: 11 }}>⊕ ADD GUARDIAN</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* High Alert Toggle */}
        <div style={{ ...card, border: highAlert ? "1px solid rgba(239,68,68,0.5)" : "1px solid #1e293b", transition: "border-color 0.4s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={cardTitle}><span style={dot(highAlert ? "#ef4444" : "#475569")} />HIGH-ALERT MODE</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Auto-broadcasts GPS on Level 10 threat</div>
            </div>
            <Toggle value={highAlert} onChange={setHighAlert} activeColor="#ef4444" />
          </div>
          {highAlert && (
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: 11, color: "#ef4444", animation: "pulse 2s ease-in-out infinite" }}>
              ⚠ HIGH-ALERT ACTIVE — Guardians notified of your location
            </div>
          )}
        </div>

        {/* Live Location Map */}
        <div style={card}>
          <div style={cardTitle}><span style={dot(highAlert ? "#10b981" : "#334155")} />LIVE LOCATION BROADCAST</div>
          <div style={{ marginTop: 14, borderRadius: 8, overflow: "hidden", height: 160, background: "linear-gradient(135deg, #0a1628, #0f2040)", position: "relative", border: "1px solid #0f172a" }}>
            {[...Array(6)].map((_, i) => <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${i * 20}%`, height: 1, background: "rgba(16,185,129,0.07)" }} />)}
            {[...Array(8)].map((_, i) => <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 14}%`, width: 1, background: "rgba(16,185,129,0.07)" }} />)}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: highAlert ? "#ef4444" : "#10b981", boxShadow: `0 0 ${highAlert ? 16 : 8}px ${highAlert ? "#ef4444" : "#10b981"}`, position: "relative", zIndex: 2 }} />
              {highAlert && <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.4)", animation: "ripple 1.5s ease-out infinite" }} />}
            </div>
            {!highAlert && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#1e293b", fontSize: 12, letterSpacing: 1.5 }}>STANDBY</div>
            )}
          </div>
          {highAlert && (
            <div style={{ marginTop: 10, fontSize: 11, color: "#10b981", fontFamily: "monospace" }}>
              📍 28.6139° N, 77.2090° E · Sharing with 3 guardians
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
