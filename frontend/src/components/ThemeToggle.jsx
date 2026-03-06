import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const t = useTheme();
  return (
    <div
      onClick={t.toggle}
      title={t.dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        cursor: "pointer", userSelect: "none",
      }}
    >
      <span style={{ fontSize: 12, color: t.textDim }}>{t.dark ? "🌙" : "☀️"}</span>
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: t.dark ? "#1e293b" : "#cbd5e1",
        border: `1px solid ${t.dark ? "#334155" : "#94a3b8"}`,
        position: "relative", transition: "all 0.3s",
      }}>
        <div style={{
          position: "absolute", top: 3,
          left: t.dark ? 22 : 3,
          width: 16, height: 16, borderRadius: "50%",
          background: t.dark ? t.green : "#f59e0b",
          transition: "left 0.3s",
          boxShadow: `0 0 6px ${t.dark ? t.green : "#f59e0b"}`,
        }} />
      </div>
    </div>
  );
}
