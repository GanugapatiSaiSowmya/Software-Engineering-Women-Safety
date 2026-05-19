import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const t = useTheme();
  return (
    <motion.button
      type="button"
      onClick={t.toggle}
      title={t.dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center gap-2 px-2 py-1 rounded-md border border-white/5 bg-white/[0.03] hover:border-[#2dd4bf]/30 transition-colors"
      whileTap={{ scale: 0.95 }}
    >
      {t.dark ? <Moon size={16} className="text-[#2dd4bf]" /> : <Sun size={16} className="text-amber-400" />}
      <div className="w-10 h-5 rounded-full bg-[#121c2a] border border-white/10 relative">
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ background: t.dark ? "#2dd4bf" : "#f59e0b", boxShadow: t.dark ? "0 0 8px rgba(45,212,191,0.6)" : "0 0 8px rgba(245,158,11,0.5)" }}
          animate={{ left: t.dark ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </motion.button>
  );
}
