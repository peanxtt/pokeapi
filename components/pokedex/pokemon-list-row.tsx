"use client";
import Link, { useLinkStatus } from "next/link";
import { Check, LoaderCircle } from "lucide-react";
import { formatDexNumber } from "@/lib/pokedex/format";
import type { CatalogPokemon } from "@/lib/pokedex/types";
import { PokemonArtwork } from "@/components/pokedex/pokemon-artwork";
import { useMobile } from "@/components/pokedex/use-mobile";

function RowStatus({
  selected,
}: {
  selected: boolean;
}): React.JSX.Element | null {
  const { pending } = useLinkStatus();
  if (pending)
    return (
      <LoaderCircle
        className="row-pending"
        aria-label="Loading species"
        size={16}
      />
    );
  return selected ? <Check aria-hidden size={16} /> : null;
}
export function PokemonListRow({
  detailHref,
  pokemon,
  priority,
  selected = false,
}: {
  detailHref: string;
  pokemon: CatalogPokemon;
  priority: boolean;
  selected?: boolean;
}): React.JSX.Element {
  const mobile = useMobile();
  return (
    <Link
      className={`species-row ${selected ? "selected" : ""}`}
      href={detailHref}
      scroll={false}
      replace={!mobile}
      prefetch={false}
      aria-current={selected ? "page" : undefined}
      data-species={pokemon.name}
    >
      <div className="row-artwork">
        <PokemonArtwork
          alt={`${pokemon.displayName} artwork`}
          priority={priority}
          src={pokemon.artworkUrl}
          retryable={false}
        />
      </div>
      <div className="row-identity">
        <span className="species-number">{formatDexNumber(pokemon.id)}</span>
        <h3>{pokemon.displayName}</h3>
        <span className="row-types">
          {pokemon.types
            .map((type) => type[0].toUpperCase() + type.slice(1))
            .join(" / ")}
        </span>
      </div>
      <span className="row-status">
        <RowStatus selected={selected} />
      </span>
    </Link>
  );
}
