import { useState } from "react";
import RiskBadge from "../components/RiskBadge";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { CASES } from "../utils/data";

const EVIDENCE_STEPS = [
  { label: "Timestamped screenshots", threshold: 33  },
  { label: "SHA-256 cryptographic hash", threshold: 66 },
  { label: "Metadata proof package",    threshold: 100 },
];

export default function Takedown() {
  const [progress, setProgress] = useState(0);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt]       = useState(false);

  const buildEvidence = () => {
    setBuilding(true); setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setBuilding(false); setBuilt(true); return 100; }
        return p + 5;
      });
    }, 80);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Evidence Builder */}
      <div style={card}>
        <div style={cardTitle}><span style={dot("#ef4444")} />EVIDENCE BUNDLE GENERATOR</div>
        <div style={{ marginTop: 20 }}>
          {EVIDENCE_STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${progress >= s.threshold ? "#10b981" : "#1e293b"}`, background: progress >= s.threshold ? "rgba(16,185,129,0.2)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#10b981", transition: "all 0.4s", flexShrink: 0 }}>
                {progress >= s.threshold ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 12, color: progress >= s.threshold ? "#10b981" : "#475569", transition: "color 0.4s" }}>{s.label}</div>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 6 }}>
              <span>Building bundle…</span><span>{progress}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#0f172a", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #10b981, #06d6a0)", borderRadius: 3, transition: "width 0.1s" }} />
            </div>
          </div>

          {!building && !built && (
            <button onClick={buildEvidence} style={{ ...actionBtn("#10b981"), marginTop: 20, width: "100%", padding: "12px", fontSize: 13 }}>
              ⊕ BUILD EVIDENCE BUNDLE
            </button>
          )}
          {built && (
            <div style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid #10b981", fontSize: 12, color: "#10b981" }}>
              ✓ Bundle ready — 3 files secured
            </div>
          )}
        </div>
      </div>

      {/* Kanban Case Tracker */}
      <div style={card}>
        <div style={cardTitle}><span style={dot("#f59e0b")} />CASE TRACKER</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          {Object.entries(CASES).map(([col, items]) => (
            <div key={col}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#475569", marginBottom: 8, textTransform: "uppercase" }}>{col}</div>
              {items.map(item => (
                <div key={item.id} style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,0.02)", border: `1px solid ${item.urgency === "red" ? "rgba(239,68,68,0.3)" : item.urgency === "amber" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.2)"}`, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.4 }}>{item.title}</div>
                  <div style={{ marginTop: 6 }}><RiskBadge level={item.urgency} /></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
