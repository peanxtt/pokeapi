# Domain Docs

How engineering skills should consume this repo’s domain documentation.

## Before exploring, read these

- `CONTEXT.md` at the repository root
- `docs/adr/` for decisions related to the work

If any of these files do not exist, proceed silently. The domain-modeling skill creates them lazily when terms or decisions are resolved.

## Use the glossary vocabulary

When naming a domain concept in an issue, refactor proposal, hypothesis, or test, use the terminology defined in `CONTEXT.md`.

If a needed concept is not in the glossary, treat it as a vocabulary gap and resolve it before introducing a new term.

## Flag ADR conflicts

If proposed work contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
