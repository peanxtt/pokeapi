import {
  getAbilityResourceByName,
  getAllSpeciesResources,
  getEvolutionResourceById,
  getGenerationResourceById,
  getPokemonResourceById,
  getSpeciesResourceByName,
  getTypeResourceByName,
} from "@/lib/pokeapi/client";
import type {
  ValidatedEvolutionChain,
  ValidatedPokemon,
  ValidatedSpecies,
} from "@/lib/pokeapi/schemas";
import { notFound } from "next/navigation";
import { getGenerationSummary } from "@/lib/pokedex/generations";
import { getBrowsePath, matchesQuery } from "@/lib/pokedex/query";
import { CATALOG_PAGE_SIZE } from "@/lib/pokedex/types";
import {
  formatDisplayName,
  formatStatLabel,
  getResourceId,
  getVariantDisplayName,
  normalizeFlavorText,
} from "@/lib/pokedex/format";
import type {
  CatalogPokemon,
  CatalogScope,
  CatalogOptions,
  CatalogIndex,
  EvolutionChainNode,
  PokemonCatalog,
  PokemonDetail,
  PokemonMoveSummary,
  PokemonTypeName,
  PokemonVariantSummary,
} from "@/lib/pokedex/types";

type Resource = {
  name: string;
  url: string;
};

type ChainLink = ValidatedEvolutionChain["chain"];

const CATALOG_BATCH_SIZE = 40;

function getPixelSprites(pokemon: ValidatedPokemon) {
  const legacy = pokemon.sprites.versions?.["generation-v"]?.["black-white"];
  return {
    regular: pokemon.sprites.front_default,
    regularShiny: pokemon.sprites.front_shiny,
    blackWhite: legacy?.front_default ?? null,
    blackWhiteShiny: legacy?.front_shiny ?? null,
  };
}

function getArtworkUrl(pokemon: ValidatedPokemon): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"].front_default ??
    pokemon.sprites.other?.home.front_default ??
    pokemon.sprites.front_default
  );
}

function getShinyArtworkUrl(pokemon: ValidatedPokemon): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"].front_shiny ??
    pokemon.sprites.other?.home.front_shiny ??
    pokemon.sprites.front_shiny
  );
}

function getTypeNames(pokemon: ValidatedPokemon): PokemonTypeName[] {
  return pokemon.types
    .slice()
    .sort((first, second) => first.slot - second.slot)
    .map((entry) => entry.type.name as PokemonTypeName);
}

function getCatalogPokemon(pokemon: ValidatedPokemon): CatalogPokemon {
  return {
    pixelSprites: getPixelSprites(pokemon),
    artworkUrl: getArtworkUrl(pokemon),
    displayName: formatDisplayName(pokemon.name),
    id: pokemon.id,
    name: pokemon.name,
    shinyArtworkUrl: getShinyArtworkUrl(pokemon),
    types: getTypeNames(pokemon),
  };
}

async function mapInBatches<T, R>(
  items: readonly T[],
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (let offset = 0; offset < items.length; offset += CATALOG_BATCH_SIZE) {
    const batch = items.slice(offset, offset + CATALOG_BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(mapper));
    results.push(...batchResults);
  }

  return results;
}

function sortResourcesById(resources: readonly Resource[]): Resource[] {
  return resources
    .slice()
    .sort(
      (first, second) => getResourceId(first.url) - getResourceId(second.url),
    );
}

export async function getCatalogIndex(
  scope: CatalogScope,
  { query = "", types = [] }: CatalogOptions = {},
): Promise<CatalogIndex> {
  const generation = getGenerationSummary(scope);
  const speciesResources =
    scope === "all"
      ? await getAllSpeciesResources()
      : (await getGenerationResourceById(scope)).pokemon_species;
  const orderedSpecies = sortResourcesById(speciesResources);
  let species = orderedSpecies
    .map((resource) => ({
      id: getResourceId(resource.url),
      name: resource.name,
      displayName: formatDisplayName(resource.name),
    }))
    .filter((species) => matchesQuery(species.name, species.id, query));
  if (types.length && species.length) {
    const memberships = await Promise.all(
      types.map((type) => getTypeResourceByName(type)),
    );
    const matchingIds = new Set(
      memberships.flatMap((type) =>
        type.pokemon.map((p) => getResourceId(p.pokemon.url)),
      ),
    );
    species = species.filter((species) => matchingIds.has(species.id));
  }
  return {
    context: getBrowsePath(scope, query, types),
    generation,
    species,
    totalSpecies: orderedSpecies.length,
  };
}

export async function getPokemonCatalog(
  scope: CatalogScope,
  options: CatalogOptions = {},
): Promise<PokemonCatalog> {
  const index = await getCatalogIndex(scope, options);
  const offset = options.offset ?? 0;
  const page = index.species.slice(offset, offset + CATALOG_PAGE_SIZE);
  const pokemon = await Promise.all(
    page.map(async (species) => {
      const pokemonResource = await getPokemonResourceById(species.id);
      return {
        ...getCatalogPokemon(pokemonResource),
        ...species,
      };
    }),
  );
  const end = offset + pokemon.length;
  return {
    ...index,
    pokemon,
    offset,
    nextOffset: end < index.species.length ? end : null,
  };
}

function getEnglishText<T extends { language: Resource }>(
  entries: readonly T[],
): T | null {
  return entries.find((entry) => entry.language.name === "en") ?? null;
}

function getVariantSummary(
  pokemon: ValidatedPokemon,
  speciesName: string,
): PokemonVariantSummary {
  return {
    artworkUrl: getArtworkUrl(pokemon),
    displayName: pokemon.is_default
      ? formatDisplayName(speciesName)
      : getVariantDisplayName(speciesName, pokemon.name),
    pixelSprites: getPixelSprites(pokemon),
    id: pokemon.id,
    isDefault: pokemon.is_default,
    name: pokemon.name,
    shinyArtworkUrl: getShinyArtworkUrl(pokemon),
    types: getTypeNames(pokemon),
  };
}

function getMoveSummary(pokemon: ValidatedPokemon): PokemonMoveSummary[] {
  return pokemon.moves.map((move) => ({
    displayName: formatDisplayName(move.move.name),
    methods: move.version_group_details
      .map((detail) => formatDisplayName(detail.move_learn_method.name))
      .filter((method, index, methods) => methods.indexOf(method) === index),
    name: move.move.name,
  }));
}

function getDescription(species: ValidatedSpecies): string | null {
  const entry = getEnglishText(species.flavor_text_entries);
  return entry ? normalizeFlavorText(entry.flavor_text) : null;
}

function getGenus(species: ValidatedSpecies): string | null {
  const entry = getEnglishText(species.genera);
  return entry?.genus ?? null;
}

function getEvolutionCondition(
  details: ChainLink["evolution_details"],
): string | null {
  const conditions = details.map((detail) => {
    const labels: string[] = [];

    if (detail.min_level !== null) {
      labels.push(`Level ${detail.min_level}`);
    }

    if (detail.item) {
      labels.push(`Use ${formatDisplayName(detail.item.name)}`);
    }

    if (detail.min_happiness !== null) {
      labels.push(`${detail.min_happiness} happiness`);
    }

    if (detail.min_affection !== null) {
      labels.push(`${detail.min_affection} affection`);
    }

    if (detail.time_of_day.length > 0) {
      labels.push(formatDisplayName(detail.time_of_day));
    }

    if (detail.location) {
      labels.push(`At ${formatDisplayName(detail.location.name)}`);
    }

    if (detail.known_move) {
      labels.push(`Know ${formatDisplayName(detail.known_move.name)}`);
    }

    if (detail.trade_species) {
      labels.push(`Trade for ${formatDisplayName(detail.trade_species.name)}`);
    }

    if (detail.needs_overworld_rain) {
      labels.push("Rain");
    }

    if (labels.length > 0) {
      return labels.join(" · ");
    }

    return formatDisplayName(detail.trigger.name);
  });

  return conditions.length > 0
    ? Array.from(new Set(conditions)).join(" / ")
    : null;
}

async function mapEvolutionNode(
  node: ChainLink,
  condition: string | null,
): Promise<EvolutionChainNode> {
  const pokemonId = getResourceId(node.species.url);
  const [pokemon, evolvesTo] = await Promise.all([
    getPokemonResourceById(pokemonId),
    Promise.all(
      node.evolves_to.map((child) =>
        mapEvolutionNode(child, getEvolutionCondition(child.evolution_details)),
      ),
    ),
  ]);

  return {
    artworkUrl: getArtworkUrl(pokemon),
    displayName: formatDisplayName(node.species.name),
    pixelSprites: getPixelSprites(pokemon),
    evolutionCondition: condition,
    evolvesTo,
    id: pokemonId,
    name: node.species.name,
  };
}

export async function getPokemonDetail(
  speciesName: string,
  variantName: string | undefined,
): Promise<PokemonDetail> {
  const species = await getSpeciesResourceByName(speciesName);
  const selectedVariantName =
    variantName ||
    species.varieties.find((variety) => variety.is_default)?.pokemon.name ||
    speciesName;
  const selectedVariety = species.varieties.find(
    (variety) => variety.pokemon.name === selectedVariantName,
  );
  if (!selectedVariety) notFound();
  const pokemon = await getPokemonResourceById(
    getResourceId(selectedVariety.pokemon.url),
  );
  const [variantResources, evolution, abilities] = await Promise.all([
    mapInBatches(species.varieties, async (variety) => {
      const variant =
        variety.pokemon.name === selectedVariantName
          ? pokemon
          : await getPokemonResourceById(getResourceId(variety.pokemon.url));
      return getVariantSummary(variant, species.name);
    }),
    species.evolution_chain
      ? getEvolutionResourceById(
          getResourceId(species.evolution_chain.url),
        ).then((resource) => mapEvolutionNode(resource.chain, null))
      : null,
    Promise.all(
      pokemon.abilities.map(async (ability) => {
        const resource = await getAbilityResourceByName(ability.ability.name);
        return {
          displayName: formatDisplayName(ability.ability.name),
          isHidden: ability.is_hidden,
          name: ability.ability.name,
          description:
            getEnglishText(resource.effect_entries)?.short_effect || null,
        };
      }),
    ),
  ]);

  return {
    abilities,
    pixelSprites: getPixelSprites(pokemon),
    cryUrl: pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null,
    artworkUrl: getArtworkUrl(pokemon),
    description: getDescription(species),
    displayName: formatDisplayName(species.name),
    evolution,
    formName: pokemon.is_default
      ? null
      : getVariantDisplayName(species.name, pokemon.name),
    genus: getGenus(species),
    historicalTypes: pokemon.past_types.map((pastType) => ({
      generation: formatDisplayName(pastType.generation.name),
      types: pastType.types
        .slice()
        .sort((first, second) => first.slot - second.slot)
        .map((entry) => entry.type.name as PokemonTypeName),
    })),
    id: species.id,
    variantId: pokemon.id,
    introductionGeneration: getResourceId(species.generation.url),
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    moves: getMoveSummary(pokemon),
    shinyArtworkUrl: getShinyArtworkUrl(pokemon),
    speciesName: species.name,
    stats: pokemon.stats.map((stat) => ({
      label: formatStatLabel(stat.stat.name),
      name: stat.stat.name,
      value: stat.base_stat,
    })),
    types: getTypeNames(pokemon),
    variants: variantResources,
  };
}
