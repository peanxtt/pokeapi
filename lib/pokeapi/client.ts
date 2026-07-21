import "server-only";

import { unstable_cache } from "next/cache";
import { EvolutionChain, Generation, MainClient, Pokemon, PokemonSpecies } from "pokenode-ts";

import {
  evolutionChainSchema,
  generationSchema,
  pokemonListSchema,
  pokemonSchema,
  speciesSchema,
  type ValidatedEvolutionChain,
  type ValidatedGeneration,
  type ValidatedPokemon,
  type ValidatedPokemonList,
  type ValidatedSpecies,
} from "@/lib/pokeapi/schemas";

const CACHE_SECONDS = 86_400;
const PAGE_SIZE = 1_000;
const api = new MainClient();

class PokeApiRequestError extends Error {
  public constructor(operation: string, message: string, cause: Error) {
    super(`PokéAPI ${operation} failed: ${message}`, { cause });
    this.name = "PokeApiRequestError";
  }
}

function getError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function withRetries<T>(operation: string, request: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const normalizedError = getError(error);
      lastError = normalizedError;

      if (attempt < 3) {
        console.warn("pokedex_api_retry", {
          attempt,
          message: normalizedError.message,
          operation,
        });
        await wait(attempt * 250);
      }
    }
  }

  if (!lastError) {
    throw new Error(`PokéAPI ${operation} failed without an error.`);
  }

  throw new PokeApiRequestError(operation, lastError.message, lastError);
}

const getGenerationResource = unstable_cache(
  async (id: number): Promise<ValidatedGeneration> => {
    const response: Generation = await withRetries(`generation ${id}`, () => api.game.getGenerationById(id));
    return generationSchema.parse(response);
  },
  ["pokedex-generation"],
  { revalidate: CACHE_SECONDS },
);

const getPokemonResource = unstable_cache(
  async (id: number): Promise<ValidatedPokemon> => {
    const response: Pokemon = await withRetries(`pokemon ${id}`, () => api.pokemon.getPokemonById(id));
    return pokemonSchema.parse(response);
  },
  ["pokedex-pokemon"],
  { revalidate: CACHE_SECONDS },
);

const getPokemonByNameResource = unstable_cache(
  async (name: string): Promise<ValidatedPokemon> => {
    const response: Pokemon = await withRetries(`pokemon ${name}`, () => api.pokemon.getPokemonByName(name));
    return pokemonSchema.parse(response);
  },
  ["pokedex-pokemon-by-name"],
  { revalidate: CACHE_SECONDS },
);

const getSpeciesResource = unstable_cache(
  async (name: string): Promise<ValidatedSpecies> => {
    const response: PokemonSpecies = await withRetries(`species ${name}`, () => api.pokemon.getPokemonSpeciesByName(name));
    return speciesSchema.parse(response);
  },
  ["pokedex-species"],
  { revalidate: CACHE_SECONDS },
);

const getEvolutionResource = unstable_cache(
  async (id: number): Promise<ValidatedEvolutionChain> => {
    const response: EvolutionChain = await withRetries(`evolution chain ${id}`, () => api.evolution.getEvolutionChainById(id));
    return evolutionChainSchema.parse(response);
  },
  ["pokedex-evolution-chain"],
  { revalidate: CACHE_SECONDS },
);

const getSpeciesPageResource = unstable_cache(
  async (offset: number): Promise<ValidatedPokemonList> => {
    const response = await withRetries(`species list at offset ${offset}`, () => api.pokemon.listPokemonSpecies(offset, PAGE_SIZE));
    return pokemonListSchema.parse(response);
  },
  ["pokedex-species-list"],
  { revalidate: CACHE_SECONDS },
);

export async function getGenerationResourceById(id: number): Promise<ValidatedGeneration> {
  return getGenerationResource(id);
}

export async function getPokemonResourceById(id: number): Promise<ValidatedPokemon> {
  return getPokemonResource(id);
}

export async function getPokemonResourceByName(name: string): Promise<ValidatedPokemon> {
  return getPokemonByNameResource(name);
}

export async function getSpeciesResourceByName(name: string): Promise<ValidatedSpecies> {
  return getSpeciesResource(name);
}

export async function getEvolutionResourceById(id: number): Promise<ValidatedEvolutionChain> {
  return getEvolutionResource(id);
}

export async function getAllSpeciesResources(): Promise<ValidatedPokemonList["results"]> {
  const firstPage = await getSpeciesPageResource(0);
  const resources = [...firstPage.results];

  for (let offset = PAGE_SIZE; offset < firstPage.count; offset += PAGE_SIZE) {
    const page = await getSpeciesPageResource(offset);
    resources.push(...page.results);
  }

  return resources;
}
