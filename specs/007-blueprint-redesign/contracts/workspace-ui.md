# Contract: Workspace UI

The roles and accessible names below are what users, assistive technology and the end-to-end tests rely on. Existing
names (from `app/text/en.ts`) are kept unchanged; new names are added to `app/text/en.ts` only.

## Header (`<header>`)

| Element | Role and name | Behaviour |
|---------|---------------|-----------|
| Application name | text "Mermaid diagram editor" | Unchanged name (Clarifications) |
| Diagram type, name, Rename, Start screen | as today | Unchanged |
| Appearance switch | `group` "Appearance" holding two toggle buttons "Blueprint Studio" and "Light", exactly one `aria-pressed="true"` | Activating the other button switches at once (FR-026); keyboard: Tab to the group, Space/Enter activates |

## Toolbar (`toolbar` "Diagram actions")

The toolbar is the second row of the header element, so the header holds the document actions and Undo/Redo (FR-005).

| Layout | Buttons visible in the toolbar | In the "More actions" menu |
|--------|-------------------------------|----------------------------|
| wide, narrow (≥ 600 px) | Undo, Redo, Copy Source, Copy for Markdown, Save file, Zoom in, Zoom out, Fit to view, Preview as Mermaid draws it (flowchart), layout note | — |
| compact (< 600 px) | Undo, Redo, Zoom in, Zoom out, Fit to view, `button` "More actions" (`aria-haspopup="menu"`) | `menuitem`s Copy Source, Copy for Markdown, Save file, Preview as Mermaid draws it (flowchart) |

Each control keeps its name, its effect and its disabled state wherever it is placed (FR-009). The layout note stays as
text in every layout.

## Tools

| Layout | Toolbox (`region` "Toolbox") and Properties (`region` "Properties") |
|--------|-------------------------------------------------------------------|
| wide | Toolbox to the left of the canvas, Properties to its right, as today |
| narrow, compact | Inside one panel `region` "Tools", shown above the canvas when the `button` "Tools" (`aria-expanded`, `aria-controls`) is pressed; closed at first; at most 45 % of the viewport height, scrolling inside |

## Source view

Collapsed disclosure "Mermaid source" as today. When expanded: a read-only `<pre>` whose text content equals the
generated source exactly, rendered as highlighted runs (data-model). The summary shows the source check text in the
state colour: checking (muted), valid (success), notice (warning), invalid (error, with the reason).

## Status bar (`<footer>`, `region` "Editor status")

| Item | Content | Notes |
|------|---------|-------|
| Zoom | text "Zoom {percent}%" | Whole percent of the current canvas zoom |
| Save status | `status` "Save status", texts as today | Moved from the header; same role, name and texts |
| Source check | text, same wording as the source view summary | Not a live region (the source view summary is the single place it is read from) |

## Canvas

| Part | Appearance | Must hold |
|------|------------|-----------|
| Surface | `canvasSurface` | Fills the canvas region |
| Grid | minor 16 px, major 80 px at zoom 1, scaled by zoom; minor omitted when 16 × zoom < 6 px | Receives no pointer events; no element per line; aligned with the drawing after pan, scroll and zoom |
| Items | fill `nodeFill`, outline and label `canvasInk` | Geometry, hit areas, handle sizes and cursors as in feature 004 |
| Selected item or line | outline or stroke `selection`, extra width as today | Distinct from the dashed hover outline |
| Focus | outline `accent`, 3 px, offset 2 px | Visible on every focusable canvas item |
| Attribution link (flowchart) | `textMuted` | 4.5:1 on `canvasSurface`, 24 px target as today |

## Mermaid drawings (preview, import picture, compare view)

Drawn with the Mermaid look of the current appearance (data-model). When the appearance changes, any drawing on screen
is redrawn. The drawn text is the source as generated or as pasted, unchanged.
