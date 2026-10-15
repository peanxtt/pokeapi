import { getCatalogIndex, getPokemonDetail } from "@/lib/pokedex/data";
import { cache } from "react";
import { parseCatalogScope } from "@/lib/pokedex/generations";
import {
  getBrowsePath,
  getDetailHref,
  getQueryValue,
  parseReturnPath,
  parseTypeFilters,
  type QueryValue,
} from "@/lib/pokedex/query";

export type SpeciesPageProps = {
  params: Promise<{ species: string }>;
  searchParams: Promise<Record<string, QueryValue>>;
};
export async function loadSpeciesPage({
  params,
  searchParams,
}: SpeciesPageProps) {
  const [{ species }, query] = await Promise.all([params, searchParams]);
  return loadSpeciesContext(
    species,
    getQueryValue(query.variant),
    getQueryValue(query.from),
  );
}

// Both route slots share this work during a server render.
const loadSpeciesContext = cache(
  async (
    species: string,
    variant: string | undefined,
    returnPath: string | undefined,
  ) => {
    const detail = await getPokemonDetail(species, variant);
    const from = returnPath
      ? parseReturnPath(returnPath)
      : getBrowsePath(detail.introductionGeneration);
    const browse = new URL(from, "https://pokedex.invalid").searchParams;
    const scope = parseCatalogScope(browse.get("generation") || undefined);
    const initialQuery = browse.get("q") || "";
    const initialTypes = parseTypeFilters(browse.get("types") || undefined);
    const index = await getCatalogIndex(scope, {
      query: initialQuery,
      types: initialTypes,
    });
    const visible = index.species;
    const selected = visible.findIndex((p) => p.name === detail.speciesName);
    const next = selected >= 0 ? visible[selected + 1] : undefined;
    return {
      detail,
      from,
      scope,
      initialQuery,
      initialTypes,
      next: next
        ? { label: next.displayName, href: getDetailHref(next.name, from) }
        : undefined,
    };
  },
);
