import RiskBadge from "../components/RiskBadge";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { RISK_DATA, ALERTS } from "../utils/data";

export default function SafetyAudit() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Risk Heatmap */}
      <div style={card}>
        <div style={cardTitle}><span style={dot("#ef4444")} />RISK HEATMAP — LAST 7 DAYS</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 20, height: 100 }}>
          {RISK_DATA.map((d, i) => {
            const h     = (d.level / 10) * 90;
            const color = d.level >= 7 ? "#ef4444" : d.level >= 4 ? "#f59e0b" : "#10b981";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color, fontWeight: 700 }}>{d.level}</div>
                <div style={{ width: "100%", height: h, background: color, borderRadius: "3px 3px 0 0", opacity: 0.8, boxShadow: `0 0 10px ${color}66` }} />
                <div style={{ fontSize: 10, color: "#475569" }}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Likeness Alert Feed */}
      <div style={card}>
        <div style={cardTitle}><span style={dot("#818cf8")} />LIKENESS ALERT FEED</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {ALERTS.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid #0f172a" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: `rgba(${a.status === "red" ? "239,68,68" : a.status === "amber" ? "245,158,11" : "16,185,129"},0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>◉</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "monospace" }}>{a.site}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{a.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: a.status === "red" ? "#ef4444" : a.status === "amber" ? "#f59e0b" : "#10b981" }}>{a.score}%</div>
                <div style={{ fontSize: 10, color: "#475569" }}>deepfake prob.</div>
              </div>
              <RiskBadge level={a.status} />
              <button style={{ ...actionBtn("#818cf8"), fontSize: 10, padding: "4px 10px" }}>ANALYZE</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
