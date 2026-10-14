import {
  POKEMON_TYPES,
  type PokemonTypeName,
  type CatalogScope,
} from "@/lib/pokedex/types";

export type QueryValue = string | string[] | undefined;

export function getQueryValue(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseTypeFilters(value: string | undefined): PokemonTypeName[] {
  if (!value || value.trim().length === 0) {
    return [];
  }

  const values = value.split(",").filter((type) => type.length > 0);
  const invalidType = values.find(
    (type) => !POKEMON_TYPES.includes(type as PokemonTypeName),
  );

  if (invalidType) {
    throw new Error(`Type filter "${invalidType}" is not supported.`);
  }

  return values.filter(
    (type, index) => values.indexOf(type) === index,
  ) as PokemonTypeName[];
}

export function parseReturnPath(value: string | undefined): string {
  if (!value) {
    return "/?generation=1";
  }

  if (!value.startsWith("/?") && value !== "/") {
    throw new Error("The return path must point to the Pokédex index.");
  }

  return value;
}

export function getBrowsePath(
  scope: CatalogScope,
  query = "",
  types: PokemonTypeName[] = [],
): string {
  const params = new URLSearchParams({ generation: String(scope) });
  if (query.trim()) params.set("q", query.trim());
  if (types.length) params.set("types", types.join(","));
  return `/?${params}`;
}

export function getDetailHref(
  name: string,
  from: string,
  variant?: string,
): string {
  const params = new URLSearchParams({ from });
  if (variant) params.set("variant", variant);
  return `/pokemon/${name}?${params}`;
}

export function matchesQuery(name: string, id: number, query: string): boolean {
  const value = query.trim().toLowerCase().replace(/^#/, "");
  if (!value) return true;
  return /^\d+$/.test(value) ? Number(value) === id : name.includes(value);
}
