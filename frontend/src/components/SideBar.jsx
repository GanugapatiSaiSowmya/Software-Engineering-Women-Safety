import ShieldIcon from "./ShieldIcon";
import { NAV_ITEMS } from "../utils/data";

export default function Sidebar({ active, onNavigate }) {
  return (
    <nav style={{ width: 220, borderRight: "1px solid #0f172a", padding: "28px 0", flexShrink: 0 }}>
      <div style={{ fontSize: 9, letterSpacing: 2.5, color: "#334155", padding: "0 24px", marginBottom: 16 }}>
        COMMAND CENTER
      </div>

      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: "12px 24px", background: active === item.id ? "rgba(16,185,129,0.08)" : "transparent",
            border: "none", borderLeft: `2px solid ${active === item.id ? "#10b981" : "transparent"}`,
            cursor: "pointer", textAlign: "left", transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: 16, color: active === item.id ? "#10b981" : "#334155" }}>{item.icon}</span>
          <span style={{ fontSize: 12, color: active === item.id ? "#e2e8f0" : "#475569", letterSpacing: 0.5 }}>
            {item.label}
          </span>
        </button>
      ))}

      {/* Local guarantee badge */}
      <div style={{ margin: "28px 16px 0", padding: "12px", borderRadius: 8, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <ShieldIcon size={14} />
          <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.6 }}>
            100% Local Processing.<br />No images leave your device.
          </div>
        </div>
      </div>
    </nav>
  );
}
