# Implementation Plan: Canvas Usability (In-Place Label Editing, Larger Handles, Move Versus Connect)

**Branch**: `main` (no feature branch) | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-canvas-usability/spec.md`

## Summary

Make the three canvases say, before anything is pressed, what a drag will do, and let labels be edited where they
sit. Each item gets a body zone (move cursor, hover outline, drag to move) and connection handles (crosshair, drag
to connect) that never overlap; handles are 28 px hit squares with 16 px dots at every zoom level, hidden at rest
and on items too small to hold them. Flowchart nodes get two-way handles on four sides and lines are drawn between
the nearest sides; the Sequence lifeline becomes a visible connect zone with a hover hint and an insertion marker,
and a drawn message lands at the release height; a C4 element's body now moves it and its handles connect it.
While a line is drawn, valid ends are marked and the drop target is marked more strongly. A double activation
(mouse, touch or pen), F2, or Enter on the selected item opens one shared inline editor in the drawing's own
coordinates; it reuses the editor's existing label draft, so validation, messages and one-step undo are the
Properties panel's own. No model, file format or generated source changes. Details: [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript ~6.0, strict, ES2022 (unchanged)

**Primary Dependencies**: React 19, `@xyflow/react` ^12.12 (loose connection mode, `useConnection`, node drag
threshold), `@mui/material` ^9.5 (unchanged). No new dependency.

**Storage**: N/A. Saved diagrams and files are unchanged (no handle side is stored).

**Testing**: Vitest (`npm test`) for pure functions and the reducer; Playwright (`npm run test:e2e`, Chromium and
Firefox) for canvas behaviour; touch and pen through the Chromium DevTools protocol (research R11)

**Target Platform**: Current stable Chromium-based browsers and Firefox on desktop, including touchscreen and pen
input on those browsers

**Project Type**: Web application, client-only single-page app (unchanged)

**Performance Goals**: Hover feedback and drop-target marking follow the pointer without visible lag at the editor
spec's scale (100 elements, 150 relationships); SC-012 of the editor spec still holds

**Constraints**: Constitution layers kept; WCAG 2.2 AA including target size (2.5.8) and non-text contrast; no
change to the visual model or the generated source

**Scale/Scope**: 3 canvases; 1 shared inline editor; 1 new stylesheet; 5 new pure functions; about 4 changed
rendering components and 2 changed editor modules

## Constitution Check

*GATE: must pass before research; re-checked after design.*

| Principle or constraint | Status | How the plan meets it |
|-------------------------|--------|-----------------------|
| I. Visual model is the source of truth | Pass | In-place edits commit the existing `setLabel` operation; no handle side or view state is stored; source is still generated from the model only |
| II. Layered architecture | Pass | No change to model, validation, generation or history. New pure helpers (`nearestSides`, `handlesFit`, `insertIndexAt`, `isDoubleActivation`, `validEnds`) sit in the rendering layer with no DOM access; editor state changes stay in the `editor` composition root |
| III. Test-first | Pass | Verification Plan below; every requirement and scenario has an obligation |
| IV. Invalid operations never corrupt | Pass | Invalid in-place text goes through the same `setLabel` rejection; a cancelled line, a cancelled edit and a body drag that changes nothing commit nothing |
| V. Undoable, consistent, honest feedback | Pass | One undo step per committed edit; Escape and toolbar Undo/Redo discard the draft; rejection messages are the Properties panel's and are announced |
| Technology and scope | Pass | No new dependency; no excluded feature (Mermaid import stays out, recorded in spec Clarifications) |
| Workflow: ambiguity raised, not assumed | Pass | Eleven decisions recorded in spec Clarifications; none open |

Post-design re-check: unchanged, all Pass. No Complexity Tracking entry is needed.

### Design constraints

- **DC-01** The saved diagram and the file format do not change: after lines are drawn from any side and nodes
  are moved, a saved diagram holds no handle side and keeps the current format version.
- **DC-02** Existing tests change only where the spec changes behaviour: the C4 test that draws a relationship by
  dragging an element's body is updated to drag a handle, recorded as an expectation change that alters behaviour
  (research R12).

## Project Structure

### Documentation (this feature)

```text
specs/004-canvas-usability/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (view state only; model unchanged)
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── canvas-interaction.md
├── checklists/
│   └── requirements.md
├── tests/
│   └── behaviour-checklist.md   # Phase 1 output (integrated TDD)
└── tasks.md             # Phase 2 output (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
app/
├── editor/
│   ├── reducer.ts            # draft.origin, startInlineEdit, blurInlineEdit
│   ├── keyboard.ts           # F2 opens the inline editor
│   └── Editor.tsx            # passes inline editing and drawn-message index to the canvases
├── rendering/
│   ├── shared/
│   │   ├── InlineLabelEditor.tsx   # new: the one inline editor
│   │   ├── canvas.css              # new: zones, cursors, handle visibility, hover and target marks
│   │   ├── interaction.ts          # new, pure: isDoubleActivation, handlesFit, validEnds
│   │   ├── useDrag.ts              # current point exposed for target marking
│   │   └── Toolbar.tsx             # data-discards-draft on Undo and Redo
│   ├── flowchart/
│   │   ├── ShapeNode.tsx           # four loose handles, counter-scaled; inline editor
│   │   ├── ConnectionEdge.tsx      # inline editor on the label
│   │   ├── FlowchartCanvas.tsx     # loose mode, drop on body, double activation, drop targets
│   │   └── sides.ts                # new, pure: nearestSides
│   ├── sequence/
│   │   ├── SequenceCanvas.tsx      # lifeline zone, hint, insertion marker, inline editor
│   │   └── gestures.ts             # insertIndexAt
│   └── c4/C4Canvas.tsx             # body moves, side handles, drop targets, inline editor
└── text/en.ts                       # hints, descriptions, editor names
e2e/                                  # new *.spec.ts for this feature; support/flowchart.ts selects handles by side
```

**Structure Decision**: The existing single-project layout. All new code is in the rendering layer and the editor
composition root; the model, validation, generation, history and persistence folders are untouched.

## Complexity Tracking

None.

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
| VO-001 | FR-001, US1-AS1 | In each view, the user double-clicks the body or label of a flowchart node, a participant, an actor, a C4 element, a C4 boundary and a Deployment node | An editor opens at each label with the whole label selected; no position, order or membership changes and no line is created; a C4 description or technology is not offered in the editor | end-to-end | planned |
| VO-002 | FR-002, FR-005, US1-AS2 | In each view, the user types a new label including special characters and presses Enter | The editor closes; the canvas, the Properties panel, the source panel and (flowchart) the preview show the new label; the source is escaped as for a Properties panel edit | end-to-end | planned |
| VO-003 | FR-002, US1-AS3, SC-006 | The user changes the text in the inline editor and presses Escape | The editor closes; the label, the source and the undo history are unchanged | end-to-end | planned |
| VO-004 | FR-002, US1-AS4 | The user presses Shift+Enter in the inline editor, then Enter | A line break is inserted while the editor stays open; the committed label has two lines on the canvas and in the source | end-to-end | planned |
| VO-005 | FR-002, US1-AS5 | With changed text in the editor, the user clicks another item; separately, presses Tab | Each commits the edit; the click then selects the other item | end-to-end | planned |
| VO-006 | FR-004, US1-AS6, SC-005 | A committed in-place rename is undone and redone | One Undo restores the previous label on the canvas, the Properties panel and the source; one Redo reapplies it | end-to-end | planned |
| VO-007 | FR-004, FR-021, US1-AS7, SC-007 | Blank or spaces-only text is committed for a node label, a message and a C4 relationship, by Enter and by clicking outside | Each is rejected: the editor closes, the previous label stays, no history entry is added, and the explanation equals the Properties panel's and is announced | end-to-end | planned |
| VO-008 | FR-003, US1-AS8, EC-09, EC-14 | Keyboard focus is on an item: Enter on it while unselected; Enter again; F2 on a selected item and line | The first Enter only selects; the second Enter and F2 open the inline editor exactly as a double-click does; focus does not move to the Properties panel | end-to-end | planned |
| VO-009 | FR-004, US1-AS9 | The inline editor commits text identical to the current label | The editor closes and the undo history is unchanged | unit | planned |
| VO-010 | FR-001, US2-AS1 | The user double-clicks a labelled flowchart connection, a Sequence message and a C4 relationship, on the line and on the label | The editor opens at the label with the label selected | end-to-end | planned |
| VO-011 | FR-001, US2-AS2 | The user double-clicks an unlabelled flowchart connection, commits "Yes"; on another, commits empty text | The editor opens empty at the middle of the line; "Yes" becomes the label in one undo step and appears in the source; empty text leaves it unlabelled with no history entry | end-to-end | planned |
| VO-012 | FR-004, US2-AS3 | The user clears a flowchart connection's label in place and commits | The label is removed from the canvas and the source | end-to-end | planned |
| VO-013 | FR-004, US2-AS4 | Empty and spaces-only text is committed in place for a Sequence message and a C4 relationship | Each is rejected with the Properties panel's explanation and the previous text remains | end-to-end | planned |
| VO-014 | FR-006, US2-AS5 | The user double-clicks each end handle of a selected line in each view | No editor opens and the end does not move | end-to-end | planned |
| VO-015 | FR-009, FR-013, US3-AS1 | The pointer rests on an item's body in each view | The cursor is a move cursor; a hover outline appears that differs from the selection outline in width or pattern; the item's handles become visible | end-to-end | planned |
| VO-016 | FR-013, US3-AS2 | The pointer rests on a connection handle in each view | The cursor is a crosshair and that handle is drawn larger or highlighted | end-to-end | planned |
| VO-017 | FR-014, US3-AS3, SC-001 | In each view, items are dragged by their body and released over empty canvas, over another item's body and over another item's handle | The item moves as its view allows (position, order, membership); no line is created in any case; a body drag that can change nothing commits nothing | end-to-end | planned |
| VO-018 | FR-015, FR-017, US3-AS4, SC-001 | In each view, the user presses on a connection handle and drags | A preview line follows the pointer from the handle; the item's position, order and membership do not change | end-to-end | planned |
| VO-019 | FR-017, US3-AS5, SC-006 | A line being drawn is released over empty canvas, outside the canvas, over a C4 boundary, and cancelled with Escape | No line is created, nothing else changes, and the undo history is unchanged | end-to-end | planned |
| VO-020 | FR-016, US3-AS6, SC-004, EC-11 | A grid of points over every item, its handles and its lines is probed in each view at default zoom and at half zoom, including nested C4 boxes | Each point reports exactly one zone; its cursor matches the zone; a drag from a sample of points in each zone does what the zone says (move, connect, reorder or move an end); inside a nested C4 box the innermost box owns the point | end-to-end | planned |
| VO-021 | FR-014, US3-AS7 | A C4 element is dragged by its body into a boundary, over another element inside a boundary, and a Deployment node onto another node | Membership or parent changes to the boundary or node containing the release point; no relationship is created | end-to-end | planned |
| VO-022 | FR-010, FR-018, US4-AS1, SC-002, EC-12 | Every connection handle and end handle is measured at the smallest, default and largest zoom; the canvas is zoomed out until items are too small | Every shown hit area is at least 24 × 24 screen px and overlaps no part of its item's body that is not covered by a handle; too-small items show no connection handles, still move by body, still accept a dropped line, and their description still offers the Connect command | end-to-end | planned |
| VO-023 | FR-009, US4-AS2 | Items are at rest, hovered and selected in each view | At rest no connection handle is visible; hovered or selected, handles are visible with a dot at least 16 px across at 100% zoom | end-to-end | planned |
| VO-024 | FR-011, US4-AS3 | A line is being drawn in each view, including a C4 diagram with a boundary | Every valid end is marked as a valid target; boundaries are not marked and give no snap; the item under the pointer is marked as the drop target, differently from the other valid targets | end-to-end | planned |
| VO-025 | FR-011, FR-015, US4-AS4 | A line is released over a valid item's body and, separately, over one of its handles, in each view | One line to that item is created in one undo step, appears in the source, and has the drag type: armed or solid arrow (flowchart), solid arrow (Sequence), one-way "Uses" (C4) | end-to-end | planned |
| VO-026 | FR-011, US4-AS5, EC-02 | A line is drawn from an item and released over the same item's body or handle in each view | The source item is marked as a valid target and a self-line (flowchart self-loop, Sequence self-message, C4 relationship to itself) is created | end-to-end | planned |
| VO-027 | FR-019, US5-AS1 | Using touch and pen input (Chromium), items are dragged by body and by handle in each view | The results equal the mouse results of VO-017 and VO-025 | end-to-end | planned |
| VO-028 | FR-019, US5-AS2 | Using touch input, the user taps an unselected item | It is selected and its handles become visible and draggable | end-to-end | planned |
| VO-029 | FR-019, US5-AS3 | Using touch and pen input, the user double-taps an item and a line | The inline editor opens as for a double-click | end-to-end | planned |
| VO-030 | FR-020, US5-AS4 | The accessibility tree of each view is read | Each item's description states drag to move, drag a handle to connect, F2 to rename, and the keyboard alternatives; each handle's name states that it is dragged to connect | end-to-end | planned |
| VO-031 | FR-021, US5-AS5 | The inline editor is opened and closed by Enter, Escape and clicking away | Focus moves into the editor on open; its accessible name names the item or line; focus returns to that item or line on close | end-to-end | planned |
| VO-032 | FR-008 | Pairs of node positions (above, below, left, right, diagonal, overlapping, the same node) | The chosen sides face each other along the larger gap; the same node keeps the bottom-to-top loop | unit | planned |
| VO-033 | FR-008, DC-01 | Flowchart lines are drawn from each of a node's four handles to each side of another node; a node is then moved; the diagram is saved to a file and reopened; a C4 boundary is hovered | Every side starts and receives a line; each line is drawn between the nearest sides and is redrawn when a node moves; the saved file holds no side and the current format version; the boundary shows no connection handles | end-to-end | planned |
| VO-034 | FR-012 | Release heights above the first message, between each pair, on a row and below the last, with 0, 1 and many messages | The insertion index is the gap the height falls in, and the end below the last message | unit | planned |
| VO-035 | FR-012, FR-016 | The pointer rests on a lifeline; a message is drawn and released between two existing messages; a message is added from the keyboard and the toolbox with one selected | A hint says dragging adds a message; the insertion marker follows the pointer's gap; the message lands in that gap; keyboard and toolbox add after the selected message; across a message row the lifeline shows no connect zone | end-to-end | planned |
| VO-036 | FR-010 | Item sizes and zoom levels on both sides of the hide threshold | Handles fit exactly when both on-screen dimensions are at least 52 px | unit | planned |
| VO-037 | FR-006, EC-01 | Pairs of pointer releases differing in time, distance, item and whether a drag happened | A double activation is reported only for two releases on the same item within 400 ms and 8 px with no drag between | unit | planned |
| VO-038 | FR-006, EC-01 | In each view, a double-click with no movement, and a press with 3 px of movement then release | The double-click opens the editor and moves nothing; the small movement is a click (selection only), with no move and no line | end-to-end | planned |
| VO-039 | FR-007, EC-07 | The inline editor is open; formatted text with line breaks is pasted | No formatting control is shown; the label holds the characters and line breaks as plain text | end-to-end | planned |
| VO-040 | FR-016 | A line is selected so that its end handle covers a connection handle of the item it joins | Only the end handle is visible and hit there; dragging it moves the end; the item's other handles still draw new lines | end-to-end | planned |
| VO-041 | FR-018 | A Sequence message and a C4 Dynamic relationship are dragged to reorder; end handles are dragged to other items | Reordering and end moves work as before this feature, each in one undo step | end-to-end | planned |
| VO-042 | FR-022, SC-008 | Each view is scanned with handles visible, a line being drawn and the inline editor open; the hover outline, handle dots and target marks are measured against their background | No WCAG 2.2 AA violation is found; each mark has contrast of at least 3:1; the drop target differs from other valid targets in stroke width or pattern, not colour alone | end-to-end | planned |
| VO-043 | FR-023, SC-009, EC-15 | The full unit and end-to-end suites run; a label typed in the Properties panel is left by moving focus away | Every existing test passes with none weakened, skipped or removed (the C4 body-drag test changed only as DC-02 records); the Properties panel keeps its fields and keeps the unconfirmed draft when focus leaves | end-to-end | planned |
| VO-044 | FR-002, EC-03 | With the inline editor open: Ctrl+Z inside it; then the toolbar's Undo and Redo buttons | Ctrl+Z undoes typing only; each toolbar click discards the uncommitted text and then undoes or redoes one diagram step | end-to-end | planned |
| VO-045 | FR-001, EC-04 | The canvas is zoomed and panned while the inline editor is open, including until the label is off screen | The editor stays on its label with its text and stays open | end-to-end | planned |
| VO-046 | FR-004, EC-05 | Another tab takes over editing while the inline editor holds text | The edit is dropped and nothing is committed | end-to-end | planned |
| VO-047 | FR-002, EC-06 | The page is reloaded while the inline editor holds uncommitted text | The browser asks for confirmation | end-to-end | planned |
| VO-048 | FR-001, EC-08 | Empty canvas is double-clicked in each view | Nothing is created, nothing is selected or edited, and the zoom does not change | end-to-end | planned |
| VO-049 | FR-001, EC-10 | A five-line label with a long line is edited in place | The editor grows to show the text and covers no more of the canvas than the label's own area plus the editor's border | end-to-end | planned |
| VO-050 | FR-011, EC-13 | A new line is released over the end handle of a selected line | The new line ends at the item that end belongs to | end-to-end | planned |
| VO-051 | FR-003, US1-AS1, SC-003 | A scripted user renames an item from the canvas only | The new label reaches the source in under 5 seconds from the double-click, with the Properties panel never focused | end-to-end | planned |
| VO-052 | FR-011 | For each diagram type and C4 kind, the valid ends of a new line are listed | Every node, participant and actor; every C4 element; Deployment nodes in Deployment diagrams; never a boundary | unit | planned |
| VO-053 | FR-002, FR-004, EC-15 | Reducer: an inline draft loses focus (commit and discard), and a Properties panel draft loses focus | The inline draft commits or is discarded as asked; the panel draft is unchanged | unit | planned |

### Verification exemptions

| Requirement | Reason | Alternative verification |
|-------------|--------|--------------------------|
| None | - | - |

### Manual verification

| ID | Covers | Steps | Expected result | Why not automated |
|----|--------|-------|-----------------|-------------------|
| MV-001 | FR-019, US5-AS1, US5-AS2, US5-AS3 | On a touchscreen laptop and with a pen tablet, in Chromium and Firefox: tap to select, drag a body, drag a handle, double-tap a label, in each view | Same results as with a mouse; handles appear on selection; double-tap opens the editor | Firefox has no protocol for synthetic touch or pen, and emulation does not prove real hardware |
| MV-002 | FR-020, FR-021, US5-AS4, US5-AS5 | With NVDA on Firefox and Orca on Chromium: focus an item, a handle, open and close the inline editor, commit invalid text | The description, the handle name, the editor's name, the return of focus and the rejection message are all spoken | Automated tests read the accessibility tree, not what a screen reader says |
| MV-003 | FR-013, FR-022 | Look at hover, selection, valid target and drop target marks in each view | The hover outline reads as subtle and distinct from selection; the drop target is obvious among valid targets | "Subtle" and "clearly marked" are visual judgements |

### Behaviour checklist

Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).
