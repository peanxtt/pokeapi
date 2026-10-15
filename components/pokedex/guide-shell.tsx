"use client";

import { MotionConfig } from "motion/react";
import Link from "next/link";
import { createContext, Suspense, useContext, useState } from "react";
import { ThemeToggle } from "@/components/pokedex/theme-toggle";
import { GuidePreferencesProvider, SoundToggle } from "./guide-preferences";

const IndexReturnContext = createContext<{
  enteredFromIndex: boolean;
  markIndexEntry: (mobile: boolean) => void;
}>({ enteredFromIndex: false, markIndexEntry: () => {} });
export function useIndexNavigation() {
  return useContext(IndexReturnContext);
}

export function GuideEmblem({
  size = 28,
}: {
  size?: number;
}): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="guide-emblem"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 12h7m6 0h7" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function GuideShell({
  children,
  detail,
}: {
  children: React.ReactNode;
  detail: React.ReactNode;
}): React.JSX.Element {
  const [enteredFromIndex, markIndexEntry] = useState(false);
  return (
    <GuidePreferencesProvider>
      <IndexReturnContext value={{ enteredFromIndex, markIndexEntry }}>
        <MotionConfig
          reducedMotion="user"
          transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
        >
          <a className="skip-link fg-button" href="#pokedex-content">
            Skip to content
          </a>
          <header className="command-bar">
            <div className="nav-inner">
              <Link
                className="guide-brand"
                href="/?generation=1"
                scroll={false}
              >
                <GuideEmblem />
                <span>POKÉDEX</span>
              </Link>
              <span className="nav-tagline">A field guide for the curious</span>
              <div className="nav-actions">
                <SoundToggle />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="guide-shell" id="pokedex-content">
            <Suspense>{children}</Suspense>
            <div className="slot-container">
              <Suspense>{detail}</Suspense>
            </div>
          </main>
        </MotionConfig>
      </IndexReturnContext>
    </GuidePreferencesProvider>
  );
}
