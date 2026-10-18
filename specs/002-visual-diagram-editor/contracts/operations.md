# Contract: Editing operations and history

The boundary between the interface and the pure layers. The interface builds an operation from a gesture or a
keyboard command and calls `commit`; it never edits a diagram directly. Entities: [data-model.md](../data-model.md).

## Commit

`commit(history, operation, mergeKey?) -> { history, outcome }`

- `outcome` is `{ committed: true }` or `{ committed: false, rejection? }`.
- On rejection, `history` is returned unchanged (same reference) and nothing is pushed (FR-009).
- On commit, the previous present is pushed to `past` and `future` is emptied (FR-008), except that a commit
  whose `mergeKey` equals the current unsealed merge group's key replaces the present without pushing (arrow-key
  moves, FR-019).
- `seal(history) -> history` closes the current merge group without changing the present, past or future. After
  sealing, the next commit starts a new undo step, even if it uses the same merge key.
- Seal the group on a non-arrow commit, selection change, focus leaving the canvas, Undo or Redo. Only
  uninterrupted arrow-key moves of the same node may share one undo step.
- An operation that would change nothing (a move to the same position, a rename to the same label) returns
  `{ committed: false }` with no rejection and no history entry.
- `undo` and `redo` return the same reference when there is nothing to undo or redo; `canUndo` and `canRedo`
  report availability. History is unlimited and is never persisted.

## Shared operations (every type)

| Operation | Accepted when | Result | Rejections |
|-----------|---------------|--------|------------|
| `renameDiagram(name)` | `name` visible | Name replaced | `blankName` |
| `setLabel(itemId, field, text)` | item exists; field exists for its type; required fields visible | Field replaced | `unknownItem`, `blankLabel`, `blankMessage`, `blankRelationshipLabel`, `noSuchField` |
| `deleteItem(itemId)` | item exists | See per-type rules; never adds a relationship (FR-011) | `unknownItem` |
| `changeType(itemId, newType)` | item exists; `newType` in the same family and offered by the type or kind (FR-040) | Only the type changes; label, details, connections, position or order, membership and number kept | `unknownItem`, `crossFamily`, `notOfferedInKind`, `typeFixed` (boundaries, Deployment nodes) |
| `moveEnd(linkId, end, targetId)` | link and target exist; target allowed as an end | That end replaced; label, type, technology, direction, order and number kept (FR-041) | `unknownItem`, `unknownEndpoint`, `endNotAllowed` |
| `reverse(linkId)` | link exists and reversing changes something | `from` and `to` swapped; all else kept | `unknownItem`, `reverseSelf`, `reverseUndirected` |

## Flowchart

| Operation | Accepted when | Result | Rejections |
|-----------|---------------|--------|------------|
| `addNode(shape, position)` | shape is one of nine | Node with label = shape name, at the free position nearest `position` (FR-007, EC-01) | `unknownShape` |
| `moveNode(id, position)` | node exists | Position = free position nearest the request, excluding that node from collision checks; nothing else changes | `unknownItem` |
| `addConnection(from, to, line, ending, label?)` | both nodes exist (may be equal) | Connection appended | `unknownEndpoint` |
| `deleteItem(node)` | | Node and every incident connection removed (EC-02) | |

Reverse is unavailable for a self-loop, `plain` and `both` endings.

For add and move, collision uses the nominal 160 x 64 footprint. If multiple free candidates are equally near,
the first candidate in the fixed outward ring-search order wins. A free requested position is kept exactly.
Coordinates must be finite and within the bounds in [data-model.md](../data-model.md).

## Sequence

| Operation | Accepted when | Result | Rejections |
|-----------|---------------|--------|------------|
| `addParticipant(role, index?)` | | Inserted at `index` or appended; label = `Participant` or `Actor` | |
| `addMessage(from, to, style, text, index?)` | ends exist (may be equal); `text` visible | Inserted at `index` or appended (FR-039) | `unknownEndpoint`, `blankMessage` |
| `reorder(itemId, toIndex)` | item exists; index in range | Item moved within its list; one undo step | `unknownItem`, `outOfRange` |
| `deleteItem(participant)` | | Participant and all its messages removed (FR-029) | |

Free positioning does not exist for Sequence (FR-038).

## C4

| Operation | Accepted when | Result | Rejections |
|-----------|---------------|--------|------------|
| `addElement(elementType, parentId?, index?)` | type offered by kind; parent allowed | Element with label = type name, at end of parent or top level | `notOfferedInKind`, `parentNotAllowed` |
| `addContainer(boundaryType or node, parentId?)` | offered by kind | New empty boundary or Deployment node | `notOfferedInKind`, `parentNotAllowed` |
| `addRelationship(from, to, direction)` | ends exist and are elements, or nodes in Deployment | Appended with label `Uses` | `unknownEndpoint`, `endNotAllowed` |
| `moveToParent(itemId, parentId or top, index?)` | item exists; parent allowed for it in the kind; not itself or a descendant | Membership changes; relationships kept (FR-034) | `unknownItem`, `parentNotAllowed`, `nestingCycle` |
| `reorder(relationshipId, toIndex)` | Dynamic; index in range | Relationship moved; numbers follow (FR-033) | `unknownItem`, `outOfRange` |
| `setTitle(text)` | | Title replaced (may be empty) (FR-054) | |
| `deleteItem(element or node)` | | Item, its relationships removed; nothing added | |
| `deleteItem(boundary or node with children)` | | Children move to its parent at its position, order kept (Clarification (plan)) | |

Reverse is unavailable for two-way relationships and relationships from an item to itself.

## Rejection messages

Each reason has one fixed sentence in the text catalogue (FR-022), for example:

| Reason | Message |
|--------|---------|
| `blankLabel` | A label needs at least one visible character. The previous label was kept. |
| `blankMessage` | A message needs text with at least one visible character. |
| `blankRelationshipLabel` | A relationship needs a label with at least one visible character. The previous label was kept. |
| `blankName` | A diagram name needs at least one visible character. |
| `crossFamily` | A <from> can only be changed to another type in its family. Delete it and add a <to> instead. |
| `reverseSelf` | This connection starts and ends at the same item, so reversing it would change nothing. |
| `reverseUndirected` | This connection has no single direction, so reversing it would change nothing. |
| `nestingCycle` | A boundary cannot be placed inside itself or inside one of its own boundaries. |
| `parentNotAllowed` | <item> cannot be placed inside <parent> in a <kind> diagram. |
| `endNotAllowed` | Relationships can start and end only at elements<, or deployment nodes>. |
| `unknownItem` / `unknownEndpoint` | That item no longer exists. / A connection must start and end on an item that exists. |
| `needsSelection` | Select a <thing> first. (EC-09, FR-015) |

## Not available (by design)

No operation sets a flowchart direction, positions a Sequence or C4 item freely, enters a Dynamic number, changes
a boundary's or Deployment node's type, changes a type across families, multi-selects, copies or pastes items,
snaps to a grid, auto-arranges, or reads Mermaid source (FR-005, FR-015, FR-023, FR-038).
