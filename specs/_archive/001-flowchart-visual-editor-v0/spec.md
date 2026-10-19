# Feature Specification: Flowchart Visual Editor

**Feature Branch**: `001-flowchart-visual-editor`

**Created**: 2026-10-18

**Status**: Draft

**Grilled on**: 2026-10-18

**Input**: User description: "@setup.md" — a visual drag-and-drop editor for creating and editing Mermaid flowcharts, which generates read-only Mermaid source from the visual diagram.

## Clarifications

### Session 2026-10-18

- Q: Which node shapes should v1 offer? → A: The core five (rectangle, rounded rectangle, stadium, diamond, circle) plus the data shapes (parallelogram, cylinder, subroutine, hexagon). An additional "c4Model" request was held for follow-up and is not part of this decision.
- Q: Which connection types should the toolbox offer? → A: Solid, dotted and thick connections, each as a directed arrow or an undirected line, plus bidirectional arrows.
- Q: Should the user choose the flowchart direction? → A: No. The direction is fixed to top-to-bottom with no user control.
- Q: How should self-loops and duplicate connections be treated? → A: Allow both. Self-loops and multiple connections between the same two nodes, including identical ones, are valid and each is a distinct connection.
- Q: What should the source be, and can it be copied, when the diagram has no nodes? → A: The source is the bare flowchart header (top-to-bottom direction) and Copy Source works as normal.
- Q: What label rules apply to nodes and connections? → A: Node labels must be non-empty and may span several lines; connection labels may be empty; there is no length limit.
- Q: Which browsers are supported? → A: Current stable Chromium-based browsers and Firefox on desktop only; Safari is not supported.
- Q: Should the editor show a separate Mermaid-rendered preview next to the canvas? → A: No. The editing canvas is the rendered diagram, and an expandable read-only source panel shows the generated source.
- Q: After creation, which connection properties can the user change? → A: Only the label. Type, direction and endpoints are fixed at creation; to change them the user deletes the connection and creates a new one.
- Q: May the user change a node's shape after creation? → A: No. The shape is fixed at creation; only the label and position can change. To use another shape, delete the node and add a new one.
- Q: Must the editor be usable without a mouse? → A: Partly. Select, rename, delete, undo, redo and Copy Source must work from the keyboard; adding, moving and connecting are pointer-only in v1.
- Q: Is the bidirectional arrow offered in all three line styles or only solid? → A: All three. Each of solid, dotted and thick is offered as a directed arrow, an undirected line and a bidirectional arrow (nine connection types).
- Q: What happens when a drag ends outside the canvas? → A: The drag is cancelled: no node is added, a moved node stays where it was, and nothing is added to the editing history.
- Q: What happens when a node is dropped or moved onto an occupied position? → A: The node is placed at the drop location, or at the nearest free position when that location is occupied; overlap never results.
- Q: Is a node label of only spaces or line breaks treated as empty? → A: Yes. A label with no visible characters is rejected like an empty label.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a flowchart and copy its Mermaid source (Priority: P1)

A business analyst or developer opens the editor, chooses Flowchart, drags node shapes onto the canvas, connects them, and copies the generated Mermaid source into their documentation. They never write or read Mermaid syntax to do so.

**Why this priority**: This is the whole purpose of the product. Without creating nodes, connecting them and obtaining valid source, no other capability delivers value.

**Independent Test**: Can be fully tested by creating a new flowchart, adding two nodes, connecting them, and copying the source; the clipboard then holds valid Mermaid flowchart source describing exactly those two nodes and one connection.

**Acceptance Scenarios**:

1. **Given** the editor is open with no diagram, **When** the user starts creating a diagram, **Then** the editor prompts for a supported diagram type, offering Flowchart.
2. **Given** the user selects Flowchart, **When** the diagram opens, **Then** it is empty, the selected type is displayed, and the user can begin editing immediately.
3. **Given** a flowchart is open, **When** the user views the toolbox, **Then** it shows each supported node shape, visually distinguishable, and the supported connection types, and offers nothing unsupported.
4. **Given** a flowchart is open, **When** the user drags a node shape from the toolbox onto the canvas, **Then** a node appears at the drop location with an editable default label, and the generated source represents it and is valid.
5. **Given** at least two nodes exist, **When** the user creates a connection between them, **Then** the connection is shown between the chosen endpoints with the chosen type and direction, and the generated source represents it.
6. **Given** a flowchart exists, **When** the user selects Copy Source, **Then** the current generated source is placed on the system clipboard and success is confirmed only after the copy has actually succeeded.
7. **Given** copying to the clipboard fails, **When** the user selects Copy Source, **Then** the editor explains that copying failed and does not report success.

---

### User Story 2 - Edit existing elements (Priority: P2)

The user refines a diagram: selecting and moving nodes, renaming nodes, and editing connection labels, with the diagram and source staying in step.

**Why this priority**: Real diagrams are iterated on. Editing makes the tool usable beyond one-shot creation, but a first diagram can be produced without it.

**Independent Test**: Can be fully tested by taking a diagram with two connected nodes, moving one, renaming one, and labelling the connection, then confirming the visual diagram and source agree and the connection is still attached to the same nodes.

**Acceptance Scenarios**:

1. **Given** a flowchart has nodes, **When** the user selects a node, **Then** it is visually distinguishable and the editing actions applicable to it are available.
2. **Given** a node is selected, **When** the user moves it, **Then** it appears at the new position, its connections stay attached to the correct nodes, and the logical relationships are unchanged.
3. **Given** a node is selected, **When** the user edits and confirms its label, **Then** the node shows the new label and the source reflects it.
4. **Given** a label contains punctuation or Mermaid-special characters, **When** the label is confirmed, **Then** it displays exactly as typed and the source represents it safely so the source remains valid.
5. **Given** a connection is selected, **When** the user edits its label, **Then** the connection updates visually, the source reflects the change, and the connection keeps its original endpoints, type and direction.

---

### User Story 3 - Delete elements without side effects (Priority: P2)

The user removes nodes and connections, confident that deletion removes only what they chose, plus connections that can no longer exist, and never invents new relationships.

**Why this priority**: Deleting wrongly would silently change the meaning of a diagram, which the business rules forbid. It is as important as editing but not required for a first diagram.

**Independent Test**: Can be fully tested by building A→B→C, deleting B, and confirming A and C remain, both connections to B are gone, and no A→C connection has appeared in the diagram or source.

**Acceptance Scenarios**:

1. **Given** a node with zero or more connections, **When** the user deletes it, **Then** the node and every connection attached to it are removed, all other nodes and connections are preserved, and the source reflects the result.
2. **Given** a deleted node had neighbours, **When** deletion completes, **Then** the editor has not connected those former neighbours to each other.
3. **Given** a connection between two nodes, **When** the user deletes it, **Then** only that connection is removed; both endpoint nodes and all other connections are unchanged.
4. **Given** the user deletes the last node, **When** the diagram has no nodes, **Then** the editor still shows an editable canvas, shows no stale diagram, and the user can add nodes again.

---

### User Story 4 - Undo and redo any edit (Priority: P2)

The user reverses and reapplies editing operations in order, so mistakes are cheap to correct.

**Why this priority**: Undo and redo are a business rule covering every operation, and they make the other stories safe to use, but a diagram can be built without them.

**Independent Test**: Can be fully tested by performing one of each operation type, undoing them all in reverse order back to an empty diagram, then redoing them all, confirming the diagram and source match at every step.

**Acceptance Scenarios**:

1. **Given** the user has completed an editing operation, **When** the user invokes Undo, **Then** the diagram returns to its state immediately before that operation, and the visual diagram and source both reflect it.
2. **Given** several operations have been undone, **When** the user invokes Redo repeatedly, **Then** the operations are reapplied in their original order.
3. **Given** there is nothing to undo or nothing to redo, **When** the user looks at the controls, **Then** the corresponding action is unavailable.
4. **Given** the user has undone an operation, **When** the user commits a new editing operation, **Then** the redo history is cleared.
5. **Given** the user completes a drag or a label edit, **When** the user invokes Undo, **Then** the whole drag or whole label edit is reversed in one step, not its intermediate states.

---

### User Story 5 - Be told when something cannot be done (Priority: P3)

When the user attempts something unsupported, invalid, or lacking a needed selection, the editor refuses cleanly, leaves the diagram untouched, and says why in plain language.

**Why this priority**: It protects diagram integrity and trust. The valid-operation paths deliver the value first, so this follows them.

**Independent Test**: Can be fully tested by attempting a connection the supported grammar cannot represent and an action that needs a selection with none made, confirming each is refused with an explanation and the diagram is unchanged.

**Acceptance Scenarios**:

1. **Given** the user attempts an operation that would produce an invalid flowchart, **When** the operation is attempted, **Then** it is not committed, the diagram stays in its previous valid state, no partial change remains, and the user sees an understandable explanation.
2. **Given** a diagram contains a cycle, a node with several incoming or outgoing connections, or disconnected nodes, **When** the user builds it, **Then** none of these is rejected for its structure alone.
3. **Given** a control needs a selection or further input, **When** the user uses it without that, **Then** the editor says what is required.
4. **Given** the editor presents any toolbox action or control, **When** the user uses it, **Then** it performs exactly the advertised action for the current selection and diagram state.
5. **Given** rendering or source generation fails, **When** the failure occurs, **Then** it is reported to the user and not presented as success, and stale output is not shown as current.

---

### Edge Cases

- **EC-01**: A node label that is empty or only spaces or line breaks (rejected with an explanation, keeping the previous label), very long, multi-line (allowed), or contains quotes, brackets, parentheses, braces, pipes, arrows, ampersands, semicolons, hash signs or other characters meaningful to Mermaid.
- **EC-02**: A connection label may be empty. Two nodes with identical labels must remain distinct nodes in the diagram and in the source.
- **EC-03**: Self-loops, duplicate connections between the same two nodes (even with identical type, direction and label), and connections in opposite directions are all valid; each connection keeps its own identity and appears separately in the source.
- **EC-04**: Deleting a node that is the endpoint of many connections, or the only node.
- **EC-05**: Undo or Redo immediately after creating a new diagram, after deleting every node, or after a cancelled drag or cancelled label edit (which commits nothing).
- **EC-06**: A drag that ends outside the canvas is cancelled and changes nothing; a drop or move onto an occupied position places the node at the nearest free position.
- **EC-07**: Moving a node changes layout only and must not change the logical content of the source.
- **EC-08**: Clipboard access denied or unavailable.
- **EC-09**: Empty diagram: the source is the bare flowchart header and remains copyable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST prompt the user to select a supported diagram type when creating a diagram, with Flowchart as the only initial type, and MUST open a new empty diagram showing the selected type on selection.
- **FR-002**: The system MUST present a toolbox of the supported flowchart node shapes, visually distinguishable, and of the supported connection types, and MUST NOT offer unsupported elements or operations.
- **FR-003**: Users MUST be able to add a node by dragging a shape from the toolbox to the canvas, creating it at the drop location, or at the nearest free position when that location is occupied, with an editable default label. A drop outside the canvas cancels the drag and adds nothing.
- **FR-004**: Users MUST be able to select a node, with the selection visually distinguishable and the applicable editing actions made available.
- **FR-005**: Users MUST be able to move a node, which is placed where it is dropped or at the nearest free position when that is occupied; a move ending outside the canvas is cancelled and the node stays where it was. Its connections MUST stay attached to the correct nodes and the logical relationships MUST be unchanged.
- **FR-006**: Users MUST be able to rename a node. Node labels MUST contain at least one visible character (an attempt to confirm an empty or blank label is rejected with an explanation, keeping the previous label) and MAY span several lines; connection labels MAY be empty; neither has a length limit. Labels containing punctuation or Mermaid-special characters MUST be shown as typed and represented safely in the generated source.
- **FR-007**: Users MUST be able to create connections between nodes, as directed or undirected where supported, with the connection type and direction matching the user's selection.
- **FR-008**: The system MUST prevent connections that cannot be represented by the supported flowchart grammar.
- **FR-009**: Users MUST be able to edit a connection's label. A connection's type, direction and endpoints are fixed at creation and are not editable; to change them the user deletes the connection and creates a new one.
- **FR-010**: Deleting a node MUST remove the node and all its connections, MUST preserve all other nodes and connections, and MUST NOT create connections between its former neighbours.
- **FR-011**: Deleting a connection MUST remove only that connection.
- **FR-012**: The system MUST reject any unsupported or invalid operation without committing it, leaving the diagram in its previous valid state with no partial change, and MUST explain why in understandable language.
- **FR-013**: The system MUST NOT reject cycles, multiple incoming or outgoing connections, or disconnected nodes solely because of their structure, and MUST NOT impose meaning or restrictions beyond the supported grammar and defined editor rules.
- **FR-014**: The system MUST generate Mermaid flowchart source from the current visual diagram after every change, representing its nodes, shapes, labels, connections, directions and connection labels, conforming to the supported grammar, escaping special characters, and containing no unintended nodes or connections.
- **FR-015**: The generated source MUST be read-only; the system MUST NOT allow editing, importing or parsing Mermaid source back into the diagram.
- **FR-016**: The editing canvas, which is the rendered diagram, and the generated source shown in the expandable read-only source panel MUST remain consistent after every edit, Undo and Redo; no stale source or partially applied operation may be shown as current.
- **FR-017**: The system MUST report any canvas drawing or source generation failure rather than present it as success.
- **FR-018**: Every committed editing operation (add, move, rename, delete of nodes; create, edit, delete of connections) MUST be undoable and redoable, with a completed drag or label edit counting as a single operation.
- **FR-019**: Undo and Redo MUST apply operations in order, MUST be unavailable when there is nothing to reverse or reapply, and committing a new operation after Undo MUST clear the redo history.
- **FR-020**: Users MUST be able to copy the current generated source to the system clipboard; success MUST be confirmed only after the clipboard operation succeeds, and failure MUST be reported with an understandable message.
- **FR-021**: When the diagram has no nodes, the system MUST keep an editable canvas, show no broken or stale diagram, and show the bare flowchart header as its source, which Copy Source can copy.
- **FR-022**: Every control the system presents MUST perform its advertised action for the current selection and state, and MUST give clear feedback when it needs a selection or further input.
- **FR-023**: The system MUST NOT persist diagrams across sessions, export to SVG or PNG, support real-time collaboration, or provide version history.
- **FR-024**: Selecting an element, renaming it, deleting it, Undo, Redo and Copy Source MUST be operable from the keyboard alone. Adding, moving and connecting nodes MAY require a pointer in this release.
- **FR-025**: A node's shape MUST be fixed at creation and not editable; to use another shape the user deletes the node and adds a new one.
- **FR-026**: The editor MUST run entirely in the browser: once its static files are loaded it makes no network requests, and it requires no server-side component beyond serving those static files.

### Key Entities

- **Diagram**: The editable work product, with a diagram type (initially Flowchart), a collection of nodes, and a collection of connections. It is the single source of truth for everything the user sees and copies.
- **Node**: An element of the diagram with a distinct identity, a shape chosen from the supported flowchart shapes, a label, and a position on the canvas. Position affects layout only, not logical meaning.
- **Connection**: A relationship between two nodes (which may be the same node), with a type, a direction (directed or undirected where supported) and an optional label. It belongs to its endpoints until the user explicitly changes them.
- **Generated Source**: The Mermaid flowchart text derived from the diagram's logical content. It is read-only and never an input to the diagram.
- **Editing History**: The ordered record of committed operations, with an undo side and a redo side, where each operation is one user-meaningful change.
- **Feedback Message**: A plain-language notice telling the user that an action is unavailable, invalid, unsuccessful, or successful.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user with no knowledge of Mermaid syntax can create a flowchart of at least five nodes and four connections and copy its source in under 5 minutes, without help.
- **SC-002**: 100% of diagrams built from the supported elements produce source that passes validation against the supported Mermaid flowchart grammar, including diagrams with cycles, fan-in, fan-out, disconnected nodes and self-loops.
- **SC-003**: 100% of tested labels containing Mermaid-special characters appear unchanged in the editor and yield valid source with no unintended nodes or connections.
- **SC-004**: After any sequence of edits, Undo and Redo, the canvas and the generated source agree in 100% of tested sequences, and undoing every operation returns to the empty diagram.
- **SC-005**: Deleting any node leaves exactly the diagram that remains once that node and its connections are removed, with zero newly created connections, in 100% of tested cases.
- **SC-006**: 100% of attempted invalid operations leave the diagram unchanged and show an explanatory message.
- **SC-007**: Every control offered in the editor performs its advertised action; no control is offered for an unsupported action.
- **SC-008**: Copying the source succeeds, or reports failure, correctly in each supported browser, and never reports success when nothing was copied.
- **SC-009**: Each change to the diagram is reflected in the editor and in the generated source so quickly that users perceive it as immediate (within 1 second for diagrams of up to 100 nodes).

## Assumptions

- Users are business analysts and developers working in a modern desktop web browser; mobile and touch-first use is not a goal of this release, and full keyboard parity for every editing action is deferred to a later release.
- Supported browsers are the current stable Chromium-based browsers (such as Chrome and Edge) and Firefox on desktop. Safari and mobile browsers are not supported.
- The supported node shapes are: rectangle, rounded rectangle, stadium, diamond, circle, parallelogram, cylinder, subroutine and hexagon. The supported connection types are solid, dotted and thick, each as a directed arrow, an undirected line or a bidirectional arrow (nine types in all). Anything outside these shapes and connection types is not offered.
- The generated flowchart always declares a fixed top-to-bottom direction. Users have no direction control, and direction is not an undoable operation.
- The editor works entirely in the browser; the diagram exists only for the current session and is lost on close or reload.
- Node positions are layout information only; the generated source need not encode them.
- The empty-diagram source is the bare flowchart header declaring the top-to-bottom direction, and Copy Source copies it like any other source.
- The canvas is both the editing surface and the rendered diagram; there is no separate Mermaid-rendered preview. The generated source is shown in an expandable, read-only source panel. Its default expanded or collapsed state is left to design.
- Dependencies: a grammar validation source for checking generated output, chosen in the plan.
- Out of scope: direct editing or import of Mermaid source, SVG or PNG export, collaboration, persistence or version history, and any diagram type other than Flowchart.
