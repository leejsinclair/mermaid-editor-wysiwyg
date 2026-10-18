# Research: Visual Diagram Editor (Flowchart, Sequence, C4)

Resolves every open technical choice for the plan. Spec requirements are cited as FR-nnn, SC-nnn, EC-nn,
USn-ASm. The installed stack (TypeScript strict, React 19, React Router v8 SPA, Vite, Vitest, Playwright,
`mermaid` 12.2.0) is recorded in `CLAUDE.md` and is not re-decided. The archived flowchart-only plan
(`specs/_archive/001-flowchart-visual-editor-v0/research.md`) was reused where it still holds; each such
decision says so.

All Mermaid findings below were checked during planning against the installed `mermaid` 12.2.0 through
`mermaid.mermaidAPI.getDiagramFromText` under jsdom (the same set-up as `scripts/lint-mermaid.mjs`), reading
back the parser's own database (vertices and edges, actors and messages, C4 shapes, boundaries and
relationships).

## R1. Mermaid 12.2 grammar findings that shape the design

| Finding | Effect on the design |
|---------|----------------------|
| Sequence: an unquoted `#` ends the text (rest dropped); `;` is a statement separator and breaks the parse; leading and trailing spaces are trimmed | Covered by the shared escaping (R2) |
| C4: strings are `"..."` with no escape; a raw `"` breaks the parse. `title` stops at `#` and `;` and strips raw `<...>` | Covered by R2 |
| Entity codes (`#35;`, `#59;`, `#quot;` and any `#<decimal>;`) are replaced before lexing in every diagram type and decoded back when Mermaid draws | One escaping scheme works for all three types (R2) |
| A bare C4 header (`C4Context` and the other four, with or without a trailing comment) fails to parse; `C4Context` + `title X` parses | Spec Clarification (plan): bare header kept, with a notice (R6) |
| An empty C4 boundary or Deployment node (`Boundary(b, "B") {}`) fails to parse | Spec Clarification (plan): kept, with a warning naming it (R6) |
| `RelIndex(n, ...)`'s index is discarded by the parser; the C4 renderer numbers Dynamic relationships `1:`, `2:` ... by statement order. There is no numbered `BiRel` | Dynamic order is the statement order; one-way written as `RelIndex`, two-way as `BiRel` (Clarification (plan), R5) |
| Boundaries of any kind nest inside any other (Enterprise inside System parses) | "Where Mermaid allows" means: any boundary the kind offers inside any other the kind offers; only a cycle is refused (R5) |
| Deployment: `Deployment_Node`, `Node`, `Node_L`, `Node_R` are lexer tokens, but `Node_L`/`Node_R` at top level fail to parse; Containers parse at top level and inside nodes | Only `Deployment_Node` is emitted; Containers may be top level (FR-019 adds C4 elements "at the end of the order or top level") |
| `Rel` to a boundary alias parses | Not offered: Clarification (plan) limits ends to elements and Deployment nodes |
| C4 layout settings default to 4 shapes per row and 2 boundaries per row, in statement order | Canvas layout for C4 (R9) |

## R2. One label-escaping scheme for all types

- **Decision**: A single pure `escapeLabel(text)` used for every label-like field in every type (flowchart node
  and connection labels, participant labels, message text, C4 element label, description and technology, boundary
  and Deployment node labels, relationship label and technology, C4 title). Per line: each of
  `# " < > & ; % $ \ ` and the backtick, plus `{ } [ ] ( ) | , : ' * _ ~ = - /`, becomes its decimal entity
  `#<code>;`; leading and trailing spaces become `#32;`. Lines are joined with `<br/>`. Placement is per type
  (contracts/mermaid-output.md): flowchart labels and C4 strings are wrapped in double quotes; sequence
  labels and the C4 title are written bare.
- **Rationale**: Checked in planning with one label containing every SC-003 character (all listed punctuation,
  backtick, backslash, `%%`, `-->`, `end`, Markdown-like text, `$$x$$`, emoji, Japanese, a line break, a typed
  `<br/>`, leading and trailing spaces). For all three types, every field parsed and, after decoding the
  parser's placeholders and `<br>`, equalled the typed label exactly. Encoding more than strictly needed costs
  nothing in readability that the user sees (the source is read-only output) and removes per-type rule drift;
  `$` stops KaTeX math, the backtick stops Markdown strings, `<br/>` typed by the user stays literal.
- **Risk raised in the spec (Assumptions, last item)**: closed. Mermaid 12.2 C4 syntax can represent every
  SC-003 character, so SC-003 is not weakened.
- **Alternatives considered**: per-type minimal escaping (three schemes to keep in step); 001's quote-plus-five
  entities (insufficient for sequence `;` and C4 title `#`).

## R3. Canvas and UI libraries

- **Decision**: `@xyflow/react` ^12.12.0 for the **Flowchart** canvas only, used as a controlled component (the
  editor model is the only state; React Flow nodes and edges are derived on every render). `@mui/material` ^9.5.0
  with `@emotion/react` ^11 and `@emotion/styled` ^11 for controls (toolbar, toolbox, start screen, dialogs,
  property panel, source panel, status and feedback). Both were decided by the Business Analyst (`notes.md`
  section 2). Sequence and C4 canvases are our own SVG/HTML components over a pure layout function (R9),
  because their positions come from order, not from the user, and React Flow's free positioning would have to be
  fought rather than used.
- **Rationale**: as 001 R1/R1a: drag, connect handles, selection, zoom/pan/fit and `screenToFlowPosition` for
  drops, with custom renderers for nine shapes, nine connection styles and self-loops. MUI gives accessible,
  keyboard-operable controls.
- **Constraints**: no font, icon or script from a network (FR-021): system font stack, inline SVG icons. React
  Flow's built-in delete and keyboard handling is disabled so every change goes through the operation pipeline.
- **Alternatives considered**: hand-rolled SVG for flowchart (largest schedule risk); rendering Mermaid's SVG
  and overlaying interaction (no stable element hooks); `@dnd-kit` for reordering (not needed: pointer reorder is
  a small amount of code and move-up/down controls carry the keyboard path).

## R4. Operation pipeline, layering and history

- **Decision** (extends 001 R5/R6): layers in `app/`, each importing only earlier ones:
  1. `model`: types, catalogues per type, pure `apply(diagram, op)`, free-position search, ordering helpers.
  2. `validation`: `check(diagram, op)` returning accept or a reason code with a plain-language message; also
     `checkDiagram(unknown)` that validates a whole diagram (used for files, browser storage and as a test
     invariant).
  3. `generation`: `escapeLabel`, per-type generators, `generate(diagram) -> { source, notices }`.
  4. `rendering`: canvases, layout functions, toolbox, property panel, source panel, preview, feedback.
  5. `history`: snapshot undo/redo stacks; `commit(history, op)` = validate, apply, push.
  - `persistence` (adapter): codec (serialise, parse, migrate; pure, imports layers 1-2), browser store,
    tab lock, file download and open (browser APIs). Imported only by the composition layer.
  - `editor` (composition root): reducer over `{ history, selection, draft, feedback, saveStatus, lock }`,
    keyboard handling, routes wiring. Imports everything; nothing imports it.
- **History**: snapshot stacks of immutable `Diagram` values (001 R5). Unlimited depth while open (FR-008);
  never persisted (FR-046, FR-052). A drag is view state until release; a label edit is a draft until confirmed;
  a cancelled gesture commits nothing. **Merging** (new for FR-019): `commit` takes an optional merge key; a
  commit whose key equals the top entry's key replaces the top entry's "after" state instead of pushing. Arrow-key
  moves use key `move:<nodeId>`; any other commit, selection change, Undo, Redo or focus leaving the canvas
  clears the merge key.
- **Rationale**: snapshots make "undo every operation" true by construction for every type and operation kind
  (SC-004) and cannot drift from forward operations. 100 elements and 150 relationships (SC-012) is small.

## R5. Model decisions per type

- **Ids**: every item has an editor-only id, a positive safe integer never reused within a diagram (a
  per-diagram counter kept in the model). Source aliases are computed from it in generation only: flowchart
  `n<k>`, sequence `p<k>`, C4 elements `e<k>`, boundaries `b<k>`, Deployment nodes `d<k>`; they are never stored
  and never read from a file. Aliases never collide with keywords, so equal labels stay distinct
  (US4-AS4, FR-045 for names).
- **Flowchart** (001 R4 reused): header `flowchart TD`; nodes in creation order, then connections in creation
  order. Positions never reach the source (FR-003); generation is deterministic.
- **Sequence**: participants are an ordered list; messages an ordered list. Source: header, declarations
  (`participant p1 as L` / `actor p1 as L`) in order, then messages in order (FR-030). Eight message operators:
  `->>`, `-->>`, `->`, `-->`, `-x`, `--x`, `-)`, `--)` (checked: parser reports eight distinct types).
- **C4**: elements, boundaries and Deployment nodes form one ordered tree (top level and children per
  container), which is both the statement order and the layout order. Relationships are an ordered list. Element
  families and per-kind availability follow the spec table and FR-040. Deployment offers Deployment node and
  Container only, as the table states (no database, queue or external variants).
- **Nesting**: any boundary the kind offers may contain any other the kind offers; Deployment nodes contain nodes
  and Containers. A move that would put a container inside itself or a descendant is refused (FR-034).
- **Deleting a container** (Clarification (plan)): its children move to its parent at its position, keeping
  order and relationships; a deleted Deployment node's own relationships are removed.
- **Relationship ends** (Clarification (plan)): elements, plus Deployment nodes in Deployment diagrams.
- **Dynamic numbering** (FR-033): derived from position in the relationship list at generation and display time,
  never stored separately, so it cannot gap or duplicate. One-way: `RelIndex(<n>, from, to, "label"[, "tech"])`;
  two-way: `BiRel(from, to, ...)` at its position (Clarification (plan)).
- **C4 title**: optional, `title <escaped>` line after the header when non-empty (FR-054).

## R6. Source notices (C4 empty states)

- **Decision**: `generate` returns the source and a list of notices. Notices: `c4-empty` (no elements and no
  title: "Mermaid cannot draw an empty C4 diagram. Add an element or a title.") and `c4-empty-container` naming
  each empty boundary or Deployment node ("Mermaid cannot draw an empty boundary: <label>. Add an element to it
  or delete it."). The source panel shows notices; Copy Source and Copy for Markdown still copy and their
  feedback carries the notice. Rendered preview does not exist for C4, so no preview handling is needed.
- **Rationale**: Spec Clarifications (plan): model and source always agree, nothing outside the model is added,
  and the user is told honestly (principle V).

## R7. Source check and flowchart preview

- **Decision**: after each source change the editor lazily loads `mermaid` (a same-origin chunk) and runs
  `mermaid.parse` on the current source; result states `checking | valid | invalid(reason) | notice`. Each check
  carries a sequence number and only the newest result is applied (001 R8 reused). The **flowchart preview**
  (FR-053) calls `mermaid.render` with `securityLevel: "strict"` and `startOnLoad: false` into a detached
  container, under the same sequence rule; on failure it replaces the picture with an error message (never the
  previous picture). The preview has zoom, pan and fit through a simple SVG viewBox controller.
- **Alternatives considered**: no run-time check (leaves FR-012 failures unsignalled).

## R8. Fidelity tests against Mermaid's parser

- **Decision** (001 R2 extended): unit tests that need Mermaid declare the jsdom environment per file and use
  `getDiagramFromText`. They assert meaning, not just parse success: flowchart vertex shape, text, edge type and
  stroke; sequence actor type and description, message type and text; C4 shape type, label, description,
  technology, parent boundary, boundary type, relationship ends, type, label and technology, and title. A shared
  test helper decodes Mermaid's placeholders (`ﬂ°°<n>¶ß`, `ﬂ°<name>¶ß`) and `<br>` back to text.

## R9. Order-driven layout for Sequence and C4 (FR-038)

- **Decision**: pure layout functions in the rendering layer. Sequence: lifeline `x` from declaration index,
  message `y` from message index, self-messages drawn as loops on one lifeline. C4: Mermaid's own rule set,
  statement order, wrap after 4 shapes per row and 2 boundaries per row, boundaries sized to their contents.
  No free-position operation exists for these types; dragging an item only reorders (FR-039) or changes
  boundary membership (FR-034).
- **Rationale**: Mermaid draws both types from statement order, so a canvas built from the same order and row
  rules matches what Mermaid will draw in arrangement (which item is left of, above, or inside which). Pixel
  equality is not a goal; the order and grouping are tested.

## R10. Keyboard and non-drag alternatives (FR-019, FR-020)

- **Decision**: every canvas item is focusable with an accessible name ("Diamond node: Approve?", "Message 3,
  dashed open arrow, from Alice to Bob: OK"). Keys: Tab/arrow navigation among items; Enter or F2 edits the
  label; Delete removes; Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl+Y undo and redo; arrow keys move a selected
  flowchart node by 16 units (merged, R4). Toolbox items are buttons: activating one adds the element (flowchart:
  nearest free position to the visible canvas centre; others: end of order or top level). **Connect** and
  **Change end** open a dialog listing targets as "<label> (<type> <n>)" where `<n>` is the item's position among
  items of that type, so equal labels are distinguishable (EC-20). **Move up / Move down** for participants,
  messages and Dynamic relationships, and for placing a new message (add, then move). **Move to...** lists
  "Top level" and each allowed boundary or node. Reverse and Change type are menu commands on the selection.
- **Verification**: Playwright keyboard-only sessions per type; WCAG scan with `@axe-core/playwright` (R14).

## R11. Persistence in the browser (FR-042 to FR-047, FR-050)

- **Decision**: IndexedDB, database `mermaid-editor`, object store `diagrams` keyed by diagram id. Each record:
  `{ id, name, type, kind, changedAt, formatVersion, model }`. One write transaction per committed change, Undo
  or Redo (`put`), queued so writes for one diagram never overlap and the last one wins. Each enqueued write
  carries a revision number. "Saved" is shown only when `complete` arrives for the latest enqueued revision;
  while a newer revision is queued or in flight the status stays "Saving…" (FR-042, SC-015). Each record also
  holds an `owner` token (tab id plus epoch); a save is one `readwrite` transaction that reads the record's
  owner and aborts if it is not this tab's token (R12). The status shows `error` or `abort` (including `QuotaExceededError`) sets "Not saved" with
  the suggestion to save a file. If the database cannot be opened (disabled, some private windows), the editor
  runs in "storage unavailable" mode for the session (FR-043). A failing `put` of one record leaves other records
  untouched because each transaction writes only that record.
- **Listing**: the start screen reads all records, sorts by `changedAt` descending, and passes each through
  `checkDiagram` after migration; a record that fails is listed as unreadable with its reason and offers only
  Delete (FR-050, EC-11).
- **First save** (FR-042, EC-15): a new diagram gets its id in memory; the record is first written at its first
  committed change. Returning to the start screen before that writes nothing.
- **Leaving** (FR-018): a `beforeunload` handler is registered only while the status is "Not saved", a save is
  in flight, or a label draft is open.
- **Alternatives considered**: `localStorage` (synchronous, ~5 MB, string-only, no per-record transaction; a
  quota failure is harder to isolate); OPFS (less mature in Firefox for this use).

## R12. One editing tab per diagram (FR-051, EC-13, EC-14)

- **Decision**: the Web Locks API. The editing tab holds an exclusive lock named `diagram:<id>` (requested with
  `ifAvailable: true`). If it is not available, the tab shows "Open in another tab" with **Edit here instead**,
  which requests the lock with `steal: true`; the previous holder's lock callback is aborted, so that tab stops
  editing at once (drops any label draft), shows why, and offers to take it back the same way. Before any
  IndexedDB write the editor checks it still holds the lock, and the write itself is one `readwrite`
  transaction that reads the record's `owner` token and aborts if it is not this tab's. A taking-over tab first
  writes its own owner token in a transaction, then reloads the record. IndexedDB serialises these transactions,
  so a write already queued by the previous holder aborts and can never land after the hand-over; two tabs never
  both save. Browsers release locks when a
  tab closes or crashes. The start screen asks `navigator.locks.query()` to hide Delete for held diagrams and
  explain why; a `BroadcastChannel` refreshes the list when a lock changes.
- **Rationale**: built for exactly this; automatic release on crash; supported in current Chromium and Firefox.
- **Alternatives considered**: heartbeat records in storage (needs timeouts, can leave stale locks);
  BroadcastChannel alone (no crash release).

## R13. Diagram files (FR-048, FR-049, FR-050, FR-052)

- **Decision**: JSON, extension `.mermaid-editor.json`, media type `application/json`:
  `{ "format": "mermaid-editor-wysiwyg", "formatVersion": 1, "diagram": { ...model without history... } }`.
  Save: `Blob` + object URL + temporary `<a download>`; file name is the diagram name with characters outside
  letters, digits, space, `-`, `_` and `.` replaced by `_`, trimmed, at most 100 characters, empty becoming
  `diagram`. Feedback: "File offered for download" (never "saved"). Open: `<input type="file">`, `file.text()`,
  size check (at most 5 MB, otherwise refused before reading), `JSON.parse`, format check, version check
  (newer refused, older migrated), then `checkDiagram` in full. Only a fully valid diagram is given a **new** id
  and written as a new record; nothing is written otherwise.
- **Untrusted text**: labels from files or storage are rendered as React text (never `dangerouslySetInnerHTML`);
  the preview only ever sees escaped source and renders in Mermaid strict mode (DC-04).
- **Migrations**: an ordered list of pure functions `vN -> vN+1`; version 1 has none yet, but the mechanism and
  its test (a synthetic version-0 fixture) are in place so EC-12 is verified.

## R14. Test tooling and commands

- **Decision**: only what the project defines: `npm test` (Vitest) and `npm run test:e2e` (Playwright). Unit
  tests beside the code as `*.test.ts`; browser tests in `e2e/` as `*.spec.ts`.
- **New dev dependency**: `@axe-core/playwright` (for SC-009 and FR-020; the plan names it as the constitution
  requires). No React testing library: composition logic is tested through the pure reducer.
- **Configuration tasks** (not new tools): a `vitest.config.ts` that excludes `e2e/**` and does not load the
  React Router plugin; a Firefox project in `playwright.config.ts` (FR-021, SC-007); Firefox cannot be granted
  clipboard read permission, so clipboard checks read back by pasting into a scratch field (001 R12).
- **Storage and lock tests** run in real browsers (Playwright), not against an in-memory imitation, so the
  doubles cannot hide real failures; storage failure is injected with an init script that makes
  `indexedDB.open` fail or `put` raise `QuotaExceededError`. A persistent browser context covers "close and
  reopen the browser" (SC-013).

## R15. Entirely in the browser (FR-021, FR-052, SC-010)

- **Decision** (001 R14 reused): static output of `react-router build` with `ssr: false`; no API, analytics,
  external font, script or stylesheet; `mermaid` is a lazily loaded same-origin chunk. Saving and opening files
  use object URLs and the File API only. An end-to-end run records every request after load and fails on any.

## Open points carried forward (not blocking)

- Node collision uses a nominal footprint (160 x 64 units), not the drawn size (001 R7).
- Very long labels may be drawn truncated on the canvas; the full text is in the property panel and the source.
- Mermaid's own C4 drawing limits are not corrected (EC-10, spec Clarifications).
