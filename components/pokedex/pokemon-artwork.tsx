import Image from "next/image";

type PokemonArtworkProps = {
  alt: string;
  priority: boolean;
  src: string | null;
};

export function PokemonArtwork({ alt, priority, src }: PokemonArtworkProps): React.JSX.Element {
  if (!src) {
    return <div aria-label={`${alt} unavailable`} className="flex h-full min-h-24 items-center justify-center text-xs text-muted" role="img">No artwork</div>;
  }

  return <Image alt={alt} className="object-contain p-3" fill priority={priority} sizes="(max-width: 767px) 28vw, 128px" src={src} />;
}
