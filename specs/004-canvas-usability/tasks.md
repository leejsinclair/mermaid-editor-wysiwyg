---

description: "Task list for canvas usability: in-place label editing, larger handles, move versus connect"
---

# Tasks: Canvas Usability (In-Place Label Editing, Larger Handles, Move Versus Connect)

**Input**: Design documents from `/specs/004-canvas-usability/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/canvas-interaction.md, quickstart.md, tests/behaviour-checklist.md

**Tests**: Required. Every obligation VO-001 to VO-053 in the plan's Verification Plan has a test task placed before the task that delivers its behaviour. Manual checks MV-001 to MV-003 are recorded by a person with `tdd_check.py manual`, never by the agent.

**Organization**: Pure helpers and the editor state come first (Phase 2) because every canvas uses them. US1 and US2 deliver in-place editing. US3 delivers the move and connect split, including the C4 change that makes an element's body move it. US4 delivers handle size, visibility, drop targets and the Sequence insertion marker. US5 delivers touch, pen and assistive-technology parity. Polish holds the accessibility scan and the full regression run.

## Format: `[ID] [P?] [Story] [Label] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to
- **[Label]**: `[VO-nnn]` or `[NT: reason]` (see "Verification labels" at the end)

## Path Conventions

- Single client-only project: source in `app/`, browser tests in `e2e/`, unit tests beside the code they test as `*.test.ts` (plan, Project Structure)
- Tests are run only through `python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py run --command <unit|unit-all|e2e|e2e-all> ...`
- Tests open views as `page.goto("#/new/flowchart")`, with a leading `#` and no leading `/`
- Touch and pen tests run in Chromium only, through the DevTools protocol (research R11)

---

## Phase 1: Setup

**Purpose**: Record the baseline before any behaviour changes.

- [X] T001 [NT: baseline run only] Record a `baseline` run of `unit-all` and `e2e-all` through `tdd_check.py run --phase baseline`, naming any test already failing in `--note`

**Checkpoint**: Baseline recorded.

---

## Phase 2: Foundational (pure helpers and editor state)

**Purpose**: The pure functions and reducer changes every canvas uses (data-model.md, "Pure functions added" and "Editor state changes"). No DOM.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] [VO-037] Write the failing unit test app/rendering/shared/interaction.test.ts for `isDoubleActivation(previous, next)`: true only for two releases on the same item within 400 ms and 8 px with no drag between; false for 401 ms, 9 px, a different item, or a drag between. Run `--phase red`
- [X] T003 [VO-037] Implement `isDoubleActivation` in app/rendering/shared/interaction.ts (pure, no DOM) so T002 passes
- [X] T004 [P] [VO-036] Write the failing unit test for `handlesFit(size, zoom)` in app/rendering/shared/interaction.test.ts: handles fit exactly when both on-screen dimensions (size × zoom) are at least 52 px; check 51.9 and 52.0 on each side and zoom 0.25, 1 and 4. Run `--phase red`
- [X] T005 [VO-036] Implement `handlesFit` in app/rendering/shared/interaction.ts so T004 passes
- [X] T006 [P] [VO-052] Write the failing unit test for `validEnds(diagram)` in app/rendering/shared/interaction.test.ts: every flowchart node; every Sequence participant and actor; every C4 element; Deployment nodes only in Deployment diagrams; never a boundary; across Flowchart, Sequence and all five C4 kinds. Run `--phase red`
- [X] T007 [VO-052] Implement `validEnds` in app/rendering/shared/interaction.ts so T006 passes
- [X] T008 [P] [VO-032] Write the failing unit test app/rendering/flowchart/sides.test.ts for `nearestSides(from, to)`: target above, below, left, right, diagonal (larger gap wins), overlapping, and the same node (keeps the bottom-to-top loop). Run `--phase red`
- [X] T009 [VO-032] Implement `nearestSides` in app/rendering/flowchart/sides.ts so T008 passes
- [X] T010 [P] [VO-034] Write the failing unit test app/rendering/sequence/gestures.test.ts for `insertIndexAt(y, rows)`: above the first message, between each pair, on a row, below the last, with 0, 1 and many messages. Run `--phase red`
- [X] T011 [VO-034] Implement `insertIndexAt` in app/rendering/sequence/gestures.ts so T010 passes
- [X] T012 [P] [VO-053] [VO-009] Write the failing unit test app/editor/inlineEdit.test.ts for the reducer: `startInlineEdit` opens a `canvas` draft with the item's current label and is ignored with no selection; `blurInlineEdit { discard: false }` commits, `{ discard: true }` drops the draft; a `panel` draft is untouched by `blurInlineEdit`; committing text identical to the current label adds no history entry; invalid text closes the draft and sets the rejection feedback. Run `--phase red`
- [X] T013 [VO-053] [VO-009] Add `origin: "panel" | "canvas"` to `draft`, and the `startInlineEdit` and `blurInlineEdit` actions, in app/editor/reducer.ts per data-model.md so T012 passes; set `origin: "panel"` where the Properties panel dispatches `draft` in app/editor/Editor.tsx

**Checkpoint**: Pure helpers and reducer pass; no canvas has changed.

---

## Phase 3: User Story 1 - Rename an item or a line where it sits (Priority: P1) 🎯 MVP

**Goal**: Double-clicking, F2, or Enter on a selected item opens one shared inline editor on its label in all three views, with the Properties panel's own validation and one-step undo.

**Independent Test**: In each view, double-click an item, type, press Enter: canvas and source update. Double-click, type, press Escape: nothing changes. Undo the rename in one step.

### Open the editor on an item

- [X] T014 [US1] [VO-001] Write the failing end-to-end test e2e/inline-edit.spec.ts: in each view, double-click the body and the label of a flowchart node, a participant, an actor, a C4 element, a C4 boundary and a Deployment node; expect a `data-testid="inline-label-editor"` at the label with the whole label selected, no position, order or membership change, no line created, and no description or technology field in the editor. Run `--phase red` with `--expect` naming the missing editor
- [X] T015 [US1] [VO-001] Create app/rendering/shared/InlineLabelEditor.tsx: a `textarea` with `data-testid="inline-label-editor"`, `aria-label` "Label of <item name>" from the text catalogue, all text selected on mount, props for text, change, commit and cancel; add its strings to app/text/en.ts
- [X] T016 [US1] [VO-001] Wire app/editor/Editor.tsx: pass each canvas the open inline edit (item id, draft text, `onChange`, `onCommit`, `onCancel`) derived from the `canvas` draft, and an `onStartEdit(itemId)` that selects the item then dispatches `startInlineEdit`
- [X] T017 [US1] [VO-001] [VO-037] Flowchart: in app/rendering/flowchart/ShapeNode.tsx render the editor inside the node (class `nodrag nopan nowheel`) when it is the item being edited, and in app/rendering/flowchart/FlowchartCanvas.tsx detect a double activation with `isDoubleActivation` on node pointer events and call `onStartEdit`
- [X] T018 [US1] [VO-001] [VO-037] Sequence: in app/rendering/sequence/SequenceCanvas.tsx render the editor in an SVG `foreignObject` over the participant or actor label and open it on a double activation of the header (box or actor figure)
- [X] T019 [US1] [VO-001] [VO-037] C4: in app/rendering/c4/C4Canvas.tsx render the editor in an SVG `foreignObject` over the label of an element, boundary or Deployment node and open it on a double activation of its box

### Commit, cancel, line break, undo

- [X] T020 [US1] [VO-002] [VO-003] [VO-004] [VO-006] [VO-051] Add failing tests to e2e/inline-edit.spec.ts: Enter commits a label containing `"`, `<` and `-->` and the canvas, Properties panel, source panel and flowchart preview all show it escaped as for a Properties edit (VO-002); Escape leaves label, source and undo history unchanged (VO-003); Shift+Enter adds a line and the editor stays open, and the committed label has two lines (VO-004); one Undo and one Redo restore and reapply the label (VO-006); a scripted rename from double-click to the source showing the new label takes under 5 seconds with the Properties panel never focused (VO-051). Run `--phase red`
- [X] T021 [US1] [VO-002] [VO-003] [VO-004] [VO-006] [VO-051] In app/rendering/shared/InlineLabelEditor.tsx handle Enter (commit), Shift+Enter (line break) and Escape (cancel); in app/editor/Editor.tsx map commit to `confirmLabel` and cancel to `cancelDraft`; stop key events from reaching the canvas shortcuts
- [X] T022 [US1] [VO-005] [VO-044] Add failing tests: clicking another item commits and then selects it, Tab commits (VO-005); Ctrl+Z inside the editor undoes typing only, and the toolbar's Undo and Redo buttons discard the text then undo or redo one diagram step (VO-044). Run `--phase red`
- [X] T023 [US1] [VO-005] [VO-044] On blur, `InlineLabelEditor` dispatches `blurInlineEdit` with `discard` true when focus moves to an element with `data-discards-draft`; add that attribute to the Undo and Redo buttons in app/rendering/shared/Toolbar.tsx; keep Ctrl+Z inside the editor as the browser's text undo in app/editor/keyboard.ts
- [X] T024 [US1] [VO-007] Add a failing test: committing blank or spaces-only text for a node label, a Sequence message and a C4 relationship label, by Enter and by clicking outside, closes the editor, keeps the previous label, adds no history entry, and shows the same explanation as the Properties panel in the live region. Run `--phase red`
- [X] T025 [US1] [VO-007] Make a rejected in-place commit close the editor and keep the feedback message in app/editor/reducer.ts and app/editor/Editor.tsx; make the message reach the live region

### Keyboard and small gestures

- [X] T026 [US1] [VO-008] Add a failing test: on a focused unselected item Enter only selects; a second Enter and F2 on a selected item or line open the inline editor exactly as a double-click does; focus never moves to the Properties panel. Run `--phase red`
- [X] T027 [US1] [VO-008] In app/editor/keyboard.ts make F2 dispatch `startInlineEdit` instead of focusing the Properties field (remove `editLabel`); in the canvas key handlers (FlowchartCanvas `onKeyDown`, `selectable()` in SequenceCanvas and C4Canvas) make Enter on the selected item or line call `onStartEdit`
- [X] T028 [US1] [VO-038] [VO-048] Add failing tests: a double-click with no movement opens the editor and moves nothing; a press moved 3 px then released is a click (selection only; no move, no line); double-clicking empty canvas in each view creates, selects and edits nothing and does not change the zoom. Run `--phase red`
- [X] T029 [US1] [VO-038] [VO-048] Set `nodeDragThreshold={5}` in app/rendering/flowchart/FlowchartCanvas.tsx; keep `zoomOnDoubleClick={false}`; make the pane's and SVG backgrounds ignore a double activation
- [X] T030 [US1] [VO-039] [VO-049] Add failing tests: pasting formatted text with line breaks into the editor keeps characters and line breaks as plain text and no formatting control is shown (VO-039); a five-line label with one long line grows the editor to fit and covers no more than the label's own area plus its border (VO-049). Run `--phase red`
- [X] T031 [US1] [VO-039] [VO-049] In app/rendering/shared/InlineLabelEditor.tsx handle `onPaste` as plain text and grow the `textarea` to its content
- [X] T032 [US1] [VO-045] [VO-046] [VO-047] Add failing tests: zooming and panning, even until the label is off screen, keep the editor open on its label with its text (VO-045); another tab taking over editing drops the edit and commits nothing (VO-046); reloading with uncommitted editor text asks for confirmation (VO-047). Run `--phase red`
- [X] T033 [US1] [VO-045] [VO-046] [VO-047] Make each pass: keep the editor inside the drawing's coordinate space so it follows zoom and pan; confirm `release` in app/editor/reducer.ts drops a `canvas` draft; confirm app/editor/leavePage.ts treats a non-null draft as unsaved. Where a test passes at once, record `no-meaningful-red` with the reason

**Checkpoint**: Rename in place works by double-click, F2 and Enter in all three views.

---

## Phase 4: User Story 2 - Name a line in place (Priority: P1)

**Goal**: Double-clicking a flowchart connection, Sequence message or C4 relationship opens the editor at its label; an unlabelled flowchart connection opens empty at its middle.

**Independent Test**: Double-click an unlabelled flowchart connection, type "Yes", press Enter; the label appears on the line and in the source. Do the same for a message and a relationship.

- [X] T034 [US2] [VO-010] [VO-011] [VO-012] [VO-013] [VO-014] Write the failing test e2e/inline-edit-lines.spec.ts: double-click a labelled flowchart connection, Sequence message and C4 relationship on the line and on the label opens the editor with the label selected (VO-010); an unlabelled flowchart connection opens empty at its middle, "Yes" becomes its label in one undo step and appears in the source, empty text leaves it unlabelled with no history entry (VO-011); clearing a label removes it from canvas and source (VO-012); empty and spaces-only text is rejected with the Properties panel's explanation for a message and a relationship (VO-013); double-clicking either end handle of a selected line in each view opens no editor and moves no end (VO-014). Run `--phase red`
- [X] T035 [US2] [VO-010] Flowchart: in app/rendering/flowchart/ConnectionEdge.tsx open the editor on a double activation of the edge path or its label, rendered in `EdgeLabelRenderer` with `nodrag nopan` and `pointerEvents: "auto"` while editing
- [X] T036 [US2] [VO-011] [VO-012] Flowchart: render an empty editor at the middle of an unlabelled connection (the label position from `getBezierPath`, and the loop label position for a self-loop) and let an emptied label be committed to remove it, in app/rendering/flowchart/ConnectionEdge.tsx
- [X] T037 [US2] [VO-010] [VO-013] Sequence and C4: open the editor on a double activation of a message row or a relationship (line or text) in app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx, editing the message `text` and relationship `label`, with a blank rejected by the existing `setLabel` check
- [X] T038 [US2] [VO-014] Make the end handles in all three canvases stop a double activation from reaching the line or starting an edit or a move, in app/rendering/flowchart/ConnectionEdge.tsx, app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx

**Checkpoint**: Items and lines are renamed in place; US1 and US2 are independently testable.

---

## Phase 5: User Story 3 - Tell moving apart from connecting before pressing (Priority: P1)

**Goal**: Each item has a body zone (move cursor, hover outline, drag moves) and connection handles (crosshair, drag connects) that never overlap; a C4 element's body moves it.

**Independent Test**: In each view, drag an item by its body and confirm it moved with no line; drag from a handle to another item and confirm a line and no move; probe the boundary between the two.

### Existing tests follow the new gestures

- [X] T039 [US3] [VO-043] Update the existing tests to the new gestures, changing no other assertion: in e2e/c4-toolbox.spec.ts "a relationship is created by dragging from one element to another" drag from the source element's handle instead of its body. Run `--phase red`, then record `tdd_check.py expectation --alters-behaviour --requirement US3-AS7` for the C4 test, explain to the developer that dragging an element's body now moves it, and record `approve --id <XC-nn> --by "<name>"` only after the developer approves in the conversation (research R12, DC-02)

### Four flowchart handles and C4 side handles

- [X] T040 [US3] [VO-033] Write the failing test e2e/handles.spec.ts: each of a flowchart node's four handles starts a line and receives one; each line is drawn between the nearest facing sides and is redrawn when a node moves; a saved file holds no handle side and the current format version and reopens identical; a C4 element and a Deployment node show four handles and a boundary shows none. Run `--phase red`
- [X] T041 [US3] [VO-032] [VO-033] [VO-043] Flowchart: in the same task switch the shared helper `connect()` in e2e/support/flowchart.ts from `.react-flow__handle.source` and `.target` to the bottom and top handles by `data-side`, so no existing flowchart test is left red; give each node four handles with `data-side` (`top`, `right`, `bottom`, `left`) in app/rendering/flowchart/ShapeNode.tsx; set `connectionMode={ConnectionMode.Loose}` and derive each edge's `sourceHandle` and `targetHandle` from `nearestSides` in app/rendering/flowchart/FlowchartCanvas.tsx; keep the self-loop path in app/rendering/flowchart/ConnectionEdge.tsx
- [X] T042 [US3] [VO-033] C4: draw four side handles (`data-side`, `data-zone="connect"`) on each element and Deployment node and none on a boundary in app/rendering/c4/C4Canvas.tsx; a drag from one is a `create` drag

### Body drags move, handle drags connect

- [X] T043 [US3] [VO-017] [VO-018] [VO-021] Write the failing test e2e/move-vs-connect.spec.ts: in each view drag an item by its body and release over empty canvas, over another item's body and over another item's handle, and expect the item moves as its view allows (position, order, membership) and no line is created; a body drag that can change nothing leaves the undo history unchanged (VO-017); drag from a handle and expect a preview line follows the pointer and the item does not move (VO-018); drag a C4 element by its body into a boundary, over an element inside a boundary, and a Deployment node onto another node, and expect the membership or parent to change with no relationship created (VO-021). Run `--phase red`
- [X] T044 [US3] [VO-017] [VO-021] C4: make an element's body begin a `move` drag (not `create`) in app/rendering/c4/C4Canvas.tsx, and change `placeAt` so a release resolves to the innermost boundary or Deployment node containing the point, whether or not an element is drawn there; remove the `element` case
- [X] T045 [US3] [VO-017] [VO-018] Sequence: make the header the body (`participant` reorder drag, `data-zone="body"`) and the lifeline the connect zone (`create` drag, `data-zone="connect"`) with no overlap in app/rendering/sequence/SequenceCanvas.tsx; flowchart: mark handles `nodrag` and the node body as the move zone in app/rendering/flowchart/ShapeNode.tsx
- [X] T046 [US3] [VO-018] Draw a dashed preview line from the source handle while a line is dragged in app/rendering/c4/C4Canvas.tsx (from the handle's side), and confirm the Sequence preview and React Flow's connection line start at the handle

### Cancelling a line

- [X] T047 [US3] [VO-019] Add a failing test to e2e/move-vs-connect.spec.ts: releasing a line being drawn over empty canvas, outside the canvas, over a C4 boundary, and pressing Escape each create no line, change nothing and leave the undo history unchanged. Run `--phase red`
- [X] T048 [US3] [VO-019] Make each cancel pass: cancel React Flow's connection on Escape in app/rendering/flowchart/FlowchartCanvas.tsx; ignore a `create` release over a boundary or nothing in app/rendering/c4/C4Canvas.tsx; confirm `useDrag` in app/rendering/shared/useDrag.ts cancels on Escape and outside the drawing

### Cursors, hover and zones

- [X] T049 [US3] [VO-015] [VO-016] Write the failing test e2e/hover.spec.ts: hovering a body in each view shows a `move` cursor, a hover outline that differs from the selection outline in width or pattern (read from computed style), and the item's handles; hovering a handle shows a `crosshair` cursor and a larger or highlighted handle. Run `--phase red`
- [X] T050 [US3] [VO-015] [VO-016] Create app/rendering/shared/canvas.css (cursors by `data-zone`, 1 px dashed hover outline, handle highlight on hover) and import it once in app/editor/Editor.tsx; add `data-zone` to every hit-testable part in the three canvases per contracts/canvas-interaction.md
- [X] T051 [US3] [VO-020] Write the failing test e2e/zones.spec.ts: probe a grid of points over every item, handle and line in each view at default zoom and at half zoom, including nested C4 boxes; each point reports exactly one `data-zone` via `elementFromPoint`, the cursor matches it, and a drag from sampled points of each zone does what the zone says. Run `--phase red`
- [X] T052 [US3] [VO-020] Fix stacking and ownership so each point has one owner: handles above the body, the innermost C4 box drawn last, end handles above connect handles, in app/rendering/flowchart/ShapeNode.tsx, app/rendering/c4/C4Canvas.tsx and app/rendering/sequence/SequenceCanvas.tsx; the label belongs to the body

### Lines keep working

- [X] T053 [US3] [VO-040] [VO-050] Write the failing test e2e/end-handles.spec.ts: select a line whose end handle sits on an item's connect handle; only the end handle shows and is hit there, dragging it moves the end, the item's other handles still draw lines (VO-040); a new line released over the selected line's end handle ends at that end's item (VO-050). Run `--phase red`
- [X] T054 [US3] [VO-040] [VO-050] Hide a connect handle that a selected line's end handle covers, draw end handles above connect handles, and resolve a release over an end handle to its item, in the three canvases and app/rendering/shared/canvas.css
- [X] T055 [US3] [VO-041] Write the failing test e2e/lines-unchanged.spec.ts: dragging a Sequence message and a Dynamic relationship reorders them and dragging an end handle moves the end, each in one undo step, as before this feature. Run `--phase red` (a test that passes at once is recorded as `no-meaningful-red`)
- [X] T056 [US3] [VO-041] Keep message and Dynamic relationship reordering and end moves working after the zone changes in app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx

**Checkpoint**: Moving and connecting are separate in all views; the updated C4 test passes.

---

## Phase 6: User Story 4 - Hit connection handles easily and see where a line will land (Priority: P2)

**Goal**: Handles are 28 px hit squares with 16 px dots at every zoom level, hidden at rest and on tiny items; valid ends and the drop target are marked; a Sequence message lands where it is released.

**Independent Test**: Measure every handle's hit area at three zoom levels; start a line in each view and check the valid-target and drop-target marks.

### Size and visibility

- [X] T057 [US4] [VO-022] Write the failing test e2e/handle-size.spec.ts: measure the hit area of every connection handle and end handle in each view at the smallest, default and largest zoom (at least 24 × 24 screen px, overlapping no uncovered body area); zoom out until items are too small and expect no connection handles, body still moves the item, a line drawn from another item still lands on it, and its description still offers Connect. Run `--phase red`
- [X] T058 [US4] [VO-022] [VO-036] Flowchart: size handles to 28 px hit and 16 px dot on screen by dividing by the React Flow zoom (`useStore`) in app/rendering/flowchart/ShapeNode.tsx; size the end grips by setting `reconnectRadius` (14 screen px, divided by the zoom) on `ReactFlow` in app/rendering/flowchart/FlowchartCanvas.tsx and styling `.react-flow__edgeupdater` in app/rendering/shared/canvas.css; hide handles with `handlesFit`
- [X] T059 [US4] [VO-022] [VO-036] Sequence and C4: pass the viewport zoom to the handles and end handles and size them to 28 px hit and 16 px dot on screen in app/rendering/sequence/SequenceCanvas.tsx and app/rendering/c4/C4Canvas.tsx; hide connect handles with `handlesFit`
- [X] T060 [US4] [VO-023] Write the failing test e2e/handle-visibility.spec.ts: at rest no connection handle is visible; hovered or selected, handles are visible with a dot at least 16 px across at 100% zoom, in each view. Run `--phase red`
- [X] T061 [US4] [VO-023] Add the visibility rules to app/rendering/shared/canvas.css (hidden at rest; shown on `:hover` of the item or when it is selected) and size the dot to 16 px

### Drop targets and release

- [X] T062 [US4] [VO-024] Write the failing test e2e/drop-targets.spec.ts: while drawing a line in each view (including a C4 diagram with a boundary and a Deployment diagram) every valid end has `data-target="valid"`, boundaries have none and give no snap, and the item under the pointer has `data-target="drop"` styled differently from the others. Run `--phase red`
- [X] T063 [US4] [VO-024] [VO-052] Mark valid ends from `validEnds` and the item under the pointer: flowchart through React Flow's `useConnection()` in app/rendering/flowchart/FlowchartCanvas.tsx and ShapeNode.tsx; Sequence and C4 from the current point of `useDrag` in their canvases; style `data-target` in app/rendering/shared/canvas.css (thin dashed ring for valid, thick solid ring and filled handle for drop)
- [X] T064 [US4] [VO-025] [VO-026] Write the failing test e2e/line-release.spec.ts: releasing over a valid item's body and over one of its handles creates one line in one undo step with the type a drag gives (armed or solid arrow in a flowchart, solid arrow in Sequence, one-way "Uses" in C4) and the source shows it (VO-025); releasing over the source item itself marks it valid and creates a flowchart self-loop, a Sequence self-message and a C4 relationship to itself (VO-026). Run `--phase red`
- [X] T065 [US4] [VO-025] [VO-026] Resolve a release over a body as well as a handle: flowchart through `onConnectEnd` in app/rendering/flowchart/FlowchartCanvas.tsx (target the node under the pointer when React Flow found no handle), C4 by resolving a `create` release to the element under the point (without `placeAt`) in app/rendering/c4/C4Canvas.tsx, Sequence in `lifelineAt` in app/rendering/sequence/gestures.ts; allow the source item as a target

### Sequence lifeline

- [X] T066 [US4] [VO-035] Write the failing test e2e/sequence-lifeline.spec.ts: hovering a lifeline shows `data-testid="lifeline-hint"` saying dragging adds a message; while drawing, `data-testid="insertion-marker"` follows the pointer's gap; releasing between two messages puts the new one there and below the last puts it at the end; adding a message from the keyboard and the toolbox with one selected still goes after the selected message; across a message row the lifeline offers no connect zone and a drag reorders the message. Run `--phase red`
- [X] T067 [US4] [VO-034] [VO-035] In app/rendering/sequence/SequenceCanvas.tsx show the lifeline hint and the insertion marker, split the lifeline's connect zone around message rows, and pass the release index from `insertIndexAt` to `onCreateMessage(from, to, index)`; in app/editor/Editor.tsx use that index in `addMessage` for drags only; add the hint text to app/text/en.ts

**Checkpoint**: Handles meet the size rule everywhere; targets are marked; Sequence messages land where released.

---

## Phase 7: User Story 5 - Same behaviour with touch, pen and assistive technology (Priority: P3)

**Goal**: Touch and pen behave like the mouse; a screen reader hears what each part does and where focus goes.

**Independent Test**: With touch, tap to select, drag body and handle, double-tap a label. With the accessibility tree, read an item's description and a handle's name.

- [X] T068 [US5] [VO-027] [VO-028] [VO-029] Write the failing test e2e/pointer-types.spec.ts (Chromium only, `Input.dispatchTouchEvent` and pen `Input.dispatchMouseEvent` through a CDP session): body and handle drags give the same results as VO-017 and VO-025 (VO-027); tapping an unselected item selects it and reveals its handles (VO-028); double-tapping an item and a line opens the editor (VO-029). Run `--phase red`
- [X] T069 [US5] [VO-027] Make touch and pen drags work: `touch-action: none` on node bodies, handles and SVG parts, pointer events (not mouse events) for the drags, in app/rendering/flowchart/FlowchartCanvas.tsx, app/rendering/shared/useDrag.ts and app/rendering/shared/canvas.css
- [X] T070 [US5] [VO-028] [VO-029] Reveal handles on selection without hover, and detect a double-tap with `isDoubleActivation` using pointer events of every type, in app/rendering/shared/canvas.css and the three canvases
- [X] T071 [US5] [VO-030] Write the failing test e2e/canvas-descriptions.spec.ts: read the accessibility tree of each view; each item's description says drag to move, drag a handle to connect, F2 to rename, and names the Connect command and move keys; each handle's name says it is dragged to connect. Run `--phase red`
- [X] T072 [US5] [VO-030] Add one visually hidden description per canvas and `aria-describedby` on each item, and `aria-label` on each handle, from app/text/en.ts, in the three canvases
- [X] T073 [US5] [VO-031] Write the failing test e2e/inline-focus.spec.ts: opening the inline editor moves focus into it, its accessible name names the item or line, and closing it by Enter, Escape or clicking away returns focus to that item or line. Run `--phase red`
- [X] T074 [US5] [VO-031] Move focus into the editor on open and return it to the item or line on close in app/rendering/shared/InlineLabelEditor.tsx and the three canvases; give each canvas item a stable focus target

**Checkpoint**: All five stories work; touch, pen and screen-reader parity holds.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T075 [VO-042] Write the failing test e2e/canvas-wcag.spec.ts: scan each view with `@axe-core/playwright` with handles visible, a line being drawn and the inline editor open, and measure the hover outline, handle dots and target marks against their background for at least 3:1; the drop target must differ from other valid targets in stroke width or pattern. Run `--phase red`
- [X] T076 [VO-042] Fix any violation or contrast shortfall in app/rendering/shared/canvas.css and the canvases until T075 passes
- [X] T077 [VO-043] Run `unit-all` and `e2e-all` as a `checkpoint`; every existing test must pass unchanged except those named in T039; confirm the Properties panel keeps its fields and keeps an unconfirmed label as a draft when focus leaves it; fix any regression in the code, never in a test
- [X] T078 [NT: typecheck and lint only] Run `npm run typecheck` and `npm run lint` and fix findings in the files this feature changed
- [X] T079 [NT: manual checks are recorded by a person, never by the agent] Leave MV-001 (touch and pen hardware), MV-002 (NVDA and Orca) and MV-003 (visual judgement) open for the Business Analyst; record no result

---

## Dependencies & Execution Order

- Phase 1 then Phase 2, which blocks everything.
- US1 (Phase 3) needs Phase 2. US2 needs US1 (the shared editor). US3 needs Phase 2 and can start beside US1, but T016, T017 to T019 and T044 to T052 edit the same canvas files, so run US1, US2 and US3 one after another unless two people each take a canvas.
- US4 needs US3 (zones, handles, `data-zone`). US5 needs US1, US3 and US4.
- Polish needs every story. T077 is the final regression checkpoint.

### Parallel opportunities

- T002, T004, T006, T008, T010 and T012 are different tests and can be written together; their implementations T003, T005 and T007 share interaction.ts and run in order.
- After the editor exists (T015), the three canvas integrations T017, T018 and T019 touch different files and can run in parallel.
- T058 and T059 (flowchart versus Sequence and C4 sizing) touch different files.

## Implementation Strategy

1. Phases 1 and 2, then US1: rename in place, the smallest slice that delivers value. Stop and validate with quickstart steps 1 to 2.
2. Add US2, then US3, which fixes the core problem. Validate with quickstart steps 3 to 5, 9 and 10.
3. Add US4, US5 and Polish. After T077, hand MV-001 to MV-003 to a person.

---

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
