export type PokemonTypeName =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy"
  | "stellar"
  | (string & {});

export const POKEMON_TYPES: PokemonTypeName[] = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
  "stellar",
];

export type GenerationSummary = {
  id: number;
  label: string;
  region: string;
};

export type CatalogPokemon = {
  id: number;
  name: string;
  displayName: string;
  artworkUrl: string | null;
  shinyArtworkUrl: string | null;
  types: PokemonTypeName[];
};

export type PokemonCatalog = {
  generation: GenerationSummary;
  pokemon: CatalogPokemon[];
};

export type PokemonStatSummary = {
  name: string;
  label: string;
  value: number;
};

export type PokemonAbilitySummary = {
  name: string;
  displayName: string;
  isHidden: boolean;
};

export type PokemonMoveSummary = {
  name: string;
  displayName: string;
  methods: string[];
};

export type PokemonVariantSummary = {
  id: number;
  name: string;
  displayName: string;
  isDefault: boolean;
  artworkUrl: string | null;
  shinyArtworkUrl: string | null;
  types: PokemonTypeName[];
};

export type EvolutionChainNode = {
  id: number;
  name: string;
  displayName: string;
  artworkUrl: string | null;
  evolutionCondition: string | null;
  evolvesTo: EvolutionChainNode[];
};

export type PokemonDetail = {
  id: number;
  speciesName: string;
  displayName: string;
  formName: string | null;
  artworkUrl: string | null;
  shinyArtworkUrl: string | null;
  types: PokemonTypeName[];
  description: string | null;
  genus: string | null;
  stats: PokemonStatSummary[];
  abilities: PokemonAbilitySummary[];
  moves: PokemonMoveSummary[];
  historicalTypes: { generation: string; types: PokemonTypeName[] }[];
  variants: PokemonVariantSummary[];
  evolution: EvolutionChainNode | null;
  isLegendary: boolean;
  isMythical: boolean;
};

export type CatalogScope = number | "all";
