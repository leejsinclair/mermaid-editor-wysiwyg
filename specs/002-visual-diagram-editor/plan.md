# Implementation Plan: Visual Diagram Editor (Flowchart, Sequence, C4)

**Branch**: `002-visual-diagram-editor` | **Date**: 2026-10-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-visual-diagram-editor/spec.md`

## Summary

A browser-only visual editor for Mermaid Flowchart, Sequence and C4 diagrams (all five C4 kinds). The user builds
a diagram on a canvas, by pointer or keyboard alone, and copies generated, read-only Mermaid 12 source. Diagrams
are kept in the browser (IndexedDB) after every committed change and can be saved to and opened from the
editor's own JSON files; one tab edits a diagram at a time (Web Locks). The visual model is the single source of
truth; the work is cut into the constitution's five layers (model, validation, generation, rendering, history)
plus a persistence adapter and a composition root, so correctness (operations, escaping, generation, undo, file
validation) is tested exhaustively in Vitest and browser behaviour in Playwright. The Flowchart canvas is React
Flow over our model, with a Mermaid-rendered read-only preview; Sequence and C4 canvases are drawn from order by
pure layout functions matching Mermaid's arrangement. One escaping scheme, verified against Mermaid 12.2's own
parser during planning, covers every SC-003 character in all three types. Details: [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript ~6.0, strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), ES2022

**Primary Dependencies**: React 19, React Router v8 (framework mode, `ssr: false`), Vite 8, `mermaid` 12.2 (source check and flowchart preview, lazily loaded), `@xyflow/react` ^12.12.0 (new; Flowchart canvas), `@mui/material` ^9.5.0 with `@emotion/react` ^11 and `@emotion/styled` ^11 (new; controls). Dev: `@axe-core/playwright` (new; accessibility scan)

**Storage**: IndexedDB in the user's browser (one record per diagram) and user-held JSON files; no server (research R11, R13)

**Testing**: Vitest (`npm test`; jsdom per file where Mermaid's parser is used) and Playwright (`npm run test:e2e`; Chromium and Firefox)

**Target Platform**: Current stable Chromium-based browsers and Firefox on desktop; served from localhost or HTTPS (clipboard, Web Locks)

**Project Type**: Web application, client-only single-page app, static files only

**Performance Goals**: With 100 elements and 150 relationships, each edit, Undo or Redo reflected on canvas and in source within 1 s (SC-012); save status within 1 s (SC-013)

**Constraints**: No network request after load (FR-021); source read-only and never parsed back (constitution I); stored and opened data validated in full (constitution I); WCAG 2.2 AA (FR-020)

**Scale/Scope**: 3 diagram types, 7 kinds; 9 shapes, 9 connection types, 2 participant roles, 8 message types, 20 C4 element types, 4 boundary types and Deployment nodes; about 10 screens and dialogs

## Constitution Check

*GATE: must pass before research; re-checked after design.*

| Principle or constraint | Status | How the plan meets it |
|-------------------------|--------|-----------------------|
| I. Visual model is the source of truth | Pass | One `Diagram` value in history; canvases derive from it; source generated read-only; no parser back into the model; files and storage hold the model only and pass `checkDiagram` in full before use (R11, R13) |
| II. Layered architecture | Pass | `model` → `validation` → `generation` → `rendering`; `history` composes only `model` and `validation`, never `generation` or `rendering`. Layers 1, 2, 3 and 5 are pure TypeScript with no browser APIs; generation is pure and escaping (R2, R4). `persistence` is an adapter (pure codec over layers 1-2 plus browser APIs) imported only by the `editor` composition root, which nothing imports. Enforced by per-folder ESLint import and global restrictions (setup task) and review |
| III. Test-first | Pass | Verification Plan below; generation, escaping and special characters have unit obligations validated with Mermaid's parser (VO-007, VO-017, VO-036, VO-048) |
| IV. Invalid operations never corrupt | Pass | Atomic `commit`; rejections return the same history; deletion removes only incident relationships and never adds one; structure never grounds for rejection (VO-021, VO-023, VO-024, VO-100) |
| V. Undoable, consistent, honest feedback | Pass | Snapshot history, one entry per gesture; source check and preview sequencing; "Saved", "copied" and "offered for download" shown only after success; C4 notices instead of silent invalid source (R6, R7) |
| Technology: TypeScript strict, browser web app, no server | Pass | Existing configuration; static build (VO-091) |
| Technology: supported types Flowchart, Sequence, C4 (five kinds), each specified and tested | Pass | All seven kinds have operations, validation, generation and obligations |
| Technology: persistence local only, save reported after success, never damages other diagrams | Pass | IndexedDB per-record transactions; status on `complete` (VO-073, VO-085) |
| Technology: dependencies named by the plan | Pass | New: `@xyflow/react`, `@mui/material`, `@emotion/react`, `@emotion/styled`, dev `@axe-core/playwright`. No others |
| Excluded features | Pass | No source editing or import, export, collaboration, version history, server storage (VO-092) |
| Workflow: ambiguity raised, not assumed | Pass | Five questions put to the Business Analyst during this planning run, answers in spec Clarifications "Session 2026-10-18 (plan)" |

Post-design re-check: unchanged, all Pass. No Complexity Tracking entry is needed.

### Design constraints

Constraints from the design that obligations verify (cited as DC-nn):

- **DC-03** Generation is deterministic: the same diagram always gives the same source, and editor-only data
  (flowchart positions, names, ids not used as aliases) never changes it.
- **DC-04** Text from a file or from browser storage is untrusted: it is displayed only as text and never
  executed or interpreted as markup, on the canvas, in lists, in the source panel and in the preview.
- **DC-05** A file larger than 5 MB is refused before it is read.
- **DC-06** Every diagram the editor holds after an accepted operation satisfies the same rules the editor applies
  when opening a file, so nothing the editor creates could later be refused or listed as unreadable.

### Open points for the Business Analyst (not blocking)

- Node collision uses a nominal node size (research, open points).
- Mermaid's own C4 drawing limits are not corrected (EC-10).
- A later change to the nominal node size would make `checkDiagram` refuse saved flowcharts whose nodes now overlap, so it needs a format migration.
- SC-012 and SC-013 ("typical business laptop") are measured on the machine that runs VO-095, and its specification is recorded with the run.

## Project Structure

### Documentation (this feature)

```text
specs/002-visual-diagram-editor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── operations.md
│   ├── mermaid-output.md
│   ├── file-format.md
│   └── editor-ui.md
├── checklists/          # Spec quality checklist
├── tests/
│   └── behaviour-checklist.md   # Phase 1 output (integrated TDD)
└── tasks.md             # Phase 2 output (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
app/
├── root.tsx
├── routes.ts
├── routes/
│   ├── start.tsx                # start screen
│   └── editor.tsx               # /new/... and /d/:id
├── text/                        # text catalogue (FR-022)
├── model/                       # layer 1: types, catalogues, apply, free position, ordering
│   ├── flowchart/  sequence/  c4/
├── validation/                  # layer 2: operation checks, checkDiagram, messages
├── generation/                  # layer 3: escape, per-type generators, notices
├── rendering/                   # layer 4: canvases, layout, toolbox, properties, source panel, preview
│   ├── flowchart/  sequence/  c4/  layout/  shared/
├── history/                     # layer 5: undo/redo stacks, commit, merge
├── persistence/                 # adapter: codec + migrations (pure), IndexedDB store, tab lock, file I/O
└── editor/                      # composition: reducer, keyboard, save status, source check, clipboard
e2e/                             # Playwright specs (*.spec.ts), fixtures/ for diagram files
vitest.config.ts                 # new: excludes e2e, plain Vite config
```

Unit tests sit beside the code as `*.test.ts`; Mermaid fidelity tests declare the jsdom environment per file.

**Structure Decision**: Single client-only project in the existing `app/` and `e2e/` directories, one folder per
architectural layer, sub-folders per diagram type where the type changes the logic.

## Complexity Tracking

No constitution violations to justify.

## Verification Plan

### Verification commands

| ID | Command | Scope | Source |
|----|---------|-------|--------|
| unit | `npm test -- {select}` | focused | package.json script `test` (Vitest) |
| unit-all | `npm test` | broad | package.json script `test` (Vitest) |
| e2e | `npm run test:e2e -- {select}` | focused | package.json script `test:e2e` (Playwright) |
| e2e-all | `npm run test:e2e` | broad | package.json script `test:e2e` (Playwright) |

### Verification obligations

| ID | Requirements | Scenario | Expected outcome | Level | Origin |
|----|--------------|----------|------------------|-------|--------|
| VO-001 | FR-001, FR-037, US1-AS1 | The editor is opened with no diagram and the user starts a new diagram, then chooses C4 | Flowchart, Sequence and C4 are offered and nothing else; choosing C4 then offers exactly Context, Container, Component, Dynamic and Deployment | end-to-end | planned |
| VO-002 | FR-001, FR-002, US1-AS2 | Each of the seven choices (Flowchart, Sequence, five C4 kinds) is made in turn | An empty diagram opens, its type and kind are displayed, the source is that type's bare header, and no control changes the type or kind | end-to-end | planned |
| VO-003 | FR-002, FR-024, US1-AS3 | A flowchart is open and the toolbox is read | Exactly the nine node shapes and nine connection types are offered, each with its own name; nothing else is offered, including no direction control | end-to-end | planned |
| VO-004 | FR-007, FR-016, US1-AS4, EC-01 | A node of each shape is added at a free position, and at a position overlapping an existing node (EC-01) | At a free position the node is placed exactly there; at an occupied one it is placed at the nearest free position and overlaps nothing; its label is its shape name; the source lists it and is accepted by Mermaid's parser | unit | planned |
| VO-005 | US1-AS4 | A shape is dragged from the toolbox and dropped on a free spot of the canvas | A node of that shape appears at the drop location with its type name as label, and the source panel lists exactly that node | end-to-end | planned |
| VO-006 | FR-025, US1-AS5 | Two nodes exist and a connection type is chosen and drawn between them | The connection is shown between those nodes with the chosen line style and ending, and the source contains exactly that connection | end-to-end | planned |
| VO-007 | FR-013, FR-024, SC-002 | Flowcharts hold a node of each of the nine shapes and a connection of each of the nine types, with and without labels | Every source is accepted by Mermaid's parser, which reports the matching vertex shape, edge type and stroke, and the same labels | unit | planned |
| VO-008 | FR-014, US1-AS6, SC-007 | Copy Source is used in Chromium and Firefox while the source is checking and after a valid result | While checking the copy is refused without a clipboard write; after the source is valid the clipboard holds exactly the current source and success is shown only after the write completes | end-to-end | planned |
| VO-009 | FR-014, US1-AS7, EC-07 | The clipboard write is refused or unavailable when Copy Source is used (EC-07) | A failure explanation is shown, no success is shown, and the diagram is unchanged | end-to-end | planned |
| VO-010 | FR-016, US1-AS8 | A drag from the toolbox, and a drag of an existing node, end outside the canvas | No node is added, the moved node stays where it was, and Undo availability is unchanged | end-to-end | planned |
| VO-011 | FR-003, US1-AS9 | A flowchart, a sequence diagram and a C4 diagram are open in turn | Next to Copy Source the flowchart states that node positions are kept in the editor only and that Mermaid arranges the copied diagram its own way; the other types show no such statement | end-to-end | planned |
| VO-012 | FR-053, US1-AS10, EC-06 | The flowchart preview is opened by pointer and by keyboard, changes, Undo and Redo are made, and a render failure is forced (FR-053) (EC-06) | A read-only view with an accessible name shows the diagram drawn by Mermaid, offers zoom, pan and fit but no editing, updates after each change, Undo and Redo within 1 second, and on failure shows an error in place of any picture | end-to-end | planned |
| VO-013 | FR-012, FR-053, EC-06 | Generating the source fails, or the check or drawing of the source fails, cannot run, or answers late for an older source (FR-053) (EC-06); a notice-only C4 source is also checked | Failures are reported and never shown as valid; only a generation notice for a known Mermaid 12.2 C4 empty state maps parser rejection to `notice(list)`. A late answer for an older source never replaces the newer result | unit | planned |
| VO-014 | FR-014, US1-AS11 | Copy for Markdown is used, and is used with the clipboard refused | The clipboard holds the source inside a mermaid code fence, success is shown only after the copy; on refusal a failure explanation is shown and no success | end-to-end | planned |
| VO-015 | FR-003, US2-AS1, EC-01, DC-03 | A node with connections is moved to a free spot and onto another node; collision search excludes the moving node, and equally near candidates are available (EC-01, DC-03) | Only its position changes, the node never collides with itself or another node, a tie resolves by the fixed outward ring order, every connection keeps the same ends, and the source stays identical; generating twice gives the same source | unit | planned |
| VO-016 | US2-AS1 | A node with connections is dragged to a free spot | It is shown at the new position and its connections are drawn to it | end-to-end | planned |
| VO-017 | FR-006, US2-AS2, SC-003, EC-03 | Every label field of every type (flowchart node and connection, participant, message, C4 element label, description and technology, boundary and Deployment node label, relationship label and technology, C4 title) is set to each SC-003 test text, including a multiline C4 title, emoji, non-Latin script, line breaks, leading and trailing spaces, tabs and NBSP at line ends, and CR, CRLF and U+2028 line breaks (EC-03) | Every source is accepted by Mermaid's parser, holds exactly the expected items, and the parser's reading of each field, including a C4 title with `\n` content encoded as `<br/>`, decodes to the text exactly as typed | unit | planned |
| VO-018 | US2-AS2, SC-003, EC-03 | Labels with Mermaid-special characters, emoji and line breaks are typed into items of each type in the editor (EC-03) | The canvas shows each label exactly as typed | end-to-end | planned |
| VO-019 | FR-006, FR-026, US2-AS3, EC-04 | A required label (node, participant, message, C4 element, boundary, relationship, diagram name) is confirmed empty, as spaces only and as line breaks only; a multi-line and a 10 000-character label are confirmed (EC-04) | Empty and blank labels are rejected with an explanation and the previous label is kept; multi-line and very long labels are accepted | unit | planned |
| VO-020 | FR-026, US2-AS4 | A flowchart connection's label is edited, including to empty | The label changes in the diagram and the source; ends, line style and ending are unchanged | unit | planned |
| VO-021 | FR-011, US2-AS5, SC-005, EC-02 | A flowchart node is deleted: in a chain, with many connections, as the only node, and with self-loops, duplicates and connections in both directions (EC-02) | The result is exactly the diagram without that node and its incident connections, and no connection is added | unit | planned |
| VO-022 | US2-AS6 | One flowchart connection is deleted, including one of two identical connections | Only that connection is removed; nodes and all other connections are identical | unit | planned |
| VO-023 | FR-010, FR-025, US2-AS7 | Flowcharts with a cycle, fan-in, fan-out, disconnected nodes, self-loops, duplicate and opposite connections are built | Every operation is accepted, each connection is distinct, and the source is accepted by Mermaid's parser with the same counts | unit | planned |
| VO-024 | FR-009, US2-AS8, SC-006 | Each kind of invalid operation is attempted in each type (unknown item or end, blank required label, change across families, Reverse where unavailable, a boundary moved into itself, a type or parent the kind does not offer) | Each is rejected with its fixed explanation, the diagram is identical to before, and no history entry is added | unit | planned |
| VO-025 | FR-009, US2-AS8 | A blank node label and a blank message text are confirmed in the editor | Each is refused with a visible and announced explanation, and the diagram and source are unchanged | end-to-end | planned |
| VO-026 | FR-040, US2-AS9 | A node with connections is changed from rectangle to diamond and to each other shape | It keeps its label, position and connections, the source shows the new shape, and one Undo restores the old shape | unit | planned |
| VO-027 | FR-040, FR-041, US2-AS10, EC-18 | A labelled connection's line style and ending are changed, and one end is moved to another node, to its other end's node and to a node it already connects (EC-18) | It keeps its label and its other end; the source reflects the change; a resulting self-loop or duplicate is accepted; each change is one undo step | unit | planned |
| VO-028 | FR-041, US2-AS11 | Reverse is used on a one-way connection, a self-loop, a plain line and a two-way connection | The one-way connection runs the other way with the same label and type in one undo step; for the others Reverse is refused with an explanation and nothing changes | unit | planned |
| VO-029 | FR-008, US3-AS1, US3-AS2, SC-004 | In each type, every operation kind is committed in sequence, undone back to the start, then redone | At every step the diagram equals the state at that point and the source equals the source for it; Redo reapplies in the original order | unit | planned |
| VO-030 | US3-AS3 | A new diagram is opened, then its first save replaces `/new` with `/d/:id`; every operation is undone and every undo is redone across that route change (CR-5) | The keyed editor session retains its history across the route change; Undo and Redo remain correct, are unavailable when empty, and both say so to assistive technology | end-to-end | planned |
| VO-031 | FR-008, US3-AS4 | Operations are undone and a new operation is committed | Redo becomes unavailable and the undone operations cannot be reapplied | unit | planned |
| VO-032 | FR-008, US3-AS5, EC-08 | A drag and a label edit are completed and undone; a drag and a label edit are cancelled; Undo and Redo are pressed while a drag or label edit is in progress, including Ctrl+Z while a pointer drag is held and then released (EC-08) | One Undo reverses a whole drag or a whole label edit; a cancelled gesture adds no history entry; Undo or Redo during a gesture leaves no partial change | end-to-end | planned |
| VO-033 | FR-008, US3-AS6 | 2 000 operations are committed in one open diagram | All 2 000 can be undone back to the start and redone | unit | planned |
| VO-034 | FR-012, SC-004 | In each type, a mixed sequence of edits, undos and redos is made in the editor | After each step the items and relationships on the canvas equal those in the source panel | end-to-end | planned |
| VO-035 | FR-027, US4-AS1 | A sequence diagram is open and the toolbox is read | Participant, Actor and the eight message types are offered and nothing else: no notes, activations, loops, alternatives, grouping or autonumbering | end-to-end | planned |
| VO-036 | FR-013, FR-027, SC-002 | Sequence diagrams hold participants, actors and a message of each of the eight types | Every source is accepted by Mermaid's parser, which reports the matching participant or actor and message type, and the same text | unit | planned |
| VO-037 | FR-028, FR-030, US4-AS2 | Messages are added between participants, at the end and at a chosen position | Each appears at its place with its text and type, and the source lists the header, then declarations in order, then messages in order | unit | planned |
| VO-038 | FR-028, US4-AS3 | A diagram has exactly one participant and a message from it to itself is added | A self-message is created | unit | planned |
| VO-039 | FR-029, US4-AS4 | Two participants have the same label | They remain two participants in the diagram and in the source, each with its own messages | unit | planned |
| VO-040 | FR-011, FR-029, US4-AS5, SC-005 | A participant with messages, including self-messages, is deleted; separately, one message is deleted | Participant deletion removes it and exactly its messages; direct message deletion removes only that message, leaving both endpoints and every other message unchanged; nothing is added | unit | planned |
| VO-041 | FR-028, FR-039, US4-AS6 | Participants and messages are moved to new positions | The order in the diagram and in the source changes together, and each move is one undo step | unit | planned |
| VO-042 | FR-039, US4-AS6 | Participants and messages are reordered by dragging and by Move up and Move down from the keyboard, and a new message is placed at a chosen position | The canvas and the source show the new order, and one Undo restores each previous order | end-to-end | planned |
| VO-043 | FR-028, US4-AS7 | A message is added with empty or blank text, and an existing message's text is changed to blank | Each is rejected with an explanation; no message is added and the existing text is kept | unit | planned |
| VO-044 | FR-040, US4-AS8 | A participant with messages is changed to an Actor and back | It keeps its label, order and messages, and each change is one undo step | unit | planned |
| VO-045 | FR-040, FR-041, US4-AS9 | A message's type is changed to each other type, and its sender and receiver are moved to other participants | It keeps its text and order position, and each change is one undo step | unit | planned |
| VO-046 | FR-036, US5-AS1 | The user chooses C4 | The kind picker states that C4 support is experimental and that other tools may draw it differently or not at all | end-to-end | planned |
| VO-047 | FR-031, US5-AS2 | Each of the five C4 kinds is opened and its toolbox read | Each offers exactly the elements and boundaries of its row in the spec table and nothing else | end-to-end | planned |
| VO-048 | FR-013, FR-031, FR-035, SC-002 | For each C4 kind, diagrams hold every element type and boundary it offers, nested and with relationships of both directions | The header matches the kind; Mermaid's parser accepts the source and reports the matching shape type, label, description, technology, boundary type and parent, and relationship ends, direction, label and technology; no style or layout statement appears | unit | planned |
| VO-049 | FR-005, FR-032, US5-AS3 | A C4 element's label, description and technology are edited, including to empty, for types with and without technology | Label (required), description and technology (optional) update in the diagram and the source; technology is offered only where the type has one | unit | planned |
| VO-050 | FR-032, US5-AS4 | Relationships are created one-way and two-way, between elements and, in Deployment, between nodes; one is given a technology; an empty label is confirmed; a boundary is chosen as an end | A new relationship has label Uses and the chosen direction; technology is optional; the empty label is rejected and the previous label kept; a boundary end is refused with an explanation | unit | planned |
| VO-051 | FR-033, US5-AS5 | In a Dynamic diagram relationships are added, reordered and deleted, one-way and two-way | Numbers run from 1 with no gaps or duplicates in the new order; one-way relationships carry their number in the source; two-way ones are written at their position without a literal number; no operation sets a number | unit | planned |
| VO-052 | FR-033, FR-039, US5-AS5 | In a Dynamic diagram a relationship is reordered by dragging and by Move up and Move down from the keyboard | The numbers shown on the canvas and in the source follow the new order | end-to-end | planned |
| VO-053 | FR-011, US5-AS6, SC-005 | A C4 element with relationships and boundary membership is deleted; separately, one relationship is deleted; a boundary and a Deployment node with contents are deleted | Element deletion removes its relationships and membership without adding anything; direct relationship deletion removes only that relationship and leaves its endpoints and all other items unchanged; deleting a boundary or node lifts contents to its parent in order, removes a deleted node's own relationships, and announces the name of a removed boundary when children are lifted | end-to-end | planned |
| VO-054 | FR-034, US5-AS7 | Elements are placed in boundaries, boundaries are nested in each combination the kind offers, and a boundary is moved inside itself or its own descendant | Each element belongs to at most one boundary; allowed nestings are accepted and appear nested in the source; nesting into itself or a descendant is refused with an explanation | unit | planned |
| VO-055 | FR-034, US5-AS8 | In a Deployment diagram nodes are nested in nodes and Containers placed in nodes and at top level | The source nests Deployment nodes and places each Container inside its node | unit | planned |
| VO-056 | FR-034, US5-AS9 | An element with relationships is moved into a boundary, out to the top level and to another boundary; a Deployment node and a Container are re-nested | Membership changes, relationships are kept, the source shows the new grouping, and each move is one undo step | unit | planned |
| VO-057 | FR-019, FR-034, US5-AS9 | An element is moved into, out of and between boundaries by dragging and with the Move to control from the keyboard | The canvas and source show the new grouping after each move, and one Undo reverses each | end-to-end | planned |
| VO-058 | FR-054, US5-AS10 | A C4 title, including a multiline title with special characters, is set, changed and cleared in each kind (FR-054) | Mermaid accepts the escaped title line after the header, parser readback matches the typed title exactly, no line is present when empty, and each change is one undo step | unit | planned |
| VO-059 | FR-054 | A flowchart, a sequence diagram and a C4 diagram are open in turn (FR-054) | Only the C4 diagram offers a title, and the title is shown on its canvas | end-to-end | planned |
| VO-060 | FR-040, US5-AS11, EC-17 | A System with relationships inside a boundary is changed to an external System database; the change to Person, a boundary type change, a node type change, and a type the kind does not offer are attempted (EC-17) | The System keeps label, description, relationships and membership in one undo step; the other changes are not offered and are refused with an explanation if attempted | unit | planned |
| VO-061 | FR-041, US5-AS12 | A relationship, including a Dynamic one, has its source and its target moved to other elements and is reversed; Reverse is tried on a two-way relationship | It keeps its label, technology and number; reversal swaps the ends; Reverse on a two-way relationship is refused with an explanation | unit | planned |
| VO-062 | FR-019, FR-020, US6-AS1, SC-008 | In each type, using only the keyboard: add, select, move, rename, change type, connect, change an end, reorder, change boundary membership, delete, undo, redo, both copies, save a file and open a file | Every operation completes without a pointer and without dragging | end-to-end | planned |
| VO-063 | FR-019, EC-19 | A flowchart node is moved several times with the arrow keys; another action or a selection change and reselection occurs; a move onto an occupied position is made (EC-19) | Uninterrupted moves of one node are one undo step; a selection change seals the group so the later move is a separate step; an occupied target resolves to the nearest free position | unit | planned |
| VO-064 | FR-019, EC-20 | The target list for Connect and Change end is built for a diagram with equal labels (EC-20) | Every entry is distinct, telling equal labels apart by type and position number | unit | planned |
| VO-065 | FR-018, US6-AS2 | The page is closed, reloaded or left while saving has failed, while storage is unavailable, while a label edit is open, and while everything is saved | The browser asks for confirmation in the first three cases and not in the last | end-to-end | planned |
| VO-066 | FR-018, US6-AS3 | The user returns to the start screen from a diagram with changes | The diagram is in the saved list and opens unchanged | end-to-end | planned |
| VO-067 | FR-017, US6-AS4 | In each type the canvas is zoomed, panned and fitted to view | The view changes while the diagram and the source stay identical | end-to-end | planned |
| VO-068 | FR-013, US6-AS5, EC-05 | The source is generated for an empty diagram of each type and kind, with and without a C4 title (EC-05) | Flowchart and Sequence give the bare header, accepted by Mermaid's parser; C4 gives the bare header, plus the title line when set; an untitled empty C4 diagram carries the notice that Mermaid cannot draw it until an element or title is added | unit | planned |
| VO-069 | US6-AS5, EC-05 | A new diagram of each type is shown, and a diagram has every item deleted (EC-05) | The canvas stays editable and shows the hint to drag an element from the toolbox, no stale drawing remains, the source is the bare header and both copy actions work | end-to-end | planned |
| VO-070 | FR-020, US6-AS6 | Rejections, copy results, file results and save status changes occur | Each message is announced through a live region or status without moving focus, and failures are announced | end-to-end | planned |
| VO-071 | FR-020, SC-009 | The start screen, each dialog and each diagram type with content are scanned for WCAG 2.2 AA | The scan finds no violations | end-to-end | planned |
| VO-072 | FR-020 | Every item and connection on each type's canvas is examined and focused | Each has an accessible name stating its type, label and ends where it has them, and shows a visible focus indicator | end-to-end | planned |
| VO-073 | FR-042, US7-AS1, SC-013 | A committed change, an Undo and a Redo are made | Saved is shown only after each write has succeeded, within 1 second of the change; with an injected delay on one write, Saved is not shown while a newer revision is still pending | end-to-end | planned |
| VO-074 | FR-044, US7-AS2, US7-AS12 | Several diagrams of different types are saved at different times and the editor is opened | The start screen lists them most recently changed first with name, type and kind and last-changed time, offers new diagrams, and states that diagrams are kept only in this browser and suggests saving files | end-to-end | planned |
| VO-075 | FR-046, US7-AS3, US3-AS6, SC-013 | Diagrams of each type, with positions, order, boundaries and a C4 title, are saved; the browser is closed and reopened and each is opened | Each is exactly as last saved, and Undo is unavailable until a new change is made | end-to-end | planned |
| VO-076 | FR-046, FR-052, SC-014 | Diagrams of each type and kind are written to the stored form and the file form and read back | Each reads back identical, and neither form contains Mermaid source or undo history | unit | planned |
| VO-077 | FR-045, US7-AS4 | New diagrams of each type are created, renamed, renamed to blank, and two get the same name | Defaults are Untitled flowchart, Untitled sequence diagram and Untitled C4 <kind> diagram; a rename is one undo step; a blank name is rejected; the name never appears in the source; equal names stay two diagrams | unit | planned |
| VO-078 | FR-042, US7-AS5, EC-15 | A new diagram is opened and the user returns to the start screen without a committed change (EC-15) | The diagram is not listed and nothing is stored | end-to-end | planned |
| VO-079 | FR-047, US7-AS6, EC-13 | A saved diagram is deleted from the list and confirmed, deletion is cancelled once, and deletion is attempted for a diagram open in another tab (EC-13) | Only the confirmed one is removed permanently and the others are unchanged; for the diagram open elsewhere Delete is not offered and the reason is shown | end-to-end | planned |
| VO-080 | FR-048, US7-AS7 | Save file is used on diagrams with ordinary and unsafe names | A file in the editor's format with a format version is downloaded, named after the diagram with unsafe characters replaced, and the message says it was offered for download and does not claim it was stored | end-to-end | planned |
| VO-081 | FR-048 | File names are made from names with characters unsafe in file names, only unsafe characters, and very long names | Unsafe characters are replaced, the name is never empty, and it is cut to a safe length | unit | planned |
| VO-082 | FR-049, US7-AS8, SC-014 | A file saved by the editor is opened while the original diagram still exists | A new saved diagram identical to the saved one appears and the original is unchanged | end-to-end | planned |
| VO-083 | FR-049, FR-050, US7-AS9, SC-014, EC-12 | Files that are not JSON, another format, hand-edited into an invalid state (missing or dangling references, unknown types, duplicate ids, a boundary cycle, blank required labels, elements the kind does not offer, item ids that are not positive safe integers, Flowchart coordinates that are non-finite or exceed the safe footprint bound including `x = 1e308`, unknown extra properties) or from a newer version are read (EC-12) | Each is refused with its explanation and no diagram results | unit | planned |
| VO-084 | FR-049, US7-AS9 | An invalid file is opened in the editor | It is refused with an explanation, nothing is opened, and the saved list is unchanged | end-to-end | planned |
| VO-085 | FR-043, US7-AS10, SC-015 | Browser storage is full, disabled and unavailable while the user edits, with diagrams already saved | Editing continues, the status says the diagram is not saved and suggests saving a file, Saved is never shown, and the previously saved diagrams open unchanged | end-to-end | planned |
| VO-086 | FR-051, US7-AS11 | A diagram being edited (with a label edit open) is opened in a second tab and Edit here instead is chosen, then taken back | The second tab says it is open elsewhere; after taking over it shows the latest saved version; the first tab stops editing, drops the open label edit, says why and offers to take it back; the two tabs never both save, even when the first tab had a write delayed by an injected delay when the second took over | end-to-end | planned |
| VO-087 | FR-051, EC-14 | The tab editing a diagram is closed, and separately crashes, and another tab opens it (EC-14) | The other tab edits it without being asked to take over | end-to-end | planned |
| VO-088 | FR-050, EC-11 | Browser storage holds one damaged record among good ones (EC-11) | It is listed as unreadable with an explanation, can be deleted, cannot be opened, and the other diagrams open normally | end-to-end | planned |
| VO-089 | FR-050, EC-12 | A stored record and a file from an older format version are read (EC-12) | Each is upgraded to an identical diagram in meaning | unit | planned |
| VO-090 | FR-049, DC-04 | A file whose labels and name contain HTML, script tags and Mermaid directives is opened (DC-04) | Every text appears literally on the canvas, in the list, in the source panel and in the preview, and no script runs | end-to-end | planned |
| VO-091 | FR-021, FR-052, SC-010 | The built app is served as static files and a full session is run in each type: edit, undo, redo, preview, copy, save a file, open a file, reopen | After load the browser makes no network request, the whole session works, and the build output holds only static files | end-to-end | planned |
| VO-092 | FR-003, FR-004, FR-015, FR-023 | The source panel and every screen's controls are examined | The source is shown read-only in an expandable panel; no control offers source editing or import, image export, collaboration, version history, cloud storage, multi-select, copy and paste of items, grid snapping or auto-arrange | end-to-end | planned |
| VO-093 | FR-015, EC-09 | Each control that needs a selection or input is used without one, and every offered control is used with a valid selection (EC-09) | Without what it needs, each states what is needed and changes nothing; with it, each performs exactly its advertised action | end-to-end | planned |
| VO-094 | FR-038 | Sequence and C4 diagrams are laid out and a free-position move is attempted | Lifelines run left to right in declaration order and messages top to bottom in order; C4 items follow statement order wrapping at Mermaid's four shapes and two boundaries per row, nested inside their boundaries; no free-position operation exists for these types | unit | planned |
| VO-095 | SC-012 | In each type a diagram of 100 elements and 150 relationships is edited, undone and redone | Each change is reflected on the canvas and in the source within 1 second | end-to-end | planned |
| VO-096 | SC-016 | In each type, an item's type is changed within its family and a relationship's end is moved, in diagrams with many relationships | No other relationship is added, removed or reattached | unit | planned |
| VO-097 | FR-013, FR-034 | C4 diagrams contain one or more empty boundaries and empty Deployment nodes | The source still contains them, and a notice names each empty one and says Mermaid cannot draw it until it holds an element or is deleted | unit | planned |
| VO-098 | FR-013, FR-034 | A C4 diagram has an empty boundary, and an untitled C4 diagram is empty; Mermaid rejects those notice-only sources and the user copies each | Source status is `notice`, not `invalid`; the source panel shows the notice, both copy actions still copy, and the copy feedback repeats the notice | end-to-end | planned |
| VO-099 | FR-049, DC-05 | A file larger than 5 MB is opened (DC-05) | It is refused with an explanation before it is read and nothing is opened | unit | planned |
| VO-100 | FR-009, SC-006, DC-06 | Long random sequences of operations, valid and invalid, are applied in each type and kind (DC-06) | After every accepted operation the diagram passes the same full check used for opening files | unit | planned |
| VO-101 | US2-AS1, FR-020 | In each type an item is selected, another is selected, then the empty canvas is clicked and Escape pressed | The selected item is visibly distinct from the others (not by colour alone) and exposes its selected state to assistive technology; selecting another moves it; clearing removes it | end-to-end | planned |

### Verification exemptions

| Requirement | Reason | Alternative verification |
|-------------|--------|--------------------------|
| FR-022 | Keeping all user-facing text in one place is a property of how the code is organised, not behaviour a test can observe; the single light theme is a visual judgement | Review of the diff that every user-facing string comes from the text catalogue, and manual check MV-003 |

### Manual verification

| ID | Covers | Steps | Expected result | Why not automated |
|----|--------|-------|-----------------|-------------------|
| MV-001 | SC-001, FR-004 | A person who does not know Mermaid, given no help, creates a two-node, one-connection flowchart and copies its source, timed | Done in under 3 minutes, without reading or typing Mermaid syntax | A usability measure of a person |
| MV-002 | FR-002, US1-AS3, FR-027, FR-031 | A person looks at the flowchart toolbox shapes and connection types, the eight sequence message types, and each C4 kind's element types | Each item can be told apart by sight | Visual distinguishability is a human judgement; automated checks only prove distinct names |
| MV-003 | FR-022 | Review every screen and dialog | One light theme throughout; all text in English | Visual and language judgement |
| MV-004 | FR-020, SC-009 | With Orca on Linux (Firefox), build and edit one diagram of each type and trigger a rejection, a copy and a save failure | Every item and control is announced with a meaningful name; feedback and save status are announced without focus moving | Whether announcements make sense needs a person; the automated scan checks rules only |
| MV-005 | FR-038, FR-003 | Build one Sequence and one C4 diagram of each kind, copy the source, and draw it with Mermaid 12 outside the editor | Items appear in the same left-to-right, top-to-bottom and inside-boundary arrangement as on the editor's canvas | Comparing two drawings' arrangement is a visual judgement; order and grouping are already tested |

### Behaviour checklist

Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).

### Acceptance criteria trace (SC-011)

For release sign-off against the Definition of Done in `setup.md`. Each AC is read with each type's own elements.

| AC | Title | Obligations |
|----|-------|-------------|
| AC1 | Create a new diagram | VO-001, VO-002 |
| AC2 | Display available diagram elements | VO-003, VO-035, VO-047 |
| AC3 | Add a node | VO-004, VO-005, VO-037 |
| AC4 | Select and move a node | VO-015, VO-016, VO-041, VO-042, VO-101 |
| AC5 | Rename a node | VO-017, VO-018, VO-019 |
| AC6 | Create a connection | VO-006, VO-050 |
| AC7 | Edit a connection | VO-020, VO-027, VO-045, VO-061 |
| AC8 | Delete a node | VO-021, VO-040, VO-053 |
| AC9 | Delete a connection | VO-022, VO-040, VO-053 |
| AC10 | Validate editing operations | VO-024, VO-025, VO-100 |
| AC11 | Generate Mermaid source | VO-007, VO-017, VO-036, VO-048 |
| AC12 | Maintain diagram consistency | VO-034, VO-012 |
| AC13 | Undo an operation | VO-029, VO-030, VO-032 |
| AC14 | Redo an operation | VO-029, VO-030, VO-031 |
| AC15 | Copy Mermaid source | VO-008, VO-009, VO-014 |
| AC16 | Handle an empty diagram | VO-068, VO-069 |
| AC17 | Confirm supported functionality | VO-092, VO-093 |
