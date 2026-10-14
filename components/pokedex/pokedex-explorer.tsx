"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Search, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GENERATIONS } from "@/lib/pokedex/generations";
import { formatDisplayName } from "@/lib/pokedex/format";
import {
  getBrowsePath,
  getDetailHref,
  matchesQuery,
} from "@/lib/pokedex/query";
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
  catalog,
  initialQuery,
  initialTypes,
  scope,
}: Props): React.JSX.Element {
  const [query, setQuery] = useState(initialQuery);
  const [selectedTypes, setSelectedTypes] = useState(initialTypes);
  const [draftTypes, setDraftTypes] = useState(initialTypes);
  const [limit, setLimit] = useState(40);
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
  const visible = useMemo(
    () =>
      catalog.pokemon.filter(
        (p) =>
          matchesQuery(p.name, p.id, query) &&
          (!selectedTypes.length ||
            selectedTypes.some((t) => p.types.includes(t))),
      ),
    [catalog.pokemon, query, selectedTypes],
  );
  const draftCount = catalog.pokemon.filter(
    (p) =>
      matchesQuery(p.name, p.id, query) &&
      (!draftTypes.length || draftTypes.some((t) => p.types.includes(t))),
  ).length;
  const selectionVisible =
    !selectedSpecies || visible.some((p) => p.name === selectedSpecies);
  const selectedIndex = visible.findIndex((p) => p.name === selectedSpecies);
  if (selectedIndex >= limit)
    setLimit(Math.ceil((selectedIndex + 1) / 40) * 40);

  useEffect(() => {
    if (!dirty.current) return;
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
  }, [browsePath, pathname, selectedSpecies, selectionVisible, router]);

  useEffect(() => {
    const snapshot = readSnapshot(
      getBrowsePath(scope, initialQuery, initialTypes),
    );
    if (!snapshot) return;
    lastClicked.current = snapshot.species;
    let restoreFrame = 0;
    const frame = requestAnimationFrame(() => {
      setLimit((current) => Math.max(current, snapshot.limit || 40));
      restoreFrame = requestAnimationFrame(() => {
        if (list.current) list.current.scrollTop = snapshot.top;
        if (!window.location.pathname.startsWith("/pokemon/")) {
          if (mobile) window.scrollTo(0, snapshot.top);
          const row = Array.from(
            list.current?.querySelectorAll<HTMLAnchorElement>(
              "[data-species]",
            ) || [],
          ).find((row) => row.dataset.species === snapshot.species);
          row?.focus({ preventScroll: true });
        }
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(restoreFrame);
    };
  }, [scope, initialQuery, initialTypes, mobile]);

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
  }, [selectedSpecies, mobile]);

  function record(): void {
    saveSnapshot(browsePath, {
      top: mobile ? window.scrollY : list.current?.scrollTop || 0,
      species: lastClicked.current,
      limit,
    });
  }
  function clear(): void {
    dirty.current = true;
    setQuery("");
    setSelectedTypes([]);
    setLimit(40);
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
            {catalog.pokemon.length} species / national order
          </span>
        </div>
      </div>
      <header className="workspace-intro" inert={mobile && !!selectedSpecies}>
        <h1>
          <span>Explore the </span>Pokédex
        </h1>
        <p>
          {mobile
            ? "Find a familiar face. Discover another."
            : "Choose a generation, then find a species by name or number."}
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
              autoComplete="off"
              placeholder="e.g. Bulbasaur or 0001"
              value={query}
              onChange={(e) => {
                dirty.current = true;
                setQuery(e.target.value);
                setLimit(40);
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
                    setLimit(40);
                    close();
                  }}
                >
                  <p>Matches either selected type, within this generation.</p>
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
                        {formatDisplayName(type)}
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
                    <button className="fg-button primary" type="submit">
                      Show {draftCount} species
                    </button>
                  </div>
                </form>
              )}
            </ControlPopover>
            <span className="result-count" role="status">
              {visible.length}{" "}
              {query || selectedTypes.length ? "results" : "species"}
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
          {visible.length ? (
            <>
              <ol>
                {visible.slice(0, limit).map((pokemon, index) => (
                  <li key={pokemon.id}>
                    <PokemonListRow
                      pokemon={pokemon}
                      priority={index < 4}
                      selected={pokemon.name === selectedSpecies}
                      detailHref={getDetailHref(pokemon.name, browsePath)}
                    />
                  </li>
                ))}
              </ol>
              {visible.length > limit && (
                <button
                  className="fg-button catalog-more"
                  type="button"
                  onClick={() => setLimit((current) => current + 40)}
                >
                  Load more <span aria-hidden>↓</span>
                </button>
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
