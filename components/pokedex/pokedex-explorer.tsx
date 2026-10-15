"use client";
import { ImageStyleControl } from "./image-style-control";
import { TypeBadge } from "./type-badge";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Search, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GENERATIONS } from "@/lib/pokedex/generations";
import { getBrowsePath, getDetailHref } from "@/lib/pokedex/query";
import {
  POKEMON_TYPES,
  type CatalogScope,
  type PokemonCatalog,
  type PokemonTypeName,
} from "@/lib/pokedex/types";
import { PokemonListRow } from "@/components/pokedex/pokemon-list-row";
import { ControlPopover } from "@/components/pokedex/control-popover";
import {
  GuideEmblem,
  useIndexNavigation,
} from "@/components/pokedex/guide-shell";
import { useMobile } from "@/components/pokedex/use-mobile";
import { useCatalogPages } from "@/components/pokedex/use-catalog-pages";
import { TypeFilterSubmit } from "@/components/pokedex/type-filter-submit";
import { CatalogSkeletonRows } from "@/components/pokedex/skeletons";
import { CATALOG_PAGE_SIZE } from "@/lib/pokedex/types";

type Props = {
  catalog: PokemonCatalog;
  initialQuery: string;
  initialTypes: PokemonTypeName[];
  scope: CatalogScope;
};
type Snapshot = { top: number; species?: string; limit?: number };
function ScopePending(): React.JSX.Element | null {
  const { pending } = useLinkStatus();
  return pending ? (
    <span role="status">
      <LoaderCircle
        className="row-pending"
        size={16}
        aria-label="Loading generation"
      />
    </span>
  ) : null;
}
function readSnapshot(key: string): Snapshot | null {
  try {
    const value = sessionStorage.getItem("pokedex-browse:" + key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
function saveSnapshot(key: string, snapshot: Snapshot): void {
  try {
    sessionStorage.setItem("pokedex-browse:" + key, JSON.stringify(snapshot));
  } catch {}
}
export function PokedexExplorer({
  catalog: initialCatalog,
  initialQuery,
  initialTypes,
  scope,
}: Props): React.JSX.Element {
  const [query, setQuery] = useState(initialQuery);
  const [selectedTypes, setSelectedTypes] = useState(initialTypes);
  const [draftTypes, setDraftTypes] = useState(initialTypes);
  const [desiredCount, setDesiredCount] = useState(CATALOG_PAGE_SIZE);
  const [serverState, setServerState] = useState(
    initialQuery + "|" + initialTypes.join(","),
  );
  const propsState = initialQuery + "|" + initialTypes.join(",");
  if (serverState !== propsState) {
    setServerState(propsState);
    setQuery(initialQuery);
    setSelectedTypes(initialTypes);
  }
  const dirty = useRef(false);
  const list = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const restoration = useRef<Snapshot | null>(null);
  const previousSpecies = useRef<string | null>(null);
  const lastClicked = useRef<string | undefined>(undefined);
  const mobile = useMobile();
  const { markIndexEntry } = useIndexNavigation();
  const pathname = usePathname();
  const router = useRouter();
  const selectedSpecies = pathname.startsWith("/pokemon/")
    ? decodeURIComponent(pathname.split("/")[2] || "")
    : null;
  const browsePath = getBrowsePath(scope, query, selectedTypes);
  const initialBrowsePath = getBrowsePath(scope, initialQuery, initialTypes);
  const { catalog, pending, error, loadingMore, loadMore, retry } =
    useCatalogPages(
      initialCatalog,
      initialBrowsePath,
      scope,
      query,
      selectedTypes,
    );
  const visible = catalog.pokemon;
  const selectionVisible =
    !selectedSpecies || catalog.species.some((p) => p.name === selectedSpecies);
  const selectedIndex = catalog.species.findIndex(
    (p) => p.name === selectedSpecies,
  );
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!restoration.current && list.current) list.current.scrollTop = 0;
    });
    return () => cancelAnimationFrame(frame);
  }, [browsePath]);
  if (!pending && selectedIndex >= desiredCount)
    setDesiredCount(
      Math.ceil((selectedIndex + 1) / CATALOG_PAGE_SIZE) * CATALOG_PAGE_SIZE,
    );

  useEffect(() => {
    if (
      !pending &&
      !error &&
      !loadingMore &&
      visible.length < Math.min(desiredCount, catalog.species.length) &&
      catalog.nextOffset !== null
    )
      void loadMore();
  }, [
    pending,
    error,
    loadingMore,
    visible.length,
    desiredCount,
    catalog.species.length,
    catalog.nextOffset,
    loadMore,
  ]);

  useEffect(() => {
    if (
      pending ||
      error ||
      loadingMore ||
      catalog.nextOffset === null ||
      (mobile && selectedSpecies) ||
      !sentinel.current ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { root: mobile ? null : list.current, rootMargin: "320px 0px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [
    pending,
    error,
    loadingMore,
    catalog.nextOffset,
    mobile,
    selectedSpecies,
    loadMore,
  ]);

  useEffect(() => {
    if (!dirty.current || (selectedSpecies && (pending || error))) return;
    const timeout = setTimeout(() => {
      if (!dirty.current) return;
      dirty.current = false;
      if (selectedSpecies && !selectionVisible)
        router.replace(browsePath, { scroll: false });
      else if (selectedSpecies) {
        const params = new URLSearchParams(window.location.search);
        params.set("from", browsePath);
        window.history.replaceState(null, "", pathname + "?" + params);
      } else window.history.replaceState(null, "", browsePath);
    }, 200);
    return () => clearTimeout(timeout);
  }, [
    browsePath,
    pathname,
    selectedSpecies,
    selectionVisible,
    router,
    pending,
    error,
  ]);

  useEffect(() => {
    const snapshot = readSnapshot(initialBrowsePath);
    if (!snapshot) return;
    lastClicked.current = snapshot.species;
    restoration.current = snapshot;
    const frame = requestAnimationFrame(() => {
      setDesiredCount((current) =>
        Math.max(current, snapshot.limit || CATALOG_PAGE_SIZE),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [initialBrowsePath, mobile]);

  useEffect(() => {
    const snapshot = restoration.current;
    if (
      !snapshot ||
      pending ||
      error ||
      visible.length <
        Math.min(snapshot.limit || CATALOG_PAGE_SIZE, catalog.species.length)
    )
      return;
    const frame = requestAnimationFrame(() => {
      if (list.current) list.current.scrollTop = snapshot.top;
      if (!window.location.pathname.startsWith("/pokemon/")) {
        if (mobile) window.scrollTo(0, snapshot.top);
        const row = Array.from(
          list.current?.querySelectorAll<HTMLAnchorElement>("[data-species]") ||
            [],
        ).find((row) => row.dataset.species === snapshot.species);
        row?.focus({ preventScroll: true });
      }
      restoration.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [visible.length, catalog.species.length, pending, error, mobile]);

  useEffect(() => {
    if (!selectedSpecies && previousSpecies.current && list.current) {
      const row = Array.from(
        list.current.querySelectorAll<HTMLAnchorElement>("[data-species]"),
      ).find((row) => row.dataset.species === previousSpecies.current);
      row?.focus({ preventScroll: true });
    }
    previousSpecies.current = selectedSpecies;
    if (!mobile && selectedSpecies && lastClicked.current !== selectedSpecies) {
      const row = Array.from(
        list.current?.querySelectorAll<HTMLAnchorElement>("[data-species]") ||
          [],
      ).find((row) => row.dataset.species === selectedSpecies);
      row?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [selectedSpecies, mobile, visible.length]);

  function record(): void {
    if (restoration.current || pending || error === "first") return;
    saveSnapshot(browsePath, {
      top: mobile ? window.scrollY : list.current?.scrollTop || 0,
      species: lastClicked.current,
      limit: visible.length,
    });
  }
  function clear(): void {
    restoration.current = null;
    dirty.current = true;
    setQuery("");
    setSelectedTypes([]);
    setDesiredCount(CATALOG_PAGE_SIZE);
  }
  function generationMenu(close: () => void): React.ReactNode {
    return (
      <nav className="menu-options" aria-label="Choose a generation">
        {[
          ...GENERATIONS.map((g) => ({
            scope: g.id as CatalogScope,
            label: g.label + " / " + g.region,
          })),
          { scope: "all" as CatalogScope, label: "All generations" },
        ].map((g) => (
          <Link
            key={g.scope}
            href={getBrowsePath(g.scope)}
            prefetch={false}
            scroll={false}
            className={`menu-option ${g.scope === scope ? "selected" : ""}`}
            aria-current={g.scope === scope ? "page" : undefined}
            onClick={() => {
              if (g.scope === scope) close();
            }}
          >
            {g.label}
            <ScopePending />
            {g.scope === scope && (
              <span className="menu-check" aria-hidden>
                ✓
              </span>
            )}
          </Link>
        ))}
      </nav>
    );
  }
  const generationControl = (
    <ControlPopover
      title="Generation"
      active
      label={
        scope === "all"
          ? "All generations"
          : catalog.generation.label + " / " + catalog.generation.region
      }
    >
      {generationMenu}
    </ControlPopover>
  );

  return (
    <>
      <div className="scope-strip">
        <div className="scope-inner">
          <span>
            {scope === "all"
              ? "All generations"
              : catalog.generation.label + " / " + catalog.generation.region}
          </span>
          <span className="scope-count">
            {catalog.totalSpecies} species / national order
          </span>
        </div>
      </div>
      <header className="workspace-intro" inert={mobile && !!selectedSpecies}>
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
        <div className="compact-generation">{generationControl}</div>
      </header>
      <nav
        className="generation-rail"
        aria-label="Choose a generation"
        inert={mobile && !!selectedSpecies}
      >
        <p className="uppercase-label">Generations</p>
        {GENERATIONS.map((g) => (
          <Link
            className="generation-link"
            href={getBrowsePath(g.id)}
            prefetch={false}
            scroll={false}
            aria-current={scope === g.id ? "page" : undefined}
            key={g.id}
          >
            {g.label}
            <ScopePending />
          </Link>
        ))}
        <Link
          className="generation-link"
          href={getBrowsePath("all")}
          prefetch={false}
          scroll={false}
          aria-current={scope === "all" ? "page" : undefined}
        >
          All generations
          <ScopePending />
        </Link>
        <p className="rail-note">Names and numbers search this scope.</p>
      </nav>
      <section
        className="index-pane plate"
        aria-label="Pokédex index"
        inert={mobile && !!selectedSpecies}
      >
        <div className="index-header">
          <h2 className="index-heading">
            {scope === "all" ? "National" : catalog.generation.region} index
          </h2>
          <p className="uppercase-label">
            {scope === "all" ? "All generations" : catalog.generation.label}
          </p>
          <label className="search-label" htmlFor="pokemon-search">
            Search by name or number
          </label>
          <div className="search-field">
            <input
              id="pokemon-search"
              type="search"
              maxLength={100}
              autoComplete="off"
              placeholder="e.g. Bulbasaur or 0001"
              value={query}
              onChange={(e) => {
                dirty.current = true;
                setQuery(e.target.value);
                restoration.current = null;
                setDesiredCount(CATALOG_PAGE_SIZE);
              }}
            />
            {query && (
              <button
                className="icon-button"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  dirty.current = true;
                  setQuery("");
                  restoration.current = null;
                  setDesiredCount(CATALOG_PAGE_SIZE);
                }}
              >
                <X size={16} aria-hidden />
              </button>
            )}
          </div>
          <div className="mobile-scope-controls">
            {generationControl}
            <Link
              className={`fg-button ${scope === "all" ? "primary" : ""}`}
              href={getBrowsePath("all")}
              prefetch={false}
              scroll={false}
            >
              All
              <ScopePending />
            </Link>
          </div>
          <div className="filter-toolbar">
            <ControlPopover
              title="Filter by type"
              label={
                selectedTypes.length
                  ? `Types (${selectedTypes.length})`
                  : "Types"
              }
              active={selectedTypes.length > 0}
              onOpen={() => setDraftTypes(selectedTypes)}
            >
              {(close) => (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    dirty.current = true;
                    setSelectedTypes(draftTypes);
                    restoration.current = null;
                    setDesiredCount(CATALOG_PAGE_SIZE);
                    close();
                  }}
                >
                  <p>Matches any selected type, within this scope.</p>
                  <div className="type-options">
                    {POKEMON_TYPES.map((type) => (
                      <label className="type-option" key={type}>
                        <input
                          type="checkbox"
                          checked={draftTypes.includes(type)}
                          onChange={() =>
                            setDraftTypes((current) =>
                              current.includes(type)
                                ? current.filter((t) => t !== type)
                                : [...current, type],
                            )
                          }
                        />
                        <TypeBadge type={type} />
                      </label>
                    ))}
                  </div>
                  <div className="popover-actions">
                    <button
                      className="fg-button"
                      type="button"
                      onClick={() => setDraftTypes([])}
                    >
                      Clear
                    </button>
                    <TypeFilterSubmit
                      scope={scope}
                      query={query}
                      types={draftTypes}
                      knownCount={
                        !pending &&
                        !error &&
                        draftTypes.join(",") === selectedTypes.join(",")
                          ? catalog.species.length
                          : undefined
                      }
                    />
                  </div>
                </form>
              )}
            </ControlPopover>
            <ImageStyleControl compact />
            <span className="result-count" role="status">
              {pending
                ? "Searching…"
                : error === "first"
                  ? "Unavailable"
                  : `${catalog.species.length} ${query || selectedTypes.length ? "results" : "species"}`}
            </span>
          </div>
        </div>
        <div
          ref={list}
          className="catalog-list"
          onScroll={record}
          onClickCapture={(event) => {
            const row = (event.target as Element).closest<HTMLAnchorElement>(
              "[data-species]",
            );
            if (row) {
              restoration.current = null;
              // Flush a pending search before the row pushes its detail URL.
              if (dirty.current && !selectedSpecies)
                window.history.replaceState(null, "", browsePath);
              dirty.current = false;
              markIndexEntry(mobile);
              lastClicked.current = row.dataset.species;
              record();
            }
          }}
        >
          {pending ? (
            <ol aria-busy="true" aria-label="Loading species">
              <CatalogSkeletonRows />
            </ol>
          ) : error === "first" ? (
            <div className="empty-catalog">
              <h2>Couldn’t load species.</h2>
              <p role="alert">Try loading these results again.</p>
              <button
                className="fg-button primary"
                type="button"
                onClick={retry}
              >
                Try again
              </button>
            </div>
          ) : visible.length ? (
            <>
              <ol>
                {visible.map((pokemon, index) => (
                  <li key={pokemon.id}>
                    <PokemonListRow
                      pokemon={pokemon}
                      priority={index < 4}
                      selected={pokemon.name === selectedSpecies}
                      detailHref={getDetailHref(pokemon.name, browsePath)}
                    />
                  </li>
                ))}
                {loadingMore && <CatalogSkeletonRows count={3} />}
              </ol>
              {loadingMore && (
                <span className="sr-only" role="status">
                  Loading more species…
                </span>
              )}
              {error === "more" && (
                <p className="catalog-page-error" role="alert">
                  Couldn’t load the next species. Your current list is saved.
                </p>
              )}
              {catalog.nextOffset !== null && (
                <div ref={sentinel} className="catalog-sentinel">
                  <button
                    className="fg-button catalog-more"
                    type="button"
                    disabled={loadingMore}
                    onClick={error === "more" ? retry : () => void loadMore()}
                  >
                    {loadingMore
                      ? "Loading species…"
                      : error === "more"
                        ? "Try again"
                        : "Load more"}{" "}
                    <span aria-hidden>↓</span>
                  </button>
                </div>
              )}
              <p className="catalog-footer">
                National order /{" "}
                {scope === "all" ? "All generations" : catalog.generation.label}
              </p>
            </>
          ) : (
            <div className="empty-catalog">
              <GuideEmblem size={40} />
              <h2>No species match.</h2>
              <p>
                Try a name or national number, or clear the current type
                filters.
              </p>
              <button
                className="fg-button primary"
                type="button"
                onClick={clear}
              >
                <Search size={16} aria-hidden />
                Clear search and filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
