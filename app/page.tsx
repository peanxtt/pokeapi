import { PokedexExplorer } from "@/components/pokedex/pokedex-explorer";
import { getPokemonCatalog } from "@/lib/pokedex/data";
import { parseCatalogScope } from "@/lib/pokedex/generations";
import {
  getQueryValue,
  parseTypeFilters,
  type QueryValue,
} from "@/lib/pokedex/query";

type HomePageProps = {
  searchParams: Promise<Record<string, QueryValue>>;
};

export default async function Home({
  searchParams,
}: HomePageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const scope = parseCatalogScope(getQueryValue(query.generation));
  const catalog = await getPokemonCatalog(scope);

  return (
    <PokedexExplorer
      key={scope}
      catalog={catalog}
      initialQuery={getQueryValue(query.q) ?? ""}
      initialTypes={parseTypeFilters(getQueryValue(query.types))}
      scope={scope}
    />
  );
}
