"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { formatDexNumber } from "@/lib/pokedex/format";
import { getDetailHref, parseReturnPath } from "@/lib/pokedex/query";
import { getGenerationSummary } from "@/lib/pokedex/generations";
import type {
  EvolutionChainNode,
  PokemonDetail,
  PokemonMoveSummary,
} from "@/lib/pokedex/types";
import { PokemonArtwork } from "@/components/pokedex/pokemon-artwork";
import { TypeBadge } from "@/components/pokedex/type-badge";
import { ExpandableSection } from "@/components/pokedex/expandable-section";
import { useMobile } from "@/components/pokedex/use-mobile";
import { useIndexNavigation } from "@/components/pokedex/guide-shell";
import { useState } from "react";
import { IntentLink } from "./intent-link";
import { useGuidePreferences } from "./guide-preferences";
import { ImageStyleControl } from "./image-style-control";

type Props = {
  detail: PokemonDetail;
  from: string;
  next?: { label: string; href: string };
};
function groupMoves(
  moves: PokemonMoveSummary[],
): [string, PokemonMoveSummary[]][] {
  const groups = new Map<string, PokemonMoveSummary[]>();
  for (const move of moves)
    for (const method of move.methods)
      groups.set(method, [...(groups.get(method) || []), move]);
  return Array.from(groups);
}
function EvolutionSequence({
  node,
  from,
  current,
}: {
  node: EvolutionChainNode;
  from: string;
  current: string;
}): React.JSX.Element {
  return (
    <div className="evolution-chain">
      <div className="evolution-node">
        <IntentLink
          href={getDetailHref(node.name, from)}
          replace
          scroll={false}
          aria-current={node.name === current ? "page" : undefined}
        >
          <div className="evolution-artwork">
            <PokemonArtwork
              alt={node.displayName + " artwork"}
              src={node.artworkUrl}
              pixelSprites={node.pixelSprites}
              priority={false}
              sizes="96px"
              retryable={false}
            />
          </div>
          <strong>{node.displayName}</strong>
        </IntentLink>
        <p>{node.evolutionCondition || "Base species"}</p>
      </div>
      {!!node.evolvesTo.length && (
        <div className="evolution-branches">
          {node.evolvesTo.map((child) => (
            <div className="evolution-branch" key={child.id}>
              <ChevronRight className="evolution-arrow" size={18} aria-hidden />
              <EvolutionSequence node={child} from={from} current={current} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function StatBar({
  label,
  value,
}: {
  label: string;
  value: number;
}): React.JSX.Element {
  return (
    <div className="stat-row">
      <span>{label}</span>
      <div className="stat-track" aria-hidden>
        <motion.div
          className="stat-fill"
          initial={false}
          animate={{ scaleX: Math.min(value, 255) / 255 }}
        />
      </div>
      <span className="stat-value">{value}</span>
    </div>
  );
}
export function PokemonDetailView({
  detail,
  from: serverFrom,
  next,
}: Props): React.JSX.Element {
  const [isShiny, setIsShiny] = useState(false);
  const [imageSource, setImageSource] = useState("");
  const { activateSpecies } = useGuidePreferences();
  useEffect(
    () => activateSpecies(detail.speciesName, detail.cryUrl ?? null),
    [activateSpecies, detail.speciesName, detail.cryUrl],
  );
  const mobile = useMobile();
  const { enteredFromIndex } = useIndexNavigation();
  const reduced = useReducedMotion();
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from")
    ? parseReturnPath(params.get("from") || undefined)
    : serverFrom;
  const pane = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const edgeStart = useRef<{ x: number; y: number } | null>(null);
  const shiny = isShiny && !!detail.shinyArtworkUrl;
  const artwork = shiny ? detail.shinyArtworkUrl : detail.artworkUrl;
  const moveGroups = useMemo(() => groupMoves(detail.moves), [detail.moves]);
  const generation = getGenerationSummary(detail.introductionGeneration);
  const total = detail.stats.reduce((sum, stat) => sum + stat.value, 0);
  function back(): void {
    if (enteredFromIndex && mobile) router.back();
    else router.replace(from, { scroll: false });
  }
  useEffect(() => {
    if (pane.current) pane.current.scrollTop = 0;
    if (mobile) heading.current?.focus({ preventScroll: true });
  }, [detail.speciesName, mobile]);
  useEffect(() => {
    if (!mobile) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, [mobile]);
  useEffect(() => {
    function escape(event: KeyboardEvent): void {
      if (event.key !== "Escape" || event.defaultPrevented || !mobile) return;
      if ((event.target as Element)?.closest?.("[data-popover='open']")) return;
      event.preventDefault();
      if (enteredFromIndex) router.back();
      else router.replace(from, { scroll: false });
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [from, enteredFromIndex, mobile, router]);
  return (
    <motion.article
      ref={pane}
      className="detail-pane plate"
      aria-labelledby="species-heading"
      initial={{ opacity: 0, x: mobile && !reduced ? "100%" : 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: mobile && !reduced ? "100%" : 0 }}
      transition={{
        duration: reduced ? 0 : mobile ? 0.24 : 0.18,
        ease: [0.25, 1, 0.5, 1],
      }}
    >
      {mobile && (
        <span
          className="swipe-edge"
          aria-hidden
          onPointerDown={(event) => {
            if (event.pointerType === "touch") {
              edgeStart.current = { x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          }}
          onPointerUp={(event) => {
            const start = edgeStart.current;
            edgeStart.current = null;
            if (
              start &&
              event.clientX - start.x > 70 &&
              Math.abs(event.clientY - start.y) < 50
            )
              back();
          }}
        />
      )}
      <Link
        className="fg-button detail-back"
        href={from}
        replace
        scroll={false}
        onClick={(event) => {
          if (mobile) {
            event.preventDefault();
            back();
          }
        }}
      >
        <ArrowLeft size={17} aria-hidden />
        Back to index
      </Link>
      <div className="detail-content">
        <div className="detail-topline">
          <p className="meta">
            {formatDexNumber(detail.id)} / {generation.label}
          </p>
          {next && from === serverFrom && (
            <IntentLink
              className="fg-button"
              href={next.href}
              replace
              scroll={false}
            >
              Next: {next.label}
              <span aria-hidden>→</span>
            </IntentLink>
          )}
        </div>
        <div className="species-hero">
          <div className="artwork-stage">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={artwork || "unavailable"}
                className="artwork-frame"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.18 }}
              >
                <PokemonArtwork
                  alt={
                    detail.displayName + (shiny ? " shiny" : "") + " artwork"
                  }
                  src={artwork}
                  pixelSprites={detail.pixelSprites}
                  shiny={shiny}
                  onSourceChange={setImageSource}
                  priority
                  sizes="(max-width: 699px) 80vw, 310px"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="species-identity">
            <p className="uppercase-label">
              {detail.genus || "Pokémon species"}
            </p>
            <h1
              ref={heading}
              tabIndex={-1}
              id="species-heading"
              className="species-title"
            >
              {detail.displayName}
            </h1>
            {detail.formName && <p className="form-name">{detail.formName}</p>}
            <div className="species-types">
              {detail.types.map((type) => (
                <TypeBadge key={type} type={type} />
              ))}
              {detail.isLegendary && (
                <span className="type-badge">Legendary</span>
              )}
              {detail.isMythical && (
                <span className="type-badge">Mythical</span>
              )}
            </div>
            <p className="species-description">
              {detail.description ||
                "A field note is not available for this species."}
            </p>
          </div>
        </div>
        <ImageStyleControl source={imageSource} />
        <section className="form-appearance" aria-label="Form and appearance">
          <label
            className="uppercase-label"
            htmlFor={
              detail.variants.length > 1 ? "variant-selector" : undefined
            }
          >
            Form
          </label>
          {detail.variants.length > 1 ? (
            <select
              id="variant-selector"
              className="fg-button form-select"
              value={
                detail.variants.find((v) => v.id === detail.variantId)?.name
              }
              onChange={(event) => {
                const variant = detail.variants.find(
                  (v) => v.name === event.target.value,
                );
                router.replace(
                  getDetailHref(
                    detail.speciesName,
                    from,
                    variant?.isDefault ? undefined : variant?.name,
                  ),
                  { scroll: false },
                );
              }}
            >
              {detail.variants.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.isDefault ? "Default form" : v.displayName}
                </option>
              ))}
            </select>
          ) : (
            <div className="form-readonly">
              Default form<span>Only form</span>
            </div>
          )}
          <h2 className="appearance-heading">Appearance</h2>
          <div className="appearance-buttons">
            <button
              className={`fg-button ${!shiny ? "primary" : ""}`}
              type="button"
              aria-pressed={!shiny}
              onClick={() => setIsShiny(false)}
            >
              Default
            </button>
            <button
              className={`fg-button ${shiny ? "primary" : ""}`}
              type="button"
              aria-pressed={shiny}
              disabled={!detail.shinyArtworkUrl}
              onClick={() => setIsShiny(true)}
            >
              {detail.shinyArtworkUrl ? "Shiny" : "Shiny unavailable"}
            </button>
          </div>
          <p className="appearance-note">
            {shiny
              ? "Shiny appearance, same species."
              : "Changes appearance only."}
          </p>
        </section>
        <div className="detail-data">
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading">Base stats</h2>
            <div className="stats-list">
              {detail.stats.map((stat) => (
                <StatBar
                  key={stat.name}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </div>
            <p className="meta stat-total">TOTAL {total} / SCALE 0–255</p>
          </section>
          <section
            className="ability-section"
            aria-labelledby="abilities-heading"
          >
            <h2 id="abilities-heading">Abilities</h2>
            {detail.abilities.length ? (
              detail.abilities.map((ability) => (
                <div className="ability-item" key={ability.name}>
                  <h3>{ability.displayName}</h3>
                  <p>
                    {ability.description ||
                      "An effect description is not available."}
                  </p>
                  {ability.isHidden && (
                    <span className="uppercase-label">Hidden ability</span>
                  )}
                </div>
              ))
            ) : (
              <p className="muted">No abilities are recorded.</p>
            )}
          </section>
        </div>
        <section
          className="evolution-section"
          aria-labelledby="evolution-heading"
        >
          <h2 id="evolution-heading">Evolution</h2>
          {detail.evolution ? (
            <div className="evolution-scroll">
              <EvolutionSequence
                node={detail.evolution}
                from={from}
                current={detail.speciesName}
              />
            </div>
          ) : (
            <p className="muted">No evolution chain is recorded.</p>
          )}
        </section>
        <ExpandableSection
          defaultOpen={false}
          title="Moves"
          eyebrow="Grouped by learn method"
        >
          {moveGroups.length ? (
            moveGroups.map(([method, moves]) => (
              <div className="move-group" key={method}>
                <h3>{method}</h3>
                <div className="move-chips">
                  {moves.map((move) => (
                    <span className="move-chip" key={move.name}>
                      {move.displayName}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No moves are recorded.</p>
          )}
        </ExpandableSection>
        <ExpandableSection
          defaultOpen={false}
          title="Version details"
          eyebrow="Current canonical types and historical representations"
        >
          <p className="muted">
            {detail.historicalTypes.length
              ? "The index uses current canonical types. Older games may have represented this species differently."
              : "No historical type changes are recorded for this species."}
          </p>
          {!!detail.historicalTypes.length && (
            <div className="history-list">
              {detail.historicalTypes.map((history) => (
                <div key={history.generation}>
                  <p className="meta">{history.generation}</p>
                  <div className="species-types">
                    {history.types.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ExpandableSection>
        <footer className="detail-footer">
          Reference data from{" "}
          <a href="https://pokeapi.co" target="_blank" rel="noreferrer">
            PokéAPI
          </a>{" "}
          / official species artwork
        </footer>
      </div>
    </motion.article>
  );
}
