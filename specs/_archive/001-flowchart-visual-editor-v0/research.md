# Research: Flowchart Visual Editor

Resolves every open technical choice for the plan. Spec requirements are cited as FR-nnn, SC-nnn, EC-nn.
The stack itself (TypeScript strict, React 19, React Router v8 SPA, Vite, Vitest, Playwright) is already
installed and recorded in `CLAUDE.md`, so it is not re-decided here.

## R1. Canvas approach

- **Decision**: Use `@xyflow/react` (React Flow) ^12.12.0 as a controlled component. The editor's own diagram
  model is the only state; React Flow nodes and edges are derived from it on every render and never hold
  logical state.
- **Rationale**: The canvas must support dragging nodes, connecting through handles, selection, keyboard focus
  and screen-reader labels (FR-003 to FR-007, FR-024). React Flow provides these, accepts custom node and edge
  renderers (nine shapes, nine connection styles, self-loops) and exposes `screenToFlowPosition` for toolbox
  drops. It keeps constitution principle I intact when used controlled: every change arrives as a callback and
  is turned into a model operation.
- **Alternatives considered**: (a) Hand-rolled SVG: no new dependency, but drag, pointer capture, connection
  handles, focus management and hit testing would all be written and tested by us, which is the largest risk
  to the schedule and to FR-024. (b) Rendering Mermaid's own SVG and overlaying interaction: Mermaid output
  has no stable hooks for positions, so moving nodes (FR-005) is not possible; its layout also discards user
  positions. (c) Other graph libraries (Cytoscape, jsPlumb): heavier or not React-native.
- **Consequence**: One new runtime dependency, named here as the constitution requires. The canvas is drawn by
  our rendering layer, not by Mermaid, so node shapes are drawn to resemble Mermaid's but the exact look
  differs. The spec's "canvas is the rendered diagram" is met in the sense that the canvas is a faithful
  drawing of the model; the source panel is checked against the model, not against the canvas pixels.

## R1a. UI component library

- **Decision**: `@mui/material` ^9.5.0 (React 19 supported) with its `@emotion/react` and `@emotion/styled` peers,
  chosen by the Business Analyst as a full component library. Used for the toolbar buttons, toolbox, start
  screen, text editor, source panel disclosure and feedback (snackbar and live region). The canvas, node shapes
  and edges stay custom React Flow renderers and do not depend on MUI.
- **Rationale**: Accessible, keyboard-operable controls out of the box (FR-024); consistent look with little CSS.
- **Consequences**: Larger bundle (still static files only, FR-026); styling is CSS-in-JS via Emotion, so
  Stylelint covers only the few plain CSS files; accessible names in `contracts/editor-ui.md` must be kept on
  MUI controls. No MUI packages may load fonts or icons from a CDN: use the system font stack and inline SVG
  icons, or bundle fonts locally.
- **Alternatives considered**: no framework with plain CSS (recommended by the planner; smaller, fewer
  dependencies); headless libraries; Mantine (plain CSS, but needs a PostCSS setup).

## R2. Role of the `mermaid` package

- **Decision**: `mermaid` (already a dependency, 12.2.0) is used only to validate generated source. In tests it
  runs through `mermaid.parse` and `mermaid.mermaidAPI.getDiagramFromText` under jsdom. At run time it is
  loaded lazily after each change to confirm the source parses; its result feeds the source status (FR-017).
- **Rationale**: setup.md's Definition of Done requires generated output validated against the grammar, and
  `scripts/lint-mermaid.mjs` already shows that `parse` works under jsdom. `getDiagramFromText` exposes the
  parsed vertices (shape type, text) and edges (arrow type, stroke), which lets a test prove that the source
  means what the model says, not merely that it parses. This was tried against all nine shapes, all nine
  connection types, a self-loop, duplicate connections and a label full of special characters; all parsed and
  reported the expected types and strokes.
- **Alternatives considered**: A hand-written grammar check (duplicates Mermaid's own and can drift); no
  run-time check (leaves FR-017 and AC12 "generation failure is reported" without a signal).
- **Notes**: Mermaid stores entity codes in its parsed text as private placeholders (for example
  `ﬂ°quot¶ß`), so a fidelity test decodes that placeholder form, and also checks our own escape/unescape pair
  for identity. `parse` needs a DOM, so those test files declare the jsdom environment individually.

## R3. Label escaping scheme

- **Decision**: Every node and connection label is emitted as a double-quoted string. Inside it:
  `#` becomes `#35;`, `"` becomes `#quot;`, `<` becomes `#lt;`, `>` becomes `#gt;`, `&` becomes `#amp;`,
  the backtick becomes `#96;`, and each line break becomes `<br/>`. The `#` replacement runs first. An empty
  connection label is omitted (no pipes).
- **Rationale**: Quoting makes brackets, parentheses, braces, pipes, semicolons and arrows inert. The entity
  codes cover the characters that stay meaningful inside quotes (the quote itself, `#`, HTML-significant
  characters, and the backtick that would switch a string into Markdown mode). `<br/>` is the supported way to
  express a multi-line label (spec: multi-line allowed). A label that reads `<br/>` typed by the user is
  emitted as `#lt;br/#gt;` and so stays literal.
- **Alternatives considered**: Unquoted labels with per-character escaping (fragile, brackets break out);
  Markdown strings with backticks (changes rendering semantics and has its own escaping).

## R4. Mermaid vocabulary

- **Decision**: Node ids in the source are `n` plus the node's creation number (`n1`, `n2`). Nodes are
  emitted in creation order, then connections in creation order, so output is a deterministic pure function of
  the model. The header is `flowchart TD`.
- **Shapes** (label shown as `L`): rectangle `n1["L"]`, rounded rectangle `n1("L")`, stadium `n1(["L"])`,
  diamond `n1{"L"}`, circle `n1(("L"))`, parallelogram `n1[/"L"/]`, cylinder `n1[("L")]`, subroutine
  `n1[["L"]]`, hexagon `n1{{"L"}}`.
- **Connections**: solid `-->` `---` `<-->`; dotted `-.->` `-.-` `<-.->`; thick `==>` `===` `<==>`; label as
  `-->|"L"|`.
- **Rationale**: The `n` prefix can never collide with Mermaid keywords such as `end` or `graph`. Creation
  order is stable under move, rename and undo, so moving a node never changes the source (EC-07). Never
  reusing a creation number means two nodes with identical labels stay distinct (EC-02).

## R5. Editing history

- **Decision**: Snapshot stacks. Each committed operation pushes the previous immutable `Diagram` onto an undo
  stack and clears the redo stack; Undo and Redo swap snapshots. No inverse operations.
- **Rationale**: Diagrams are small (SC-009 caps the target at 100 nodes), snapshots share structure, and the
  approach cannot drift from the forward operations. It makes "undo every operation returns to the empty
  diagram" (SC-004) true by construction and keeps history independent of operation kinds, so new operation
  types participate automatically (business rule 9).
- **Gesture grouping**: A drag is view state until the pointer is released, then one move operation is
  committed. A label edit is a draft until confirmed, then one rename operation. A cancelled drag or edit
  commits nothing (EC-05, FR-018). A move that ends at its starting position commits nothing.
- **Alternatives considered**: Command pattern with inverses (more code, an inverse per operation to get
  wrong); coalescing many small moves after the fact (hides intent and is harder to test).

## R6. Operation pipeline and layering

- **Decision**: Five layers in `app/`, each importing only earlier ones, plus a composition layer on top:
  1. `model`: types, catalog of shapes and connection types, pure `apply` of an operation, free-position search.
  2. `validation`: decides whether an operation may be committed and returns a plain-language rejection.
  3. `generation`: Mermaid source as a pure function of a diagram, with escaping.
  4. `rendering`: React Flow canvas, node and edge drawings, toolbox, source panel, feedback display.
  5. `history`: undo and redo stacks over `Diagram`; `commit` = validate, apply, push.
  - `editor` (composition root): one reducer holding `{ history, selection, feedback }`, keyboard handling and
    wiring. It may import every layer; no layer imports it.
- **Rationale**: Matches constitution II and `.crews/directives.md` order. Layers 1, 2, 3 and 5 are DOM-free so
  Vitest covers them without a browser. History sits last because `commit` composes validation and the model.
  Rendering receives plain props and callbacks, so it imports neither history nor the editor.

## R7. Moving and dropping: free position

- **Decision**: Nodes have a nominal footprint (width 160, height 64 layout units) used only for collision. When a
  requested position overlaps another node's footprint, the model's `findFreePosition` picks the nearest
  non-overlapping position by searching outward in a fixed ring order, so the result is deterministic. Positions
  are never encoded in the source (EC-07). Position is chosen when the operation is built, so applying it later
  (Redo) reproduces exactly the same result.
- **Rationale**: Resolves EC-06 as specified in Clarifications. A deterministic rule is testable. The footprint
  is nominal because real node sizes depend on label and shape; collision is a layout nicety, not logic.
- **Note for review**: setup.md AC3 says a node is created "at the drop location"; the nudge applies only when
  that location is occupied. The Business Analyst should confirm this reading.

## R8. Source status and failure reporting

- **Decision**: A small status machine `checking | valid | failed(reason)` per generated source string. Each
  source gets a sequence number and only the result for the newest number is applied. The canvas is wrapped in
  an error boundary. While `failed`, Copy Source is disabled and the panel states the problem instead of
  presenting the text as verified. During `checking` Copy Source stays enabled because the text is already
  the pure output for the current model.
- **Rationale**: FR-017 and AC12 require failure to be reported, and AC15 requires the copied text to be valid.
  Sequence numbers prevent a slow result for an old edit from relabelling newer source (FR-016, no stale
  output).

## R9. Keyboard operation (FR-024)

- **Decision**: The editor handles keys itself, with React Flow's built-in delete disabled so every deletion goes
  through the operation pipeline. Nodes and connections are focusable; Enter or F2 on the focused or selected
  element opens its label editor; Delete or Backspace deletes it; Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z and
  Ctrl+Y redo. Copy Source is a normal button. Adding, moving and connecting stay pointer-only as clarified.
- **Risk**: React Flow's keyboard selection of connections must be checked in a real browser; the end-to-end
  keyboard test is the early warning, and a visually hidden list of connections is the fallback.

## R10. Feedback

- **Decision**: One polite live region carries feedback messages (success, rejection, failure), and each
  rejection message is also shown visibly near the canvas. Messages come from the validation layer's catalog of
  plain-language texts, one per rejection reason, so tests assert on reasons and users read sentences.
- **Rationale**: Business rule 12 and FR-012; the live region makes the feedback available without a mouse.

## R11. Source panel default state

- **Decision**: The source panel is collapsed by default, with Copy Source always visible in the toolbar. The spec
  leaves the default to design; collapsed keeps the canvas as the primary surface.

## R12. Test tooling and commands

- **Decision**: Use only what the project already defines. Unit and integration tests: Vitest, `npm test`, files
  beside the code as `*.test.ts`. Browser tests: Playwright, `npm run test:e2e`, files in `e2e/` as `*.spec.ts`.
  No React testing library is added; the one component-level test (the canvas error boundary) uses `react-dom`
  and `act` directly.
- **Required configuration changes (tasks, not new tools)**: (a) a `vitest.config.ts` that excludes `e2e/**`
  (otherwise Vitest would try to run Playwright specs) and does not load the React Router plugin; (b) a
  Firefox project in `playwright.config.ts`, because the spec supports Firefox and SC-008 requires Copy Source
  to be checked in each supported browser. Firefox cannot be granted clipboard read permission, so the test
  reads the clipboard by pasting into a scratch field.
- **Alternatives considered**: Adding `@testing-library/react` (not needed for the one component test); component tests
  in Playwright only (slower, and cannot force a render failure).

## R13. Scope boundary

- **Decision**: The plan covers Flowchart only, as setup.md and the constitution require. The diagram carries a
  `type` field so another type can be added later without reshaping the model; nothing else is built for it.
  The deferred request for sequence and C4 diagrams needs setup.md and the constitution amended first.

## R14. Entirely in the browser, no server

- **Decision**: The deliverable is the static output of `react-router build` in SPA mode (`ssr: false`): HTML,
  JavaScript and CSS. Nothing calls an API; there is no server code, no analytics, no external font, script or
  stylesheet. The lazily loaded `mermaid` code is a same-origin chunk of the build. Any static host or local
  static file server can serve it; a secure origin (localhost or HTTPS) is needed only because the clipboard
  API requires one. Opening from the file system is not a goal (Business Analyst's choice).
- **Verification**: an end-to-end run watches every request made after load and fails on any other origin or
  any non-static request; the build output is checked to contain only static files (FR-026).
- **Alternatives considered**: Support for opening `index.html` from disk (needs relative asset paths and
  extra browser testing; declined).

## Open points carried forward (not blocking)

- Real node size is not modelled; collision uses the nominal footprint (R7).
- Connection labels have no length limit, so very long labels may be drawn truncated on the canvas; the full
  text is available in the editor and in the source.
