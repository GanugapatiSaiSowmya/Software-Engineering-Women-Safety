import ShieldIcon from "./ShieldIcon";
import { NAV_ITEMS } from "../utils/data";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar({ active, onNavigate }) {
  const t = useTheme();

  return (
    <nav style={{ width: 220, borderRight: `1px solid ${t.border}`, padding: "28px 0", flexShrink: 0, background: t.sidebar }}>
      <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.textDim, padding: "0 24px", marginBottom: 16 }}>
        COMMAND CENTER
      </div>

      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        const isLive   = item.id === "guard";
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              padding: "12px 24px",
              background: isActive ? `${t.green}12` : "transparent",
              border: "none",
              borderLeft: `2px solid ${isActive ? t.green : "transparent"}`,
              cursor: "pointer", textAlign: "left", transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 16, color: isActive ? t.green : t.dark ? t.textFaint : "#2a5a80" }}>{item.icon}</span>
            <span style={{ fontSize: 12, color: isActive ? t.text : t.dark ? t.textDim : "#0a2a45", letterSpacing: 0.5, fontFamily: "'Courier New', monospace", flex: 1 }}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Local guarantee */}
      <div style={{ margin: "28px 16px 0", padding: "12px", borderRadius: 8, background: `${t.green}08`, border: `1px solid ${t.green}22` }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <ShieldIcon size={14} />
          <div style={{ fontSize: 10, color: t.textDim, lineHeight: 1.6 }}>
            100% Local Processing.<br />No images leave your device.
          </div>
        </div>
      </div>
    </nav>
  );
}