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

  return (
    <span className="absolute inset-3 block">
      <Image alt={alt} className="object-contain object-center" fill preload={priority} sizes="(max-width: 767px) 28vw, 128px" src={src} />
    </span>
  );
}
