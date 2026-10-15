import type { PixelSprites } from "./types";
export function artworkCandidates(
  style: "artwork" | "pixels",
  artwork: string | null,
  sprites?: PixelSprites,
  shiny = false,
) {
  const candidates: { src: string; label: string; pixel: boolean }[] = [];
  if (style === "pixels") {
    const legacy = shiny ? sprites?.blackWhiteShiny : sprites?.blackWhite;
    const regular = shiny ? sprites?.regularShiny : sprites?.regular;
    if (legacy)
      candidates.push({
        src: legacy,
        label: "Black/White sprite.",
        pixel: true,
      });
    if (regular && regular !== legacy)
      candidates.push({
        src: regular,
        label: "Regular sprite fallback.",
        pixel: true,
      });
  }
  if (artwork && !candidates.some((c) => c.src === artwork))
    candidates.push({
      src: artwork,
      label:
        style === "pixels"
          ? "Artwork fallback, sprite unavailable."
          : "Official artwork.",
      pixel: false,
    });
  return candidates;
}
