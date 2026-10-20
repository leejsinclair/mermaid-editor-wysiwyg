# Contract: Canvas Interaction

The user-facing contract for moving, connecting and editing labels in place on the Flowchart, Sequence and C4
canvases. It extends `specs/002-visual-diagram-editor/contracts/editor-ui.md`; anything not stated here is
unchanged. Tests rely on the attributes in the last section.

## Zones

| Zone | Where | Cursor | Drag does | Double activation does |
|------|-------|--------|-----------|------------------------|
| Body | Flowchart node; Sequence header box; C4 element, boundary or Deployment node box | `move` | Moves the item (position, order, or boundary or parent) | Opens the inline editor on the item's label |
| Connection handle | Flowchart: 4 side handles. C4: 4 side handles on elements and Deployment nodes. Sequence: the lifeline, except across message rows | `crosshair` | Draws a new line from the item | Nothing |
| End handle | Each end of the selected line | `grab` | Moves that end to another item | Nothing |
| Line | Flowchart connection; Sequence message row; C4 relationship | `pointer`, or `grab` where a drag reorders (Sequence message, Dynamic relationship) | Reorders where the view allows; otherwise nothing | Opens the inline editor on the line's label (an empty flowchart label opens empty at the middle) |

Precedence where parts overlap: end handle (of the selected line) > connection handle > line > body; the innermost
C4 box owns a point inside nested boxes; a Sequence message owns its whole row.

## Sizes

- Connection handles and end handles: hit square 28 × 28 screen px, visible dot 16 screen px, at every zoom level.
- Handles show only when the item is hovered or selected, and only when the item is at least 52 screen px wide and
  tall. A Sequence lifeline's connect zone shows only when the gap between message rows is at least 24 screen px.
- Hover outline: 1 px dashed, outside the shape. Selection outline: unchanged (3–4 px solid).

## Drawing a line

1. Press on a connection handle and move at least 5 px: a dashed preview line follows the pointer from the handle.
2. Every valid end is marked `valid`; the one under the pointer is marked `drop`. In Sequence an insertion marker
   shows the gap the message will land in.
3. Release over a valid item's body or any of its handles: one line is committed with the type a drag gives
   (flowchart: armed type or solid arrow; Sequence: solid arrow at the marked gap; C4: one-way, label "Uses").
4. Release anywhere else, or press Escape: nothing is committed.

## Inline editor

| Input | Result |
|-------|--------|
| Double activation on a body or line; F2 on the focused item; Enter on the selected item | Opens on the label with all text selected, focus inside |
| Enter | Commits (one undo step); closes |
| Shift+Enter | Inserts a line break |
| Escape | Discards; closes; no history entry |
| Click or tap outside; Tab | Commits; closes; the click then acts as usual |
| Toolbar Undo or Redo | Discards, then undoes or redoes |
| Ctrl+Z inside the editor | Undoes typing only |
| Invalid text committed | Closes; previous label kept; rejection message shown and announced |

Accessible name: "Label of <item name>". On close, focus returns to the item.

## Keyboard

- F2 on a focused canvas item opens the inline editor (it no longer moves focus to the Properties panel).
- Enter on a focused, unselected item selects it; Enter on the selected item opens the inline editor.

## Test attributes

| Attribute | On | Values |
|-----------|----|--------|
| `data-zone` | Every hit-testable canvas part | `body`, `connect`, `end`, `line` |
| `data-target` | Items while a line is drawn | `valid`, `drop` |
| `data-testid="inline-label-editor"` | The inline editor | – |
| `data-testid="insertion-marker"` | Sequence insertion marker | – |
| `data-testid="lifeline-hint"` | Sequence lifeline hint | – |
| `data-side` | Flowchart and C4 connection handles | `top`, `right`, `bottom`, `left` |
| `data-discards-draft` | Toolbar Undo and Redo buttons | – |

Existing test ids (`participant-header`, `lifeline`, `message-end-from`, `relationship-end-to`, and so on) stay.
