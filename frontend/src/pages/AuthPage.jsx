import { useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import ShieldIcon from "../components/ShieldIcon";

function InputField({ label, type = "text", value, onChange, placeholder, t }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: t.textDim, marginBottom: 8 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 6,
          fontSize: 13,
          background: t.input,
          color: t.text,
          fontFamily: "'Courier New', monospace",
          border: `1px solid ${focused ? t.green : t.borderMid}`,
          outline: "none",
          transition: "border-color 0.2s",
          boxShadow: focused ? `0 0 0 3px ${t.green}18` : "none",
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
    background: loading ? t.borderMid : t.green,
    color: "#fff",
    boxShadow: loading ? "none" : `0 0 20px ${t.green}44`,
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          borderBottom: `1px solid ${t.border}`,
          background: t.header,
          backdropFilter: "blur(12px)",
          padding: "0 48px",
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
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <ShieldIcon size={56} />
            <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>
              {isLogin ? "WELCOME BACK" : "GET PROTECTED"}
            </h1>
          </div>

          <div
            style={{
              background: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: 14,
              padding: "32px 36px",
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
              <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
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
                style={{ cursor: "pointer", color: t.green }}
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