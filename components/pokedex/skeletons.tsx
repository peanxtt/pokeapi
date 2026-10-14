"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getGenerationSummary,
  parseCatalogScope,
} from "@/lib/pokedex/generations";
import { parseReturnPath } from "@/lib/pokedex/query";

export function CatalogSkeleton(): React.JSX.Element {
  const params = useSearchParams();
  let generation = "Loading generation…";
  try {
    const from = new URL(params.get("from") || "/", "https://pokedex.invalid");
    const scope = parseCatalogScope(
      params.get("generation") ||
        from.searchParams.get("generation") ||
        undefined,
    );
    const g = getGenerationSummary(scope);
    generation = g.label + " / " + g.region;
  } catch {}
  return (
    <>
      <div className="scope-strip">
        <div className="scope-inner">{generation}</div>
      </div>
      <header className="workspace-intro">
        <h1>
          <span>Explore the </span>Pokédex
        </h1>
        <p>Choose a generation, then find a species by name or number.</p>
      </header>
      <div className="generation-rail" aria-hidden>
        <div
          className="skeleton"
          style={{ height: 14, width: 100, marginBottom: 24 }}
        />
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: 44 }} />
        ))}
      </div>
      <section
        className="index-pane plate"
        aria-busy="true"
        aria-label="Loading Pokédex index"
      >
        <div className="index-header">
          <div
            className="skeleton"
            style={{ height: 28, width: 160, marginBottom: 32 }}
          />
          <div className="skeleton" style={{ height: 48 }} />
          <div
            className="skeleton"
            style={{ height: 44, marginTop: 20, width: 126 }}
          />
        </div>
        <div className="catalog-list">
          <p className="loading-status" role="status">
            Loading species…
          </p>
          <ol>
            {Array.from({ length: 6 }, (_, i) => (
              <li className="skeleton-row" key={i}>
                <div className="skeleton" />
                <div className="skeleton-row-lines">
                  <div className="skeleton" style={{ width: "40%" }} />
                  <div className="skeleton" style={{ width: "85%" }} />
                  <div className="skeleton" style={{ width: "60%" }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
export function DetailSkeleton(): React.JSX.Element {
  const params = useSearchParams();
  let from = "/?generation=1";
  try {
    from = parseReturnPath(params.get("from") || undefined);
  } catch {}
  return (
    <article
      className="detail-pane plate"
      aria-busy="true"
      aria-label="Loading species details"
    >
      <Link href={from} className="fg-button detail-back" scroll={false}>
        ← Back to index
      </Link>
      <div className="detail-content">
        <div className="detail-topline">
          <p className="loading-status" role="status">
            Loading species…
          </p>
          <div className="skeleton" style={{ width: 170, height: 44 }} />
        </div>
        <div className="species-hero">
          <div className="artwork-stage skeleton" />
          <div>
            <div className="skeleton" style={{ height: 12, width: 140 }} />
            <div className="skeleton skeleton-hero-title" />
            <div className="skeleton" style={{ width: 160, height: 26 }} />
            {[1, 2, 3].map((i) => (
              <div className="skeleton skeleton-description" key={i} />
            ))}
          </div>
        </div>
        <div className="form-appearance">
          <div
            className="skeleton"
            style={{ height: 12, width: 80, marginBottom: 14 }}
          />
          <div className="skeleton" style={{ height: 44 }} />
          <div
            className="skeleton"
            style={{ height: 14, width: 120, margin: "24px 0 14px" }}
          />
          <div className="skeleton" style={{ height: 44 }} />
        </div>
        <div className="detail-data">
          <section>
            <div
              className="skeleton"
              style={{ width: 180, height: 28, marginBottom: 28 }}
            />
            {Array.from({ length: 6 }, (_, i) => (
              <div
                className="skeleton"
                key={i}
                style={{ height: 14, marginBottom: 20 }}
              />
            ))}
          </section>
          <section>
            <div
              className="skeleton"
              style={{ width: 160, height: 28, marginBottom: 28 }}
            />
            <div className="skeleton" style={{ height: 84 }} />
          </section>
        </div>
        <div className="evolution-section">
          <div
            className="skeleton"
            style={{ width: 180, height: 28, marginBottom: 24 }}
          />
          <div className="skeleton" style={{ height: 146 }} />
        </div>
        <div className="skeleton" style={{ height: 44, marginTop: 32 }} />
        <div className="skeleton" style={{ height: 44, marginTop: 20 }} />
      </div>
    </article>
  );
}
