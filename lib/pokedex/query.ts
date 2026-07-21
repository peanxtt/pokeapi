import { POKEMON_TYPES, type PokemonTypeName } from "@/lib/pokedex/types";

export type QueryValue = string | string[] | undefined;

export function getQueryValue(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseTypeFilters(value: string | undefined): PokemonTypeName[] {
  if (!value || value.trim().length === 0) {
    return [];
  }

  const values = value.split(",").filter((type) => type.length > 0);
  const invalidType = values.find((type) => !POKEMON_TYPES.includes(type as PokemonTypeName));

  if (invalidType) {
    throw new Error(`Type filter "${invalidType}" is not supported.`);
  }

  return values.filter((type, index) => values.indexOf(type) === index) as PokemonTypeName[];
}

export function parseReturnPath(value: string | undefined): string {
  if (!value) {
    return "/?generation=1";
  }

  if (!value.startsWith("/")) {
    throw new Error("The detail page return path must be an internal path.");
  }

  return value;
}
