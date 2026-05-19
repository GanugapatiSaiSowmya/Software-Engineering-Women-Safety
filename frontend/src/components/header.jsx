import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ShieldIcon from "./ShieldIcon";
import ThemeToggle from "./ThemeToggle";

export default function Header({ onLogout, onDecoyToggle }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-[#0a111a]/80 backdrop-blur-3xl px-8"
    >
      <motion.div
        className="max-w-[1400px] mx-auto flex items-center h-[70px] gap-6"
        initial={false}
      >
        <motion.div
          className="flex items-center gap-3 flex-1"
          whileHover={{ scale: 1.01 }}
        >
          <ShieldIcon size={32} pulse />
          <motion.div
            animate={{ textShadow: ["0 0 8px rgba(45,212,191,0.3)", "0 0 20px rgba(45,212,191,0.6)", "0 0 8px rgba(45,212,191,0.3)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              className="text-xl font-bold tracking-[0.25em] text-[#2dd4bf]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              SHIELD.AI
            </motion.div>
            <motion.div className="text-[10px] tracking-[0.2em] text-slate-500 font-semibold">
              DIGITAL BODYGUARD
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="flex items-center gap-5">
          {onDecoyToggle && (
            <motion.button
              type="button"
              onClick={onDecoyToggle}
              title="Stealth decoy switch"
              className="w-12 h-6 rounded-full bg-[#121c2a] border border-white/10 relative"
              whileTap={{ scale: 0.95 }}
            >
              <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-500" />
            </motion.button>
          )}

          <motion.div
            className="mono text-sm text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-1.5 rounded-md border border-[#2dd4bf]/20 tabular-nums"
            key={time.getSeconds()}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {hh}:{mm}:{ss}
          </motion.div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-white/[0.03] border border-white/5">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse-mint" />
            <span className="text-[11px] text-[#2dd4bf] tracking-[0.15em] font-semibold mono">
              SYSTEM ACTIVE
            </span>
          </div>

          <ThemeToggle />

          {onLogout && (
            <motion.button
              type="button"
              onClick={onLogout}
              className="mono text-[11px] tracking-widest px-4 py-2 rounded-md border border-white/10 text-slate-300 hover:border-[#2dd4bf]/40 hover:text-[#2dd4bf] transition-colors font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              DISCONNECT
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.header>
  );
}
