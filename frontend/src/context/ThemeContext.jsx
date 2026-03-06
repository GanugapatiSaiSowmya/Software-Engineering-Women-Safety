import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const toggle = () => setDark(d => !d);

  const t = dark ? {
    dark,
    bg:         "#060d1b",
    bgCard:     "rgba(255,255,255,0.02)",
    bgCardHover:"rgba(255,255,255,0.04)",
    border:     "#0f172a",
    borderMid:  "#1e293b",
    text:       "#e2e8f0",
    textMid:    "#94a3b8",
    textDim:    "#475569",
    textFaint:  "#334155",
    sidebar:    "rgba(6,13,27,0.95)",
    header:     "rgba(6,13,27,0.9)",
    input:      "#0a1628",
    green:      "#10b981",
    amber:      "#f59e0b",
    red:        "#ef4444",
    purple:     "#818cf8",
  } : {
    dark,
    // Arctic — soft blue background, white cards
    bg:          "#cfe0f0",
    bgCard:      "#ffffff",
    bgCardHover: "#f4f9ff",
    border:      "#b8d8f8",
    borderMid:   "#8ec4f0",
    text:        "#0a1e35",
    textMid:     "#1e4060",
    textDim:     "#5a8ab0",
    textFaint:   "#7aaad0",
    sidebar:     "#ffffff",
    header:      "rgba(255,255,255,0.95)",
    input:       "#f4faff",
    // Universal traffic light
    green:       "#16a34a",   // ✅ safe / live / protected
    amber:       "#d97706",   // ⚠️ caution / warning
    red:         "#dc2626",   // 🔴 danger / high risk
    purple:      "#4f46e5",   // 🔵 info / analysis
  };

  return <ThemeContext.Provider value={{ ...t, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);