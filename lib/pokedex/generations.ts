import type { CatalogScope, GenerationSummary } from "@/lib/pokedex/types";

export const GENERATIONS: GenerationSummary[] = [
  { id: 1, label: "Gen I", region: "Kanto" },
  { id: 2, label: "Gen II", region: "Johto" },
  { id: 3, label: "Gen III", region: "Hoenn" },
  { id: 4, label: "Gen IV", region: "Sinnoh" },
  { id: 5, label: "Gen V", region: "Unova" },
  { id: 6, label: "Gen VI", region: "Kalos" },
  { id: 7, label: "Gen VII", region: "Alola" },
  { id: 8, label: "Gen VIII", region: "Galar" },
  { id: 9, label: "Gen IX", region: "Paldea" },
];

export const ALL_GENERATIONS: GenerationSummary = {
  id: 0,
  label: "All",
  region: "Every generation",
};

export function getGenerationSummary(scope: CatalogScope): GenerationSummary {
  if (scope === "all") {
    return ALL_GENERATIONS;
  }

  const generation = GENERATIONS.find((candidate) => candidate.id === scope);

  if (!generation) {
    throw new Error(`Generation ${scope} is not supported by the Pokédex.`);
  }

  return generation;
}

export function parseCatalogScope(value: string | undefined): CatalogScope {
  if (!value || value === "1") {
    return 1;
  }

  if (value === "all") {
    return "all";
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    throw new Error(`Invalid generation scope "${value}".`);
  }

  return getGenerationSummary(numericValue).id;
}
