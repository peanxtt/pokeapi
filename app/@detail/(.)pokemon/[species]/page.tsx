import {
  loadSpeciesPage,
  type SpeciesPageProps,
} from "@/lib/pokedex/page-data";
import { PokemonDetailView } from "@/components/pokedex/pokemon-detail-view";
import { formatDisplayName } from "@/lib/pokedex/format";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: SpeciesPageProps): Promise<Metadata> {
  const { species } = await params;
  return { title: formatDisplayName(species) };
}
export default async function Page(
  props: SpeciesPageProps,
): Promise<React.JSX.Element> {
  const data = await loadSpeciesPage(props);
  return (
    <PokemonDetailView
      key={data.detail.speciesName}
      detail={data.detail}
      from={data.from}
      next={data.next}
    />
  );
}
