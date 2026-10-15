"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useGuidePreferences } from "./guide-preferences";
import { artworkCandidates } from "@/lib/pokedex/media";
import type { PixelSprites } from "@/lib/pokedex/types";
type Props = {
  alt: string;
  priority: boolean;
  src: string | null;
  sizes?: string;
  retryable?: boolean;
  pixelSprites?: PixelSprites;
  shiny?: boolean;
  onSourceChange?: (label: string) => void;
};
export function PokemonArtwork({
  alt,
  priority,
  src,
  sizes = "80px",
  retryable = true,
  pixelSprites,
  shiny = false,
  onSourceChange,
}: Props): React.JSX.Element {
  const { imageStyle } = useGuidePreferences();
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const candidates = artworkCandidates(imageStyle, src, pixelSprites, shiny);
  const candidate = candidates.find((c) => !failed.includes(c.src));
  const label = candidate?.label || "Image unavailable.";
  useEffect(() => {
    onSourceChange?.(label);
  }, [onSourceChange, label]);
  if (!candidate)
    return (
      <div
        className="artwork-fallback"
        role="img"
        aria-label={`${alt} unavailable`}
      >
        <ImageOff size={28} aria-hidden />
        <span>Artwork unavailable</span>
        {!!candidates.length && retryable && (
          <button
            type="button"
            className="text-button"
            onClick={() => setFailed([])}
          >
            Retry artwork
          </button>
        )}
      </div>
    );
  return (
    <span
      className={`artwork-image ${candidate.pixel ? "is-pixel" : ""} ${loaded === candidate.src ? "is-loaded" : ""}`}
      data-image-source={candidate.label}
    >
      <Image
        key={candidate.src}
        alt={
          candidate.pixel
            ? alt.replace(/ artwork$/, "") +
              " " +
              candidate.label.replace(/\.$/, "")
            : alt
        }
        fill
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        src={candidate.src}
        unoptimized={candidate.pixel}
        onLoad={() => setLoaded(candidate.src)}
        onError={() => setFailed((previous) => [...previous, candidate.src])}
      />
    </span>
  );
}
