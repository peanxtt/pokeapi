import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ValidatedPokemon, ValidatedSpecies } from "@/lib/pokeapi/schemas";
import { pokemonSchema } from "@/lib/pokeapi/schemas";

vi.mock("@/lib/pokeapi/client", () => ({
  getAbilityResourceByName: vi.fn(),
  getAllSpeciesResources: vi.fn(),
  getEvolutionResourceById: vi.fn(),
  getGenerationResourceById: vi.fn(),
  getPokemonResourceById: vi.fn(),
  getPokemonResourceByName: vi.fn(),
  getSpeciesResourceByName: vi.fn(),
  getTypeResourceByName: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
import * as api from "@/lib/pokeapi/client";
import { getCatalogIndex, getPokemonCatalog, getPokemonDetail } from "./data";

const resource = (name: string, kind: string, id: number) => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${id}/`,
});

describe("incremental catalog fetching", () => {
  function setupCatalog() {
    const resources = Array.from({ length: 120 }, (_, i) =>
      resource(`species-${i + 1}`, "pokemon-species", i + 1),
    );
    vi.mocked(api.getAllSpeciesResources).mockResolvedValue(
      resources.reverse(),
    );
    vi.mocked(api.getPokemonResourceById).mockImplementation(async (id) =>
      pokemon(id, `species-${id}`, true),
    );
  }
  it("fetches only the first 40 Pokémon resources for All generations", async () => {
    setupCatalog();
    const catalog = await getPokemonCatalog("all");
    expect(api.getPokemonResourceById).toHaveBeenCalledTimes(40);
    expect(catalog.pokemon.map((p) => p.id)).toEqual(
      Array.from({ length: 40 }, (_, i) => i + 1),
    );
    expect(catalog.species).toHaveLength(120);
    expect(catalog.nextOffset).toBe(40);
  });
  it("searches the full scope before fetching resources", async () => {
    setupCatalog();
    const catalog = await getPokemonCatalog("all", { query: "#0120" });
    expect(catalog.pokemon.map((p) => p.id)).toEqual([120]);
    expect(api.getPokemonResourceById).toHaveBeenCalledTimes(1);
    expect(catalog.nextOffset).toBeNull();
  });
  it("fetches the next batch in national order without re-fetching the first", async () => {
    setupCatalog();
    const catalog = await getPokemonCatalog("all", { offset: 40 });
    expect(catalog.pokemon.map((p) => p.id)).toEqual(
      Array.from({ length: 40 }, (_, i) => i + 41),
    );
    expect(api.getPokemonResourceById).not.toHaveBeenCalledWith(1);
    expect(catalog.nextOffset).toBe(80);
  });
  it("applies OR types across the entire scope and excludes variant resources", async () => {
    setupCatalog();
    vi.mocked(api.getTypeResourceByName).mockImplementation(async (type) => ({
      pokemon: (type === "grass" ? [3, 80, 10004] : [80, 115]).map((id) => ({
        pokemon: resource(`species-${id}`, "pokemon", id),
      })),
    }));
    const catalog = await getPokemonCatalog("all", {
      types: ["grass", "fire"],
    });
    expect(catalog.pokemon.map((p) => p.id)).toEqual([3, 80, 115]);
    expect(catalog.totalSpecies).toBe(120);
    expect(catalog.species).toHaveLength(3);
    expect(api.getPokemonResourceById).toHaveBeenCalledTimes(3);
  });
  it("counts matching species without fetching Pokémon resources", async () => {
    setupCatalog();
    const index = await getCatalogIndex("all", { query: "#0120" });
    expect(index.species.map((p) => p.id)).toEqual([120]);
    expect(api.getPokemonResourceById).not.toHaveBeenCalled();
  });
  it("returns the final partial page and an empty past-end page", async () => {
    setupCatalog();
    vi.mocked(api.getAllSpeciesResources).mockResolvedValue(
      Array.from({ length: 85 }, (_, i) =>
        resource(`species-${i + 1}`, "pokemon-species", i + 1),
      ),
    );
    const last = await getPokemonCatalog("all", { offset: 80 });
    expect(last.pokemon.map((p) => p.id)).toEqual([81, 82, 83, 84, 85]);
    expect(last.nextOffset).toBeNull();
    const empty = await getPokemonCatalog("all", { offset: 120 });
    expect(empty.pokemon).toEqual([]);
    expect(empty.nextOffset).toBeNull();
  });
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
  vi.mocked(api.getPokemonResourceById).mockImplementation(async (id) =>
    id === 10001
      ? pokemon(10001, "deoxys-attack", false)
      : pokemon(386, "deoxys-normal", true),
  );
});

describe("canonical species and varieties", () => {
  it("validates and maps cries and versioned sprites through the server adapter", async () => {
    const base = pokemon(386, "deoxys-normal", true);
    const selected = pokemonSchema.parse({
      ...base,
      cries: {
        latest: "https://example.test/latest.ogg",
        legacy: "https://example.test/legacy.ogg",
      },
      sprites: {
        ...base.sprites,
        versions: {
          "generation-v": {
            "black-white": {
              front_default: "https://example.test/bw.png",
              front_shiny: null,
            },
          },
        },
      },
    });
    vi.mocked(api.getPokemonResourceById).mockImplementation(async (id) =>
      id === 386 ? selected : pokemon(10001, "deoxys-attack", false),
    );
    const detail = await getPokemonDetail("deoxys", undefined);
    expect(detail.cryUrl).toBe("https://example.test/latest.ogg");
    expect(detail.pixelSprites).toEqual({
      regular: base.sprites.front_default,
      regularShiny: null,
      blackWhite: "https://example.test/bw.png",
      blackWhiteShiny: null,
    });
    expect(detail.variants[0].pixelSprites).toEqual(detail.pixelSprites);
    selected.cries = {
      latest: null,
      legacy: "https://example.test/legacy.ogg",
    };
    expect((await getPokemonDetail("deoxys", undefined)).cryUrl).toBe(
      "https://example.test/legacy.ogg",
    );
    selected.cries = null;
    expect((await getPokemonDetail("deoxys", undefined)).cryUrl).toBeNull();
  });
  it("starts abilities while another form is still loading and reuses the selected resource", async () => {
    const selected = pokemon(386, "deoxys-normal", true);
    selected.abilities = [
      { ability: resource("pressure", "ability", 46), is_hidden: false },
    ];
    let release!: (value: ValidatedPokemon) => void;
    const otherForm = new Promise<ValidatedPokemon>((resolve) => {
      release = resolve;
    });
    vi.mocked(api.getPokemonResourceById).mockImplementation(async (id) =>
      id === 10001 ? otherForm : selected,
    );
    vi.mocked(api.getAbilityResourceByName).mockResolvedValue({
      effect_entries: [],
    });
    const request = getPokemonDetail("deoxys", undefined);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const abilitiesStarted = vi.mocked(api.getAbilityResourceByName).mock.calls
      .length;
    release(pokemon(10001, "deoxys-attack", false));
    await request;
    expect(abilitiesStarted).toBe(1);
    expect(
      vi
        .mocked(api.getPokemonResourceById)
        .mock.calls.filter(([id]) => id === 386),
    ).toHaveLength(1);
  });
  it("uses the English ability effect without inventing missing descriptions", async () => {
    const defaultPokemon = pokemon(386, "deoxys-normal", true);
    defaultPokemon.abilities = [
      { ability: resource("pressure", "ability", 46), is_hidden: false },
    ];
    vi.mocked(api.getPokemonResourceById).mockResolvedValue(defaultPokemon);
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
    expect(api.getPokemonResourceById).toHaveBeenCalledWith(386);
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
    expect(api.getPokemonResourceById).not.toHaveBeenCalled();
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
