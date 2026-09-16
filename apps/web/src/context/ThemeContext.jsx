"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

function getInitialTheme() {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem("skinstory_theme");
    if (saved && ["light", "dark", "system"].includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return "system";
}

function getInitialResolvedTheme(theme) {
  if (typeof window === "undefined") return "light";
  try {
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch (e) {}
  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => getInitialResolvedTheme(theme));

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let isDark = false;
      if (theme === "dark") {
        isDark = true;
      } else if (theme === "light") {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      const nextResolved = isDark ? "dark" : "light";
      setResolvedTheme((prev) => (prev !== nextResolved ? nextResolved : prev));

      if (isDark) {
        if (!root.classList.contains("dark")) root.classList.add("dark");
        root.classList.remove("light");
      } else {
        if (!root.classList.contains("light")) root.classList.add("light");
        root.classList.remove("dark");
      }
    };

    applyTheme();

    const handler = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("skinstory_theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
