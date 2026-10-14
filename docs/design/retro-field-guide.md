# Retro field guide

## Outcome and scope

Redesign the anonymous Pokédex as a clean, spacious reference product. The editable review surface is the connected Penpot file `PokeAPI`. Retain the original migrated draft, and build the new direction on a separate page. Do not change application code during concept design.

Use the supplied historical visual reference for palette, physical panel depth, and geometry. Its original dense desktop layout and tiny controls conflict with the user's explicit preference for breathing room and are not carried forward. Use only Pokédex vocabulary; do not reproduce unrelated brand names, slogans, logos, mascots, or account flows.

## Palette

| Role | Hex | Application |
| --- | --- | --- |
| Chassis | #7A8ABA | Page background and structural frame |
| Sky | #9FBEE7 | Secondary scope strip |
| Lavender | #ACACE7 | Species artwork plate |
| Ice | #C0D5E6 | Selected rows, field edges, secondary controls |
| Raised plate | #8BA1D4 | Utility panels |
| Indigo edge | #3D4F97 | Crisp bevel shadow and secondary text on light surfaces |
| Muted indigo | #60619C | Inactive metadata on light surfaces |
| Platinum | #DEDEDE | Index inset |
| Tinted white | #F7F8FC | Content and input surfaces |
| Carbon | #21242E | Main navigation and primary text |
| Hairline | #5A5F8C | Panel boundaries |
| Amber | #ECAB37 | Active region and primary utility control |
| Signal orange | #F68D1F | Small directional and selection accents |
| Red | #E60012 | Errors; reserve for exceptional states |
| Teal | #206479 | Stat bars and small analytical accents |

Keep warm colors scarce. Use dark text on amber and orange; light text on these colors does not provide dependable contrast. Type labels always include readable names so color is supplementary.

## Type, space, geometry

Use a legible sans family available in the design tool, with a heavy display weight and uppercase micro labels. Initial design uses DM Sans: 42px species title, 36px page headline, 22px panel headings, 16px body, 14px controls, 12px scope labels. Permit 10–11px only for supplementary nonessential metadata; enlarge it during accessibility refinement if necessary.

Desktop gutters: 24–32px. Panel padding: 24–28px. Section spacing: 32–40px. Mobile inset: 20px. Minimum target: 44px. Short, straight panel edges and 2–4px corners create the hardware character. Bevels use a 2px light upper edge and a 3px offset indigo shadow with no blur. Content stays readable and spacious.

## Screens and behavior

- Desktop exploration: carbon command bar, sky scope strip, region rail, searchable species index, and a generous detail panel. Opening a species keeps search, scope, and list position visible.
- Mobile index: region control, search, type filter, then artwork-led rows. A species opens a separate detail screen; back restores browse context.
- Mobile detail: back control, artwork, identity and types, default/shiny appearance control, stats, abilities, evolution, and progressively disclosed moves/version notes.
- Utility states: empty search with clear reset, recoverable data error with retry, loading placeholders with reserved artwork space, and visible keyboard focus.

Search names and numbers within the visible scope, make the result count explicit, and show any active type filter with a clear removal action. A shiny toggle changes appearance, not canonical species identity. Do not add accounts, subscriptions, or decorative dashboard metrics.

## Motion

Use 160–200ms transitions for controls, 220–260ms for detail navigation, and a restrained 180ms artwork crossfade. Preserve content position. Do not stagger the entire catalog. With reduced motion, replace spatial transitions with immediate state changes or a short opacity change. Penpot prototype links express navigation; these timings are implementation guidance, not a claim of production behavior.

## Work plan and verification

Expanded scope requested on 2026-10-14: complete responsive compositions at 1920, 1440, 1024, 768, 390, and 320px; light and night themes; reusable native components; full loading, empty, recovery and control states; linked navigation examples and detailed motion guidance. Preserve generation-first browsing and URL-backed species identity from CONTEXT.md and the accepted ADRs. A reference on a phone in daylight motivates the light default; the night theme supports browsing in a dim room while preserving the same hierarchy.

The prior visual treatment in DESIGN.md is superseded by this user-requested redesign. Its domain and navigation constraints continue to apply where they are recorded in CONTEXT.md and ADRs. No new top-level content pages or accounts are added.

- [x] Read user reference and reconcile it with prior preferences.
- [x] Define neutral palette roles and responsive design rules.
- [x] Build new native editable desktop and mobile boards in Penpot.
- [x] Add style guide and utility-state boards.
- [x] Link mobile browse/detail flow.
- [x] Inspect representative native PNG/SVG exports and check text bounds on all new boards.
- [x] Record verified board identifiers and remaining limitations.
- [x] Add 1920, 1024, 768 and 320px adaptations.
- [x] Add night-theme desktop and mobile screens and token sets.
- [x] Create native component assets and documented variants.
- [x] Cover forms, shiny appearance, type filters, moves and version disclosure.
- [x] Create motion storyboards, prototype links and reduced-motion guidance.

Review record: 2026-10-14. See penpot-handoff.md and penpot-manifest.json. Light-theme focus rings use carbon #21242E to remain visible against the mid-tone chassis. Search field labels use primary ink, including on the mobile canvas.

## Implementation, approved 2026-10-14

Outcome: implement the approved six-width, two-theme design with real data and URL-backed interaction, preserving the server-only PokéAPI boundary. GitHub CLI is unavailable in this environment, so this existing design task list records progress and verification.

- [x] Replace global materials, fonts, chrome and responsive workspace geometry.
- [x] Implement persistent desktop master/detail and mobile intercepted detail routes, with direct-route fallback.
- [x] Implement scoped search, generation/type selectors, incremental rows and selection consistency.
- [x] Implement canonical species identity, form selection, artwork fallback, shiny and detail sections.
- [x] Implement System/Light/Night persistence, keyboard/focus handling and reduced-motion behavior.
- [x] Implement matched loading, empty, retry and missing-species states.
- [x] Verify domain regressions, lint, TypeScript and production build.
- [x] Visually verify six viewport widths, both themes and representative interactions.
- [x] Review the diff and record implementation results and limitations.

Affected areas: app layouts/routes/styles, Pokédex components, URL/model mapping, font dependencies and focused tests. Routing follows the accepted parallel/intercepted-route ADR. Important risks are slot persistence when dismissing details, scroll/focus restoration, generation changes while details are open, and keeping species numbers independent of variant resource IDs. Verification includes real navigation and direct-route refreshes, not only screenshots.

### Implementation verification, 2026-10-14

- Twelve Vitest checks pass: scoped names/numbers, safe return paths, filter parsing, canonical catalog names, declared default varieties, form identity, variant ownership, optional evolution, English ability effects, direct introduction-generation inference and filtered Next navigation.
- ESLint, TypeScript and the production build pass. Fonts are self-hosted. The server-only validated and cached PokéAPI boundary is retained.
- In-app browser checks cover 1920, 1440, 1024, 768, 390 and 320px in Light and Night. No page-level horizontal overflow was detected. Browser scaling rounded one 1024px viewport to 1025px; the compact desktop composition was also visually inspected. Screenshots are saved in the session visualization directory as `implementation-{light,night}-{width}.jpg`.
- Verified index → detail → Next; direct detail refresh → another species with a single detail panel; filtering away a selection; Grass OR Fire returning 26 Gen I results; switching generations; All generations search; zero-padded number search; Deoxys Attack form retaining #0386 and changing Attack to 180; shiny and moves disclosure; missing-species return; empty reset; retry-state rendering and recovery on query navigation.
- Mobile filtered return restores query and originating row focus. Opening Wailord beyond the initial 40 rows, refreshing, and returning restored 80 rows, Wailord focus and the exact recorded scroll position of 7654.545px.
- Theme radio choices support Arrow/Home/End keys and Enter; Light selection survives refresh. Production error recovery on query navigation and global search for Terapagos were verified.
- Fixed a debounce/navigation race by flushing pending index context before a row opens. Both full-page and intercepted views now use the parallel detail slot. A whole-workspace error hides its subordinate detail state, and query changes reset stale error boundaries.

Limits: browser QA used the Windows in-app browser rather than physical phones. Touch-edge swipe and OS reduced-motion changes were reviewed in code; they were not exercised on a physical device. Retry-state presentation was exercised with invalid scope data, not a forced upstream outage. GitHub artwork occasionally timed out; the implemented artwork fallback retained all reference content. This is a local implementation and has not been deployed.
