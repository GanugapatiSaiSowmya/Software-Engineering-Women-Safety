import { useState } from "react";
import RiskBadge from "../components/RiskBadge";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { CASES } from "../utils/data";
import { useTheme } from "../context/ThemeContext";

const EVIDENCE_STEPS = [
  { label: "Timestamped screenshots",  threshold: 33  },
  { label: "SHA-256 cryptographic hash", threshold: 66 },
  { label: "Metadata proof package",    threshold: 100 },
];

export default function Takedown() {
  const t = useTheme();
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
      <div style={card(t)}>
        <div style={cardTitle(t)}><span style={dot(t.red)} />EVIDENCE BUNDLE GENERATOR</div>
        <div style={{ marginTop: 20 }}>
          {EVIDENCE_STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${progress >= s.threshold ? t.green : t.borderMid}`, background: progress >= s.threshold ? `${t.green}22` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: t.green, transition: "all 0.4s", flexShrink: 0 }}>
                {progress >= s.threshold ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 12, color: progress >= s.threshold ? t.green : t.textDim, transition: "color 0.4s" }}>{s.label}</div>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: t.textDim, marginBottom: 6 }}>
              <span>Building bundle…</span><span>{progress}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: t.border, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${t.green}, #06d6a0)`, borderRadius: 3, transition: "width 0.1s" }} />
            </div>
          </div>

          {!building && !built && (
            <button onClick={buildEvidence} style={{ ...actionBtn(t.green), marginTop: 20, width: "100%", padding: "12px", fontSize: 13, textAlign: "center" }}>
              ⊕ BUILD EVIDENCE BUNDLE
            </button>
          )}
          {built && (
            <div style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, background: `${t.green}14`, border: `1px solid ${t.green}`, fontSize: 12, color: t.green }}>
              ✓ Bundle ready — 3 files secured
            </div>
          )}
        </div>
      </div>

      <div style={card(t)}>
        <div style={cardTitle(t)}><span style={dot(t.amber)} />CASE TRACKER</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          {Object.entries(CASES).map(([col, items]) => (
            <div key={col}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: t.textDim, marginBottom: 8, textTransform: "uppercase" }}>{col}</div>
              {items.map(item => {
                const bc = item.urgency === "red" ? t.red : item.urgency === "amber" ? t.amber : t.green;
                return (
                  <div key={item.id} style={{ padding: "8px 10px", borderRadius: 6, background: t.bgCard, border: `1px solid ${bc}44`, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: t.text, lineHeight: 1.4 }}>{item.title}</div>
                    <div style={{ marginTop: 6 }}><RiskBadge level={item.urgency} /></div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}