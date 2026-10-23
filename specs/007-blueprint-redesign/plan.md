# Implementation Plan: Blueprint Studio Visual Redesign

**Branch**: `007-blueprint-redesign` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-blueprint-redesign/spec.md`

**Approved**: 2026-10-22 by Lee Sinclair (Business Analyst), including the WebKit test browser and the CI change

## Summary

Give the editor two appearances, Blueprint Studio (default: navy surfaces, cyan drafting grid, ivory ink, amber
annotations) and Light, chosen with a header switch and remembered in the browser. The editor keeps its name, its
behaviour and its output. Colours, faces, spacing and motion come from one pure token module that feeds both the MUI
theme and CSS custom properties. Canvases get a pan- and zoom-aligned 16/80 px grid that takes no pointer events. Mermaid's own
drawings are themed through a single Mermaid runtime. The read-only source view gets a pure highlighter. The workspace
gets a status bar and narrow and compact layouts. Sequence and C4 canvases get touch pan and pinch, and a new touch suite
runs on emulated Android Chrome and iOS Safari. No dependency is added.

## Technical Context

**Language/Version**: TypeScript ~6.0, strict, ES2022 (unchanged)

**Primary Dependencies**: React 19, React Router 8, `@mui/material` ^9.5 (with Emotion), `@xyflow/react` ^12.12,
`mermaid` ^12.2 (all unchanged). No new dependency (research R1, R4, R6).

**Storage**: Diagrams in IndexedDB and the file format unchanged. One new `localStorage` entry for the appearance
preference (data-model).

**Testing**: Vitest (`npm test`) for the pure modules; Playwright desktop projects `chromium`, `firefox` (existing
suite plus new desktop tests); new Playwright projects `mobile-android` (Pixel 7, Chromium) and `mobile-ios` (iPhone 15,
WebKit) running only `e2e/touch/`; axe through `@axe-core/playwright` (research R9).

**Target Platform**: Current stable desktop Chromium and Firefox (unchanged), plus Chrome on Android and Safari on iOS
(new, verified in emulation only).

**Project Type**: Web application, client-only single-page app (unchanged)

**Performance Goals**: No regression in the existing timing tests (SC-007); the grid adds at most two background layers
per canvas; appearance switch re-renders in under 100 ms on a 100-item diagram.

**Constraints**: Constitution layers kept; no network request after load; WCAG 2.2 AA contrast and focus in both
appearances; transitions ≤ 200 ms and none under reduced motion; page usable without sideways scroll from 360 px.

**Scale/Scope**: About 7 new pure modules (tokens, appearance preference, Mermaid runtime, highlighter, grid, pinch,
layout), changes to the root, the editor layout, toolbar, source panel, three canvases and the Mermaid callers; about
15 new text strings; 2 new Playwright projects with a touch suite of about 6 files; one CI line.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Visual model is the source of truth | Source view stays read-only (highlighting only). The appearance is a preference, not model state, and is never stored in diagrams or files; it is read from storage as untrusted and validated. | Pass |
| II. Layered architecture | Model, validation, generation and history are not touched. New pure modules sit in the rendering layer (`app/rendering/theme`, `app/rendering/shared`) and the persistence folder, importing nothing from later layers. | Pass |
| III. Test-first | Every obligation below is run Red before Green through `tdd_check.py run`. Existing tests that assert old colours, if any, change only through recorded expectation changes. | Pass |
| IV. Invalid operations never corrupt | No editing operation changes; layout and gesture changes never commit an operation, except through the existing operations. | Pass |
| V. Undoable, consistent, honest feedback | Appearance switching is not an editing operation, so it is not in undo history and changes no diagram. Status keeps its texts; error, notice and success states gain colour and keep their text. | Pass |
| Scope constraints | No diagram type, source editing or export added. Mobile browser support is added by this feature's Clarifications (ADR 0002) and named in constitution 1.4.0, which also requires automated verification of each supported browser (the touch suite on both mobile profiles), with no server component. No dependency added. | Pass |

Re-check after Phase 1 design: unchanged, all pass. Nothing goes in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/007-blueprint-redesign/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── workspace-ui.md
│   └── presentation-modules.md
├── tests/
│   └── behaviour-checklist.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── root.tsx                          # appearance provider, two MUI themes, CSS variables, focus and motion styles
├── rendering/
│   ├── theme/
│   │   ├── tokens.ts                 # NEW pure: token sets, CSS variables, MUI options, contrast ratio
│   │   └── AppearanceSwitch.tsx      # NEW header switch
│   ├── shared/
│   │   ├── mermaidRuntime.ts         # NEW: the single Mermaid initialise and the per-appearance look
│   │   ├── MermaidPicture.tsx        # loads Mermaid through the runtime
│   │   ├── highlight.ts              # NEW pure: source highlighting runs
│   │   ├── grid.ts                   # NEW pure: grid spacings for a zoom
│   │   ├── pinch.ts                  # NEW pure: pinch zoom
│   │   ├── layout.ts                 # NEW pure: wide / narrow / compact
│   │   ├── touchPan.ts               # NEW: touch pan and pinch on SVG canvases
│   │   ├── SourcePanel.tsx           # highlighted, state-coloured status
│   │   ├── StatusBar.tsx             # NEW: zoom, save status, source check
│   │   ├── Toolbar.tsx               # compact "More actions" menu
│   │   ├── canvas.css                # tokens for colours, transitions
│   │   └── viewport.ts               # exposes zoom changes; pinch entry point
│   ├── flowchart/                    # Background grid layers, tokenised node and edge colours
│   ├── sequence/, c4/                # grid background, touch pan and pinch
│   └── import/                       # pictures redraw on appearance change
├── editor/
│   ├── Editor.tsx                    # header, tools panel, status bar
│   ├── mermaidParser.ts, mermaidSnapshot.ts   # load Mermaid through the runtime
├── persistence/appearance.ts         # NEW: read and write the preference, validated
└── text/en.ts                        # new strings

e2e/
├── appearance.spec.ts, grid.spec.ts, status-bar.spec.ts, narrow-layout.spec.ts, source-highlight.spec.ts,
│   mermaid-look.spec.ts, interaction-states.spec.ts   # NEW desktop tests
├── wcag.spec.ts, canvas-wcag.spec.ts, import-wcag.spec.ts   # extended to both appearances
└── touch/                            # NEW touch suite, mobile projects only
playwright.config.ts                  # mobile-android, mobile-ios; desktop projects ignore e2e/touch; redesign timing file joins TIMING
.github/workflows/pages.yml           # install webkit with the other browsers
```

**Structure Decision**: The existing single-project layout. New pure modules go beside the rendering code they serve
(the constitution's rendering layer); the preference adapter goes in `app/persistence` with the other storage access.

## Complexity Tracking

No violations to justify.

## Verification Plan

### Verification commands

| ID | Command | Scope | Source |
|----|---------|-------|--------|
| unit | `npm test -- {select}` | focused | package.json script `test` (Vitest) |
| unit-all | `npm test` | broad | package.json script `test` (Vitest) |
| e2e | `npm run test:e2e -- --project=chromium --project=firefox {select}` | focused | package.json script `test:e2e` (Playwright desktop projects in `playwright.config.ts`) |
| e2e-timing | `npm run test:e2e -- --no-deps --project=chromium-timing --project=firefox-timing {select}` | focused | package.json script `test:e2e`; the timing projects of `playwright.config.ts`, run alone with `--no-deps` so the desktop suite is not run again (feature 006, DN-01) |
| e2e-touch | `npm run test:e2e -- --project=mobile-android --project=mobile-ios {select}` | focused | package.json script `test:e2e`; mobile projects added to `playwright.config.ts` by this feature (research R9) |
| e2e-all | `npm run test:e2e` | broad | package.json script `test:e2e` (every Playwright project, timing projects included) |

### Verification obligations

| ID | Requirements | Scenario | Expected outcome | Level | Origin |
|----|--------------|----------|------------------|-------|--------|
| VO-001 | FR-001, FR-002 | Both token sets are read | Each appearance defines every token group of the data model; Blueprint Studio holds `#071C30`, `#0D2B45`, `#174565`, `#72D7F2`, `#F1E9D7`, `#E8AD63`, `#A9C0D0` in their named roles, plus an error red and a success colour | unit | planned |
| VO-002 | FR-001, SC-004 | Every source file under `app/` other than the token module and tests is searched for colour values (hex, `rgb()`, `hsl()`, named colours in style props) | None is found | unit | planned |
| VO-003 | FR-002, FR-004, FR-020, EC-08, EC-09 | Every pair in the data model's contrast rules is measured, for both appearances | Each meets its minimum (4.5:1 text, 3:1 focus and boundaries); amber is the warning token and red the error token in both sets | unit | planned |
| VO-004 | FR-020, SC-003, EC-07, EC-08, EC-09, EC-11 | Axe checks run on the start page, each diagram type's editor with an item selected, with a notice shown, the import dialog with a parse error, and each editing dialog, in Blueprint Studio and in Light | Zero colour-contrast and focus violations in every case | end-to-end | planned |
| VO-005 | FR-003, FR-025, SC-008 | The editor is loaded, used and switched between appearances with network requests recorded | Zero requests after load; interface text is set in the sans-serif stack and source text in the monospace stack, both system fonts | end-to-end | planned |
| VO-006 | FR-018, US3-AS3, EC-06 | The source status is mapped to its presentation for checking, valid, notice and invalid (with a reason) | Invalid gives the error tone with the reason in text, notice the warning tone with its text, valid the success tone, checking the muted tone; every tone has text | unit | planned |
| VO-007 | FR-018, FR-004, US3-AS3 | A diagram with a notice (C4) and a valid diagram are shown | The notice status text is drawn in the warning colour and the valid status in the success colour, each with its words | end-to-end | planned |
| VO-008 | US1-AS1 | The start page is opened with no stored preference | It shows "Mermaid diagram editor" and its surfaces and text use the Blueprint Studio background, panel and ivory colours and the interface faces | end-to-end | planned |
| VO-009 | FR-005, FR-006, US1-AS2 | A diagram of each type is opened at 1440 × 900 | The header holds the application name, diagram name with Rename, Copy Source, Copy for Markdown, Save file, Undo, Redo and the Appearance switch; the canvas region is the largest region and covers at least half the window | end-to-end | planned |
| VO-010 | FR-009, FR-023, US1-AS3 | The named controls of each diagram type's editor are listed at 1440 × 900 | They are the pre-redesign controls (same roles and names) plus only the Appearance switch buttons, and every new control has an accessible name and a working effect | end-to-end | planned |
| VO-011 | FR-026, US1-AS4 | With an item selected, a label draft open and an undoable edit made, the other appearance is chosen in the header | Page, panel, toolbar and canvas surfaces change to the other token set at once; the selection, draft text, Undo availability and the source text are unchanged | end-to-end | planned |
| VO-012 | FR-021, FR-022, US1-AS5, EC-10 | A toolbar button is hovered, focused by keyboard, pressed and disabled; then the page is idle; then reduced motion is emulated | Each state has a distinct computed style; transition durations are at most 200 ms; no animation is running when idle; under reduced motion every transition duration is 0 | end-to-end | planned |
| VO-013 | FR-026 | Stored preference values `"light"`, `"blueprint"`, missing, `"dark"`, a number, and a storage that throws on read and on write are read and written | `"light"` gives Light, everything else Blueprint Studio; no read or write throws, and a failed write is reported as not saved | unit | planned |
| VO-014 | FR-026 | Light is chosen and the page reloaded; then the stored value is replaced with an unknown value and the page reloaded; then a diagram is saved to a file and copied in each appearance | The reload opens in Light; the unknown value opens in Blueprint Studio with no error shown; the saved files and copied texts are identical across appearances and hold no appearance value | end-to-end | planned |
| VO-015 | FR-011, EC-04 | Grid spacings are computed at zoom 1, 2, 0.5 and 0.25 | 16/80, 32/160 and 8/40 px; at 0.25 the minor grid is omitted and the major is 20 px | unit | planned |
| VO-016 | FR-011, US2-AS1 | Each diagram type's canvas is shown at zoom 1, in Blueprint Studio and in Light | A minor grid at 16 px and a major grid at 80 px are drawn on the canvas surface in the appearance's grid colours, the major more opaque than the minor | end-to-end | planned |
| VO-017 | FR-013, US2-AS2, EC-04, EC-05, SC-006 | An item's offset from the nearest grid line is measured, then the canvas is panned (flowchart) or scrolled (sequence, C4) and zoomed to its minimum, default and maximum | After each step the item keeps its offset from the grid, scaled by zoom, to within 1 px; at minimum zoom only the major grid shows | end-to-end | planned |
| VO-018 | FR-012, US2-AS3 | Points of each canvas that show only grid are hit-tested, and the grid's elements are counted on a small and a large canvas | The topmost element at those points is never part of the grid; the grid uses the same small, fixed number of elements on both canvases and runs no animation | end-to-end | planned |
| VO-019 | FR-015, US2-AS4, EC-07 | In each diagram type an item is hovered, then selected | Unselected items are drawn in the canvas ink and node fill; hover shows the dashed outline; the selected item's outline is in the selection colour and wider than an unselected one's, and differs from the hover outline | end-to-end | planned |
| VO-020 | FR-015, US2-AS5 | A line is being drawn from a flowchart node, a sequence lifeline and a C4 element over valid ends | Valid ends show the thin dashed ring and the end under the pointer the thick solid ring, both in the canvas palette; the line preview is visible in the canvas ink | end-to-end | planned |
| VO-021 | FR-016, FR-023, FR-024, SC-001, SC-007 | The complete existing unit suite and desktop end-to-end suite, timing tests included, are run after the redesign | Every test that passed in the baseline passes; any changed expectation is recorded and approved | other | planned |
| VO-022 | FR-017, US3-AS1 | Highlighting runs are produced for every corpus document, generated source of each type, and arbitrary strings including unterminated quotes and `%%` comments | The runs' texts joined equal the input exactly; keywords, identifiers, quoted labels, arrows and comments are given their own kinds | unit | planned |
| VO-023 | FR-017, US3-AS1 | The source view of each type is expanded and Copy Source used | The view's text equals the copied text character for character, is in the monospace face, shows at least keyword, string and operator runs in distinct colours, and typing into it changes nothing | end-to-end | planned |
| VO-024 | US3-AS2 | An edit, an Undo and a Redo are made with the source view expanded | After each, the source view shows the newly generated source | end-to-end | planned |
| VO-025 | FR-019 | The Mermaid configuration is built for each appearance | Blueprint Studio: base theme whose variables are the token values in the data model; Light: Mermaid's default theme; both keep the strict security level | unit | planned |
| VO-026 | FR-019, US4-AS1 | The flowchart preview is opened in Blueprint Studio for a diagram with every node shape | Nodes are filled with the node fill, outlined in cyan, labelled in ivory, and lines drawn in the canvas ink; each shape has the same outline as Mermaid draws it in Light | end-to-end | planned |
| VO-027 | FR-019, US4-AS2 | With the preview open in Blueprint Studio, Light is chosen | The preview is redrawn in Mermaid's default look without being closed | end-to-end | planned |
| VO-028 | FR-019, US4-AS3 | In Blueprint Studio the drawing function is given source with `style A fill:#ff99ff` and a `classDef` applied to node B (decision DN-01: no editor screen draws such source, because import drops styles) | A is drawn with `#ff99ff` and B with the class's fill, while other nodes use the blueprint fill | end-to-end | planned |
| VO-029 | FR-019, FR-024, US4-AS4 | A diagram of each type is copied as source and as Markdown and saved to a file in Blueprint Studio and in Light | The copied texts equal the generated source (and its Markdown fence) and hold no theme or init directive; files and texts are identical across appearances | end-to-end | planned |
| VO-030 | FR-007 | At 1440 × 900 a diagram of each type is opened and an item selected | The tools area shows that type's toolbox and the selected item's properties | end-to-end | planned |
| VO-031 | FR-008 | The canvas is zoomed with the buttons and the wheel, and an edit is made | The status bar shows "Zoom n%" following each change, the "Save status" region with its texts, and the source check text; it has no grid or snap control | end-to-end | planned |
| VO-032 | FR-010 | Widths 1440, 900, 899, 600 and 599 px are classified | Wide, wide, narrow, narrow, compact | unit | planned |
| VO-033 | FR-010, US5-AS1 | The editor is opened at 800 × 900 and at 360 × 740 | A labelled "Tools" control opens the toolbox and properties, the labelled "Mermaid source" disclosure opens the source view, and with both closed the canvas covers at least half the window | end-to-end | planned |
| VO-034 | US5-AS2 | At 800 px the Tools panel is opened, a label draft typed in Properties, and the panel closed | The selection and the draft text are kept, and the canvas's zoom and position are unchanged | end-to-end | planned |
| VO-035 | FR-010, US5-AS3, SC-005 | The editor of each type is shown at 360, 768 and 1440 px wide | The page never scrolls horizontally, and every pre-redesign control is reachable and works (through "More actions" at 360 px) | end-to-end | planned |
| VO-036 | FR-027, US5-AS4, SC-009 | On emulated Android Chrome and iOS Safari, a flowchart is created and edited by touch: add nodes by tapping the toolbox, connect by dragging a handle, move, rename by double-tap, delete, Undo, Redo | Each operation has the same result as on desktop, and the generated source reflects it | end-to-end | planned |
| VO-037 | FR-027, US5-AS4, SC-009 | On both mobile profiles, a sequence diagram and a C4 diagram are created and edited by touch: add, connect, reorder or move, rename, delete, Undo, Redo | Each operation has the same result as on desktop | end-to-end | planned |
| VO-038 | FR-027, US5-AS4, SC-009 | On both mobile profiles, a diagram is saved to a file, opened from a file, copied as source and as Markdown, and the appearance switched, by touch | The file is offered and reopens the same diagram; each copy reports success only when the text reached the clipboard and otherwise reports the failure; the appearance changes | end-to-end | planned |
| VO-039 | FR-027 | On both mobile profiles every control and handle in the editor of each type is measured | Every target is at least 24 × 24 CSS px and every connection handle's hit area at least 28 px, as on desktop | end-to-end | planned |
| VO-040 | FR-028 | Pinch zoom is computed for growing and shrinking finger distances, past both limits, and with a zero start distance | The zoom scales by the distance ratio and stays within the limits; a zero start distance leaves the zoom unchanged | unit | planned |
| VO-041 | FR-028, SC-009 | On both mobile profiles, in each diagram type: one finger drags across empty canvas, two fingers pinch apart and together, and an item is double-tapped | The drawing pans or scrolls by the drag; the drawing's zoom grows and shrinks within the zoom buttons' limits while the page's own scale stays 1 and the header keeps its size; the double-tapped item opens for renaming | end-to-end | planned |
| VO-042 | FR-026 | Storage that refuses writes is in place and the other appearance is chosen | The appearance changes for the session and a notice says the choice could not be saved for next time; no notice appears when saving succeeds | end-to-end | planned |
| VO-043 | FR-028 | On both mobile profiles, a sequence participant and a C4 element are dragged by one finger and a second finger touches down and moves mid-drag | The drag continues to its end with the usual result and the zoom is unchanged | end-to-end | planned |
| VO-044 | SC-002, FR-024, US4-AS4 | Every import corpus document and every valid end-to-end fixture diagram is turned into generated source, copied Markdown and saved-file content, and compared with snapshots taken from the code at the baseline, before any change | Each is byte-identical to its snapshot | unit | planned |
| VO-045 | SC-007, EC-01 | On a flowchart, a sequence and a C4 diagram of 100 elements and 150 relationships, 20 node drags, 20 pans (scrolls for sequence and C4) and 10 zoom steps are timed in the timing projects, on the baseline and on the redesigned build | The median time of each action is within 10 % of its baseline median; in Firefox, scrolling a sequence or C4 diagram, and any action whose baseline median is under 100 ms, may take one extra frame (1000/60 ms) more | end-to-end | planned |

### Verification exemptions

| Requirement | Reason | Alternative verification |
|-------------|--------|--------------------------|
| FR-014 | Conditional requirement not triggered: no drafting border or registration mark is added (research R4) | Review of the diff that no such decoration is added |

### Manual verification

| ID | Covers | Steps | Expected result | Why not automated |
|----|--------|-------|-----------------|-------------------|
| MV-001 | EC-01, EC-02, EC-03, SC-006 | In each appearance open a flowchart, a sequence and a C4 diagram of 100 elements and 150 relationships, with long and labelled connections; view each at minimum, default and maximum zoom | Every label and line is readable and stands out above the grid; long labels wrap or truncate as before | Readability is a visual judgement |
| MV-002 | FR-025 | Review the diff of `package.json` and `package-lock.json` | No runtime or development dependency is added | A review of what was and was not added |
| MV-003 | FR-001, US1-AS1 | Walk through the quickstart's manual steps in both appearances | The editor reads as one consistent, professional Blueprint Studio identity with no stray default styling | A judgement of visual consistency |

### Behaviour checklist

Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).
