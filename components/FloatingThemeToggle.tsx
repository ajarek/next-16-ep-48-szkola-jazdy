"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

/**
 * Pływający przycisk przełączania trybu ciemny/jasny w prawym dolnym rogu ekranu,
 * zgodnie z wytycznymi w pliku AGENTS.md.
 * Całkowicie odporny na błędy hydratacji dzięki sterowaniu widocznością ikon przez CSS.
 */
export function FloatingThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Przełącz motyw jasny / ciemny"
      title="Przełącz motyw jasny / ciemny"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center size-12 rounded-full bg-card/90 text-foreground border border-border shadow-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* W trybie jasnym widoczny jest księżyc */}
      <Moon className="size-5 text-slate-700 block dark:hidden transition-transform duration-300" />
      {/* W trybie ciemnym widoczne jest słońce */}
      <Sun className="size-5 text-amber-400 hidden dark:block transition-transform duration-300" />
    </button>
  );
}
