import RiskBadge from "../components/RiskBadge";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { RISK_DATA, ALERTS } from "../utils/data";
import { useTheme } from "../context/ThemeContext";

export default function SafetyAudit() {
  const t = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={card(t)}>
        <div style={cardTitle(t)}><span style={dot(t.red)} />RISK HEATMAP — LAST 7 DAYS</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 20, height: 100 }}>
          {RISK_DATA.map((d, i) => {
            const h     = (d.level / 10) * 90;
            const color = d.level >= 7 ? t.red : d.level >= 4 ? t.amber : t.green;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color, fontWeight: 700 }}>{d.level}</div>
                <div style={{ width: "100%", height: h, background: color, borderRadius: "3px 3px 0 0", opacity: 0.8, boxShadow: `0 0 10px ${color}66` }} />
                <div style={{ fontSize: 10, color: t.textDim }}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={card(t)}>
        <div style={cardTitle(t)}><span style={dot(t.purple)} />LIKENESS ALERT FEED</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {ALERTS.map((a, i) => {
            const color = a.status === "red" ? t.red : a.status === "amber" ? t.amber : t.green;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 8, background: t.bgCard, border: `1px solid ${t.border}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color }}>◉</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: t.text, fontFamily: "monospace" }}>{a.site}</div>
                  <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>{a.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color }}>{a.score}%</div>
                  <div style={{ fontSize: 10, color: t.textDim }}>deepfake prob.</div>
                </div>
                <RiskBadge level={a.status} />
                <button style={{ ...actionBtn(t.purple), fontSize: 10, padding: "4px 10px" }}>ANALYZE</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}