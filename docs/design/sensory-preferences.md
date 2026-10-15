# Sound, image style and type colors

Status: the approved preference design and loading fixes were committed and pushed on 2026-10-15. The subsequent volume setting is implemented and verified; deployment of that addition is not verified.

## Implementation plan

Outcome: ship the approved preferences through the existing server-only data adapter and responsive component system.

- [x] Validate optional cries and versioned sprites, then expose app-owned image and cry fields without extra Pokémon requests.
- [x] Add persistent Sound and image-style preferences, deliberate selection playback, cancellation, missing-media handling and keyboard-accessible controls.
- [x] Apply circular type symbols, semantic colors, compact rounded pills and centered control content throughout catalog, details, evolution and filters.
- [x] Match loading placeholders to the revised controls and verify desktop/phone layouts, persistence, audio, sprite fallbacks and reduced motion with Playwright.
- [x] Run unit tests, lint, TypeScript, production build and final diff review; document results and deployment status.
- [ ] Verify the final circular-icon frame update in Penpot after its plugin reconnects. The website's circular icons are implemented and verified.

Risks: initial hydration must not play audio; the previous cry must stop on navigation/mute; shiny, theme and image-style changes must not replay it; newer species need accurate sprite fallback labels; new controls must fit 320px without moving loading geometry.

## Review revision: compact pills and alignment

Outcome: refine the new Penpot screens and their native components. The user subsequently approved this revision for implementation.

- [x] Confirm official type-symbol availability and add compact symbols with readable type labels.
- [x] Use centered, content-width type pills with 6px horizontal padding and fully rounded corners.
- [x] Remove artwork sound/replay controls, retaining only the top-bar sound toggle and consistent fallback guidance.
- [x] Center icon-and-text groups within controls and audit pills, buttons and compact card elements across all new responsive screens and themes.
- [x] Inspect fresh representative native exports, validate geometry, save a named revision and update the handoff.

Assumptions: preserve left-aligned species descriptions, data labels and prose for reading. Center the content of individual controls and pills, including icon-and-label combinations. Compact type pills are informational; interactive filters retain 44px targets. Earlier pre-QoL screens remain historical references.

## Where to review

Open the **PokeAPI** Penpot file and select **06 / Sound + pixels + type colors**. The selected review board compares Light artwork and Night pixel treatments. The page also contains the native component palette, fallback states, motion guidance and the compact image-style menu.

The full responsive screens are in **02 / Responsive screens**, below the previous designs. Their names start with **QoL / …**. There are 18 main compositions across 1920, 1440, 1024, 768, 390 and 320px in both themes, plus a 390px Pixels detail and Sound off browse example. The six smaller layouts provide separate browse and detail views. Exact IDs, colors and native component references are in [the manifest](penpot-qol-manifest.json).

In Present mode, select a flow starting with **QoL /**:

- **Light desktop 1440**: theme comparison with the new controls.
- **Night browse 390**: browse → Bulbasaur detail → back, with theme counterparts.
- **Small phone 320**: compact browse/detail and theme counterparts.
- **Sound on ↔ off**: representative sound-control state change.
- **Artwork ↔ Pixels**: representative image-style state change.

Copied links to the previous design screens and invalid cross-page menu links were removed or redirected. These are illustrative flows, not a simulation of persistent application state or audio playback. The menu is a static component-state reference. The saved version **QoL review v2: centered controls, rounded type pills, top-bar sound** preserves the approved control and pill revision.

## Sound

Place Sound immediately beside Theme. Use a labeled control on desktop and a 44px icon target on narrow phones. The control opens a compact menu with mute and a native 0–100% cry-volume slider. Sound defaults on at 45% volume, matching the original playback level. Persist volume separately from mute and theme, including a saved zero. Adjust current playback immediately without restarting it; changing volume while muted keeps sound off. A deliberate species selection plays one cry after its detail is ready. Stop the previous cry on selection or mute. Changing theme, image style or shiny appearance must not replay it. Initial page entry remains quiet until user interaction.

Volume follow-up:

- [x] Add saved volume to the shared audio controller, including bounded storage values and live playback updates.
- [x] Reuse the top-bar popover pattern for mute, a labeled 44px-height slider and percentage readout, with keyboard support and narrow-screen containment.
- [x] Verify volume changes, persistence, mute independence and the revised controls in the production browser build; run relevant checks.

The top bar is the only sound-control location. Do not place Sound or Replay cry on the artwork. Enabling Sound with a selected species can play its current cry once, providing a deliberate retry after browser playback rejection. Keep a blocked-playback hint with the top-bar control; the next deliberate species selection or an off/on toggle can retry. A missing cry leaves the global preference intact and shows a noninteractive availability hint. The [official PokéAPI Pokémon schema](https://pokeapi.co/docs/v2#pokemon) exposes `cries.latest` and `cries.legacy`; the future implementation can map a validated optional URL through the existing server adapter.

## Image style

Keep the official artwork as the default. Offer **Artwork / Pixels** as a guide-wide choice, with a compact menu trigger in the browse toolbar and labeled options in detail. Shiny remains a separate appearance choice.

Use static **Black/White front sprites** for the nostalgic treatment. PokéAPI exposes them under `sprites.versions["generation-v"]["black-white"].front_default`. Newer species use the API's regular sprite; if that is missing, use artwork and label the actual source. Do not imply a legacy version exists for species introduced later. Preserve a fixed artwork stage and crisp pixel scaling.

## Type colors and motion

The palette covers the 18 classic types plus Stellar, with separate foreground/background pairs in Light and Night. Use the official Scarlet/Violet type symbols beside readable labels. The [official type response](https://pokeapi.co/api/v2/type/fire/) includes version-specific `name_icon` and `symbol_icon` URLs under `sprites`; the Black/White version supplies a type-name graphic, while Scarlet/Violet also supplies a separate symbol. All 19 Scarlet/Violet symbols, including Stellar, were verified and imported into Penpot.

Type pills fit their content with 6px horizontal padding, a centered icon-and-label group and fully rounded corners. Standard pills are 28px tall with 14px icons and a 6px gap. Compact catalog pills are 24px tall with 12px icons and a 4px gap. Both use 12px labels. Interactive type filters retain 44px targets. Preserve readable names, distinguish dual types and supplement selected filters with a checkmark and outline. The 38 badge color pairs have a minimum calculated contrast of 5.17:1. There are 76 type color tokens.

Controls use 160ms feedback, images a 180ms opacity transition and theme colors 200ms. Keep detail content visible while a subsequent selection is pending. Reduced motion removes spatial travel and skeleton pulses. Reserve image dimensions so art changes do not shift content. The states board documents autoplay rejection, unavailable cry, unavailable sprite and the image-style transition.

## Verification

Native PNG exports of the revised review board and 320px Night catalog were inspected. Geometry checks cover 209 pills, 231 controls and 90 catalog rows, with no centering errors, overflow or number/name overlaps. The narrow header fits Sound beside Theme with 44px targets and 12px separation. Penpot file validation returned no errors before the circular-icon request. The final icon-clipping update could not be verified after the plugin stopped sending heartbeats; the full-height detail export also timed out. This limitation affects the design-file handoff, while the implemented website's circular icons were checked in the browser.

Twenty-eight unit tests pass. The production Playwright suite passes 20 scenarios, with 12 intentional skips for shared desktop-only audio/pointer/layout checks in phone projects. Coverage includes real browser audio playback, quiet initial entry, cancellation on selection/mute/exit, persistence after refresh, no cry on shiny/theme/style changes, blocked-playback retry, legacy-to-regular-to-artwork fallback, six viewport widths and Night with reduced motion. Loading checks retain the actual server-rendered fallback boundary in an intercepted test response, allowing outer slots to settle while its completion is held. The test-only response blocks hydration; no delay route or production testing hook was added.

The media resource cache keys were versioned because older cached validated records omitted the newly added fields. The nineteen official type symbols are served locally, and the palette covers all 19 supported types with at least 5.17:1 label contrast. Browser screenshots show the new controls, circular symbols, accurate source captions and stable artwork geometry. Physical phones and other browser engines were not tested.

The volume follow-up passes 16 relevant Playwright scenarios in Edge, with 12 intentional skips for checks shared across phone projects. The suite verifies actual slider pointer and keyboard input, updates to current and future audio, no replay on volume adjustment, quiet restoration, saved zero, muted volume changes, storage validation, Escape focus restoration, phone containment and the existing media behavior. Desktop, 320px Light and 390px Night screenshots were visually inspected. The 28 unit tests, ESLint, TypeScript and production build also pass. Volume verification used the local production build.
