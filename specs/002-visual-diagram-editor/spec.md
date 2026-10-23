# Feature Specification: Visual Diagram Editor (Flowchart, Sequence, C4)

**Feature Branch**: `002-visual-diagram-editor`

**Created**: 2026-10-18

**Status**: Draft

**Grilled on**: 2026-10-18

**Input**: User description: "@setup.md @notes.md" — a visual drag-and-drop editor for creating and editing Mermaid Flowchart, Sequence and C4 diagrams (all five C4 kinds), which generates read-only Mermaid source from the visual diagram.

**Precedence**: `setup.md` outranks `notes.md`. Where they disagree, the disagreement is raised as an open question, not resolved by assumption. The earlier flowchart-only attempt (`specs/_archive/001-flowchart-visual-editor-v0`) is reference only.

## Clarifications

### Session 2026-10-18

- Q: Do Sequence and C4 diagrams use free canvas positions, given that Mermaid lays both out from statement order? → A: No. Layout is order-driven: Sequence lifelines run left to right in declaration order and messages top to bottom; C4 elements follow statement order. Dragging from the toolbox only adds an element, and order changes through reorder controls. Only Flowchart has free positions.
- Q: Is the C4 kind chosen as part of the type (six start-screen choices) or as a second step? → A: A second step. The start screen offers Flowchart, Sequence and C4; choosing C4 opens a kind picker (Context, Container, Component, Dynamic, Deployment) that carries the experimental note.
- Q: How does the user reorder participants, messages and Dynamic relationships, and place a new message at a chosen position? → A: Both interactions are offered: dragging an item to its new position with a pointer, and move-up / move-down controls that work from the keyboard. Either way one reorder is one undoable step.
- Q: May a Sequence message have empty text? → A: No. A message needs text with at least one visible character; an empty one is rejected with an explanation.
- Q: May a self-message be created when only one participant exists? → A: Yes. No second participant is required.
- Q: Is the proposed list of eight Sequence message types confirmed? → A: Yes. Solid or dashed line, each ending in a filled arrow, an open arrow, a cross (lost message) or an async open arrow.
- Q: Is the proposed C4 element and boundary list per kind confirmed, with each kind offering only its own set? → A: Yes. The table under Functional Requirements stands as written.
- Q: Are C4 description and technology editable properties alongside the label, each optional? → A: Yes, both are editable and optional. Technology applies to element types that have one and to relationships.
- Q: Is a C4 element's type fixed at creation? → A: Yes. Person versus external Person, or Container versus Container database, cannot be switched; the user deletes and recreates. *(Superseded by the revision "Can an element's type be changed in place" below.)*
- Q: Are Mermaid's C4 style and layout update statements supported in the first release? → A: No. They are out of scope, and the generated C4 source contains none.
- Q: Is it acceptable that Mermaid's own C4 rendering limits (shapes per row, text overflow) are not corrected by the editor? → A: Yes. The editor does not correct or warn about them; the experimental note on the C4 kind picker covers this.
- Q: Do Dynamic relationship numbers follow order automatically? → A: Yes. Numbers are derived from position starting at 1 with no gaps; reordering or deleting renumbers the rest, and the user never enters a number.
- Q: After a C4 element is created, can the user move it into, out of, or between boundaries, or is its boundary fixed at creation? → A: Membership can change after creation. The user moves an element into a boundary, out to the top level, or to another boundary by drag or by a keyboard control; each move is one undoable step and keeps the element's relationships. Deployment nodes can be re-nested the same way.
- Q: Which characters must labels be able to contain while still producing valid source and displaying as typed? → A: Any Unicode text. Characters known to break Mermaid diagrams (such as `"` and `<`) are escaped in the generated source, and the label still displays exactly as typed. Tests cover at least `" ' [ ] ( ) { } < > # ; : | & % /`, backtick, backslash, `%%`, `-->`, keywords such as `end`, markdown-like text, and line breaks.
- Q: Must a C4 relationship's label contain visible text, or may it be empty? → A: Required. A C4 relationship label needs at least one visible character; an empty one is rejected with an explanation. A new relationship gets the default label "Uses".
- Q: Can the user give a C4 diagram an optional title that appears in the generated source? → A: Yes. A C4 diagram has an optional title, empty by default and editable at any time; each edit is one undoable step, and when set the source contains a `title` line escaped like any label. Flowchart and Sequence diagrams have no title.
- Q: What is the largest diagram that must stay responsive while editing? → A: 100 elements and 150 relationships; each edit, undo or redo is reflected on the canvas and in the source within 1 second on a typical business laptop.
- Q (revision): May diagrams be kept between sessions, given setup.md excluded it? → A: Yes. The Business Analyst amended setup.md and the constitution (1.2.0): diagrams are kept in the user's own browser and can be saved to and opened from files in the editor's own format. Mermaid source import, version history and any server or cloud storage stay excluded. *(Confirmed by the Business Analyst.)*
- Q (revision): Is saving automatic or explicit? → A: Automatic. Every committed change, Undo and Redo is saved in the browser; the editor shows whether the latest change is saved. A diagram is first saved at its first committed change, so untouched empty diagrams never clutter the list. *(Confirmed by the Business Analyst.)*
- Q (revision): Is undo history kept when a diagram is reopened? → A: No. Undo history lasts while the diagram is open; reopening starts with an empty history. This keeps "version history" out of scope. *(Confirmed by the Business Analyst.)*
- Q (revision): How does the user find a kept diagram? → A: The start screen lists saved diagrams, most recently changed first, with name, type (and C4 kind) and when last changed. Each diagram has an editor-only name (default "Untitled <type>"), separate from the C4 title, which never appears in the source. *(Confirmed by the Business Analyst.)*
- Q (revision): What happens when browser storage is full, disabled or cleared? → A: Editing continues in memory; the editor says the diagram is not saved and suggests saving a file, and leaving asks for confirmation. A failed save never damages diagrams already saved. Clearing browser data outside the editor loses saved diagrams; the start screen says diagrams live only in this browser. *(Confirmed by the Business Analyst.)*
- Q (revision): What if the same diagram is open in two tabs? → A: Only one tab can edit a diagram at a time. Opening it in a second tab says it is open elsewhere and offers "Edit here instead". Choosing that loads the latest saved version, and the first tab stops editing, explains why, and offers to take it back the same way. A diagram open in another tab cannot be deleted from the start screen. The diagram is released automatically when its tab closes or crashes. *(Confirmed by the Business Analyst.)*
- Q (revision): What does opening a file do? → A: It always creates a new saved diagram and never overwrites one. The file is validated in full first; an invalid, damaged or newer-format file is refused with an explanation and nothing is loaded. Labels from a file are always shown as text, never interpreted. *(Confirmed by the Business Analyst.)*
- Q (revision): Can an element's type be changed in place instead of deleted and recreated? → A: Yes, within a family: any flowchart shape to any other; any flowchart connection type to any other; Participant and Actor; any Sequence message type to any other; C4 one-way and two-way; and within a C4 family (Person; System, System database, System queue; Container, Container database, Container queue; Component, Component database, Component queue; each with its external variant). Changing across families, boundaries and Deployment nodes still means delete and recreate. Each change is one undoable step and keeps the label, details, connections, order and membership. *(Confirmed by the Business Analyst.)*
- Q (revision): Can a connection's endpoints be changed? → A: Yes. A flowchart connection, Sequence message or C4 relationship can be moved to a different source or target, by drag or by keyboard. Its label, type, order position and Dynamic number are kept, and it is one undoable step. A Reverse command also swaps source and target in one undoable step; it is unavailable, with an explanation, where swapping would change nothing (a connection to itself, a plain line, a two-way connection or relationship). *(Confirmed by the Business Analyst.)*
- Q (revision): What does the flowchart canvas promise about layout? → A: Flowchart positions are editor-only. They are saved with the diagram but not written to the source, and Mermaid arranges the diagram its own way. The editor states this next to Copy Source and offers a read-only "Preview as Mermaid draws it" view, which updates with every change and shows a rendering failure as an error, never as a stale picture. This replaces the `notes.md` decision of no separate preview, for Flowchart only. Sequence and C4 canvases match Mermaid's layout, as FR-038 states, so they have no preview. *(Confirmed by the Business Analyst.)*
- Q (revision): Must every operation work without a pointer and without dragging? → A: Yes, to meet WCAG 2.2 AA in full (success criteria 2.1.1 and 2.5.7). Activating a toolbox item adds the element; a Connect command picks the target from a list; arrow keys move a flowchart node, with consecutive moves of one node merged into one undo step. *(Confirmed by the Business Analyst.)*
- Q (revision): Can source be copied ready for Markdown? → A: Yes. "Copy for Markdown" copies the source inside a `mermaid` code fence, with the same success and failure feedback as Copy Source. *(Confirmed by the Business Analyst.)*

### Session 2026-10-18 (plan)

- Q (analysis): Do FR-013 and SC-002 name the C4 cases Mermaid cannot draw? → A: Yes. FR-013 and SC-002 now state the exceptions already decided below; no behaviour changes. *(Confirmed by the Business Analyst.)*

- Q (plan): Mermaid 12.2 cannot parse a bare C4 header, so an empty C4 diagram with no title has no valid source. What is its source? → A: The bare header, as FR-013 states, and it can still be copied. The source panel says that Mermaid cannot draw an empty C4 diagram until an element or a title is added. Nothing outside the model is added to the source. This is the one stated exception to "valid for the diagram type" in FR-013. *(Confirmed by the Business Analyst.)*
- Q (plan): Mermaid 12.2 rejects an empty C4 boundary or Deployment node, and a new boundary starts empty. How is it handled? → A: The empty boundary or node is written to the source, so model and source always agree. While any boundary or node is empty, the source panel and both copy actions say the source is not valid Mermaid until each boundary and node holds an element or is deleted, naming the empty ones; copying is still allowed with that warning. *(Confirmed by the Business Analyst.)*
- Q (plan): Mermaid has no numbered form of a two-way relationship in C4 Dynamic. How is one written? → A: As `BiRel` at its position in the order. Mermaid still draws it with the right number and the numbers after it stay correct, but that line carries no literal number in the source. One-way Dynamic relationships carry their number in the source. *(Confirmed by the Business Analyst.)*
- Q (plan): What happens to the contents when a C4 boundary or Deployment node that still holds elements, boundaries or nodes is deleted? → A: Only the grouping is removed. Its contents move to its parent boundary or node (or the top level), keeping their order and relationships, in one undoable step. A deleted Deployment node's own relationships are removed, as for any element (FR-011). *(Confirmed by the Business Analyst.)*
- Q (plan): Can a C4 relationship start or end at a boundary or a Deployment node? → A: Relationship ends are elements of any kind, plus Deployment nodes in Deployment diagrams. Boundaries are never relationship ends. *(Confirmed by the Business Analyst.)*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a flowchart and copy its Mermaid source (Priority: P1)

A business analyst or developer opens the editor, chooses Flowchart, drags node shapes onto the canvas, connects them, and copies the generated Mermaid source into their documentation. They never write or read Mermaid syntax to do so.

**Why this priority**: This is the core purpose of the product and the smallest slice that delivers value. It also establishes the behaviours (creation, undo, validation, source generation, copy) that Sequence and C4 reuse.

**Independent Test**: Create a new flowchart, add two nodes, connect them, and copy the source. The clipboard holds valid Mermaid flowchart source describing exactly those two nodes and one connection.

**Acceptance Scenarios**:

1. **Given** the editor is open with no diagram, **When** the user starts creating a diagram, **Then** the editor prompts for a diagram type offering Flowchart, Sequence and C4; choosing C4 prompts for a kind (Context, Container, Component, Dynamic, Deployment).
2. **Given** the user selects Flowchart, **When** the diagram opens, **Then** it is empty, the diagram type is displayed, and the user can begin editing immediately.
3. **Given** a flowchart is open, **When** the user views the toolbox, **Then** it shows the nine node shapes (rectangle, rounded rectangle, stadium, diamond, circle, parallelogram, cylinder, subroutine, hexagon), visually distinguishable, and the nine connection types (solid, dotted, thick, each as arrow, plain line or two-way arrow), and offers nothing unsupported.
4. **Given** a flowchart is open, **When** the user drags a shape from the toolbox onto the canvas, **Then** a node appears at the drop location (or the nearest free position if occupied) with its type name as the default label, and the generated source represents it and is valid.
5. **Given** at least two nodes exist, **When** the user creates a connection between them, **Then** it is shown between the chosen endpoints with the chosen type and direction, and the generated source represents it.
6. **Given** a flowchart exists, **When** the user selects Copy Source, **Then** the current source is placed on the clipboard and success is confirmed only after the copy has actually succeeded.
7. **Given** copying fails, **When** the user selects Copy Source, **Then** the editor explains that copying failed and does not report success.
8. **Given** a drag ends outside the canvas, **When** the user releases it, **Then** the drag is cancelled: no node is added, a moved node stays where it was, and nothing enters the undo history.
9. **Given** a flowchart is open, **When** the user looks at Copy Source, **Then** the editor states that node positions are kept in the editor only and that Mermaid arranges the copied diagram its own way.
10. **Given** a flowchart, **When** the user opens Preview as Mermaid draws it, **Then** a read-only view shows the diagram as Mermaid lays it out, it updates after every change, Undo and Redo, it cannot be edited, and a rendering failure is shown as an error rather than a stale picture.
11. **Given** a diagram exists, **When** the user selects Copy for Markdown, **Then** the clipboard holds the source inside a `mermaid` code fence, with the same success and failure feedback as Copy Source.

---

### User Story 2 - Edit and delete flowchart elements safely (Priority: P2)

The user refines a flowchart: selecting, moving and renaming nodes, editing connection labels, and deleting nodes and connections, with the diagram and source staying in step and deletion never inventing relationships.

**Why this priority**: Real diagrams are iterated on. Wrong deletion would silently change a diagram's meaning, which the business rules forbid.

**Independent Test**: Build A→B→C, move and rename B, label a connection, then delete B. A and C remain, both connections to B are gone, no A→C connection exists in the diagram or the source.

**Acceptance Scenarios**:

1. **Given** a node is selected, **When** the user moves it, **Then** it appears at the new position (or nearest free position), its connections stay attached to the same nodes, and logical relationships are unchanged.
2. **Given** a node is selected, **When** the user confirms a new label, **Then** the node and the source show it, and a label with Mermaid-special characters displays exactly as typed while the source stays valid.
3. **Given** a node label is empty or has no visible characters (spaces or line breaks only), **When** the user confirms it, **Then** the edit is rejected with an explanation and the previous label remains.
4. **Given** a connection is selected, **When** the user edits its label (which may be empty), **Then** it updates visually and in the source, and keeps its endpoints, type and direction.
5. **Given** a node with connections, **When** the user deletes it, **Then** the node and all incident connections are removed, all other elements remain, and former neighbours are not connected to each other.
6. **Given** a connection exists, **When** the user deletes it, **Then** only that connection is removed and both endpoint nodes and all other connections are unchanged.
7. **Given** a self-loop, a duplicate connection, an opposite-direction connection, a cycle or a disconnected node, **When** the user creates or leaves it, **Then** it is accepted; each connection is distinct.
8. **Given** the user attempts an operation that is unsupported or would produce an invalid diagram, **When** the attempt is made, **Then** the diagram stays in its previous valid state, nothing partial is left behind, and the user sees an understandable explanation.
9. **Given** a node with connections, **When** the user changes its shape (for example rectangle to diamond), **Then** the node keeps its label, position and connections, the source shows the new shape, and the change is one undoable step.
10. **Given** a connection, **When** the user changes its type (line style or ending) or moves one of its ends to a different node, **Then** it keeps its label and its other end, the source reflects the change, and the change is one undoable step.
11. **Given** a one-way connection from A to B, **When** the user selects Reverse, **Then** it runs from B to A with the same label and type in one undoable step; for a self-loop, a plain line or a two-way connection, Reverse is unavailable and the editor explains why.

---

### User Story 3 - Undo and redo every edit (Priority: P2)

The user reverses and reapplies any committed edit, in order, without losing consistency between canvas and source.

**Why this priority**: Required by business rule 9 for every type; it makes experimentation safe.

**Independent Test**: Perform add, move, rename, connect, edit-label and delete operations, undo all of them in order, then redo all of them; at each step the canvas and the source match the expected state.

**Acceptance Scenarios**:

1. **Given** completed operations, **When** the user invokes Undo repeatedly, **Then** each operation is reversed in reverse order and the canvas and source reflect each restored state.
2. **Given** undone operations, **When** the user invokes Redo repeatedly, **Then** they are reapplied in original order.
3. **Given** nothing to undo (or redo), **When** the user looks at the control, **Then** it is unavailable.
4. **Given** undone operations, **When** the user commits a new operation, **Then** the redo history is cleared.
5. **Given** a completed drag or a confirmed label edit, **When** the user invokes Undo, **Then** the whole gesture is reversed in one step.
6. **Given** a diagram open for a long time, **When** the user undoes, **Then** history is unlimited while the diagram stays open; it is not kept after the diagram is closed.

---

### User Story 4 - Build a sequence diagram (Priority: P3)

The user chooses Sequence, adds participants and actors, adds ordered messages between them (including self-messages), reorders participants and messages, and copies the source.

**Why this priority**: Second supported type in the first release; it reuses the shared behaviours of Stories 1–3 with its own elements and rules.

**Independent Test**: Create a sequence diagram with two participants and one actor, add three messages of different types, reorder one message, and copy the source; the source lists declarations then messages in the displayed order.

**Acceptance Scenarios**:

1. **Given** a sequence diagram is open, **When** the user views the toolbox, **Then** it offers Participant and Actor and the eight message types (solid or dashed, each as filled arrow, open arrow, cross or async open arrow) and nothing else (no notes, activations, loops, alternatives, grouping or autonumbering).
2. **Given** participants exist, **When** the user adds a message between two of them, **Then** it appears in order with its text and type, and the source lists it in that order.
3. **Given** a diagram with exactly one participant or actor, **When** the user adds a message from it to itself, **Then** a self-message is created without needing a second participant.
4. **Given** two participants with the same label, **When** the diagram is generated, **Then** they remain distinct participants.
5. **Given** a participant with messages, **When** the user deletes it, **Then** it and its messages are removed and no new messages are created.
6. **Given** participants or messages, **When** the user reorders them, **Then** the displayed order and the source order change together, and the reorder is one undoable step.
7. **Given** a message with empty text is attempted, **When** the user confirms, **Then** it is rejected with an explanation and the message is not added or changed.
8. **Given** a participant with messages, **When** the user changes it to an Actor (or back), **Then** it keeps its label, order and messages, and the change is one undoable step.
9. **Given** a message, **When** the user changes its type or its sender or receiver, **Then** it keeps its text and order position, and the change is one undoable step.

---

### User Story 5 - Build a C4 diagram of any of the five kinds (Priority: P3)

The user chooses C4 and a kind (Context, Container, Component, Dynamic or Deployment), adds that kind's elements, boundaries and relationships, edits their labels and optional details, and copies the source.

**Why this priority**: Third supported type; largest element vocabulary, so it comes last, but it is part of the first release.

**Independent Test**: For each of the five kinds, build a small diagram using that kind's elements and one relationship and copy the source; the header matches the kind and the source contains exactly the elements and relationships built.

**Acceptance Scenarios**:

1. **Given** the user chooses C4, **When** the C4 kind picker is shown, **Then** it states that C4 support is experimental and that external tools may render it differently or not at all.
2. **Given** a C4 kind is open, **When** the user views the toolbox, **Then** it offers only that kind's elements and boundaries (for example, Context never offers Containers).
3. **Given** a C4 element exists, **When** the user edits it, **Then** label, description and technology (where the element type has one) are editable and optional; the element type can be changed only within its family (FR-040).
4. **Given** two elements, **When** the user creates a relationship, **Then** it has a source, a target, a label (default "Uses") and an optional technology, and may be one-way or two-way; confirming an empty label (no visible characters) is rejected with an explanation and the previous label remains.
5. **Given** a Dynamic diagram, **When** relationships are added, **Then** they are numbered automatically in order, and when the user reorders or deletes one the numbers follow the new order with no gaps.
6. **Given** an element with relationships or boundary membership, **When** the user deletes it, **Then** its relationships and membership are removed and nothing new is created.
7. **Given** an element, **When** the user places it in a boundary, **Then** it belongs to at most one boundary, and boundaries nest only where Mermaid allows.
8. **Given** a Deployment diagram, **When** the user nests nodes, **Then** nesting expresses containment, with Containers placed inside nodes.
9. **Given** an existing element with relationships, **When** the user moves it into a boundary, out to the top level, or to another boundary (by drag or by keyboard control), **Then** its membership changes, its relationships are kept, the source reflects the new grouping, and the move is one undoable step; a Deployment node or Container is re-nested the same way.
10. **Given** a C4 diagram of any kind, **When** the user sets, changes or clears its optional title, **Then** the title is shown, the source contains a matching `title` line (or none when the title is empty), and each change is one undoable step.
11. **Given** a System with relationships inside a boundary, **When** the user changes it to an external System database, **Then** it keeps its label, description, relationships and membership, and the change is one undoable step; changing it to a Person is not offered.
12. **Given** a relationship (including a Dynamic one), **When** the user moves its source or target to another element, or reverses a one-way relationship, **Then** it keeps its label, technology and number.

---

### User Story 6 - Work confidently in the editor (Priority: P3)

The user can use the editor by keyboard for core actions, zoom and pan the canvas, and is protected from accidentally losing work.

**Why this priority**: Cross-cutting usability and accessibility requirements that apply to every type but do not block producing a first diagram.

**Independent Test**: Using only the keyboard, build a two-element diagram with one connection, rename, change a type, delete, undo, redo and copy the source; then make saving fail and attempt to reload, and confirm the warning.

**Acceptance Scenarios**:

1. **Given** any diagram, **When** the user works without a pointer, **Then** every operation (add, select, move, rename, change type, connect, change endpoints, reorder, change boundary membership, delete, undo, redo, copy, and the save and open actions) is achievable by keyboard, and every drag has a non-drag alternative.
2. **Given** a diagram whose latest change is not saved (saving failed or is unavailable, or a label edit is in progress), **When** the user closes, reloads or navigates away, **Then** the editor asks for confirmation first; when everything is saved it does not ask.
3. **Given** an open diagram, **When** the user returns to the start screen, **Then** the diagram stays saved and appears in the saved-diagrams list; nothing is discarded.
4. **Given** any diagram type, **When** the user zooms, pans or fits to view, **Then** the canvas responds and the diagram's content and source are unchanged.
5. **Given** an empty diagram of any type, **When** it is shown, **Then** an editable canvas displays a hint to drag an element from the toolbox, and the source (the bare header for that type) can be copied.
6. **Given** any feedback message, **When** it appears, **Then** it is announced to screen readers.

---

### User Story 7 - Keep diagrams and come back to them (Priority: P2)

The user's diagrams are kept in their browser as they work, so they can close the browser, return later, and continue editing. They can also save a diagram to a file and open it again, to back it up or move it to another browser.

**Why this priority**: Diagrams in documentation change over time. Without this, every change means rebuilding the diagram from scratch, which undermines the business value of reuse.

**Independent Test**: Build a flowchart, close the browser, reopen the editor, and open the diagram from the start screen; it is identical, including node positions. Save it to a file, delete it from the list, open the file, and the diagram is identical again.

**Acceptance Scenarios**:

1. **Given** the user makes a committed change, Undo or Redo, **When** the change is saved in the browser, **Then** the editor shows that the diagram is saved, and only after the save has succeeded.
2. **Given** saved diagrams exist, **When** the user opens the editor, **Then** the start screen lists them, most recently changed first, with name, type (and C4 kind) and last-changed time, alongside the choice to create a new diagram.
3. **Given** a saved diagram, **When** the user opens it, **Then** its content, including flowchart positions, Sequence and C4 order, boundaries and C4 title, is exactly as last saved, and Undo is unavailable until a new change is made.
4. **Given** a new diagram, **When** it is created, **Then** it is named "Untitled <type>" (for example "Untitled flowchart"), the user can rename it as one undoable step, and the name never appears in the generated source.
5. **Given** a new diagram that has had no committed change, **When** the user returns to the start screen, **Then** it is not added to the list.
6. **Given** a saved diagram, **When** the user deletes it from the list and confirms, **Then** it is removed permanently and the other diagrams are unchanged.
7. **Given** a diagram, **When** the user saves it to a file, **Then** a file in the editor's own format is downloaded, named after the diagram; because a browser does not tell the page whether a download finished, the editor says the file was offered for download and does not claim it was stored.
8. **Given** a file saved by the editor, **When** the user opens it, **Then** it becomes a new saved diagram identical to the one saved, and no existing diagram is overwritten.
9. **Given** a file that is not a valid editor file (damaged, edited by hand into an invalid state, another format, or from a newer editor version), **When** the user opens it, **Then** it is refused with an explanation and nothing is loaded or saved.
10. **Given** browser storage is full, disabled or unavailable (for example in some private windows), **When** the user edits, **Then** editing continues, the editor states the diagram is not saved and suggests saving a file, and previously saved diagrams are not damaged.
11. **Given** a diagram is being edited in one tab, **When** the user opens it in a second tab, **Then** the second tab says it is open elsewhere and offers "Edit here instead"; choosing it loads the latest saved version, and the first tab stops editing (an unconfirmed label edit there is dropped), explains why, and offers to take it back; the two tabs never both save the diagram.
12. **Given** the start screen, **When** it lists saved diagrams, **Then** it states that diagrams are kept only in this browser and suggests saving files as a backup.

---

### Edge Cases

- EC-01: In a flowchart, a drop or move onto an occupied position goes to the nearest free position; overlap never results. Sequence and C4 have no free positions, so this does not arise.
- EC-02: A flowchart node deleted while it has self-loops, duplicates or both-direction connections removes all of them.
- EC-03: Labels may contain any Unicode text (including emoji and non-Latin scripts). Characters known to break Mermaid (such as `"` and `<`), brackets, `%%`, `-->`, keywords such as `end`, markdown-like text and multiple lines are escaped in the source so it stays valid, while the label displays exactly as typed.
- EC-04: A label of only spaces or line breaks counts as empty.
- EC-05: All nodes deleted: the canvas stays editable and the source is the bare header for the diagram type (plus the `title` line if a C4 title is set).
- EC-06: A render or generation failure is reported and never shown as success or as a stale diagram.
- EC-07: The clipboard is unavailable or denied: Copy Source reports failure.
- EC-08: Undo or Redo during an in-progress drag or label edit does not leave partial changes.
- EC-09: A control that needs a selection or extra input is used without it: the editor explains what is needed.
- EC-10: C4 limits in Mermaid itself (shapes per row, text overflow) are not corrected by the editor.
- EC-11: Saved data in the browser is damaged or unreadable: that diagram is listed as unreadable with an explanation and can be deleted; it is never opened partly, and other diagrams are unaffected.
- EC-12: Saved data or a file comes from an older editor version: it is upgraded on opening without changing the diagram's meaning. From a newer version: it is refused with an explanation.
- EC-13: Deleting a saved diagram that is being edited in another tab is not offered; the start screen explains that it is open elsewhere.
- EC-14: The tab editing a diagram closes or crashes: the diagram is released, and another tab can edit it without being asked to take over.
- EC-15: A new diagram with no committed change is not yet saved, so it cannot be open in two tabs.
- EC-16: The user clears browser data outside the editor: saved diagrams are gone; only files saved earlier can restore them.
- EC-17: An element type change across families (for example System to Person) or of a boundary or Deployment node is not offered; it still means delete and recreate.
- EC-18: Moving a connection's end creates a self-loop or a duplicate: accepted, as for any flowchart connection; for C4, the relationship rules (FR-032) still apply.
- EC-19: Keyboard move of a flowchart node onto an occupied position goes to the nearest free position, as for a drag.
- EC-20: Two elements with the same label in a keyboard target list (for Connect or for moving an end) are told apart by type and a position number.

## Requirements *(mandatory)*

### Functional Requirements

**Shared (all types)**

- **FR-001**: The editor MUST prompt for a diagram type when no diagram exists, offering Flowchart, Sequence and C4; choosing C4 MUST prompt for a kind (Context, Container, Component, Dynamic, Deployment). Selecting a type (and kind) MUST open a new empty diagram of it.
- **FR-002**: The diagram type (including the C4 kind) MUST be fixed at creation and displayed at all times; the toolbox MUST offer only that type's elements, relationships and operations.
- **FR-003**: The visual diagram MUST be the only editable state; the generated Mermaid source MUST be read-only and shown in an expandable panel. For Sequence and C4 the canvas MUST match the layout Mermaid draws (FR-038). For Flowchart the canvas shows the user's own node positions, which are editor-only (saved, not written to the source); the editor MUST state, next to Copy Source, that Mermaid arranges the copied flowchart its own way, and MUST offer the flowchart preview (FR-053).
- **FR-004**: Users MUST NOT need to know Mermaid syntax to create or modify any diagram.
- **FR-005**: After creation the user MUST be able to edit: the label (and, for C4, optional description and technology on elements that have them and on relationships); an element's or connection's type within its family (FR-040); a connection's endpoints (FR-041); a C4 element's boundary membership or a Deployment node's or Container's parent node (FR-034); and a C4 diagram's title (FR-054). Changing a type across families, or a boundary's or Deployment node's type, MUST NOT be offered; the user deletes and recreates.
- **FR-006**: Elements that require a label MUST have at least one visible character; multi-line labels MUST be allowed with no length limit. Labels MAY contain any Unicode text; characters known to break Mermaid (such as `"` and `<`) MUST be escaped in the generated source, and the label MUST display exactly as typed. Flowchart connection labels MAY be empty; Sequence message text (FR-028) and C4 relationship labels (FR-032) MUST NOT be.
- **FR-007**: A new element's default label MUST be its type name (for example "Rectangle", "Person").
- **FR-008**: Every committed operation MUST be undoable and redoable; a completed drag or confirmed label edit is one operation; history is unlimited while the diagram is open and is not kept after it is closed (FR-046); committing after Undo clears redo history.
- **FR-009**: An operation MUST be committed whole or rejected with no partial change, and rejection MUST give an understandable explanation.
- **FR-010**: Structure alone (cycles, fan-in, fan-out, disconnected elements) MUST NOT cause rejection, and the editor MUST NOT impose meaning beyond the supported grammar and defined editor rules.
- **FR-011**: Deleting an element MUST remove its incident relationships and any dependent membership, and MUST NOT create any new relationship.
- **FR-012**: The editor MUST regenerate Mermaid source from the current model after every committed change, Undo and Redo, with labels escaped, and the model, rendering and source MUST agree; generation or rendering failures MUST be reported.
- **FR-013**: Generated source MUST target Mermaid 12.x and MUST be valid for the diagram type; the empty diagram's source is the bare header for the type (followed by the `title` line when a C4 title is set). The only exceptions are the cases Mermaid 12.2 cannot draw, where the source still mirrors the model and the editor says so: an empty C4 diagram with no title, and a C4 boundary or Deployment node that holds nothing.
- **FR-014**: Copy Source MUST copy the current source to the clipboard, confirm only after success, and explain failures. Copy for Markdown MUST do the same with the source inside a `mermaid` code fence.
- **FR-015**: Controls MUST NOT be offered for unsupported actions, and every offered control MUST perform its advertised action or explain what selection or input it needs.
- **FR-016**: A drag ending outside the canvas MUST be cancelled; in a flowchart, a drop or move onto an occupied position MUST resolve to the nearest free position.
- **FR-017**: Zoom, pan and fit-to-view MUST be available on the canvas for every type.
- **FR-018**: Closing, reloading or navigating away MUST ask for confirmation only when the latest change is not saved (saving failed or is unavailable, or a label edit is in progress). Returning to the start screen MUST NOT discard the diagram; it stays saved (FR-042).
- **FR-019**: Every operation MUST work from the keyboard, and every drag MUST have a non-drag alternative: activating a toolbox item adds the element (a flowchart node at the nearest free position to the centre of the visible canvas; a participant, message or C4 element at the end of the order or top level); a Connect command and a Change End command pick the target from a list in which equal labels are told apart by type and position number; arrow keys move a selected flowchart node by a fixed step, with consecutive moves of the same node merged into one undoable operation that ends when the user does anything else, selects something else or moves focus away; reordering uses move-up / move-down controls (FR-039); and boundary membership and Deployment nesting use a keyboard control (FR-034).
- **FR-020**: The editor MUST meet WCAG 2.2 AA, including keyboard operation of every function (2.1.1), a non-drag alternative for every drag (2.5.7), colour contrast, focus visibility, accessible names for every element and connection on the canvas, and screen-reader announcement of feedback; saving status changes MUST be exposed as a status message without moving focus, with failures announced.
- **FR-021**: The editor MUST run entirely in the browser from static files, make no network requests after load, and support current stable Chromium-based browsers and Firefox on desktop (Safari and mobile unsupported). *Superseded in part by 007-blueprint-redesign and constitution 1.4.0: Chrome on Android and Safari on iOS are supported; desktop Safari stays unsupported.*
- **FR-022**: The editor MUST use one light theme and English text, with all user-facing text kept in one place to allow later translation. *Superseded in part by 007-blueprint-redesign: two appearances (Blueprint Studio by default, and Light) replace the one light theme; the text rules stand.*
- **FR-023**: Multi-select and multi-delete, copy and paste of elements, grid snapping, auto-arrange, Mermaid source editing or import, SVG or PNG export, collaboration, version history (including undo history kept after a diagram is closed), and server-side or cloud storage or sync MUST NOT be offered.

**Flowchart**

- **FR-024**: The toolbox MUST offer the nine node shapes and nine connection types listed in User Story 1; direction is fixed top-to-bottom with no control.
- **FR-025**: Self-loops, duplicate and opposite-direction connections MUST be valid, each a distinct connection.
- **FR-026**: Node labels MUST be non-empty; connection labels MAY be empty.

**Sequence**

- **FR-027**: The editor MUST support Participants and Actors (each with a distinct id and a display label) and the eight message types listed in User Story 4; it MUST NOT offer notes, activations, loops, alternatives, grouping or autonumbering.
- **FR-028**: A message MUST join two participants or actors (the same one for a self-message) and MUST have text with at least one visible character; message order and participant order MUST be part of the model and the source, and the user MUST be able to reorder both.
- **FR-029**: Deleting a participant MUST delete its messages and create nothing; participants with equal labels MUST be distinct.
- **FR-030**: Generated source MUST be the `sequenceDiagram` header, then participant and actor declarations in order, then messages in order.

**C4**

- **FR-031**: Each C4 kind MUST offer only its own element set and boundaries, per the table below; generated source MUST use that kind's Mermaid header.
- **FR-032**: C4 elements MUST have an alias, a label and an optional description, and a technology where the element type has one; relationships MUST have an existing source and target, a label with at least one visible character (default "Uses"), an optional technology, and may be one-way or two-way.
- **FR-054**: A C4 diagram of any kind MUST have an optional title, empty by default and editable at any time; each change is one undoable operation; when non-empty the generated source MUST contain a `title` line escaped like any label, and when empty it MUST contain none. Flowchart and Sequence diagrams MUST NOT offer a title.
- **FR-033**: In Dynamic diagrams, relationships MUST be numbered automatically from their order starting at 1 with no gaps or duplicates; numbers MUST be derived from the order (never stored) and appear in the source, MUST renumber when relationships are reordered or deleted, and MUST NOT be entered by the user; the user MUST be able to reorder relationships.
- **FR-034**: An element MUST belong to at most one boundary; boundaries MAY nest only where Mermaid allows; Deployment nodes nest instead of using boundaries. After creation the user MUST be able to move an element into a boundary, out to the top level, or to another boundary (and re-nest a Deployment node or Container) both by dragging and by a keyboard-usable control; each move is one undoable operation, keeps the element's relationships, and is rejected with an explanation where Mermaid does not allow the resulting nesting.
- **FR-035**: Mermaid's C4 style and layout update statements MUST NOT be supported in the first release, and generated C4 source MUST NOT contain them.
- **FR-036**: The C4 kind picker MUST state that C4 support is experimental and may render differently or not at all in external tools.

| Kind | Header | Elements | Boundaries |
|------|--------|----------|------------|
| Context | `C4Context` | Person, System, System database, System queue (each with an external variant) | Enterprise, System, generic |
| Container | `C4Container` | Person, System, Container, Container database, Container queue (each with an external variant) | System, Container, generic |
| Component | `C4Component` | Person, System, Container, Component, Component database, Component queue (each with an external variant) | Container, generic |
| Dynamic | `C4Dynamic` | As Component, with numbered relationships | Container, generic |
| Deployment | `C4Deployment` | Deployment node (nestable), Container | Node nesting |

**Interaction and layout**

- **FR-037**: The C4 kind MUST be chosen in a second step after choosing C4, and is fixed once the diagram opens.
- **FR-038**: For Sequence and C4, element placement on the canvas MUST be determined by order alone, matching the layout Mermaid will draw; the editor MUST NOT offer free positioning for these types.
- **FR-053**: For Flowchart, the editor MUST offer a read-only "Preview as Mermaid draws it" view, opened and closed from the keyboard or pointer, shown beside or instead of the canvas. It MUST be rendered in the browser from the current generated source, update after every committed change, Undo and Redo within the SC-012 time, support zoom, pan and fit-to-view, offer no editing, have an accessible name, and show a rendering failure as an error rather than a stale picture. Sequence and C4 have no preview because their canvas already matches Mermaid's layout.
- **FR-039**: Reordering participants, messages and Dynamic relationships, and placing a new message at a chosen position, MUST be possible both by dragging with a pointer and by move-up / move-down controls usable from the keyboard; each reorder is one undoable operation.

**Changing elements after creation**

- **FR-040**: The user MUST be able to change a type in place within these families, and nowhere else: any flowchart shape to another; any flowchart connection type to another; Participant and Actor; any Sequence message type to another; C4 relationship one-way and two-way; and within each C4 family (Person; System, System database, System queue; Container, Container database, Container queue; Component, Component database, Component queue), each including its external variant, limited to types the diagram's C4 kind offers. A change MUST keep the label, description, technology, connections, position or order, boundary membership and Dynamic number, and is one undoable operation.
- **FR-041**: The user MUST be able to move either end of a flowchart connection, Sequence message or C4 relationship to another element, by drag and by keyboard (FR-019). The connection MUST keep its label, type, technology, direction, order position and Dynamic number; the result is subject to the same rules as creating it (FR-025, FR-028, FR-032); the change is one undoable operation. A Reverse command MUST swap source and target in one undoable operation, keeping everything else; it MUST be unavailable, with an explanation, where swapping changes nothing (a connection from an element to itself, a flowchart plain line or two-way connection, a C4 two-way relationship).

**Keeping diagrams**

- **FR-042**: The editor MUST save the open diagram in the user's browser after every committed change, Undo and Redo, starting at the diagram's first committed change, and MUST show whether the latest change is saved; "saved" MUST be shown only after the save has succeeded.
- **FR-043**: When saving fails or browser storage is unavailable, editing MUST continue, the editor MUST say the diagram is not saved and suggest saving a file, and the failure MUST NOT damage any previously saved diagram.
- **FR-044**: The start screen MUST list saved diagrams, most recently changed first, with name, type (and C4 kind) and last-changed time, and MUST state that diagrams are kept only in this browser and suggest saving files as a backup.
- **FR-045**: Every diagram MUST have a name, defaulting to "Untitled <type>" (for example "Untitled flowchart"), editable while open as one undoable operation, needing at least one visible character, and never written to the generated source. Diagrams with equal names MUST remain distinct.
- **FR-046**: Opening a saved diagram MUST restore exactly what was saved: type and C4 kind, name, C4 title, elements, relationships, labels and details, flowchart positions, Sequence and C4 order, boundary membership and nesting. Undo history MUST start empty.
- **FR-047**: The user MUST be able to delete a saved diagram from the start screen after confirming; deletion is permanent and MUST NOT affect other diagrams.
- **FR-048**: The user MUST be able to save the open diagram to a file in the editor's own format, carrying a format version, offered as a download named after the diagram (with characters unsafe in file names replaced). The editor MUST say the file was offered for download and MUST NOT claim it was stored.
- **FR-049**: The user MUST be able to open a file saved by the editor. The file MUST be validated in full before use; a valid file MUST become a new saved diagram and MUST NOT overwrite an existing one; an invalid, damaged, foreign or newer-format file MUST be refused with an explanation and nothing loaded or saved. Text from a file MUST be shown as text, never interpreted.
- **FR-050**: Saved diagrams and files from an older format version MUST be upgraded on opening without changing the diagram's meaning; a saved diagram that cannot be read MUST be listed as unreadable with an explanation, MUST be deletable, MUST NOT be opened partly, and MUST NOT affect other diagrams.
- **FR-051**: A saved diagram MUST be editable in only one tab at a time. Opening it in another tab MUST say it is open elsewhere and offer "Edit here instead", which loads the latest saved version and makes the previous tab stop editing, explain why, and offer to take it back. A diagram being edited in another tab MUST NOT be deletable. The diagram MUST be released automatically when its editing tab closes or crashes. Two tabs MUST never both save the same diagram.
- **FR-052**: Saved diagrams and files MUST hold the visual model only, never Mermaid source as editable state and never undo history, and MUST stay on the user's device; saving and opening MUST make no network request (FR-021).

### Key Entities

- **Diagram**: one open at a time per tab; has a type (Flowchart, Sequence, or C4 with a kind) fixed at creation; a name (editor-only); optional title (C4 only); last-changed time; holds elements and relationships; has an undo/redo history that lasts while it is open.
- **Saved Diagram**: a Diagram kept in the user's browser, listed on the start screen; may be unreadable (listed, deletable, never opened partly).
- **Diagram File**: a Diagram saved to a file in the editor's own format with a format version; opening one creates a new Saved Diagram.
- **Flowchart Node**: id, shape (one of nine), label (non-empty), canvas position (Flowchart only; Sequence and C4 elements have none).
- **Flowchart Connection**: id, source node, target node (may be equal), line style (solid, dotted, thick), ending (arrow, plain, two-way), optional label.
- **Participant / Actor**: id, display label, left-to-right order position.
- **Message**: id, sender, receiver (may be equal), message type (one of eight), text, top-to-bottom order position.
- **C4 Element**: alias, element type (changeable within its family, FR-040), label, optional description, optional technology, optional boundary membership.
- **C4 Boundary / Deployment Node**: alias, label, kind, contained elements, optional parent boundary or node.
- **C4 Relationship**: source, target, label (non-empty), optional technology, direction (one-way or two-way), sequence number (Dynamic only).
- **Generated Source**: read-only Mermaid text derived from the Diagram; never stored as editable state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can create a two-node, one-connection flowchart and copy valid source in under 3 minutes without help.
- **SC-002**: For each of the 7 diagram kinds (Flowchart, Sequence, five C4 kinds), 100% of generated source for the supported element and relationship combinations is accepted by the Mermaid 12.x parser, except the C4 cases named in FR-013 (empty C4 diagram without a title, empty boundary or Deployment node), which are reported by a notice instead.
- **SC-003**: In every diagram type, 100% of labels containing any of `" ' [ ] ( ) { } < > # ; : | & % /`, backtick, backslash, `%%`, `-->`, the keyword `end`, markdown-like text, line breaks, emoji or non-Latin script produce valid source and display exactly as typed.
- **SC-004**: 100% of committed operations of every kind can be undone and redone, and after each undo or redo the canvas and source agree.
- **SC-005**: Deleting any element never produces a relationship that did not exist before, verified across all diagram types.
- **SC-006**: Every invalid or unavailable operation leaves the diagram unchanged and shows an explanation; no test finds a partial change.
- **SC-007**: Copy Source reports success only when the clipboard holds the current source, and reports failure otherwise, in all supported browsers.
- **SC-008**: Every operation, including adding, connecting, moving and changing types and endpoints, is completable by keyboard alone in every diagram type, and no operation requires dragging.
- **SC-009**: The editor shows no WCAG 2.2 AA failures on the start screen and in each diagram type.
- **SC-010**: After the application has loaded, a full editing session produces zero network requests.
- **SC-011**: Acceptance criteria AC1–AC17 in `setup.md` pass for each supported diagram type, read with that type's own elements and connections.
- **SC-012**: In every diagram type, with up to 100 elements and 150 relationships, each committed edit, Undo or Redo is reflected on the canvas and in the generated source within 1 second on a typical business laptop.
- **SC-013**: In every diagram type, 100% of diagrams whose latest change was reported as saved reopen identical after the browser is closed and reopened, and the save status is shown within 1 second of the change.
- **SC-014**: In every diagram type, saving a diagram to a file and opening that file produces an identical diagram in 100% of cases, and 100% of invalid test files are refused with nothing loaded.
- **SC-015**: When browser storage fails or is unavailable, the editor never reports a diagram as saved, and no previously saved diagram is damaged.
- **SC-016**: Changing a type within its family or moving a connection's end never adds, removes or reattaches any other relationship, verified across all diagram types.

## Assumptions

- Users are business analysts and developers on a desktop browser (current Chromium-based or Firefox); Safari and mobile are out of scope.
- Acceptance criteria AC2–AC17 apply to every type with that type's own elements and connections, as `setup.md` Implementation Guidance states.
- The Business Analyst has decided the shared decisions in `notes.md` sections 1, 2, 2a and 3 and the "core only" scope for Sequence; these are treated as fixed, except where the 2026-10-18 revisions in Clarifications replace them (persistence, changing type and endpoints after creation, discarding on return to the start screen, keyboard scope, and what the flowchart canvas shows). `notes.md` is not updated, and this spec prevails over it.
- Mermaid's C4 support is experimental; rendered C4 may be limited by Mermaid itself.
- Diagrams larger than 100 elements and 150 relationships are not prevented, but no responsiveness target applies to them.
- Persistence was brought into scope by the Business Analyst on 2026-10-18 (setup.md Scope and constitution 1.2.0). Browser storage is per browser profile, typically a few megabytes, and is not encrypted: anyone using the same browser profile can see saved diagrams, and clearing browser data deletes them. Users handle backup and sharing through files.
- Saving to a file uses an ordinary download, which works in both supported browsers; the editor cannot confirm that a download finished.
- Some private-browsing windows offer no lasting storage; this is handled as "storage unavailable" (FR-043).
- Not covered and deferred: duplicating a saved diagram, converting a C4 diagram to another kind, Flowchart subgroups (subgraphs) and direction, Sequence notes and alt/loop blocks, and C4 layout hints. These remain out of the first release unless the Business Analyst decides otherwise.
- Risk for the plan: Mermaid 12.x's C4 syntax may not be able to represent every character SC-003 lists. The plan must check this early and raise any gap with the Business Analyst rather than weaken SC-003.
- The numbered directory `002` is used because `001` is held by the archived flowchart-only attempt.
