# Behaviour Checklist: 001-flowchart-visual-editor

<!--
  Written by the plan stage from spec.md and the Verification Plan in plan.md, before
  tasks and implementation. Read by tdd_check.py; the rules are in the "Behaviour
  checklist" section of tdd-process-rules.md.
-->

**Specification**: [spec.md](../spec.md) | **Verification Plan**: [plan.md](../plan.md#verification-plan) | **Tasks**: [tasks.md](../tasks.md)

## US1-AS1

> **Given** the editor is open with no diagram, **When** the user starts creating a diagram, **Then** the editor prompts for a supported diagram type, offering Flowchart.

- **BI-001** Expresses: FR-001, US1-AS1. Verified by: VO-001.
  - **Given** the editor is open and no diagram exists
  - **When** the user starts creating a diagram
  - **Then** the editor prompts the user to choose a diagram type
  - **And** Flowchart is offered and is the only type offered

## US1-AS2

> **Given** the user selects Flowchart, **When** the diagram opens, **Then** it is empty, the selected type is displayed, and the user can begin editing immediately.

- **BI-002** Expresses: FR-001, US1-AS2. Verified by: VO-002.
  - **Given** the user is asked for a diagram type
  - **When** the user selects Flowchart
  - **Then** a new empty diagram opens and the type shown is Flowchart
  - **And** the source shows only the bare flowchart header
  - **And** the user can add a node immediately

## US1-AS3

> **Given** a flowchart is open, **When** the user views the toolbox, **Then** it shows each supported node shape, visually distinguishable, and the supported connection types, and offers nothing unsupported.

- **BI-003** Expresses: FR-002, US1-AS3. Verified by: VO-003, MV-002.
  - **Given** a flowchart is open
  - **When** the user looks at the toolbox
  - **Then** it shows nine node shapes, each with its own name and drawing, and nine connection types: solid, dotted and thick, each as an arrow, a plain line and a two-way arrow
  - **And** nothing unsupported is offered, including any control for the flowchart direction
  - **And** a person can tell the shapes and the connection types apart by sight

## US1-AS4

> **Given** a flowchart is open, **When** the user drags a node shape from the toolbox onto the canvas, **Then** a node appears at the drop location with an editable default label, and the generated source represents it and is valid.

- **BI-004** Expresses: FR-003, US1-AS4. Verified by: VO-004.
  - **Given** a flowchart is open and the drop location is free
  - **When** the user drags a node shape from the toolbox onto the canvas
  - **Then** a node of that shape appears at the drop location with an editable default label
  - **And** the generated source lists exactly that node
  - **And** the generated source is accepted by Mermaid's parser

## US1-AS5

> **Given** at least two nodes exist, **When** the user creates a connection between them, **Then** the connection is shown between the chosen endpoints with the chosen type and direction, and the generated source represents it.

- **BI-005** Expresses: FR-007, US1-AS5. Verified by: VO-006.
  - **Given** two nodes exist and the user has chosen a connection type
  - **When** the user draws a connection from one node to the other
  - **Then** the connection is shown between those two nodes with the chosen type and direction
  - **And** the generated source contains exactly that connection

## US1-AS6

> **Given** a flowchart exists, **When** the user selects Copy Source, **Then** the current generated source is placed on the system clipboard and success is confirmed only after the copy has actually succeeded.

- **BI-006** Expresses: FR-020, US1-AS6, SC-008. Verified by: VO-009.
  - **Given** a flowchart with nodes exists, in Chromium or in Firefox
  - **When** the user selects Copy Source
  - **Then** the clipboard holds exactly the current generated source
  - **And** success is confirmed only after the copy has completed

## US1-AS7

> **Given** copying to the clipboard fails, **When** the user selects Copy Source, **Then** the editor explains that copying failed and does not report success.

- **BI-007** Expresses: FR-020, US1-AS7, EC-08. Verified by: VO-010.
  - **Given** the browser refuses or does not offer clipboard access
  - **When** the user selects Copy Source
  - **Then** the editor explains that copying failed
  - **And** no success message is shown
  - **And** the diagram is unchanged

## US2-AS1

> **Given** a flowchart has nodes, **When** the user selects a node, **Then** it is visually distinguishable and the editing actions applicable to it are available.

- **BI-008** Expresses: FR-004, US2-AS1. Verified by: VO-011.
  - **Given** a flowchart has nodes
  - **When** the user selects a node
  - **Then** the node looks selected, unlike unselected nodes
  - **And** Rename and Delete are available for it

## US2-AS2

> **Given** a node is selected, **When** the user moves it, **Then** it appears at the new position, its connections stay attached to the correct nodes, and the logical relationships are unchanged.

- **BI-009** Expresses: FR-005, US2-AS2, EC-07. Verified by: VO-013, VO-014.
  - **Given** a node with connections is selected
  - **When** the user moves it to a free spot
  - **Then** it appears at the new position
  - **And** each connection still joins the same two nodes and follows the node
  - **And** the generated source is identical to the source before the move

## US2-AS3

> **Given** a node is selected, **When** the user edits and confirms its label, **Then** the node shows the new label and the source reflects it.

- **BI-010** Expresses: FR-006, US2-AS3. Verified by: VO-015.
  - **Given** a node is selected
  - **When** the user edits its label and confirms
  - **Then** the node shows the new label
  - **And** the generated source shows the new label and nothing else differs

## US2-AS4

> **Given** a label contains punctuation or Mermaid-special characters, **When** the label is confirmed, **Then** it displays exactly as typed and the source represents it safely so the source remains valid.

- **BI-011** Expresses: FR-006, FR-014, US2-AS4, SC-003, EC-01. Verified by: VO-016, VO-017.
  - **Given** a label contains quotes, brackets, pipes, arrows, hash signs or other punctuation meaningful to Mermaid
  - **When** the user confirms the label
  - **Then** the editor shows the label exactly as typed
  - **And** the generated source is accepted by Mermaid's parser and describes the same label
  - **And** the source contains no extra nodes or connections

## US2-AS5

> **Given** a connection is selected, **When** the user edits its label, **Then** the connection updates visually, the source reflects the change, and the connection keeps its original endpoints, type and direction.

- **BI-012** Expresses: FR-009, US2-AS5. Verified by: VO-019.
  - **Given** a connection is selected
  - **When** the user edits its label and confirms
  - **Then** the connection shows the new label, or none if it was emptied
  - **And** the generated source reflects the change
  - **And** the connection keeps its endpoints, type and direction

## US3-AS1

> **Given** a node with zero or more connections, **When** the user deletes it, **Then** the node and every connection attached to it are removed, all other nodes and connections are preserved, and the source reflects the result.

- **BI-013** Expresses: FR-010, US3-AS1, SC-005, EC-04. Verified by: VO-020.
  - **Given** nodes joined in a chain from A to B to C
  - **When** the user deletes B
  - **Then** A and C remain and every connection that touched B is gone
  - **And** all other nodes and connections are unchanged
  - **And** the generated source shows the remaining diagram
  - **And** the same holds for a node with many connections, a node with a self-loop and the only node

## US3-AS2

> **Given** a deleted node had neighbours, **When** deletion completes, **Then** the editor has not connected those former neighbours to each other.

- **BI-014** Expresses: FR-010, US3-AS2. Verified by: VO-020.
  - **Given** nodes joined in a chain from A to B to C
  - **When** the user deletes B
  - **Then** no connection between A and C exists in the diagram or in the generated source

## US3-AS3

> **Given** a connection between two nodes, **When** the user deletes it, **Then** only that connection is removed; both endpoint nodes and all other connections are unchanged.

- **BI-015** Expresses: FR-011, US3-AS3, EC-03. Verified by: VO-021.
  - **Given** two nodes with two identical connections between them
  - **When** the user deletes one of the connections
  - **Then** only that connection is removed
  - **And** both nodes and every other connection are unchanged
  - **And** the other identical connection is still shown and still in the source

## US3-AS4

> **Given** the user deletes the last node, **When** the diagram has no nodes, **Then** the editor still shows an editable canvas, shows no stale diagram, and the user can add nodes again.

- **BI-016** Expresses: FR-021, US3-AS4, EC-09. Verified by: VO-022, VO-023.
  - **Given** a flowchart has a single node
  - **When** the user deletes it
  - **Then** the canvas stays editable and shows no leftover diagram
  - **And** the source is the bare flowchart header with top-to-bottom direction and can still be copied
  - **And** the user can add a node again

## US4-AS1

> **Given** the user has completed an editing operation, **When** the user invokes Undo, **Then** the diagram returns to its state immediately before that operation, and the visual diagram and source both reflect it.

- **BI-017** Expresses: FR-016, FR-018, US4-AS1, SC-004. Verified by: VO-026, VO-029.
  - **Given** the user has completed an editing operation
  - **When** the user selects Undo
  - **Then** the diagram returns to its state immediately before that operation
  - **And** the canvas and the generated source both show that state
  - **And** this holds for adding, moving, renaming and deleting nodes and for creating, editing and deleting connections

## US4-AS2

> **Given** several operations have been undone, **When** the user invokes Redo repeatedly, **Then** the operations are reapplied in their original order.

- **BI-018** Expresses: FR-018, US4-AS2. Verified by: VO-026.
  - **Given** several operations have been undone
  - **When** the user selects Redo repeatedly
  - **Then** the operations are reapplied in their original order
  - **And** after redoing everything the diagram equals the one before the first Undo

## US4-AS3

> **Given** there is nothing to undo or nothing to redo, **When** the user looks at the controls, **Then** the corresponding action is unavailable.

- **BI-019** Expresses: FR-019, US4-AS3, EC-05. Verified by: VO-027.
  - **Given** a new diagram, or nothing left to undo or redo
  - **When** the user looks at the controls
  - **Then** Undo is unavailable when there is nothing to reverse and Redo is unavailable when there is nothing to reapply
  - **And** this holds right after creating a diagram and after deleting every node

## US4-AS4

> **Given** the user has undone an operation, **When** the user commits a new editing operation, **Then** the redo history is cleared.

- **BI-020** Expresses: FR-019, US4-AS4. Verified by: VO-027.
  - **Given** the user has undone an operation
  - **When** the user completes a new editing operation
  - **Then** the operations that could have been redone are gone
  - **And** Redo is unavailable

## US4-AS5

> **Given** the user completes a drag or a label edit, **When** the user invokes Undo, **Then** the whole drag or whole label edit is reversed in one step, not its intermediate states.

- **BI-021** Expresses: FR-018, US4-AS5, EC-05. Verified by: VO-028.
  - **Given** the user has completed a drag, or a label edit
  - **When** the user selects Undo once
  - **Then** the whole drag, or the whole label edit, is reversed
  - **And** a cancelled drag or a cancelled label edit adds nothing to undo

## US5-AS1

> **Given** the user attempts an operation that would produce an invalid flowchart, **When** the operation is attempted, **Then** it is not committed, the diagram stays in its previous valid state, no partial change remains, and the user sees an understandable explanation.

- **BI-022** Expresses: FR-008, FR-012, US5-AS1, SC-006. Verified by: VO-030, VO-031.
  - **Given** the user attempts an operation that would produce an invalid flowchart, such as confirming a blank node label or releasing a connection over empty canvas
  - **When** the attempt is made
  - **Then** nothing is changed and the diagram stays in its previous valid state
  - **And** the user sees a plain-language explanation of why it was refused
  - **And** no partial change remains

## US5-AS2

> **Given** a diagram contains a cycle, a node with several incoming or outgoing connections, or disconnected nodes, **When** the user builds it, **Then** none of these is rejected for its structure alone.

- **BI-023** Expresses: FR-013, US5-AS2, SC-002, EC-03. Verified by: VO-024.
  - **Given** the user builds a cycle, a node with several incoming or outgoing connections, disconnected nodes, a self-loop, duplicate connections and opposite connections
  - **When** each is created
  - **Then** none is refused for its structure alone
  - **And** the generated source for each is accepted by Mermaid's parser

## US5-AS3

> **Given** a control needs a selection or further input, **When** the user uses it without that, **Then** the editor says what is required.

- **BI-024** Expresses: FR-022, US5-AS3. Verified by: VO-032.
  - **Given** nothing is selected, or no connection type has been chosen
  - **When** the user presses Rename or Delete, or starts a connection
  - **Then** the editor says what is required, such as selecting a node or choosing a connection type
  - **And** the diagram is unchanged

## US5-AS4

> **Given** the editor presents any toolbox action or control, **When** the user uses it, **Then** it performs exactly the advertised action for the current selection and diagram state.

- **BI-025** Expresses: FR-022, US5-AS4, SC-007. Verified by: VO-033.
  - **Given** the editor presents a toolbox action or control
  - **When** the user uses it
  - **Then** it performs exactly the advertised action for the current selection and diagram state
  - **And** no control is offered for an unsupported action

## US5-AS5

> **Given** rendering or source generation fails, **When** the failure occurs, **Then** it is reported to the user and not presented as success, and stale output is not shown as current.

- **BI-026** Expresses: FR-017, US5-AS5. Verified by: VO-034, VO-035.
  - **Given** drawing the canvas or checking the generated source fails
  - **When** the failure occurs
  - **Then** the user is told about the failure and it is not presented as success
  - **And** source that could not be verified is not shown as verified, and Copy Source is unavailable
  - **And** an answer for an older edit never replaces the status of newer source

## Other behaviours

- **BI-027** Expresses: FR-004, FR-009, FR-025. Verified by: VO-012.
  - **Given** a node and a connection are selected
  - **When** the user looks for ways to change them
  - **Then** the only property of a connection that can be edited is its label
  - **And** nothing offers a change of a node shape, of a connection type, direction or endpoints, or of the flowchart direction
- **BI-028** Expresses: FR-003, FR-005, EC-06. Verified by: VO-005.
  - **Given** a drag ends outside the canvas, or a node or new shape is dropped onto an occupied position
  - **When** the drag ends
  - **Then** outside the canvas the drag is cancelled, nothing is added, a moved node stays where it was and nothing is added to undo
  - **And** onto an occupied position the node lands at the nearest free position and does not overlap another node
- **BI-029** Expresses: FR-006, EC-01, EC-02. Verified by: VO-018.
  - **Given** the user confirms node labels that are empty, only spaces or line breaks, multi-line, or very long, and a connection label that is empty
  - **When** each label is confirmed
  - **Then** an empty or blank node label is refused with an explanation and the previous label is kept
  - **And** multi-line and very long node labels are accepted
  - **And** an empty connection label is accepted and no label is shown for it
- **BI-030** Expresses: FR-002, FR-014, SC-002. Verified by: VO-007, VO-008.
  - **Given** diagrams contain each of the nine shapes and each of the nine connection types
  - **When** the source is generated
  - **Then** Mermaid's parser reports the matching shape for every node and the matching arrow type and line style for every connection
  - **And** every label is reported unchanged
- **BI-031** Expresses: EC-02. Verified by: VO-025.
  - **Given** two nodes have identical labels
  - **When** the source is generated
  - **Then** they remain two distinct nodes in the diagram and in the source
- **BI-032** Expresses: FR-015, FR-023. Verified by: VO-036.
  - **Given** the editor is open with a diagram
  - **When** the user looks at the source and at the controls, then reloads the page
  - **Then** the source cannot be edited and nothing offers import, export, save, collaboration or version history
  - **And** after the reload the diagram is gone and the user is asked for a diagram type
- **BI-033** Expresses: FR-024. Verified by: VO-037.
  - **Given** a node is on the canvas and the user has no pointer
  - **When** the user selects, renames, deletes, undoes and redoes, and copies the source, by keyboard
  - **Then** each action works
  - **And** adding, moving and connecting may need a pointer
- **BI-034** Expresses: FR-026. Verified by: VO-039.
  - **Given** the app has been built and is served as plain static files
  - **When** a full editing session is run and the build output is inspected
  - **Then** the browser makes no request to any other origin or to any server endpoint after the files load, and the whole session works
  - **And** the build output contains only static files
- **BI-035** Expresses: SC-009. Verified by: VO-038.
  - **Given** a diagram of 100 nodes is open
  - **When** the user makes a change
  - **Then** the canvas and the generated source show it within 1 second
- **BI-036** Expresses: SC-001. Verified by: MV-001.
  - **Given** a person who does not know Mermaid syntax and has no help
  - **When** the person builds a flowchart of five nodes and four connections and copies its source
  - **Then** the task is finished in under 5 minutes
