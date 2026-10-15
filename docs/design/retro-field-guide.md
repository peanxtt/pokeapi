# Retro field guide

## Outcome and scope

Redesign the anonymous Pokédex as a clean, spacious reference product. The editable review surface is the connected Penpot file `PokeAPI`. Retain the original migrated draft, and build the new direction on a separate page. Do not change application code during concept design.

Use the supplied historical visual reference for palette, physical panel depth, and geometry. Its original dense desktop layout and tiny controls conflict with the user's explicit preference for breathing room and are not carried forward. Use only Pokédex vocabulary; do not reproduce unrelated brand names, slogans, logos, mascots, or account flows.

## Palette

| Role          | Hex     | Application                                             |
| ------------- | ------- | ------------------------------------------------------- |
| Chassis       | #7A8ABA | Page background and structural frame                    |
| Sky           | #9FBEE7 | Secondary scope strip                                   |
| Lavender      | #ACACE7 | Species artwork plate                                   |
| Ice           | #C0D5E6 | Selected rows, field edges, secondary controls          |
| Raised plate  | #8BA1D4 | Utility panels                                          |
| Indigo edge   | #3D4F97 | Crisp bevel shadow and secondary text on light surfaces |
| Muted indigo  | #60619C | Inactive metadata on light surfaces                     |
| Platinum      | #DEDEDE | Index inset                                             |
| Tinted white  | #F7F8FC | Content and input surfaces                              |
| Carbon        | #21242E | Main navigation and primary text                        |
| Hairline      | #5A5F8C | Panel boundaries                                        |
| Amber         | #ECAB37 | Active region and primary utility control               |
| Signal orange | #F68D1F | Small directional and selection accents                 |
| Red           | #E60012 | Errors; reserve for exceptional states                  |
| Teal          | #206479 | Stat bars and small analytical accents                  |

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

### Catalog loading and skeleton corrections

Outcome: return the first 40 species resources promptly, append another batch near the end of the list, and align placeholders with the real row and header geometry. The full lightweight species index supports scoped search, accurate counts, selection and Next navigation. Type membership is fetched through the existing server adapter before pagination, so filtering remains correct beyond the loaded rows. Browser code requests app-owned pages through a validated route handler; it does not call PokéAPI directly.

- [x] Reproduce eager resource fetching and skeleton overflow with focused checks.
- [x] Add server pagination and full-scope name/type filtering, with request bounds and cached type resources.
- [x] Append pages on scroll with a Load more fallback, cancellation, retry and browse restoration.
- [x] Share actual row geometry with skeletons and match the catalog controls.
- [x] Verify page boundaries, filtered counts, stale requests, browser navigation, layout and production checks.

Risks: filtering only loaded rows would hide valid results; late responses must not append to a different query; restoring a deep browse position needs its prior batches; loading indicators must not push the rows down. Tests will count resource requests rather than rely only on a warm API cache.

Verification: 22 Vitest checks, ESLint, TypeScript and the production build pass. Resource-count tests reproduce the former 120-resource eager load and prove the corrected first page fetches only 40. Coverage includes offset boundaries, final partial pages, searching outside the first page, OR type membership, counts without Pokémon resource requests, malformed API requests, cancellation, duplicate/stale page rejection and Next navigation through the lightweight index.

Browser checks confirm All generations begins with 40 of 1,025 rows and appends batches near the list end. Global search finds Terapagos; Grass OR Fire counts 207 matches. Rapid query changes, including trailing whitespace during a pending search, finish with only the current results. A temporary single-request 503 preserved 80 loaded rows; Try again appended the next page. The fault and loading inspection route were removed before the production build.

At 1440 and 390px, skeleton and loaded rows share the same measured artwork/text positions and 95.994px row height; the malformed first text placeholder changed from 80px to 16.491px. The 320px skeleton has no horizontal overflow or text escaping its row. Mobile scrolling appends 80 rows; opening Zubat, refreshing the detail, and returning rebuilds the prefix, focuses Zubat and restores the recorded 4478.182px browse position. Screenshots are saved as `qol-skeleton-{desktop,mobile,320}.jpg` in the session visualization directory.

The local production All response contains 40 rows and 241,051 bytes versus the previous 516,937 bytes. One local response measured 526ms versus the earlier 4205ms; these are illustrative cached local measurements, not a cold-network benchmark or deployment guarantee. Production navigation also verified that searching for Terapagos dismisses an excluded Bulbasaur detail and reset returns to the national list. The clean production loading screenshot is `qol-production-loading.jpg`. Browser QA used the Windows in-app browser with viewport overrides, not physical phones. No dependency was added.

### Real-route verification and sensory preferences, 2026-10-15

Outcome: reproduce the deployed loading transitions with Playwright, reduce unnecessary work on species selection, and design sound, artwork style and type colors in Penpot before implementing those new preferences. Existing uncommitted catalog changes remain part of this working tree.

- [x] Inspect the deployed route markup and CSS, then compare with a fresh local production build.
- [x] Measure the detail request path, remove serial dependencies and unnecessary catalog work, and warm only intentional navigation targets.
- [x] Verify real catalog/detail loading layouts against settled geometry on desktop and phone widths, including slow requests and reduced motion.
- [x] Create Penpot screens for sound on/off, artwork/pixel style, 18 classic types plus Stellar, responsive layouts, both themes, fallbacks and motion rules.
- [x] Export and inspect the new design boards, record handoff references, and present the QoL design for review before feature implementation.
- [x] Run regression tests, lint, TypeScript and a production build; review and record the final diff.

Design assumptions: keep the approved field-guide composition. Sound defaults on and persists beside Theme; a species selection plays one cry when the new detail is ready, stops the previous cry and offers replay when browser autoplay is unavailable. Artwork style uses Black/White pixel sprites where present and the API's regular sprite for newer species, with an explicit artwork fallback. Style and shiny remain distinct. Type colors are semantic labels in both themes, including row text and detail badges, and never the only identifier. These QoL features are design-only until the design review.

Risks: the currently deployed assets still include the old `.skeleton:first-child` rule. Local verification alone cannot establish a deployed correction. Intent prefetch must not eagerly request every species. Audio must handle browser playback restrictions and missing files. A Black/White sprite cannot exist for species introduced later; the design must expose its fallback accurately.

Verification: a fresh local production build uses the role-specific skeleton styles while the deployed CSS still contains the legacy first-child rule. Real Playwright route tests found and corrected a 21px phone catalog shift caused by hydration-dependent intro copy and a 34px narrow detail shift caused by a wrapping metadata/Next header. CSS now selects responsive copy before hydration, and detail placeholders share the loaded header's geometry. Catalog artwork, identity and row dimensions and direct-detail artwork/form offsets match the settled view within 1px at 1440, 390 and 320px. Night with reduced motion also passes.

The detail adapter reuses the selected Pokémon resource by canonical resource ID and runs independent variant, evolution and ability work concurrently. Shared detail context loads the lightweight catalog index rather than fetching 40 Pokémon resources again. Pointer/focus intent enables route prefetch without fetching every visible row. During a blocked subsequent navigation, Playwright confirms the current detail remains visible. A stable detail slot replaces the route-level exit wrapper that retained duplicate panels; content entry and artwork transitions remain.

Twenty-four Vitest tests pass, including regressions for concurrent detail work, resource reuse and lightweight navigation context. Nine Playwright scenarios pass across the four configured viewport/theme projects; the desktop pointer case is intentionally skipped in the three phone projects. The production build, TypeScript, ESLint and final diff whitespace check pass. Browser checks use Windows Edge in headless mode with slow-network emulation, not physical phones.

The user explicitly chose **Review the designs first**. The three new preferences remain design-only. See [the sensory preference brief](sensory-preferences.md) and [the native Penpot manifest](penpot-qol-manifest.json). The new review page is selected; its 18 responsive main screens, two state examples, eight native control assets, 76 type tokens and representative flows were verified. A named version preserves the reviewed file. Inherited prototype links that led to old screens were corrected after the user reported that the new UI was hard to find. No local changes have been pushed or deployed during this work.

### Approved preference implementation, 2026-10-15

The user subsequently approved implementation with circular type symbols. Sound now appears only beside Theme, defaults on, persists and plays one selected-species cry. Selecting another species, muting or leaving detail stops the previous clip. Initial direct entry, shiny, theme and image-style changes stay quiet. The top-bar control can retry blocked playback; missing audio preserves reference content.

Artwork/Pixels is a persistent guide-wide choice across catalog, detail and evolution. Black/White sprites fall back to regular sprites and artwork, including failed image requests, with accurate source captions. All 19 types have locally served circular symbols and centered rounded pills with distinct Light/Night colors. Loading controls and row/tag geometry match the updated UI. Existing pagination and scoped browsing behavior remain.

Twenty-eight unit tests, TypeScript, ESLint, the production build and the diff whitespace check pass. Playwright passes 20 scenarios; 12 intentional phone-project skips avoid repeating shared desktop audio/pointer/six-width checks. The suite covers real audio-engine playback, cancellation, persistence, blocked-playback retry, sprite fallbacks, 1920/1440/1024/768/390/320px layouts, Night/reduced motion and real route fallback geometry. Fallback tests hold their actual SSR completion boundary in the browser response, avoiding unreliable sampling of a brief warm-cache loading frame. The resource-cache keys were versioned after testing exposed old validated objects without the new media fields.

Fresh browser images are saved in the session visualization directory as preferences-implemented-desktop.png, preferences-implemented-320.png, preferences-implemented-night.png and preferences-live-preview.png. The local production preview runs on port 3004. The final circular-frame sync in Penpot is unverified because its MCP plugin suspended; the website's circular clipping and control alignment are verified. No commit, push or deployment was performed.
