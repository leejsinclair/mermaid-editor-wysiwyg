# Data Model: Canvas Usability

Phase 1 for [plan.md](plan.md). This feature changes interaction only. **The diagram model, the saved diagram
format, the file format and the generated Mermaid source do not change**; no migration is needed. What follows
is editor view state, which is never saved.

## Editor state changes

`EditorState` (`app/editor/reducer.ts`) keeps its fields. One field changes shape:

| Field | Before | After |
|-------|--------|-------|
| `draft` | `{ itemId, text, field? } \| null` | `{ itemId, text, field?, origin } \| null`, where `origin` is `"panel"` (typed in the Properties panel) or `"canvas"` (typed in the inline editor) |

New actions:

| Action | Effect |
|--------|--------|
| `startInlineEdit` | With an item or line selected: sets `draft` to its current label (the `label` or `text` field), `origin: "canvas"`. Ignored when nothing is selected. |
| `blurInlineEdit { discard: boolean }` | For a `canvas` draft only: `discard` true acts as `cancelDraft`; false acts as `confirmLabel`. A `panel` draft is left alone. |

Existing actions keep their meaning: `confirmLabel` commits `setLabel` (one undo step, rejection message and no
change when invalid, no history entry when unchanged); `cancelDraft` drops the draft; `select`, `undo`, `redo`
and `release` drop the draft.

State rules:

- The inline editor is open exactly when `draft !== null && draft.origin === "canvas" && draft.itemId === selection`.
- A rejected commit closes the editor (the draft becomes `null`) and sets `feedback` to the rejection message.
- The leave-page confirmation already treats any non-null `draft` as unsaved work (editor spec FR-018), so
  EC-06 needs no new state.

## Canvas view state (not in the editor state)

Held inside each canvas while a gesture is in progress; never committed.

| Concept | Values | Notes |
|---------|--------|-------|
| Zone | `body`, `connect`, `end`, `line` | Exposed as `data-zone` on the drawn part; decides cursor and drag kind |
| Drag kind | Flowchart: React Flow node drag or connection. Sequence: `participant`, `message`, `create`, `end`. C4: `move`, `create`, `reorder`, `end` | C4 element bodies change from `create` to `move` |
| Target state | `valid`, `drop`, none | Exposed as `data-target` on items while a line is drawn |
| Insertion gap | index 0..n | Sequence only, while a message is drawn |

## Pure functions added (rendering layer, no DOM)

| Function | Input | Output |
|----------|-------|--------|
| `nearestSides(from, to)` | Two node boxes | Source and target side ids (`top`, `right`, `bottom`, `left`) |
| `handlesFit(size, zoom)` | Item size in drawing units, zoom | Whether handles show (both on-screen dimensions ≥ 52 px) |
| `insertIndexAt(y, rows)` | Release height, message rows | Insertion index in the message order |
| `isDoubleActivation(previous, next)` | Two pointer releases (time, point, item) | Whether they form a double activation (≤ 400 ms, ≤ 8 px, same item, no drag) |
| `validEnds(diagram)` | A diagram | The item ids a new line may end on |
