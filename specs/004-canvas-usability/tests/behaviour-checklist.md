# Behaviour Checklist: 004-canvas-usability

**Specification**: [spec.md](../spec.md) | **Verification Plan**: [plan.md](../plan.md#verification-plan) | **Tasks**: [tasks.md](../tasks.md)

## US1-AS1

> **Given** a flowchart node, a Sequence participant or actor, a C4 element, a C4 boundary or a Deployment node, **When** the user double-clicks its body or label, **Then** a text editor opens on the canvas at the label's position with the whole current label selected, and no drag, move or line starts.

- **BI-001** Expresses: FR-001, FR-006, US1-AS1. Verified by: VO-001, MV-002.
  - **Given** a flowchart node, a Sequence participant or actor, a C4 element, a C4 boundary or a Deployment node
  - **When** the user double-clicks its body or label
  - **Then** a text editor opens on the canvas at the label's position with the whole current label selected
  - **And** the item's position, order and boundary membership are unchanged and no line is created
  - **And** only the label is offered for editing; a C4 description or technology is not

## US1-AS2

> **Given** the inline editor is open, **When** the user types a new label and presses Enter, **Then** the editor closes, the item shows the new label, and the generated Mermaid source contains it, escaped as the editor spec requires.

- **BI-002** Expresses: FR-002, FR-005, US1-AS2. Verified by: VO-002.
  - **Given** the inline editor is open on a label
  - **When** the user types a new label, including characters such as `"`, `<` and `-->`, and presses Enter
  - **Then** the editor closes and the item shows the new label exactly as typed
  - **And** the generated Mermaid source contains it, escaped as for a Properties panel edit
  - **And** the Properties panel and, for a flowchart, the preview show the new label

## US1-AS3

> **Given** the inline editor is open with changed text, **When** the user presses Escape, **Then** the editor closes, the label shows its previous text, the source is unchanged, and nothing is added to the undo history.

- **BI-003** Expresses: FR-002, US1-AS3, SC-006. Verified by: VO-003.
  - **Given** the inline editor is open with changed text
  - **When** the user presses Escape
  - **Then** the editor closes and the label shows its previous text
  - **And** the source is unchanged and nothing is added to the undo history

## US1-AS4

> **Given** the inline editor is open, **When** the user presses Shift+Enter, **Then** a line break is added to the label at the cursor and the editor stays open.

- **BI-004** Expresses: FR-002, US1-AS4. Verified by: VO-004.
  - **Given** the inline editor is open
  - **When** the user presses Shift+Enter
  - **Then** a line break is added at the cursor and the editor stays open
  - **And** when the label is then committed it has two lines on the canvas and in the source

## US1-AS5

> **Given** the inline editor is open with changed text, **When** the user clicks or taps anywhere outside it other than the toolbar's Undo and Redo, which discard the edit instead (FR-002, EC-03), **Then** the edit is committed as if Enter had been pressed, and the click then does what it would have done anyway (for example, selecting another item).

- **BI-005** Expresses: FR-002, US1-AS5. Verified by: VO-005.
  - **Given** the inline editor is open with changed text
  - **When** the user clicks or taps another item, or presses Tab
  - **Then** the edit is committed as if Enter had been pressed
  - **And** the click then selects the other item, as it would have anyway

## US1-AS6

> **Given** a committed in-place rename, **When** the user invokes Undo, **Then** the previous label is restored on the canvas and in the source in one step; Redo reapplies it in one step.

- **BI-006** Expresses: FR-004, US1-AS6, SC-005. Verified by: VO-006.
  - **Given** a committed in-place rename
  - **When** the user invokes Undo, then Redo
  - **Then** one Undo restores the previous label on the canvas and in the source
  - **And** one Redo reapplies the new label

## US1-AS7

> **Given** the inline editor is open, **When** the user commits text that the Properties panel would reject (for example, an empty or spaces-only node label, Sequence message text or C4 relationship label), **Then** the label keeps its previous text, nothing enters the undo history, and the same explanation the Properties panel gives is shown and announced to screen readers.

- **BI-007** Expresses: FR-004, FR-021, US1-AS7, SC-007. Verified by: VO-007, MV-002.
  - **Given** the inline editor is open on a node label, a Sequence message or a C4 relationship label
  - **When** the user commits empty or spaces-only text, by Enter or by clicking outside
  - **Then** the editor closes and the label keeps its previous text
  - **And** nothing enters the undo history
  - **And** the same explanation the Properties panel gives is shown and announced to screen readers

## US1-AS8

> **Given** a selected item or line with keyboard focus on the canvas, **When** the user presses F2, or presses Enter while it is already selected, **Then** the inline editor opens on its label exactly as a double-click would.

- **BI-008** Expresses: FR-003, US1-AS8, EC-09, EC-14. Verified by: VO-008.
  - **Given** keyboard focus is on an item or line on the canvas
  - **When** the user presses Enter while it is not selected, then Enter again, or presses F2 while it is selected
  - **Then** the first Enter only selects it
  - **And** the second Enter, or F2, opens the inline editor on its label exactly as a double-click would
  - **And** focus does not move to the Properties panel

## US1-AS9

> **Given** the inline editor is open, **When** the user commits text identical to the current label, **Then** the editor closes and nothing enters the undo history.

- **BI-009** Expresses: FR-004, US1-AS9. Verified by: VO-009.
  - **Given** the inline editor is open
  - **When** the user commits text identical to the current label
  - **Then** the editor closes and nothing enters the undo history

## US2-AS1

> **Given** a line with a label, **When** the user double-clicks the line or its label, **Then** the inline editor opens at the label's position with the label selected.

- **BI-010** Expresses: FR-001, US2-AS1. Verified by: VO-010.
  - **Given** a labelled flowchart connection, Sequence message or C4 relationship
  - **When** the user double-clicks the line or its label
  - **Then** the inline editor opens at the label's position with the label selected

## US2-AS2

> **Given** a flowchart connection with no label, **When** the user double-clicks it, **Then** the inline editor opens empty at the middle of the line; committing non-empty text gives the connection that label in one undoable step, and committing empty text leaves the connection unlabelled with nothing added to the undo history.

- **BI-011** Expresses: FR-001, US2-AS2. Verified by: VO-011.
  - **Given** a flowchart connection with no label
  - **When** the user double-clicks it
  - **Then** the inline editor opens empty at the middle of the line
  - **And** committing "Yes" gives the connection that label in one undoable step and the source shows it
  - **And** committing empty text leaves the connection unlabelled with nothing added to the undo history

## US2-AS3

> **Given** a flowchart connection with a label, **When** the user clears the text in the inline editor and commits it, **Then** the label is removed, as the Properties panel allows for flowchart connections (editor spec, FR-026).

- **BI-012** Expresses: FR-004, US2-AS3. Verified by: VO-012.
  - **Given** a flowchart connection with a label
  - **When** the user clears the text in the inline editor and commits it
  - **Then** the label is removed from the canvas and the source

## US2-AS4

> **Given** a Sequence message or a C4 relationship, **When** the user commits empty or spaces-only text, **Then** the change is rejected with the Properties panel's explanation and the previous text remains (editor spec, FR-028, FR-032).

- **BI-013** Expresses: FR-004, US2-AS4. Verified by: VO-013.
  - **Given** a Sequence message or a C4 relationship
  - **When** the user commits empty or spaces-only text in place
  - **Then** the change is rejected with the Properties panel's explanation and the previous text remains

## US2-AS5

> **Given** a line, **When** the user double-clicks one of its end handles, **Then** the inline editor does not open and the end does not move.

- **BI-014** Expresses: FR-006, US2-AS5. Verified by: VO-014.
  - **Given** a selected line
  - **When** the user double-clicks one of its end handles
  - **Then** the inline editor does not open and the end does not move

## US3-AS1

> **Given** the pointer rests over an item's body, **When** the user looks at the canvas, **Then** the pointer shows a move cursor, the item shows a subtle hover outline distinct from the selection outline, and the item's connection handles appear.

- **BI-015** Expresses: FR-009, FR-013, US3-AS1. Verified by: VO-015, MV-003.
  - **Given** the pointer rests over an item's body
  - **When** the user looks at the canvas
  - **Then** the pointer shows a move cursor
  - **And** the item shows a subtle hover outline that differs from the selection outline in width or pattern
  - **And** the item's connection handles appear

## US3-AS2

> **Given** the pointer rests over a connection handle, **When** the user looks at the canvas, **Then** the pointer shows a crosshair cursor and that handle is enlarged or highlighted.

- **BI-016** Expresses: FR-013, US3-AS2. Verified by: VO-016.
  - **Given** the pointer rests over a connection handle
  - **When** the user looks at the canvas
  - **Then** the pointer shows a crosshair cursor and that handle is enlarged or highlighted

## US3-AS3

> **Given** an item, **When** the user presses on its body and drags, **Then** the item moves as its view allows, and no line is created, whatever the item is released over.

- **BI-017** Expresses: FR-014, US3-AS3, SC-001. Verified by: VO-017.
  - **Given** an item in any view
  - **When** the user presses on its body and drags, releasing over empty canvas, another item's body or another item's handle
  - **Then** the item moves as its view allows (flowchart position, Sequence order, C4 boundary membership or Deployment parent)
  - **And** no line is created, whatever the item is released over
  - **And** where the drag can change nothing, the diagram and the undo history are unchanged

## US3-AS4

> **Given** an item, **When** the user presses on a connection handle and drags, **Then** a preview line follows the pointer from that handle, and the item does not move.

- **BI-018** Expresses: FR-015, FR-017, US3-AS4, SC-001. Verified by: VO-018.
  - **Given** an item in any view
  - **When** the user presses on a connection handle and drags
  - **Then** a preview line follows the pointer from that handle
  - **And** the item does not move

## US3-AS5

> **Given** a line is being drawn, **When** the user releases over empty canvas, outside the canvas, or over something that cannot be its other end, or presses Escape, **Then** the preview disappears, no line is created, nothing else changes, and nothing enters the undo history.

- **BI-019** Expresses: FR-017, US3-AS5, SC-006. Verified by: VO-019.
  - **Given** a line is being drawn
  - **When** the user releases over empty canvas, outside the canvas, or over something that cannot be its other end such as a C4 boundary, or presses Escape
  - **Then** the preview disappears and no line is created
  - **And** nothing else changes and nothing enters the undo history

## US3-AS6

> **Given** an item in any view, **When** every point inside the item's outline and its handles' hit areas is tested, **Then** each point belongs to exactly one zone, body or connection handle; the label is part of the body.

- **BI-020** Expresses: FR-016, US3-AS6, SC-004, EC-11. Verified by: VO-020.
  - **Given** an item in any view, including C4 boxes nested inside a boundary
  - **When** every point inside the item's outline and its handles' hit areas is tested
  - **Then** each point belongs to exactly one zone, body or connection handle, and the label is part of the body
  - **And** the cursor shown at each point matches what a drag starting there does
  - **And** inside nested boxes the innermost item owns the point

## US3-AS7

> **Given** a C4 element or Deployment node, **When** the user drags its body into a boundary, over another element inside a boundary, or onto another Deployment node, **Then** its membership or parent changes to the innermost boundary or node that contains the release point, as the editor spec allows (FR-034), and no relationship is created. Today the same gesture on an element does either, depending on where it is released (on a boundary it moves the element, on another element it draws a relationship); that behaviour is replaced.

- **BI-021** Expresses: FR-014, US3-AS7. Verified by: VO-021.
  - **Given** a C4 element or Deployment node
  - **When** the user drags its body into a boundary, over another element inside a boundary, or onto another Deployment node
  - **Then** its membership or parent changes to the boundary or node that contains the release point
  - **And** no relationship is created

## US4-AS1

> **Given** any connection handle or end handle, **When** its hit area is measured on screen, **Then** it is at least 24×24 px at every zoom level, even where the visible dot is smaller; where an item is too small on screen for its body and handles to sit side by side, its handles are hidden instead (FR-010).

- **BI-022** Expresses: FR-010, FR-018, US4-AS1, SC-002, EC-12. Verified by: VO-022, VO-036.
  - **Given** any connection handle or end handle, at the smallest, default and largest zoom level
  - **When** its hit area is measured on screen
  - **Then** it is at least 24×24 px, even where the visible dot is smaller
  - **And** where an item is too small on screen for its body and handles to sit side by side, its connection handles are hidden instead
  - **And** such an item still moves by its body, still accepts a line drawn to it, and its description still offers the Connect command

## US4-AS2

> **Given** an item at rest that is neither hovered nor selected, **When** the user looks at the canvas, **Then** its connection handles are hidden; they become visible when the pointer is over the item or the item is selected.

- **BI-023** Expresses: FR-009, US4-AS2. Verified by: VO-023.
  - **Given** an item at rest that is neither hovered nor selected
  - **When** the user looks at the canvas
  - **Then** its connection handles are hidden
  - **And** they become visible, with a dot at least 16 px across at 100% zoom, when the pointer is over the item or the item is selected

## US4-AS3

> **Given** a line is being drawn, **When** the user drags, **Then** every item that could be its other end is highlighted, items that could not be are not highlighted and give no snap feedback, and the item or handle under the pointer is marked as the drop target in a way distinct from the other highlighted targets.

- **BI-024** Expresses: FR-011, US4-AS3. Verified by: VO-024, VO-052.
  - **Given** a line is being drawn
  - **When** the user drags
  - **Then** every item that could be its other end is highlighted
  - **And** items that could not be, such as C4 boundaries, are not highlighted and give no snap feedback
  - **And** the item or handle under the pointer is marked as the drop target in a way distinct from the other highlighted targets

## US4-AS4

> **Given** a line is being drawn, **When** the user releases over a valid target's body or any of its handles, **Then** the line is created to that item in one undoable step, the generated source contains it, and the new line gets the type a drag gives it today: in a flowchart, the connection type armed in the toolbox (or the default); in a sequence diagram, a solid arrow; in C4, a one-way relationship.

- **BI-025** Expresses: FR-011, FR-015, US4-AS4. Verified by: VO-025.
  - **Given** a line is being drawn
  - **When** the user releases over a valid target's body or any of its handles
  - **Then** the line is created to that item in one undoable step and the generated source contains it
  - **And** the line gets the type a drag gives it: the armed connection type or a solid arrow in a flowchart, a solid arrow in a sequence diagram, a one-way relationship labelled "Uses" in C4

## US4-AS5

> **Given** a line is being drawn from an item, **When** the pointer returns over the same item, **Then** it is marked as a valid target where the view allows a line to itself (a flowchart self-loop, a Sequence self-message), and releasing there creates that line.

- **BI-026** Expresses: FR-011, US4-AS5, EC-02. Verified by: VO-026.
  - **Given** a line is being drawn from an item
  - **When** the pointer returns over the same item's body or handle and is released
  - **Then** the item is marked as a valid target
  - **And** a line to itself is created: a flowchart self-loop, a Sequence self-message or a C4 relationship to itself

## US5-AS1

> **Given** touch or pen input, **When** the user presses and drags an item's body or a handle, **Then** the result is the same as with a mouse (Story 3).

- **BI-027** Expresses: FR-019, US5-AS1. Verified by: VO-027, MV-001.
  - **Given** touch or pen input
  - **When** the user presses and drags an item's body or a handle
  - **Then** the result is the same as with a mouse: the body moves the item and the handle draws a line

## US5-AS2

> **Given** touch input, which has no hover, **When** the user taps an item, **Then** it is selected and its connection handles become visible, so they can be dragged next.

- **BI-028** Expresses: FR-019, US5-AS2. Verified by: VO-028, MV-001.
  - **Given** touch input, which has no hover
  - **When** the user taps an unselected item
  - **Then** it is selected and its connection handles become visible, so they can be dragged next

## US5-AS3

> **Given** touch or pen input, **When** the user double-taps an item or a line, **Then** the inline editor opens as for a double-click.

- **BI-029** Expresses: FR-019, US5-AS3. Verified by: VO-029, MV-001.
  - **Given** touch or pen input
  - **When** the user double-taps an item or a line
  - **Then** the inline editor opens as for a double-click

## US5-AS4

> **Given** a screen reader, **When** focus reaches an item, **Then** its accessible description tells the user it can be dragged to move, that its handles can be dragged to connect, and that F2 renames it, along with the existing keyboard alternatives (move keys, Connect command).

- **BI-030** Expresses: FR-020, US5-AS4. Verified by: VO-030, MV-002.
  - **Given** a screen reader
  - **When** focus reaches an item
  - **Then** its accessible description says it can be dragged to move, that its handles can be dragged to connect, and that F2 renames it
  - **And** it names the keyboard alternatives (move keys, Connect command)
  - **And** each handle's accessible name says it is dragged to connect

## US5-AS5

> **Given** the inline editor opens, **When** a screen reader is running, **Then** focus moves into the editor, it is announced as editing the label of the named item, and when it closes focus returns to that item.

- **BI-031** Expresses: FR-021, US5-AS5. Verified by: VO-031, MV-002.
  - **Given** a screen reader is running
  - **When** the inline editor opens and then closes
  - **Then** focus moves into the editor, which is announced as editing the label of the named item or line
  - **And** when it closes, focus returns to that item or line

## Other behaviours

- **BI-032** Expresses: FR-008. Verified by: VO-032, VO-033.
  - **Given** two flowchart nodes
  - **When** a line is drawn from any of a node's four side handles to any side of the other, and a node is then moved
  - **Then** every side handle can start and receive a line
  - **And** the line is drawn between the sides of the two nodes that face each other, and is redrawn when a node moves
  - **And** a C4 boundary offers no connection handles

- **BI-033** Expresses: FR-008. Verified by: VO-033.
  - **Given** a flowchart whose lines were drawn from different sides
  - **When** it is saved to a file and opened again
  - **Then** the reopened diagram is identical and the file holds no handle side and the current format version

- **BI-034** Expresses: FR-012, FR-016. Verified by: VO-034, VO-035.
  - **Given** a sequence diagram with messages
  - **When** the pointer rests on a lifeline, and a message is drawn and released between two existing messages
  - **Then** a visible hint says that dragging to another lifeline, or back to the same one, adds a message
  - **And** an insertion marker shows the gap the message will land in and follows the pointer's height
  - **And** the new message lands in that gap, or at the end when released below the last message
  - **And** across a message row the lifeline offers no connect zone; a drag there reorders the message

- **BI-035** Expresses: FR-012. Verified by: VO-035.
  - **Given** a sequence diagram with a message selected
  - **When** a message is added from the keyboard or the toolbox
  - **Then** it goes after the selected message, as before this feature

- **BI-036** Expresses: FR-006, EC-01. Verified by: VO-037, VO-038.
  - **Given** an item in any view
  - **When** the user double-clicks it without moving the pointer, or presses and moves the pointer 3 px before releasing
  - **Then** the double-click opens the inline editor and moves nothing
  - **And** the small movement is a click: the item is selected, nothing moves and no line is created

- **BI-037** Expresses: FR-007, EC-07. Verified by: VO-039.
  - **Given** the inline editor is open
  - **When** the user pastes formatted text with line breaks
  - **Then** no formatting control is offered
  - **And** the label holds the pasted characters and line breaks as plain text

- **BI-038** Expresses: FR-016. Verified by: VO-040.
  - **Given** a selected line whose end handle covers a connection handle of the item it joins
  - **When** the user presses there and drags
  - **Then** the line's end moves; the connection handle under the end handle is hidden while the line is selected
  - **And** the item's other connection handles still draw new lines

- **BI-039** Expresses: FR-018. Verified by: VO-041.
  - **Given** a Sequence message, a C4 Dynamic relationship and a selected line
  - **When** the message or relationship is dragged to a new place, and an end handle is dragged to another item
  - **Then** the order or the end changes as before this feature, each in one undo step

- **BI-040** Expresses: FR-022, SC-008. Verified by: VO-042, MV-003.
  - **Given** any view with handles visible, a line being drawn, or the inline editor open
  - **When** it is checked against WCAG 2.2 AA
  - **Then** no violation is found
  - **And** the hover outline, handle markers and target marks have contrast of at least 3:1
  - **And** the drop target is told apart from the other valid targets by more than colour

- **BI-041** Expresses: FR-023, SC-009, EC-15. Verified by: VO-043, VO-053.
  - **Given** the editor after this feature
  - **When** the existing acceptance tests for AC1–AC17 are run, and a label typed in the Properties panel is left by moving focus away
  - **Then** every acceptance criterion passes in every view, with no existing test weakened, skipped or removed
  - **And** the Properties panel keeps its fields and keeps the unconfirmed label as a draft when focus leaves it

- **BI-042** Expresses: FR-002, EC-03. Verified by: VO-044.
  - **Given** the inline editor is open with changed text
  - **When** the user presses Ctrl+Z inside it, then uses the toolbar's Undo or Redo
  - **Then** Ctrl+Z undoes typing only
  - **And** the toolbar control discards the uncommitted text and then undoes or redoes one diagram step, leaving no partial change

- **BI-043** Expresses: FR-001, EC-04. Verified by: VO-045.
  - **Given** the inline editor is open
  - **When** the user zooms or pans, even until the label leaves the visible area
  - **Then** the editor stays on its label, open, with its text

- **BI-044** Expresses: FR-004, EC-05. Verified by: VO-046.
  - **Given** the inline editor holds uncommitted text
  - **When** another tab takes over editing the diagram
  - **Then** the edit is dropped and nothing is committed

- **BI-045** Expresses: FR-002, EC-06. Verified by: VO-047.
  - **Given** the inline editor holds uncommitted text
  - **When** the user reloads or leaves the page
  - **Then** the browser asks for confirmation first

- **BI-046** Expresses: FR-001, EC-08. Verified by: VO-048.
  - **Given** any view
  - **When** the user double-clicks empty canvas
  - **Then** nothing is created, selected or edited, and the zoom does not change

- **BI-047** Expresses: FR-001, EC-10. Verified by: VO-049.
  - **Given** a long, multi-line label
  - **When** it is edited in place
  - **Then** the editor grows to fit the text without covering the canvas more than the label itself would

- **BI-048** Expresses: FR-011, EC-13. Verified by: VO-050.
  - **Given** a selected line and a new line being drawn
  - **When** the new line is released over the selected line's end handle
  - **Then** the new line ends at the item that end belongs to

- **BI-049** Expresses: FR-003, SC-003. Verified by: VO-051.
  - **Given** an item or line on the canvas
  - **When** the user renames it by double-click, typing and Enter
  - **Then** the new label reaches the source in under 5 seconds from the double-click, without the Properties panel being used
