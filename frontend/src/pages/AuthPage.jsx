import { useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import ShieldIcon from "../components/ShieldIcon";

function InputField({ label, type = "text", value, onChange, placeholder, t }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 11, letterSpacing: 2, color: "#2dd4bf", marginBottom: 8, fontWeight: 700, fontStyle: "italic", fontFamily: "JetBrains Mono, monospace" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 8,
          fontSize: 13,
          background: `rgba(26,222,126,0.03)`,
          color: t.text,
          fontFamily: "'Courier New', monospace",
          border: `2px solid ${focused ? "#2dd4bf" : "rgba(45,212,191,0.3)"}`,
          outline: "none",
          transition: "all 0.3s ease",
          boxShadow: focused ? `0 0 0 4px rgba(26,222,126,0.15), inset 0 1px 2px rgba(0,0,0,0.1)` : "inset 0 1px 2px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
}

export default function AuthPage({ mode = "login", onNavigate, onLogin }) {
  const t = useTheme();
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password) return "Please fill in all fields.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!isLogin && password !== confirm) return "Passwords do not match.";
    if (!isLogin && !name.trim()) return "Please enter your name.";
    return "";
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      const payload = isLogin
        ? { email, password }
        : { name, email, password };

      const res = await axios.post(
        `http://127.0.0.1:8000${endpoint}`,
        payload
      );

      // ✅ FIXED: store token with correct key
      localStorage.setItem("token", res.data.access_token);

      try {
        const stealthRes = await axios.get("http://127.0.0.1:8000/auth/stealth", {
          headers: { Authorization: `Bearer ${res.data.access_token}` }
        });
        localStorage.setItem("stealth_email", email);
        localStorage.setItem("stealth_mode", stealthRes.data.stealth_enabled);
        localStorage.setItem("stealth_level", stealthRes.data.stealth_level);
        localStorage.setItem("stealth_skin", stealthRes.data.decoy_skin);
      } catch (e) {
        console.error("Failed to load stealth settings");
      }

      // optional (keep this if you're using face verification logic)
      localStorage.setItem(
        "shield_face_enrolled",
        res.data.face_enrolled ? "true" : "false"
      );

      onLogin();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitBtn = {
    width: "100%",
    padding: "14px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'Courier New', monospace",
    border: "none",
    transition: "all 0.3s",
    background: loading ? "#334155" : "#2dd4bf",
    color: loading ? "#94a3b8" : "#0a111a",
    boxShadow: loading ? "none" : "0 0 20px rgba(45,212,191,0.35)",
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a111a",
        color: t.text,
        fontFamily: "'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        .glass-card { background: rgba(255,255,255,0.02); backdrop-filter: blur(12px); border: 1px solid rgba(26,222,126,0.15); transition: all 0.3s; }
        .glass-card:hover { background: rgba(255,255,255,0.03); border-color: rgba(26,222,126,0.25); }
      `}</style>
      
      <div style={{ position: "fixed", width: 400, height: 400, top: "-10%", right: "-10%", borderRadius: "50%", background: `${t.green}08`, filter: "blur(80px)", pointerEvents: "none" }} />

      <nav
        style={{
          borderBottom: `1px solid rgba(26,222,126,0.1)`,
          background: `${t.bg}cc`,
          backdropFilter: "blur(12px)",
          padding: "0 48px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            height: 60,
          }}
        >
          <div
            onClick={() => onNavigate("landing")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              flex: 1,
            }}
          >
            <ShieldIcon size={24} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                color: t.green,
              }}
            >
              SHIELD.AI
            </span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp 0.6s ease both" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: t.green, marginBottom: 12 }}>◈ {isLogin ? "SECURE LOGIN" : "ACCOUNT CREATION"}</div>
            <ShieldIcon size={56} />
            <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 16, letterSpacing: 1 }}>
              {isLogin ? "WELCOME BACK" : "GET PROTECTED"}
            </h1>
            <p style={{ fontSize: 12, color: t.textMid, marginTop: 8 }}>
              {isLogin ? "Sign in to access your digital vault" : "Create your account to start protecting"}
            </p>
          </div>

          <div
            className="glass-card"
            style={{
              borderRadius: 16,
              padding: "40px 40px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              border: `1.5px solid rgba(26,222,126,0.2)`,
            }}
          >
            {!isLogin && (
              <InputField
                label="FULL NAME"
                value={name}
                onChange={setName}
                t={t}
              />
            )}

            <InputField
              label="EMAIL"
              type="email"
              value={email}
              onChange={setEmail}
              t={t}
            />

            <InputField
              label="PASSWORD"
              type="password"
              value={password}
              onChange={setPassword}
              t={t}
            />

            {!isLogin && (
              <InputField
                label="CONFIRM PASSWORD"
                type="password"
                value={confirm}
                onChange={setConfirm}
                t={t}
              />
            )}

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", color: t.red, marginBottom: 10, padding: "12px 14px", borderRadius: 6, fontSize: 12, borderLeft: `3px solid ${t.red}` }}>{error}</div>
            )}

            <button
              onClick={handleSubmit}
              style={submitBtn}
              disabled={loading}
            >
              {loading
                ? "LOADING..."
                : isLogin
                ? "LOGIN"
                : "REGISTER"}
            </button>

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <span
                onClick={() =>
                  onNavigate(isLogin ? "register" : "login")
                }
                style={{ cursor: "pointer", color: t.green, fontSize: 12, transition: "all 0.2s" }}
              >
                {isLogin
                  ? "Create account"
                  : "Already have an account?"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}