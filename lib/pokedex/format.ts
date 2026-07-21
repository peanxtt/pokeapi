export function formatDisplayName(value: string): string {
  return value
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function formatDexNumber(value: number): string {
  return `#${value.toString().padStart(4, "0")}`;
}

export function formatStatLabel(value: string): string {
  const labels: Record<string, string> = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };

  return labels[value] ?? formatDisplayName(value);
}

export function getResourceId(url: string): number {
  const segments = new URL(url).pathname.split("/").filter((segment) => segment.length > 0);
  const lastSegment = segments.at(-1);
  const id = Number(lastSegment);

  if (!lastSegment || !Number.isInteger(id) || id < 1) {
    throw new Error(`Unable to extract a numeric resource id from "${url}".`);
  }

  return id;
}

export function getVariantDisplayName(speciesName: string, variantName: string): string {
  if (speciesName === variantName) {
    return formatDisplayName(speciesName);
  }

  const prefix = `${speciesName}-`;
  const formName = variantName.startsWith(prefix) ? variantName.slice(prefix.length) : variantName;

  return formatDisplayName(formName);
}

export function normalizeFlavorText(value: string): string {
  return value.replace(/[\n\f\r]+/g, " ").replace(/\s+/g, " ").trim();
}
