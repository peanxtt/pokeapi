# ADR 0002: Keep v1 anonymous and database-free

- Status: Accepted
- Date: 2026-07-21

## Context

The product is an exploration and reference experience. Accounts, favorites, collections, and personal progress would introduce identity, persistence, and moderation concerns without supporting the core job of browsing Pokémon.

## Decision

V1 is anonymous and read-only. It has no authentication, account model, application database, ORM, or user-specific persistence. PokéAPI supplies the source data and assets. Local browser state may remember presentation preferences such as theme, but it is not product data.

## Consequences

- Deployment is smaller and operationally simpler.
- A user can share any species/form URL without creating an account.
- Caching is for upstream reference data, not user records.
- Favorites, collections, and accounts remain intentionally out of scope until the product has evidence that they are needed.
