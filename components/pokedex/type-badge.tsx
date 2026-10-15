import { formatDisplayName } from "@/lib/pokedex/format";
import type { PokemonTypeName } from "@/lib/pokedex/types";
import { TYPE_PALETTE } from "@/lib/pokedex/type-palette";
import type { CSSProperties } from "react";
import Image from "next/image";
export function TypeBadge({
  type,
  compact = false,
}: {
  type: PokemonTypeName;
  compact?: boolean;
}): React.JSX.Element {
  const color = TYPE_PALETTE[type];
  return (
    <span
      className={`type-badge ${compact ? "compact" : ""}`}
      data-type={type}
      style={
        color
          ? ({
              "--type-light-bg": color[0],
              "--type-light-ink": color[1],
              "--type-night-bg": color[2],
              "--type-night-ink": color[3],
            } as CSSProperties)
          : undefined
      }
    >
      {color && (
        <span className="type-symbol" aria-hidden="true">
          <Image
            src={`/type-icons/${type}.png`}
            alt=""
            width={14}
            height={14}
            unoptimized
          />
        </span>
      )}
      {formatDisplayName(type)}
    </span>
  );
}
