import type { PokemonCatalog } from "./types";

export function catalogApiPath(context: string, offset = 0): string {
  return `/api/pokedex${context.slice(1)}&offset=${offset}`;
}
export async function fetchCatalogPage(
  context: string,
  offset: number,
  signal: AbortSignal,
): Promise<PokemonCatalog> {
  const response = await fetch(catalogApiPath(context, offset), {
    signal,
  });
  if (!response.ok) throw new Error("Couldn’t load species. Please try again.");
  return response.json();
}
export function appendCatalogPage(
  current: PokemonCatalog,
  incoming: PokemonCatalog,
): PokemonCatalog {
  if (
    incoming.context !== current.context ||
    incoming.offset !== current.nextOffset
  )
    return current;
  return {
    ...current,
    pokemon: [...current.pokemon, ...incoming.pokemon],
    nextOffset: incoming.nextOffset,
  };
}
