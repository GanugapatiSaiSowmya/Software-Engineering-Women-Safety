export default function Toggle({ value, onChange, activeColor = "#10b981" }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 13,
        background: value ? activeColor : "#1e293b",
        border: `1px solid ${value ? activeColor : "#334155"}`,
        cursor: "pointer", position: "relative", transition: "background 0.3s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 24 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.3s",
        boxShadow: value ? `0 0 8px ${activeColor}` : "none",
      }} />
    </div>
  );
}
