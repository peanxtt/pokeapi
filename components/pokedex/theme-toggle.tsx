"use client";

import { AnimatePresence, motion } from "motion/react";
import { MoonStar, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setDocumentTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pokedex-theme");
    const initialTheme: Theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : getSystemTheme();
    const frame = window.requestAnimationFrame(() => setTheme(initialTheme));

    setDocumentTheme(initialTheme);

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setDocumentTheme(theme);
  }, [theme]);

  function toggleTheme(): void {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    setDocumentTheme(nextTheme);
    window.localStorage.setItem("pokedex-theme", nextTheme);
  }

  const label = theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      aria-label={label}
      className="glass-surface relative flex min-h-11 min-w-11 items-center justify-center overflow-hidden rounded-full text-brand transition-colors duration-300 hover:border-line-strong"
      onClick={toggleTheme}
      type="button"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
          exit={{ opacity: 0, rotate: -25, scale: 0.75 }}
          initial={{ opacity: 0, rotate: 25, scale: 0.75 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          {theme === "light" ? <Sparkles aria-hidden size={17} strokeWidth={1.8} /> : <MoonStar aria-hidden size={17} strokeWidth={1.8} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
