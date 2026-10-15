# Pokédex / Field guide

An anonymous, generation-first Pokédex powered by [PokéAPI](https://pokeapi.co/). Its modern retro field-guide design pairs periwinkle panels and amber controls with canonical Pokémon data, URL-addressable forms, and persistent desktop/mobile browsing context. It supports System, Light and Night themes, responsive layouts, loading/recovery states and reduced motion.

Sound defaults on and plays a cry after a deliberate species selection. Its top-bar menu offers mute and a 0–100% volume slider (45% by default); both settings persist across visits. Artwork/Pixels applies across the guide, using static Black/White sprites with labeled regular-sprite/artwork fallbacks. All 19 supported types have distinct colors and circular symbols in both themes. The small type assets come from the [official PokéAPI sprite repository](https://github.com/PokeAPI/sprites/tree/master/sprites/types/generation-ix/scarlet-violet/small).

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

## Browser regression checks

Build the production app, then run the Playwright checks against the actual catalog, direct-detail and client navigation routes:

```bash
pnpm exec playwright install chromium
pnpm build
pnpm test:browser
```

The tests start a local production server on port 3004 and capture loading/loaded screenshots. They hold actual server-rendered fallback completion boundaries while measuring row, artwork and form geometry, then compare them with the settled route. They also check six widths, Night with reduced motion, preference persistence, sprite fallbacks and audio cancellation/retry. A separate test uses real browser audio playback; deterministic control tests stub the media methods. Pointer intent warms one species while pending selection preserves the current detail. Browser screenshots and failure traces remain in the ignored `test-results` directory. On Windows, an existing Edge installation can be used by setting `$env:PLAYWRIGHT_CHANNEL = "msedge"` before running the tests.

## Data boundary

The application is online-first and does not require accounts or a database. PokéAPI requests stay on the server, are validated at the boundary, and use Next.js caching with retry handling. The UI consumes the app-owned models in `lib/pokedex` rather than the upstream response shapes.

The approved visual direction and local verification results are documented in [the design contract](docs/design/retro-field-guide.md).
