# Feature Specification: Canvas Usability (In-Place Label Editing, Larger Handles, Move Versus Connect)

**Feature Branch**: `main` (no new branch was created; the spec directory and the branch are independent)

**Created**: 2026-10-20

**Status**: Draft

**Grilled on**: 2026-10-20

**Input**: User description: "Canvas usability: in-place label editing, bigger connection handles, and a clear split between moving an item and drawing a line" (full text kept in the session record). Problem: people can't tell whether a press-and-drag will move an item or start a new line between items, the points a line is dragged from are small and hard to hit, and renaming an item or a line means going to the Properties panel. Scope: the flowchart, C4 and sequence views. Out of scope: rich-text formatting in labels, new shape types, changes to the Properties panel.

**Builds on**: `specs/002-visual-diagram-editor/spec.md` (referred to below as "the editor spec"). Its rules on labels (FR-006), undo (FR-008), validation (FR-009), keyboard access (FR-019), accessibility (FR-020) and order-driven layout for Sequence and C4 (FR-038) apply here unchanged unless stated otherwise.

## Clarifications

### Session 2026-10-20

- Q: Must the 24×24 px handle hit area hold at every zoom level, or only at 100% zoom and above? → A: At every zoom level. Handles keep their on-screen size; when an item is too small on screen to fit its body and handles side by side, its handles are hidden and the user zooms in or uses the Connect command. *(Confirmed by the Business Analyst.)*
- Q: Which flowchart handles exist, and which sides does a finished line attach to? → A: A handle on each of the four sides, each able to start and receive a line; a line is drawn between the nearest sides of its two nodes, recalculated as nodes move, and no side is saved. *(Confirmed by the Business Analyst.)*
- Q: Where is a Sequence message dragged from? → A: The participant's lifeline is its connection handle (the header box is its body), keeping placement by release height, with more feedback on what the lifeline can do: a visible hint on hover that dragging adds a message, and an insertion marker while drawing that shows where in the order the message will land. *(Confirmed by the Business Analyst.)*
- Q: When a selected line's end handle sits on an item's connection handle, which wins? → A: The end handle; the connection handle under it is hidden while the line is selected, and the item's other handles still work. *(Confirmed by the Business Analyst.)*
- Q: What happens when the user clicks outside the inline editor holding text that would be rejected? → A: The editor closes, the previous label stays, the explanation is shown, and the click still does what it would otherwise do; Enter on invalid text behaves the same. *(Confirmed by the Business Analyst.)*
- Q: What do the toolbar's Undo and Redo controls do while the inline editor is open? → A: They discard the uncommitted text, as Escape does, and then undo or redo on the diagram; this is the one exception to "a click outside commits". *(Confirmed by the Business Analyst.)*
- Q: How is "users can tell moving from connecting" verified? → A: By an automated check that every point shows exactly one cursor and hint matching what a drag there does; a study with at least 5 first-time users follows as a recommended follow-up after release and does not block it. *(Confirmed by the Business Analyst.)*
- Q: Should a source view that accepts pasted Mermaid diagrams, with the copy and save controls moved into it, be part of this feature? → A: No. It is a separate future feature, to be specified after the Business Analyst amends `setup.md` and the constitution, which currently exclude importing Mermaid source; this spec proceeds as it is. *(Confirmed by the Business Analyst.)*
- Q (analysis): When a C4 element's body is dropped on another element inside a boundary, what happens? → A: It moves into the innermost boundary or node that contains the release point, and no relationship is created. *(Confirmed by the Business Analyst.)*
- Q: Should a message drawn between lifelines land in the order where it is released, rather than after the selected message as today? → A: Yes, at the release height, as the insertion marker shows; this is new behaviour (today a dragged message goes after the selected message or at the end, which the earlier answer wrongly called existing). Keyboard and toolbox adding keep today's rule. *(Confirmed by the Business Analyst.)*
- Q: Where a message's line crosses a lifeline, does a drag there reorder the message or start a new message? → A: The message owns its whole row and a drag there reorders it; the lifeline's connect zone pauses across message rows. *(Confirmed by the Business Analyst.)*
- Q: When an item is neither hovered nor selected, are its connection handles hidden or faint? → A: Hidden; they show when the pointer is over the item or the item is selected. *(Confirmed by the Business Analyst.)*

## Vocabulary

So the requirements read the same way across the three views:

- **Item**: anything on the canvas that has a label and can be an end of a line. In a flowchart, a node. In a sequence diagram, a participant or actor. In C4, an element or a Deployment node. C4 boundaries have labels and can be moved, but are never line ends (editor spec, Clarifications), so they have a body and no connection handles.
- **Line**: a flowchart connection, a Sequence message or a C4 relationship.
- **Body**: the part of an item that moves it when dragged.
- **Connection handle**: the part of an item that starts a new line when dragged. For a Sequence participant or actor, the handle is its lifeline (see FR-012).
- **End handle**: the grip shown at each end of a selected line, which moves that end to another item (editor spec, FR-041).
- **Moving** an item means what dragging already means in each view. In a flowchart it changes the node's position. In a sequence diagram it changes the participant's place in the order. In C4 it changes the element's boundary or the Deployment node's parent (editor spec, FR-034, FR-038, FR-039).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rename an item or a line where it sits (Priority: P1)

A user wants to change the text of a node, participant, C4 element, boundary or line. They double-click it (or select it and press F2 or Enter), type the new text in an editor that opens on the label, and press Enter. The canvas and the generated Mermaid source update together, as one undoable step. They never leave the canvas.

**Why this priority**: Renaming is the most frequent edit after adding an item, and today it always means a trip to the Properties panel. This story removes the most repeated detour in everyday use.

**Independent Test**: In each of the three views, double-click an item, type a new label, press Enter, and check the canvas and the source. Then double-click again, type, press Escape, and check that neither changed. Undo the first rename in one step.

**Acceptance Scenarios**:

1. **Given** a flowchart node, a Sequence participant or actor, a C4 element, a C4 boundary or a Deployment node, **When** the user double-clicks its body or label, **Then** a text editor opens on the canvas at the label's position with the whole current label selected, and no drag, move or line starts.
2. **Given** the inline editor is open, **When** the user types a new label and presses Enter, **Then** the editor closes, the item shows the new label, and the generated Mermaid source contains it, escaped as the editor spec requires.
3. **Given** the inline editor is open with changed text, **When** the user presses Escape, **Then** the editor closes, the label shows its previous text, the source is unchanged, and nothing is added to the undo history.
4. **Given** the inline editor is open, **When** the user presses Shift+Enter, **Then** a line break is added to the label at the cursor and the editor stays open.
5. **Given** the inline editor is open with changed text, **When** the user clicks or taps anywhere outside it other than the toolbar's Undo and Redo, which discard the edit instead (FR-002, EC-03), **Then** the edit is committed as if Enter had been pressed, and the click then does what it would have done anyway (for example, selecting another item).
6. **Given** a committed in-place rename, **When** the user invokes Undo, **Then** the previous label is restored on the canvas and in the source in one step; Redo reapplies it in one step.
7. **Given** the inline editor is open, **When** the user commits text that the Properties panel would reject (for example, an empty or spaces-only node label, Sequence message text or C4 relationship label), **Then** the label keeps its previous text, nothing enters the undo history, and the same explanation the Properties panel gives is shown and announced to screen readers.
8. **Given** a selected item or line with keyboard focus on the canvas, **When** the user presses F2, or presses Enter while it is already selected, **Then** the inline editor opens on its label exactly as a double-click would.
9. **Given** the inline editor is open, **When** the user commits text identical to the current label, **Then** the editor closes and nothing enters the undo history.

---

### User Story 2 - Name a line in place (Priority: P1)

A user double-clicks a line to give it a label or change the one it has. For a flowchart connection with no label, this creates one at the middle of the line.

**Why this priority**: Labels on decision branches ("Yes", "No") and on messages and relationships carry much of a diagram's meaning, and lines are the hardest things to reach through the Properties panel.

**Independent Test**: Double-click an unlabelled flowchart connection, type "Yes", press Enter; the label appears on the line and in the source. Double-click a Sequence message and a C4 relationship and change their text the same way.

**Acceptance Scenarios**:

1. **Given** a line with a label, **When** the user double-clicks the line or its label, **Then** the inline editor opens at the label's position with the label selected.
2. **Given** a flowchart connection with no label, **When** the user double-clicks it, **Then** the inline editor opens empty at the middle of the line; committing non-empty text gives the connection that label in one undoable step, and committing empty text leaves the connection unlabelled with nothing added to the undo history.
3. **Given** a flowchart connection with a label, **When** the user clears the text in the inline editor and commits it, **Then** the label is removed, as the Properties panel allows for flowchart connections (editor spec, FR-026).
4. **Given** a Sequence message or a C4 relationship, **When** the user commits empty or spaces-only text, **Then** the change is rejected with the Properties panel's explanation and the previous text remains (editor spec, FR-028, FR-032).
5. **Given** a line, **When** the user double-clicks one of its end handles, **Then** the inline editor does not open and the end does not move.

---

### User Story 3 - Tell moving apart from connecting before pressing (Priority: P1)

A user points at an item and can see, before pressing anything, what a drag will do. Over the body, a move cursor and a subtle outline say "drag to move". Over a connection handle, a crosshair cursor and an enlarged handle say "drag to connect". Dragging from the body always moves the item, and dragging from a handle always starts a line. No spot does both.

**Why this priority**: This is the core problem the feature was raised for. Without a reliable split, users create lines they did not intend, or move items they meant to connect, and undo becomes the main way of working.

**Independent Test**: In each view, drag an item by its body and confirm it moved (position, order or boundary, by view) and no line was created. Drag from one of its handles to another item and confirm a line was created and the source item did not move. Probe the boundary between body and handle and confirm every point does exactly one of the two.

**Acceptance Scenarios**:

1. **Given** the pointer rests over an item's body, **When** the user looks at the canvas, **Then** the pointer shows a move cursor, the item shows a subtle hover outline distinct from the selection outline, and the item's connection handles appear.
2. **Given** the pointer rests over a connection handle, **When** the user looks at the canvas, **Then** the pointer shows a crosshair cursor and that handle is enlarged or highlighted.
3. **Given** an item, **When** the user presses on its body and drags, **Then** the item moves as its view allows, and no line is created, whatever the item is released over.
4. **Given** an item, **When** the user presses on a connection handle and drags, **Then** a preview line follows the pointer from that handle, and the item does not move.
5. **Given** a line is being drawn, **When** the user releases over empty canvas, outside the canvas, or over something that cannot be its other end, or presses Escape, **Then** the preview disappears, no line is created, nothing else changes, and nothing enters the undo history.
6. **Given** an item in any view, **When** every point inside the item's outline and its handles' hit areas is tested, **Then** each point belongs to exactly one zone, body or connection handle; the label is part of the body.
7. **Given** a C4 element or Deployment node, **When** the user drags its body into a boundary, over another element inside a boundary, or onto another Deployment node, **Then** its membership or parent changes to the innermost boundary or node that contains the release point, as the editor spec allows (FR-034), and no relationship is created. Today the same gesture on an element does either, depending on where it is released (on a boundary it moves the element, on another element it draws a relationship); that behaviour is replaced.

---

### User Story 4 - Hit connection handles easily and see where a line will land (Priority: P2)

A user starting a line finds the handles easy to hit. While dragging, every item the line could end on is highlighted, and the one under the pointer is clearly marked as the drop target.

**Why this priority**: Larger handles and clear drop targets turn connecting from a precision task into a routine one. It builds on Story 3's split, so it comes after it.

**Independent Test**: Measure every connection handle's and end handle's hit area at the smallest, default and largest zoom levels. Start a line in each view and check that valid targets are highlighted, invalid ones are not, and the target under the pointer is marked.

**Acceptance Scenarios**:

1. **Given** any connection handle or end handle, **When** its hit area is measured on screen, **Then** it is at least 24×24 px at every zoom level, even where the visible dot is smaller; where an item is too small on screen for its body and handles to sit side by side, its handles are hidden instead (FR-010).
2. **Given** an item at rest that is neither hovered nor selected, **When** the user looks at the canvas, **Then** its connection handles are hidden; they become visible when the pointer is over the item or the item is selected.
3. **Given** a line is being drawn, **When** the user drags, **Then** every item that could be its other end is highlighted, items that could not be are not highlighted and give no snap feedback, and the item or handle under the pointer is marked as the drop target in a way distinct from the other highlighted targets.
4. **Given** a line is being drawn, **When** the user releases over a valid target's body or any of its handles, **Then** the line is created to that item in one undoable step, the generated source contains it, and the new line gets the type a drag gives it today: in a flowchart, the connection type armed in the toolbox (or the default); in a sequence diagram, a solid arrow; in C4, a one-way relationship.
5. **Given** a line is being drawn from an item, **When** the pointer returns over the same item, **Then** it is marked as a valid target where the view allows a line to itself (a flowchart self-loop, a Sequence self-message), and releasing there creates that line.

---

### User Story 5 - Same behaviour with touch, pen and assistive technology (Priority: P3)

A user on a touchscreen laptop, or with a pen, gets the same split between moving and connecting and the same in-place editing. A screen reader user hears what each part of an item does.

**Why this priority**: It extends Stories 1–4 to other inputs. Keyboard access to every operation already exists (editor spec, FR-019), so this story carries no new capability, only parity.

**Independent Test**: With touch input, select an item with a tap, drag its body (moves), drag a handle (draws a line) and double-tap its label (opens the editor). With a screen reader, focus an item and confirm its description mentions moving, connecting and renaming.

**Acceptance Scenarios**:

1. **Given** touch or pen input, **When** the user presses and drags an item's body or a handle, **Then** the result is the same as with a mouse (Story 3).
2. **Given** touch input, which has no hover, **When** the user taps an item, **Then** it is selected and its connection handles become visible, so they can be dragged next.
3. **Given** touch or pen input, **When** the user double-taps an item or a line, **Then** the inline editor opens as for a double-click.
4. **Given** a screen reader, **When** focus reaches an item, **Then** its accessible description tells the user it can be dragged to move, that its handles can be dragged to connect, and that F2 renames it, along with the existing keyboard alternatives (move keys, Connect command).
5. **Given** the inline editor opens, **When** a screen reader is running, **Then** focus moves into the editor, it is announced as editing the label of the named item, and when it closes focus returns to that item.

---

### Edge Cases

- EC-01: A double-click with no pointer movement between the presses never starts a drag, a move or a line. A press followed by movement smaller than the drag threshold is treated as a click, not a drag.
- EC-02: A drag that starts on the body and ends on another item's handle still moves the item; a drag that starts on a handle and ends on the source item's own body is treated as a line to itself (Story 4, scenario 5), which all three views allow.
- EC-03: While the inline editor is open, the diagram's Undo and Redo shortcuts act on the text being typed, not on the diagram. Using the toolbar's Undo or Redo control while the editor is open first discards the uncommitted text (as Escape does), then performs the Undo or Redo, so no partial change is left behind (editor spec, EC-08).
- EC-04: While the inline editor is open, zooming or panning keeps the editor on its label; if the label leaves the visible area, the editor stays open with its text.
- EC-05: If the item being edited is removed while the editor is open (for example, another tab takes over editing, editor spec FR-051), the edit is dropped and nothing is committed.
- EC-06: Leaving the page while the inline editor holds uncommitted text asks for confirmation, as a label edit in progress already does (editor spec, FR-018).
- EC-07: Pasted text keeps its characters but loses any formatting; line breaks in pasted text are kept, since all labels allow multiple lines (editor spec, FR-006).
- EC-08: Double-clicking empty canvas does nothing: it neither creates an item nor zooms.
- EC-09: Pressing Enter on an item that is focused but not yet selected selects it, as today; only a second Enter, or F2, opens the editor.
- EC-10: A long or multi-line label grows the editor to fit, without covering the rest of the canvas more than the label itself would.
- EC-11: Two items overlapping on screen (possible in C4, where a boundary contains its elements): the innermost item under the pointer owns the pointer, so an element inside a boundary shows its own zones, not the boundary's.
- EC-12: An item too small on screen to fit its handles beside its body (for example, at a low zoom level) shows no connection handles and cannot start a line by drag; its body still moves it, and it can still be a drop target for a line drawn from another item. Zooming in brings its handles back.
- EC-13: A drag from a handle that is released over the selected line's end handle is treated as a release over the item that end belongs to.
- EC-14: Renaming in place via F2 replaces F2's current job of moving focus to the label field in the Properties panel; the Properties panel itself is unchanged and still edits labels.
- EC-15: The Properties panel keeps an unconfirmed label as a draft when focus leaves it; the inline editor differs by committing when the user clicks outside it (FR-002). This difference is intended and the Properties panel is not changed to match.

## Requirements *(mandatory)*

### Functional Requirements

**In-place label editing**

- **FR-001**: Double-clicking (or double-tapping) an item's body or label, or a line or its label, MUST open an inline text editor on the canvas at the label's position, with the whole current label selected. For a flowchart connection with no label, the editor MUST open empty at the middle of the line. C4 boundaries MUST be editable this way. Only the label is edited in place; a C4 description or technology stays in the Properties panel.
- **FR-002**: In the inline editor, Enter MUST commit, Shift+Enter MUST insert a line break, Escape MUST cancel and restore the previous text, and a click or tap outside the editor MUST commit, except on the toolbar's Undo and Redo controls, which MUST discard the uncommitted text first (EC-03). Moving keyboard focus out of the editor (for example with Tab) MUST commit.
- **FR-003**: F2 on the focused item or line, or Enter on an item or line that is already selected, MUST open the inline editor exactly as a double-click does.
- **FR-004**: A committed in-place edit MUST follow the same rules as the Properties panel: the same validation and explanations (editor spec, FR-006, FR-026, FR-028, FR-032), the same accepted characters and escaping, and one undoable operation per committed edit. A rejected edit MUST leave the previous label, add nothing to the undo history, close the editor and show the explanation, whether it was committed by Enter, by moving focus or by a click or tap outside; a click or tap outside then still does what it would otherwise do (for example, selecting another item). Committing unchanged text MUST add nothing to the undo history.
- **FR-005**: After a committed in-place edit, the canvas, the generated Mermaid source and, where open, the Properties panel and the flowchart preview MUST all show the new label (editor spec, FR-012).
- **FR-006**: A double-click or double-tap MUST NOT also start a drag, move an item, create a line or move a line's end.
- **FR-007**: The inline editor MUST show plain text only; no formatting controls are offered.

**Connection handles**

- **FR-008**: Every item in the three views MUST offer connection handles from which a new line can be dragged. In a flowchart, each node MUST offer a handle on each of its four sides, and any handle MUST be able to start a line and to receive one (today the top handle only receives and the bottom handle only starts). A flowchart line MUST be drawn between the nearest sides of its two nodes, recalculated whenever either node moves; the handle it was drawn from or dropped on is not kept. C4 boundaries MUST NOT offer connection handles.
- **FR-009**: Connection handles MUST be visibly larger than today's (a visible marker at least 16 px across at 100% zoom; today's are 14 px in Sequence and C4 and smaller in the flowchart), and MUST be hidden when the item is neither hovered nor selected, becoming visible when the pointer is over the item or the item is selected. While a line is being drawn, target highlighting follows FR-011.
- **FR-010**: Every connection handle and end handle MUST have a hit area of at least 24×24 px on screen at every zoom level, whatever the size of its visible marker; handles keep their on-screen size as the user zooms. Where an item is too small on screen for its body and its handles to sit side by side without overlapping (FR-016), its connection handles MUST be hidden; the user zooms in, or uses the Connect command (editor spec, FR-019). Its accessible description MUST still offer the Connect command.
- **FR-011**: While a line is being drawn, every item that could be its other end under the view's rules MUST be highlighted; items that could not be MUST NOT be highlighted or snap; and the item or handle under the pointer, when valid, MUST be marked as the drop target, distinctly from the other highlighted items. Valid ends are those the editor spec already allows: any flowchart node including the source; any Sequence participant or actor including the source; any C4 element, or Deployment node in a Deployment diagram, subject to FR-032 of the editor spec.
- **FR-012**: In a sequence diagram, the participant's or actor's header box MUST be its body and its lifeline MUST be its connection handle, with a hit area at least 24 px wide along its length, except across message rows, which belong to the messages (FR-016); a handle marker MUST appear on the lifeline at the pointer's height while hovering. Releasing a new message over a lifeline MUST place it in the order at the release height, between the messages above and below that point (or at the end when released below the last message). This replaces today's rule, under which a dragged message goes after the selected message or at the end; the keyboard and toolbox ways of adding a message keep today's rule (editor spec, FR-019, FR-039). Because the lifeline does more than a dot, it MUST say what is possible: while the pointer is over a lifeline, a short visible hint MUST state that dragging to another lifeline (or back to the same one) adds a message there; while a message is being drawn, an insertion marker MUST show between which existing messages it will land, following the pointer's height, alongside the valid-target highlighting of FR-011.

**Moving versus connecting**

- **FR-013**: Hovering over an item's body MUST show a move cursor and a subtle hover outline, distinct from the selection outline. Hovering over a connection handle MUST show a crosshair cursor and enlarge or highlight that handle.
- **FR-014**: Dragging from an item's body MUST always move the item as its view allows (flowchart position, Sequence order, C4 boundary membership or Deployment parent) and MUST NEVER create a line; a C4 release over an element resolves to the innermost boundary or node that contains that element. Where a body drag can change nothing (for example, a C4 element in a diagram with no boundaries), releasing it MUST leave the diagram unchanged and add nothing to the undo history.
- **FR-015**: Dragging from a connection handle MUST always start a new line and MUST NEVER move the item.
- **FR-016**: The body and connection handle zones of an item MUST NOT overlap: every on-screen point of an item belongs to exactly one zone. Where items overlap on screen, the innermost item under the pointer MUST own it. Where a selected line's end handle covers a connection handle, the end handle MUST win: the connection handle under it is hidden until the line is deselected, and the item's other connection handles keep working. In a sequence diagram, a message owns its whole row, including where it crosses lifelines: a drag there reorders the message, and the lifeline's connect zone pauses across that row and resumes above and below it.
- **FR-017**: While a line is being drawn, a preview line MUST follow the pointer from the source handle. Releasing over empty canvas, outside the canvas, or over an invalid target, or pressing Escape, MUST cancel it with no change to the diagram and nothing added to the undo history.
- **FR-018**: Messages, relationships and lines keep today's drag behaviour: dragging a Sequence message or a Dynamic relationship reorders it (editor spec, FR-039), and dragging an end handle moves that end (editor spec, FR-041). End handles MUST meet FR-010.

**Input methods and accessibility**

- **FR-019**: Moving, connecting and in-place editing MUST behave the same with mouse, touch and pen input on the supported desktop browsers (editor spec, FR-021). With touch, which has no hover, selecting an item MUST reveal its handles, and a double-tap MUST act as a double-click.
- **FR-020**: Each item's accessible description MUST state that its body can be dragged to move it, that its handles can be dragged to connect it, and that F2 renames it; each handle MUST have an accessible name stating that it is dragged to connect. The existing keyboard alternatives to dragging (editor spec, FR-019) MUST remain and be mentioned.
- **FR-021**: When the inline editor opens, focus MUST move into it and it MUST have an accessible name naming the item or line being edited; when it closes, focus MUST return to that item or line. Validation messages from the inline editor MUST be announced to screen readers.
- **FR-022**: The hover outline, handle markers, target highlighting and drop-target marking MUST meet the editor's WCAG 2.2 AA commitment (editor spec, FR-020), including non-text contrast of at least 3:1 and not relying on colour alone to tell the drop target from the other valid targets.

**Unchanged**

- **FR-023**: The Properties panel MUST keep its current fields and behaviour. Rich-text formatting in labels and new shape types MUST NOT be added. Acceptance criteria AC1–AC17 in `setup.md` MUST still pass for every view.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In every view, 100% of automated drags that start on an item's body move it (or leave the diagram unchanged where no move is possible) and create no line, and 100% that start on a connection handle create a line or cancel, and never move the item.
- **SC-002**: 100% of connection handles and end handles in all three views have an on-screen hit area of at least 24×24 px at every zoom level the canvas offers, and no shown handle overlaps its item's body.
- **SC-003**: A user can rename any item or line from the canvas in under 5 seconds, measured from double-click to the new label appearing in the source, without opening the Properties panel.
- **SC-004**: In every view, 100% of tested points on every item, its handles and its lines show exactly one cursor and hint, and that cursor and hint match what a drag starting there actually does (move, connect, reorder or move an end), verified by automated tests. Release does not depend on a study with users; a follow-up check with at least 5 first-time users, where at least 90% of predictions made before pressing ("will this drag move the item or draw a line?") are correct from what the canvas shows on hover alone, is recommended after release.
- **SC-005**: Every committed in-place edit is exactly one undo step, and after Undo and Redo the canvas, the Properties panel and the generated source agree in 100% of tests.
- **SC-006**: Pressing Escape in the inline editor, or releasing a preview line on empty canvas, leaves the diagram, the source and the undo history unchanged in 100% of tests.
- **SC-007**: Every in-place edit that the Properties panel would reject is rejected with the same explanation in 100% of tests, including the special-character cases of the editor spec's SC-003.
- **SC-008**: The editor still shows no WCAG 2.2 AA failures in each view with handles visible, a line being drawn and the inline editor open.
- **SC-009**: Acceptance criteria AC1–AC17 in `setup.md` pass for every view, with no existing automated test weakened, skipped or removed.

## Assumptions

- "Double-click" includes a double-tap on touch screens. Touch and pen are supported on the desktop browsers the editor already supports (touchscreen laptops, pen tablets attached to desktops); this feature does not extend support to phones, tablets or Safari (editor spec, FR-021).
- A drag starts only after the pointer moves past a small threshold from the press, so a click or double-click that wobbles slightly is not a drag. The exact threshold is a plan decision.
- Shift+Enter is always available, because every label in the three views may have multiple lines (editor spec, FR-006).
- The "subtle hover outline" and the handle styling follow the editor's single light theme; exact sizes beyond the minimums in FR-009 and FR-010, and colours, are plan decisions.
- Flowchart handles on all four sides are an editor-only convenience. Mermaid lays out the flowchart its own way, so the handle a line was drawn from is not written to the source and is not saved (editor spec, FR-003); the saved diagram format does not change.
- C4 elements and Deployment nodes have a connection handle on each of their four sides, like flowchart nodes, so connecting looks and works the same in both; this is a design choice for consistency, not a Mermaid requirement.
- Releasing a new line on any part of a valid target (its body or any of its handles) connects to it; users do not need to hit a handle exactly.
- C4 boundaries have no connection handles because boundaries are never relationship ends (editor spec, Clarifications, plan session).
- F2 now opens the inline editor instead of moving focus to the Properties panel's label field. The Properties panel's label field remains reachable by Tab, so no capability is lost.
- No new data is stored: the feature changes interaction only, so saved diagrams and files are unaffected.
- Not covered and deferred to a separate feature: a source view that accepts pasted Mermaid diagrams, and moving the copy and save controls into it. Importing Mermaid source is excluded by `setup.md` and constitution Principle I, so that feature needs both amended first.
