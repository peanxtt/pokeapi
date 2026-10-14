import { beforeEach, describe, expect, it, vi } from "vitest";
import { getGenerationSummary } from "./generations";
import type { PokemonDetail, CatalogPokemon } from "./types";
vi.mock("./data", () => ({
  getPokemonCatalog: vi.fn(),
  getPokemonDetail: vi.fn(),
}));
import { getPokemonCatalog, getPokemonDetail } from "./data";
import { loadSpeciesPage } from "./page-data";

const entry = (
  id: number,
  name: string,
  types: CatalogPokemon["types"],
): CatalogPokemon => ({
  id,
  name,
  displayName: name,
  types,
  artworkUrl: null,
  shinyArtworkUrl: null,
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPokemonDetail).mockResolvedValue({
    introductionGeneration: 3,
    speciesName: "deoxys",
  } as PokemonDetail);
  vi.mocked(getPokemonCatalog).mockImplementation(async (scope) => ({
    generation: getGenerationSummary(scope),
    pokemon: [
      entry(1, "bulbasaur", ["grass", "poison"]),
      entry(25, "pikachu", ["electric"]),
      entry(386, "deoxys", ["psychic"]),
    ],
  }));
});
describe("species route context", () => {
  it("chooses introduction generation for a direct link", async () => {
    const page = await loadSpeciesPage({
      params: Promise.resolve({ species: "deoxys" }),
      searchParams: Promise.resolve({}),
    });
    expect(page.scope).toBe(3);
    expect(page.from).toBe("/?generation=3");
    expect(getPokemonCatalog).toHaveBeenCalledWith(3);
  });
  it("honors explicit browse context and chooses Next only among filtered results", async () => {
    vi.mocked(getPokemonDetail).mockResolvedValue({
      introductionGeneration: 1,
      speciesName: "bulbasaur",
    } as PokemonDetail);
    const from = "/?generation=all&types=grass,psychic";
    const page = await loadSpeciesPage({
      params: Promise.resolve({ species: "bulbasaur" }),
      searchParams: Promise.resolve({ from }),
    });
    expect(page.scope).toBe("all");
    expect(page.initialTypes).toEqual(["grass", "psychic"]);
    expect(page.next?.label).toBe("deoxys");
    expect(
      new URL(page.next!.href, "https://example.test").searchParams.get("from"),
    ).toBe(from);
  });
});
