import type { Metadata } from "next";
import { formatDisplayName } from "@/lib/pokedex/format";
import {
  loadSpeciesPage,
  type SpeciesPageProps,
} from "@/lib/pokedex/page-data";
import { PokedexExplorer } from "@/components/pokedex/pokedex-explorer";
export async function generateMetadata({
  params,
}: SpeciesPageProps): Promise<Metadata> {
  const { species } = await params;
  return { title: formatDisplayName(species) };
}
export default async function PokemonPage(
  props: SpeciesPageProps,
): Promise<React.JSX.Element> {
  const data = await loadSpeciesPage(props);
  return (
    <PokedexExplorer
      key={data.scope}
      catalog={data.catalog}
      scope={data.scope}
      initialQuery={data.initialQuery}
      initialTypes={data.initialTypes}
    />
  );
}
