"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  GENERATIONS,
  getGenerationSummary,
  parseCatalogScope,
} from "@/lib/pokedex/generations";
import { parseReturnPath } from "@/lib/pokedex/query";
import type { CatalogScope } from "@/lib/pokedex/types";
import { ImageStyleControl } from "./image-style-control";

export function CatalogSkeletonRows({
  count = 6,
}: {
  count?: number;
}): React.JSX.Element {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="species-row skeleton-row" aria-hidden="true">
            <div className="row-artwork skeleton" />
            <div className="row-identity">
              <span className="species-number skeleton" />
              <h3 className="skeleton" />
              <span className="row-types">
                <span
                  className="type-badge compact skeleton"
                  style={{ width: 62 }}
                />
                <span
                  className="type-badge compact skeleton"
                  style={{ width: 67 }}
                />
              </span>
            </div>
            <span className="row-status" />
          </div>
        </li>
      ))}
    </>
  );
}

export function CatalogSkeleton(): React.JSX.Element {
  const params = useSearchParams();
  let scope: CatalogScope = 1;
  try {
    const from = new URL(
      parseReturnPath(params.get("from") || undefined),
      "https://pokedex.invalid",
    );
    scope = parseCatalogScope(
      params.get("generation") ||
        from.searchParams.get("generation") ||
        undefined,
    );
  } catch {}
  const generation = getGenerationSummary(scope);
  const scopeLabel =
    scope === "all"
      ? "All generations"
      : generation.label + " / " + generation.region;
  const selector = (
    <div className="control-popover">
      <button className="fg-button primary" type="button" disabled>
        {scopeLabel}
        <ChevronDown size={15} aria-hidden />
      </button>
    </div>
  );
  return (
    <>
      <div className="scope-strip">
        <div className="scope-inner">
          <span>{scopeLabel}</span>
          <span className="scope-count">Loading species…</span>
        </div>
      </div>
      <header className="workspace-intro">
        <h1>
          <span>Explore the </span>Pokédex
        </h1>
        <p>
          <span className="intro-desktop">
            Choose a generation, then find a species by name or number.
          </span>
          <span className="intro-mobile">
            Find a familiar face. Discover another.
          </span>
        </p>
        <div className="compact-generation">{selector}</div>
      </header>
      <div className="generation-rail" aria-hidden="true">
        <p className="uppercase-label">Generations</p>
        {GENERATIONS.map((g) => (
          <div
            key={g.id}
            className="generation-link"
            aria-current={g.id === scope ? "page" : undefined}
          >
            {g.label}
          </div>
        ))}
        <div
          className="generation-link"
          aria-current={scope === "all" ? "page" : undefined}
        >
          All generations
        </div>
        <p className="rail-note">Names and numbers search this scope.</p>
      </div>
      <section
        className="index-pane plate"
        aria-busy="true"
        aria-label="Loading Pokédex index"
      >
        <div className="index-header">
          <h2 className="index-heading">
            {scope === "all" ? "National" : generation.region} index
          </h2>
          <p className="uppercase-label">
            {scope === "all" ? "All generations" : generation.label}
          </p>
          <label className="search-label" htmlFor="loading-pokemon-search">
            Search by name or number
          </label>
          <div className="search-field">
            <input
              id="loading-pokemon-search"
              type="search"
              placeholder="e.g. Bulbasaur or 0001"
              disabled
            />
          </div>
          <div className="mobile-scope-controls">
            {selector}
            <button className="fg-button" type="button" disabled>
              All
            </button>
          </div>
          <div className="filter-toolbar">
            <button className="fg-button" type="button" disabled>
              Types
              <ChevronDown size={15} aria-hidden />
            </button>
            <ImageStyleControl compact />
            <span className="result-count" role="status">
              Loading…
            </span>
          </div>
        </div>
        <div className="catalog-list">
          <span className="sr-only" role="status">
            Loading species…
          </span>
          <ol>
            <CatalogSkeletonRows />
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
        <span className="sr-only" role="status">
          Loading species…
        </span>
        <div className="detail-topline">
          <div
            className="meta skeleton"
            style={{ width: "13ch", height: 18 }}
          />
          <div className="fg-button skeleton skeleton-next" />
        </div>
        <div className="species-hero">
          <div className="artwork-stage skeleton" />
          <div className="species-identity">
            <div
              className="uppercase-label skeleton"
              style={{ height: 18, width: 140 }}
            />
            <h1
              className="species-title skeleton"
              style={{ height: "1.25em", width: "85%" }}
            />
            <div className="species-types">
              <div
                className="type-badge skeleton"
                style={{ width: 66, height: 28 }}
              />
              <div
                className="type-badge skeleton"
                style={{ width: 71, height: 28 }}
              />
            </div>
            <div className="species-description">
              <div
                className="skeleton"
                style={{ height: 18, marginBottom: 8 }}
              />
              <div
                className="skeleton"
                style={{ height: 18, marginBottom: 8 }}
              />
              <div className="skeleton" style={{ height: 18, width: "80%" }} />
            </div>
          </div>
        </div>
        <ImageStyleControl />
        <section className="form-appearance" aria-label="Form and appearance">
          <label className="uppercase-label">Form</label>
          <div className="form-readonly skeleton" />
          <h2 className="appearance-heading">Appearance</h2>
          <div className="appearance-buttons">
            <div className="fg-button skeleton" style={{ width: "50%" }} />
            <div className="fg-button skeleton" style={{ width: "50%" }} />
          </div>
          <div
            className="appearance-note skeleton"
            style={{ height: 18, width: "65%" }}
          />
        </section>
        <div className="detail-data">
          <section>
            <h2>Base stats</h2>
            <div className="stats-list">
              {Array.from({ length: 6 }, (_, i) => (
                <div className="stat-row" key={i}>
                  <div className="skeleton" style={{ height: 14, width: 60 }} />
                  <div className="stat-track skeleton" />
                  <div className="stat-value skeleton" style={{ height: 14 }} />
                </div>
              ))}
            </div>
            <div
              className="meta stat-total skeleton"
              style={{ height: 17, width: "80%" }}
            />
          </section>
          <section className="ability-section">
            <h2>Abilities</h2>
            {[1, 2].map((i) => (
              <div className="ability-item" key={i}>
                <h3 className="skeleton" style={{ height: 23, width: "65%" }} />
                <div className="skeleton" style={{ height: 45 }} />
              </div>
            ))}
          </section>
        </div>
        <div className="evolution-section">
          <h2>Evolution</h2>
          <div className="skeleton" style={{ height: 146 }} />
        </div>
        <div className="expandable-section">
          <div className="fg-button skeleton disclosure-trigger" />
        </div>
        <div className="expandable-section">
          <div className="fg-button skeleton disclosure-trigger" />
        </div>
      </div>
    </article>
  );
}
