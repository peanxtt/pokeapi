import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound(): React.JSX.Element {
  return (
    <main className="site-shell pb-20">
      <section className="glass-surface mt-12 rounded-2xl p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">404 / unknown species</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.055em]">That Pokémon is not in this index.</h1>
        <Link className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg border border-line-strong bg-surface-strong px-4 text-sm font-semibold text-foreground" href="/?generation=1">
          <ArrowLeft aria-hidden size={16} />
          Return to Gen I
        </Link>
      </section>
    </main>
  );
}
