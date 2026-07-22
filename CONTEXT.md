# Pokédex domain context

Status: accepted product vocabulary
Last updated: 2026-07-21

## Core terms

### Generation

A numbered Pokémon generation as exposed by PokéAPI. A generation is the primary browsing scope for the list. Gen I is the default scope; “All” is an explicit cross-generation scope.

### Introduction generation

The generation in which a species first appears in the National Pokédex. It is used only to choose a default browse context for direct species URLs when no explicit list context is present.
_Avoid_: current generation, form generation.

### Species

The canonical Pokédex identity represented by one species page and one national Pokédex number. A species owns its descriptive content, evolution chain, and available variants.

### Variant

A selectable Pokémon resource belonging to a species, including the default Pokémon resource and alternate forms. A variant may have a distinct display name, artwork, types, stats, moves, and abilities.

### Form

The user-facing label for a non-default variant when the Pokémon resource represents a named alternate form. A form is not treated as a separate species in navigation.

### Canonical type

The type data shown in the main Pokédex list and the default detail view. It is the current primary representation returned by the selected Pokémon resource. Historical differences are shown only in version-specific detail.

### Shiny

An appearance state for the selected variant. Shiny changes artwork presentation; it does not create a new list entry, species, or variant identity.

### Pokédex list

The ordered, scrollable collection of species rows for the active generation scope. It is always ordered by Pokédex number in v1 and has no sorting control.

### Generation-first browsing

The interaction model in which a user chooses a generation before browsing or searching. Name/number search is optional and remains scoped to the selected generation unless “All” is selected explicitly.

### Global search

Name/number search while the “All” generation scope is active. It is the only mode that intentionally searches across every generation.

## Rules

- A species page is the canonical page identity; a form selector changes the selected variant within that page.
- The selected form is reflected in the URL so a detail view is shareable and restorable.
- Type filters use OR semantics: selecting Water and Fire shows Pokémon matching either type within the active generation.
- Search matches names and Pokédex numbers only in v1.

## Avoid

- Do not call a variant a separate species.
- Do not call shiny a form or a variant.
- Do not use “entry” when “species page” or “list row” is more precise.
- Do not imply that the main list shows historical type data.
- Do not call the filtered list a “sorted result”; its order is fixed by Pokédex number.
