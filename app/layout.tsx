import type { Metadata } from "next";
import Script from "next/script";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { ThemeToggle } from "@/components/pokedex/theme-toggle";

import "./globals.css";

export const metadata: Metadata = {
  title: "Index / Pokédex",
  description: "A calm, generation-first reference Pokédex powered by PokéAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body>
        <div className="min-h-screen">
          <header className="site-shell flex items-center justify-between py-5">
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Field guide / 001
              </p>
              <p className="mt-1 text-sm font-medium tracking-[-0.02em] text-foreground">Index / Pokédex</p>
            </div>
            <ThemeToggle />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
