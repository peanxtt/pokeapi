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

The canvas is a warm neutral in light mode and true black in dark mode. Dark mode lifts the workspace panes and controls slightly above the canvas so the split layout remains legible without relying on heavy shadows. Pure white is not used as a large surface. Dark-mode type accents use lighter semantic foregrounds with low-opacity tinted fills. Type colors are semantic accents only:

- Fairy: rose/lilac accent for the theme control and a restrained brand cue.
- Dark: deep violet/ink accent for the dark-mode control.
- Water, fire, grass, electric, and the remaining canonical types: muted badge and filter colors with readable foregrounds.

Glass uses a low-opacity neutral fill, a subtle backdrop blur, and a 1px border. It is not used behind long-form descriptions or dense data. Do not add decorative gradients; any glow is a small, localized detail-page accent tied to the selected type.

## Layout

The primary surface is a single-column Pokédex list. Every row preserves Pokédex-number order and places artwork on the left with identity, types, and a short data cue to the right.

- Mobile: full-width content with safe 16px gutters and horizontally scrollable generation/filter controls.
- Tablet: the same information architecture with wider rows, larger artwork, and more breathing room.
- Desktop: the master/detail workspace is capped at `min(88vw, 1120px)` and centered, leaving quiet blank space on both sides. The list and detail panes share this shell while owning their own scroll regions.
- Desktop split: the master/detail ratio is fixed at approximately 38% list and 62% detail in v1; users do not resize the divider.
- Control ownership: generation selection, name/number search, and canonical type filters belong to the left master pane; the right detail pane does not duplicate browsing controls.
- Scope changes: changing generation clears the selected detail immediately while the new catalog loads; the old species never remains visible under a different generation scope.
- Direct detail context: when a species URL has no explicit browse context, infer the species' introduction generation for the left pane; an explicit `from` scope remains authoritative.
- Catalog scale: All generations uses a normal semantic list in v1, with lazy artwork and restrained rendering; virtualization is intentionally deferred to preserve reliable focus and scroll restoration.
- Catalog motion: search and type-filter updates preserve list position and animate only rows entering or leaving the visible result set; the full list does not remount or restagger.
- Detail selection motion: desktop keeps the pane fixed and crossfades the new detail content in place after resetting scroll; only the mobile route changes position with a panel slide.
- Mobile panel motion: detail enters from the right and dismisses along the same path with an interruptible, no-bounce spring settling over approximately 360–400ms; edge-swipe release velocity is handed into the spring.
- Mobile panel layering: the underlying list remains mounted but inert while the full-width detail panel is open, preserving its scroll position and restoring focus on dismissal.
- Desktop scrolling: the list and detail panes scroll independently; the outer page stays fixed after the global chrome, and pane scrollbars remain visually quiet.
- Scroll indicators: native scrollbars are visually hidden in both panes to match an iOS-like surface; sticky controls, edge fades, and direct touch or wheel response preserve scroll discoverability.
- Desktop first load: the detail pane starts empty until the user selects a species; it never auto-opens the first list row.
- Selection consistency: when generation, search, or type filters remove the selected species from the visible scope, clear the selection and return the detail pane to its empty state.
- Mobile return: closing a detail panel restores the prior generation, filters, and exact Pokédex list position.
- Mobile dismissal: the detail panel supports a narrow left-edge swipe-to-dismiss gesture; horizontal swipes inside content remain available to evolution and variant sequences.
- Mobile detail surface: the open detail panel fills the viewport; the list may show through during the entrance motion but is not exposed once the panel settles.
- Responsive breakpoint: below `1024px`, the list-first mobile/tablet presentation is used; at `1024px` and above, the persistent master/detail workspace is used.
- Detail orientation: selecting a different species resets the detail pane to its top; the list preserves its current scroll position.
- List orientation: selecting a species does not move the list to the top; programmatic selection only scrolls the row into the nearest visible position when necessary.
- Active row: the selected species uses a neutral lifted surface, hairline border, and restrained brand accent; semantic type colors remain limited to badges and related accents.
- Detail composition: the desktop detail pane preserves the artwork-plus-identity hero; on mobile that hero stacks vertically before the continuous detail sections.
- Detail wayfinding: after the hero scrolls away, a compact sticky identity header keeps the species number, name, and current form visible with a quiet translucent edge treatment.
- Empty detail state: an unselected desktop pane uses a restrained monochrome Poké Ball line icon with concise selection guidance and no bright surface treatment.
- List row composition: number, name, and type badges form the leading scan column; centered artwork sits at the trailing edge of the row.
- List row affordance: the entire row is the link; no trailing navigation arrow is needed.
- Navigation mapping: desktop uses the persistent list as navigation and hides the redundant Back control; mobile keeps Back because the detail panel covers the list.
- History mapping: desktop row selection replaces the current URL; mobile selection pushes a route so browser Back dismisses the detail panel.
- Detail loading: changing species replaces the detail content with a layout-matched skeleton immediately while the list remains usable.
- Detail errors: a failed detail request stays local to the detail pane with a specific retry action; the list and workspace remain usable.
- Mobile focus: opening the detail panel moves focus to its heading or Back control; dismissing it restores focus to the originating row, and Escape dismisses the panel.
- Desktop keyboard behavior: Pokémon rows use native Tab and Enter navigation; arrow keys retain normal pane scrolling, and a concise desktop-only shadcn `Kbd`/`KbdGroup` hint beneath the list heading teaches the available commands without adding custom row-selection state.
- Keyboard selection: focus alone does not change the detail pane; Enter commits the focused species and begins its detail load.
- Pointer selection: hover changes row feedback only; click commits the species selection and begins its detail load.
- Detail pages: continuous vertical reading with expandable sections. On desktop, the selected species renders in the right workspace pane; on mobile, the same URL-backed detail renders as a right-to-left full-height panel over the list. Evolution is a connected, horizontally scrollable sequence on small screens and a wider connected layout on larger screens.

Do not introduce top-level Types, Moves, Regions, or About pages in v1. Related data appears in context on a species page.

## Component inventory

- `PokedexShell`: centered responsive surface and global chrome.
- `PokedexWorkspace`: desktop master/detail shell and mobile route-backed panel presentation.
- `DetailRouteSlot`: canonical detail content rendered as a desktop parallel slot, mobile intercepted panel, or standalone direct route.
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

Motion uses `motion/react` with opacity, transform, and layout changes only. Use a smooth spring for shared artwork/detail transitions and a shorter spring for control feedback. Theme changes transition the entire rendered surface—canvas, panes, controls, borders, text, and accents—through token-driven color changes over approximately 300ms, while the Fairy/Dark theme icon changes with the same interaction. Do not fade or scale the whole document, because content should remain stable while its material palette changes. The list may reveal in a restrained stagger on first load; filters and rows should settle quickly and never feel elastic.

The product direction intentionally prioritizes calm physical motion over a separate reduced-motion presentation. Avoid motion that carries essential information.

## Voice

Labels are concise and specific: “Gen I”, “All generations”, “Base stats”, “Evolution”, “Abilities”, “Moves”, and “Version details”. Error states say what failed and offer a clear retry. Empty states explain the current filter context rather than making a joke.
