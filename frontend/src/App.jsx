import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import DecoyContainer  from "./components/decoys/DecoyContainer";
import Landing       from "./pages/Landing";
import AuthPage      from "./pages/AuthPage";
import FaceVerify    from "./pages/FaceVerify";
import Header        from "./components/header";
import Sidebar       from "./components/SideBar";
import UploadGuard   from "./modules/UploadGuard";
import Takedown      from "./modules/Takedown";
import GuardianSOS   from "./modules/GuardianSOS";
import SupportHub    from "./modules/SupportHub";
import Settings      from "./modules/Settings";
import { NAV_ITEMS } from "./utils/data";
import { AnimatePresence, motion } from "framer-motion";

const MODULES = {
  guard:    UploadGuard,
  takedown: Takedown,
  sos:      GuardianSOS,
  support:  SupportHub,
  settings: Settings,
};

const PAGE_SUBTITLES = {
  guard:    "Check a photo before you post it",
  takedown: "Take down fake content and build your case",
  sos:      "Alert your trusted people if you need help",
  support:  "Learn, get help, and access resources",
  settings: "Configure stealth, safety, and view logs",
};

function Dashboard({ onLogout, onDecoyToggle }) {
  const [active, setActive] = useState("guard");
  const ActiveModule = MODULES[active];
  const currentNav   = NAV_ITEMS.find(n => n.id === active);

  return (
      <div className="cyber-grid min-h-screen flex flex-col overflow-hidden">
      <Header onLogout={onLogout} onDecoyToggle={onDecoyToggle} />

      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto", display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        <Sidebar active={active} onNavigate={setActive} />
        <main className="flex-1 px-10 py-12 overflow-y-auto relative">
          <div style={{ marginBottom: 32 }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1.5, color: "#fff" }}>
              {currentNav?.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, color: "var(--slate-400)", marginTop: 8 }}>{PAGE_SUBTITLES[active]}</div>
            <div style={{ marginTop: 16, width: 48, height: 3, background: "var(--neon-teal)", borderRadius: 2 }} />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="w-full"
            >
              <ActiveModule />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const [page, setPage] = useState("loading");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setPage("dashboard");
    } else {
      setPage("landing");
    }
  }, []);

  const handleLoginSuccess = () => {
    setPage("verify");
  };

  const handleVerified = () => {
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setPage("landing");
  };

  const handleDecoyToggle = () => {
    setPage("decoy");
  };

  const handleDecoyUnlock = (level, newToken) => {
    // Since decoy is only triggered manually from dashboard, just return to it.
    setPage("dashboard");
  };

  if (page === "loading")   return null;
  if (page === "decoy")     return <DecoyContainer skin={localStorage.getItem("stealth_skin") || "calculator"} email={localStorage.getItem("stealth_email")} onUnlockSuccess={handleDecoyUnlock} />;
  if (page === "landing")   return <Landing onNavigate={setPage} />;
  if (page === "login")     return <AuthPage mode="login"    onNavigate={setPage} onLogin={handleLoginSuccess} />;
  if (page === "register")  return <AuthPage mode="register" onNavigate={setPage} onLogin={handleLoginSuccess} />;
  if (page === "verify")    return <FaceVerify onVerified={handleVerified} onLogout={handleLogout} />;
  
  const mode = localStorage.getItem("stealth_mode");
  const level = localStorage.getItem("stealth_level");
  const isStealthActive = mode === "true" && (level === "2" || level === "3");

  if (page === "dashboard") return <Dashboard onLogout={handleLogout} onDecoyToggle={isStealthActive ? handleDecoyToggle : undefined} />;

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ThemeProvider>
  );
}