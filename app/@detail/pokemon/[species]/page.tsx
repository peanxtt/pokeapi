import {
  loadSpeciesPage,
  type SpeciesPageProps,
} from "@/lib/pokedex/page-data";
import { PokemonDetailView } from "@/components/pokedex/pokemon-detail-view";

export default async function Page(
  props: SpeciesPageProps,
): Promise<React.JSX.Element> {
  const data = await loadSpeciesPage(props);
  return (
    <PokemonDetailView detail={data.detail} from={data.from} next={data.next} />
  );
}
