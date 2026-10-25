# Project purpose

## User Story

As a business analyst or developer creating a diagram,

I want to create and edit Mermaid diagrams using a visual drag-and-drop editor,

So that I can communicate business processes, system behaviour and relationships without needing to learn or manually write Mermaid syntax.

## Business Value

Enable business analysts and developers to create accurate, readable diagrams more easily, reduce syntax-related errors, and allow diagrams to be reused in documentation and development workflows that support Mermaid.

## Scope

### Included

* Create a new diagram by selecting a supported diagram type.
* Visually add, select, move, rename and delete diagram elements.
* Create and delete connections between compatible elements.
* Edit connection labels and properties where supported.
* Apply diagram-type-specific editing rules.
* Automatically generate valid Mermaid source from the visual diagram.
* Render the diagram and provide feedback when operations are invalid.
* Undo and redo editing operations.
* Copy generated Mermaid source to the clipboard.
* Maintain consistency between the visual diagram and its generated source.
* Keep diagrams in the user's own browser between sessions, and save diagrams to and open them from files in the editor's own format.
* Start a new diagram from existing Mermaid source, as a one-way import: the source is read once into the visual model, anything the editor cannot represent is reported, and the diagram is then edited only visually.

### Excluded

* Direct editing of Mermaid source.
* Editing existing Mermaid source after import, and any import other than starting a new diagram (for example from a URL).
* SVG or PNG export.
* Real-time collaboration.
* Diagram version history (earlier versions of a diagram, or undo history kept after the diagram is closed).
* Server-side or cloud storage, and synchronisation between browsers or devices.
* Support for diagram types other than those explicitly supported by the editor.

## Business Rules

1. The visual diagram is the source of truth. Mermaid source is generated from the visual diagram and is not directly editable.
2. The editor must not require users to understand Mermaid syntax to create or modify diagrams.
3. The supported diagram types are Mermaid flowchart, sequence diagram and C4 diagram (all five C4 kinds: Context, Container, Component, Dynamic and Deployment). The type is chosen when the diagram is created and does not change afterwards.
4. For flowcharts, the editor must support nodes, directed and undirected connections where supported, and labelled connections.
5. Available elements, properties and operations must conform to the selected diagram type.
6. The editor must prevent invalid operations from corrupting the diagram.
7. Deleting a node must not silently introduce new relationships between remaining nodes.
8. Cycles and disconnected nodes are permitted unless explicitly prohibited by a flowchart constraint. The editor must not impose additional business meaning or restrictions that are not part of the supported grammar or defined editor rules.
9. Every committed editing operation must be undoable and redoable.
10. The visual diagram, rendered representation and generated Mermaid source must remain consistent.
11. Users must be able to copy the generated Mermaid source for use in external Mermaid-compatible tools and documentation.
12. The editor must provide understandable feedback when an operation is unavailable, invalid or unsuccessful.

## Acceptance Criteria

### AC1 — Create a new diagram

**Given** the user opens the editor without an existing diagram

**When** the user starts creating a diagram

**Then** the editor prompts the user to select a supported diagram type

**And** the supported types are Flowchart, Sequence and C4 (Context, Container, Component, Dynamic, Deployment)

**And** selecting a type opens a new, empty diagram of that type

**And** the user can begin editing immediately

**And** the editor displays the selected diagram type.

### AC2 — Display available diagram elements

**Given** a flowchart is open

**When** the user views the element toolbox

**Then** the toolbox displays the supported flowchart node shapes

**And** the user can distinguish the available shapes visually

**And** the toolbox provides the supported connection types

**And** unsupported diagram elements and operations are not offered.

### AC3 — Add a node

**Given** a flowchart is open

**When** the user drags a node shape from the toolbox onto the canvas

**Then** a node is created at the drop location, or at the nearest free position when that location is occupied

**And** the node is displayed on the canvas

**And** the node receives a default label that can be edited

**And** the diagram and generated Mermaid source represent the new node

**And** the resulting Mermaid source is valid.

### AC4 — Select and move a node

**Given** a flowchart contains one or more nodes

**When** the user selects a node

**Then** the selected node is visually distinguishable

**And** the applicable editing actions are available

**When** the user moves the node on the canvas

**Then** the node is displayed at its new position, or at the nearest free position when that position is occupied

**And** its existing connections remain attached to the correct node

**And** moving the node does not change the logical relationships in the diagram

**And** the move can be undone and redone.

### AC5 — Rename a node

**Given** a node is selected

**When** the user edits and confirms its label

**Then** the node displays the updated label

**And** the generated Mermaid source reflects the updated label

**And** the label is safely represented in Mermaid syntax, including when it contains supported punctuation or special characters

**And** the operation can be undone and redone.

### AC6 — Create a connection

**Given** at least two nodes exist

**When** the user creates a connection between two nodes using the editor's connection interaction

**Then** the connection is displayed between the selected endpoints

**And** the connection type and direction match the user's selection

**And** the connection is represented in the generated Mermaid source

**And** the user can create a directed connection or an undirected connection where supported by the editor

**And** the editor prevents connections that cannot be represented by the supported flowchart grammar

**And** the operation can be undone and redone.

### AC7 — Edit a connection

**Given** a connection exists and is selected

**When** the user edits its label or supported properties

**Then** the connection is updated visually

**And** the generated Mermaid source reflects the change

**And** the connection remains associated with its original endpoints unless the user explicitly changes them

**And** the operation can be undone and redone.

### AC8 — Delete a node

**Given** a node exists in the flowchart

**And** the node has zero or more connections

**When** the user deletes the node

**Then** the node is removed from the diagram

**And** all connections incident to the deleted node are removed

**And** all other nodes and connections are preserved

**And** the editor does not automatically connect the deleted node's former neighbours

**And** the resulting diagram remains valid

**And** the generated Mermaid source reflects the resulting diagram

**And** the deletion can be undone and redone.

### AC9 — Delete a connection

**Given** a connection exists between two nodes

**When** the user deletes the connection

**Then** the connection is removed

**And** both endpoint nodes remain unchanged

**And** other connections remain unchanged

**And** the generated Mermaid source reflects the updated diagram

**And** the operation can be undone and redone.

### AC10 — Validate editing operations

**Given** the user attempts an operation that is not supported by the editor or would produce an invalid flowchart model

**When** the operation is attempted

**Then** the editor prevents the invalid operation from being committed

**And** the diagram remains in its previous valid state

**And** the user receives understandable feedback explaining why the operation is unavailable or invalid

**And** no partial or unintended change is left behind.

Valid cycles, multiple incoming or outgoing connections, and disconnected nodes must not be rejected solely because of their structure.

### AC11 — Generate Mermaid source

**Given** a flowchart has been created or modified

**When** the diagram changes

**Then** the editor generates Mermaid source from the current visual model

**And** the source represents the current nodes, shapes, labels, connections, directions and connection labels

**And** the source conforms to the supported Mermaid flowchart grammar

**And** Mermaid-special characters in labels are escaped or represented appropriately

**And** the source does not contain unintended nodes or connections

**And** the user does not need to interact with or understand the generated syntax.

### AC12 — Maintain diagram consistency

**Given** a diagram is open

**When** the user adds, moves, renames or deletes a node, or creates, edits or deletes a connection

**Then** the visual model and rendered diagram reflect the committed change

**And** the generated Mermaid source reflects the current logical structure

**And** no stale source or partially applied operation is presented as the current diagram

**And** any rendering or generation failure is reported rather than silently presented as success.

A purely visual layout change does not need to change Mermaid source when the source does not encode that layout information.

### AC13 — Undo an operation

**Given** the user has completed an editing operation

**When** the user invokes Undo

**Then** the most recent committed operation is reversed

**And** the diagram returns to the state immediately before that operation

**And** the rendered diagram and generated Mermaid source reflect the restored state

**And** repeated Undo operations reverse earlier operations in order

**And** Undo is unavailable when there are no operations to reverse.

Undo must support adding, moving, renaming and deleting nodes, and creating, editing and deleting connections.

A completed drag or label edit is one undoable operation, rather than a sequence of intermediate changes.

### AC14 — Redo an operation

**Given** the user has undone an operation

**When** the user invokes Redo

**Then** the undone operation is reapplied

**And** the diagram, rendered representation and generated Mermaid source reflect the restored state

**And** repeated Redo operations reapply operations in their original order

**And** Redo is unavailable when there are no operations to reapply

**And** committing a new editing operation after Undo clears the invalidated redo history.

### AC15 — Copy Mermaid source

**Given** a flowchart exists

**When** the user selects Copy Source

**Then** the current generated Mermaid source is copied to the system clipboard

**And** the copied source represents the current diagram

**And** the copied source is valid Mermaid flowchart syntax

**And** the editor confirms that copying succeeded only after the clipboard operation succeeds

**And** the editor provides understandable feedback if copying fails.

The source must remain read-only within the editor.

### AC16 — Handle an empty diagram

**Given** the user has created a new flowchart or deleted all its nodes

**When** the diagram contains no nodes

**Then** the editor continues to display an editable canvas

**And** the user can add nodes

**And** the editor does not display a broken or stale diagram

**And** the generated source, if available for the empty state, must conform to the editor's supported empty-flowchart representation.

### AC17 — Confirm supported functionality

**Given** the editor presents a toolbox action or editing control

**When** the user attempts to use that control

**Then** the control performs the advertised action for the current selection and diagram state

**And** unsupported actions are not presented as available

**And** the editor provides clear feedback for actions that require a selection or additional input.

### Definition of Done

* All acceptance criteria pass.
* The initial release supports the defined flowchart, sequence diagram and C4 diagram functionality.
* All committed editing operations participate in undo and redo.
* Mermaid generation is covered by automated tests.
* Label escaping and special-character handling are covered by automated tests.
* Node deletion and connection deletion preserve the specified relationships.
* Invalid operations cannot corrupt the diagram.
* Generated Mermaid output is validated against the supported grammar.
* Copy Source works in supported browsers and reports success or failure correctly.
* The visual diagram, rendered representation and generated Mermaid source remain consistent after editing, Undo and Redo.
* A diagram kept in the browser or saved to a file reopens with identical content, and saving reports success only after it has succeeded.
* The editor does not silently alter the logical meaning of a diagram.

### Implementation Guidance

The requirements above describe the required user-facing behaviour. The implementation should preserve a clear separation between the visual diagram model, Mermaid source generation, validation, rendering and editing history.

The implementation must not treat generated Mermaid text as the editable source of truth. Sequence and C4 diagrams are part of the initial release and follow the same rule as any type: their supported elements, relationships, editing operations and validation rules are explicitly defined and tested. Acceptance criteria AC2 to AC17 are worded for flowcharts and apply to each supported type with that type's own elements and connections. Additional Mermaid diagram types beyond these should be introduced only when their supported elements, relationships, editing operations and validation rules have been explicitly defined and tested.

## Setup

Speckit: [Speckit](https://github.com/github/spec-kit)

### Speckit extensions

* [Grill me integrated](https://github.com/leejsinclair/speckit-grill-specify)
* [TDD integrated](https://github.com/leejsinclair/speckit-tdd-integrated)
* [Spec Viewer and Kanban Board](https://github.com/leejsinclair/rich-specification-viewer)
* [Claude Mod - Mini Kanban](https://github.com/leejsinclair/speckit-mod-micro-kanban)
