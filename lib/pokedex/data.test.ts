import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ValidatedPokemon, ValidatedSpecies } from "@/lib/pokeapi/schemas";

vi.mock("@/lib/pokeapi/client", () => ({
  getAbilityResourceByName: vi.fn(),
  getAllSpeciesResources: vi.fn(),
  getEvolutionResourceById: vi.fn(),
  getGenerationResourceById: vi.fn(),
  getPokemonResourceById: vi.fn(),
  getPokemonResourceByName: vi.fn(),
  getSpeciesResourceByName: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
import * as api from "@/lib/pokeapi/client";
import { getPokemonCatalog, getPokemonDetail } from "./data";

const resource = (name: string, kind: string, id: number) => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${id}/`,
});
const species: ValidatedSpecies = {
  id: 386,
  name: "deoxys",
  generation: resource("generation-iii", "generation", 3),
  evolution_chain: null,
  flavor_text_entries: [],
  form_descriptions: [],
  genera: [],
  is_legendary: false,
  is_mythical: true,
  varieties: [
    { is_default: true, pokemon: resource("deoxys-normal", "pokemon", 386) },
    { is_default: false, pokemon: resource("deoxys-attack", "pokemon", 10001) },
  ],
};
function pokemon(
  id: number,
  name: string,
  isDefault: boolean,
): ValidatedPokemon {
  return {
    id,
    name,
    is_default: isDefault,
    abilities: [],
    forms: [],
    moves: [],
    past_types: [],
    species: resource("deoxys", "pokemon-species", 386),
    sprites: {
      front_default: "https://example.test/sprite.png",
      front_shiny: null,
    },
    stats: [{ base_stat: 180, stat: resource("attack", "stat", 2) }],
    types: [{ slot: 1, type: resource("psychic", "type", 14) }],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.getSpeciesResourceByName).mockResolvedValue(species);
  vi.mocked(api.getPokemonResourceByName).mockImplementation(async (name) =>
    name === "deoxys-attack"
      ? pokemon(10001, name, false)
      : pokemon(386, name, true),
  );
});

describe("canonical species and varieties", () => {
  it("uses the English ability effect without inventing missing descriptions", async () => {
    const defaultPokemon = pokemon(386, "deoxys-normal", true);
    defaultPokemon.abilities = [
      { ability: resource("pressure", "ability", 46), is_hidden: false },
    ];
    vi.mocked(api.getPokemonResourceByName).mockResolvedValue(defaultPokemon);
    vi.mocked(api.getAbilityResourceByName).mockResolvedValue({
      effect_entries: [
        {
          short_effect: "Other language",
          language: resource("fr", "language", 5),
        },
        {
          short_effect: "Increases PP usage.",
          language: resource("en", "language", 9),
        },
      ],
    });
    expect(
      (await getPokemonDetail("deoxys", undefined)).abilities[0].description,
    ).toBe("Increases PP usage.");
    vi.mocked(api.getAbilityResourceByName).mockResolvedValue({
      effect_entries: [],
    });
    expect(
      (await getPokemonDetail("deoxys", undefined)).abilities[0].description,
    ).toBeNull();
  });
  it("loads the declared default variety when its name differs from the species", async () => {
    const detail = await getPokemonDetail("deoxys", undefined);
    expect(api.getPokemonResourceByName).toHaveBeenCalledWith("deoxys-normal");
    expect(detail).toMatchObject({
      id: 386,
      variantId: 386,
      speciesName: "deoxys",
      introductionGeneration: 3,
      formName: null,
      evolution: null,
    });
    expect(api.getEvolutionResourceById).not.toHaveBeenCalled();
  });
  it("keeps national identity while changing form data", async () => {
    const detail = await getPokemonDetail("deoxys", "deoxys-attack");
    expect(detail).toMatchObject({
      id: 386,
      variantId: 10001,
      displayName: "Deoxys",
      speciesName: "deoxys",
    });
    expect(detail.formName).toContain("Attack");
    expect(detail.shinyArtworkUrl).toBeNull();
  });
  it("rejects an unrelated Pokémon as a selected variant", async () => {
    await expect(getPokemonDetail("deoxys", "pikachu")).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(api.getPokemonResourceByName).not.toHaveBeenCalled();
  });
  it("uses canonical names in the catalog instead of default variety names", async () => {
    vi.mocked(api.getGenerationResourceById).mockResolvedValue({
      id: 3,
      name: "generation-iii",
      main_region: resource("hoenn", "region", 3),
      pokemon_species: [resource("deoxys", "pokemon-species", 386)],
    });
    vi.mocked(api.getPokemonResourceById).mockResolvedValue(
      pokemon(386, "deoxys-normal", true),
    );
    expect((await getPokemonCatalog(3)).pokemon[0]).toMatchObject({
      id: 386,
      name: "deoxys",
      displayName: "Deoxys",
    });
  });
});
