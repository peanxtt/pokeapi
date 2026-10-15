"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ControlPopover } from "@/components/pokedex/control-popover";

type Appearance = "system" | "light" | "night";
const choices: Appearance[] = ["system", "light", "night"];
function subscribe(listener: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
export function ThemeToggle(): React.JSX.Element {
  const [choice, setChoice] = useState<Appearance>("system");
  const [ready, setReady] = useState(false);
  const nightSystem = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
  const resolved =
    choice === "system" ? (nightSystem ? "night" : "light") : choice;
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("pokedex-theme");
    } catch {}
    const initial =
      saved === "dark"
        ? "night"
        : saved === "light" || saved === "night"
          ? saved
          : "system";
    const frame = requestAnimationFrame(() => {
      setChoice(initial);
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (ready) document.documentElement.dataset.theme = resolved;
  }, [ready, resolved]);
  function select(value: Appearance): void {
    setChoice(value);
    try {
      localStorage.setItem("pokedex-theme", value);
    } catch {}
  }
  return (
    <ControlPopover
      title="Appearance"
      accessibleLabel="Color theme"
      className="theme-popover"
      label={
        <>
          {resolved === "night" ? (
            <Moon size={16} aria-hidden />
          ) : (
            <Sun size={16} aria-hidden />
          )}
          <span>
            {ready ? (resolved === "night" ? "Night" : "Light") : "Theme"}
          </span>
        </>
      }
    >
      {(close) => (
        <div
          className="menu-options"
          role="radiogroup"
          aria-label="Color theme"
          onKeyDown={(event) => {
            const index = choices.indexOf(choice);
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? 2
                  : ["ArrowRight", "ArrowDown"].includes(event.key)
                    ? (index + 1) % 3
                    : ["ArrowLeft", "ArrowUp"].includes(event.key)
                      ? (index + 2) % 3
                      : -1;
            if (next < 0) return;
            event.preventDefault();
            select(choices[next]);
            event.currentTarget
              .querySelectorAll<HTMLButtonElement>("[role='radio']")
              [next]?.focus();
          }}
        >
          {choices.map((value) => (
            <button
              key={value}
              role="radio"
              aria-checked={choice === value}
              tabIndex={choice === value ? 0 : -1}
              className={`menu-option ${choice === value ? "selected" : ""}`}
              type="button"
              onClick={() => {
                select(value);
                close();
              }}
            >
              {value === "system" ? (
                <Monitor size={17} aria-hidden />
              ) : value === "light" ? (
                <Sun size={17} aria-hidden />
              ) : (
                <Moon size={17} aria-hidden />
              )}
              {value === "system"
                ? "System"
                : value === "light"
                  ? "Light"
                  : "Night"}
              {choice === value && (
                <span className="menu-check" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </ControlPopover>
  );
}
