# Research: Blueprint Studio Visual Redesign

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-22

## Current implementation (what the redesign builds on)

| Concern | Where it is today | Notes |
|---------|-------------------|-------|
| Theme | `app/root.tsx` | One MUI `createTheme` (light, primary `#1565c0`), system font stack, global focus and React Flow attribution styles |
| Canvas CSS | `app/rendering/shared/canvas.css` | Zones, hover outlines, handles and drop-target rings, all drawn in `currentColor` |
| Flowchart canvas | `app/rendering/flowchart/FlowchartCanvas.tsx`, `ShapeNode.tsx`, `ConnectionEdge.tsx` | React Flow; the only hard-coded colours (`white`, `#1565c0`, `#222`) are in the node and edge parts; default zoom limits 0.5–2 |
| Sequence and C4 canvases | `app/rendering/sequence/SequenceCanvas.tsx`, `app/rendering/c4/C4Canvas.tsx` | Hand-drawn SVG in a scrolling container, all in `currentColor`; zoom by viewBox (`app/rendering/shared/viewport.ts`, 0.25–4); `touch-action: none` on the whole SVG |
| Mermaid drawings | `app/rendering/shared/MermaidPicture.tsx` (`drawWithMermaid`), used by the flowchart Preview and the import picture and compare view | `mermaid.initialize` is called before every render, parse and snapshot (`app/editor/mermaidParser.ts`, `mermaidSnapshot.ts`) |
| Source view | `app/rendering/shared/SourcePanel.tsx` | Collapsed accordion with a plain `<pre>`, read-only, status text in the summary |
| Header and toolbar | `app/editor/Editor.tsx`, `app/rendering/shared/Toolbar.tsx` | Header: type, save status (`role=status`, "Save status"), Start screen, name and Rename. Toolbar `role=toolbar` "Diagram actions": Undo, Redo, Copy source, Copy Markdown, Save file, Zoom in/out, Fit, Preview |
| Tools | `app/rendering/shared/Toolbox.tsx`, `PropertiesPanel.tsx` | Toolbox items are activated by click or tap (drag-and-drop is an extra on desktop) |
| Touch | Feature 004 | Taps, double-taps and drags by touch and pen behave like the mouse on items; verified through the Chromium DevTools protocol only (`e2e/pointer-types.spec.ts`) |
| Tests | Vitest (`npm test`), Playwright (`npm run test:e2e`, desktop Chromium and Firefox; 111 spec files), axe checks in `e2e/wcag.spec.ts`, `canvas-wcag.spec.ts`, `import-wcag.spec.ts` | E2E tests find controls by role and accessible name, not by position |
| Stored data | IndexedDB for diagrams (`app/persistence/store.ts`) | No preference is stored today |

## R1. Design tokens and the two appearances

- **Decision**: One pure module holds both token sets (`blueprint`, `light`) as typed objects: colours, faces, spacing
  unit, radii, border widths, transition duration. From it are derived (a) one MUI theme per appearance, and (b) CSS
  custom properties for each appearance, emitted once by global styles under `:root[data-appearance="…"]`. Plain CSS
  (`canvas.css`), SVG parts and React Flow read the custom properties (`var(--…)`); MUI components read the theme.
- **Rationale**: Tokens are defined once (FR-001) and reach both MUI and non-MUI parts. Canvas parts are already drawn in
  `currentColor`, so most of the canvas changes by setting `color` and a few fills on the canvas container.
- **Alternatives considered**: MUI `colorSchemes` with CSS variables and `useColorScheme` (built-in storage). Rejected:
  it is shaped around light/dark/system modes and its own storage key, while the spec names two specific appearances
  with a validated, Blueprint-first fallback. A CSS-only theme was rejected because MUI components are styled through
  the theme.

## R2. Choosing, applying and remembering the appearance

- **Decision**: An appearance provider in the root reads the stored preference once, synchronously, before first
  render, and holds the current appearance in React state. It sets `data-appearance` on the document element, selects
  the MUI theme and tells the Mermaid runtime (R3). The switch is a labelled toggle button group in the header
  ("Appearance": Blueprint Studio / Light). The preference is kept in `localStorage` under one key; a pure parser turns
  the stored value into an appearance and returns Blueprint Studio for anything missing, unreadable or unknown. A
  storage exception on read is caught and gives Blueprint Studio; one on write is caught, the switch still applies for
  the session, and a notice says the choice could not be saved for next time (Clarifications).
- **Rationale**: FR-026 asks for local storage, a Blueprint fallback without an error, and no effect on diagrams.
  Reading before first render avoids a flash of the wrong appearance. The preference is not part of the model, history
  or files, so switching is not an editing operation and is not undoable (constitution V applies to editing operations).
- **Alternatives considered**: Storing the preference in IndexedDB with the diagrams (rejected: asynchronous, so the
  first frame would be in the wrong appearance, and it would mix a preference into the diagram store).

## R3. Mermaid's own drawings follow the appearance

- **Decision**: One Mermaid runtime module wraps the lazy import and is the only place that calls `mermaid.initialize`.
  It initialises with `startOnLoad: false`, `securityLevel: "strict"` and the look of the current appearance: for
  Blueprint Studio `theme: "base"` with `themeVariables` taken from the tokens (node fill, ivory text, cyan border, line
  colour, background, system fonts); for Light `theme: "default"`, as today. `drawWithMermaid`, the parser and the
  snapshot readers load Mermaid through it. Changing appearance updates the runtime and redraws any picture on screen.
- **Rationale**: `initialize` replaces the site configuration, so today every parse resets it. A single caller keeps
  the look stable between a draw and an unrelated parse. Theme variables are defaults: `style`, `classDef` and
  `%%{init}%%` directives in the drawn source still take precedence (FR-019, US4-AS3). Nothing is added to the source,
  so generated source, copied output and files cannot carry the look.
- **Alternatives considered**: Prefixing an `%%{init}%%` directive to the drawn text (rejected: it must not precede
  front matter, would shift error line numbers in the import picture, and could override the source's own directive).
  Restyling the SVG with CSS after rendering (rejected by the brief: broad selectors override Mermaid geometry and
  source styles).

## R4. The drafting grid

- **Decision**: Flowchart: two React Flow `Background` layers (variant lines, gaps 16 and 80, colours from tokens);
  React Flow already moves and scales them with the viewport. The minor layer is left out when `16 × zoom < 6` px, so
  minimum zoom shows only the major grid (EC-04). Sequence and C4: the scrolled content wrapper carries two
  `linear-gradient` background layers sized `16 × zoom` and `80 × zoom` px, anchored at the drawing's origin, so they
  scroll and zoom with the drawing. Neither adds an element per line, an animation or a hit target.
- **Rationale**: FR-011 to FR-013 and EC-04/EC-05 with no new dependency. Background images and React Flow's
  background SVG cannot receive pointer events from the pane above them.
- **Alternatives considered**: A canvas element or an SVG overlay drawn by the editor (rejected: more DOM, needs its
  own pan and zoom tracking). Registration marks and drafting borders are left out: they are optional (FR-014) and add
  nothing a user needs.

## R5. Canvas items and interaction states

- **Decision**: The canvas container sets `color: var(--canvas-ink)`; the few hard-coded colours become tokens: node
  fill `--node-fill`, label background `--canvas-surface`, selected outline and line `--selection`, focus ring
  `--focus-ring`, connection preview and target rings stay `currentColor`. Selection keeps its extra width (the cue that
  does not rely on colour). Transitions use `--duration` (150 ms) on colour, opacity and outline only; one global
  `prefers-reduced-motion: reduce` rule sets durations to zero. The editor has no continuous animation today (no
  progress spinner or keyframes) and none is added.
- **Rationale**: FR-015, FR-016, FR-021, FR-022 without touching geometry, hit areas or handle sizes from feature 004.

## R6. Read-only source view with highlighting

- **Decision**: A pure tokenizer splits generated source into runs (keyword, identifier, string or label, operator or
  arrow, comment, punctuation, whitespace) whose texts concatenate to exactly the source. The source view renders the
  runs as spans in a `<pre>` in the monospace face, coloured by tokens. It stays a non-editable element, and the status
  in its summary gets a state colour plus its existing text.
- **Rationale**: FR-017 and FR-018 with no dependency. The editor only shows source it generated, for three diagram
  types, so a small lexical highlighter over keywords, arrows, quoted text and `%%` comments is enough; it never parses
  and never changes the text.
- **Alternatives considered**: A code editor or highlighting library (rejected: a new dependency, and editors invite
  editing that principle I forbids).

## R7. Workspace layout and the narrow layout

- **Decision**: Wide (≥ 900 px): header (application name, diagram type, name and Rename, Start screen, appearance
  switch), the "Diagram actions" toolbar as today, then tools column, canvas and Properties, then the collapsed source
  view, then a status bar (zoom %, "Save status" region, source check text). Narrow (< 900 px): the tools column and
  Properties move into one "Tools" panel toggled by a labelled button (`aria-expanded`, `aria-controls`) that opens
  above the canvas and scrolls within 45 % of the viewport height; the source view stays collapsed below the canvas.
  Very narrow (< 600 px): Copy source, Copy Markdown, Save file and Preview move into a labelled "More actions" menu in
  the toolbar; Undo, Redo, zoom and Fit stay visible. The page never scrolls sideways from 360 px.
- **Rationale**: FR-005 to FR-010, US5. Controls keep their names and effects; only their place changes (FR-009).
  Existing tests find controls by role and name within the toolbar, and run at desktop size, where nothing moves into
  the menu. The save status keeps its role and name in its new place.
- **Alternatives considered**: Tabs that swap the canvas for the tools (rejected: hides the canvas while setting a
  property, so the effect cannot be seen). A drawer from the side (rejected: covers the canvas on a 360 px screen).

## R8. Touch gestures

- **Decision**: Flowchart: React Flow already pans with one finger on the pane and zooms with a pinch within its limits
  (0.5–2, the same as the buttons), and the pane's `touch-action: none` keeps the page from zooming; double-tap rename
  already exists (feature 004). These are kept and verified. Sequence and C4: a shared gesture helper on the SVG
  handles touch pointers that start on empty canvas: one finger scrolls the container by the finger's movement; two
  fingers zoom by the ratio of finger distances, clamped to the viewport's limits (0.25–4). A second finger that lands
  while an item, handle or line end is being dragged is ignored until the drag ends. Mouse and pen behaviour is
  unchanged.
- **Rationale**: FR-028. The SVG already has `touch-action: none`, so the page never zooms and the editor must do the
  pan and zoom itself.
- **Alternatives considered**: Setting `touch-action: pan-x pan-y pinch-zoom` (rejected: the browser would zoom the
  whole page, not the drawing). Disabling page zoom with the viewport meta tag (rejected: harms WCAG 1.4.4).

## R9. Mobile verification

- **Decision**: Two Playwright projects, `mobile-android` (device profile "Pixel 7", Chromium) and `mobile-ios` (device
  profile "iPhone 15", WebKit), run only `e2e/touch/**`; the existing desktop projects ignore that folder. The touch
  suite drives taps with the touchscreen API and drags and pinches with touch and pointer events dispatched through
  Playwright, which works in both engines (the DevTools protocol used by `pointer-types.spec.ts` is Chromium only). CI
  installs WebKit with the other browsers.
- **Rationale**: Clarifications: emulated runs only, a dedicated touch suite, existing suite desktop-only (SC-001,
  SC-009).
- **Risks**: WebKit is not installed on this machine yet and Playwright's WebKit build is supported on Ubuntu and Debian;
  on Arch Linux it may fail to start for missing system libraries. Such a failure is an `environment` failure, not a
  test result; CI (`ubuntu-latest`) remains able to run it. Emulated WebKit may refuse clipboard writes; a copy test
  then checks the editor's own honest failure feedback is not shown as success, and the limitation is reported.

## R10. Contrast values

- **Decision**: Every text and graphic pair used is listed with its required ratio in [data-model.md](data-model.md)
  and checked by a unit test computing WCAG relative luminance, so a token edit that breaks contrast fails a test.
  Error and success colours for each appearance are chosen to pass (Blueprint: error `#FF8A80`, success `#7FD8A6`,
  warning uses amber `#E8AD63`; Light: error `#C62828`, success `#2E7D32`, warning `#8A5300`, because amber on white is
  below 4.5:1).
- **Rationale**: FR-002, FR-004, FR-020, SC-003, EC-08, EC-09; the existing axe checks then run in both appearances.

## R11. Fonts

- **Decision**: Interface: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (as
  today). Source and technical annotations: `ui-monospace, SFMono-Regular, "Cascadia Mono", "DejaVu Sans Mono", Menlo,
  Consolas, monospace`. No font file is shipped or fetched.
- **Rationale**: FR-003 and 002 FR-021 (no request after load); existing `static-offline.spec.ts` and
  `import-no-network.spec.ts` keep checking that.
