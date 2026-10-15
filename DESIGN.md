# Pokédex design system

Status: approved redesign implemented and verified locally
Last updated: 2026-10-14

## Direction

A spacious modern retro field guide. Cool periwinkle structure, carbon navigation, amber controls and crisp bevels frame expressive species artwork. This replaces the previous glass-oriented visual treatment. Product behavior remains generation-first and URL-backed as defined in CONTEXT.md and accepted ADRs.

## Review surfaces

The Penpot file PokeAPI contains 55 new boards, 49 native component assets, Light and Night theme presets and named example flows. See [the handoff](docs/design/penpot-handoff.md), [the visual contract](docs/design/retro-field-guide.md) and [the board manifest](docs/design/penpot-manifest.json).

The later sound, pixel artwork and type-color revision is approved and implemented locally. Start at **06 / Sound + pixels + type colors**; its full responsive boards in **02 / Responsive screens** start with **QoL /**. See [the preference design brief](docs/design/sensory-preferences.md).

When duplicating screens for a new design iteration, redirect inherited prototype links to that iteration and verify destinations. Provide a clearly named review entry so users do not land on earlier screens without the new controls.

Center an icon and its label as one measured group inside a control. A centered text frame does not establish that its visible content and adjacent icon are centered together. Verify the group bounds, vertical alignment and spacing in both themes and at narrow widths.

## Type and geometry

DM Sans carries names, controls and body copy. IBM Plex Mono carries national numbers and numeric data. Use 42/32px display, 24px section headings, 16px body, 14px controls and 12px supplementary labels. Small 10–11px metadata is supplementary only.

Desktop pane gaps are 24px, outer inset 28px, mobile inset 20px, and section rhythm 32–40px. Controls have 44px targets and species rows are 96px tall. Corners are 2–4px. Depth uses a 2px upper highlight and a 3px hard shadow rather than blur or glass.

## Material and themes

Light: chassis #7A8ABA, surface #F7F8FC, sky #9FBEE7, artwork lavender #ACACE7, ink/nav #21242E, indigo edge/secondary ink #3D4F97, ice #C0D5E6 and amber #ECAB37. Teal #206479 carries stat bars. Red is reserved for errors.

Night: chassis #1D2233, surface #272F46, nav #161B29, sky #354461, artwork #596BA4, ink #EDF1FC and secondary ink #B4C1E6. Amber retains its action role. Focus is carbon in Light and sky in Night. Small text on the light chassis uses primary ink.

Theme choice supports System, Light and Night. Persist the choice in production and interpolate token colors with stable content position. The prototype uses illustrative transitions.

## Responsive behavior

At 1280px and above, show generation rail, index and detail within a centered workspace capped at 1384px. At 1024–1279px, replace the rail with a generation selector and keep the index/detail split. Below 1024px, show the index first and open a separate detail composition with Back. Reference snapshots cover 1920, 1440, 1024, 768, 390 and 320px in both themes.

Keep native scroll affordances and independent desktop pane scrolling. Scope changes clear stale detail. Species selection preserves list position; return restores scope, query, filters and focus. Desktop starts without an automatic selection.

## State coverage

Every action needs default, hover, focus, pressed, disabled and loading feedback. Search needs clear, focus and validation feedback. Catalog and detail requests have separate layout-matched loading and retry states. Empty search explains the current scope and offers reset. Missing species provides a return path. Missing artwork preserves data. Single-form, unavailable shiny, missing description, moves, evolution and type history have explicit fallback treatments.

Skeleton rows reuse the loaded row's grid, typography and spacing. Target artwork and text placeholders by their explicit roles; broad descendant selectors such as `:first-child` can accidentally size text bars like artwork. Loading status is announced without adding height above the first row.

Verify real route fallbacks under delayed network responses, including direct entry and client navigation. Compare their measured geometry with the settled view and confirm the served CSS contains the intended change; a standalone loading demonstration does not establish that the route or deployment uses it.

Form and shiny controls remain distinct. Type filters use OR. All generations is the explicit global search mode. Species rows retain national order and do not expose sorting. Moves stay grouped by learn method; do not introduce unsupported move power fields.

## Motion and accessibility

Use 160ms control feedback, 180ms content/artwork crossfades, 200ms theme/disclosure transitions and 240ms mobile navigation with ease-out quart and no bounce. Animate transforms and opacity rather than layout properties. Reserve artwork dimensions. A loading skeleton may pulse opacity over 1200ms.

Reduced motion removes panel travel and skeleton pulsing, using immediate changes or a short opacity fade. Keyboard focus is visible; Tab and Enter retain native behavior. Opening phone detail moves focus to the heading or Back; returning restores the originating row. Do not convey selection or types through color alone.

## Implementation boundary

The approved design is implemented in the Next.js app: shared chrome and tokens, parallel/intercepted species routes, responsive index/detail compositions, persistent theme selection, motion, loading/recovery states and real reference data. The Penpot file remains the visual review reference. Implementation checks and browser verification are recorded in docs/design/retro-field-guide.md.

Sound appears only beside Theme, defaults on and persists independently. Image style applies across catalog, details and evolution. Static Black/White sprites fall back to regular sprites and artwork with accurate source captions. Type pills use centered icon-and-label groups, circular symbols, 6px side padding and full rounding; standard/compact heights are 28/24px. Keep selected filters at least 44px tall.

Version stable resource-cache keys when adding fields to cached validated models. Changing an imported schema alone may leave older cached objects without the new fields until their expiry; verify new media behavior against a warm cache.
