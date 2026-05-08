import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const toggle = () => setDark(d => !d);

  const t = dark ? {
    dark,
    bg:         "#061228",
    bgCard:     "rgba(255,255,255,0.02)",
    bgCardHover:"rgba(255,255,255,0.04)",
    border:     "#065f46",
    borderMid:  "#10b981",
    text:       "#e2e8f0",
    textMid:    "#94a3b8",
    textDim:    "#d9dde4",
    textFaint:  "#d4dce6",
    sidebar:    "#061228",
    header:     "#061228",
    input:      "#0a1628",
    green:      "#1ade7e",
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
    text:        "#051425",
    textMid:     "#071c2f",
    textDim:     "#2b597e",
    textFaint:   "#3d7fb6",
    sidebar:     "#ffffff",
    header:      "rgba(255,255,255,0.95)",
    input:       "#f4faff",
    // Universal traffic light
    green:       "#22c55e",   // ✅ safe / live / protected
    amber:       "#d97706",   // ⚠️ caution / warning
    red:         "#dc2626",   // 🔴 danger / high risk
    purple:      "#4f46e5",   // 🔵 info / analysis
  };

  return <ThemeContext.Provider value={{ ...t, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);