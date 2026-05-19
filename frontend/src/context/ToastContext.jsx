import { createContext, useContext, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShieldAlert, Info } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  alert: ShieldAlert,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <motion.div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        initial={false}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] || ICONS.info;
            const isAlert = toast.type === "alert";
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={`pointer-events-auto flex items-center gap-3 min-w-[280px] max-w-[400px] px-4 py-3 rounded-lg border backdrop-blur-3xl font-mono text-xs tracking-wide shadow-2xl ${
                  isAlert
                    ? "bg-rose-950/80 border-rose-500/40 text-rose-100 shadow-rose-500/20"
                    : "bg-[#0a111a]/90 border-mint/30 text-mint shadow-mint/15"
                }`}
                style={{
                  boxShadow: isAlert
                    ? "0 0 24px rgba(244, 63, 94, 0.25), inset 0 1px 0 rgba(255,255,255,0.05)"
                    : "0 0 24px rgba(45, 212, 191, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className={`flex-shrink-0 p-1.5 rounded-md ${
                    isAlert ? "bg-rose-500/20 text-rose-400" : "bg-mint/15 text-mint"
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <span className="flex-1 leading-relaxed font-semibold">{toast.message}</span>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className={`opacity-50 hover:opacity-100 text-[10px] uppercase tracking-widest ${
                    isAlert ? "text-rose-300" : "text-mint/70"
                  }`}
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
