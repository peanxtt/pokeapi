"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
type Props = {
  alt: string;
  priority: boolean;
  src: string | null;
  sizes?: string;
  retryable?: boolean;
};
export function PokemonArtwork({
  alt,
  priority,
  src,
  sizes = "80px",
  retryable = true,
}: Props): React.JSX.Element {
  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  if (!src || failed === src)
    return (
      <div
        className="artwork-fallback"
        role="img"
        aria-label={`${alt} unavailable`}
      >
        <ImageOff size={28} aria-hidden />
        <span>Artwork unavailable</span>
        {src && retryable && (
          <button
            type="button"
            className="text-button"
            onClick={() => setFailed(null)}
          >
            Retry artwork
          </button>
        )}
      </div>
    );
  return (
    <span className={`artwork-image ${loaded === src ? "is-loaded" : ""}`}>
      <Image
        alt={alt}
        fill
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        src={src}
        onLoad={() => setLoaded(src)}
        onError={() => setFailed(src)}
      />
    </span>
  );
}
