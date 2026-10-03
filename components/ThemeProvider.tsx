"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("theme-change", callback);
  window.addEventListener("storage", callback);

  const observer = new MutationObserver(() => {
    callback();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => {
    window.removeEventListener("theme-change", callback);
    window.removeEventListener("storage", callback);
    observer.disconnect();
  };
}

function getSnapshot(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("theme", newTheme);
    window.dispatchEvent(new Event("theme-change"));
  };

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const nextTheme: Theme = isCurrentlyDark ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme musi być użyty wewnątrz ThemeProvider");
  }
  return context;
}
