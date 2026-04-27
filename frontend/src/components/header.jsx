import { useState, useEffect } from "react";
import ShieldIcon from "./ShieldIcon";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

export default function Header({ onLogout }) {
  const t = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <header style={{
      borderBottom: `1px solid ${t.border}`,
      background: t.header,
      backdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 100, padding: "0 32px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 60 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <ShieldIcon size={28} pulse />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 3, color: t.green }}>SHIELD.AI</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.textFaint }}>DIGITAL BODYGUARD</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 10, color: t.textFaint, fontFamily: "monospace" }}>
            {time.toLocaleTimeString()}
          </div>

          {/* Protected badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 4, background: `${t.green}18`, border: `1px solid ${t.green}44` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.green, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: t.green, letterSpacing: 1.5 }}>PROTECTED</span>
          </div>

          <ThemeToggle />

          {/* No-cloud badge */}
          <div title="Processing 100% Local. No images are being uploaded to our servers." style={{ cursor: "help" }}>
            <ShieldIcon size={20} />
          </div>

          {/* Logout */}
          {onLogout && (
            <button onClick={onLogout} style={{ background: "transparent", border: `1px solid ${t.borderMid}`, color: "#dcd4d4", fontSize: 10, letterSpacing: 1.5, padding: "5px 12px", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>
              LOGOUT
            </button>
          )}
        </div>
      </div>
    </header>
  );
}