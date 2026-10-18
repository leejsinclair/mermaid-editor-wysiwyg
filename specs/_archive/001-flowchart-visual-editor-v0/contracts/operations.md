# Contract: Editing operations and history

The boundary between the user interface and the pure layers. The interface builds an operation from a gesture
and calls `commit`; it never edits a diagram directly.

## Commit

`commit(history, operation) -> { history, outcome }`

- `outcome` is `{ committed: true }` or `{ committed: false, rejection }`.
- On rejection, `history` is returned unchanged (same reference) and nothing is pushed (FR-012, EC-05).
- On commit, `history.present` is a new Diagram, the previous present is the last of `past`, and `future` is
  empty (FR-019).
- Committing is atomic: the result is the whole operation or nothing.

## Operations

| Operation | Accepted when | Result on the Diagram | Rejection otherwise |
|-----------|---------------|-----------------------|---------------------|
| `addNode(shape, position, label)` | `label` has a visible character | New node appended with the next creation number at a free position nearest the request; counter advanced | `blankLabel` |
| `moveNode(id, position)` | node exists | Node `position` replaced by the free position nearest the request; nothing else changes | `unknownNode` |
| `renameNode(id, label)` | node exists and `label` has a visible character | Node `label` replaced | `unknownNode`, `blankLabel` |
| `deleteNode(id)` | node exists | Node removed; every connection whose `sourceId` or `targetId` is `id` removed; all else identical; no connection added | `unknownNode` |
| `addConnection(sourceId, targetId, style, ends, label)` | both nodes exist (they may be the same) | Connection appended with the next creation number | `unknownEndpoint` |
| `editConnectionLabel(id, label)` | connection exists | Connection `label` replaced (empty allowed); endpoints, style and ends unchanged | `unknownConnection` |
| `deleteConnection(id)` | connection exists | Connection removed; nodes and other connections identical | `unknownConnection` |

A move whose resolved position equals the current one is reported as `{ committed: false }` without a
rejection message and without a history entry (nothing changed).

"Has a visible character" means the label contains at least one character that is not a space, tab or line break.

## Rejection messages

Each reason has one fixed plain-language sentence, owned by the validation layer:

| Reason | Message |
|--------|---------|
| `blankLabel` | A node needs a label with at least one visible character. The previous label was kept. |
| `unknownNode` | That node no longer exists. |
| `unknownConnection` | That connection no longer exists. |
| `unknownEndpoint` | A connection must start and end on a node. |

## Undo and redo

- `undo(history)` and `redo(history)` return the same history reference when `past` or `future` is empty, and
  `canUndo`/`canRedo` are false then.
- After any sequence, `redo` of an `undo` restores the identical Diagram value that was undone.
- One entry in `past` is one user-meaningful change: a completed drag is one `moveNode`; a confirmed label edit
  is one `renameNode` or `editConnectionLabel`.

## Not available (by design)

There is no operation that changes a node's shape, or a connection's style, ends or endpoints, and no
operation that sets the flowchart direction or parses or imports source (FR-025, FR-009, FR-015).
