"use client";
import { useEffect, useState } from "react";
import { catalogApiPath } from "@/lib/pokedex/catalog-client";
import { getBrowsePath } from "@/lib/pokedex/query";
import type { CatalogScope, PokemonTypeName } from "@/lib/pokedex/types";

export function TypeFilterSubmit({
  scope,
  query,
  types,
  knownCount,
}: {
  scope: CatalogScope;
  query: string;
  types: PokemonTypeName[];
  knownCount?: number;
}) {
  const key = catalogApiPath(getBrowsePath(scope, query, types)) + "&count=1";
  const [result, setResult] = useState<{ key: string; count: number | null }>({
    key: "",
    count: null,
  });
  useEffect(() => {
    if (knownCount !== undefined) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(key, { signal: controller.signal });
        if (!response.ok) throw new Error("Count unavailable");
        const data: { count: number } = await response.json();
        if (!controller.signal.aborted) setResult({ key, count: data.count });
      } catch {
        if (!controller.signal.aborted) setResult({ key, count: null });
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, knownCount]);
  const count = knownCount ?? (result.key === key ? result.count : null);
  return (
    <button className="fg-button primary" type="submit">
      {count === null ? "Apply filters" : `Show ${count} species`}
    </button>
  );
}
