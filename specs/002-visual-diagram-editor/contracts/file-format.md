# Contract: Diagram files and browser storage

## File (FR-048, FR-049, FR-050, FR-052)

- Extension `.mermaid-editor.json`; content UTF-8 JSON:

  ```json
  { "format": "mermaid-editor-wysiwyg", "formatVersion": 1, "diagram": { "name": "…", "type": "c4", "kind": "dynamic", "title": "", "nextId": 7, "content": { } } }
  ```

- `diagram` holds the model of [data-model.md](../data-model.md) without `id` and `changedAt`. It never holds
  Mermaid source or undo history.
- **Save**: offered as a download named `<safe name>.mermaid-editor.json`, where the safe name is the diagram name
  with every character other than letters, digits, space, `-`, `_` and `.` replaced by `_`, trimmed, cut to 100
  characters, and `diagram` if nothing remains. Feedback: "The file was offered for download." Never "saved".
- **Open**, in this order, stopping at the first failure with nothing loaded or written:
  1. Size at most 5 MB (`fileTooLarge`) (DC-05).
  2. Valid JSON (`notJson`).
  3. `format` equals `mermaid-editor-wysiwyg` (`notEditorFile`).
  4. `formatVersion` is an integer no greater than the current one (`newerVersion`); older versions are migrated
     step by step (EC-12).
  5. `checkDiagram` accepts the whole diagram: every invariant in data-model.md (`invalidDiagram`, with the first
     problem found, for example "Message 3 refers to a participant that does not exist").
  6. Only then: a new id and `changedAt` are assigned and a new saved record is written; no existing record is
     touched.
- Text from a file is displayed as text, never interpreted as markup (DC-04).

| Refusal | Message |
|---------|---------|
| `fileTooLarge` | This file is larger than 5 MB, so it is not a diagram file from this editor. Nothing was opened. |
| `notJson` / `notEditorFile` | This file is not a diagram file from this editor. Nothing was opened. |
| `newerVersion` | This file was saved by a newer version of the editor and cannot be opened here. Nothing was opened. |
| `invalidDiagram` | This file is damaged: <problem>. Nothing was opened. |

## Browser storage (FR-042 to FR-047, FR-050, FR-051)

- IndexedDB database `mermaid-editor`, store `diagrams`, key `id`; record
  `{ id, name, type, kind, changedAt, formatVersion, model }`.
- Write: one `readwrite` transaction per committed change, Undo or Redo, after checking the tab still holds the
  diagram's lock; the transaction reads the record's `owner` token (tab id plus epoch) and aborts if it is not
  this tab's, so a write queued before a lock takeover never lands after it; "Saved" only on `complete` of the
  latest enqueued revision (otherwise "Saving…"); on `error`/`abort` "Not saved. Save a file to keep a copy."
- First write at the first committed change of a new diagram (EC-15).
- Read for listing: migrate, then `checkDiagram`; a failing record is listed as "Cannot be read: <reason>" with
  Delete only (EC-11).
- Delete: after confirmation, deletes that one record; refused while the diagram's lock is held by any tab
  (EC-13).
- Lock: Web Locks name `diagram:<id>`; take over with `steal`; released by the browser when the tab closes or
  crashes (EC-14).
