"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  function applyTheme(t: Theme) {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(t);
  }

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initial = stored ?? preferred;
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      applyTheme(next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
