import type { Metadata } from "next";
import Script from "next/script";
import { GuideShell } from "@/components/pokedex/guide-shell";
import "@fontsource-variable/dm-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Pokédex / Field guide", template: "%s / Pokédex" },
  description:
    "Explore Pokémon by generation, with forms, types, stats and evolution in a modern field guide.",
};
const themeScript = `try{let t=localStorage.getItem("pokedex-theme");document.documentElement.dataset.theme=t==="light"?"light":t==="night"||t==="dark"?"night":matchMedia("(prefers-color-scheme: dark)").matches?"night":"light"}catch{}`;
export default function RootLayout({
  children,
  detail,
}: Readonly<{
  children: React.ReactNode;
  detail: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <GuideShell detail={detail}>{children}</GuideShell>
      </body>
    </html>
  );
}
