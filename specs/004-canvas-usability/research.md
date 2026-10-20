# Research: Canvas Usability

Phase 0 for [plan.md](plan.md). Each entry records a decision, why, and what else was considered. Facts about the
current code were read from the repository on 2026-10-20.

## Current state (facts)

- **Flowchart** (`app/rendering/flowchart/`): React Flow 12. Each node has one target handle (top) and one source
  handle (bottom) at React Flow's default size (about 6 px). Dragging a node anywhere moves it; dragging a source
  handle draws a connection with the armed type (`armed ?? solid arrow`). Edges are reconnectable by their ends.
  `zoomOnDoubleClick` is off. React Flow's default node drag threshold is 1 px.
- **Sequence** (`app/rendering/sequence/`): an SVG drawn from `sequenceLayout`. The header (`participant-header`)
  reorders on drag; a transparent 24-unit-wide rect over the lifeline (`lifeline`) starts a message; a message row
  reorders on drag; a selected message shows two end circles (radius 7). A drawn message is always `solid-arrow`
  and is inserted after the selected message or at the end (`messageInsertIndex`), not at the release height.
- **C4** (`app/rendering/c4/`): an SVG drawn from `c4Layout`. Dragging an element body is a `create` drag:
  released on an element it adds a relationship, released on a boundary or node it moves the element there.
  Boundaries and Deployment nodes drag as `move`. A drawn relationship is always one-way.
- **Shared drag** (`useDrag`): a 5 px threshold separates a click from a drag; Escape cancels; the release point is
  converted to drawing units by the zoom. Sequence and C4 zoom runs from 0.25 to 4 (`viewport.ts`).
- **Labels**: the editor state holds one `draft` (item, field, text). The Properties panel writes it; Enter
  (`confirmLabel`) commits `setLabel`, which validates and rejects with a message; Escape (`cancelDraft`) drops it;
  selecting another item, Undo, Redo and a tab takeover (`release`) drop it. Focus leaving the panel keeps it.
  Committing unchanged text adds no history entry (`app/history/noChange.test.ts`).
- **Keyboard**: F2 on a canvas item moves focus to the Properties label field (`app/editor/keyboard.ts`). Enter or
  Space on a focused canvas item selects it. Shortcuts are ignored while a text field has focus.
- **Styles**: there is no project stylesheet; components use inline styles and MUI. Stylelint is configured for
  `app/**/*.css`.

## R1 — Where the inline editor lives

**Decision**: Render the editor inside the drawing's own coordinate space, at the label: inside the node in
React Flow (with `nodrag nopan nowheel`), inside `EdgeLabelRenderer` for a connection, and in an SVG
`foreignObject` for Sequence and C4. One shared component, `InlineLabelEditor` (a `textarea`), is used by all
three canvases.

**Rationale**: The editor then follows its label through zoom and pan with no measuring code (EC-04), and stays
inside the canvas's own focus order.

**Alternatives**: A single overlay positioned from `getBoundingClientRect` (needs re-measuring on every viewport
change and on scroll); a MUI Popover (leaves the canvas and steals the zoom behaviour).

## R2 — Editor state and committing

**Decision**: Reuse the existing `draft` with a new `origin: "panel" | "canvas"` field and add two actions,
`startInlineEdit` (opens the editor on the selected item with its current label) and `blurInlineEdit`.
`confirmLabel`, `cancelDraft` and `setLabel` stay as they are, so validation, messages and one-step undo are the
Properties panel's own (FR-004). Only a `canvas` draft commits when focus leaves (FR-002); a `panel` draft keeps
its current behaviour (EC-15). A rejected commit closes the editor and keeps the feedback message (FR-004).

**Undo and Redo while editing (EC-03)**: `undo` and `redo` already drop the draft. The toolbar's Undo and Redo
buttons carry `data-discards-draft`; when the inline editor loses focus to one of them it cancels instead of
committing, and the click then performs the step. Ctrl+Z inside the editor stays the browser's text undo,
because shortcuts are already ignored in text fields.

**Alternatives**: A second, canvas-only draft (two sources of truth for one label; the Properties panel would
show stale text); committing then undoing (rejected by the Business Analyst).

## R3 — Telling a double-click from a drag, for every pointer type

**Decision**: Detect a double activation from pointer events, not from the `dblclick` event: two `pointerup`s on
the same item within 400 ms and 8 px, with no drag between, start editing. The rule is a pure function
(`isDoubleActivation`) with unit tests. The React Flow node drag threshold is raised to the shared 5 px
(`nodeDragThreshold={5}`), so a press that wobbles less than 5 px is a click on every canvas (EC-01).

**Rationale**: `touch-action: none` on the canvases stops browsers from synthesising `dblclick` for a double-tap,
so the native event would leave touch and pen without in-place editing (FR-019).

**Alternatives**: Native `dblclick` plus a separate tap counter for touch (two code paths for one behaviour).

## R4 — Flowchart handles on four sides, lines between nearest sides

**Decision**: Each node gets four React Flow handles of type `source` with ids `top`, `right`, `bottom`, `left`,
and the canvas uses `connectionMode={ConnectionMode.Loose}` so any handle can start or end a line. The model is
unchanged. When edges are derived, a pure function `nearestSides(from, to)` picks the source and target handle
ids from the two nodes' positions (the pair of sides that face each other, by the larger of the horizontal and
vertical gap); a self-loop keeps today's bottom-to-top loop. A release on a node's body is caught by
`onConnectEnd`: when React Flow found no handle, the node under the pointer (if any) becomes the target.

**Rationale**: Settled by the Business Analyst (no side saved, nearest sides, recalculated on move); React Flow's
loose mode is the documented way to let source handles connect to each other.

**Alternatives**: Storing the side (format change, refused); a custom floating-edge implementation (more code for
the same result).

## R5 — Handle size at every zoom level, and when handles hide

**Decision**: Every connection handle and end handle has an invisible hit square of **28 × 28 screen px** and a
visible dot of **16 screen px**, kept at that on-screen size by dividing by the current zoom (React Flow's
transform in the flowchart, `useSvgViewport`'s zoom in Sequence and C4). The 28 px square leaves margin over the
24 px minimum for sub-pixel rounding. An item's connection handles are hidden, and not hit-testable, when the item
is smaller on screen than **52 px** in width or height: below that, two 28 px squares centred on opposite sides
would leave less than a 24 px body between them. The rule is a pure function, `handlesFit(size, zoom)`. A
Sequence lifeline's connect zone follows the same rule against the gap between message rows (54 drawing units at
zoom 1).

**Rationale**: Business Analyst decision (every zoom level; hide when too small). React Flow scales handles with
the zoom by default, so the counter-scaling is needed in all three canvases.

**Alternatives**: Exactly 24 px (fails measurement at fractional zoom); scaling the threshold per shape (one rule
is easier to test and explain).

## R6 — Hover, cursors and visibility in one stylesheet

**Decision**: Add `app/rendering/shared/canvas.css`, imported once by the editor. Canvas parts carry a
`data-zone` attribute (`body`, `connect`, `end`, `line`) and the stylesheet sets cursors (`move`, `crosshair`,
`grab` for end handles and line reorder) and visibility: handles are hidden at rest and shown on
`:hover` of their item or when the item is selected (`aria-pressed="true"` or React Flow's `selected`). The hover
outline is a 1 px dashed outline offset outside the shape; the selection outline stays the existing 3–4 px solid
blue, so the two differ in width and pattern, not colour alone (FR-022). The drop target is marked with a thick
solid ring and a filled handle; other valid targets with a thin dashed ring.

**Rationale**: `:hover` and cursors cannot be expressed in inline styles. One file keeps the three canvases
consistent and is linted by the existing Stylelint setup.

**Alternatives**: Pointer-enter state in React (re-renders the canvas on every hover; harder to keep identical).

## R7 — Moving and connecting zones per canvas

**Decision**:

| Canvas | Body (drag to move) | Connection handles (drag to connect) | Lines |
|--------|--------------------|--------------------------------------|-------|
| Flowchart | Node outline (React Flow node) | 4 side handles | Edges: click to select; end handles reconnect |
| Sequence | Header box | Lifeline below the header, except across message rows | Message row reorders; end handles move an end |
| C4 | Element, boundary or Deployment node box | 4 side handles on elements and Deployment nodes, none on boundaries | Dynamic relationships reorder; end handles move an end |

Within an item a handle square sits on top of the body, so every point has exactly one owner: the topmost
element under the pointer (FR-016). A selected line's end handles are drawn above connection handles, and a
connection handle that an end handle covers is hidden while the line is selected. C4 boxes nest, and the innermost
box is drawn last, so it owns the pointer (EC-11).

A C4 body drag uses today's `placeAt` with the `element` case removed: the release point is resolved to the
innermost boundary or Deployment node containing it (or the top level), whether or not an element is drawn
there, so releasing over an element inside boundary B moves the dragged element into B.

**Rationale**: Matches the clarified spec. Removing the `element` case is the only change to C4 move semantics.

## R8 — Sequence insertion by release height

**Decision**: A pure function `insertIndexAt(y, rows)` returns the index between the message rows above and below
the release point (or the end). `onCreateMessage` gains the index; the keyboard and toolbox paths keep
`messageInsertIndex`. While a message is drawn, an insertion marker (a horizontal line across the diagram at that
gap) is shown, and on lifeline hover a short visible hint (`en.sequence.lifelineHint`) appears next to the
pointer.

## R9 — Drop targets while drawing

**Decision**: While a line is drawn, every valid end item gets `data-target="valid"`; the one under the pointer
gets `data-target="drop"`. Valid ends: every flowchart node (including the source); every Sequence participant or
actor (including the source); every C4 element, and every Deployment node in a Deployment diagram (including the
source). Boundaries never. In the flowchart the state comes from React Flow's `useConnection()`; in Sequence and C4
from `useDrag`'s current point. Releasing on anything else, or pressing Escape, cancels with no commit (React
Flow's in-progress connection is cancelled on Escape through its store).

## R10 — Accessible names and descriptions

**Decision**: Each item keeps its accessible name and gains `aria-describedby` pointing at one visually hidden
description per canvas, from the text catalogue: "Drag to move. Drag a handle to connect. Press F2 to rename.
Arrow keys move; the Connect command connects without dragging." (wording per type). Handles get
`aria-label` "Drag to connect" and `aria-hidden` stays off; they are not in the tab order, because Connect is the
keyboard path (editor spec FR-019). The inline editor's `aria-label` is "Label of <item name>"; it takes focus on
open and returns focus to the item on close. Rejection messages already go to the live region.

## R11 — Testing touch and pen

**Decision**: End-to-end tests drive touch and pen in Chromium through the DevTools protocol
(`Input.dispatchTouchEvent`, and `Input.dispatchMouseEvent` with `pointerType: "pen"`), since Playwright's
high-level API has tap but no touch drag. Firefox runs the mouse tests. Real touchscreen and pen hardware are a
manual check (MV-001).

## R12 — Existing tests affected

- `e2e/c4-toolbox.spec.ts` "a relationship is created by dragging from one element to another" drags an element's
  body. Under FR-014 that gesture now moves the element, so the test must drag from a connection handle. This
  changes an expectation and alters behaviour; the Business Analyst decided it in the spec (US3-AS7). It is
  recorded with `tdd_check.py expectation --alters-behaviour` and approved before the task closes.
- `e2e/support/flowchart.ts` `connect()` uses `.react-flow__handle.source` and `.target`. With four loose handles
  it selects handles by id. This changes test support, not an assertion.
- `e2e/sequence-reorder.spec.ts` creates a message by dragging from the middle of a lifeline with no messages; it
  still holds (the release height puts it at the end).
- No end-to-end test presses F2 today, so moving F2 to the inline editor breaks no existing test; the Properties
  panel stays reachable by Tab.

## Open points (not blocking)

- The double-activation window (400 ms, 8 px) and the 52 px hide threshold are plan values, not spec values.
- The follow-up user study in SC-004 is recommended after release and is not planned here.
