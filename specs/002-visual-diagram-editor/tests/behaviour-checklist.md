# Behaviour Checklist: 002-visual-diagram-editor

<!--
  Written by the plan stage from spec.md and the Verification Plan in plan.md, before
  tasks and implementation. Read by tdd_check.py; the rules are in the "Behaviour
  checklist" section of tdd-process-rules.md.
  - One "## USn-ASm" section per acceptance scenario of spec.md, in order, opening with
    the scenario's text from spec.md as a block quote, word for word.
  - One "## Other behaviours" section for items that refine no scenario.
  - Items state what can be observed from outside. No checkboxes and no status.
-->

**Specification**: [spec.md](../spec.md) | **Verification Plan**: [plan.md](../plan.md#verification-plan) | **Tasks**: [tasks.md](../tasks.md)

## US1-AS1

> **Given** the editor is open with no diagram, **When** the user starts creating a diagram, **Then** the editor prompts for a diagram type offering Flowchart, Sequence and C4; choosing C4 prompts for a kind (Context, Container, Component, Dynamic, Deployment).

- **BI-001** Expresses: FR-001, FR-037, US1-AS1. Verified by: VO-001.
  - **Given** the editor is open with no diagram
  - **When** the user starts creating a diagram
  - **Then** the editor prompts for a diagram type offering exactly Flowchart, Sequence and C4
  - **And** choosing C4 prompts for a kind offering exactly Context, Container, Component, Dynamic and Deployment

## US1-AS2

> **Given** the user selects Flowchart, **When** the diagram opens, **Then** it is empty, the diagram type is displayed, and the user can begin editing immediately.

- **BI-002** Expresses: FR-001, FR-002, US1-AS2. Verified by: VO-002.
  - **Given** the user selects Flowchart (and, likewise, Sequence or a C4 kind)
  - **When** the diagram opens
  - **Then** it is empty and its type (and kind) is displayed
  - **And** the source is the bare header for that type

## US1-AS3

> **Given** a flowchart is open, **When** the user views the toolbox, **Then** it shows the nine node shapes (rectangle, rounded rectangle, stadium, diamond, circle, parallelogram, cylinder, subroutine, hexagon), visually distinguishable, and the nine connection types (solid, dotted, thick, each as arrow, plain line or two-way arrow), and offers nothing unsupported.

- **BI-003** Expresses: FR-002, FR-024, US1-AS3. Verified by: VO-003.
  - **Given** a flowchart is open
  - **When** the user views the toolbox
  - **Then** it shows the nine node shapes, each with its own name and appearance, and the nine connection types
  - **And** it offers nothing unsupported, including no direction control

## US1-AS4

> **Given** a flowchart is open, **When** the user drags a shape from the toolbox onto the canvas, **Then** a node appears at the drop location (or the nearest free position if occupied) with its type name as the default label, and the generated source represents it and is valid.

- **BI-004** Expresses: FR-007, FR-016, US1-AS4, EC-01. Verified by: VO-004, VO-005.
  - **Given** a flowchart is open
  - **When** the user drags a Diamond onto a free spot of the canvas, and then another onto that same spot
  - **Then** the first node appears at the drop location and the second at the nearest free position, overlapping nothing
  - **And** each is labelled "Diamond"
  - **And** the generated source represents both and is valid

## US1-AS5

> **Given** at least two nodes exist, **When** the user creates a connection between them, **Then** it is shown between the chosen endpoints with the chosen type and direction, and the generated source represents it.

- **BI-005** Expresses: FR-025, US1-AS5. Verified by: VO-006.
  - **Given** nodes A and B exist
  - **When** the user creates a dotted two-way connection from A to B
  - **Then** it is shown between A and B as dotted and two-way
  - **And** the generated source contains exactly that connection

## US1-AS6

> **Given** a flowchart exists, **When** the user selects Copy Source, **Then** the current source is placed on the clipboard and success is confirmed only after the copy has actually succeeded.

- **BI-006** Expresses: FR-014, US1-AS6, SC-007. Verified by: VO-008.
  - **Given** a flowchart exists
  - **When** the user selects Copy Source
  - **Then** the clipboard holds exactly the current source
  - **And** success is confirmed only after the copy has succeeded

## US1-AS7

> **Given** copying fails, **When** the user selects Copy Source, **Then** the editor explains that copying failed and does not report success.

- **BI-007** Expresses: FR-014, US1-AS7, EC-07. Verified by: VO-009.
  - **Given** the clipboard is refused or unavailable
  - **When** the user selects Copy Source
  - **Then** the editor explains that copying failed
  - **And** it does not report success

## US1-AS8

> **Given** a drag ends outside the canvas, **When** the user releases it, **Then** the drag is cancelled: no node is added, a moved node stays where it was, and nothing enters the undo history.

- **BI-008** Expresses: FR-016, US1-AS8. Verified by: VO-010.
  - **Given** a drag from the toolbox or of an existing node is in progress
  - **When** it is released outside the canvas
  - **Then** the drag is cancelled: no node is added and a moved node stays where it was
  - **And** nothing enters the undo history

## US1-AS9

> **Given** a flowchart is open, **When** the user looks at Copy Source, **Then** the editor states that node positions are kept in the editor only and that Mermaid arranges the copied diagram its own way.

- **BI-009** Expresses: FR-003, US1-AS9. Verified by: VO-011.
  - **Given** a flowchart is open
  - **When** the user looks at Copy Source
  - **Then** the editor states that node positions are kept in the editor only and that Mermaid arranges the copied diagram its own way

## US1-AS10

> **Given** a flowchart, **When** the user opens Preview as Mermaid draws it, **Then** a read-only view shows the diagram as Mermaid lays it out, it updates after every change, Undo and Redo, it cannot be edited, and a rendering failure is shown as an error rather than a stale picture.

- **BI-010** Expresses: FR-053, US1-AS10, EC-06. Verified by: VO-012.
  - **Given** a flowchart
  - **When** the user opens Preview as Mermaid draws it
  - **Then** a read-only view shows the diagram as Mermaid lays it out
  - **And** it updates after every change, Undo and Redo
  - **And** it cannot be edited
  - **And** a rendering failure is shown as an error rather than a stale picture

## US1-AS11

> **Given** a diagram exists, **When** the user selects Copy for Markdown, **Then** the clipboard holds the source inside a `mermaid` code fence, with the same success and failure feedback as Copy Source.

- **BI-011** Expresses: FR-014, US1-AS11. Verified by: VO-014.
  - **Given** a diagram exists
  - **When** the user selects Copy for Markdown
  - **Then** the clipboard holds the source inside a mermaid code fence
  - **And** success is confirmed only after the copy has succeeded, and a failure is explained without success

## US2-AS1

> **Given** a node is selected, **When** the user moves it, **Then** it appears at the new position (or nearest free position), its connections stay attached to the same nodes, and logical relationships are unchanged.

- **BI-012** Expresses: FR-003, US2-AS1, EC-01. Verified by: VO-015, VO-016.
  - **Given** node B is selected and connected to A and C
  - **When** the user moves it to a free spot, and then onto another node
  - **Then** it appears at the new position, or at the nearest free position when the spot is occupied
  - **And** its connections stay attached to A and C
  - **And** the logical relationships and the generated source are unchanged

- **BI-095** Expresses: FR-020, US2-AS1. Verified by: VO-101.
  - **Given** a diagram of any type with several items
  - **When** the user selects one item
  - **Then** it is visibly distinct from the others by more than colour, and its selected state is available to assistive technology
  - **And** selecting another item moves the cue, and clicking the empty canvas or pressing Escape clears it

## US2-AS2

> **Given** a node is selected, **When** the user confirms a new label, **Then** the node and the source show it, and a label with Mermaid-special characters displays exactly as typed while the source stays valid.

- **BI-013** Expresses: FR-006, US2-AS2, SC-003, EC-03. Verified by: VO-017, VO-018.
  - **Given** a node is selected
  - **When** the user confirms the label `Say "hi" <b>; #1 %% --> end` with a line break
  - **Then** the node and the source show the new label
  - **And** the node displays it exactly as typed
  - **And** the source stays valid

## US2-AS3

> **Given** a node label is empty or has no visible characters (spaces or line breaks only), **When** the user confirms it, **Then** the edit is rejected with an explanation and the previous label remains.

- **BI-014** Expresses: FR-006, FR-026, US2-AS3, EC-04. Verified by: VO-019.
  - **Given** a node labelled "Start"
  - **When** the user confirms an empty label, or one of only spaces or line breaks
  - **Then** the edit is rejected with an explanation
  - **And** the label remains "Start"

## US2-AS4

> **Given** a connection is selected, **When** the user edits its label (which may be empty), **Then** it updates visually and in the source, and keeps its endpoints, type and direction.

- **BI-015** Expresses: FR-026, US2-AS4. Verified by: VO-020.
  - **Given** a connection is selected
  - **When** the user edits its label, including to empty
  - **Then** it updates visually and in the source
  - **And** it keeps its ends, type and direction

## US2-AS5

> **Given** a node with connections, **When** the user deletes it, **Then** the node and all incident connections are removed, all other elements remain, and former neighbours are not connected to each other.

- **BI-016** Expresses: FR-011, US2-AS5, SC-005, EC-02. Verified by: VO-021.
  - **Given** a node with connections, including a self-loop and connections in both directions
  - **When** the user deletes it
  - **Then** the node and all incident connections are removed
  - **And** all other elements remain
  - **And** former neighbours are not connected to each other

## US2-AS6

> **Given** a connection exists, **When** the user deletes it, **Then** only that connection is removed and both endpoint nodes and all other connections are unchanged.

- **BI-017** Expresses: US2-AS6. Verified by: VO-022.
  - **Given** a connection exists, alongside an identical duplicate
  - **When** the user deletes it
  - **Then** only that connection is removed
  - **And** both end nodes and all other connections, including the duplicate, are unchanged

## US2-AS7

> **Given** a self-loop, a duplicate connection, an opposite-direction connection, a cycle or a disconnected node, **When** the user creates or leaves it, **Then** it is accepted; each connection is distinct.

- **BI-018** Expresses: FR-010, FR-025, US2-AS7. Verified by: VO-023.
  - **Given** the user creates a self-loop, a duplicate connection, an opposite-direction connection, a cycle and a disconnected node
  - **When** each is created or left in place
  - **Then** each is accepted
  - **And** each connection is distinct in the diagram and the source

## US2-AS8

> **Given** the user attempts an operation that is unsupported or would produce an invalid diagram, **When** the attempt is made, **Then** the diagram stays in its previous valid state, nothing partial is left behind, and the user sees an understandable explanation.

- **BI-019** Expresses: FR-009, US2-AS8, SC-006. Verified by: VO-024, VO-025.
  - **Given** the user attempts an unsupported or invalid operation, such as confirming a blank label
  - **When** the attempt is made
  - **Then** the diagram and source stay in their previous valid state with nothing partial left behind
  - **And** the user sees an understandable explanation

## US2-AS9

> **Given** a node with connections, **When** the user changes its shape (for example rectangle to diamond), **Then** the node keeps its label, position and connections, the source shows the new shape, and the change is one undoable step.

- **BI-020** Expresses: FR-040, US2-AS9. Verified by: VO-026.
  - **Given** a rectangle node with connections
  - **When** the user changes its shape to diamond
  - **Then** it keeps its label, position and connections
  - **And** the source shows a diamond
  - **And** one Undo restores the rectangle

## US2-AS10

> **Given** a connection, **When** the user changes its type (line style or ending) or moves one of its ends to a different node, **Then** it keeps its label and its other end, the source reflects the change, and the change is one undoable step.

- **BI-021** Expresses: FR-040, FR-041, US2-AS10, EC-18. Verified by: VO-027.
  - **Given** a labelled connection from A to B
  - **When** the user changes its line style or ending, or moves one end to another node
  - **Then** it keeps its label and its other end
  - **And** the source reflects the change
  - **And** the change is one undoable step

## US2-AS11

> **Given** a one-way connection from A to B, **When** the user selects Reverse, **Then** it runs from B to A with the same label and type in one undoable step; for a self-loop, a plain line or a two-way connection, Reverse is unavailable and the editor explains why.

- **BI-022** Expresses: FR-041, US2-AS11. Verified by: VO-028.
  - **Given** a one-way connection from A to B
  - **When** the user selects Reverse
  - **Then** it runs from B to A with the same label and type in one undoable step
  - **And** for a self-loop, a plain line or a two-way connection, Reverse is unavailable and the editor explains why

## US3-AS1

> **Given** completed operations, **When** the user invokes Undo repeatedly, **Then** each operation is reversed in reverse order and the canvas and source reflect each restored state.

- **BI-023** Expresses: FR-008, US3-AS1, SC-004. Verified by: VO-029.
  - **Given** several completed operations of different kinds
  - **When** the user invokes Undo repeatedly
  - **Then** each is reversed in reverse order
  - **And** the canvas and source show each restored state

## US3-AS2

> **Given** undone operations, **When** the user invokes Redo repeatedly, **Then** they are reapplied in original order.

- **BI-024** Expresses: FR-008, US3-AS2, SC-004. Verified by: VO-029.
  - **Given** several undone operations
  - **When** the user invokes Redo repeatedly
  - **Then** they are reapplied in the original order
  - **And** the canvas and source show each state

## US3-AS3

> **Given** nothing to undo (or redo), **When** the user looks at the control, **Then** it is unavailable.

- **BI-025** Expresses: US3-AS3. Verified by: VO-030.
  - **Given** nothing to undo, or nothing to redo
  - **When** the user looks at the control
  - **Then** it is unavailable

## US3-AS4

> **Given** undone operations, **When** the user commits a new operation, **Then** the redo history is cleared.

- **BI-026** Expresses: FR-008, US3-AS4. Verified by: VO-031.
  - **Given** undone operations
  - **When** the user commits a new operation
  - **Then** the redo history is cleared and Redo is unavailable

## US3-AS5

> **Given** a completed drag or a confirmed label edit, **When** the user invokes Undo, **Then** the whole gesture is reversed in one step.

- **BI-027** Expresses: FR-008, US3-AS5, EC-08. Verified by: VO-032.
  - **Given** a completed drag or a confirmed label edit
  - **When** the user invokes Undo
  - **Then** the whole gesture is reversed in one step
  - **And** a cancelled drag or edit, or Undo during a gesture, leaves no partial change and no history entry

## US3-AS6

> **Given** a diagram open for a long time, **When** the user undoes, **Then** history is unlimited while the diagram stays open; it is not kept after the diagram is closed.

- **BI-028** Expresses: FR-008, FR-046, US3-AS6, SC-013. Verified by: VO-033, VO-075.
  - **Given** a diagram open for a long time with 2 000 operations
  - **When** the user undoes
  - **Then** every operation can be undone while the diagram stays open
  - **And** after the diagram is closed and reopened, Undo is unavailable

## US4-AS1

> **Given** a sequence diagram is open, **When** the user views the toolbox, **Then** it offers Participant and Actor and the eight message types (solid or dashed, each as filled arrow, open arrow, cross or async open arrow) and nothing else (no notes, activations, loops, alternatives, grouping or autonumbering).

- **BI-029** Expresses: FR-027, US4-AS1. Verified by: VO-035.
  - **Given** a sequence diagram is open
  - **When** the user views the toolbox
  - **Then** it offers Participant, Actor and the eight message types
  - **And** it offers nothing else: no notes, activations, loops, alternatives, grouping or autonumbering

## US4-AS2

> **Given** participants exist, **When** the user adds a message between two of them, **Then** it appears in order with its text and type, and the source lists it in that order.

- **BI-030** Expresses: FR-028, FR-030, US4-AS2. Verified by: VO-037.
  - **Given** participants Alice and Bob exist
  - **When** the user adds a message between them, at the end and at a chosen position
  - **Then** it appears in that order with its text and type
  - **And** the source lists it in that order, after the declarations

## US4-AS3

> **Given** a diagram with exactly one participant or actor, **When** the user adds a message from it to itself, **Then** a self-message is created without needing a second participant.

- **BI-031** Expresses: FR-028, US4-AS3. Verified by: VO-038.
  - **Given** a diagram with exactly one participant
  - **When** the user adds a message from it to itself
  - **Then** a self-message is created

## US4-AS4

> **Given** two participants with the same label, **When** the diagram is generated, **Then** they remain distinct participants.

- **BI-032** Expresses: FR-029, US4-AS4. Verified by: VO-039.
  - **Given** two participants labelled "Server"
  - **When** the diagram is generated
  - **Then** they remain two distinct participants

## US4-AS5

> **Given** a participant with messages, **When** the user deletes it, **Then** it and its messages are removed and no new messages are created.

- **BI-033** Expresses: FR-011, FR-029, US4-AS5, SC-005. Verified by: VO-040.
  - **Given** a participant with messages
  - **When** the user deletes it
  - **Then** it and its messages are removed
  - **And** no message is created and all others are unchanged

## US4-AS6

> **Given** participants or messages, **When** the user reorders them, **Then** the displayed order and the source order change together, and the reorder is one undoable step.

- **BI-034** Expresses: FR-028, FR-039, US4-AS6. Verified by: VO-041, VO-042.
  - **Given** participants and messages
  - **When** the user reorders them by dragging or by Move up and Move down
  - **Then** the displayed order and the source order change together
  - **And** each reorder is one undoable step

## US4-AS7

> **Given** a message with empty text is attempted, **When** the user confirms, **Then** it is rejected with an explanation and the message is not added or changed.

- **BI-035** Expresses: FR-028, US4-AS7. Verified by: VO-043.
  - **Given** a message with empty or blank text is attempted
  - **When** the user confirms
  - **Then** it is rejected with an explanation
  - **And** the message is not added or changed

## US4-AS8

> **Given** a participant with messages, **When** the user changes it to an Actor (or back), **Then** it keeps its label, order and messages, and the change is one undoable step.

- **BI-036** Expresses: FR-040, US4-AS8. Verified by: VO-044.
  - **Given** a participant with messages
  - **When** the user changes it to an Actor, and back
  - **Then** it keeps its label, order and messages
  - **And** each change is one undoable step

## US4-AS9

> **Given** a message, **When** the user changes its type or its sender or receiver, **Then** it keeps its text and order position, and the change is one undoable step.

- **BI-037** Expresses: FR-040, FR-041, US4-AS9. Verified by: VO-045.
  - **Given** a message
  - **When** the user changes its type, or its sender or receiver
  - **Then** it keeps its text and order position
  - **And** each change is one undoable step

## US5-AS1

> **Given** the user chooses C4, **When** the C4 kind picker is shown, **Then** it states that C4 support is experimental and that external tools may render it differently or not at all.

- **BI-038** Expresses: FR-036, US5-AS1. Verified by: VO-046.
  - **Given** the user chooses C4
  - **When** the kind picker is shown
  - **Then** it states that C4 support is experimental and that external tools may render it differently or not at all

## US5-AS2

> **Given** a C4 kind is open, **When** the user views the toolbox, **Then** it offers only that kind's elements and boundaries (for example, Context never offers Containers).

- **BI-039** Expresses: FR-031, US5-AS2. Verified by: VO-047.
  - **Given** a C4 diagram of a given kind is open
  - **When** the user views the toolbox
  - **Then** it offers only that kind's elements and boundaries
  - **And** for example, Context offers no Containers

## US5-AS3

> **Given** a C4 element exists, **When** the user edits it, **Then** label, description and technology (where the element type has one) are editable and optional; the element type can be changed only within its family (FR-040).

- **BI-040** Expresses: FR-005, FR-032, US5-AS3. Verified by: VO-049.
  - **Given** a C4 Container element
  - **When** the user edits it
  - **Then** its label, description and technology are editable, description and technology optional
  - **And** a Person offers no technology
  - **And** its type can be changed only within its family

## US5-AS4

> **Given** two elements, **When** the user creates a relationship, **Then** it has a source, a target, a label (default "Uses") and an optional technology, and may be one-way or two-way; confirming an empty label (no visible characters) is rejected with an explanation and the previous label remains.

- **BI-041** Expresses: FR-032, US5-AS4. Verified by: VO-050.
  - **Given** two elements
  - **When** the user creates a relationship
  - **Then** it has a source, a target, the label "Uses", an optional technology, and is one-way or two-way as chosen
  - **And** confirming an empty label is rejected with an explanation and the previous label remains

## US5-AS5

> **Given** a Dynamic diagram, **When** relationships are added, **Then** they are numbered automatically in order, and when the user reorders or deletes one the numbers follow the new order with no gaps.

- **BI-042** Expresses: FR-033, FR-039, US5-AS5. Verified by: VO-051, VO-052.
  - **Given** a Dynamic diagram
  - **When** relationships are added, reordered and deleted
  - **Then** they are numbered automatically in order from 1
  - **And** after a reorder or deletion the numbers follow the new order with no gaps

## US5-AS6

> **Given** an element with relationships or boundary membership, **When** the user deletes it, **Then** its relationships and membership are removed and nothing new is created.

- **BI-043** Expresses: FR-011, US5-AS6, SC-005. Verified by: VO-053.
  - **Given** an element with relationships and boundary membership
  - **When** the user deletes it
  - **Then** its relationships and membership are removed
  - **And** nothing new is created

## US5-AS7

> **Given** an element, **When** the user places it in a boundary, **Then** it belongs to at most one boundary, and boundaries nest only where Mermaid allows.

- **BI-044** Expresses: FR-034, US5-AS7. Verified by: VO-054.
  - **Given** an element
  - **When** the user places it in a boundary
  - **Then** it belongs to at most one boundary
  - **And** boundaries nest only where Mermaid allows, and never inside themselves

## US5-AS8

> **Given** a Deployment diagram, **When** the user nests nodes, **Then** nesting expresses containment, with Containers placed inside nodes.

- **BI-045** Expresses: FR-034, US5-AS8. Verified by: VO-055.
  - **Given** a Deployment diagram
  - **When** the user nests nodes and places Containers
  - **Then** nesting expresses containment in the canvas and the source, with Containers inside nodes

## US5-AS9

> **Given** an existing element with relationships, **When** the user moves it into a boundary, out to the top level, or to another boundary (by drag or by keyboard control), **Then** its membership changes, its relationships are kept, the source reflects the new grouping, and the move is one undoable step; a Deployment node or Container is re-nested the same way.

- **BI-046** Expresses: FR-019, FR-034, US5-AS9. Verified by: VO-056, VO-057.
  - **Given** an element with relationships
  - **When** the user moves it into a boundary, out to the top level, or to another boundary, by drag or keyboard control
  - **Then** its membership changes and its relationships are kept
  - **And** the source reflects the new grouping
  - **And** each move is one undoable step
  - **And** a Deployment node or Container is re-nested the same way

## US5-AS10

> **Given** a C4 diagram of any kind, **When** the user sets, changes or clears its optional title, **Then** the title is shown, the source contains a matching `title` line (or none when the title is empty), and each change is one undoable step.

- **BI-047** Expresses: FR-054, US5-AS10. Verified by: VO-058.
  - **Given** a C4 diagram of any kind
  - **When** the user sets, changes or clears its title
  - **Then** the title is shown
  - **And** the source has a matching title line, or none when the title is empty
  - **And** each change is one undoable step

## US5-AS11

> **Given** a System with relationships inside a boundary, **When** the user changes it to an external System database, **Then** it keeps its label, description, relationships and membership, and the change is one undoable step; changing it to a Person is not offered.

- **BI-048** Expresses: FR-040, US5-AS11, EC-17. Verified by: VO-060.
  - **Given** a System with relationships inside a boundary
  - **When** the user changes it to an external System database
  - **Then** it keeps its label, description, relationships and membership in one undoable step
  - **And** changing it to a Person is not offered

## US5-AS12

> **Given** a relationship (including a Dynamic one), **When** the user moves its source or target to another element, or reverses a one-way relationship, **Then** it keeps its label, technology and number.

- **BI-049** Expresses: FR-041, US5-AS12. Verified by: VO-061.
  - **Given** a relationship, including a Dynamic one
  - **When** the user moves its source or target to another element, or reverses a one-way relationship
  - **Then** it keeps its label, technology and number

## US6-AS1

> **Given** any diagram, **When** the user works without a pointer, **Then** every operation (add, select, move, rename, change type, connect, change endpoints, reorder, change boundary membership, delete, undo, redo, copy, and the save and open actions) is achievable by keyboard, and every drag has a non-drag alternative.

- **BI-050** Expresses: FR-019, FR-020, US6-AS1, SC-008. Verified by: VO-062.
  - **Given** any diagram type
  - **When** the user works without a pointer
  - **Then** every operation (add, select, move, rename, change type, connect, change ends, reorder, change boundary membership, delete, undo, redo, copy, save and open) is achievable by keyboard
  - **And** every drag has a non-drag alternative

## US6-AS2

> **Given** a diagram whose latest change is not saved (saving failed or is unavailable, or a label edit is in progress), **When** the user closes, reloads or navigates away, **Then** the editor asks for confirmation first; when everything is saved it does not ask.

- **BI-051** Expresses: FR-018, US6-AS2. Verified by: VO-065.
  - **Given** a diagram whose latest change is not saved, or with a label edit in progress
  - **When** the user closes, reloads or navigates away
  - **Then** the editor asks for confirmation first
  - **And** when everything is saved it does not ask

## US6-AS3

> **Given** an open diagram, **When** the user returns to the start screen, **Then** the diagram stays saved and appears in the saved-diagrams list; nothing is discarded.

- **BI-052** Expresses: FR-018, US6-AS3. Verified by: VO-066.
  - **Given** an open diagram with changes
  - **When** the user returns to the start screen
  - **Then** the diagram stays saved and appears in the saved-diagrams list
  - **And** nothing is discarded

## US6-AS4

> **Given** any diagram type, **When** the user zooms, pans or fits to view, **Then** the canvas responds and the diagram's content and source are unchanged.

- **BI-053** Expresses: FR-017, US6-AS4. Verified by: VO-067.
  - **Given** any diagram type
  - **When** the user zooms, pans or fits to view
  - **Then** the canvas responds
  - **And** the diagram's content and source are unchanged

## US6-AS5

> **Given** an empty diagram of any type, **When** it is shown, **Then** an editable canvas displays a hint to drag an element from the toolbox, and the source (the bare header for that type) can be copied.

- **BI-054** Expresses: FR-013, US6-AS5, EC-05. Verified by: VO-068, VO-069.
  - **Given** an empty diagram of any type
  - **When** it is shown
  - **Then** an editable canvas displays a hint to drag an element from the toolbox
  - **And** the source is the bare header for that type and can be copied

## US6-AS6

> **Given** any feedback message, **When** it appears, **Then** it is announced to screen readers.

- **BI-055** Expresses: FR-020, US6-AS6. Verified by: VO-070.
  - **Given** any feedback message
  - **When** it appears
  - **Then** it is announced to screen readers without moving focus

## US7-AS1

> **Given** the user makes a committed change, Undo or Redo, **When** the change is saved in the browser, **Then** the editor shows that the diagram is saved, and only after the save has succeeded.

- **BI-056** Expresses: FR-042, US7-AS1, SC-013. Verified by: VO-073.
  - **Given** a committed change, Undo or Redo
  - **When** it is saved in the browser
  - **Then** the editor shows that the diagram is saved
  - **And** only after the save has succeeded

## US7-AS2

> **Given** saved diagrams exist, **When** the user opens the editor, **Then** the start screen lists them, most recently changed first, with name, type (and C4 kind) and last-changed time, alongside the choice to create a new diagram.

- **BI-057** Expresses: FR-044, US7-AS2. Verified by: VO-074.
  - **Given** saved diagrams exist
  - **When** the user opens the editor
  - **Then** the start screen lists them, most recently changed first, with name, type (and C4 kind) and last-changed time
  - **And** alongside the choice to create a new diagram

## US7-AS3

> **Given** a saved diagram, **When** the user opens it, **Then** its content, including flowchart positions, Sequence and C4 order, boundaries and C4 title, is exactly as last saved, and Undo is unavailable until a new change is made.

- **BI-058** Expresses: FR-046, US7-AS3, SC-013. Verified by: VO-075.
  - **Given** a saved diagram
  - **When** the user opens it after closing the browser
  - **Then** its content, including flowchart positions, Sequence and C4 order, boundaries and C4 title, is exactly as last saved
  - **And** Undo is unavailable until a new change is made

## US7-AS4

> **Given** a new diagram, **When** it is created, **Then** it is named "Untitled <type>" (for example "Untitled flowchart"), the user can rename it as one undoable step, and the name never appears in the generated source.

- **BI-059** Expresses: FR-045, US7-AS4. Verified by: VO-077.
  - **Given** a new diagram
  - **When** it is created
  - **Then** it is named "Untitled <type>", for example "Untitled flowchart"
  - **And** the user can rename it as one undoable step
  - **And** the name never appears in the generated source

## US7-AS5

> **Given** a new diagram that has had no committed change, **When** the user returns to the start screen, **Then** it is not added to the list.

- **BI-060** Expresses: FR-042, US7-AS5, EC-15. Verified by: VO-078.
  - **Given** a new diagram with no committed change
  - **When** the user returns to the start screen
  - **Then** it is not added to the list

## US7-AS6

> **Given** a saved diagram, **When** the user deletes it from the list and confirms, **Then** it is removed permanently and the other diagrams are unchanged.

- **BI-061** Expresses: FR-047, US7-AS6, EC-13. Verified by: VO-079.
  - **Given** a saved diagram
  - **When** the user deletes it from the list and confirms
  - **Then** it is removed permanently
  - **And** the other diagrams are unchanged

## US7-AS7

> **Given** a diagram, **When** the user saves it to a file, **Then** a file in the editor's own format is downloaded, named after the diagram; because a browser does not tell the page whether a download finished, the editor says the file was offered for download and does not claim it was stored.

- **BI-062** Expresses: FR-048, US7-AS7. Verified by: VO-080.
  - **Given** a diagram
  - **When** the user saves it to a file
  - **Then** a file in the editor's own format is downloaded, named after the diagram
  - **And** the editor says the file was offered for download and does not claim it was stored

## US7-AS8

> **Given** a file saved by the editor, **When** the user opens it, **Then** it becomes a new saved diagram identical to the one saved, and no existing diagram is overwritten.

- **BI-063** Expresses: FR-049, US7-AS8, SC-014. Verified by: VO-082.
  - **Given** a file saved by the editor
  - **When** the user opens it
  - **Then** it becomes a new saved diagram identical to the one saved
  - **And** no existing diagram is overwritten

## US7-AS9

> **Given** a file that is not a valid editor file (damaged, edited by hand into an invalid state, another format, or from a newer editor version), **When** the user opens it, **Then** it is refused with an explanation and nothing is loaded or saved.

- **BI-064** Expresses: FR-049, FR-050, US7-AS9, SC-014, EC-12. Verified by: VO-083, VO-084.
  - **Given** a file that is not a valid editor file: damaged, hand-edited into an invalid state, another format, or from a newer editor version
  - **When** the user opens it
  - **Then** it is refused with an explanation
  - **And** nothing is loaded or saved

## US7-AS10

> **Given** browser storage is full, disabled or unavailable (for example in some private windows), **When** the user edits, **Then** editing continues, the editor states the diagram is not saved and suggests saving a file, and previously saved diagrams are not damaged.

- **BI-065** Expresses: FR-043, US7-AS10, SC-015. Verified by: VO-085.
  - **Given** browser storage is full, disabled or unavailable
  - **When** the user edits
  - **Then** editing continues and the editor states the diagram is not saved and suggests saving a file
  - **And** previously saved diagrams are not damaged

## US7-AS11

> **Given** a diagram is being edited in one tab, **When** the user opens it in a second tab, **Then** the second tab says it is open elsewhere and offers "Edit here instead"; choosing it loads the latest saved version, and the first tab stops editing (an unconfirmed label edit there is dropped), explains why, and offers to take it back; the two tabs never both save the diagram.

- **BI-066** Expresses: FR-051, US7-AS11. Verified by: VO-086.
  - **Given** a diagram is being edited in one tab, with a label edit open
  - **When** the user opens it in a second tab and chooses Edit here instead
  - **Then** the second tab first says it is open elsewhere, then loads the latest saved version
  - **And** the first tab stops editing, drops the open label edit, explains why and offers to take it back
  - **And** the two tabs never both save the diagram

## US7-AS12

> **Given** the start screen, **When** it lists saved diagrams, **Then** it states that diagrams are kept only in this browser and suggests saving files as a backup.

- **BI-067** Expresses: FR-044, US7-AS12. Verified by: VO-074.
  - **Given** the start screen
  - **When** it lists saved diagrams
  - **Then** it states that diagrams are kept only in this browser and suggests saving files as a backup

## Other behaviours

- **BI-068** Expresses: FR-013, FR-024, SC-002. Verified by: VO-007.
  - **Given** flowcharts with each of the nine shapes and nine connection types, labelled and unlabelled
  - **When** their source is generated
  - **Then** Mermaid 12 accepts it and reads back the same shapes, connection types and labels

- **BI-069** Expresses: FR-012, FR-053, EC-06. Verified by: VO-013.
  - **Given** the source of the open diagram has changed
  - **When** generating it fails, or its check or drawing fails, cannot run, or answers late for an older source
  - **Then** the failure is reported and the source is never presented as checked
  - **And** a late answer never replaces the result for the newer source

- **BI-070** Expresses: FR-012, SC-004. Verified by: VO-034.
  - **Given** a diagram of any type
  - **When** the user makes a mix of edits, undos and redos
  - **Then** after each step the items and relationships on the canvas match those in the generated source

- **BI-071** Expresses: FR-013, FR-027, SC-002. Verified by: VO-036.
  - **Given** sequence diagrams with participants, actors and each of the eight message types
  - **When** their source is generated
  - **Then** Mermaid 12 accepts it and reads back the same participants, actors, message types and texts

- **BI-072** Expresses: FR-013, FR-031, FR-035, SC-002. Verified by: VO-048.
  - **Given** C4 diagrams of each kind with every element type and boundary the kind offers
  - **When** their source is generated
  - **Then** it starts with the kind's header, Mermaid 12 accepts it and reads back the same elements, details, boundaries, nesting and relationships
  - **And** it contains no style or layout statement

- **BI-073** Expresses: FR-054. Verified by: VO-059.
  - **Given** a flowchart, a sequence diagram and a C4 diagram
  - **When** each is open
  - **Then** only the C4 diagram offers a title

- **BI-074** Expresses: FR-019, EC-19. Verified by: VO-063.
  - **Given** a selected flowchart node
  - **When** the user presses arrow keys several times, then does something else
  - **Then** the node moves by a fixed step each time and the run of moves is one undoable step
  - **And** a move onto an occupied position lands at the nearest free position

- **BI-075** Expresses: FR-019, EC-20. Verified by: VO-064.
  - **Given** two elements with the same label
  - **When** the user opens the Connect or Change end target list
  - **Then** the two entries are told apart by type and position number

- **BI-076** Expresses: FR-020, SC-009. Verified by: VO-071.
  - **Given** the start screen, each dialog and each diagram type with content
  - **When** they are checked against WCAG 2.2 AA
  - **Then** no failure is found

- **BI-077** Expresses: FR-020. Verified by: VO-072.
  - **Given** items and connections on each type's canvas
  - **When** they are examined and focused
  - **Then** each has an accessible name and a visible focus indicator

- **BI-078** Expresses: FR-046, FR-052, SC-014. Verified by: VO-076.
  - **Given** diagrams of each type and kind
  - **When** they are kept in the browser or saved to a file and read back
  - **Then** they are identical
  - **And** neither form holds Mermaid source or undo history

- **BI-079** Expresses: FR-048. Verified by: VO-081.
  - **Given** diagram names with characters unsafe in file names, only such characters, or great length
  - **When** a file is saved
  - **Then** its name replaces unsafe characters, is never empty and has a safe length

- **BI-080** Expresses: FR-051, EC-14. Verified by: VO-087.
  - **Given** the tab editing a diagram closes or crashes
  - **When** another tab opens that diagram
  - **Then** it can edit it without being asked to take over

- **BI-081** Expresses: FR-050, EC-11. Verified by: VO-088.
  - **Given** one damaged saved diagram among good ones
  - **When** the start screen lists them
  - **Then** the damaged one is listed as unreadable with an explanation and can be deleted but not opened
  - **And** the others open normally

- **BI-082** Expresses: FR-050, EC-12. Verified by: VO-089.
  - **Given** a saved diagram or file from an older format version
  - **When** it is opened
  - **Then** it is upgraded without changing the diagram's meaning

- **BI-083** Expresses: FR-049. Verified by: VO-090.
  - **Given** a file whose labels and name contain HTML, script tags and Mermaid directives
  - **When** it is opened and viewed everywhere it appears
  - **Then** every text is shown literally
  - **And** no script runs

- **BI-084** Expresses: FR-021, FR-052, SC-010. Verified by: VO-091.
  - **Given** the built editor served as static files
  - **When** a full editing session runs in each type
  - **Then** no network request is made after load
  - **And** the build output holds only static files

- **BI-085** Expresses: FR-003, FR-004, FR-015, FR-023. Verified by: VO-092.
  - **Given** any screen
  - **When** its controls and the source panel are examined
  - **Then** the source is read-only in an expandable panel
  - **And** no control offers source editing or import, image export, collaboration, version history, cloud storage, multi-select, copy and paste of items, grid snapping or auto-arrange

- **BI-086** Expresses: FR-015, EC-09. Verified by: VO-093.
  - **Given** a control that needs a selection or input
  - **When** it is used without one
  - **Then** the editor states what is needed and changes nothing
  - **And** with what it needs, it performs exactly its advertised action

- **BI-087** Expresses: FR-038. Verified by: VO-094.
  - **Given** Sequence and C4 diagrams
  - **When** they are drawn on the canvas
  - **Then** their items are placed by order alone, matching the arrangement Mermaid draws
  - **And** no free positioning is offered

- **BI-088** Expresses: SC-012. Verified by: VO-095.
  - **Given** a diagram of 100 elements and 150 relationships in each type
  - **When** the user edits, undoes and redoes
  - **Then** each change shows on the canvas and in the source within 1 second

- **BI-089** Expresses: SC-016. Verified by: VO-096.
  - **Given** diagrams of each type with many relationships
  - **When** an item's type is changed within its family or a relationship's end is moved
  - **Then** no other relationship is added, removed or reattached

- **BI-090** Expresses: FR-013, FR-034. Verified by: VO-097.
  - **Given** a C4 diagram with empty boundaries or Deployment nodes
  - **When** its source is generated
  - **Then** the source contains them
  - **And** a notice names each empty one and says Mermaid cannot draw it until it holds an element or is deleted

- **BI-091** Expresses: FR-013, FR-034. Verified by: VO-098.
  - **Given** a C4 diagram that is empty and untitled, or has an empty boundary
  - **When** the user copies the source
  - **Then** the source is copied
  - **And** the source panel and the copy feedback show the notice

- **BI-092** Expresses: FR-049. Verified by: VO-099.
  - **Given** a file larger than 5 MB
  - **When** the user opens it
  - **Then** it is refused with an explanation before it is read
  - **And** nothing is opened

- **BI-093** Expresses: FR-009, SC-006. Verified by: VO-100.
  - **Given** any sequence of accepted operations in any type
  - **When** each is applied
  - **Then** the resulting diagram passes the same full check used for opening files

- **BI-094** Expresses: FR-022. Verified by: exemption FR-022.
  - **Given** any screen or message of the editor
  - **When** it is shown
  - **Then** it uses the one light theme and English text
  - **And** all user-facing text comes from one place, ready for later translation
