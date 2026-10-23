---

description: "Task list for the Blueprint Studio visual redesign"
---

# Tasks: Blueprint Studio Visual Redesign

**Input**: Design documents from `specs/007-blueprint-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/workspace-ui.md,
contracts/presentation-modules.md, tests/behaviour-checklist.md

**Tests**: Required. Every obligation in the plan's Verification Plan has a test task before its behaviour task
(integrated TDD). Run every test through `tdd_check.py run`.

**Organization**: Setup, a foundational phase (tokens, appearance and root wiring, which every story draws on), one
phase per user story in priority order, then polish.

## Format: `[ID] [P?] [Story] [Label] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: The user story the task belongs to (US1 to US5)
- **[Label]**: `[VO-nnn]` for the obligation it satisfies, or `[NT: reason]`

## Path Conventions

Web app, client only. Pure modules and their Vitest tests side by side (`*.test.ts`) under `app/`; desktop Playwright
tests in `e2e/` (projects `chromium`, `firefox`); touch tests in `e2e/touch/` (projects `mobile-android`,
`mobile-ios`); strings in `app/text/en.ts`. Colour literals live only in `app/rendering/theme/tokens.ts`.

---

## Phase 1: Setup

Exceptions are recorded only when a test's first run passes; a test that fails first follows the normal cycle. T002 and
T003 capture baseline output and timings from the unchanged code, so they run before any code change.

- [X] T001 [NT: records the baseline, no behaviour] Record a `baseline` run with the `unit-all` command and then with `e2e-all`, naming any test that already fails with `--note` (`tdd_check.py run --phase baseline`); no file is changed
- [X] T002 [NT: captures the baseline output, no behaviour] Before any code change, write app/generation/redesign-output.snapshot.json holding, for every document in app/importing/corpus/ (imported, then generated) and every valid diagram in e2e/fixtures/ (`performance-*.mermaid-editor.json`, `untrusted.mermaid-editor.json`), the generated source, the Markdown fence and the saved-file content
- [X] T003 [NT: captures the baseline timings, no behaviour] Before any code change, create e2e/support/timing.ts (median of 20 node drags, 20 pans or scrolls and 10 zoom steps on the `performance-*` fixtures) and write the unchanged editor's medians per browser to e2e/fixtures/redesign-timing.json
- [X] T004 [NT: test configuration only, no product behaviour] Add the projects `mobile-android` (`devices["Pixel 7"]`) and `mobile-ios` (`devices["iPhone 15"]`) with `testMatch: "touch/**/*.spec.ts"` to playwright.config.ts, add `testIgnore` of `touch/**` to the `chromium` and `firefox` projects, add `**/redesign-performance.spec.ts` to `TIMING`, create e2e/touch/support.ts (open a new diagram, tap, one-finger drag and two-finger pinch by dispatching touch and pointer events through Playwright, research R9), add `webkit` to the `npx playwright install --with-deps` line in .github/workflows/pages.yml, and run `npx playwright install webkit` locally (an Arch Linux launch failure is an `environment` failure, research R9)

---

## Phase 2: Foundational (blocks every story)

**Purpose**: The token sets, the stored appearance and the root that applies them. Nothing in a story can be styled
before these exist.

- [X] T005 [P] [VO-001] Write the failing test in app/rendering/theme/tokens.test.ts: `TOKENS.blueprint` and `TOKENS.light` each define every group of data-model "Design token set" (surfaces, text, accent, states, canvas, borders, source highlighting, type, shape, motion); Blueprint Studio holds `#071C30` background, `#0D2B45` panel, `#174565` panelRaised, `#72D7F2` accent, `#F1E9D7` text, `#E8AD63` warning, `#A9C0D0` textMuted, plus an error and a success colour; `cssVariables(appearance)` gives one `--…` property per token
- [X] T006 [VO-001] Create app/rendering/theme/tokens.ts with `type Appearance = "blueprint" | "light"`, `TOKENS`, `cssVariables` and `muiThemeOptions` holding exactly the values of data-model "Design token set" (Light starts from today's `#1565C0` primary and `#222222` ink), and the font stacks of research R11
- [X] T007 [P] [VO-003] Write the failing test in app/rendering/theme/contrast.test.ts (its own file, so each obligation has a clean Red and Green run): for both appearances every pair in data-model "Contrast rules" meets its minimum (4.5:1 text on `background` and `panel`; `text`, `textMuted`, `warning` on `panelRaised`; `canvasInk` and `selection` on `canvasSurface` and `nodeFill`; 3:1 for `accent` on `background`, `panel`, `canvasSurface` and for `borderStrong`), alpha tokens composited on their surface; and `warning` is amber and `error` red in both sets
- [X] T008 [VO-003] Add `contrastRatio(foreground, background)` (WCAG 2.x relative luminance, alpha composited) to app/rendering/theme/tokens.ts and adjust only the non-user-specified token values until every pair passes
- [X] T009 [P] [VO-013] Write the failing test in app/persistence/appearance.test.ts: `parseAppearance` gives `light` for `"light"` and `blueprint` for `"blueprint"`, missing, `"dark"` and `42`; `readAppearance` with a storage whose `getItem` throws gives `blueprint`; `writeAppearance` stores under the key `mermaid-editor.appearance`, returns `true`, and with a storage whose `setItem` throws returns `false` without throwing
- [X] T010 [VO-013] Create app/persistence/appearance.ts with `parseAppearance`, `readAppearance(storage = localStorage)` and `writeAppearance(appearance, storage = localStorage): boolean` per contracts/presentation-modules.md
- [X] T011 [P] [VO-008] Write the failing test in e2e/appearance.spec.ts: with no stored preference the start page shows "Mermaid diagram editor", its body background is `#071C30`, panels `#0D2B45`, body text `#F1E9D7`, and interface text uses the sans-serif token stack
- [X] T012 [VO-008] In app/root.tsx add an appearance provider (state initialised synchronously from `readAppearance()`; context exposing the appearance and a `choose(appearance)` that reports whether it was saved), set `data-appearance` on `document.documentElement`, create one MUI theme per appearance from `muiThemeOptions`, emit both `cssVariables` sets with `GlobalStyles` under `:root[data-appearance="blueprint"]` and `:root[data-appearance="light"]`, move the focus and attribution styles onto `var(--accent)` and `var(--text-muted)`, and show the application name "Mermaid diagram editor" (new string in app/text/en.ts) on the start page in app/routes/start.tsx; replace the drop overlay's `rgba(0, 0, 0, 0.4)` with a token
- [X] T013 [NT: checkpoint run, no behaviour] Run the `unit-all` command as a `checkpoint` for the phase

**Checkpoint**: Tokens, stored appearance and root exist; the start page is in Blueprint Studio.

---

## Phase 3: User Story 1 - Work on a diagram in a cohesive blueprint workspace (Priority: P1) 🎯 MVP

**Goal**: The header with the application name, diagram name, document actions, Undo/Redo and the appearance switch;
the tools area; the status bar; distinct interaction states; the switch remembered (contracts/workspace-ui.md).

**Independent Test**: Open each diagram type at 1440 × 900; every earlier control is present and works, the switch
changes every surface at once and survives a reload, and nothing else changes.

- [X] T014 [US1] [VO-009] Write the failing test in e2e/workspace.spec.ts: for each diagram type at 1440 × 900 the `<header>` holds "Mermaid diagram editor", the diagram name with Rename, the `toolbar` "Diagram actions" (Copy Source, Copy for Markdown, Save file, Undo, Redo) and the `group` "Appearance"; the `region` "Diagram canvas" is the largest region and covers at least half the window
- [X] T015 [US1] [VO-009] In app/editor/Editor.tsx put the application name, type, name, Rename and Start screen in the first header row and the `Toolbar` in the second row inside `<header>`; create app/rendering/theme/AppearanceSwitch.tsx (`group` "Appearance", toggle buttons "Blueprint Studio" and "Light", one `aria-pressed="true"`) and place it in the header; style header, toolbar and panels from tokens with compact spacing; add the strings to app/text/en.ts
- [X] T016 [US1] [VO-010] Write the failing test in e2e/workspace.spec.ts: the controls (role and accessible name) of each diagram type's editor at 1440 × 900, with nothing selected and with an item selected, equal the pre-redesign list recorded in the test plus only "Blueprint Studio" and "Light"; each new control has an accessible name and changes the appearance
- [X] T017 [US1] [VO-010] Make the inventory hold in app/editor/Editor.tsx and app/rendering/shared/Toolbar.tsx: no control renamed, removed or added beyond the switch at the wide layout
- [X] T018 [US1] [VO-011] Write the failing test in e2e/appearance.spec.ts: with a node selected, a label draft open in Properties and an undoable edit made, pressing "Light" changes the body, panel, toolbar and canvas backgrounds to the Light tokens in the same frame, and the selection, draft text, Undo's enabled state and the source text are unchanged; pressing "Blueprint Studio" changes them back
- [X] T019 [US1] [VO-011] Wire `AppearanceSwitch` to the provider's `choose` in app/rendering/theme/AppearanceSwitch.tsx and app/root.tsx so switching changes only the appearance state (no reducer action, no history entry)
- [X] T020 [US1] [VO-014] Write the failing test in e2e/appearance.spec.ts: after choosing Light and reloading, the editor opens in Light; after `localStorage` `mermaid-editor.appearance` is set to `"sepia"` and the page reloaded, it opens in Blueprint Studio with no feedback message; a diagram saved to a file and copied as source and as Markdown in each appearance gives identical bytes and contains no appearance value
- [X] T021 [US1] [VO-014] Call `writeAppearance` on every switch in app/root.tsx and make sure nothing in app/persistence/codec.ts, app/editor/library.ts or the copy path reads the appearance
- [X] T022 [US1] [VO-042] Write the failing test in e2e/appearance.spec.ts: with `Storage.prototype.setItem` made to throw, choosing Light changes the appearance and shows the notice "Your appearance choice could not be saved for next time."; with working storage no such notice appears
- [X] T023 [US1] [VO-042] Show the notice through the existing feedback mechanism (app/rendering/shared/Feedback.tsx) when `choose` reports the choice was not saved, in app/root.tsx and app/editor/Editor.tsx (and the start page in app/routes/start.tsx); add the string to app/text/en.ts
- [X] T024 [US1] [VO-030] Write the failing test in e2e/workspace.spec.ts: at 1440 × 900 each diagram type shows its own `region` "Toolbox" items to the left of the canvas and, with an item selected, the `region` "Properties" with that item's fields to its right. If it passes on its first run, record a `no-meaningful-red` exception: the tools area already exists.
- [X] T025 [US1] [VO-030] Style the tools area (app/rendering/shared/Toolbox.tsx, app/rendering/shared/PropertiesPanel.tsx) from tokens, keeping their regions, names and order
- [X] T026 [US1] [VO-031] Write the failing test in e2e/status-bar.spec.ts: the `region` "Editor status" shows "Zoom 100%", which follows Zoom in, Zoom out, Fit and the mouse wheel on each diagram type; it holds the `status` "Save status" with its texts after an edit, and the source check text; it contains no grid or snap control
- [X] T027 [US1] [VO-031] Create app/rendering/shared/StatusBar.tsx (`<footer>`, `region` "Editor status"); report zoom changes from app/rendering/flowchart/FlowchartCanvas.tsx and from `useSvgViewport` in app/rendering/shared/viewport.ts through a new `onZoomChange` prop; move the save status out of the header in app/editor/Editor.tsx keeping its role, name and texts; add the strings to app/text/en.ts
- [X] T028 [US1] [VO-012] Write the failing test in e2e/interaction-states.spec.ts: a toolbar button's computed style differs between rest, hover, keyboard focus (visible 3 px ring), pressed and disabled; every `transition-duration` on the page is at most 200 ms; `document.getAnimations()` is empty when idle; with `reducedMotion: "reduce"` every transition duration is 0 s; success feedback uses the success token and failure feedback the error token, each with its text
- [X] T029 [US1] [VO-012] Add hover, focus-visible, active and disabled styles and `transition` on colour, opacity and outline with `--duration` to the MUI theme overrides in app/rendering/theme/tokens.ts and app/root.tsx, a global `@media (prefers-reduced-motion: reduce)` rule setting durations to 0, and token colours in app/rendering/shared/Feedback.tsx
- [X] T030 [US1] [VO-005] Write the failing test in e2e/appearance.spec.ts: with requests recorded from load, using the editor and switching appearance twice makes zero requests after load; header text computes to the sans-serif token stack and the source view text to the monospace token stack
- [X] T031 [US1] [VO-005] Apply `fontMono` to source and technical annotations in app/rendering/shared/SourcePanel.tsx and `fontSans` to the MUI typography in app/rendering/theme/tokens.ts; ship no font file
- [X] T032 [US1] [NT: checkpoint run, no behaviour] Run the `e2e-all` command as a `checkpoint` for the phase

**Checkpoint**: The workspace and the switch work for every diagram type; US1 is complete.

---

## Phase 4: User Story 2 - Edit on a blueprint drafting canvas (Priority: P1)

**Goal**: The aligned 16/80 px grid and the drafting palette on every canvas, with feature 004's gestures intact
(research R4, R5).

**Independent Test**: In each diagram type add, connect, select, move, rename and delete at minimum, default and
maximum zoom; gestures land as before, the grid moves with the drawing, everything stays readable.

- [X] T033 [P] [US2] [VO-015] Write the failing test in app/rendering/shared/grid.test.ts: `gridLayers(1)` is `{ minor: 16, major: 80 }`, `gridLayers(2)` is `{ minor: 32, major: 160 }`, `gridLayers(0.5)` is `{ minor: 8, major: 40 }`, `gridLayers(0.25)` is `{ minor: null, major: 20 }`
- [X] T034 [US2] [VO-015] Create app/rendering/shared/grid.ts with `gridLayers(zoom)` per contracts/presentation-modules.md ("minor is `null` below 6 px")
- [X] T035 [US2] [VO-016] Write the failing test in e2e/grid.spec.ts: on each diagram type at zoom 1, in Blueprint Studio and in Light, the canvas draws grid lines 16 px and 80 px apart in the appearance's `gridMinor` and `gridMajor` colours on `canvasSurface`, the major more opaque than the minor
- [X] T036 [US2] [VO-016] Add two React Flow `Background` layers (lines, gaps from `gridLayers`, colours `var(--grid-minor)` and `var(--grid-major)`) in app/rendering/flowchart/FlowchartCanvas.tsx; add two `linear-gradient` background layers sized from `gridLayers(zoom)` and anchored at the drawing's origin to the scrolled content in app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx; set the canvas container background to `var(--canvas-surface)`
- [X] T037 [US2] [VO-017] Write the failing test in e2e/grid.spec.ts: an item's offset from the nearest major grid line is measured, then the flowchart is panned and each type zoomed to minimum, default and maximum (and sequence and C4 scrolled); after each step the offset equals the original times the zoom to within 1 px; at minimum zoom no minor grid is drawn
- [X] T038 [US2] [VO-017] Make the grid follow the viewport in app/rendering/flowchart/FlowchartCanvas.tsx (omit the minor layer when `gridLayers` gives `null`) and keep the gradient origin and size tied to zoom and scroll in app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx
- [X] T039 [US2] [VO-018] Write the failing test in e2e/grid.spec.ts: at points of each canvas that show only grid, `document.elementFromPoint` returns a canvas element that is not part of the grid; the number of grid elements is the same on a small and an enlarged window and no grid element is animated. If it passes on its first run, record a `no-meaningful-red` exception: the grid layers cannot receive events by construction.
- [X] T040 [US2] [VO-018] Give the grid layers `pointer-events: none` and no `data-zone` in app/rendering/flowchart/FlowchartCanvas.tsx and app/rendering/shared/canvas.css
- [X] T041 [US2] [VO-019] Write the failing test in e2e/interaction-states.spec.ts: in each diagram type an unselected item's outline and label compute to `canvasInk` and its fill to `nodeFill`; hovering shows the dashed hover outline; the selected item's outline or stroke computes to `selection` and is wider than an unselected one's and differs from the hover outline
- [X] T042 [US2] [VO-019] Replace the colour literals in app/rendering/flowchart/ShapeNode.tsx and app/rendering/flowchart/ConnectionEdge.tsx with `var(--node-fill)`, `var(--canvas-ink)`, `var(--selection)` and `var(--canvas-surface)`; set `color: var(--canvas-ink)` on the canvas region in app/editor/Editor.tsx; give the selected sequence and C4 parts `var(--selection)` in app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx, keeping every width, hit area and handle size
- [X] T043 [US2] [VO-020] Write the failing test in e2e/interaction-states.spec.ts: while a line is drawn from a flowchart node, a sequence lifeline and a C4 element over valid ends, valid ends show a 1 px dashed ring and the end under the pointer a 3 px solid ring, both in the canvas palette, and the connection preview line is visible in `canvasInk`
- [X] T044 [US2] [VO-020] Use `var(--canvas-ink)` and `var(--duration)` for the target rings, hover outlines and handles in app/rendering/shared/canvas.css and the preview line in app/rendering/c4/C4Canvas.tsx and app/rendering/sequence/SequenceCanvas.tsx
- [X] T045 [US2] [NT: checkpoint run, no behaviour] Run the `e2e-all` command as a `checkpoint` for the phase

**Checkpoint**: Every canvas is a blueprint drafting surface with unchanged gestures; US2 is complete.

---

## Phase 5: User Story 3 - Read the generated source and its validation (Priority: P2)

**Goal**: The read-only, highlighted source view with state-coloured status (research R6).

**Independent Test**: For a valid diagram, a diagram with a notice, and the status mapping for a rejected source, the
highlighted text equals the copied text and the status shows its state colour and words.

- [X] T046 [P] [US3] [VO-022] Write the failing test in app/rendering/shared/highlight.test.ts: for every document in app/importing/corpus/, the generated source of a flowchart, a sequence and a C4 diagram, and the strings `""`, `"A[\"unterminated`, `%% note\nA-->B`, `A -- text --> B`, the runs' texts joined equal the input; `flowchart`, `sequenceDiagram`, `participant` and `Person` are `keyword`, quoted labels `string`, `-->`, `->>` and `-.->` `operator`, `%%` lines `comment`, node ids `identifier`
- [X] T047 [US3] [VO-022] Create app/rendering/shared/highlight.ts with `highlightRuns(source)` per data-model "Source highlighting runs" ("the concatenation of the runs' texts equals the source exactly, for any input")
- [X] T048 [US3] [VO-023] Write the failing test in e2e/source-highlight.spec.ts: for each diagram type the expanded source view's `textContent` equals the text Copy Source put on the clipboard (Chromium), its font computes to the monospace stack, keyword, string and operator runs compute to three different colours, and typing into it changes nothing
- [X] T049 [US3] [VO-023] Render `highlightRuns(source)` as spans coloured with `var(--code-*)` inside the read-only `<pre>` in app/rendering/shared/SourcePanel.tsx
- [X] T050 [US3] [VO-024] Write the failing test in e2e/source-highlight.spec.ts: with the source view expanded, after adding a node, after Undo and after Redo, the view's `textContent` equals the source the editor generated at that point. If it passes on its first run, record a `no-meaningful-red` exception: the source view already follows edits.
- [X] T051 [US3] [VO-024] Recompute the runs from the current source on every render in app/rendering/shared/SourcePanel.tsx (memoised on the source text only)
- [X] T052 [P] [US3] [VO-006] Write the failing test in app/rendering/shared/sourceStatus.test.ts: `statusTone` gives `muted` for checking, `success` for valid, `warning` for notice and `error` for invalid, and `statusText` for invalid includes the reason; no tone has empty text
- [X] T053 [US3] [VO-006] Create app/rendering/shared/sourceStatus.ts with `statusTone(status)` and move `statusText` there from app/rendering/shared/SourcePanel.tsx
- [X] T054 [US3] [VO-007] Write the failing test in e2e/source-highlight.spec.ts: an empty C4 diagram's status text "Valid except for a notice" computes to the `warning` token and a valid flowchart's "Valid" to the `success` token, in both appearances
- [X] T055 [US3] [VO-007] Colour the summary status with `var(--{tone})` from `statusTone` in app/rendering/shared/SourcePanel.tsx and the source check text in app/rendering/shared/StatusBar.tsx
- [X] T056 [US3] [NT: checkpoint run, no behaviour] Run the `unit-all` command as a `checkpoint` for the phase

**Checkpoint**: The source view is readable and honest; US3 is complete.

---

## Phase 6: User Story 4 - See Mermaid's own drawing in the blueprint style (Priority: P2)

**Goal**: One Mermaid runtime whose look follows the appearance; drawings redraw on a switch; output unchanged
(research R3).

**Independent Test**: The preview and import comparison in Blueprint Studio and Light; custom styles still show; copied
source, Markdown and files are identical across appearances.

- [X] T057 [P] [US4] [VO-025] Write the failing test in app/rendering/shared/mermaidRuntime.test.ts: `mermaidConfig("blueprint")` is `startOnLoad: false`, `securityLevel: "strict"`, `theme: "base"` with the `themeVariables` of data-model "Mermaid look" equal to the token values; `mermaidConfig("light")` is the same with `theme: "default"` and no `themeVariables`
- [X] T058 [US4] [VO-025] Create app/rendering/shared/mermaidRuntime.ts with `mermaidConfig`, `setMermaidAppearance` and `loadMermaid`, and make it the only caller of `mermaid.initialize` in app/: change app/rendering/shared/MermaidPicture.tsx, app/editor/mermaidParser.ts and app/editor/mermaidSnapshot.ts to load Mermaid through it; call `setMermaidAppearance` from the provider in app/root.tsx
- [X] T059 [US4] [VO-026] Write the failing test in e2e/mermaid-look.spec.ts: a flowchart with every node shape, previewed in Blueprint Studio, draws node shapes filled with `nodeFill`, outlined in `accent`, labels in `text` and edge paths in `canvasInk`; each node's outline element type and path count equal those drawn in Light
- [X] T060 [US4] [VO-026] Pass the appearance into the preview's drawing in app/rendering/flowchart/Preview.tsx and frame it on `var(--canvas-surface)`
- [X] T061 [US4] [VO-027] Write the failing test in e2e/mermaid-look.spec.ts: with the preview open in Blueprint Studio, pressing "Light" redraws it with Mermaid's default node fill while the preview stays open
- [X] T062 [US4] [VO-027] Redraw on appearance change by adding the appearance to the drawing effects in app/rendering/flowchart/Preview.tsx, app/rendering/import/ImportPicture.tsx and app/rendering/import/CompareView.tsx
- [X] T063 [US4] [VO-028] Write the failing test in e2e/mermaid-look.spec.ts: New from Mermaid in Blueprint Studio with `flowchart TD`, `A --> B --> C`, `style A fill:#ff99ff`, `classDef warm fill:#ffcc88` and `class B warm` draws A filled `#ff99ff`, B filled `#ffcc88` and C filled with `nodeFill`
- [X] T064 [US4] [VO-028] Make the import picture keep source styles over the theme defaults in app/rendering/import/ImportPicture.tsx (no CSS override of Mermaid's SVG; only the configuration from the runtime)
- [X] T065 [US4] [VO-029] Write the failing test in e2e/mermaid-look.spec.ts: for a flowchart, a sequence and a C4 diagram, Copy Source and Copy for Markdown (Chromium clipboard) and Save file in Blueprint Studio and in Light give identical texts and bytes, equal to the generated source (and its fence), with no `%%{init` and no `theme`. If it passes on its first run, record a `no-meaningful-red` exception: generation is unchanged.
- [X] T066 [US4] [VO-029] Confirm no appearance reaches app/generation/, app/editor/clipboard.ts or app/persistence/fileIo.ts; change nothing in app/generation/
- [X] T067 [US4] [NT: checkpoint run, no behaviour] Run the `e2e-all` command as a `checkpoint` for the phase

**Checkpoint**: Mermaid's drawings follow the appearance; output is unchanged; US4 is complete.

---

## Phase 7: User Story 5 - Use the editor in a narrow window or on a phone (Priority: P3)

**Goal**: Narrow and compact layouts, touch pan and pinch on sequence and C4, and the touch suite on both mobile
profiles (research R7, R8, R9).

**Independent Test**: At 360 and 768 px and on both emulated phones, every operation can be completed with the panels
and by touch, with no sideways scroll.

- [X] T068 [P] [US5] [VO-032] Write the failing test in app/rendering/shared/layout.test.ts: `layoutFor` gives `wide` for 1440 and 900, `narrow` for 899 and 600, `compact` for 599 and 360
- [X] T069 [US5] [VO-032] Create app/rendering/shared/layout.ts with `layoutFor(width)` ("≥ 900, 600–899, < 600")
- [X] T070 [US5] [VO-033] Write the failing test in e2e/narrow-layout.spec.ts: at 800 × 900 and 360 × 740 a `button` "Tools" with `aria-expanded="false"` opens the `region` "Tools" holding the toolbox and properties, the "Mermaid source" disclosure opens the source view, and with both closed the canvas region covers at least half the window
- [X] T071 [US5] [VO-033] In app/editor/Editor.tsx use `layoutFor(window width)` (resize-aware) to move the toolbox and Properties into a "Tools" panel above the canvas (`aria-controls`, at most 45 % of the viewport height, scrolling inside) below 900 px; add the strings to app/text/en.ts
- [X] T072 [US5] [VO-034] Write the failing test in e2e/narrow-layout.spec.ts: at 800 px with a node selected, opening Tools, typing a label draft in Properties and closing Tools leaves the selection and the draft text in place and the canvas zoom and position unchanged
- [X] T073 [US5] [VO-034] Keep the panel's open state outside the canvas and reducer state in app/editor/Editor.tsx so opening and closing never remounts the canvas or clears the draft
- [X] T074 [US5] [VO-035] Write the failing test in e2e/narrow-layout.spec.ts: for each diagram type at 360, 768 and 1440 px, `document.documentElement.scrollWidth` does not exceed the viewport width, and every pre-redesign control (the inventory of T016) is reachable, through the `button` "More actions" menu at 360 px, and Copy Source from the menu reports its result
- [X] T075 [US5] [VO-035] Add the compact "More actions" menu (`aria-haspopup="menu"`, `menuitem`s Copy Source, Copy for Markdown, Save file, Preview as Mermaid draws it) to app/rendering/shared/Toolbar.tsx below 600 px, let header rows wrap in app/editor/Editor.tsx, and remove any fixed width that overflows 360 px
- [X] T076 [P] [US5] [VO-040] Write the failing test in app/rendering/shared/pinch.test.ts: `pinchZoom(1, 100, 200, { min: 0.25, max: 4 })` is 2, `pinchZoom(1, 100, 50, …)` is 0.5, `pinchZoom(2, 100, 1000, …)` is 4, `pinchZoom(0.5, 100, 10, …)` is 0.25, and a start distance of 0 returns the start zoom
- [X] T077 [US5] [VO-040] Create app/rendering/shared/pinch.ts with `pinchZoom(startZoom, startDistance, distance, limits)` per contracts/presentation-modules.md
- [X] T078 [US5] [VO-041] Write the failing test in e2e/touch/gestures.spec.ts: on both mobile profiles, for each diagram type, a one-finger drag across empty canvas pans the flowchart or scrolls the sequence and C4 container by the drag; a two-finger pinch apart and together changes "Zoom n%" up and down within the zoom buttons' limits while `visualViewport.scale` stays 1 and the header's height is unchanged; a double-tap on an item opens its inline label editor
- [X] T079 [US5] [VO-041] Create app/rendering/shared/touchPan.ts (data-model "Touch gesture": panning on one touch pointer from empty canvas, pinching on a second, using `pinchZoom`) and use it in app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx; add a `zoomTo(zoom)` entry to `useSvgViewport` in app/rendering/shared/viewport.ts clamped to 0.25–4; keep React Flow's own touch pan and pinch in app/rendering/flowchart/FlowchartCanvas.tsx
- [X] T080 [US5] [VO-043] Write the failing test in e2e/touch/gestures.spec.ts: on both mobile profiles, while one finger drags a sequence participant to a new position and a C4 element to a new place, a second finger touches down and moves; the drag completes with the same result as without the second finger and "Zoom n%" is unchanged
- [X] T081 [US5] [VO-043] Make app/rendering/shared/touchPan.ts ignore extra touch pointers while an item, handle or line-end drag is in progress ("a second touch pointer is ignored and starts no zoom")
- [X] T082 [US5] [VO-036] Write the failing test in e2e/touch/flowchart.spec.ts: on both mobile profiles a flowchart is built by touch (tap three toolbox shapes, drag a handle to connect two nodes, drag a node, double-tap to rename, delete through Properties, Undo, Redo), and after each step the generated source equals what the same steps give on desktop. If it passes on its first run, record a `no-meaningful-red` exception, and only then.
- [X] T083 [US5] [VO-036] Fix whatever T082 shows breaks by touch on the mobile profiles in app/rendering/flowchart/ and app/editor/Editor.tsx without changing desktop behaviour
- [X] T084 [US5] [VO-037] Write the failing test in e2e/touch/sequence-c4.spec.ts: on both mobile profiles a sequence diagram (add participants and a message by tap and drag, reorder, rename by double-tap, delete, Undo, Redo) and a C4 diagram (add elements, connect, move, rename, delete, Undo, Redo) are edited by touch with the same results as on desktop. If it passes on its first run, record a `no-meaningful-red` exception, and only then.
- [X] T085 [US5] [VO-037] Fix whatever T084 shows breaks by touch in app/rendering/sequence/ and app/rendering/c4/ without changing desktop behaviour
- [X] T086 [US5] [VO-038] Write the failing test in e2e/touch/files-copy.spec.ts: on both mobile profiles a diagram is saved through "More actions" (a download is offered), reopened from that file through the start page with the same content, copied as source and as Markdown (feedback reads success only when the clipboard holds the text, otherwise the failure message), and the appearance switched by tap. If it passes on its first run, record a `no-meaningful-red` exception, and only then.
- [X] T087 [US5] [VO-038] Fix whatever T086 shows breaks by touch in app/rendering/shared/Toolbar.tsx, app/routes/start.tsx or app/editor/clipboard.ts without changing desktop behaviour or reporting success before it occurs
- [X] T088 [US5] [VO-039] Write the failing test in e2e/touch/targets.spec.ts: on both mobile profiles every button, menu item, toggle and toolbox item in each diagram type's editor is at least 24 × 24 CSS px and every connection handle's hit area at least 28 px
- [X] T089 [US5] [VO-039] Enlarge any target T088 finds too small, in app/rendering/theme/tokens.ts (component sizes) or the component that draws it
- [X] T090 [US5] [NT: checkpoint run, no behaviour] Run the `e2e-all` command as a `checkpoint` for the phase

**Checkpoint**: Narrow windows and phones can do everything desktop can; US5 is complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T091 [P] [VO-002] Write the failing test in app/rendering/theme/noColourLiterals.test.ts: every `.ts`, `.tsx` and `.css` file under app/ other than app/rendering/theme/tokens.ts and `*.test.ts` contains no hex colour, `rgb(`, `rgba(`, `hsl(` or named colour (`white`, `black`) used as a style value
- [X] T092 [VO-002] Move every remaining colour literal the test finds into tokens and reference it by token or `var(--…)`
- [X] T093 [VO-004] Write the failing test by extending e2e/wcag.spec.ts, e2e/canvas-wcag.spec.ts and e2e/import-wcag.spec.ts to run each existing check in both appearances, adding the start page, each diagram type with an item selected, a C4 notice, the import dialog with a parse error and each editing dialog (move-to, target, message, C4 kind, lock): zero colour-contrast and focus violations (no existing assertion is weakened)
- [X] T094 [VO-004] Fix every violation T093 reports in app/rendering/theme/tokens.ts or the component concerned, including the React Flow attribution link and dialog surfaces
- [X] T095 [VO-021] Run the full existing unit suite and desktop end-to-end suite (timing projects included) against the baseline as the test step of the regression obligation, recording the failures it shows. It is expected to pass: record a `behaviour-preserving` exception against the T001 baseline rather than a Red run.
- [X] T096 [VO-021] Resolve every regression T095 shows in the code it names, recording any changed expectation with `tdd_check.py expectation` and asking the Business Analyst for approval where it alters behaviour; then run `e2e-all` as the final `checkpoint`
- [X] T097 [VO-044] Write the test in app/generation/redesign-output.test.ts comparing, for every entry of app/generation/redesign-output.snapshot.json, the current generated source, Markdown fence and saved-file content with the snapshot byte for byte; it is expected to pass, so record a `behaviour-preserving` exception against the T002 snapshot
- [X] T098 [VO-044] Resolve any difference T097 shows outside app/generation/ (nothing in app/generation/ changes), then run it with `--phase green`
- [X] T099 [VO-045] Write the test in e2e/redesign-performance.spec.ts: using e2e/support/timing.ts, each action's median on the redesigned editor is within 10 % of its value in e2e/fixtures/redesign-timing.json, per browser; run it in the timing projects
- [X] T100 [VO-045] Remove any slowdown T099 shows (for example the grid layers or the touch handler) in the canvas code it names
- [X] T101 [NT: static checks, verified by the project's own linters] Run `npm run typecheck` and `npm run lint` and fix what they report
- [ ] T102 [NT: manual checks recorded by a person] Ask the Business Analyst to carry out MV-001 (dense diagrams readable), MV-002 (no dependency added) and MV-003 (consistent identity) from the plan and record them with `tdd_check.py manual`
- [X] T103 [NT: documentation only] Describe the two appearances, the switch and mobile support in README.md, keeping every statement e2e/readme.spec.ts checks

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: none. T001 must come before any other run.
- **Foundational (Phase 2)**: after Setup; blocks every story.
- **US1 (Phase 3)**: after Foundational. The MVP.
- **US2 (Phase 4)**: after Foundational; T042 edits app/editor/Editor.tsx, so run it after US1's Editor tasks.
- **US3 (Phase 5)**: after Foundational; T055 needs app/rendering/shared/StatusBar.tsx from T027.
- **US4 (Phase 6)**: after Foundational (the provider in T012 calls the runtime).
- **US5 (Phase 7)**: after US1 (header, toolbar, status bar) and US2 (canvas colours); T074 reuses T016's inventory.
- **Polish (Phase 8)**: after every story; T091 to T094 need every surface tokenised.

Within each story every test task precedes its behaviour task; pure modules before the components that use them.

## Parallel Opportunities

- Phase 2: T005, T007 and T009 (different test files) together.
- US2: T033 alongside the e2e grid tests' preparation.
- US3: T046 and T052 (pure tests) together.
- US4: T057 while US3 is under way.
- US5: T068 and T076 (pure tests) together.

```text
Example (Phase 2):
  T005 tokens.test.ts (token groups)    T009 appearance.test.ts (stored preference)
  → T006 tokens.ts                      → T010 appearance.ts
```

## Implementation Strategy

1. **MVP**: Setup, Foundational, US1: the Blueprint Studio workspace, the switch and its memory. Stop and validate.
2. **Add US2**: the drafting canvas. Demo.
3. **Add US3 and US4** (P2): the highlighted source and Mermaid's drawings in the look.
4. **Add US5** (P3): narrow layouts and phones.
5. **Polish**: colour literal sweep, accessibility in both appearances, full regression, manual checks.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing
- Stop at any checkpoint to validate story independently

## Verification labels

<!--
  Added by the Integrated TDD preset. These conventions apply to every task above.
  Keep this section in the generated tasks.md so a reviewer can read the labels.
-->

Every task carries a verification label, placed after the story label and before the
description. The rest of the task line is unchanged.

| Label | Meaning |
|-------|---------|
| `[VO-nnn]` | The task satisfies this obligation from the plan's Verification Plan. Repeat the label for several obligations |
| `[NT: reason]` | The task has no behaviour to verify. The reason is required |

```markdown
- [ ] T011 [P] [US1] [VO-001] Write the failing test for an empty cart total in tests/test_cart.py
- [ ] T012 [US1] [VO-001] Implement the cart total in src/cart.py
- [ ] T013 [US1] [NT: README wording only] Document the cart total in README.md
```

A task's kind follows from its labels and its position in this file:

| Kind | Rule |
|------|------|
| `no-test` | Carries `[NT: reason]` and no `[VO-nnn]` |
| `test` | The first task in the file to name a given obligation |
| `behaviour` | Any later task naming that obligation |

- Test tasks are required for every task that delivers behaviour. They are not optional.
- When the feature has a behaviour checklist, each obligation a test task names must be
  named by a behaviour item, so that the test traces to a planned behaviour.
- Every obligation needs a `test` task and at least one `behaviour` task, so it is named
  by at least two tasks.
- The first task to name an obligation is its test task whatever its description says, so
  the test task must be written first: the task that writes the failing test comes before
  the task that implements the behaviour.
- A task naming several obligations is a `test` task only when it is the first to name
  all of them.
