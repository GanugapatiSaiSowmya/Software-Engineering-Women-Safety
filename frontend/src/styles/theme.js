export const card = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid #0f172a",
  borderRadius: 12,
  padding: "20px 22px",
};

export const cardTitle = {
  display: "flex", alignItems: "center", gap: 8,
  fontSize: 11, letterSpacing: 2, color: "#64748b", fontWeight: 700,
};

export const dot = (color) => ({
  display: "inline-block", width: 6, height: 6,
  borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`,
});

export const actionBtn = (color) => {
  const rgb =
    color === "#ef4444" ? "239,68,68"
    : color === "#f59e0b" ? "245,158,11"
    : color === "#818cf8" ? "129,140,248"
    : "16,185,129";
  return {
    padding: "6px 14px", borderRadius: 4, border: `1px solid ${color}`,
    background: `rgba(${rgb},0.1)`, color, fontSize: 11, letterSpacing: 1.5,
    cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: 700,
    whiteSpace: "nowrap", transition: "all 0.2s",
  };
};

export const colors = {
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#818cf8",
  bg: "#060d1b",
};
