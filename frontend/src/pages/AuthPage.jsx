import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import ShieldIcon from "../components/ShieldIcon";

function InputField({ label, type = "text", value, onChange, placeholder, t }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: t.textDim, marginBottom: 8 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 6, fontSize: 13,
          background: t.input, color: t.text, fontFamily: "'Courier New', monospace",
          border: `1px solid ${focused ? t.green : t.borderMid}`,
          outline: "none", transition: "border-color 0.2s",
          boxShadow: focused ? `0 0 0 3px ${t.green}18` : "none",
        }}
      />
    </div>
  );
}

export default function AuthPage({ mode = "login", onNavigate, onLogin }) {
  const t = useTheme();
  const isLogin = mode === "login";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    if (!email || !password) return "Please fill in all fields.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!isLogin && password !== confirm) return "Passwords do not match.";
    if (!isLogin && !name.trim()) return "Please enter your name.";
    return "";
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1400);
  };

  const submitBtn = {
    width: "100%", padding: "14px", borderRadius: 6, fontSize: 13, fontWeight: 700,
    letterSpacing: 2, cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'Courier New', monospace", border: "none", transition: "all 0.3s",
    background: loading ? t.borderMid : t.green,
    color: "#fff",
    boxShadow: loading ? "none" : `0 0 20px ${t.green}44`,
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", width: 400, height: 400, top: "-10%", right: "-10%", borderRadius: "50%", background: `${t.green}10`, filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 300, height: 300, bottom: "0", left: "-5%", borderRadius: "50%", background: `${t.purple}0d`, filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${t.border}`, background: t.header, backdropFilter: "blur(12px)", padding: "0 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 60 }}>
          <div onClick={() => onNavigate("landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}>
            <ShieldIcon size={24} />
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: t.green }}>SHIELD.AI</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Auth card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp 0.6s ease both" }}>
          {/* Shield + title */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", animation: "float 4s ease-in-out infinite" }}>
              <ShieldIcon size={56} pulse />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, marginTop: 16 }}>
              {isLogin ? "WELCOME BACK" : "GET PROTECTED"}
            </h1>
            <p style={{ fontSize: 12, color: t.textDim, marginTop: 8, lineHeight: 1.6 }}>
              {isLogin
                ? "Sign in to your SHIELD.ai Command Center"
                : "Create your secure account — all data stays local"}
            </p>
          </div>

          {/* Form card */}
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: "32px 36px", boxShadow: `0 0 40px ${t.green}08` }}>
            {!isLogin && (
              <InputField label="FULL NAME" value={name} onChange={setName} placeholder="Priya Sharma" t={t} />
            )}
            <InputField label="EMAIL ADDRESS" type="email" value={email} onChange={setEmail} placeholder="you@email.com" t={t} />
            <InputField label="PASSWORD" type="password" value={password} onChange={setPassword} placeholder="••••••••" t={t} />
            {!isLogin && (
              <InputField label="CONFIRM PASSWORD" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" t={t} />
            )}

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: `${t.red}15`, border: `1px solid ${t.red}44`, fontSize: 12, color: t.red }}>
                ⚠ {error}
              </div>
            )}

            <button onClick={handleSubmit} style={submitBtn} disabled={loading}>
              {loading ? "VERIFYING…" : isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: t.border }} />
              <span style={{ fontSize: 10, color: t.textFaint, letterSpacing: 1 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: t.border }} />
            </div>

            {/* Switch mode */}
            <div style={{ textAlign: "center", fontSize: 12, color: t.textDim }}>
              {isLogin ? "Don't have an account? " : "Already protected? "}
              <span
                onClick={() => onNavigate(isLogin ? "register" : "login")}
                style={{ color: t.green, cursor: "pointer", fontWeight: 700, letterSpacing: 0.5 }}
              >
                {isLogin ? "Register here" : "Sign in"}
              </span>
            </div>
          </div>

          {/* Security note */}
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 10, color: t.textFaint }}>
            <ShieldIcon size={12} />
            <span>100% LOCAL · NO SERVER · AES-256 ENCRYPTED</span>
          </div>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <span onClick={() => onNavigate("landing")} style={{ fontSize: 11, color: t.textDim, cursor: "pointer", letterSpacing: 1 }}>
              ← Back to home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
