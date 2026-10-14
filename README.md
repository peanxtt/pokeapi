# Pokédex / Field guide

An anonymous, generation-first Pokédex powered by [PokéAPI](https://pokeapi.co/). Its modern retro field-guide design pairs periwinkle panels and amber controls with canonical Pokémon data, URL-addressable forms, and persistent desktop/mobile browsing context. It supports System, Light and Night themes, responsive layouts, loading/recovery states and reduced motion.

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
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

## Data boundary

The application is online-first and does not require accounts or a database. PokéAPI requests stay on the server, are validated at the boundary, and use Next.js caching with retry handling. The UI consumes the app-owned models in `lib/pokedex` rather than the upstream response shapes.

The approved visual direction and local verification results are documented in [the design contract](docs/design/retro-field-guide.md).
