# Data Model: Visual Diagram Editor

The visual model is the only editable state (constitution I). Everything here is plain, immutable data in the
`model` layer, with no DOM and no Mermaid text. Generated source, layout positions for Sequence and C4, Dynamic
numbers and undo history are derived or session-only and are never stored in the model. Field names are
indicative; the contracts fix behaviour, not spelling.

## Diagram

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Editor id, unique among saved diagrams; a newly opened file always gets a new one (FR-049) |
| `name` | Label | At least one visible character; default `Untitled flowchart`, `Untitled sequence diagram`, `Untitled C4 <kind> diagram`; never in the source (FR-045) |
| `type` | `"flowchart" \| "sequence" \| "c4"` | Fixed at creation (FR-002) |
| `kind` | `"context" \| "container" \| "component" \| "dynamic" \| "deployment"` | C4 only; fixed at creation (FR-037) |
| `title` | string | C4 only; may be empty (FR-054) |
| `nextId` | positive safe integer | Counter for item ids; only increases, so ids are never reused (R5) |
| `content` | FlowchartContent \| SequenceContent \| C4Content | Matches `type` |
| `changedAt` | ISO timestamp | Set by persistence on each save, not by operations |

**Label** is any Unicode string. "Visible" means it contains at least one character that is not white space, a line break or a zero-width
or other invisible format character such as U+200B (FR-006, EC-04). Required: node label, participant label, message text, C4 element label, boundary
and Deployment node label, C4 relationship label, diagram name. Optional (may be empty): flowchart connection
label, C4 description, C4 technology, C4 title.

**Item id** (every `id` of a node, connection, participant, message, element, boundary, DeploymentNode and
Relationship) is a positive safe integer, never a string. Mermaid aliases are computed from it in generation
only (`n${id}`, `p${id}`, `e${id}`, `b${id}`, `d${id}`) and are never stored or read from a file, so a
hand-edited file cannot put text into the generated source through an id (AC11).

## Flowchart

**FlowchartContent**: `nodes: Node[]` (creation order), `connections: Connection[]` (creation order).

| Entity | Fields | Rules |
|--------|--------|-------|
| Node | `id`, `shape` (one of 9), `label` (required), `x`, `y` | Footprints never overlap (EC-01, EC-19); coordinates are finite and `abs(x) <= Number.MAX_SAFE_INTEGER - 160`, `abs(y) <= Number.MAX_SAFE_INTEGER - 64`; position is editor-only (FR-003) |
| Connection | `id`, `from`, `to` (node ids, may be equal), `line` (`solid \| dotted \| thick`), `ending` (`arrow \| plain \| both`), `label` (optional) | Self-loops, duplicates, opposite directions allowed and distinct (FR-025) |

Shapes: rectangle, rounded, stadium, diamond, circle, parallelogram, cylinder, subroutine, hexagon.

## Sequence

**SequenceContent**: `participants: Participant[]` (left-to-right order), `messages: Message[]` (top-to-bottom order).

| Entity | Fields | Rules |
|--------|--------|-------|
| Participant | `id`, `role` (`participant \| actor`), `label` (required) | Equal labels stay distinct (FR-029) |
| Message | `id`, `from`, `to` (participant ids, may be equal), `style` (one of 8), `text` (required) | Both ends exist (FR-028) |

Message styles: `solid-arrow`, `dashed-arrow`, `solid-open`, `dashed-open`, `solid-cross`, `dashed-cross`,
`solid-async`, `dashed-async`.

## C4

**C4Content**: `tree: C4Item[]` (top level, in statement order), `relationships: Relationship[]` (in order).

| Entity | Fields | Rules |
|--------|--------|-------|
| Element | `id`, `elementType`, `label` (required), `description`, `technology` (only for types that have one) | Lives at top level or inside exactly one container (FR-034) |
| Boundary | `id`, `boundaryType` (`enterprise \| system \| container \| generic`), `label` (required), `children: C4Item[]` | Context, Container, Component, Dynamic only; types per kind (spec table) |
| DeploymentNode | `id`, `label` (required), `description`, `technology`, `children: C4Item[]` | Deployment only; children are nodes and Containers |
| Relationship | `id`, `from`, `to` (element or, in Deployment, node ids), `direction` (`one-way \| two-way`), `label` (required, default `Uses`), `technology` | Ends exist; ends are never boundaries (Clarification (plan)) |

`C4Item` is Element, Boundary or DeploymentNode. The tree is acyclic by construction and checked by
`checkDiagram`.

**Element types and families** (FR-040; external variants included; availability per kind from the spec table):

| Family | Types | Technology field |
|--------|-------|------------------|
| Person | person, person-ext | no |
| System | system, system-db, system-queue, and each `-ext` | no |
| Container | container, container-db, container-queue, and each `-ext` | yes |
| Component | component, component-db, component-queue, and each `-ext` | yes |

Per kind, exactly the spec table (spec.md, FR-031). Types in a family are limited to those listed:

| Kind | Element types offered |
|------|-----------------------|
| Context | Person family; System family (system, system-db, system-queue, each `-ext`) |
| Container | Person family; `system` and `system-ext` only; Container family |
| Component | Person family; `system` and `system-ext` only; `container` and `container-ext` only; Component family |
| Dynamic | As Component |
| Deployment | Deployment node and `container` only |

A family can therefore be offered in part: `changeType` (FR-040) moves only between types the kind offers.

**Derived, never stored**: Dynamic number = 1 + index in `relationships` (FR-033); C4 and Sequence canvas
positions (layout function, research R9).

## Invariants (checked by `checkDiagram`, DC-06)

1. Every id is a positive safe integer, unique within the diagram and less than `nextId`.
2. Every connection, message and relationship end refers to an existing item of an allowed kind.
3. Every required label is visible; every enum value is one the type and kind offer.
4. Flowchart footprints do not overlap.
5. The C4 tree is acyclic, every element is in at most one container, and containers hold only what the kind
   allows.
6. `type`, `kind` and `content` agree; `title` is empty for Flowchart and Sequence.
7. Every Flowchart coordinate is finite and within the bounds stated above, so the complete nominal footprint
   remains representable during overlap checks.

`checkDiagram` does not validate in place: it builds a fresh model by copying only the whitelisted fields of each
entity, so unknown properties never reach the model, records or later files.

## Operations (state transitions)

Every operation is validated against the current diagram and then applied whole, or rejected with a reason code
and no change (FR-009). Each accepted operation is one undo step, except arrow-key moves of one node, which merge
(research R4). Full list with rejection reasons: [contracts/operations.md](contracts/operations.md).

## Session state (composition layer, not persisted)

Session state lives in an `app/editor` store keyed by diagram id, outside route components. The id is assigned
in memory when a new diagram is created; replacing `/new/...` with `/d/:id` after its first save keeps that
same session state and history. Loading a diagram from storage creates a fresh session with empty history.

| State | Values |
|-------|--------|
| History | Undo and redo stacks of Diagram snapshots, unlimited, cleared on close (FR-008) |
| Selection | none, or one item id |
| Draft | the label being edited, or none; never committed until confirmed |
| Save status | `new` (no committed change yet), `saving`, `saved`, `not-saved` (failed), `unavailable` |
| Lock | `held`, `elsewhere` (read-only, offers take over), `lost` (stopped, offers take back) |
| Source check | `checking`, `valid`, `invalid(reason)`; plus notices from generation (R6) |

## Saved Diagram and Diagram File

- **Saved record** (IndexedDB): `{ id, name, type, kind, changedAt, formatVersion, model }`; the list shows
  name, type and kind, `changedAt`; a record that fails migration or `checkDiagram` is listed as unreadable.
- **File**: `{ format: "mermaid-editor-wysiwyg", formatVersion: 1, diagram }`, where `diagram` is the model
  without `id` and `changedAt`. Neither holds source or history (FR-052).
  Details: [contracts/file-format.md](contracts/file-format.md).
