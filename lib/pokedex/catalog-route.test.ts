import { beforeEach, expect, it, vi } from "vitest";
vi.mock("./data", () => ({
  getPokemonCatalog: vi.fn(),
  getCatalogIndex: vi.fn(),
}));
import { getCatalogIndex, getPokemonCatalog } from "./data";
import { GET } from "@/app/api/pokedex/route";
beforeEach(() => vi.resetAllMocks());
it("rejects malformed requests before accessing upstream data", async () => {
  for (const query of [
    "generation=99",
    "generation=all&offset=-1",
    "generation=all&offset=100001",
    "types=unknown",
    "q=" + "a".repeat(101),
  ]) {
    expect(
      (await GET(new Request("http://localhost/api/pokedex?" + query))).status,
    ).toBe(400);
  }
  expect(getPokemonCatalog).not.toHaveBeenCalled();
});
it("uses the lightweight index for counts and hides upstream errors", async () => {
  vi.mocked(getCatalogIndex).mockResolvedValue({
    context: "/?generation=1",
    generation: { id: 1, label: "Gen I", region: "Kanto" },
    species: [{ id: 1, name: "bulbasaur", displayName: "Bulbasaur" }],
    totalSpecies: 151,
  });
  expect(
    await (
      await GET(new Request("http://localhost/api/pokedex?count=1"))
    ).json(),
  ).toEqual({ count: 1 });
  expect(getPokemonCatalog).not.toHaveBeenCalled();
  vi.mocked(getPokemonCatalog).mockRejectedValue(
    new Error("private upstream diagnostics"),
  );
  const response = await GET(new Request("http://localhost/api/pokedex"));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private upstream");
});
