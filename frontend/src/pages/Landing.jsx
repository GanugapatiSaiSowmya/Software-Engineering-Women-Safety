import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import ShieldIcon from "../components/ShieldIcon";

const FEATURES = [
  { icon: "◈", title: "Identity Vault",   desc: "Biometric enrollment with 128-d face embeddings stored only on your device." },
  { icon: "⬡", title: "Upload Guard",     desc: "Pre-flight photo sanitizer — strips GPS, blurs sensitive objects before you post." },
  { icon: "◉", title: "Safety Audit",     desc: "AI-powered likeness detection across the web with deepfake probability scores." },
  { icon: "⚖", title: "Takedown Center",  desc: "Auto-generate evidence bundles and DMCA reports with one click." },
  { icon: "⊕", title: "Guardian SOS",     desc: "Trusted circle alerts and real-time GPS broadcast on critical threats." },
];

const STATS = [
  { value: "2.4M+", label: "Flagged images in database" },
  { value: "100%",  label: "Local processing, zero uploads" },
  { value: "<2s",   label: "Average threat detection time" },
  { value: "XAI",   label: "Explainable AI — know exactly why" },
];

export default function Landing({ onNavigate }) {
  const t = useTheme();

  const heroBtn = (primary) => ({
    padding: "14px 32px", borderRadius: 6, fontSize: 13, fontWeight: 700,
    letterSpacing: 2, cursor: "pointer", fontFamily: "'Courier New', monospace",
    transition: "all 0.25s",
    background: primary ? t.green : "transparent",
    color: primary ? "#fff" : t.green,
    border: `2px solid ${t.green}`,
    boxShadow: primary ? `0 0 24px ${t.green}44` : "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Courier New', monospace" }}>
      <style>{`
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .feat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(16,185,129,0.12) !important; }
        .feat-card { transition: transform 0.25s, box-shadow 0.25s; }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", width: 500, height: 500, top: "-10%", right: "-10%", borderRadius: "50%", background: `${t.green}12`, filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 300, height: 300, bottom: "5%", left: "-5%", borderRadius: "50%", background: `${t.purple}10`, filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: t.header, backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.border}`, padding: "0 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <ShieldIcon size={26} pulse />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, color: t.green }}>SHIELD.AI</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: t.textFaint }}>DIGITAL BODYGUARD</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <ThemeToggle />
            <button onClick={() => onNavigate("login")} style={{ ...heroBtn(false), padding: "8px 20px", fontSize: 11 }}>LOGIN</button>
            <button onClick={() => onNavigate("register")} style={{ ...heroBtn(true), padding: "8px 20px", fontSize: 11 }}>GET PROTECTED</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        <div style={{ animation: "fadeUp 0.8s ease both" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: t.green, marginBottom: 16 }}>◈ PROACTIVE DIGITAL SAFETY</div>
          <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, letterSpacing: 1, marginBottom: 24 }}>
            Your<br />
            <span style={{ color: t.green }}>Digital</span><br />
            Bodyguard.
          </h1>
          <p style={{ fontSize: 14, color: t.textMid, lineHeight: 1.8, marginBottom: 36, maxWidth: 420 }}>
            SHIELD.ai acts as a filter between your private data and the public internet — stopping digital harm before it starts, using Explainable AI that shows you exactly why a threat is real.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={() => onNavigate("register")} style={heroBtn(true)}>START PROTECTION</button>
            <button onClick={() => onNavigate("login")} style={heroBtn(false)}>SIGN IN</button>
          </div>
        </div>

        {/* Animated shield graphic */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", animation: "float 5s ease-in-out infinite" }}>
          <div style={{ position: "relative", width: 280, height: 280 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${t.green}22`, animation: "pulse 3s ease-in-out infinite" }} />
            <div style={{ position: "absolute", inset: 20, borderRadius: "50%", border: `1px solid ${t.green}33` }} />
            <div style={{ position: "absolute", inset: 40, borderRadius: "50%", border: `1px solid ${t.green}44` }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldIcon size={120} pulse />
            </div>
            {/* Orbit dots */}
            {FEATURES.map((_, i) => {
              const angle = (i / FEATURES.length) * 360;
              const rad   = (angle * Math.PI) / 180;
              const x     = 140 + 120 * Math.cos(rad) - 16;
              const y     = 140 + 120 * Math.sin(rad) - 16;
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: 32, height: 32, borderRadius: "50%", background: t.bgCard, border: `1px solid ${t.green}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: t.green }}>
                  {_.icon}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: t.bgCard, borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 48px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: t.green, letterSpacing: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: t.textDim, letterSpacing: 1.5, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: t.green, marginBottom: 12 }}>⬡ COMMAND MODULES</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>Five Layers of Protection</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card" style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ fontSize: 28, color: t.green, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10, color: t.text }}>{f.title}</div>
              <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
          {/* CTA card */}
          <div className="feat-card" onClick={() => onNavigate("register")}
            style={{ background: `${t.green}10`, border: `1px solid ${t.green}44`, borderRadius: 12, padding: "28px 24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 12 }}>
            <ShieldIcon size={40} pulse />
            <div style={{ fontSize: 13, fontWeight: 700, color: t.green, letterSpacing: 1.5 }}>START NOW</div>
            <div style={{ fontSize: 11, color: t.textDim }}>Free · Local · Private</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: "24px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: t.textFaint, letterSpacing: 1.5 }}>SHIELD.AI — DIGITAL BODYGUARD © 2026</div>
          <div style={{ fontSize: 10, color: t.green }}>◈ 100% LOCAL · ZERO CLOUD</div>
        </div>
      </footer>
    </div>
  );
}
