import { useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Landing       from "./pages/Landing";
import AuthPage      from "./pages/AuthPage";
import Header        from "./components/Header";
import Sidebar       from "./components/Sidebar";
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

const PAGE_SUBTITLES = {
  vault:    "Keep your face and accounts safe",
  guard:    "Check a photo before you post it",
  audit:    "See what's happening with your photos online",
  takedown: "Take down fake content and build your case",
  sos:      "Alert your trusted people if you need help",
};

function Dashboard({ onLogout }) {
  const t = useTheme();
  const [active, setActive] = useState(
  localStorage.getItem("activeModule") || "vault"
  );
  const ActiveModule = MODULES[active];
  const currentNav   = NAV_ITEMS.find(n => n.id === active);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Courier New', monospace", color: t.text }}>
      <style>{`
        @keyframes pulse           { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes float           { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes scan            { 0%{top:-20%} 100%{top:120%} }
        @keyframes grow            { to{width:100%} }
        @keyframes ripple          { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
        @keyframes comingSoonPulse { 0%,100%{box-shadow:0 0 6px ${t.green}44,0 0 12px ${t.green}22} 50%{box-shadow:0 0 12px ${t.green}88,0 0 24px ${t.green}44} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:${t.bg}}
        ::-webkit-scrollbar-thumb{background:${t.borderMid};border-radius:2px}
        button:hover { opacity: 0.88; }
      `}</style>

      <div style={{ position: "fixed", width: 300, height: 300, top: "10%", right: "5%", borderRadius: "50%", background: `${t.green}08`, filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 200, height: 200, bottom: "20%", left: "3%", borderRadius: "50%", background: `${t.green}06`, filter: "blur(40px)", pointerEvents: "none" }} />

      <Header onLogout={onLogout} />

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", minHeight: "calc(100vh - 60px)" }}>
        <Sidebar
          active={active}
          onNavigate={(module) => {
            setActive(module);
            localStorage.setItem("activeModule", module);
          }}
        />
        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, color: t.text }}>
              {currentNav?.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: t.textDim, marginTop: 6 }}>{PAGE_SUBTITLES[active]}</div>
            <div style={{ marginTop: 10, width: 36, height: 2, background: t.green }} />
          </div>
          <ActiveModule />
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const [page, setPage] = useState(
  localStorage.getItem("isLoggedIn") === "true" ? "dashboard" : "landing"
  );
  const handleLogin = () => {
  localStorage.setItem("isLoggedIn", "true");
  setPage("dashboard");
  };
  const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("activeModule");
  setPage("landing");
  };
  if (page === "landing")   return <Landing onNavigate={setPage} />;
  if (page === "login")     return <AuthPage mode="login"    onNavigate={setPage} onLogin={handleLogin} />;
  if (page === "register")  return <AuthPage mode="register" onNavigate={setPage} onLogin={handleLogin} />;
  if (page === "dashboard") return <Dashboard onLogout={handleLogout} />;
  return null;
}

export default function App() {
  return <ThemeProvider><AppRoutes /></ThemeProvider>;
}