import { z } from "zod";
import { getCatalogIndex, getPokemonCatalog } from "@/lib/pokedex/data";
import { parseCatalogScope } from "@/lib/pokedex/generations";
import { parseTypeFilters } from "@/lib/pokedex/query";

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  let scope, options;
  try {
    scope = parseCatalogScope(params.get("generation") ?? undefined);
    options = {
      query: z
        .string()
        .max(100)
        .parse(params.get("q") ?? ""),
      types: parseTypeFilters(params.get("types") ?? undefined),
      offset: z.coerce
        .number()
        .int()
        .min(0)
        .max(100_000)
        .parse(params.get("offset") ?? 0),
    };
  } catch {
    return Response.json(
      { error: "Invalid catalog request." },
      { status: 400 },
    );
  }
  try {
    if (params.get("count") === "1") {
      const index = await getCatalogIndex(scope, options);
      return Response.json({ count: index.species.length });
    }
    return Response.json(await getPokemonCatalog(scope, options));
  } catch {
    return Response.json(
      { error: "Couldn’t load species. Please try again." },
      { status: 503 },
    );
  }
}
