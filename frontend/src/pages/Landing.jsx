import { motion } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import ShieldIcon from "../components/ShieldIcon";

const MINT = "#2dd4bf";
const BG = "#0a111a";

const FEATURES = [
  { icon: "◈", title: "Identity Vault", desc: "Biometric enrollment with 128-d face embeddings stored only on your device." },
  { icon: "⬡", title: "Upload Guard", desc: "Pre-flight photo sanitizer — strips GPS, blurs sensitive objects before you post." },
  { icon: "⚖", title: "Takedown Center", desc: "Auto-generate evidence bundles and DMCA reports with one click." },
  { icon: "⊕", title: "Guardian SOS", desc: "Trusted circle alerts and real-time GPS broadcast on critical threats." },
];

const STATS = [
  { value: "2.4M+", label: "Flagged images in database" },
  { value: "100%", label: "Local processing, zero uploads" },
  { value: "<2s", label: "Average threat detection time" },
  { value: "XAI", label: "Explainable AI — know exactly why" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

export default function Landing({ onNavigate }) {
  const btnBase = {
    padding: "14px 32px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    cursor: "pointer",
    fontFamily: "JetBrains Mono, monospace",
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace" }}>
      <div style={{ position: "fixed", width: 500, height: 500, top: "-10%", right: "-10%", borderRadius: "50%", background: `${MINT}14`, filter: "blur(80px)", pointerEvents: "none" }} />

      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ position: "sticky", top: 0, zIndex: 100, background: `${BG}cc`, backdropFilter: "blur(48px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 48px" }}
      >
        <motion.div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 64 }}>
          <motion.div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <ShieldIcon size={26} pulse />
            <motion.div>
              <motion.div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, color: MINT }}>SHIELD.AI</motion.div>
              <motion.div style={{ fontSize: 8, letterSpacing: 2, color: "#64748b" }}>DIGITAL BODYGUARD</motion.div>
            </motion.div>
          </motion.div>
          <motion.div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <ThemeToggle />
            <motion.button type="button" onClick={() => onNavigate("login")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ ...btnBase, background: "transparent", color: MINT, border: `2px solid ${MINT}`, padding: "8px 20px", fontSize: 11 }}>
              SIGN IN
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.nav>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} style={{ fontSize: 10, letterSpacing: 4, color: MINT, marginBottom: 16 }}>◈ PROACTIVE DIGITAL SAFETY</motion.div>
          <motion.h1 variants={fadeUp} style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, marginBottom: 24, color: "#fff" }}>
            Your<br /><span style={{ color: MINT }}>Digital</span><br />Bodyguard.
          </motion.h1>
          <motion.p variants={fadeUp} style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, marginBottom: 36, maxWidth: 420 }}>
            SHIELD.AI acts as a filter between your private data and the public internet — stopping digital harm before it starts.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: "flex", gap: 16 }}>
            <motion.button type="button" onClick={() => onNavigate("register")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ ...btnBase, background: MINT, color: BG, border: `2px solid ${MINT}`, boxShadow: `0 0 24px ${MINT}44` }}>
              START PROTECTION
            </motion.button>
            <motion.button type="button" onClick={() => onNavigate("login")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ ...btnBase, background: "transparent", color: MINT, border: `2px solid ${MINT}` }}>
              SIGN IN
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ display: "flex", justifyContent: "center" }}>
          <motion.div style={{ position: "relative", width: 320, height: 320 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${MINT}33` }} />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: 20, borderRadius: "50%", border: `2px solid ${MINT}44` }} />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: 40, borderRadius: "50%", border: `1px solid ${MINT}55` }} />
            <motion.div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldIcon size={140} pulse />
            </motion.div>
            {FEATURES.map((f, i) => {
              const angle = (i / FEATURES.length) * 360;
              const rad = (angle * Math.PI) / 180;
              return (
                <motion.div
                  key={f.title}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  style={{ position: "absolute", left: 160 + 140 * Math.cos(rad) - 20, top: 160 + 140 * Math.sin(rad) - 20, width: 40, height: 40, borderRadius: "50%", border: `2px solid ${MINT}44`, display: "flex", alignItems: "center", justifyContent: "center", color: MINT, fontSize: 16 }}
                >
                  {f.icon}
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(48px)" }}>
        <motion.div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 48px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ textAlign: "center" }}>
              <motion.div style={{ fontSize: 24, fontWeight: 700, color: MINT }}>{s.value}</motion.div>
              <motion.div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5, marginTop: 4 }}>{s.label}</motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px" }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 52 }}>
          <motion.div style={{ fontSize: 10, letterSpacing: 4, color: MINT, marginBottom: 12 }}>⬡ COMMAND MODULES</motion.div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>Five Layers of Protection</h2>
        </motion.div>
        <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -4 }} style={{ borderRadius: 12, padding: "28px 24px", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(48px)", border: `1px solid ${MINT}22` }}>
              <motion.div style={{ fontSize: 28, color: MINT, marginBottom: 14 }}>{f.icon}</motion.div>
              <motion.div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10, color: "#fff" }}>{f.title}</motion.div>
              <motion.div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>{f.desc}</motion.div>
            </motion.div>
          ))}
          <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} onClick={() => onNavigate("register")} style={{ borderRadius: 12, padding: "28px 24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, border: `1px solid ${MINT}44`, background: `${MINT}0d`, backdropFilter: "blur(48px)" }}>
            <ShieldIcon size={40} pulse />
            <motion.div style={{ fontSize: 13, fontWeight: 700, color: MINT }}>START NOW</motion.div>
            <motion.div style={{ fontSize: 11, color: "#64748b" }}>Free · Local · Private</motion.div>
          </motion.div>
        </motion.div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px 48px" }}>
        <motion.div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", letterSpacing: 1.5 }}>
          <span>SHIELD.AI — DIGITAL BODYGUARD © 2026</span>
          <span style={{ color: MINT }}>◈ 100% LOCAL · ZERO CLOUD</span>
        </motion.div>
      </footer>
    </div>
  );
}
