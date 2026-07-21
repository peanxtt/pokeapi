export default function Loading(): React.JSX.Element {
  return (
    <main aria-busy="true" className="site-shell pb-20">
      <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="mt-6 grid gap-6 sm:grid-cols-[0.9fr_1.1fr] sm:items-end">
        <div className="artwork-stage aspect-square animate-pulse rounded-3xl" />
        <div>
          <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
          <div className="mt-4 h-16 w-3/4 animate-pulse rounded-2xl bg-surface-muted" />
          <div className="mt-5 h-8 w-36 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-10 h-28 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="mt-6 h-48 animate-pulse rounded-2xl bg-surface-muted" />
    </main>
  );
}
