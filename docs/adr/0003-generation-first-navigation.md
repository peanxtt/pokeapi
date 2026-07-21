# ADR 0003: Make generation the primary browsing scope

- Status: Accepted
- Date: 2026-07-21

## Context

An undifferentiated list of every Pokémon would make the familiar Pokédex ordering harder to understand and would turn the first interaction into a global search problem. The intended experience starts with choosing a generation, then browsing its canonical list.

## Decision

Gen I is the default scope. The generation rail provides Gen I through the latest known generation and an explicit “All” option. Name and number search is optional and is scoped to the selected generation. Only “All” activates cross-generation search. The list always remains in Pokédex-number order and exposes no sorting control. Type filters are explicit visual controls and combine with OR semantics.

## Consequences

- The initial page has a clear, familiar mental model.
- Search behavior is predictable and shareable through URL parameters.
- The catalog can be fetched and rendered as a generation-sized unit.
- A future advanced filter system can extend the URL model without changing the primary navigation.
