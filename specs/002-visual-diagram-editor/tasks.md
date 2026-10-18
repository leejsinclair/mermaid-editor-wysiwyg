---

description: "Task list for the Visual Diagram Editor (Flowchart, Sequence, C4)"
---

# Tasks: Visual Diagram Editor (Flowchart, Sequence, C4)

**Input**: Design documents from `/specs/002-visual-diagram-editor/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (operations, mermaid-output, file-format, editor-ui), quickstart.md, tests/behaviour-checklist.md

**Tests**: Required. Every obligation in the plan's Verification Plan (VO-001 to VO-101) has a test task placed before the task that delivers its behaviour. Tests are written one increment at a time, never gathered at the start.

**Organization**: Tasks are grouped by user story in priority order: US1 (P1); US2, US3, US7 (P2); US4, US5, US6 (P3). An obligation that spans every diagram type gets its test task where its first type is built; later phases carry behaviour tasks that extend the same test to the next type and make it pass.

## Format: `[ID] [P?] [Story] [Label] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1 to US7)
- **[Label]**: `[VO-nnn]` or `[NT: reason]` (see "Verification labels" at the end)

## Path Conventions

- Single client-only project: source in `app/`, browser tests in `e2e/` (plan, Project Structure)
`- Layers (constitution II, research R4): `app/model` → `app/validation` → `app/generation` → `app/rendering`; `app/history` imports only `app/model` and `app/validation`; adapter `app/persistence`; composition root `app/editor`; routes in `app/routes`; text catalogue `app/text`
- Unit tests beside the code as `*.test.ts`; tests that use Mermaid's parser declare `// @vitest-environment jsdom` at the top of the file
- Browser tests: `e2e/*.spec.ts`, fixtures in `e2e/fixtures/`
- Runs are recorded only through `python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py run --command <unit|unit-all|e2e|e2e-all> ...`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, configuration and scaffolding named by the plan. No behaviour.

- [X] T001 [NT: dependency declaration only] Add `@xyflow/react` ^12.12.0, `@mui/material` ^9.5.0, `@emotion/react` ^11 and `@emotion/styled` ^11 to `dependencies` and `@axe-core/playwright` to `devDependencies` in package.json, then run `npm install`; add no other dependency (plan, Technical Context)
- [X] T002 [P] [NT: test configuration only] Create vitest.config.ts as a plain Vite config without the React Router plugin: `include: ["app/**/*.test.ts"]`, exclude `e2e/**`, default environment `node` (research R14)
- [X] T003 [P] [NT: test configuration only] Add a `firefox` project (`devices["Desktop Firefox"]`) beside `chromium` in playwright.config.ts; keep the clipboard permissions on the Chromium project only, since Firefox cannot grant clipboard read (research R14)
- [X] T004 [P] [NT: lint configuration only] Add per-folder `no-restricted-imports` rules to eslint.config.js enforcing the layer order: `app/model` imports no other layer; `app/validation` only `app/model`; `app/generation` only model and validation; `app/rendering` only model, validation and generation; `app/history` only `app/model` and `app/validation` (not generation); `app/persistence` only model and validation; only `app/routes` and `app/root.tsx` import `app/editor`; only `app/editor` imports `app/persistence` (plan, Constitution Check II). Apply rules to non-test files only; `app/text` may be imported by any layer and `app/testing` only by tests. Ban React, React DOM, React Router, Mermaid, `@xyflow/*`, `@mui/*`, `@emotion/*`, `**/components/**` and `**/routes/**` imports from pure layers; restrict `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `indexedDB`, `fetch`, `BroadcastChannel` and `crypto` as globals. Each per-folder restriction block must preserve the shared bans (eslint.config.js)
- [X] T005 [NT: routing scaffold, behaviour arrives with US1] Create app/root.tsx (MUI `ThemeProvider` with one light theme, system font stack, no network font or icon), app/routes.ts declaring `/`, `/new/:type`, `/new/c4/:kind` and `/d/:id`, and placeholder modules app/routes/start.tsx and app/routes/editor.tsx (contracts/editor-ui.md, Routes)
- [X] T006 [P] [NT: text catalogue scaffold, FR-022 is exempt from automated verification] Create app/text/en.ts as the single English text catalogue, exporting a typed object; every later task adds its user-facing strings here and nowhere else
- [X] T007 [P] [NT: test support code] Create app/testing/mermaidReadback.ts: load `mermaid` 12.2 under jsdom, call `mermaid.mermaidAPI.getDiagramFromText(source)`, return the parser's database, and export `decode(text)` that turns Mermaid placeholders (`ﬂ°°<n>¶ß`, `ﬂ°<name>¶ß`) and `<br>` back into the typed text; `¶` is escaped so user text cannot imitate a placeholder delimiter (research R8)
- [X] T008 [P] [NT: test support code] Create e2e/support/clipboard.ts that reads the clipboard by pasting into a scratch text field (works in Chromium and Firefox), and e2e/support/storage.ts with init scripts that make `indexedDB.open` fail or `put` raise `QuotaExceededError` (research R14)
- [X] T009 [NT: baseline run, no behaviour] Record the baseline: `tdd_check.py run --phase baseline --command unit-all` and `--command e2e-all`, naming any failing tests with `--note`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types every story builds on. No behaviour.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 [NT: type declarations, no runtime behaviour] Declare the model in app/model/types.ts per data-model.md: `Diagram` (`id`; `name`: "At least one visible character; default `Untitled flowchart`, `Untitled sequence diagram`, `Untitled C4 <kind> diagram`; never in the source"; `type`: `"flowchart" | "sequence" | "c4"` "Fixed at creation"; `kind`: `"context" | "container" | "component" | "dynamic" | "deployment"` "C4 only; fixed at creation"; `title`: "C4 only; may be empty"; `nextId`: "Counter for item ids; only increases, so ids are never reused"; `content`; `changedAt`: "Set by persistence on each save, not by operations"), `Node` (`shape` one of rectangle, rounded, stadium, diamond, circle, parallelogram, cylinder, subroutine, hexagon; `label` required; `x`, `y`), `Connection` (`from`, `to` "may be equal"; `line`: `solid | dotted | thick`; `ending`: `arrow | plain | both`; `label` optional), `Participant` (`role`: `participant | actor`; `label` required), `Message` (`from`, `to` "may be equal"; `style` one of `solid-arrow`, `dashed-arrow`, `solid-open`, `dashed-open`, `solid-cross`, `dashed-cross`, `solid-async`, `dashed-async`; `text` required), C4 `Element` (`elementType`, `label` required, `description`, `technology` "only for types that have one"), `Boundary` (`boundaryType`: `enterprise | system | container | generic`; `label` required; `children`), `DeploymentNode` (`label` required, `description`, `technology`, `children`), `Relationship` (`from`, `to`; `direction`: `one-way | two-way`; `label` "required, default `Uses`"; `technology`)
- [X] T011 [NT: type declarations, no runtime behaviour] Declare the operation union in app/model/operations.ts (every operation of contracts/operations.md), the rejection reason codes in app/validation/reasons.ts (`blankName`, `unknownItem`, `unknownEndpoint`, `blankLabel`, `blankMessage`, `blankRelationshipLabel`, `noSuchField`, `crossFamily`, `notOfferedInKind`, `typeFixed`, `endNotAllowed`, `reverseSelf`, `reverseUndirected`, `unknownShape`, `outOfRange`, `parentNotAllowed`, `nestingCycle`, `needsSelection`) and the commit outcome `{ committed: true } | { committed: false, rejection? }`
- [X] T012 [NT: text only, FR-022 is exempt from automated verification] Add every rejection message of contracts/operations.md "Rejection messages" and every refusal of contracts/file-format.md to app/text/en.ts

**Checkpoint**: Foundation ready. Run `unit-all` as a `checkpoint`.

---

## Phase 3: User Story 1 - Build a flowchart and copy its Mermaid source (Priority: P1) 🎯 MVP

**Goal**: Choose a type, build a flowchart on the canvas, see valid generated source, and copy it.

**Independent Test**: Create a new flowchart, add two nodes, connect them, and copy the source; the clipboard holds valid Mermaid flowchart source with exactly those two nodes and one connection.

**Deliberate deferral**: VO-012 (US1-AS10, the flowchart preview) is delivered in Phase 5, because its scenario needs Undo and Redo.

### Placing nodes and generating flowchart source

- [X] T013 [US1] [VO-004] Write the failing test in app/model/flowchart/addNode.test.ts (jsdom): for each of the nine shapes, `addNode(shape, position)` at a free position places the node exactly there; at a position overlapping an existing node it lands at the nearest free position and overlaps nothing (EC-01); its label is the shape name ("Rectangle", "Rounded rectangle", ...); the generated source lists it and `mermaidReadback` accepts it
- [X] T014 [US1] [VO-004] Create app/model/flowchart/catalogue.ts: the nine shapes (rectangle, rounded, stadium, diamond, circle, parallelogram, cylinder, subroutine, hexagon) with their display names ("Rectangle", "Rounded rectangle", ...) and the nine connection types (line `solid | dotted | thick` by ending `arrow | plain | both`) with their own names, so the failing test of T013 can import the shape names
- [X] T015 [US1] [VO-004] Implement `addNode` in app/model/flowchart/apply.ts (label = shape name, id from `nextId`, which only increases) with the `unknownShape` check in app/validation/flowchart.ts, and the node lines of the generator in app/generation/flowchart.ts behind `generate(diagram) -> { source, notices }` in app/generation/generate.ts (header `flowchart TD`, aliases `n<k>`, positions never written; contracts/mermaid-output.md)
- [X] T016 [US1] [VO-007] Write the failing test in app/generation/flowchart.fidelity.test.ts (jsdom): flowcharts holding a node of each of the nine shapes and a connection of each of the nine types, with and without labels, are accepted by Mermaid's parser, which reports the matching vertex shape, edge type and stroke, and the same labels
- [X] T017 [US1] [VO-007] Complete app/generation/flowchart.ts: the nine shape forms and the nine connection operators of contracts/mermaid-output.md, `-->|"label"|` with the label omitted when empty, nodes in creation order then connections in creation order

### Start screen and new diagrams

- [X] T018 [US1] [VO-001] Write the failing test in e2e/start-screen.spec.ts: with no diagram, starting a new diagram offers Flowchart, Sequence and C4 and nothing else; choosing C4 opens "Choose a C4 kind" offering exactly Context, Container, Component, Dynamic and Deployment
- [X] T019 [US1] [VO-001] Build the start screen in app/routes/start.tsx (heading "Mermaid diagram editor", region "New diagram" with **Flowchart**, **Sequence**, **C4**) and the kind dialog in app/rendering/shared/C4KindDialog.tsx, navigating to `/new/:type` or `/new/c4/:kind` (contracts/editor-ui.md)
- [X] T020 [US1] [VO-002] Write the failing test in e2e/new-diagram.spec.ts, starting with Flowchart: the chosen choice opens an empty diagram, its type is displayed, the source panel shows the bare header `flowchart TD`, and no control changes the type or kind (Sequence and C4 kinds are added in Phases 7 and 8)
- [X] T021 [US1] [VO-002] Implement `newDiagram(type, kind?)` in app/model/newDiagram.ts (empty content for every type, `nextId` 1, empty title)
- [X] T022 [US1] [VO-002] Implement `commit(history, operation)` in app/history/history.ts (validate, apply, push; rejection returns the same reference; undo and redo arrive in US3) and the editor reducer over `{ history, selection, feedback }` in app/editor/reducer.ts
- [X] T023 [US1] [VO-002] Build the editor screen in app/routes/editor.tsx and app/editor/Editor.tsx: header with the type label (for example "Flowchart"), canvas region "Diagram canvas", and the collapsed "Mermaid source" disclosure in app/rendering/shared/SourcePanel.tsx showing the read-only generated source

### Toolbox, canvas, connections

- [X] T024 [US1] [VO-003] Write the failing test in e2e/flowchart-toolbox.spec.ts: the flowchart toolbox offers exactly the nine node shapes and the nine connection types, each with its own name, and nothing else, including no direction control
- [X] T025 [US1] [VO-003] Build app/rendering/shared/Toolbox.tsx from the type's catalogue, with one button per shape and per connection type, each with its own name and inline SVG icon
- [X] T026 [US1] [VO-005] Write the failing test in e2e/flowchart-add.spec.ts: dragging a shape from the toolbox onto a free spot of the canvas shows a node of that shape at the drop location labelled with its type name, and the source panel lists exactly that node
- [X] T027 [US1] [VO-005] Build app/rendering/flowchart/FlowchartCanvas.tsx as a controlled `@xyflow/react` canvas derived from the model (built-in delete and keyboard handling off, research R3), custom node renderers for the nine shapes in app/rendering/flowchart/ShapeNode.tsx, and drop handling that converts the drop point with `screenToFlowPosition` and commits `addNode`. In controlled mode keep a local drag overlay of positions over the model-derived nodes, apply React Flow `dimensions` changes to that local state, and commit only on `onNodeDragStop` when the pointer is inside the pane bounds
- [X] T028 [US1] [VO-006] Write the failing test in e2e/flowchart-connect.spec.ts: with two nodes, choosing a connection type and drawing it between them shows the connection between those nodes with the chosen line style and ending, and the source contains exactly that connection
- [X] T029 [US1] [VO-006] Implement `addConnection(from, to, line, ending, label?)` in app/model/flowchart/apply.ts with the `unknownEndpoint` check in app/validation/flowchart.ts ("Self-loops, duplicates, opposite directions allowed and distinct")
- [X] T030 [US1] [VO-006] Render connections in app/rendering/flowchart/ConnectionEdge.tsx (three line styles, three endings, self-loops) and arm the chosen connection type from the toolbox so a handle-to-handle drag commits `addConnection`
- [X] T031 [US1] [VO-010] Write the failing test in e2e/flowchart-drag-cancel.spec.ts: a drag from the toolbox and a drag of an existing node that end outside the canvas add no node, leave the moved node where it was, and leave Undo availability unchanged
- [X] T032 [US1] [VO-010] Implement node dragging as view state until release in app/rendering/flowchart/FlowchartCanvas.tsx, committing `moveNode` (app/model/flowchart/apply.ts, requested position only; nearest free position arrives with VO-015) only when released on the canvas, and cancelling toolbox drops outside the canvas. Give each drag a token held in the canvas component: Undo, Redo and Escape (reported by app/editor through a prop) cancel the token, so a later release commits nothing and adds no history entry (EC-08)
- [X] T033 [US1] [VO-011] Write the failing test in e2e/flowchart-layout-note.spec.ts: next to Copy Source a flowchart states "Node positions are kept in the editor only. Mermaid arranges the copied diagram its own way." (Sequence and C4, which show no such statement, are added in Phases 7 and 8)
- [X] T034 [US1] [VO-011] Build app/rendering/shared/Toolbar.tsx with the flowchart-only layout note beside Copy Source

### Copying source

- [X] T035 [US1] [VO-008] Write the failing test in e2e/copy-source.spec.ts, run in Chromium and Firefox: Copy Source leaves the clipboard holding exactly the current source, refuses without a clipboard write while status is `checking`, and shows success only after the copy completes
- [X] T036 [US1] [VO-008] Implement `copyText` in app/editor/clipboard.ts; refuse with explanation and no clipboard write while status is `checking` or `invalid`, or if generation throws; allow `valid` and notice-only `notice(list)` sources, and report success only after the clipboard write resolves through app/rendering/shared/Feedback.tsx
- [X] T037 [US1] [VO-009] Write the failing test in e2e/copy-failure.spec.ts: with the clipboard write refused or unavailable (EC-07), Copy Source shows a failure explanation, no success, and the diagram is unchanged
- [X] T038 [US1] [VO-009] Handle a rejected or missing clipboard in app/editor/clipboard.ts and report the failure through app/rendering/shared/Feedback.tsx
- [X] T039 [US1] [VO-014] Write the failing test in e2e/copy-markdown.spec.ts: Copy for Markdown leaves the clipboard holding ```` ```mermaid ```` + newline + source + newline + ```` ``` ````, success shown only after the copy; with the clipboard refused a failure explanation is shown and no success
- [X] T040 [US1] [VO-014] Add **Copy for Markdown** to app/rendering/shared/Toolbar.tsx using the fence of contracts/mermaid-output.md and the same feedback path

### Source check

- [X] T041 [US1] [VO-013] Write the failing test in app/editor/sourceCheck.test.ts with injected generator and parser doubles: generation/parser failure, unavailable parser and late stale answers are reported correctly; a generated C4 notice-only source whose parser rejects maps to `notice(list)`, not `invalid`, and a no-notice parser rejection remains invalid (EC-06)
- [X] T042 [US1] [VO-013] Implement app/editor/sourceCheck.ts with states `checking | valid | invalid(reason) | notice(list)`: lazy-load Mermaid, parse current source, map parser rejection to `notice(list)` only when generation returned a known C4 notice, drop late answers through app/rendering/shared/latestOnly.ts, and show the status in app/rendering/shared/SourcePanel.tsx (research R7)

**Checkpoint**: User Story 1 works on its own. Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 4: User Story 2 - Edit and delete flowchart elements safely (Priority: P2)

**Goal**: Move, rename, retype, reconnect, reverse and delete flowchart items with diagram and source in step.

**Independent Test**: Build A→B→C, move and rename B, label a connection, then delete B; A and C remain, both connections to B are gone, and no A→C connection exists in the diagram or the source.

### Moving

- [X] T043 [US2] [VO-015] Write the failing test in app/model/flowchart/moveNode.test.ts: moving a connected node changes only its position and keeps source endpoints; search excludes the moving node, avoids overlap, and deterministically resolves equally near positions by fixed outward ring order
- [X] T044 [US2] [VO-015] Resolve `moveNode` to the nearest free position in app/model/flowchart/apply.ts, and return `{ committed: false }` with no history entry for a move to the same position in app/history/history.ts (contracts/operations.md, Commit)
- [X] T045 [US2] [VO-016] Write the failing test in e2e/flowchart-move.spec.ts: dragging a connected node to a free spot shows it at the new position with its connections drawn to it
- [X] T046 [US2] [VO-016] Make app/rendering/flowchart/FlowchartCanvas.tsx and app/rendering/flowchart/ConnectionEdge.tsx redraw connections from the committed positions after a move

### Labels

- [X] T047 [US2] [VO-019] Write the failing test in app/validation/label.test.ts, starting with flowchart node labels: confirming an empty label, spaces only and line breaks only is rejected with `blankLabel` and the previous label is kept (EC-04); a multi-line label and a 10 000-character label are accepted (participant, message, C4 and diagram-name labels are added in Phases 6 to 8)
- [X] T048 [US2] [VO-019] Implement `isVisible(text)` in app/validation/label.ts ("Visible" means it contains at least one character that is not white space or a line break) and `setLabel(itemId, field, text)` for flowchart nodes in app/model/flowchart/apply.ts with the `blankLabel`, `unknownItem` and `noSuchField` checks in app/validation/flowchart.ts
- [X] T049 [US2] [VO-020] Write the failing test in app/model/flowchart/connectionLabel.test.ts: editing a connection's label, including to empty, changes the label in the diagram and the source, and its ends, line style and ending are unchanged
- [X] T050 [US2] [VO-020] Accept `setLabel` on connections (label optional) in app/model/flowchart/apply.ts and app/validation/flowchart.ts
- [X] T051 [US2] [VO-017] Write the failing test in app/generation/escape.fidelity.test.ts (jsdom), starting with flowchart node and connection labels: each label set to each SC-003 test text (every listed punctuation, backtick, backslash, `%%`, `-->`, `end`, Markdown-like text, `$$x$$`, emoji, non-Latin script, a typed `<br/>`, line breaks, leading and trailing spaces, tabs and NBSP at line ends, CR, CRLF and U+2028 line breaks, EC-03) gives source accepted by Mermaid's parser that holds exactly the expected items, and the parser's reading decodes to the text exactly as typed (sequence and C4 fields are added in Phases 7 and 8)
- [X] T052 [US2] [VO-017] Implement `escapeLabel(text)` in app/generation/escape.ts per contracts/mermaid-output.md (per line, each of `# " < > & ; % $ \` backtick `{ } [ ] ( ) | , : ' * _ ~ = - /` becomes `#<decimal code>;`; CRLF, CR, U+2028 and U+2029 are first normalised to LF; any leading or trailing white space character (space, tab, NBSP, other Unicode white space) becomes its decimal entity such as `#32;`; lines joined with `<br/>`) and apply it to every label in app/generation/flowchart.ts
- [X] T053 [US2] [VO-018] Write the failing test in e2e/labels-special.spec.ts, starting with flowchart nodes and connections: labels with Mermaid-special characters, emoji and line breaks typed in the editor are shown on the canvas exactly as typed (EC-03)
- [X] T054 [US2] [VO-018] Build the label editor in app/rendering/shared/PropertiesPanel.tsx (multi-line draft, Enter confirms, Escape cancels, draft kept in the reducer and committed only on confirm) and render labels as React text with preserved line breaks in app/rendering/flowchart/ShapeNode.tsx and app/rendering/flowchart/ConnectionEdge.tsx

### Deleting and structure

- [X] T055 [US2] [VO-021] Write the failing test in app/model/flowchart/deleteNode.test.ts: deleting a node in a chain, with many connections, as the only node, and with self-loops, duplicates and connections in both directions (EC-02) gives exactly the diagram without that node and its incident connections, and no connection is added
- [X] T056 [US2] [VO-021] Implement `deleteItem(node)` in app/model/flowchart/apply.ts (node and every incident connection removed)
- [X] T057 [US2] [VO-022] Write the failing test in app/model/flowchart/deleteConnection.test.ts: deleting one connection, including one of two identical connections, removes only that one; nodes and all other connections are identical
- [X] T058 [US2] [VO-022] Implement `deleteItem(connection)` in app/model/flowchart/apply.ts (removal by id)
- [X] T059 [US2] [VO-023] Write the failing test in app/model/flowchart/structures.test.ts (jsdom): flowcharts with a cycle, fan-in, fan-out, disconnected nodes, self-loops, duplicate and opposite connections are built; every operation is accepted, each connection is distinct, and Mermaid's parser accepts the source with the same counts
- [X] T060 [US2] [VO-023] Make sure app/validation/flowchart.ts rejects no operation for structure alone and app/generation/flowchart.ts writes every distinct connection (FR-010, FR-025)

### Invalid operations

- [X] T061 [US2] [VO-024] Write the failing test in app/history/rejections.test.ts, starting with Flowchart: each kind of invalid operation that exists at this point (unknown item or end, blank required label) is rejected with its fixed explanation, the diagram is identical to before, and no history entry is added (Reverse refusals are tested in T069; Sequence and C4 cases, including cross-family and not-offered-type changes, are added in Phases 7 and 8)
- [X] T062 [US2] [VO-024] Map each reason code to its catalogue message in app/validation/messages.ts and guarantee in app/history/history.ts that a rejection returns the same history reference
- [X] T063 [US2] [VO-025] Write the failing test in e2e/rejections.spec.ts, starting with a blank node label: confirming it is refused with a visible and announced explanation, and the diagram and source are unchanged (blank message text is added in Phase 7)
- [X] T064 [US2] [VO-025] Show rejections in the live region of app/rendering/shared/Feedback.tsx and near the canvas, keeping the previous label in app/rendering/shared/PropertiesPanel.tsx

### Changing types, ends and direction

- [X] T065 [US2] [VO-026] Write the failing test in app/model/flowchart/changeShape.test.ts: a connected node changed from rectangle to diamond and to each other shape keeps its label, position and connections, the source shows the new shape, and one Undo-equivalent step (one history entry) restores the old shape
- [X] T066 [US2] [VO-026] Implement `changeType(node, shape)` in app/model/flowchart/apply.ts with the `unknownShape` check in app/validation/flowchart.ts (all flowchart shapes are one family, so `crossFamily` does not arise here)
- [X] T067 [US2] [VO-027] Write the failing test in app/model/flowchart/changeConnection.test.ts: a labelled connection's line style and ending are changed and one end is moved to another node, to its other end's node and to a node it already connects (EC-18); it keeps its label and its other end, the source reflects each change, a resulting self-loop or duplicate is accepted, and each change is one history entry
- [X] T068 [US2] [VO-027] Implement `changeType(connection, line, ending)` and `moveEnd(linkId, end, targetId)` in app/model/flowchart/apply.ts with `unknownEndpoint` in app/validation/flowchart.ts
- [X] T069 [US2] [VO-028] Write the failing test in app/model/flowchart/reverse.test.ts: Reverse on a one-way connection makes it run the other way with the same label and type in one history entry; on a self-loop it is refused with `reverseSelf`, on a plain line and a two-way connection with `reverseUndirected`, and nothing changes
- [X] T070 [US2] [VO-028] Implement `reverse(linkId)` in app/model/flowchart/apply.ts with `reverseSelf` and `reverseUndirected` in app/validation/flowchart.ts

### Controls

- [X] T071 [US2] [VO-093] Write the failing test in e2e/controls.spec.ts, starting with Flowchart: each control that needs a selection or input (Delete, Change type, Connect…, Change end…, Reverse, Rename) used without one states what is needed and changes nothing (EC-09); with a valid selection each performs exactly its advertised action; dragging a connection end to another node moves that end (Sequence and C4 controls are added in Phases 7 and 8)
- [X] T072 [US2] [VO-093] [VO-027] Add drag of a connection end to another node in app/rendering/flowchart/ConnectionEdge.tsx committing `moveEnd`, and add **Connect…**, **Change type** (family only), **Change end…**, **Reverse** and **Delete** to app/rendering/shared/PropertiesPanel.tsx, with a `needsSelection` explanation when nothing suitable is selected
- [X] T073 [US2] [VO-093] Build the target dialog for **Connect…** and **Change end…** in app/rendering/shared/TargetDialog.tsx, listing allowed targets as "<label> (<type> <n>)"

**Checkpoint**: User Stories 1 and 2 work. Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 5: User Story 3 - Undo and redo every edit (Priority: P2)

**Goal**: Every committed edit can be undone and redone in order, with canvas, source and preview in step.

**Independent Test**: Add, move, rename, connect, edit a label and delete, undo all in order, then redo all; at each step canvas and source match the expected state.

- [X] T074 [US3] [VO-029] Write the failing test in app/history/history.test.ts, starting with Flowchart: every operation kind is committed in sequence, undone back to the start, then redone; at every step the diagram equals the state at that point and the source equals the source for it; Redo reapplies in the original order (Sequence and C4 are added in Phases 7 and 8)
- [X] T075 [US3] [VO-029] Implement snapshot `undo`, `redo`, `canUndo` and `canRedo` in app/history/history.ts ("Undo and redo stacks of Diagram snapshots, unlimited, cleared on close"); `undo` and `redo` return the same reference when there is nothing to do
- [X] T076 [US3] [VO-031] Write the failing test in app/history/redoCleared.test.ts: after operations are undone and a new operation is committed, Redo is unavailable and the undone operations cannot be reapplied
- [X] T077 [US3] [VO-031] Empty the redo stack on every commit in app/history/history.ts
- [X] T078 [US3] [VO-033] Write the failing test in app/history/longHistory.test.ts: 2 000 operations committed in one open diagram can all be undone back to the start and redone
- [X] T079 [US3] [VO-033] Keep history unbounded and free of per-step cost growth in app/history/history.ts
- [X] T080 [US3] [VO-030] Write the failing test in e2e/undo-redo.spec.ts: on a new diagram Undo is unavailable; after every operation is undone Undo is unavailable and after every undo is redone Redo is unavailable; both are exposed as disabled to assistive technology
- [X] T081 [US3] [VO-030] Add **Undo** and **Redo** (disabled when unavailable) to app/rendering/shared/Toolbar.tsx (handlers and state as props from app/editor/Editor.tsx; no import from app/editor, app/persistence or app/history) and the shortcuts Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl+Y in app/editor/keyboard.ts, routed through app/editor/reducer.ts
- [X] T082 [US3] [VO-032] Write the failing test in e2e/gestures.spec.ts: one Undo reverses a whole completed drag and a whole confirmed label edit; a cancelled drag and a cancelled label edit add no history entry; Undo or Redo pressed during a drag or label edit leaves no partial change (EC-08)
- [X] T083 [US3] [VO-032] In app/editor/reducer.ts, discard an open label draft and signal the canvas to cancel any drag in progress (the drag token of T032; the reducer cannot see the drag itself) before Undo or Redo, and commit a drag only on release and a label only on confirm
- [X] T084 [US3] [VO-034] Write the failing test in e2e/canvas-source-agree.spec.ts, starting with Flowchart: after each step of a mixed sequence of edits, undos and redos, the items and relationships on the canvas equal those in the source panel (Sequence and C4 are added in Phases 7 and 8)
- [X] T085 [US3] [VO-034] Regenerate source and redraw the canvas from the history's present after every commit, Undo and Redo in app/editor/Editor.tsx
- [X] T086 [US1] [VO-012] Write the failing test in e2e/flowchart-preview.spec.ts: the preview is opened by pointer and by keyboard; it is a read-only region named "Preview as Mermaid draws it" showing the diagram drawn by Mermaid, offers zoom, pan and fit and no editing, updates within 1 second after each change, Undo and Redo; with a render failure forced it shows "Mermaid could not draw this diagram: <reason>" in place of any picture (EC-06)
- [X] T087 [US1] [VO-012] Build app/rendering/flowchart/Preview.tsx: lazy `mermaid.render` with `securityLevel: "strict"` and `startOnLoad: false` into a detached container, the shared "latest only" helper in app/rendering/shared/latestOnly.ts (not an import of app/editor, which would break the layer order) so a late result never replaces a newer one, the error in place of the picture on failure, and an SVG viewBox controller with **Zoom in**, **Zoom out**, **Fit to view**; add the **Preview as Mermaid draws it** toggle to app/rendering/shared/Toolbar.tsx (flowchart only)

**Checkpoint**: User Stories 1 to 3 work. Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 6: User Story 7 - Keep diagrams and come back to them (Priority: P2)

**Goal**: Diagrams are kept in the browser after every committed change and can be saved to and opened from files.

**Independent Test**: Build a flowchart, close and reopen the browser, open it from the start screen: identical, including positions. Save it to a file, delete it, open the file: identical again.

Tests in this phase start with Flowchart; Sequence and C4 diagrams are added to them in Phases 7 and 8.

### Pure codec, names and validation

- [X] T088 [US7] [VO-077] Write the failing test in app/model/names.test.ts: new diagrams are named "Untitled flowchart", "Untitled sequence diagram" and "Untitled C4 <kind> diagram"; a rename is one history entry; a blank name is rejected with `blankName`; the name never appears in the source; two diagrams with equal names stay two diagrams
- [X] T089 [US7] [VO-077] Set the default names in app/model/newDiagram.ts and implement `renameDiagram(name)` in app/model/apply.ts with the `blankName` check in app/validation/diagram.ts, and add the header **Rename** control (confirm, cancel, rejection shown as for labels) to app/editor/Editor.tsx
- [X] T090 [US7] [VO-083] Write the failing test in app/persistence/openFile.test.ts: reject non-JSON, wrong-format and newer-version files, and invalid files with missing/dangling references, unknown types, duplicate ids, boundary cycles, blank required labels, unsupported kinds, or non-finite/out-of-safe-bound Flowchart coordinates including `x = 1e308`; assert the expected explanation and no resulting diagram
- [X] T091 [US7] [VO-083] Implement `checkDiagram(unknown)` in app/validation/checkDiagram.ts using whitelisted fields; enforce all data-model invariants, including finite Flowchart coordinates with `abs(x) <= Number.MAX_SAFE_INTEGER - 160` and `abs(y) <= Number.MAX_SAFE_INTEGER - 64`, non-overlapping footprints, valid links and labels, C4 tree rules, and matching type/kind/content
- [X] T092 [US7] [VO-083] Implement `parseFile(text)` in app/persistence/codec.ts: JSON, `format` equals `mermaid-editor-wysiwyg`, `formatVersion` an integer no greater than the current one, migration, then `checkDiagram`, stopping at the first failure (contracts/file-format.md, Open steps 2 to 5)
- [X] T093 [US7] [VO-099] Write the failing test in app/persistence/openFile.size.test.ts: a file larger than 5 MB is refused with `fileTooLarge` before its contents are read (its `text()` is never called), and nothing is opened (DC-05)
- [X] T094 [US7] [VO-099] Implement `openFile(file)` in app/persistence/openFile.ts checking `file.size` against 5 MB before `file.text()`, then `parseFile`
- [X] T095 [US7] [VO-076] Write the failing test in app/persistence/codec.test.ts, starting with Flowchart: diagrams written to the stored form and the file form and read back are identical, and neither form contains Mermaid source or undo history
- [X] T096 [US7] [VO-076] Implement `toRecord`, `fromRecord`, `toFile` in app/persistence/codec.ts (record `{ id, name, type, kind, changedAt, formatVersion, model }`; file `{ format: "mermaid-editor-wysiwyg", formatVersion: 1, diagram }` without `id` and `changedAt`)
- [X] T097 [US7] [VO-089] Write the failing test in app/persistence/migrations.test.ts: a stored record and a file at a synthetic format version 0 are upgraded to a diagram identical in meaning (EC-12)
- [X] T098 [US7] [VO-089] Implement the ordered migration list in app/persistence/migrations.ts (pure `vN -> vN+1` functions) with the synthetic version-0 step, applied by app/persistence/codec.ts
- [X] T099 [US7] [VO-081] Write the failing test in app/persistence/fileName.test.ts: names with characters unsafe in file names, only unsafe characters, and very long names give file names with unsafe characters replaced by `_`, never empty (`diagram`), cut to 100 characters, ending `.mermaid-editor.json`
- [X] T100 [US7] [VO-081] Implement `safeFileName(name)` in app/persistence/fileName.ts (keep letters, digits, space, `-`, `_` and `.`; trim; at most 100 characters)
- [X] T101 [US7] [VO-100] Write the failing test in app/validation/checkDiagram.property.test.ts, starting with Flowchart: long seeded random sequences of valid and invalid operations are applied; after every accepted operation the diagram passes `checkDiagram` (DC-06) (Sequence and the five C4 kinds are added in Phases 7 and 8)
- [X] T102 [US7] [VO-100] Correct any operation in app/model/flowchart/apply.ts or check in app/validation/flowchart.ts that lets a diagram through which `checkDiagram` would refuse

### Browser storage and save status

- [X] T103 [US7] [VO-073] Write the failing test in e2e/save-status.spec.ts: after a committed change, an Undo and a Redo, "Saved" is shown only after each write has succeeded, within 1 second of the change
- [X] T104 [US7] [VO-073] Implement app/persistence/store.ts over IndexedDB (database `mermaid-editor`, store `diagrams`, key `id`, one `put` transaction per write, writes for one diagram queued so the last wins) and the save status in app/editor/saveStatus.ts (`new`, `saving`, `saved` only on `complete` of the latest enqueued revision (each enqueued write carries a revision number; while a newer one is queued or in flight the status stays `saving`), `not-saved`, `unavailable`), shown as `role="status"` in the editor header
- [X] T105 [US7] [VO-078] Write the failing test in e2e/unsaved-new.spec.ts: a new diagram left for the start screen without a committed change is not listed and nothing is stored (EC-15)
- [X] T106 [US7] [VO-078] Assign a new diagram id in memory and write its first record only at its first committed change; keep history, draft and lock in an `app/editor` session store keyed by diagram id outside route components; replace `/new/...` with `/d/:id` after first save without discarding that session, skip the loader when the diagram is already in memory, and redirect `/new/c4` without a kind or unknown `:type` to `/`
- [X] T107 [US7] [VO-074] Write the failing test in e2e/saved-list.spec.ts: diagrams of different types saved at different times are listed most recently changed first with name, type and kind and last-changed time; new diagrams are offered; the screen states that diagrams are kept only in this browser and suggests saving files
- [X] T108 [US7] [VO-074] Create app/editor/library.ts as the only way routes reach app/persistence (list, load, remove, import file, lock query), then build the "Saved diagrams" list and the note "Diagrams are kept only in this browser. Save files as a backup." in app/routes/start.tsx, reading records through that facade over app/persistence/store.ts sorted by `changedAt` descending
- [X] T109 [US7] [VO-075] Write the failing test in e2e/reopen.spec.ts with a persistent browser context: diagrams with positions are saved, the browser is closed and reopened, and each opens exactly as last saved with Undo unavailable until a new change (C4 order, boundaries and title, and Sequence order are added in Phases 7 and 8)
- [X] T110 [US7] [VO-075] Load `/d/:id` through app/editor/library.ts (over app/persistence/store.ts and `fromRecord`) in app/routes/editor.tsx with an empty history
- [X] T111 [US7] [VO-088] Write the failing test in e2e/unreadable-record.spec.ts: with one damaged record among good ones (EC-11), it is listed "Cannot be read: <reason>", can be deleted, cannot be opened, and the other diagrams open normally
- [X] T112 [US7] [VO-088] List records that fail migration or `checkDiagram` as unreadable with **Delete…** only in app/routes/start.tsx
- [X] T113 [US7] [VO-079] Write the failing test in e2e/delete-diagram.spec.ts: deleting a saved diagram and confirming removes only it permanently, cancelling keeps it, and for a diagram open in another tab Delete is not offered and "Open in another tab" is shown (EC-13)
- [X] T114 [US7] [VO-079] Add **Delete…** with the "Delete diagram?" confirmation to app/routes/start.tsx and `remove(id)` to app/persistence/store.ts; hide Delete for a diagram whose lock `navigator.locks.query()` reports held, through app/persistence/lock.ts; the start route reaches both only through app/editor/library.ts
- [X] T115 [US7] [VO-085] Write the failing test in e2e/storage-failure.spec.ts, using e2e/support/storage.ts: with storage full, disabled and unavailable while the user edits and diagrams are already saved, editing continues, the status says the diagram is not saved and suggests saving a file, "Saved" is never shown, and the earlier diagrams open unchanged
- [X] T116 [US7] [VO-085] Handle `error`, `abort` and `QuotaExceededError` as "Not saved. Save a file to keep a copy." and an unopenable database as "Browser storage is unavailable. Save a file to keep a copy." in app/editor/saveStatus.ts and app/persistence/store.ts, writing only the one record per transaction

### Files

- [X] T117 [US7] [VO-080] Write the failing test in e2e/save-file.spec.ts: Save file on diagrams with ordinary and unsafe names downloads a file in the editor's format with a format version, named after the diagram with unsafe characters replaced, and the message says "The file was offered for download." and never that it was stored
- [X] T118 [US7] [VO-080] Implement `downloadFile(diagram)` in app/persistence/fileIo.ts (`Blob`, object URL, temporary `<a download>`) and **Save file** in app/rendering/shared/Toolbar.tsx (handler as a prop from app/editor/Editor.tsx; no import from app/editor or app/persistence)
- [X] T119 [US7] [VO-082] Write the failing test in e2e/open-file.spec.ts: opening a file saved by the editor while the original still exists adds a new saved diagram identical to the saved one and leaves the original unchanged
- [X] T120 [US7] [VO-082] Add **Open file…** to app/routes/start.tsx: `openFile`, then a new id and `changedAt` and a new record through app/editor/library.ts (over app/persistence/store.ts); no existing record is touched
- [X] T121 [US7] [VO-084] Write the failing test in e2e/open-invalid-file.spec.ts using fixtures in e2e/fixtures/: an invalid file is refused with its explanation, nothing is opened, and the saved list is unchanged
- [X] T122 [US7] [VO-084] Show the refusal from `openFile` in the start screen's live region in app/routes/start.tsx and write nothing
- [X] T123 [US7] [VO-090] Write the failing test in e2e/untrusted-text.spec.ts with a fixture whose labels and name contain HTML, script tags and Mermaid directives (DC-04): every text appears literally on the canvas, in the list, in the source panel and in the preview, and no script runs
- [X] T124 [US7] [VO-090] Remove any path that interprets stored or file text as markup in app/rendering/ and app/routes/start.tsx (React text only, never `dangerouslySetInnerHTML`; the preview sees only escaped source)

### One editing tab

- [X] T125 [US7] [VO-086] Write the failing test in e2e/two-tabs.spec.ts: a diagram being edited with a label edit open is opened in a second tab, which says it is open elsewhere; choosing **Edit here instead** shows the latest saved version; the first tab stops editing, drops the open label edit, says why and offers **Take it back**; the two tabs never both save
- [X] T126 [US7] [VO-086] Implement app/persistence/lock.ts over Web Locks (`diagram:<id>`, `ifAvailable`, `steal`), the "Open in another tab" and "Editing moved to another tab" dialogs in app/rendering/shared/LockDialogs.tsx (state and handlers as props from app/editor/Editor.tsx; no import from app/editor or app/persistence), reloading the record after taking over, and a lock check before every write in app/persistence/store.ts; each record holds an `owner` token (tab id plus epoch), each save is one `readwrite` transaction that reads the owner and aborts if it is not this tab's, and taking over writes the new owner in a transaction before reloading the record (so a write queued before the takeover cannot land after it); refresh the start screen through a `BroadcastChannel`
- [X] T127 [US7] [VO-087] Write the failing test in e2e/lock-release.spec.ts: when the editing tab is closed, and separately when it crashes, another tab opens the diagram and edits it without being asked to take over (EC-14)
- [X] T128 [US7] [VO-087] Hold the lock only for the life of the editing page in app/persistence/lock.ts so the browser releases it on close or crash

**Checkpoint**: User Stories 1, 2, 3 and 7 work for Flowchart. Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 7: User Story 4 - Build a sequence diagram (Priority: P3)

**Goal**: Participants, actors and ordered messages, reordered by drag and by keyboard, with source in order.

**Independent Test**: Create a sequence diagram with two participants and one actor, add three messages of different types, reorder one message, and copy the source; declarations come first, then messages in the displayed order.

### Generation and operations

- [X] T129 [US4] [VO-036] Write the failing test in app/generation/sequence.fidelity.test.ts (jsdom): sequence diagrams holding participants, actors and a message of each of the eight types are accepted by Mermaid's parser, which reports the matching participant or actor and message type, and the same text
- [X] T130 [US4] [VO-036] Implement app/generation/sequence.ts (header `sequenceDiagram`, `participant p<k> as <esc>` / `actor p<k> as <esc>`, operators `->>`, `-->>`, `->`, `-->`, `-x`, `--x`, `-)`, `--)`) and dispatch to it from app/generation/generate.ts
- [X] T131 [US4] [VO-037] Write the failing test in app/model/sequence/addMessage.test.ts: messages added between participants at the end and at a chosen position each appear at their place with text and type, and the source lists the header, then declarations in order, then messages in order
- [X] T132 [US4] [VO-037] Create app/model/sequence/catalogue.ts and implement `addParticipant(role, index?)` (label `Participant` or `Actor`) and `addMessage(from, to, style, text, index?)` (default text is the message type name, FR-007) in app/model/sequence/apply.ts with `unknownEndpoint` in app/validation/sequence.ts
- [X] T133 [US4] [VO-038] Write the failing test in app/model/sequence/selfMessage.test.ts: in a diagram with exactly one participant, a message from it to itself is created
- [X] T134 [US4] [VO-038] Accept `from` equal to `to` in app/validation/sequence.ts
- [X] T135 [US4] [VO-039] Write the failing test in app/model/sequence/equalLabels.test.ts (jsdom): two participants with the same label remain two participants in the diagram and in the source, each with its own messages
- [X] T136 [US4] [VO-039] Derive declaration aliases `p<k>` from ids, never from labels, in app/generation/sequence.ts
- [X] T137 [US4] [VO-040] Write the failing test in app/model/sequence/deleteParticipant.test.ts: participant deletion removes it and exactly its messages including self-messages; separately delete one message and assert both participants and every other message remain unchanged
- [X] T138 [US4] [VO-040] Implement `deleteItem(participant)` and `deleteItem(message)` in app/model/sequence/apply.ts; direct message deletion leaves its endpoints and other messages unchanged
- [X] T139 [US4] [VO-041] Write the failing test in app/model/sequence/reorder.test.ts: participants and messages moved to new positions change order in the diagram and the source together, each move one history entry; an index out of range is rejected with `outOfRange`
- [X] T140 [US4] [VO-041] Implement `reorder(itemId, toIndex)` for participants and messages in app/model/sequence/apply.ts with `outOfRange` in app/validation/sequence.ts
- [X] T141 [US4] [VO-043] Write the failing test in app/model/sequence/blankMessage.test.ts: adding a message with empty or blank text and changing an existing message's text to blank are each rejected with `blankMessage`; no message is added and the existing text is kept
- [X] T142 [US4] [VO-043] Apply `isVisible` to message text in `addMessage` and `setLabel` in app/validation/sequence.ts
- [X] T143 [US4] [VO-044] Write the failing test in app/model/sequence/changeRole.test.ts: a participant with messages changed to an Actor and back keeps its label, order and messages, each change one history entry
- [X] T144 [US4] [VO-044] Implement `changeType(participant, role)` in app/model/sequence/apply.ts
- [X] T145 [US4] [VO-045] Write the failing test in app/model/sequence/changeMessage.test.ts: a message's type changed to each other type, and its sender and receiver moved to other participants, keeps its text and order position, each change one history entry
- [X] T146 [US4] [VO-045] Implement `changeType(message, style)`, `moveEnd` and `reverse` (refused with `reverseSelf` for a self-message) for messages in app/model/sequence/apply.ts and app/validation/sequence.ts
- [X] T147 [US4] [VO-017] [VO-019] [VO-024] [VO-029] [VO-100] Extend app/generation/escape.fidelity.test.ts (participant labels, message text), app/validation/label.test.ts (participant label, message text), app/history/rejections.test.ts, app/history/history.test.ts and app/validation/checkDiagram.property.test.ts to Sequence, and run them to Red
- [X] T148 [US4] [VO-017] [VO-019] [VO-024] [VO-029] [VO-100] Make the Sequence cases of those tests pass by applying `escapeLabel` in app/generation/sequence.ts and completing app/validation/sequence.ts and the sequence rules of app/validation/checkDiagram.ts
- [X] T149 [US4] [VO-076] [VO-083] Extend app/persistence/codec.test.ts and app/persistence/openFile.test.ts to Sequence and run them to Red
- [X] T150 [US4] [VO-076] [VO-083] Make the Sequence cases of those tests pass in app/persistence/codec.ts

### Layout and canvas

- [X] T151 [US4] [VO-094] Write the failing test in app/rendering/layout/sequenceLayout.test.ts: lifelines run left to right in declaration order and messages top to bottom in order, self-messages loop on one lifeline, and no free-position operation exists for Sequence (C4 is added in Phase 8)
- [X] T152 [US4] [VO-094] Implement the pure layout in app/rendering/layout/sequenceLayout.ts (lifeline `x` from declaration index, message `y` from message index)
- [X] T153 [US4] [VO-035] Write the failing test in e2e/sequence-toolbox.spec.ts: the sequence toolbox offers Participant, Actor and the eight message types and nothing else: no notes, activations, loops, alternatives, grouping or autonumbering
- [X] T154 [US4] [VO-035] Build app/rendering/sequence/SequenceCanvas.tsx from app/rendering/layout/sequenceLayout.ts (focusable lifelines and messages, the eight message drawings) and give app/rendering/shared/Toolbox.tsx the sequence catalogue
- [X] T155 [US4] [VO-042] Write the failing test in e2e/sequence-reorder.spec.ts: participants and messages reordered by dragging and by **Move up** / **Move down** from the keyboard, and a new message placed at a chosen position, show the new order on the canvas and in the source, and one Undo restores each previous order; also, a message is created by activating a message type (the target list asks for sender then receiver; with one participant selected both ends default to it) and by dragging from one lifeline to another, and a message end is moved by dragging it to another lifeline
- [X] T156 [US4] [VO-042] [VO-045] Add pointer reordering to app/rendering/sequence/SequenceCanvas.tsx and **Move up** / **Move down** to app/rendering/shared/PropertiesPanel.tsx, each committing one `reorder`; make toolbox buttons add a participant or actor on activation and open app/rendering/shared/TargetDialog.tsx for a message type (default text is the type name), add lifeline-to-lifeline drag creation of a message, and drag of a message end to another lifeline committing `moveEnd`
- [X] T157 [US4] [VO-002] [VO-011] [VO-018] [VO-025] [VO-034] [VO-093] Extend e2e/new-diagram.spec.ts, e2e/flowchart-layout-note.spec.ts (no note for Sequence), e2e/labels-special.spec.ts, e2e/rejections.spec.ts (blank message text), e2e/canvas-source-agree.spec.ts and e2e/controls.spec.ts to Sequence and run them to Red
- [X] T158 [US4] [VO-002] [VO-011] [VO-018] [VO-025] [VO-034] [VO-093] Make the Sequence cases of those specs pass in app/editor/Editor.tsx and app/rendering/shared/PropertiesPanel.tsx
- [X] T159 [US4] [VO-075] Extend e2e/reopen.spec.ts to a Sequence diagram's order and run it to Red
- [X] T160 [US4] [VO-075] Make the Sequence case of e2e/reopen.spec.ts pass

**Checkpoint**: Sequence works alongside Flowchart. Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 8: User Story 5 - Build a C4 diagram of any of the five kinds (Priority: P3)

**Goal**: Each C4 kind with its own elements, boundaries, relationships, title, nesting and Dynamic numbering.

**Independent Test**: For each of the five kinds, build a small diagram with that kind's elements and one relationship and copy the source; the header matches the kind and the source holds exactly what was built.

### Generation

- [X] T161 [US5] [VO-048] Write the failing test in app/generation/c4.fidelity.test.ts (jsdom): for each C4 kind, diagrams holding every element type and boundary it offers, nested and with relationships of both directions, have the kind's header; Mermaid's parser accepts the source and reports the matching shape type, label, description, technology, boundary type and parent, and relationship ends, direction, label and technology; no style or layout statement appears
- [X] T162 [US5] [VO-048] Create app/model/c4/catalogue.ts (families Person; System, System database, System queue; Container, Container database, Container queue; Component, Component database, Component queue; each with its external variant; per-kind availability exactly as spec.md table FR-031 and data-model.md: Context offers the Person and System families; Container offers Person, `system` and `system-ext` only, and the Container family; Component and Dynamic offer Person, `system`(-ext) only, `container`(-ext) only, and the Component family; Deployment offers Deployment node and `container` only) and implement app/generation/c4.ts (tree depth first, then relationships; `Rel`, `BiRel`; empty trailing arguments omitted, `""` before a non-empty one; aliases `e<k>`, `b<k>`, `d<k>`)
- [X] T163 [US5] [VO-097] Write the failing test in app/generation/c4.notices.test.ts: C4 diagrams with one or more empty boundaries and empty Deployment nodes keep them in the source, and one `c4-empty-container` notice names each empty one
- [X] T164 [US5] [VO-097] Return `c4-empty-container` notices from app/generation/c4.ts with the catalogue text "Mermaid cannot draw an empty boundary: <label>. Add an element to it or delete it."
- [X] T165 [US5] [VO-058] Write the failing test in app/model/c4/title.test.ts (jsdom): in each kind, set/change/clear a title including multiple lines; Mermaid 12.2 accepts the escaped `title` line and parser readback decodes it exactly; no title line is present when empty, and each change is one history entry
- [X] T166 [US5] [VO-058] Implement `setTitle(text)` in app/model/c4/apply.ts and the `title <esc>` line in app/generation/c4.ts

### Operations

- [X] T167 [US5] [VO-049] Write the failing test in app/model/c4/editElement.test.ts: a C4 element's label, description and technology are edited, including to empty, for types with and without technology; the label is required, description and technology optional, and technology is accepted only where the type has one (`noSuchField` otherwise)
- [X] T168 [US5] [VO-049] Implement `addElement(elementType, parentId?, index?)` (label = type name) and `setLabel` for `label`, `description`, `technology` in app/model/c4/apply.ts with `notOfferedInKind`, `blankLabel` and `noSuchField` in app/validation/c4.ts, and add the description and technology fields (technology only for types that have one) to app/rendering/shared/PropertiesPanel.tsx using the label editor's confirm and cancel
- [X] T169 [US5] [VO-050] Write the failing test in app/model/c4/relationships.test.ts: relationships created one-way and two-way, between elements and in Deployment between nodes, get label "Uses" and the chosen direction; technology is optional; an empty label is rejected with `blankRelationshipLabel` and the previous label kept; a boundary chosen as an end is refused with `endNotAllowed`
- [X] T170 [US5] [VO-050] Implement `addRelationship(from, to, direction)` and relationship `setLabel` in app/model/c4/apply.ts with `unknownEndpoint`, `endNotAllowed` and `blankRelationshipLabel` in app/validation/c4.ts
- [X] T171 [US5] [VO-051] Write the failing test in app/model/c4/dynamic.test.ts: in a Dynamic diagram relationships added, reordered and deleted, one-way and two-way, are numbered from 1 with no gaps or duplicates in the new order; one-way ones carry their number in the source (`RelIndex(<n>, ...)`), two-way ones are written `BiRel` at their position without a literal number; no operation sets a number
- [X] T172 [US5] [VO-051] Implement `reorder(relationshipId, toIndex)` (Dynamic only) in app/model/c4/apply.ts and derive numbers as 1 + position in app/generation/c4.ts ("Dynamic number = 1 + index in `relationships`", never stored)
- [X] T173 [US5] [VO-053] Write failing tests in app/model/c4/delete.test.ts and e2e/c4-delete.spec.ts: element deletion removes its relationships and membership; deleting one relationship removes only that relationship and leaves endpoints and all other items; deleting a boundary or Deployment node lifts contents in order, removes its own relationships, and announces the removed boundary's name when children are lifted
- [X] T174 [US5] [VO-053] Implement `deleteItem` for elements, relationships, boundaries and Deployment nodes in app/model/c4/apply.ts with tree helpers in app/model/c4/tree.ts; report a status notice naming a deleted boundary when its children are lifted
- [X] T175 [US5] [VO-054] Write the failing test in app/model/c4/nesting.test.ts: elements placed in boundaries belong to at most one; every nesting the kind offers is accepted and appears nested in the source; moving a boundary inside itself or a descendant is refused with `nestingCycle`
- [X] T176 [US5] [VO-054] Implement `addContainer(boundaryType or node, parentId?)` and `moveToParent(itemId, parentId or top, index?)` in app/model/c4/apply.ts with `parentNotAllowed` and `nestingCycle` in app/validation/c4.ts
- [X] T177 [US5] [VO-055] Write the failing test in app/model/c4/deployment.test.ts (jsdom): in a Deployment diagram, nodes nested in nodes and Containers placed in nodes and at top level give source that nests `Deployment_Node` blocks and places each Container inside its node
- [X] T178 [US5] [VO-055] Write `Deployment_Node(d<k>, ...) { ... }` blocks and top-level Containers in app/generation/c4.ts and allow Containers at top level and in nodes in app/validation/c4.ts
- [X] T179 [US5] [VO-056] Write the failing test in app/model/c4/moveMembership.test.ts: an element with relationships moved into a boundary, out to the top level and to another boundary, and a Deployment node and a Container re-nested, change membership, keep relationships, show the new grouping in the source, each one history entry
- [X] T180 [US5] [VO-056] Make `moveToParent` keep relationships and order in app/model/c4/apply.ts and app/model/c4/tree.ts
- [X] T181 [US5] [VO-060] Write the failing test in app/model/c4/changeType.test.ts: a System with relationships inside a boundary changed to an external System database keeps label, description, relationships and membership in one history entry; a change to Person (`crossFamily`), of a boundary or node type (`typeFixed`) and to a type the kind does not offer (`notOfferedInKind`, for example a System database in a Container diagram or a Container database in a Component diagram) are refused (EC-17)
- [X] T182 [US5] [VO-060] Implement `changeType(element, elementType)` in app/model/c4/apply.ts with the family, `typeFixed` and kind checks in app/validation/c4.ts
- [X] T183 [US5] [VO-061] Write the failing test in app/model/c4/relationshipEnds.test.ts: a relationship, including a Dynamic one, has its source and target moved to other elements and is reversed; it keeps label, technology and number; Reverse on a two-way relationship is refused with `reverseUndirected`
- [X] T184 [US5] [VO-061] Implement `moveEnd`, `reverse` and `changeType(relationship, direction)` for relationships in app/model/c4/apply.ts and app/validation/c4.ts
- [X] T185 [US5] [VO-017] [VO-019] [VO-024] [VO-029] [VO-100] Extend app/generation/escape.fidelity.test.ts (including multiline C4-title exact readback), app/validation/label.test.ts, app/history/rejections.test.ts, app/history/history.test.ts and app/validation/checkDiagram.property.test.ts to the five C4 kinds, and run them to Red
- [X] T186 [US5] [VO-017] [VO-019] [VO-024] [VO-029] [VO-100] Make the C4 cases of those tests pass in app/generation/c4.ts, app/validation/c4.ts and the C4 rules of app/validation/checkDiagram.ts
- [X] T187 [US5] [VO-076] [VO-083] Extend app/persistence/codec.test.ts and app/persistence/openFile.test.ts to the five C4 kinds (including a boundary cycle and elements the kind does not offer) and run them to Red
- [X] T188 [US5] [VO-076] [VO-083] Make the C4 cases of those tests pass in app/persistence/codec.ts

### Layout, canvas and controls

- [X] T189 [US5] [VO-094] Add the C4 cases of the layout obligation in app/rendering/layout/c4Layout.test.ts: items follow statement order wrapping at four shapes and two boundaries per row, nested inside their boundaries, with no free-position operation, and run them to Red
- [X] T190 [US5] [VO-094] Implement the C4 layout in app/rendering/layout/c4Layout.ts so those cases pass
- [X] T191 [US5] [VO-046] Write the failing test in e2e/c4-kind-picker.spec.ts: choosing C4 shows the kind picker stating "C4 support in Mermaid is experimental. Other tools may draw these diagrams differently or not at all."
- [X] T192 [US5] [VO-046] Add the experimental note to app/rendering/shared/C4KindDialog.tsx
- [X] T193 [US5] [VO-047] Write the failing test in e2e/c4-toolbox.spec.ts: each of the five kinds offers exactly the elements and boundaries of its row in the spec table and nothing else (for example no System database in Container, no Container database in Component); activating an element button adds it at the top level, a relationship is created through the target list (source then target, one selected element defaults both ends to it) and by dragging from one element to another, and a relationship end is moved by dragging it to another element
- [X] T194 [US5] [VO-047] [VO-061] Build app/rendering/c4/C4Canvas.tsx from app/rendering/layout/c4Layout.ts (focusable elements, boundaries, nodes and relationships) and give app/rendering/shared/Toolbox.tsx the per-kind C4 catalogue; make toolbox buttons add elements on activation, open app/rendering/shared/TargetDialog.tsx for a relationship, and add element-to-element drag creation of a relationship and drag of a relationship end committing `moveEnd`
- [X] T195 [US5] [VO-052] Write the failing test in e2e/c4-dynamic-reorder.spec.ts: in a Dynamic diagram a relationship reordered by dragging and by **Move up** / **Move down** from the keyboard shows numbers on the canvas and in the source that follow the new order
- [X] T196 [US5] [VO-052] Show Dynamic numbers on relationships in app/rendering/c4/C4Canvas.tsx and enable pointer reordering and **Move up** / **Move down** for Dynamic relationships
- [X] T197 [US5] [VO-057] Write the failing test in e2e/c4-move-to.spec.ts: an element moved into, out of and between boundaries by dragging and with **Move to…** from the keyboard shows the new grouping on the canvas and in the source after each move, and one Undo reverses each
- [X] T198 [US5] [VO-057] Build **Move to…** in app/rendering/shared/MoveToDialog.tsx ("Top level" and each allowed boundary or node) and drop-into-boundary dragging in app/rendering/c4/C4Canvas.tsx
- [X] T199 [US5] [VO-059] Write the failing test in e2e/c4-title.spec.ts: of a flowchart, a sequence diagram and a C4 diagram, only the C4 diagram offers a title, and the title is shown on its canvas
- [X] T200 [US5] [VO-059] Add the title field to app/rendering/shared/PropertiesPanel.tsx for C4 only and draw it in app/rendering/c4/C4Canvas.tsx
- [X] T201 [US5] [VO-098] Write the failing test in e2e/c4-notices.spec.ts: for empty-boundary and untitled-empty C4, Mermaid rejects notice-only source, status is `notice` not `invalid`, both copy actions work, and feedback repeats the notice
- [X] T202 [US5] [VO-098] Show notice status and notices in app/rendering/shared/SourcePanel.tsx; allow notice-only sources through both copy actions and append notices to copy feedback in app/rendering/shared/Toolbar.tsx
- [X] T203 [US5] [VO-002] [VO-011] [VO-018] [VO-034] [VO-093] [VO-075] Extend e2e/new-diagram.spec.ts (five C4 kinds), e2e/flowchart-layout-note.spec.ts (no note for C4), e2e/labels-special.spec.ts, e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts and e2e/reopen.spec.ts (C4 order, boundaries and title) to C4 and run them to Red
- [X] T204 [US5] [VO-002] [VO-011] [VO-018] [VO-034] [VO-093] [VO-075] Make the C4 cases of those specs pass

**Checkpoint**: All three types work. Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 9: User Story 6 - Work confidently in the editor (Priority: P3)

**Goal**: Keyboard-only operation, zoom and pan, empty states, announcements and protection from losing work, for every type.

**Independent Test**: Using only the keyboard, build a two-element diagram with one connection, rename, change a type, delete, undo, redo and copy the source; then make saving fail and try to reload, and confirm the warning.

- [X] T205 [US6] [VO-063] Write the failing test in app/history/merge.test.ts: uninterrupted arrow moves of one node make one history entry; after selecting another item and reselecting the node, a later move is a second undo step; focus loss and non-arrow actions seal the group; occupied targets resolve to the nearest free position (EC-19)
- [ ] T206 [US6] [VO-063] Implement `commit(history, operation, mergeKey?)` and `seal(history)` in app/history/history.ts; merge arrow moves only while the node gesture group remains unsealed, sealing on another commit, selection change, Undo, Redo or focus leaving the canvas in app/editor/keyboard.ts and app/editor/reducer.ts
- [ ] T207 [US6] [VO-064] Write the failing test in app/editor/targets.test.ts: the target list for Connect and Change end, built for a diagram with equal labels, has every entry distinct, telling equal labels apart by type and position number (EC-20)
- [ ] T208 [US6] [VO-064] Implement `targetList(diagram, linkKind)` in app/model/targets.ts (a pure function of the model, so rendering does not import the composition root) ("<label> (<type> <n>)", `<n>` the position among items of that type) and use it in app/rendering/shared/TargetDialog.tsx, which receives the target list as a prop from app/editor/Editor.tsx
- [ ] T209 [US6] [VO-068] Write the failing test in app/generation/empty.test.ts (jsdom): the source of an empty diagram of each type and kind, with and without a C4 title, is the bare header for Flowchart and Sequence (accepted by Mermaid's parser) and for C4 the bare header plus the title line when set; an untitled empty C4 diagram carries the `c4-empty` notice (EC-05)
- [ ] T210 [US6] [VO-068] Return the `c4-empty` notice ("Mermaid cannot draw an empty C4 diagram. Add an element or a title.") from app/generation/c4.ts
- [ ] T211 [US6] [VO-069] Write the failing test in e2e/empty-state.spec.ts: a new diagram of each type, and a diagram with every item deleted, keep an editable canvas showing "Drag an element from the toolbox, or activate one, to start.", no stale drawing remains, the source is the bare header and both copy actions work (EC-05)
- [ ] T212 [US6] [VO-069] Add the empty hint to app/rendering/flowchart/FlowchartCanvas.tsx, app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx
- [ ] T213 [US6] [VO-062] Write the failing test in e2e/keyboard-only.spec.ts: in each type, using only the keyboard, add, select, move, rename, change type, connect, change an end, reorder, change boundary membership, delete, undo, redo, both copies, save a file and open a file all complete without a pointer and without dragging
- [ ] T214 [US6] [VO-062] Make flowchart toolbox buttons add a node on activation (at the nearest free position to the visible canvas centre) in app/rendering/shared/Toolbox.tsx (Sequence and C4 activation was added in T156 and T194), and add Tab focus among canvas items (focus selects), Enter/F2 to edit, Delete/Backspace to delete in app/editor/keyboard.ts
- [ ] T215 [US6] [VO-062] Make **Connect…** (added for Flowchart in T072) available in app/rendering/shared/PropertiesPanel.tsx for Sequence and C4 as well, opening app/rendering/shared/TargetDialog.tsx
- [ ] T216 [US6] [VO-067] Write the failing test in e2e/zoom-pan.spec.ts: in each type the canvas is zoomed, panned and fitted to view, and the diagram and source stay identical
- [ ] T217 [US6] [VO-067] Add **Zoom in**, **Zoom out**, **Fit to view** to app/rendering/shared/Toolbar.tsx, driving React Flow's viewport for Flowchart and a shared SVG viewBox controller in app/rendering/shared/viewport.ts for Sequence and C4
- [ ] T218 [US6] [VO-065] Write the failing test in e2e/leave-page.spec.ts: closing, reloading or leaving while saving has failed, while storage is unavailable and while a label edit is open asks for confirmation; while everything is saved it does not
- [ ] T219 [US6] [VO-065] Register a `beforeunload` handler in app/editor/Editor.tsx only while the status is not "Saved" for a diagram with a committed change, a save is in flight, or a label draft is open
- [ ] T220 [US6] [VO-066] Write the failing test in e2e/return-to-start.spec.ts: returning to the start screen from a diagram with changes lists it, and it opens unchanged
- [ ] T221 [US6] [VO-066] Add **Start screen** to the editor header in app/editor/Editor.tsx, waiting for any queued write before navigating
- [ ] T222 [US6] [VO-070] Write the failing test in e2e/announcements.spec.ts: rejections, copy results, file results and save status changes are each announced through a live region or status without moving focus, and failures are announced
- [ ] T223 [US6] [VO-070] Route every message through app/rendering/shared/Feedback.tsx and the `role="status"` save status, never moving focus
- [ ] T224 [US6] [VO-072] Write the failing test in e2e/accessible-names.spec.ts: every item and connection on each type's canvas has an accessible name stating its type, label and ends where it has them, and shows a visible focus indicator when focused
- [ ] T225 [US6] [VO-072] Give canvas items accessible names (for example "Diamond node: Approve?", "Message 3, dashed open arrow, from Alice to Bob: OK") and visible focus styles in app/rendering/flowchart/, app/rendering/sequence/ and app/rendering/c4/
- [ ] T226 [US6] [VO-071] Write the failing test in e2e/wcag.spec.ts with `@axe-core/playwright` (WCAG 2.2 AA tags): the start screen, each dialog and each diagram type with content show no violations
- [ ] T227 [US6] [VO-071] Correct every violation the scan reports in app/rendering/ and app/routes/

- [ ] T228 [US6] [VO-101] Write the failing test in e2e/selection-feedback.spec.ts: in each type (Flowchart, Sequence, C4) selecting an item shows it visibly distinct from unselected items (a non-colour cue as well as colour) and exposes `aria-selected` or `aria-current` state, selecting another item moves the cue, and clicking empty canvas or pressing Escape clears it (AC4)
- [ ] T229 [US6] [VO-101] Style and expose the selected state for flowchart nodes and connections, sequence participants and messages, and C4 elements, boundaries and relationships in app/rendering/flowchart, app/rendering/sequence and app/rendering/c4, driven by the selection in app/editor/Editor.tsx
**Checkpoint**: All user stories work. Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Obligations that span all stories, and the checks that are not tests.

- [ ] T230 [VO-096] Write the failing test in app/model/familyChanges.test.ts: in each type, an item's type changed within its family and a relationship's end moved, in diagrams with many relationships, adds, removes or reattaches no other relationship (SC-016)
- [ ] T231 [VO-096] Correct any `changeType` or `moveEnd` in app/model/flowchart/apply.ts, app/model/sequence/apply.ts or app/model/c4/apply.ts that touches another relationship
- [ ] T232 [VO-092] Write the failing test in e2e/not-offered.spec.ts: the source is shown read-only in an expandable panel, and no screen offers source editing or import, image export, collaboration, version history, cloud storage, multi-select, copy and paste of items, grid snapping or auto-arrange
- [ ] T233 [VO-092] Remove any control or React Flow default (multi-select box, copy and paste, snap grid) that offers an excluded action in app/rendering/ and app/routes/
- [ ] T234 [VO-095] Write the failing test in e2e/performance.spec.ts: in each type a diagram of 100 elements and 150 relationships (fixtures in e2e/fixtures/) is edited, undone and redone, and each change is reflected on the canvas and in the source within 1 second (SC-012)
- [ ] T235 [VO-095] Remove what makes a step slower than 1 second (memoised derived nodes and edges, generation once per present) in app/editor/Editor.tsx and app/rendering/
- [ ] T236 [VO-091] Write the failing test in e2e/static-offline.spec.ts against the built app served as static files: a full session in each type (edit, undo, redo, preview, copy, save a file, open a file, reopen) works, the browser makes no network request after load, and the build output holds only static files
- [ ] T237 [VO-091] Remove any request made after load (bundled fonts and icons, `mermaid` as a same-origin lazy chunk) in app/ and vite.config.ts
- [ ] T238 [NT: review against the FR-022 exemption] Review the diff so that every user-facing string comes from app/text/en.ts, as the plan's exemption for FR-022 requires
- [ ] T239 [NT: project checks, not tests] Run `npm run typecheck` and `npm run lint` and correct every finding
- [ ] T240 [NT: manual checks recorded by a person] List the manual checks MV-001 to MV-005 from plan.md for the Business Analyst to perform and record with `tdd_check.py manual --check <MV-nnn> --result <pass|fail> --by "<name>"`; the agent records no result
- [ ] T241 [NT: walk-through, no new behaviour] Run the quickstart.md manual walk-through and report what differs
---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup; blocks every story
- **US1 (Phase 3)**: depends on Foundational; the MVP
- **US2 (Phase 4)**: depends on US1 (flowchart canvas, generator, properties)
- **US3 (Phase 5)**: depends on US1 and US2 (operations to undo); also delivers VO-012 of US1
- **US7 (Phase 6)**: depends on US1 to US3 (save after every commit, Undo and Redo)
- **US4 (Phase 7)** and **US5 (Phase 8)**: depend on Phases 3 to 6, whose shared tests they extend; US4 and US5 touch different model, generation and canvas folders, but both extend the same shared test files, so run them one after the other
- **US6 (Phase 9)**: depends on all three types existing
- **Polish (Phase 10)**: depends on every story

### Within each story

- Each test task comes before the task or tasks that deliver its behaviour, and its Red run is recorded first
- Model and validation before generation; pure layers before rendering; rendering before the e2e behaviour
- Run a broad command as a `checkpoint` at the end of each phase

### Parallel Opportunities

- Setup: T002, T003, T004, T006, T007 and T008 touch different files
- Inside a story, a test task for a pure-layer obligation and one for an unrelated e2e obligation can be written in parallel once their prerequisites are done, but the Red, Green, Refactor cycle runs one behaviour at a time
- US4's model and generation work (app/model/sequence, app/generation/sequence.ts) and US5's (app/model/c4, app/generation/c4.ts) are independent of each other; only their extension tasks on shared test files must be serialised

---

## Parallel Example: User Story 4

```bash
# Independent pure-layer test files for Sequence, once Phase 6 is complete:
Task: "Write the failing test in app/generation/sequence.fidelity.test.ts"
Task: "Write the failing test in app/rendering/layout/sequenceLayout.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup, then Phase 2 Foundational
2. Phase 3 (US1): a flowchart can be built, its source checked and copied
3. **Stop and validate** against US1's independent test

### Incremental Delivery

1. US1 → MVP
2. US2 → safe editing of flowcharts
3. US3 → Undo and Redo (and the flowchart preview)
4. US7 → diagrams kept in the browser and in files
5. US4 → Sequence
6. US5 → C4, all five kinds
7. US6 → keyboard-only, accessibility, empty states, leaving safely
8. Polish → cross-cutting obligations, project checks, manual checks

---

## Notes

- [P] tasks touch different files and depend on no incomplete task
- Never remove, weaken or skip a test to obtain a pass; record a changed expectation with `tdd_check.py expectation`
- The human commits and pushes

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
