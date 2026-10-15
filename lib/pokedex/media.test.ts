import { describe, expect, it } from "vitest";
import { artworkCandidates } from "./media";
import { TYPE_PALETTE } from "./type-palette";
import { POKEMON_TYPES } from "./types";
const sprites = {
  blackWhite: "bw.png",
  blackWhiteShiny: "bw-shiny.png",
  regular: "regular.png",
  regularShiny: "regular-shiny.png",
};
describe("image style fallbacks", () => {
  it("prefers Black/White, then the regular sprite, then artwork", () => {
    expect(
      artworkCandidates("pixels", "art.png", sprites).map((c) => c.src),
    ).toEqual(["bw.png", "regular.png", "art.png"]);
    expect(
      artworkCandidates("pixels", "art.png", {
        ...sprites,
        blackWhite: null,
      })[0].label,
    ).toBe("Regular sprite fallback.");
    expect(artworkCandidates("pixels", "art.png")[0]).toMatchObject({
      label: "Artwork fallback, sprite unavailable.",
      pixel: false,
    });
  });
  it("keeps shiny separate and never substitutes a normal sprite for a missing shiny", () => {
    expect(
      artworkCandidates("pixels", "shiny-art.png", sprites, true).map(
        (c) => c.src,
      ),
    ).toEqual(["bw-shiny.png", "regular-shiny.png", "shiny-art.png"]);
    expect(
      artworkCandidates(
        "pixels",
        "shiny-art.png",
        { ...sprites, blackWhiteShiny: null, regularShiny: null },
        true,
      ).map((c) => c.src),
    ).toEqual(["shiny-art.png"]);
    expect(
      artworkCandidates("artwork", "art.png", sprites).map((c) => c.src),
    ).toEqual(["art.png"]);
    expect(artworkCandidates("pixels", null)).toEqual([]);
  });
});
it("covers every supported type with readable colors in both themes", () => {
  const luminance = (hex: string) => {
    const rgb = hex
      .slice(1)
      .match(/../g)!
      .map((c) => parseInt(c, 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  expect(Object.keys(TYPE_PALETTE).sort()).toEqual([...POKEMON_TYPES].sort());
  expect(new Set(Object.values(TYPE_PALETTE).map((c) => c[0])).size).toBe(19);
  for (const colors of Object.values(TYPE_PALETTE))
    for (const offset of [0, 2]) {
      const a = luminance(colors[offset]),
        b = luminance(colors[offset + 1]);
      expect(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
      ).toBeGreaterThanOrEqual(4.5);
    }
});
