# Data Model: Mermaid Editor UX and Workflow Clarity

No stored data changes. The diagram model, the persisted diagram format and the session format stay as they are (FR-036). Only in-memory editor state gains fields.

## Editor state additions

| Field | Type | Meaning |
| --- | --- | --- |
| `cancelTarget` | derived, not stored | What the next Escape cancels: `label`, `connection`, or `selection`. Derived from `draft` and `gesture`. |
| `unsaved` | boolean, derived | True when the model has a committed change that no successful write covers. |

`EditorState` keeps `history`, `selection`, `gesture`, `nameDraft`, `draft`, `armed` and `feedback`. `cancelTarget` and `unsaved` are computed from them, not stored, so they cannot drift.

## Save status

`SaveStatus` in `app/editor/saveStatus.ts` keeps its five values: `new`, `saving`, `saved`, `not-saved`, `unavailable`. Two rules are added:

- `unsaved` is derived: a committed change exists and the last write has not completed.
- `saved` is shown only after the write of the newest revision completes (unchanged).

Transitions: `new` → `saving` on first commit → `saved` on success. `saved` → `saving` on the next commit. Any failure → `not-saved` or `unavailable`.

## Selection kind

`SelectionKind` in `app/editor/selection.ts` gains no new value. The panel names the existing kind for each selected element (FR-013). Per-type branches stay as they are.

## Session persistence

`sessions.ts` stores the same fields as before. The dismiss state for guidance is not added: the empty-canvas hint has no dismiss control (clarification), and contextual prompts follow the active gesture.
