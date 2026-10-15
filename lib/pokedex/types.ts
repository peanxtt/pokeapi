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
  pixelSprites?: PixelSprites;
  id: number;
  name: string;
  displayName: string;
  artworkUrl: string | null;
  shinyArtworkUrl: string | null;
  types: PokemonTypeName[];
};

export const CATALOG_PAGE_SIZE = 40;

export type CatalogSpecies = Pick<
  CatalogPokemon,
  "id" | "name" | "displayName"
>;
export type CatalogOptions = {
  query?: string;
  types?: PokemonTypeName[];
  offset?: number;
};
export type CatalogIndex = {
  context: string;
  generation: GenerationSummary;
  species: CatalogSpecies[];
  totalSpecies: number;
};
export type PokemonCatalog = CatalogIndex & {
  pokemon: CatalogPokemon[];
  offset: number;
  nextOffset: number | null;
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
  description: string | null;
};

export type PokemonMoveSummary = {
  name: string;
  displayName: string;
  methods: string[];
};

export type PokemonVariantSummary = {
  pixelSprites?: PixelSprites;
  id: number;
  name: string;
  displayName: string;
  isDefault: boolean;
  artworkUrl: string | null;
  shinyArtworkUrl: string | null;
  types: PokemonTypeName[];
};

export type EvolutionChainNode = {
  pixelSprites?: PixelSprites;
  id: number;
  name: string;
  displayName: string;
  artworkUrl: string | null;
  evolutionCondition: string | null;
  evolvesTo: EvolutionChainNode[];
};

export type PokemonDetail = {
  pixelSprites?: PixelSprites;
  cryUrl?: string | null;
  id: number;
  variantId: number;
  introductionGeneration: number;
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

export type PixelSprites = {
  regular: string | null;
  regularShiny: string | null;
  blackWhite: string | null;
  blackWhiteShiny: string | null;
};
