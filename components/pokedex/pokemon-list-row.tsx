import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { formatDexNumber } from "@/lib/pokedex/format";
import type { CatalogPokemon } from "@/lib/pokedex/types";

import { PokemonArtwork } from "@/components/pokedex/pokemon-artwork";
import { TypeBadge } from "@/components/pokedex/type-badge";

type PokemonListRowProps = {
  detailHref: string;
  pokemon: CatalogPokemon;
  priority: boolean;
};

export function PokemonListRow({ detailHref, pokemon, priority }: PokemonListRowProps): React.JSX.Element {
  return (
    <div>
      <Link
        className="group grid min-h-[104px] grid-cols-[88px_minmax(0,1fr)_24px] items-center gap-4 border-b hairline py-3 transition-colors duration-200 hover:bg-surface-muted/40"
        href={detailHref}
      >
        <div className="artwork-stage relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl">
          <PokemonArtwork alt={`${pokemon.displayName} artwork`} priority={priority} src={pokemon.artworkUrl} />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[11px] tracking-[0.08em] text-subtle">{formatDexNumber(pokemon.id)}</span>
            <h2 className="truncate text-[17px] font-semibold tracking-[-0.035em] text-foreground">{pokemon.displayName}</h2>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}
          </div>
        </div>
        <ArrowUpRight aria-hidden className="text-subtle transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" size={17} strokeWidth={1.7} />
      </Link>
    </div>
  );
}
