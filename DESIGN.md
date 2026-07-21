# Pokédex design system

Status: working design contract
Last updated: 2026-07-21

## Product direction

This is a calm, reference-first Pokédex: a familiar, scrollable list for finding a Pokémon, paired with a carefully ordered species page for understanding it. The visual language borrows from Apple’s restraint, material layering, and physical motion without turning Pokémon data into a glossy dashboard.

The content is the hero. Liquid glass belongs to navigation, search, filter controls, and lightweight chrome. Pokémon rows and detail data use mostly neutral surfaces with only light translucency, hairline borders, and semantic type accents.

## Design dials

- Design variance: 3/10. Familiar Pokédex structure with a distinct editorial material treatment.
- Visual density: 4/10. One readable row per Pokémon; compact metadata; generous detail-page breathing room.
- Motion intensity: 5/10. Calm spring movement and small Pokémon-specific moments, never constant bouncing.

## Typography

Geist Sans is the primary typeface and Geist Mono is reserved for Pokédex numbers, data labels, and technical metadata. The hierarchy is quiet and deliberate:

- Display: the selected Pokémon’s name, using a strong but compact scale.
- Section title: short labels such as “Base stats” and “Evolution”.
- Body: descriptions and explanatory copy with a comfortable reading measure.
- Metadata: number, generation, form, and source context in mono.

Avoid all-caps paragraphs, novelty Pokémon fonts, and type scales that make the page feel like a marketing landing page.

## Color and material

The canvas is a warm neutral in light mode and a softened charcoal in dark mode. Pure black and pure white are not used as large surfaces. Type colors are semantic accents only:

- Fairy: rose/lilac accent for the theme control and a restrained brand cue.
- Dark: deep violet/ink accent for the dark-mode control.
- Water, fire, grass, electric, and the remaining canonical types: muted badge and filter colors with readable foregrounds.

Glass uses a low-opacity neutral fill, a subtle backdrop blur, and a 1px border. It is not used behind long-form descriptions or dense data. Do not add decorative gradients; any glow is a small, localized detail-page accent tied to the selected type.

## Layout

The primary surface is a single-column Pokédex list. Every row preserves Pokédex-number order and places artwork on the left with identity, types, and a short data cue to the right.

- Mobile: full-width content with safe 16px gutters and horizontally scrollable generation/filter controls.
- Tablet: the same information architecture with wider rows, larger artwork, and more breathing room.
- Desktop: the shared content shell is capped at `min(80vw, 834px)` and centered, leaving quiet blank space on both sides. Navigation, filters, list, and detail content share this shell.
- Detail pages: continuous vertical reading with expandable sections. Evolution is a connected, horizontally scrollable sequence on small screens and a wider connected layout on larger screens.

Do not introduce top-level Types, Moves, Regions, or About pages in v1. Related data appears in context on a species page.

## Component inventory

- `PokedexShell`: centered responsive surface and global chrome.
- `GenerationRail`: Gen I–IX plus explicit “All” selection.
- `SearchField`: debounced name/number search scoped to the selected generation.
- `TypeFilterBar`: visual, multi-select canonical type filters with OR semantics.
- `PokemonList`: ordered result list with loading, empty, and error states.
- `PokemonListRow`: tappable species row with artwork and canonical metadata.
- `PokemonDetailPage`: canonical species identity and continuous detail composition.
- `VariantSelector`: in-page form/variant selector reflected in the URL.
- `ShinyToggle`: appearance-only shiny state for the selected form.
- `StatSummary`: compact visual base-stat reading.
- `EvolutionChain`: connected, tappable evolution sequence with concise conditions.
- `ExpandableSection`: inline grouped data such as abilities, moves, and version notes.
- `ThemeToggle`: Fairy/Dark visual transition for the manual theme control.

## Motion

Motion uses `motion/react` with opacity, transform, and layout changes only. Use a smooth spring for shared artwork/detail transitions and a shorter spring for control feedback. The list may reveal in a restrained stagger on first load; filters and rows should settle quickly and never feel elastic.

The product direction intentionally prioritizes calm physical motion over a separate reduced-motion presentation. Avoid motion that carries essential information.

## Voice

Labels are concise and specific: “Gen I”, “All generations”, “Base stats”, “Evolution”, “Abilities”, “Moves”, and “Version details”. Error states say what failed and offer a clear retry. Empty states explain the current filter context rather than making a joke.
