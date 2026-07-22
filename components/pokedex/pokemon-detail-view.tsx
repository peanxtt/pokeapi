"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { formatDexNumber } from "@/lib/pokedex/format";
import type { EvolutionChainNode, PokemonDetail, PokemonMoveSummary, PokemonTypeName } from "@/lib/pokedex/types";

import { ExpandableSection } from "@/components/pokedex/expandable-section";
import { PokemonArtwork } from "@/components/pokedex/pokemon-artwork";
import { TypeBadge } from "@/components/pokedex/type-badge";

type PokemonDetailViewProps = {
  detail: PokemonDetail;
  from: string;
};

type EvolutionNodeProps = {
  from: string;
  node: EvolutionChainNode;
};

function getVariantHref(from: string, speciesName: string, variantName: string, isDefault: boolean): string {
  const params = new URLSearchParams();

  if (!isDefault) {
    params.set("variant", variantName);
  }

  params.set("from", from);

  return `/pokemon/${speciesName}?${params.toString()}`;
}

function groupMoves(moves: PokemonMoveSummary[]): [string, PokemonMoveSummary[]][] {
  const groups = new Map<string, PokemonMoveSummary[]>();

  moves.forEach((move) => {
    move.methods.forEach((method) => {
      const currentMoves = groups.get(method) ?? [];
      groups.set(method, [...currentMoves, move]);
    });
  });

  return Array.from(groups.entries());
}

function EvolutionNode({ from, node }: EvolutionNodeProps): React.JSX.Element {
  return (
    <div className="min-w-[116px]">
      <Link className="group block" href={`/pokemon/${node.name}?from=${encodeURIComponent(from)}`}>
        <div className="artwork-stage relative mx-auto aspect-square w-24 overflow-hidden rounded-2xl transition-transform duration-300 group-hover:-translate-y-1">
          <PokemonArtwork alt={`${node.displayName} artwork`} priority={false} src={node.artworkUrl} />
        </div>
        <div className="mt-3 text-center">
          <span className="font-mono text-[10px] tracking-[0.08em] text-subtle">{formatDexNumber(node.id)}</span>
          <span className="mt-1 block text-sm font-semibold tracking-[-0.025em] text-foreground">{node.displayName}</span>
        </div>
      </Link>
      {node.evolutionCondition ? <p className="mt-2 text-center text-[10px] leading-4 text-muted">{node.evolutionCondition}</p> : null}
    </div>
  );
}

function EvolutionSequence({ from, node }: EvolutionNodeProps): React.JSX.Element {
  return (
    <div className="flex min-w-max items-start gap-3">
      <EvolutionNode from={from} node={node} />
      {node.evolvesTo.length > 0 ? (
        <div className="flex gap-3 border-l hairline pl-3">
          {node.evolvesTo.map((child) => (
            <div className="flex items-start gap-3" key={child.id}>
              <ChevronRight aria-hidden className="mt-12 shrink-0 text-subtle" size={16} strokeWidth={1.5} />
              <EvolutionSequence from={from} node={child} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }): React.JSX.Element {
  const scale = Math.min(value, 255) / 255;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-muted">{label}</span>
        <span className="font-mono text-xs text-foreground">{value}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-muted">
        <motion.div animate={{ scaleX: scale }} className="h-full origin-left rounded-full bg-brand" initial={{ scaleX: 0 }} transition={{ type: "spring", stiffness: 160, damping: 24 }} />
      </div>
    </div>
  );
}

function TypeHistory({ detail }: { detail: PokemonDetail }): React.JSX.Element {
  if (detail.historicalTypes.length === 0) {
    return <p className="text-sm leading-6 text-muted">No historical type changes are recorded for this Pokémon.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="max-w-xl text-sm leading-6 text-muted">The main index uses the current canonical type. Older games may have represented this Pokémon differently.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {detail.historicalTypes.map((history) => (
          <div className="rounded-xl border hairline bg-surface/45 p-3" key={history.generation}>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{history.generation}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {history.types.map((type: PokemonTypeName) => <TypeBadge key={type} type={type} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PokemonDetailView({ detail, from }: PokemonDetailViewProps): React.JSX.Element {
  const [isShiny, setIsShiny] = useState(false);
  const artworkUrl = isShiny && detail.shinyArtworkUrl ? detail.shinyArtworkUrl : detail.artworkUrl;
  const moveGroups = useMemo(() => groupMoves(detail.moves), [detail.moves]);
  const hasVariants = detail.variants.length > 1;
  const canShowShiny = detail.shinyArtworkUrl !== null;

  return (
    <main className="site-shell pb-20">
      <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground" href={from}>
        <ArrowLeft aria-hidden size={16} strokeWidth={1.7} />
        Back to index
      </Link>

      <section className="mt-5 grid gap-7 sm:grid-cols-[0.92fr_1.08fr] sm:items-end sm:gap-8">
        <motion.div animate={{ opacity: 1, y: 0 }} className="artwork-stage relative aspect-square overflow-hidden rounded-[28px]" initial={{ opacity: 0, y: 8 }} transition={{ duration: 0.45, ease: "easeOut" }}>
          <motion.div animate={{ opacity: 1, scale: 1 }} className="absolute inset-0" initial={{ opacity: 0, scale: 0.94 }} key={artworkUrl} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
            <PokemonArtwork alt={`${detail.displayName} artwork`} priority src={artworkUrl} />
          </motion.div>
          <span className="absolute left-4 top-4 rounded-lg bg-surface/70 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-muted backdrop-blur-md">{formatDexNumber(detail.id)}</span>
        </motion.div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">{detail.genus ?? "Pokémon species"}</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.075em] text-foreground sm:text-6xl">{detail.displayName}</h1>
          {detail.formName ? <p className="mt-3 text-sm font-medium text-muted">Form / {detail.formName}</p> : null}
          <div className="mt-5 flex flex-wrap gap-2">
            {detail.types.map((type) => <TypeBadge key={type} type={type} />)}
            {detail.isLegendary ? <span className="rounded-md bg-brand/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">Legendary</span> : null}
            {detail.isMythical ? <span className="rounded-md bg-brand/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">Mythical</span> : null}
          </div>
          <p className="mt-6 max-w-prose text-[15px] leading-7 text-muted">{detail.description ?? "A detailed field note is not available for this species."}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <motion.button
              aria-checked={isShiny}
              aria-label={canShowShiny ? "Shiny artwork" : "Shiny artwork unavailable"}
              className={`inline-flex min-h-11 items-center gap-3 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${isShiny ? "border-brand/45 bg-brand/10 text-brand" : "hairline text-muted hover:text-foreground"} disabled:cursor-not-allowed disabled:opacity-55`}
              disabled={!canShowShiny}
              onClick={() => setIsShiny((current) => !current)}
              role="switch"
              type="button"
              whileTap={canShowShiny ? { scale: 0.98 } : undefined}
            >
              <Sparkles aria-hidden size={16} strokeWidth={1.7} />
              <span>Shiny</span>
              <span aria-hidden className={`relative h-6 w-11 rounded-full p-0.5 transition-colors ${isShiny ? "bg-brand/80" : "bg-surface-muted"}`}>
                <motion.span
                  animate={{ x: isShiny ? 20 : 0 }}
                  className={`absolute left-0.5 top-0.5 size-5 rounded-full shadow-sm ${isShiny ? "bg-background" : "bg-foreground"}`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{canShowShiny ? (isShiny ? "On" : "Off") : "N/A"}</span>
            </motion.button>
          </div>
        </div>
      </section>

      {hasVariants ? (
        <section aria-labelledby="variant-heading" className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Species family</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.035em]" id="variant-heading">Choose a form</h2>
            </div>
            <p className="font-mono text-xs text-muted">{detail.variants.length.toString().padStart(2, "0")} forms</p>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {detail.variants.map((variant) => {
              const isSelected = variant.id === detail.id;

              return (
                <Link
                  aria-current={isSelected ? "page" : undefined}
                  className={`w-28 shrink-0 rounded-2xl border p-2 transition-colors ${isSelected ? "border-brand/55 bg-brand/8" : "hairline bg-surface/35 hover:bg-surface-muted/60"}`}
                  href={getVariantHref(from, detail.speciesName, variant.name, variant.isDefault)}
                  key={variant.id}
                >
                  <div className="artwork-stage relative aspect-square overflow-hidden rounded-xl">
                    <PokemonArtwork alt={`${variant.displayName} artwork`} priority={false} src={variant.artworkUrl} />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-foreground">{variant.displayName}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-subtle">{variant.isDefault ? "Default" : "Form"}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="stats-heading" className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">At a glance</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]" id="stats-heading">Base stats</h2>
          </div>
          <p className="font-mono text-xs text-muted">Current form</p>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {detail.stats.map((stat) => <StatBar key={stat.name} label={stat.label} value={stat.value} />)}
        </div>
      </section>

      <section aria-label="Pokémon details" className="mt-12">
        <ExpandableSection defaultOpen eyebrow="Family tree" title="Evolution">
          <div className="-mx-1 overflow-x-auto px-1 pb-2">
            {detail.evolution ? <EvolutionSequence from={from} node={detail.evolution} /> : <p className="text-sm text-muted">No evolution chain is recorded.</p>}
          </div>
        </ExpandableSection>

        <ExpandableSection defaultOpen={false} eyebrow={`${detail.abilities.length.toString().padStart(2, "0")} recorded`} title="Abilities">
          <div className="grid gap-2 sm:grid-cols-2">
            {detail.abilities.map((ability) => (
              <div className="flex items-center justify-between gap-3 rounded-xl border hairline bg-surface/35 px-3.5 py-3" key={ability.name}>
                <span className="text-sm font-medium text-foreground">{ability.displayName}</span>
                {ability.isHidden ? <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-brand">Hidden</span> : null}
              </div>
            ))}
          </div>
        </ExpandableSection>

        <ExpandableSection defaultOpen={false} eyebrow={`${detail.moves.length.toString().padStart(3, "0")} grouped`} title="Moves">
          <div className="space-y-6">
            {moveGroups.map(([method, moves]) => (
              <div key={method}>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{method}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {moves.map((move) => <span className="rounded-lg border hairline bg-surface/35 px-2.5 py-2 text-xs text-muted" key={`${method}-${move.name}`}>{move.displayName}</span>)}
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>

        <ExpandableSection defaultOpen={false} eyebrow="Canonical vs historical" title="Version details">
          <TypeHistory detail={detail} />
        </ExpandableSection>
      </section>
    </main>
  );
}
