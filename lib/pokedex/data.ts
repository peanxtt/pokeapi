import {
  getAllSpeciesResources,
  getEvolutionResourceById,
  getGenerationResourceById,
  getPokemonResourceById,
  getPokemonResourceByName,
  getSpeciesResourceByName,
} from "@/lib/pokeapi/client";
import type { ValidatedEvolutionChain, ValidatedPokemon, ValidatedSpecies } from "@/lib/pokeapi/schemas";
import { getGenerationSummary } from "@/lib/pokedex/generations";
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

function getArtworkUrl(pokemon: ValidatedPokemon): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"].front_default ??
    pokemon.sprites.other?.home.front_default ??
    pokemon.sprites.front_default
  );
}

function getShinyArtworkUrl(pokemon: ValidatedPokemon): string | null {
  return pokemon.sprites.other?.home.front_shiny ?? pokemon.sprites.front_shiny;
}

function getTypeNames(pokemon: ValidatedPokemon): PokemonTypeName[] {
  return pokemon.types
    .slice()
    .sort((first, second) => first.slot - second.slot)
    .map((entry) => entry.type.name as PokemonTypeName);
}

function getCatalogPokemon(pokemon: ValidatedPokemon): CatalogPokemon {
  return {
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
    .sort((first, second) => getResourceId(first.url) - getResourceId(second.url));
}

export async function getPokemonCatalog(scope: CatalogScope): Promise<PokemonCatalog> {
  const generation = getGenerationSummary(scope);
  const speciesResources =
    scope === "all"
      ? await getAllSpeciesResources()
      : (await getGenerationResourceById(scope)).pokemon_species;
  const orderedSpecies = sortResourcesById(speciesResources);
  const pokemon = await mapInBatches(orderedSpecies, async (resource) => {
    const resourceId = getResourceId(resource.url);
    const pokemonResource = await getPokemonResourceById(resourceId);
    return getCatalogPokemon(pokemonResource);
  });

  return {
    generation,
    pokemon: pokemon.sort((first, second) => first.id - second.id),
  };
}

function getEnglishText<T extends { language: Resource }>(
  entries: readonly T[],
): T | null {
  return entries.find((entry) => entry.language.name === "en") ?? entries[0] ?? null;
}

function getVariantSummary(pokemon: ValidatedPokemon, speciesName: string): PokemonVariantSummary {
  return {
    artworkUrl: getArtworkUrl(pokemon),
    displayName: pokemon.is_default
      ? formatDisplayName(speciesName)
      : getVariantDisplayName(speciesName, pokemon.name),
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

function getEvolutionCondition(details: ChainLink["evolution_details"]): string | null {
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

  return conditions.length > 0 ? conditions.join(" / ") : null;
}

async function mapEvolutionNode(node: ChainLink, condition: string | null): Promise<EvolutionChainNode> {
  const pokemonId = getResourceId(node.species.url);
  const pokemon = await getPokemonResourceById(pokemonId);
  const evolvesTo = await Promise.all(
    node.evolves_to.map((child) => mapEvolutionNode(child, getEvolutionCondition(child.evolution_details))),
  );

  return {
    artworkUrl: getArtworkUrl(pokemon),
    displayName: formatDisplayName(node.species.name),
    evolutionCondition: condition,
    evolvesTo,
    id: pokemonId,
    name: node.species.name,
  };
}

export async function getPokemonDetail(speciesName: string, variantName: string | undefined): Promise<PokemonDetail> {
  const species = await getSpeciesResourceByName(speciesName);
  const selectedVariantName = variantName && variantName.length > 0 ? variantName : speciesName;
  const pokemon = await getPokemonResourceByName(selectedVariantName);
  const variantResources = await mapInBatches(species.varieties, async (variety) => {
    const variant = await getPokemonResourceByName(variety.pokemon.name);
    return getVariantSummary(variant, species.name);
  });
  const evolutionChainId = getResourceId(species.evolution_chain.url);
  const evolutionChain = await getEvolutionResourceById(evolutionChainId);
  const evolution = await mapEvolutionNode(evolutionChain.chain, null);

  return {
    abilities: pokemon.abilities.map((ability) => ({
      displayName: formatDisplayName(ability.ability.name),
      isHidden: ability.is_hidden,
      name: ability.ability.name,
    })),
    artworkUrl: getArtworkUrl(pokemon),
    description: getDescription(species),
    displayName: formatDisplayName(species.name),
    evolution,
    formName: pokemon.is_default ? null : getVariantDisplayName(species.name, pokemon.name),
    genus: getGenus(species),
    historicalTypes: pokemon.past_types.map((pastType) => ({
      generation: formatDisplayName(pastType.generation.name),
      types: pastType.types
        .slice()
        .sort((first, second) => first.slot - second.slot)
        .map((entry) => entry.type.name as PokemonTypeName),
    })),
    id: pokemon.id,
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
