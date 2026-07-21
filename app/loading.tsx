export default function Loading(): React.JSX.Element {
  return (
    <main aria-busy="true" className="site-shell pb-20">
      <section className="pt-8 sm:pt-12">
        <div className="h-3 w-28 animate-pulse rounded bg-surface-muted" />
        <div className="mt-4 h-20 max-w-sm animate-pulse rounded-2xl bg-surface-muted" />
      </section>
      <div className="mt-10 h-11 animate-pulse rounded-lg bg-surface-muted" />
      <div className="glass-surface mt-5 h-36 animate-pulse rounded-2xl" />
      <div className="mt-10 space-y-3">
        {[1, 2, 3, 4, 5].map((item) => <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" key={item} />)}
      </div>
    </main>
  );
}
