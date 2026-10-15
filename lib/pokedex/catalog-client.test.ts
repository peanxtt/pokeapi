import { afterEach, expect, it, vi } from "vitest";
import { appendCatalogPage, fetchCatalogPage } from "./catalog-client";
import type { PokemonCatalog } from "./types";
const first: PokemonCatalog = {
  context: "/?generation=all",
  generation: { id: 0, label: "All", region: "National" },
  totalSpecies: 120,
  species: [],
  pokemon: [],
  offset: 0,
  nextOffset: 40,
};
afterEach(() => vi.unstubAllGlobals());
it("rejects duplicate pages and responses for an old query", () => {
  const second = { ...first, offset: 40, nextOffset: 80 };
  const merged = appendCatalogPage(first, second);
  expect(merged.nextOffset).toBe(80);
  expect(appendCatalogPage(merged, second)).toBe(merged);
  expect(
    appendCatalogPage(first, {
      ...second,
      context: "/?generation=all&q=pikachu",
    }),
  ).toBe(first);
});
it("passes cancellation through and surfaces a retryable page error", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("", { status: 503 }));
  vi.stubGlobal("fetch", fetch);
  const controller = new AbortController();
  await expect(
    fetchCatalogPage("/?generation=all&q=pikachu", 40, controller.signal),
  ).rejects.toThrow("Couldn’t load species");
  expect(fetch).toHaveBeenCalledWith(
    "/api/pokedex?generation=all&q=pikachu&offset=40",
    { signal: controller.signal },
  );
});
