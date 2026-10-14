import { formatDisplayName } from "@/lib/pokedex/format";
import type { PokemonTypeName } from "@/lib/pokedex/types";
export function TypeBadge({
  type,
}: {
  type: PokemonTypeName;
}): React.JSX.Element {
  return (
    <span className="type-badge" data-type={type}>
      {formatDisplayName(type)}
    </span>
  );
}
