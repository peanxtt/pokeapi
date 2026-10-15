import { beforeEach, describe, expect, it, vi } from "vitest";
import { getGenerationSummary } from "./generations";
import { getBrowsePath, matchesQuery } from "./query";
import type { PokemonDetail, CatalogPokemon } from "./types";
vi.mock("./data", () => ({
  getCatalogIndex: vi.fn(),
  getPokemonCatalog: vi.fn(),
  getPokemonDetail: vi.fn(),
}));
import { getCatalogIndex, getPokemonCatalog, getPokemonDetail } from "./data";
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
  vi.mocked(getPokemonCatalog).mockImplementation(
    async (scope, options = {}) => {
      const all = [
        entry(1, "bulbasaur", ["grass", "poison"]),
        entry(25, "pikachu", ["electric"]),
        entry(386, "deoxys", ["psychic"]),
      ];
      const filtered = all.filter(
        (p) =>
          matchesQuery(p.name, p.id, options.query || "") &&
          (!options.types?.length ||
            options.types.some((t) => p.types.includes(t))),
      );
      return {
        context: getBrowsePath(scope, options.query, options.types),
        generation: getGenerationSummary(scope),
        pokemon: filtered.slice(0, 1),
        species: filtered.map(({ id, name, displayName }) => ({
          id,
          name,
          displayName,
        })),
        totalSpecies: all.length,
        offset: 0,
        nextOffset: filtered.length > 1 ? 1 : null,
      };
    },
  );
  vi.mocked(getCatalogIndex).mockImplementation(
    vi.mocked(getPokemonCatalog).getMockImplementation()!,
  );
});
describe("species route context", () => {
  it("does not fetch catalog Pokémon resources while opening the detail slot", async () => {
    await loadSpeciesPage({
      params: Promise.resolve({ species: "deoxys" }),
      searchParams: Promise.resolve({ from: "/?generation=all" }),
    });
    expect(getPokemonCatalog).not.toHaveBeenCalled();
    expect(getCatalogIndex).toHaveBeenCalled();
  });
  it("chooses introduction generation for a direct link", async () => {
    const page = await loadSpeciesPage({
      params: Promise.resolve({ species: "deoxys" }),
      searchParams: Promise.resolve({}),
    });
    expect(page.scope).toBe(3);
    expect(page.from).toBe("/?generation=3");
    expect(getCatalogIndex).toHaveBeenCalledWith(3, { query: "", types: [] });
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
