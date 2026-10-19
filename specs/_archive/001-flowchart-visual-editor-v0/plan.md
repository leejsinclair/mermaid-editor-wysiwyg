# Implementation Plan: Flowchart Visual Editor

**Branch**: `001-flowchart-visual-editor` | **Date**: 2026-10-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-flowchart-visual-editor/spec.md`

## Summary

A browser-only visual editor in which a user drags node shapes onto a canvas, connects them and copies
generated, read-only Mermaid flowchart source. The visual model is the single source of truth. The work is cut
into five DOM-free-or-thin layers (model, validation, generation, rendering, history) plus a small composition
layer, so that correctness (operations, escaping, generation, undo) is tested exhaustively in Vitest and only
browser behaviour (drag, connect, keyboard, clipboard) is tested in Playwright. The canvas is React Flow used as
a controlled component over our own model; `mermaid` is used only to validate generated source. Details:
[research.md](research.md).

## Technical Context

**Language/Version**: TypeScript ~6.0, strict mode (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), ES2022

**Primary Dependencies**: React 19, React Router v8 (framework mode, `ssr: false`), Vite 8, `mermaid` 12 (validation only), `@xyflow/react` ^12.12.0 (new; canvas), `@mui/material` ^9.5.0 with `@emotion/react` and `@emotion/styled` (new; UI components)

**Storage**: None. The diagram lives in memory for the session (FR-023)

**Hosting**: Static files only (HTML, JavaScript, CSS) from any static host or local static file server; no application server, no API, no runtime network calls, no external fonts or scripts (FR-026)

**Testing**: Vitest (`npm test`, jsdom per file where Mermaid's parser is used) and Playwright (`npm run test:e2e`, Chromium and Firefox)

**Target Platform**: Current stable Chromium-based browsers and Firefox on desktop; served from localhost or HTTPS (clipboard API)

**Project Type**: Web application, client-only single-page app, no server component

**Performance Goals**: A change is reflected in canvas and source within 1 second for diagrams of up to 100 nodes (SC-009)

**Constraints**: Runs entirely in the browser (FR-026); no server; no persistence; source read-only and never parsed back; every control performs its advertised action

**Scale/Scope**: One diagram per session, up to about 100 nodes; one diagram type (Flowchart); nine shapes, nine connection types

## Constitution Check

*GATE: must pass before research; re-checked after design.*

| Principle or constraint | Status | How the plan meets it |
|-------------------------|--------|-----------------------|
| I. Visual model is the source of truth | Pass | Single `Diagram` value in history; React Flow state is derived; source generated and displayed read-only; no parser back into the model |
| II. Layered architecture | Pass | `model` to `validation` to `generation` to `rendering` to `history`, each importing only earlier layers; layers 1, 2, 3, 5 are pure TypeScript with no DOM; generation is a pure function that escapes labels. The `editor` composition layer sits above all of them and nothing imports it |
| III. Test-first | Pass | Verification Plan below; every obligation has a level and a command; Mermaid generation, escaping and special characters have unit obligations (VO-007, VO-008, VO-016) and grammar validation through Mermaid's parser |
| IV. Invalid operations never corrupt | Pass | Atomic `commit`; rejections return the same history; node deletion removes only incident connections; structure is never grounds for rejection (VO-020, VO-024, VO-030) |
| V. Undoable, consistent, honest feedback | Pass | Snapshot history, one entry per drag or label edit; source status machine and error boundary report failures; success shown only after the clipboard call resolves |
| Technology: TypeScript strict, web app, no server | Pass | Existing project configuration |
| Technology: flowcharts only | Pass | `Diagram.type` is `"flowchart"` only. The request for sequence and C4 diagrams is deferred in the spec and needs setup.md and the constitution amended first |
| Technology: dependencies named by the plan | Pass | New runtime dependencies named here: `@xyflow/react`, `@mui/material`, `@emotion/react`, `@emotion/styled`. No other additions; `mermaid` is already installed |
| Technology: no server component | Pass | Static build only, checked by VO-039 |
| Excluded features | Pass | No source editing or import, export, collaboration, persistence or history of sessions |
| Workflow: ambiguity raised, not assumed | Pass | Four questions were put to the Business Analyst during this planning run (see spec Clarifications); remaining open points are listed below |

Post-design re-check: unchanged, all Pass. No Complexity Tracking entry is needed.

### Open points for the Business Analyst (not blocking)

- Sequence and C4 diagrams are requested for v1 but are not specified; see "Scope change awaiting authorisation" in the Completion Report. This plan is Flowchart only until setup.md and the constitution are amended.
- Node collision uses a nominal node size (research R7), not the true drawn size.

## Project Structure

### Documentation (this feature)

```text
specs/001-flowchart-visual-editor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── operations.md
│   ├── mermaid-output.md
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
│   └── home.tsx                 # Start screen and editor
├── model/                       # layer 1: types, catalog, apply, free position
├── validation/                  # layer 2: may-commit decisions and messages
├── generation/                  # layer 3: escape, syntax tables, generate
├── rendering/                   # layer 4: canvas, node shapes, edges, toolbox, source panel, feedback
├── history/                     # layer 5: undo and redo stacks, commit
└── editor/                      # composition: reducer, keyboard, source status, clipboard action
e2e/                             # Playwright specs (*.spec.ts)
vitest.config.ts                 # new: excludes e2e, plain Vite plugins only
```

Unit tests sit beside the code they test as `*.test.ts`.

**Structure Decision**: Single client-only project using the existing `app/` and `e2e/` directories, with one folder
per architectural layer so the one-way import rule is visible in the tree and enforceable by review.

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
| VO-001 | FR-001, US1-AS1 | The editor is opened with no diagram | The user is prompted to choose a diagram type and Flowchart is the only type offered | end-to-end | planned |
| VO-002 | FR-001, US1-AS2 | The user chooses Flowchart | An empty diagram opens, "Flowchart" is displayed as its type, the source shows only the bare flowchart header, and a node can be added immediately | end-to-end | planned |
| VO-003 | FR-002, US1-AS3 | A flowchart is open and the toolbox is read | Exactly nine node shapes and nine connection types are offered, each with its own name; nothing else is offered, including no direction control | end-to-end | planned |
| VO-004 | FR-003, US1-AS4 | A shape is dragged from the toolbox and dropped on a free spot of the canvas | A node of that shape appears at the drop location with an editable default label, and the source lists exactly that node and is accepted by Mermaid's parser | end-to-end | planned |
| VO-005 | FR-003, FR-005, EC-06 | A drag ends outside the canvas, and a shape is dropped or a node moved onto an occupied spot | Outside the canvas nothing is added, a moved node stays put and history is unchanged; onto an occupied spot the node lands at the nearest free position and never overlaps another node | end-to-end | planned |
| VO-006 | FR-007, US1-AS5 | Two nodes exist and a connection type is chosen and drawn between them | The connection is shown between those nodes with the chosen type and direction, and the source contains exactly that connection | end-to-end | planned |
| VO-007 | FR-007, FR-014 | Diagrams hold a connection of each of the nine types, with and without labels | The source uses the matching operator for each, and Mermaid's parser reports the matching arrow type and stroke and the same label | unit | planned |
| VO-008 | FR-002, FR-014 | Diagrams hold a node of each of the nine shapes | The source uses the matching shape for each, and Mermaid's parser reports the matching vertex shape and label | unit | planned |
| VO-009 | FR-020, US1-AS6, SC-008 | Copy Source is used in Chromium and in Firefox | The clipboard holds exactly the current source, and success is shown only after the copy has completed | end-to-end | planned |
| VO-010 | FR-020, US1-AS7, EC-08 | The clipboard write is refused or unavailable | A failure message is shown, no success is shown, and the diagram is unchanged | integration | planned |
| VO-011 | FR-004, US2-AS1 | A node is selected | It is shown as selected and the Rename and Delete actions apply to it | end-to-end | planned |
| VO-012 | FR-004, FR-009, FR-025 | A node and a connection are selected | No control changes a node's shape, a connection's style or direction or endpoints, or the flowchart direction; the connection offers only its label for editing | end-to-end | planned |
| VO-013 | FR-005, US2-AS2, EC-07 | A node with connections is moved | Only its position changes; every connection keeps the same two endpoints; the generated source is identical before and after | unit | planned |
| VO-014 | FR-005, US2-AS2 | A node with connections is dragged to a free spot | It is shown at the new position and its connections follow it | end-to-end | planned |
| VO-015 | FR-006, US2-AS3 | A node is renamed to a valid label | The node and the source show the new label and nothing else changes | unit | planned |
| VO-016 | FR-006, FR-014, US2-AS4, SC-003, EC-01 | Labels containing quotes, brackets, parentheses, braces, pipes, arrows, ampersands, semicolons, hash signs, angle brackets, backticks, line breaks and a literal line-break tag are used on nodes and connections | Every source is accepted by Mermaid's parser, has exactly the expected nodes and connections, and decodes to the label as typed; escaping then unescaping gives back the original | unit | planned |
| VO-017 | US2-AS4, SC-003, EC-01 | A label with special characters is typed into a node in the editor | The canvas shows the label exactly as typed | end-to-end | planned |
| VO-018 | FR-006, EC-01, EC-02 | Node labels that are empty, only spaces or line breaks, multi-line and very long, and an empty connection label | Empty and blank node labels are rejected with an explanation and the previous label is kept; multi-line, very long and empty-connection labels are accepted | unit | planned |
| VO-019 | FR-009, US2-AS5 | A connection label is edited, including to empty | The label changes in the model and the source; endpoints, style and ends are unchanged | unit | planned |
| VO-020 | FR-010, US3-AS1, US3-AS2, SC-005, EC-04 | A node is deleted: in a chain, with many connections, as the only node, and with a self-loop | The result is exactly the diagram minus that node and its connections, with no connection added | unit | planned |
| VO-021 | FR-011, US3-AS3, EC-03 | One connection is deleted, including one of two identical connections | Only that connection is removed; nodes and all other connections are identical | unit | planned |
| VO-022 | FR-021, US3-AS4, EC-09 | The last node is deleted in the editor | The canvas is still editable, shows no leftover diagram, the source is the bare header, and a node can be added again | end-to-end | planned |
| VO-023 | FR-021, EC-09 | The source of an empty diagram is generated | It is exactly the flowchart header with top-to-bottom direction and is accepted by Mermaid's parser | unit | planned |
| VO-024 | FR-013, US5-AS2, SC-002, EC-03 | Diagrams with a cycle, fan-in, fan-out, disconnected nodes, self-loops, duplicate and opposite connections are built | Every operation is accepted and the source is accepted by Mermaid's parser with the same counts of nodes and connections | unit | planned |
| VO-025 | EC-02 | Two nodes have identical labels | They remain two distinct nodes in the model and in the source | unit | planned |
| VO-026 | FR-018, FR-019, US4-AS1, US4-AS2, SC-004 | Every operation kind is committed in sequence, undone back to empty, then redone | At every step the diagram equals the state at that point and the source equals the source generated for it; redo reapplies in original order | unit | planned |
| VO-027 | FR-019, US4-AS3, US4-AS4, EC-05 | Undo and redo are used on a new diagram, after deleting every node, and after a new operation follows an undo | Undo and redo are unavailable when there is nothing to reverse or reapply, and a new operation after undo clears redo | unit | planned |
| VO-028 | FR-018, US4-AS5, EC-05 | A drag and a label edit are completed, and a drag and a label edit are cancelled | One undo reverses a whole drag or a whole label edit; a cancelled drag or edit adds no history entry and changes nothing | end-to-end | planned |
| VO-029 | FR-016, SC-004, US4-AS1 | A mixed sequence of edits, undos and redos is made in the editor | After each step the number of nodes and connections on the canvas equals those in the source panel and Undo and Redo reflect availability | end-to-end | planned |
| VO-030 | FR-012, US5-AS1, SC-006 | Each kind of invalid operation is attempted: unknown node, unknown connection, unknown endpoint, blank label | Each is rejected with its fixed message, the diagram is identical to before, and history gains no entry | unit | planned |
| VO-031 | FR-008, FR-012, US5-AS1 | A connection is released over empty canvas, and a blank node label is confirmed in the editor | Each is refused, an explanation is shown, and the diagram is unchanged | end-to-end | planned |
| VO-032 | FR-022, US5-AS3 | Rename or Delete is pressed with nothing selected, and a connection is started with no type chosen | The editor states what is needed and changes nothing | end-to-end | planned |
| VO-033 | FR-022, US5-AS4, SC-007 | Every control the editor presents is used in turn | Each performs exactly its advertised action for the current selection and state, and no control exists for an unsupported action | end-to-end | planned |
| VO-034 | FR-017, US5-AS5 | The check of the generated source fails, cannot run, or answers late for an older edit | The failure is reported, Copy Source is unavailable, the source is not shown as verified, and a late answer for older source never replaces the newer status | unit | planned |
| VO-035 | FR-017, US5-AS5 | The canvas fails while drawing | A failure message is shown in place of the diagram and the edits made remain available through Undo | integration | planned |
| VO-036 | FR-015, FR-023 | The source panel, controls and a page reload are examined | The source cannot be edited, no import, export, save, collaboration or history control exists, and after a reload the diagram is gone | end-to-end | planned |
| VO-037 | FR-024 | A node is selected, renamed, deleted, undone, redone and the source copied using only the keyboard | Each action works without a pointer | end-to-end | planned |
| VO-038 | SC-009 | A diagram of 100 nodes is edited | The canvas and the source reflect a change within 1 second | end-to-end | planned |
| VO-039 | FR-026 | The built app is loaded from plain static files, a full editing session is run (add, move, rename, connect, delete, undo, redo, copy), and the build output is listed | After the static files load the browser makes no network request to any other origin or to any server endpoint, the whole session works, and the build output holds only static files | end-to-end | planned |

### Verification exemptions

| Requirement | Reason | Alternative verification |
|-------------|--------|--------------------------|
| None | - | - |

### Manual verification

| ID | Covers | Steps | Expected result | Why not automated |
|----|--------|-------|-----------------|-------------------|
| MV-001 | SC-001 | A person who does not know Mermaid, with no help, builds a flowchart of five nodes and four connections and copies its source, timed | Completed in under 5 minutes | A usability measure of a person, not of the code |
| MV-002 | FR-002, US1-AS3 | A person looks at the toolbox shapes and connection types | Each of the nine shapes and each of the nine connection types can be told apart by sight | Visual distinguishability is a human judgement; the automated check only proves distinct names |

### Behaviour checklist

Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).
