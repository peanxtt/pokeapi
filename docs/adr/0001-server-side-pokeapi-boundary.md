# ADR 0001: Keep the PokéAPI client behind a server-side adapter

- Status: Accepted
- Date: 2026-07-21

## Context

PokéAPI is the only v1 source of Pokémon data and assets. The project wants to use `pokenode-ts`, while keeping the browser experience stable if the upstream library or API response shape changes. Direct browser calls would also expose the data-fetching boundary to every UI component and make caching, validation, and error handling inconsistent.

## Decision

Only the Next.js server data layer may import `pokenode-ts`. A small adapter validates the fields used by the product at the external boundary, maps them into app-owned Pokédex models, and owns retries and cache behavior. Server components and route handlers consume those app-owned models. Client components receive serialized view data and manage only interaction state such as search text, expanded sections, theme, and shiny appearance.

The v1 client does not use SWR, TanStack Query, Zustand, or another global data store. The adapter and Next.js server caching are the data cache; URL search parameters are the shareable navigation state.

## Consequences

- UI code is insulated from `pokenode-ts` types and naming.
- API validation and error messages have one home.
- A future source can replace the adapter without rewriting the UI model.
- Server rendering and request-time loading states remain natural in the App Router.
- The adapter must be kept small; it is not a second domain database or a generic API framework.
