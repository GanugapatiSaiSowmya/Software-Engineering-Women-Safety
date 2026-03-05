import { useState, useEffect } from "react";
import ShieldIcon from "./ShieldIcon";

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      borderBottom: "1px solid #0f172a",
      background: "rgba(6,13,27,0.9)",
      backdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 100, padding: "0 32px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 60 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <ShieldIcon size={28} pulse />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 3, color: "#10b981" }}>SHIELD.AI</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#334155" }}>DIGITAL BODYGUARD</div>
          </div>
        </div>

        {/* Status strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>
            {time.toLocaleTimeString()}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "4px 12px",
            borderRadius: 4, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: "#10b981", letterSpacing: 1.5 }}>PROTECTED</span>
          </div>
          <div title="Processing 100% Local. No images are being uploaded to our servers." style={{ cursor: "help" }}>
            <ShieldIcon size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
