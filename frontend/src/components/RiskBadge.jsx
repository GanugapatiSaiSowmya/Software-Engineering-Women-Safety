import { useTheme } from "../context/ThemeContext";

export default function RiskBadge({ level }) {
  const t = useTheme();
  const cfg = {
    red:   { bg: `${t.red}22`,   border: t.red,   color: t.red,   label: "HIGH RISK" },
    amber: { bg: `${t.amber}22`, border: t.amber, color: t.amber, label: "CAUTION"   },
    green: { bg: `${t.green}22`, border: t.green, color: t.green, label: "SAFE"       },
  }[level] ?? { bg: `${t.green}22`, border: t.green, color: t.green, label: "SAFE" };

  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: "2px 8px", borderRadius: 3, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}