import { formatDisplayName } from "@/lib/pokedex/format";
import type { PokemonTypeName } from "@/lib/pokedex/types";

type TypeBadgeProps = {
  type: PokemonTypeName;
};

export function TypeBadge({ type }: TypeBadgeProps): React.JSX.Element {
  return (
    <span
      className="type-badge inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
      data-type={type}
    >
      {formatDisplayName(type)}
    </span>
  );
}
