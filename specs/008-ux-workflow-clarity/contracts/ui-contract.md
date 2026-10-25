# UI Contract: Mermaid Editor UX and Workflow Clarity

Tests pin these strings and groupings exactly. Do not rename or recase them.

## Toolbar groups (FR-017)

| Group | Actions |
| --- | --- |
| History | Undo, Redo |
| Diagram editing | Rename, Change type, Move to… (per the action table) |
| Export and sharing | Copy Source, Copy for Markdown, Save file |
| View | Zoom in, Zoom out, Fit to view, Preview as Mermaid draws it, Mermaid source (show or hide), Appearance (Blueprint, Light) |

Group headings use the words above. Less frequent actions sit in the overflow menu under the label "More actions", and each keeps its toolbar name.

## Verbatim labels

- Preview toggle: `Preview as Mermaid draws it`
- Preview return control: `Back to editing`
- Export: `Copy Source`, `Copy for Markdown`, `Save file`
- Element actions: `Rename`, `Connect…`, `Change endpoints`, `Reverse`, `Delete`
- Appearance: `Blueprint`, `Light`

## Escape order (FR-009, FR-005)

| Active state | Escape result |
| --- | --- |
| Inline label edit | Cancel the edit; previous label kept |
| Connection in progress | Cancel the connection; selection kept |
| Neither, and something selected | Clear the selection |

## Messages

- Empty label confirmed: "A label cannot be empty." The editor stays open.
- Save failed: a visible message that the diagram was not saved.
- Connection prompt: says whether the user is choosing the source or the destination, and says how to cancel.

## Accessibility

- Icon-only controls: accessible name plus tooltip, visible focus.
- Disabled actions: `aria-disabled="true"` with the reason as text.
- Toggled controls (Preview, Mermaid source, Appearance): `aria-pressed` or `aria-expanded`.
