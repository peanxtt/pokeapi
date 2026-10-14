# Penpot design handoff

Prepared on 2026-10-14. Review file: **PokeAPI**. File ID: `fd558256-f8c8-8184-8008-bf9fa9326cee`.

## Coverage

The redesign adds 55 editable boards. The original five-board migrated draft remains separate.

| Page | New boards | Contents |
| --- | ---: | --- |
| 02 / Responsive screens | 35 | Browsing, species detail, light/night adaptations, selectors, appearance, forms, disclosures, prototype examples |
| 03 / Loading + recovery | 13 | Initial selection, catalog/detail loading, scoped empty results, retry, missing species, artwork unavailable |
| 04 / Components + themes | 5 | Both component themes, palette/type/geometry, selectors, incomplete-data states |
| 05 / Motion + responsive rules | 2 | Timings, navigation storyboard, reduced motion and responsive behavior |

## Responsive matrix

| Width | Light | Night | Structure |
| --- | --- | --- | --- |
| 1920 | Desktop detail | Desktop detail | Centered 1384px workspace; generation rail, index, detail |
| 1440 | Desktop detail | Desktop detail | Three panes; dedicated first-selection example |
| 1024 | Desktop detail | Desktop detail | Generation selector replaces rail; index remains visible |
| 768 | Index and detail | Index and detail | List-first tablet navigation; dedicated detail composition |
| 390 | Index and detail | Index and detail | Single-column phone views; linked contextual examples |
| 320 | Index and detail | Index and detail | Narrow-phone adaptation; compact identity and readable controls |

Boards depict full scrollable content rather than fixed viewport heights. The production desktop workspace keeps independent index/detail scroll regions. Below 1024px, detail covers the index and Back restores the previous scope, query, filters and position. These are explicit responsive design snapshots, not a claim that fixed Penpot coordinates implement fluid runtime layout.

## Components and themes

49 native assets are grouped under `Field Guide` in the local component library:

- 24 primary/secondary buttons covering default, hover, focus, pressed, disabled and loading in both themes.
- 6 search fields covering default, focus and invalid input in both themes.
- 8 species rows covering default, hover, selected and loading in both themes.
- 5 selectors covering generation, all canonical type choices including Stellar, forms, theme and shiny appearance.
- 6 incomplete-data components covering a single form, missing shiny artwork, evolution, moves, description and type history.

The file contains 48 named palette tokens and 48 semantic aliases across Light and Night presets. Color roles keep the cool structure and amber controls consistent. There are seven native typography styles; screen compositions use DM Sans with IBM Plex Mono for numeric metadata.

Use primary ink for small text on the chassis. Light focus uses carbon, night focus uses sky. Disabled controls remain distinguishable and do not navigate. Essential type and status information is written out in labels.

## Content and domain behavior

- Gen I is the initial scope; All generations explicitly enables global name/number search.
- The index keeps national Pokédex order and exposes no sort control.
- Type choices combine with OR within the selected scope.
- Canonical species identity stays stable when the form changes; the selected variant is reflected in the URL.
- Shiny changes artwork, not types, stats, identity or list order.
- The Charizard example shows default and Mega X forms with distinct artwork, types, stats and ability presentation.
- Moves are grouped by learn method; the design does not require power/type fields absent from the current data model.
- Version details distinguish current canonical types from historical representations; a clear fallback covers no recorded changes.
- Artwork failure preserves the reference data; unavailable optional data never becomes a page-level failure.

## Motion and prototype examples

11 named flows cover phone/tablet browse and return, narrow-phone navigation, night browsing, desktop first selection, loading to ready, retry, All generations, form selection, appearance/disclosure, and reduced motion.

| Interaction | Duration | Intended production behavior |
| --- | ---: | --- |
| Control feedback | 160ms | Background feedback and a restrained pressed offset |
| Mobile detail / return | 240ms | Transform-based panel travel; preserve the mounted index |
| Desktop species selection | 180ms | Fixed-pane content crossfade |
| Shiny appearance | 180ms | Artwork crossfade only |
| Theme | 200ms | Token color interpolation, stable content position |
| Disclosure | 200ms | Reveal content without losing the section heading |
| Artwork ready | 160ms | Fade into reserved geometry |
| Skeleton | 1200ms | Subtle opacity pulse; no traveling shimmer |

Use ease-out quart in production and avoid bounce. Reduce motion removes panel travel and skeleton pulsing; use immediate changes or a short 100ms opacity transition. A dedicated prototype path demonstrates navigation without animation.

Penpot links are scripted design examples. They do not provide live search, data fetching, all species routes, browser history or OS theme detection. Board dissolves approximate some transitions; exact artwork-only crossfades, token interpolation, skeleton pulsing, focus/scroll restoration and keyboard semantics must be implemented in the website. The loading example reserves the same geometry as the loaded phone detail and automatically advances after 700ms for review.

## Verification and review limits

- Penpot referential-integrity validation returned no errors after the final changes.
- All new text bounds were checked for overflow and placement outside root boards.
- New interface copy was checked for unrelated reference-brand terminology; none was found.
- Representative mobile and component PNGs were inspected, alongside native SVG layout exports for desktop, tablet, narrow mobile, night theme, type selection and loading.
- The review corrected focus fill, narrow metadata, selector bounds, search-label contrast, alternate-form data and scope restoration.

Large raster exports repeatedly timed out on the Penpot export service. Local review PNGs rendered from native SVG preserve geometry but use a system-font fallback and cached artwork. They serve layout QA; the editable Penpot file is authoritative for typeface and artwork fidelity. Native PNG exports are authoritative where available.

Board IDs, dimensions, native asset IDs, palette values and design QA results are recorded in `penpot-manifest.json`. The user subsequently approved implementation. The website now implements this direction; local runtime checks and remaining test limits are recorded in `retro-field-guide.md`.
