import { useState } from "react";
import Header      from "./components/Header";
import Sidebar     from "./components/Sidebar";
import IdentityVault from "./modules/IdentityVault";
import UploadGuard   from "./modules/UploadGuard";
import SafetyAudit   from "./modules/SafetyAudit";
import Takedown      from "./modules/Takedown";
import GuardianSOS   from "./modules/GuardianSOS";
import { NAV_ITEMS } from "./utils/data";

const MODULES = {
  vault:    IdentityVault,
  guard:    UploadGuard,
  audit:    SafetyAudit,
  takedown: Takedown,
  sos:      GuardianSOS,
};

export default function App() {
  const [active, setActive] = useState("vault");
  const ActiveModule = MODULES[active];
  const currentNav   = NAV_ITEMS.find(n => n.id === active);

  return (
    <div style={{ minHeight: "100vh", background: "#060d1b", fontFamily: "'Courier New', monospace", color: "#e2e8f0" }}>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes scan   { 0%{top:-20%} 100%{top:120%} }
        @keyframes grow   { to{width:100%} }
        @keyframes ripple { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#060d1b}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
      `}</style>

      {/* Ambient particles */}
      <div style={{ position: "fixed", width: 300, height: 300, top: "10%", right: "5%", borderRadius: "50%", background: "rgba(16,185,129,0.08)", filter: "blur(60px)", pointerEvents: "none", animation: "float 6s ease-in-out infinite" }} />
      <div style={{ position: "fixed", width: 200, height: 200, bottom: "20%", left: "3%", borderRadius: "50%", background: "rgba(16,185,129,0.06)", filter: "blur(40px)", pointerEvents: "none", animation: "float 6s ease-in-out infinite", animationDelay: "2s" }} />

      <Header />

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", minHeight: "calc(100vh - 60px)" }}>
        <Sidebar active={active} onNavigate={setActive} />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#334155", marginBottom: 6 }}>
              {currentNav?.icon} MODULE
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: "#e2e8f0" }}>
              {currentNav?.label.toUpperCase()}
            </h1>
            <div style={{ marginTop: 8, width: 40, height: 2, background: "#10b981" }} />
          </div>

          <ActiveModule />
        </main>
      </div>
    </div>
  );
}