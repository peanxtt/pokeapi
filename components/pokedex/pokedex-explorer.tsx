"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GENERATIONS } from "@/lib/pokedex/generations";
import { formatDexNumber, formatDisplayName } from "@/lib/pokedex/format";
import { POKEMON_TYPES, type CatalogScope, type PokemonCatalog, type PokemonTypeName } from "@/lib/pokedex/types";

import { PokemonListRow } from "@/components/pokedex/pokemon-list-row";

type PokedexExplorerProps = {
  catalog: PokemonCatalog;
  initialQuery: string;
  initialTypes: PokemonTypeName[];
  scope: CatalogScope;
};

function getScopeHref(scope: CatalogScope): string {
  return scope === "all" ? "/?generation=all" : `/?generation=${scope}`;
}

function getBrowsePath(scope: CatalogScope, query: string, types: PokemonTypeName[]): string {
  const params = new URLSearchParams();
  params.set("generation", scope.toString());

  if (query.trim().length > 0) {
    params.set("q", query.trim());
  }

  if (types.length > 0) {
    params.set("types", types.join(","));
  }

  return `/?${params.toString()}`;
}

function getDetailHref(
  scope: CatalogScope,
  query: string,
  types: PokemonTypeName[],
  pokemonName: string,
): string {
  const from = encodeURIComponent(getBrowsePath(scope, query, types));
  return `/pokemon/${pokemonName}?from=${from}`;
}

function isMatchingQuery(name: string, id: number, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return true;
  }

  return name.includes(normalizedQuery) || id.toString() === normalizedQuery || formatDexNumber(id).includes(normalizedQuery);
}

export function PokedexExplorer({ catalog, initialQuery, initialTypes, scope }: PokedexExplorerProps): React.JSX.Element {
  const [query, setQuery] = useState(initialQuery);
  const [selectedTypes, setSelectedTypes] = useState<PokemonTypeName[]>(initialTypes);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.history.replaceState(null, "", getBrowsePath(scope, query, selectedTypes));
    }, 240);

    return () => window.clearTimeout(timeout);
  }, [query, scope, selectedTypes]);

  const visiblePokemon = useMemo(
    () => catalog.pokemon.filter((pokemon) => {
      const matchesQuery = isMatchingQuery(pokemon.name, pokemon.id, query);
      const matchesType = selectedTypes.length === 0 || selectedTypes.some((type) => pokemon.types.includes(type));
      return matchesQuery && matchesType;
    }),
    [catalog.pokemon, query, selectedTypes],
  );

  function toggleType(type: PokemonTypeName): void {
    setSelectedTypes((currentTypes) => currentTypes.includes(type)
      ? currentTypes.filter((currentType) => currentType !== type)
      : [...currentTypes, type]);
  }

  function clearFilters(): void {
    setQuery("");
    setSelectedTypes([]);
  }

  return (
    <main className="site-shell pb-20">
      <section aria-labelledby="pokedex-heading" className="pt-8 sm:pt-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">National reference</p>
            <h1 className="mt-3 max-w-[13ch] text-4xl font-semibold tracking-[-0.065em] text-foreground sm:text-5xl" id="pokedex-heading">
              Know every Pokémon.
            </h1>
          </div>
          <p className="hidden max-w-[16ch] pb-1 text-right text-sm leading-6 text-muted sm:block">
            Start with a generation. Search when you know what you’re looking for.
          </p>
        </div>
      </section>

      <nav aria-label="Choose a generation" className="mt-10 -mx-1 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1 px-1">
          <Link
            aria-current={scope === "all" ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${scope === "all" ? "border border-line-strong bg-surface-strong text-foreground" : "text-muted hover:bg-surface-muted hover:text-foreground"}`}
            href={getScopeHref("all")}
          >
            All
          </Link>
          {GENERATIONS.map((generation) => (
            <Link
              aria-current={scope === generation.id ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${scope === generation.id ? "border border-line-strong bg-surface-strong text-foreground" : "text-muted hover:bg-surface-muted hover:text-foreground"}`}
              href={getScopeHref(generation.id)}
              key={generation.id}
            >
              {generation.label}
            </Link>
          ))}
        </div>
      </nav>

      <section aria-label="Pokédex controls" className="glass-surface mt-5 rounded-2xl p-3 sm:p-4">
        <label className="flex min-h-11 items-center gap-3 rounded-xl border hairline bg-surface/55 px-3 text-muted" htmlFor="pokemon-search">
          <Search aria-hidden size={17} strokeWidth={1.8} />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle"
            id="pokemon-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={scope === "all" ? "Search every generation" : `Search ${catalog.generation.region}`}
            type="search"
            value={query}
          />
          {query.length > 0 ? (
            <button aria-label="Clear search" className="text-subtle transition-colors hover:text-foreground" onClick={() => setQuery("")} type="button">
              <X aria-hidden size={16} />
            </button>
          ) : null}
        </label>

        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          <SlidersHorizontal aria-hidden size={14} strokeWidth={1.8} />
          <span>Filter by type</span>
          {selectedTypes.length > 0 ? <span className="font-mono normal-case tracking-normal text-brand">{selectedTypes.length} selected</span> : null}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {POKEMON_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type);

            return (
              <button
                aria-pressed={isSelected}
                className={`type-badge shrink-0 rounded-lg border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition-all ${isSelected ? "border-foreground/35 ring-2 ring-brand/30" : "border-transparent opacity-65 hover:opacity-100"}`}
                data-type={type}
                key={type}
                onClick={() => toggleType(type)}
                type="button"
              >
                {formatDisplayName(type)}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-live="polite" className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">{catalog.generation.region}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-foreground">{catalog.generation.label} index</h2>
          </div>
          <p className="font-mono text-xs text-muted">{visiblePokemon.length.toString().padStart(3, "0")} shown</p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {visiblePokemon.length > 0 ? (
            <motion.ul
              animate="visible"
              className="mt-3"
              initial="hidden"
              key={`${query}-${selectedTypes.join("-")}`}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.025 } },
              }}
            >
              {visiblePokemon.map((pokemon, index) => (
                <motion.li
                  key={pokemon.id}
                  variants={{ hidden: { opacity: 0, y: 7 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <PokemonListRow
                    detailHref={getDetailHref(scope, query, selectedTypes, pokemon.name)}
                    pokemon={pokemon}
                    priority={index < 4}
                  />
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <motion.div animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border hairline bg-surface/55 px-5 py-8" initial={{ opacity: 0, y: 6 }}>
              <p className="text-sm font-medium text-foreground">No Pokémon match this view.</p>
              <p className="mt-1 text-sm leading-6 text-muted">Try a different name, number, or type filter.</p>
              <button className="mt-4 text-sm font-semibold text-brand underline decoration-brand/35 underline-offset-4" onClick={clearFilters} type="button">
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
