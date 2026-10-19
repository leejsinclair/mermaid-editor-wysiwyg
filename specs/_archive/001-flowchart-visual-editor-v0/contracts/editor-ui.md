# Contract: Editor user interface

What the user can see and do. Names are the accessible names the end-to-end tests use.

## Screens

1. **Start**: shown when no diagram exists, and again after a reload (nothing is persisted, FR-023). It prompts
   for a diagram type and offers exactly one: **Flowchart** (FR-001).
2. **Editor**: shown after choosing Flowchart; the selected type (**Flowchart**) is displayed.

## Editor regions

| Region | Contents |
|--------|----------|
| Toolbox | Nine node shapes and nine connection types, each with a distinct drawing and accessible name. Nothing else (FR-002). |
| Toolbar | **Undo**, **Redo**, **Rename**, **Delete**, **Copy Source**, source-panel toggle. |
| Canvas | The drawn diagram; the only place elements are edited. |
| Source panel | Expandable, read-only text of the generated source with its check status. Collapsed by default. |
| Feedback | Visible message area and a polite live region. |

There is no direction control, no shape-change control, no control for a connection's style, direction or
endpoints, and no import, export, save, share or history control (FR-025, FR-009, FR-015, FR-023).

## Node shapes (accessible names)

Rectangle, Rounded rectangle, Stadium, Diamond, Circle, Parallelogram, Cylinder, Subroutine, Hexagon.

## Connection types (accessible names)

For each of Solid, Dotted, Thick: **arrow**, **line**, **two-way arrow** (for example "Solid arrow",
"Dotted line", "Thick two-way arrow").

## Gestures

| Action | Gesture | Result |
|--------|---------|--------|
| Add node | Drag a shape from the toolbox and drop it on the canvas | `addNode` at the drop location, nearest free position if occupied; opens nothing |
| Cancel add | Drop outside the canvas | Nothing is added; history unchanged |
| Select | Click, or move focus and press Enter or Space | Element shown as selected |
| Move | Drag a node and release | One `moveNode` at release; connections follow while dragging; release outside the canvas cancels |
| Choose connection type | Click a connection type in the toolbox | That type is used for the next connection |
| Connect | Drag from a node's handle to another node (or the same node) | `addConnection` with the chosen type; a type must be chosen first, else the Feedback says so |
| Release connection on empty canvas | Drop on no node | Rejected: "A connection must start and end on a node." Nothing added |
| Rename node / edit connection label | Select, then Rename, Enter or F2, or double-click | A text editor opens; Enter confirms (Shift+Enter inserts a line break); Escape cancels |
| Delete | Select, then Delete button or the Delete or Backspace key | `deleteNode` or `deleteConnection` |
| Undo / Redo | Buttons, Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y | History step; button disabled when none is available |
| Copy Source | Button | Source placed on the clipboard; success shown only after the clipboard call resolves |

## Feedback texts

| Situation | Kind | Text |
|-----------|------|------|
| Rename or Delete pressed with nothing selected | rejection | Select a node or connection first. |
| Connection started with no type chosen | rejection | Choose a connection type in the toolbox first. |
| Blank node label confirmed | rejection | (from [operations.md](operations.md)) |
| Connection released off a node | rejection | A connection must start and end on a node. |
| Copy succeeded | success | Source copied to the clipboard. |
| Copy failed or clipboard unavailable | failure | Could not copy the source. Your browser blocked clipboard access. |
| Source check failed | failure | The generated source could not be verified: {reason}. Copy Source is unavailable. |
| Canvas drawing failed | failure | The diagram could not be drawn. Your edits are not lost; try Undo. |

## Keyboard (FR-024)

Operable without a pointer: select (Tab to an element, Enter or Space), rename (Enter or F2), delete (Delete or
Backspace), Undo, Redo, Copy Source. Adding, moving and connecting require a pointer in this release.

## Controls state

A control is enabled exactly when its action can run; an unavailable action is not offered (Undo and Redo are
disabled when empty). Rename and Delete are enabled and, with no selection, report what is needed.
