import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Landing       from "./pages/Landing";
import AuthPage      from "./pages/AuthPage";
import FaceVerify    from "./pages/FaceVerify";
import Header        from "./components/Header";
import Sidebar       from "./components/Sidebar";
import UploadGuard   from "./modules/UploadGuard";
import SafetyAudit   from "./modules/SafetyAudit";
import Takedown      from "./modules/Takedown";
import GuardianSOS   from "./modules/GuardianSOS";
import { NAV_ITEMS } from "./utils/data";

const MODULES = {
  guard:    UploadGuard,
  audit:    SafetyAudit,
  takedown: Takedown,
  sos:      GuardianSOS,
};

const PAGE_SUBTITLES = {
  guard:    "Check a photo before you post it",
  audit:    "See what's happening with your photos online",
  takedown: "Take down fake content and build your case",
  sos:      "Alert your trusted people if you need help",
};

function Dashboard({ onLogout }) {
  const t = useTheme();
  const [active, setActive] = useState("guard");
  const ActiveModule = MODULES[active];
  const currentNav   = NAV_ITEMS.find(n => n.id === active);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Courier New', monospace", color: t.text }}>
      <Header onLogout={onLogout} />

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", minHeight: "calc(100vh - 60px)" }}>
        <Sidebar active={active} onNavigate={setActive} />
        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
              {currentNav?.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 12, marginTop: 6 }}>{PAGE_SUBTITLES[active]}</div>
            <div style={{ marginTop: 10, width: 36, height: 2, background: t.green }} />
          </div>
          <ActiveModule />
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const [page, setPage] = useState("landing");

  // ✅ NEW: restore login state on reload
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setPage("dashboard");
    }
  }, []);

  // ✅ after login → save token handled in AuthPage
  const handleLoginSuccess = () => {
    setPage("verify");
  };

  const handleVerified = () => {
    setPage("dashboard");
  };

  // ✅ logout clears token
  const handleLogout = () => {
    localStorage.removeItem("token");
    setPage("landing");
  };

  if (page === "landing")   return <Landing onNavigate={setPage} />;
  if (page === "login")     return <AuthPage mode="login"    onNavigate={setPage} onLogin={handleLoginSuccess} />;
  if (page === "register")  return <AuthPage mode="register" onNavigate={setPage} onLogin={handleLoginSuccess} />;
  if (page === "verify")    return <FaceVerify onVerified={handleVerified} onLogout={handleLogout} />;
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