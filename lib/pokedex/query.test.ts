import { describe, expect, it } from "vitest";
import {
  getBrowsePath,
  getDetailHref,
  matchesQuery,
  parseReturnPath,
  parseTypeFilters,
} from "./query";

describe("browse context", () => {
  it("round trips scope, search and OR type filters through a species URL", () => {
    const from = getBrowsePath("all", "mr mime", ["psychic", "fairy"]);
    const href = new URL(
      getDetailHref("mr-mime", from, "mr-mime-galar"),
      "https://example.test",
    );
    expect(href.pathname).toBe("/pokemon/mr-mime");
    expect(href.searchParams.get("from")).toBe(from);
    expect(href.searchParams.get("variant")).toBe("mr-mime-galar");
    const browse = new URL(
      parseReturnPath(href.searchParams.get("from")!),
      href.origin,
    );
    expect(browse.searchParams.get("generation")).toBe("all");
    expect(browse.searchParams.get("q")).toBe("mr mime");
    expect(parseTypeFilters(browse.searchParams.get("types")!)).toEqual([
      "psychic",
      "fairy",
    ]);
  });

  it("accepts only index return paths", () => {
    expect(parseReturnPath(undefined)).toBe("/?generation=1");
    expect(parseReturnPath("/")).toBe("/");
    for (const path of [
      "//example.test",
      "https://example.test",
      "/pokemon/pikachu",
      "/\\example.test",
    ]) {
      expect(() => parseReturnPath(path)).toThrow();
    }
  });

  it("deduplicates types and rejects unknown filters", () => {
    expect(parseTypeFilters("grass,poison,grass")).toEqual(["grass", "poison"]);
    expect(() => parseTypeFilters("unknown")).toThrow();
  });
});

describe("scoped names and national numbers", () => {
  it("matches exact national numbers including zero padding and a # prefix", () => {
    expect(matchesQuery("pikachu", 25, "#0025")).toBe(true);
    expect(matchesQuery("raichu", 26, "25")).toBe(false);
    expect(matchesQuery("bulbasaur", 1, "0001")).toBe(true);
  });
  it("matches case-insensitive name fragments and an empty query", () => {
    expect(matchesQuery("bulbasaur", 1, " BULBA ")).toBe(true);
    expect(matchesQuery("pikachu", 25, "bulba")).toBe(false);
    expect(matchesQuery("pikachu", 25, "")).toBe(true);
  });
});
