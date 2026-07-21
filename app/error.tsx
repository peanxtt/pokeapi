"use client";

import { AlertTriangle } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  return (
    <main className="site-shell pb-20">
      <section className="glass-surface mt-12 rounded-2xl p-6 sm:p-8" role="alert">
        <AlertTriangle aria-hidden className="text-brand" size={22} strokeWidth={1.7} />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Reference unavailable</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">PokéAPI could not answer.</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted">The upstream reference may be busy or unreachable. Try the request again in a moment.</p>
        <button className="mt-6 min-h-11 rounded-lg border border-line-strong bg-surface-strong px-4 text-sm font-semibold text-foreground transition-opacity hover:opacity-80" onClick={reset} type="button">
          Try again
        </button>
        <p className="mt-5 break-words font-mono text-[10px] leading-5 text-subtle">{error.message}</p>
      </section>
    </main>
  );
}
