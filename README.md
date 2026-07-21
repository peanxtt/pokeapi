# Index / Pokédex

An anonymous, generation-first Pokédex reference experience powered by [PokéAPI](https://pokeapi.co/). It pairs a restrained Apple-inspired interface with canonical Pokémon data, URL-addressable forms, and contextual detail pages.

## Stack

- Next.js App Router and React
- TypeScript with Zod-validated app-owned models
- Tailwind CSS v4
- Motion for calm, physical interface transitions
- `pokenode-ts` behind a server-only PokéAPI adapter

## Development

```bash
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Data boundary

The application is online-first and does not require accounts or a database. PokéAPI requests stay on the server, are validated at the boundary, and use Next.js caching with retry handling. The UI consumes the app-owned models in `lib/pokedex` rather than the upstream response shapes.
