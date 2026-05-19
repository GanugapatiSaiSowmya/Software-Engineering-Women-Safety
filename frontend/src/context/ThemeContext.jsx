import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

const MINT = "#2dd4bf";
const MIDNIGHT = "#0a111a";

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const toggle = () => setDark((d) => !d);

  const t = dark
    ? {
        dark,
        bg: MIDNIGHT,
        bgCard: "rgba(255,255,255,0.03)",
        bgCardHover: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.05)",
        borderMid: "rgba(45,212,191,0.35)",
        text: "#e2e8f0",
        textMid: "#94a3b8",
        textDim: "#64748b",
        textFaint: "#475569",
        sidebar: MIDNIGHT,
        header: "rgba(10,17,26,0.85)",
        input: "#121c2a",
        green: MINT,
        mint: MINT,
        amber: "#f59e0b",
        red: "#f43f5e",
        purple: "#818cf8",
      }
    : {
        dark,
        bg: "#e8f4f8",
        bgCard: "#ffffff",
        bgCardHover: "#f8fafc",
        border: "rgba(45,212,191,0.25)",
        borderMid: "rgba(45,212,191,0.5)",
        text: "#0a111a",
        textMid: "#334155",
        textDim: "#64748b",
        textFaint: "#94a3b8",
        sidebar: "#ffffff",
        header: "rgba(255,255,255,0.95)",
        input: "#f1f5f9",
        green: "#0d9488",
        mint: "#0d9488",
        amber: "#d97706",
        red: "#dc2626",
        purple: "#4f46e5",
      };

  return <ThemeContext.Provider value={{ ...t, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
