import type { Metadata } from "next";

import { PokemonDetailView } from "@/components/pokedex/pokemon-detail-view";
import { getPokemonDetail } from "@/lib/pokedex/data";
import { getQueryValue, parseReturnPath, type QueryValue } from "@/lib/pokedex/query";

type PokemonPageProps = {
  params: Promise<{ species: string }>;
  searchParams: Promise<Record<string, QueryValue>>;
};

export async function generateMetadata({ params }: PokemonPageProps): Promise<Metadata> {
  const { species } = await params;
  return {
    title: `${species.replaceAll("-", " ")} / Index`,
  };
}

export default async function PokemonPage({ params, searchParams }: PokemonPageProps): Promise<React.JSX.Element> {
  const { species } = await params;
  const query = await searchParams;
  const detail = await getPokemonDetail(species, getQueryValue(query.variant));
  const from = parseReturnPath(getQueryValue(query.from));

  return <PokemonDetailView detail={detail} from={from} />;
}
