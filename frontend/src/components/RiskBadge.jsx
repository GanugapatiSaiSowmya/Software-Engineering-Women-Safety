const CONFIG = {
  red:   { bg: "rgba(239,68,68,0.15)",  border: "#ef4444", color: "#ef4444", label: "HIGH RISK" },
  amber: { bg: "rgba(245,158,11,0.15)", border: "#f59e0b", color: "#f59e0b", label: "CAUTION"   },
  green: { bg: "rgba(16,185,129,0.15)", border: "#10b981", color: "#10b981", label: "SAFE"       },
};

export default function RiskBadge({ level }) {
  const c = CONFIG[level] ?? CONFIG.green;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: "2px 8px",
      borderRadius: 3, background: c.bg, border: `1px solid ${c.border}`, color: c.color,
    }}>
      {c.label}
    </span>
  );
}

