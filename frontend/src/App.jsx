import { useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Landing      from "./pages/Landing";
import AuthPage     from "./pages/AuthPage";
import Header       from "./components/Header";
import Sidebar      from "./components/Sidebar";
import IdentityVault  from "./modules/IdentityVault";
import UploadGuard    from "./modules/UploadGuard";
import SafetyAudit    from "./modules/SafetyAudit";
import Takedown       from "./modules/Takedown";
import GuardianSOS    from "./modules/GuardianSOS";
import { NAV_ITEMS }  from "./utils/data";

const MODULES = {
  vault:    IdentityVault,
  guard:    UploadGuard,
  audit:    SafetyAudit,
  takedown: Takedown,
  sos:      GuardianSOS,
};

function Dashboard({ onLogout }) {
  const t = useTheme();
  const [active, setActive] = useState("vault");
  const ActiveModule = MODULES[active];
  const currentNav   = NAV_ITEMS.find(n => n.id === active);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Courier New', monospace", color: t.text }}>
      <style>{`
        @keyframes comingSoonPulse { 0%,100%{box-shadow:0 0 6px ${t.green}44,0 0 12px ${t.green}22} 50%{box-shadow:0 0 12px ${t.green}88,0 0 24px ${t.green}44} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes scan   { 0%{top:-20%} 100%{top:120%} }
        @keyframes grow   { to{width:100%} }
        @keyframes ripple { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:${t.bg}}
        ::-webkit-scrollbar-thumb{background:${t.borderMid};border-radius:2px}
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", width: 300, height: 300, top: "10%", right: "5%", borderRadius: "50%", background: `${t.green}0a`, filter: "blur(60px)", pointerEvents: "none", animation: "float 6s ease-in-out infinite" }} />
      <div style={{ position: "fixed", width: 200, height: 200, bottom: "20%", left: "3%", borderRadius: "50%", background: `${t.green}08`, filter: "blur(40px)", pointerEvents: "none", animation: "float 6s ease-in-out infinite", animationDelay: "2s" }} />

      <Header onLogout={onLogout} />

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", minHeight: "calc(100vh - 60px)" }}>
        <Sidebar active={active} onNavigate={setActive} />
        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: t.textFaint, marginBottom: 6 }}>
              {currentNav?.icon} MODULE
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: t.text }}>
              {currentNav?.label.toUpperCase()}
            </h1>
            <div style={{ marginTop: 8, width: 40, height: 2, background: t.green }} />
          </div>
          <ActiveModule />
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  // page: "landing" | "login" | "register" | "dashboard"
  const [page, setPage]         = useState("landing");
  const [authed, setAuthed]     = useState(false);

  const handleLogin = () => { setAuthed(true); setPage("dashboard"); };
  const handleLogout = () => { setAuthed(false); setPage("landing"); };

  if (page === "landing")   return <Landing onNavigate={setPage} />;
  if (page === "login")     return <AuthPage mode="login"    onNavigate={setPage} onLogin={handleLogin} />;
  if (page === "register")  return <AuthPage mode="register" onNavigate={setPage} onLogin={handleLogin} />;
  if (page === "dashboard") return <Dashboard onLogout={handleLogout} />;
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}