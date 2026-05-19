import { motion } from "framer-motion";
import { Shield, Scale, ShieldAlert, Settings, LifeBuoy } from "lucide-react";

const NAV_ITEMS = [
  { id: "guard", label: "Upload Guard" },
  { id: "takedown", label: "Takedown" },
  { id: "sos", label: "Guardian SOS" },
  { id: "support", label: "Support Hub" },
  { id: "settings", label: "Settings" },
];

const ICON_MAP = {
  guard: Shield,
  takedown: Scale,
  sos: ShieldAlert,
  support: LifeBuoy,
  settings: Settings,
};

function ShieldIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2dd4bf"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3L4 7v5c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V7l-8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export default function Sidebar({ active, onNavigate }) {
  return (
    <nav
      className="w-[220px] shrink-0 flex flex-col border-r border-white/5 py-6"
      style={{ background: "rgba(10, 17, 26, 0.6)", backdropFilter: "blur(24px)" }}
    >
      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="px-5 mb-6"
        style={{
          fontSize: "9px",
          letterSpacing: "0.25em",
          color: "#475569",
          fontWeight: 600,
          fontFamily: "monospace",
        }}
      >
        COMMAND CENTER
      </motion.div>

      {/* Nav items */}
      <motion.div
        className="flex-1 flex flex-col"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = ICON_MAP[item.id] || Shield;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              variants={{
                hidden: { opacity: 0, x: -12 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative flex items-center gap-3 w-full text-left border-none cursor-pointer"
              style={{
                padding: "12px 20px",
                color: isActive ? "#2dd4bf" : "#64748b",
                background: isActive
                  ? "linear-gradient(90deg, transparent, rgba(45,212,191,0.07) 40%, rgba(45,212,191,0.12))"
                  : "transparent",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#64748b";
              }}
            >
              {/* Right border line */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    borderRadius: "2px 0 0 2px",
                    background: "#2dd4bf",
                    boxShadow: "0 0 8px rgba(45,212,191,0.6)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <Icon
                size={16}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? "#2dd4bf" : "#475569", flexShrink: 0 }}
              />

              {/* Label */}
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                  color: isActive ? "#2dd4bf" : "inherit",
                }}
              >
                {item.label.toUpperCase()}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Footer badge */}
      <div
        className="mx-5 mt-6 p-4 rounded-lg"
        style={{
          border: "1px solid rgba(45,212,191,0.1)",
          background: "rgba(18, 28, 42, 0.8)",
        }}
      >
        <motion.div
          className="flex gap-2 items-center"
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <ShieldIcon size={14} />
          <p
            style={{
              fontSize: "10px",
              color: "#475569",
              lineHeight: 1.6,
              fontWeight: 500,
              margin: 0,
            }}
          >
            100% Local Processing.
            <br />
            No images leave your device.
          </p>
        </motion.div>
      </div>
    </nav>
  );
}