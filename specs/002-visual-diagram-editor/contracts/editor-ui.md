# Contract: Editor user interface

What the user can see and do, with the accessible names end-to-end tests use. Wording lives in the text
catalogue (FR-022); the names below are the English defaults.

## Routes

| Path | Screen |
|------|--------|
| `/` | Start screen |
| `/new/:type` and `/new/c4/:kind` | New, not yet saved diagram (EC-15) |
| `/d/:id` | Saved diagram |

## Start screen (FR-001, FR-044, FR-047, FR-049, US7-AS12)

- Heading "Mermaid diagram editor"; region "New diagram" with buttons **Flowchart**, **Sequence**, **C4**.
- **C4** opens dialog "Choose a C4 kind" with buttons **Context**, **Container**, **Component**, **Dynamic**,
  **Deployment** and the note "C4 support in Mermaid is experimental. Other tools may draw these diagrams
  differently or not at all." (FR-036).
- Button **Open file…**.
- List "Saved diagrams", most recently changed first; each row: name, type (and kind), last changed, actions
  **Open** and **Delete…** (Delete hidden, with "Open in another tab", while the diagram is held elsewhere).
  Unreadable rows: "Cannot be read: <reason>" and **Delete…** only.
- Note: "Diagrams are kept only in this browser. Save files as a backup."

## Editor (all types)

| Region | Content |
|--------|---------|
| Header | Diagram name (editable, **Rename**), type label (for example "C4 Dynamic diagram"), save status (`role="status"`: "Saved", "Saving…", "Not saved. Save a file to keep a copy.", "Browser storage is unavailable. Save a file to keep a copy."), **Start screen** |
| Toolbar | **Undo**, **Redo** (disabled when unavailable), **Copy Source**, **Copy for Markdown**, **Save file**, **Zoom in**, **Zoom out**, **Fit to view**; Flowchart adds **Preview as Mermaid draws it** and the note "Node positions are kept in the editor only. Mermaid arranges the copied diagram its own way." |
| Toolbox | Buttons for the type's (and kind's) elements and connection or relationship types only (FR-002); activating adds (FR-019) or arms the connection type; draggable onto the canvas with a pointer |
| Canvas | Region named "Diagram canvas"; every item focusable with an accessible name (FR-020); empty hint "Drag an element from the toolbox, or activate one, to start." (US6-AS5) |
| Properties | For the selection: label (and description, technology, title for C4), **Change type** (family only), **Connect…**, **Change end…**, **Reverse**, **Move up**, **Move down**, **Move to…**, **Delete** |
| Source panel | Disclosure "Mermaid source" (collapsed by default), read-only text, check status, notices (research R6) |
| Feedback | One polite live region for all messages; rejections also shown near the canvas |

## Keyboard (FR-019, research R10)

| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Move focus between items (focus selects) |
| Enter, F2 | Edit label of focused item; Enter confirms, Escape cancels (no history entry) |
| Delete, Backspace | Delete focused item |
| Arrow keys with a flowchart node selected | Move by 16 units; consecutive moves of one node are one undo step |
| Ctrl/Cmd+Z; Ctrl/Cmd+Shift+Z, Ctrl+Y | Undo; Redo |

## Dialogs

- **Connect…** / **Change end…**: list of allowed targets, "<label> (<type> <n>)", equal labels distinguishable
  (EC-20).
- **Move to…**: "Top level" and each allowed boundary or node.
- **Delete diagram?** (start screen): confirm and cancel.
- **Open in another tab**: "This diagram is open in another tab." with **Edit here instead** and **Start screen**.
- **Editing moved to another tab**: shown in the tab that lost the lock, with **Take it back** (FR-051).

## Flowchart preview (FR-053)

Region named "Preview as Mermaid draws it", read-only, with its own **Zoom in**, **Zoom out**, **Fit to view**;
updates after every change, Undo and Redo; on failure shows "Mermaid could not draw this diagram: <reason>" in
place of any picture.

## Leaving (FR-018)

The browser's leave-page confirmation appears only while the save status is not "Saved" for a diagram with a
committed change, or while a label draft is open.
