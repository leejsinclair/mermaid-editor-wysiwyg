# Feature Specification: Mermaid Editor UX and Workflow Clarity

**Created**: 2026-10-24

**Status**: Draft

**Grilled on**: 2026-10-24

**Input**: User description: "Improve Mermaid Editor UX and Workflow Clarity. Improve the user experience of the Mermaid WYSIWYG editor so that business analysts can create and edit diagrams intuitively, while developers retain efficient access to advanced editing and Mermaid source capabilities. Preserve the Blueprint Studio visual identity, the current architecture and established functionality. Focus on interaction clarity, workflow efficiency, discoverability and user confidence rather than a visual redesign."

## Clarifications

### Session 2026-10-24

- Q: Which diagram types does this feature cover? → A: All three types (flowchart, sequence and C4), each keeping its own element names and connection rules.
- Q: Which names do the copy and save actions use? → A: The existing names: Copy Source, Copy for Markdown and Save file.
- Q: Where does the preview explain that editor positions are not kept, and how does the user return? → A: Keep the existing read-only preview. Show the explanation where it opens and beside Copy Source and Save file. Add a labelled "Back to editing" control.
- Q: Should first-use guidance be a dismissible card or the existing empty-canvas hint? → A: Extend the existing empty-canvas hint to name the three steps, with no dismiss control. Contextual guidance during connecting and label editing still appears while those actions are active.
- Q: What happens when the user confirms an empty label? → A: The editor stays open and shows a message that a label cannot be empty.
- Q: What should Escape do while a connection is in progress? → A: The first Escape cancels the connection; a second Escape clears the selection.
- Q: Should the app's icons come from one shared set drawn in the codebase, or from an icon library added as a dependency? → A: One shared set drawn in the codebase as inline SVG, with no new dependency.
- Q: Should Undo, Redo, Zoom in, Zoom out and Fit to view show an icon alone, or always keep a visible text label? → A: Keep the text label where the toolbar has room; show an icon alone only where it has no room.
- Q: Should the appearance switch add sun and moon icons to its text labels? → A: No. It keeps the Blueprint and Light text labels and its pressed state.
- Q: When a connection is selected, should the properties panel offer a labelled action for changing its endpoints, without dragging? → A: Yes. Add a labelled Change endpoints action for a selected connection, alongside the handles.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a labelled, connected flowchart from a blank canvas (Priority: P1)

A business analyst opens the editor with an empty canvas. Short, dismissible guidance explains the three steps: add a shape, label it, connect two shapes. The analyst adds two shapes, labels each one inline, and connects them. The analyst never needs to know Mermaid syntax.

**Why this priority**: This is the first-use path. If it is unclear, new users leave before they reach any other feature.

**Independent Test**: Give a person with no Mermaid knowledge a blank editor and no instructions. Measure whether they add, label and connect two shapes, and how long it takes.

**Acceptance Scenarios**:

1. **Given** an empty canvas, **When** the editor opens, **Then** concise guidance covering add, label and connect is visible and does not cover the canvas.
2. **Given** the user adds a shape, **When** the shape appears, **Then** it is selected and its label opens for inline editing.
3. **Given** inline label editing is open, **When** the user presses Enter, **Then** the label is saved. **When** the user presses Escape, **Then** the previous label is kept.
4. **Given** the connection tool is active, **When** the user looks at the canvas, **Then** a visible text prompt says whether to choose the source or the destination, and says how to cancel.
5. **Given** the canvas has content, **When** the user views it, **Then** the empty-canvas hint is not shown. **When** the canvas is emptied again, **Then** the hint returns.

### User Story 2 - Know what is selected and what I can do with it (Priority: P2)

A user selects a node or a connection. The canvas and the properties panel show the same selection, name the element type, and offer only the actions that apply to it. With nothing selected, the panel offers getting-started help instead of editing controls.

**Why this priority**: Users cannot edit confidently while they are unsure what a control acts on.

**Independent Test**: Select each element type in turn and confirm that the canvas, the properties panel and the available actions agree.

**Acceptance Scenarios**:

1. **Given** nothing is selected, **When** the user views the properties panel, **Then** it shows getting-started help and no element-level editing controls.
2. **Given** a node is selected on the canvas, **When** the user views the properties panel, **Then** it shows the node's type and its relevant actions: rename, create connection, delete.
3. **Given** a connection is selected, **When** the user views the properties panel, **Then** it shows the connection's source, destination and direction, with actions to change endpoints, reverse direction and delete.
4. **Given** an action cannot be used in the current state, **When** the user views it, **Then** it is disabled and announced as unavailable.

### User Story 3 - Find actions by intent in the toolbar (Priority: P2)

A user scans the toolbar and finds actions grouped by intent: History, Diagram editing, Export and sharing, and View. Frequently used actions are visible. Less frequent actions sit in a secondary menu.

**Why this priority**: The toolbar is where most users look first. Mixed grouping slows them down.

**Independent Test**: Ask a user to undo a change, copy Mermaid source, and zoom in. Check that each action is found in its expected group without help.

**Acceptance Scenarios**:

1. **Given** the toolbar is visible, **When** the user looks at it, **Then** Undo and Redo are in History, Zoom in, Zoom out, Fit to view and Preview as Mermaid draws it are in View, and Copy Source, Copy for Markdown and Save file are in Export and sharing.
2. **Given** an action is used rarely, **When** the toolbar is shown, **Then** it is in a secondary menu, and it still works from that menu.
3. **Given** a toolbar action, **When** the user reaches it by keyboard, **Then** it can be used and its focus is visible.

### User Story 4 - Preview the Mermaid output before exporting (Priority: P2)

A user opens a preview to see how the generated Mermaid source renders elsewhere. The preview explains that the editor's own node positions may not carry over. The user returns to editing with the diagram and its undo history unchanged.

**Why this priority**: Users who expect exact layout preservation are surprised when the rendered output differs. Clear expectations prevent that.

**Independent Test**: Edit a diagram, open the preview, check that it matches the current source, return to editing, and confirm nothing was lost.

**Acceptance Scenarios**:

1. **Given** a diagram has been edited, **When** the user opens the preview, **Then** the rendered output matches the Mermaid source generated from the current diagram.
2. **Given** the preview is open, **When** the user returns to editing, **Then** the diagram, its layout and its undo history are unchanged.
3. **Given** the user uses the preview or an export action, **When** the explanation is shown, **Then** it says that editor node positions are not necessarily kept in Mermaid output.

### User Story 5 - Know whether my work is saved and whether the diagram is valid (Priority: P2)

A user sees one status for saving and another status for validity. Unsaved changes are visible. A failed save says the diagram is not saved. The word "saved" appears only after the save has succeeded.

**Why this priority**: Users who believe their work is saved when it is not lose data. Users must also understand that the diagram's validity is a separate question.

**Independent Test**: Make changes, trigger a successful save and a failed save, and invalidate the diagram. Confirm each state is reported correctly and separately.

**Acceptance Scenarios**:

1. **Given** the diagram has unsaved changes, **When** the user views the header, **Then** the save status says the changes are not saved.
2. **Given** a save fails, **When** the failure happens, **Then** the editor shows a visible message that the diagram was not saved.
3. **Given** the diagram is invalid, **When** the user views the status, **Then** validity is shown separately from save status.

### User Story 6 - Complete essential edits without dragging, at any supported width (Priority: P2)

A user adds, labels, selects, moves, connects, deletes, undoes and redoes using the keyboard only. The toolbox, canvas, properties panel, toolbar and preview remain usable at narrow widths.

**Why this priority**: Accessibility is a commitment of the project. Dragging-only interaction excludes keyboard and some touch users.

**Independent Test**: Complete a full add-label-connect-delete task using only the keyboard, then repeat it at the narrowest supported width.

**Acceptance Scenarios**:

1. **Given** a node is selected, **When** the user moves it with the keyboard, **Then** the node moves and its new position is kept.
2. **Given** the viewport is at its narrowest supported width, **When** the user opens each panel, **Then** every important action is reachable without horizontal page scrolling.

### User Story 7 - Recognise repeated actions by a consistent icon and label (Priority: P3)

A user who has learned an action in one place finds the same icon and label wherever else it appears. Icon-only controls are identified by their names and tooltips.

**Why this priority**: Consistent icons speed up scanning once the basic workflow is clear. They do not change what the editor can do.

**Independent Test**: Find each action in the toolbar, the properties panel and the toolbox, and check that its icon and label match. Check every icon-only control by keyboard and with a screen reader.

**Acceptance Scenarios**:

1. **Given** an action appears in more than one place, **When** the user compares them, **Then** it has the same icon and label in each.
2. **Given** an action whose meaning is not obvious, **When** it is shown, **Then** it has a visible text label.
3. **Given** an icon-only control, **When** it has keyboard focus, **Then** its accessible name is announced and its focus is visible.
4. **Given** a selected element, an error or the save status is shown, **When** icons are on screen, **Then** no icon hides the diagram, the selection, the error or the save status.

## Edge Cases

- **EC-01 Empty label confirmed**: The editor stays open with a message that a label cannot be empty. The node keeps its previous label.
- **EC-02 Escape during overlapping operations**: Escape cancels the innermost active operation only, such as a label edit or a connection in progress.
- **EC-03 Element deleted while its label is being edited**: The label editor closes, and no label is applied to a missing element.
- **EC-04 Save fails while the preview is open**: The save status stays "not saved" when the user returns to editing.
- **EC-05 Invalid diagram opened in preview**: The preview shows the validation problem, not a blank area.
- **EC-06 Canvas emptied again**: The hint returns, naming the three steps.
- **EC-07 Self-connection**: Self-loops are allowed. Reversing a self-loop is refused, as it is today.
- **EC-08 Label with special characters**: The preview and the copied source show the same escaped text.
- **EC-09 Reload with unsaved changes**: Existing recovery behaviour is kept. The status must not say "saved" for changes that were not persisted.
- **EC-10 Narrow width with a selected element**: The properties panel stays reachable.

## Requirements *(mandatory)*

### Functional Requirements

**Guidance and first use**

- **FR-001**: On an empty canvas, the editor MUST show concise guidance covering adding a shape, labelling it and connecting two shapes.
- **FR-002**: The empty-canvas hint MUST name the three steps: add a shape, label it and connect two shapes. It needs no dismiss control, because it disappears once the canvas has content.
- **FR-003**: The editor MUST show contextual guidance while a connection is being created and while an inline label is being edited.

**Adding and labelling**

- **FR-004**: After a node is added, the editor MUST select it and open its label for inline editing.
- **FR-005**: Pressing Enter MUST confirm an inline label. Pressing Escape MUST cancel it and keep the previous label. Confirming an empty label MUST keep the editor open and show a message that a label cannot be empty.
- **FR-006**: The properties panel MUST remain a way to edit the label and other properties, and MUST show any inline change.

**Connecting**

- **FR-007**: A connection in progress MUST show a text prompt that says whether the user is choosing the source or the destination.
- **FR-008**: The active connection state MUST be shown by more than colour alone.
- **FR-009**: The editor MUST let the user cancel an unfinished connection with Escape. The prompt MUST state this.
- **FR-010**: After a connection is created, its direction MUST be visible on the canvas and its source and destination MUST be shown in the properties panel.

**Selection and contextual actions**

- **FR-011**: Unselected, hovered, focused and selected nodes and connections MUST look different from each other, using more than colour alone. Selected nodes already have a heavier outline, hovered nodes a dashed outline, and selected connections extra width.
- **FR-012**: The canvas and the properties panel MUST show the same selection.
- **FR-013**: When an element is selected, the properties panel MUST name its type.
- **FR-014**: Element-level actions (Rename, Connect…, Change endpoints, Reverse, Delete) MUST have full, understandable labels. They MUST appear only when they apply to the selection. A selected connection MUST offer a labelled Change endpoints action, which does not depend on dragging its handles.
- **FR-015**: Diagram-level actions MUST be visually and structurally separate from element-level actions.
- **FR-016**: An action whose conditions are not met MUST be disabled and announced as unavailable to assistive technology.

**Toolbar**

- **FR-017**: The toolbar MUST group actions as History (Undo, Redo), Diagram editing, Export and sharing, and View (Zoom in, Zoom out, Fit to view, Preview as Mermaid draws it).
- **FR-018**: Less frequently used actions MUST move to a secondary menu. No action may be removed.
- **FR-019**: Copy Source, Copy for Markdown and Save file MUST be separate actions, using the labels the app already uses.

**Preview and layout**

- **FR-020**: The preview MUST show the Mermaid source generated from the current diagram, rendered as Mermaid draws it. The editor already has a read-only preview with zoom, pan and fit.
- **FR-021**: The preview MUST refresh after every edit made while it is open.
- **FR-022**: Returning from the preview MUST keep the diagram, its layout and its undo history unchanged. A labelled "Back to editing" control MUST return the user to editing.
- **FR-023**: The explanation that editor node positions are not necessarily kept in Mermaid output MUST appear where the preview opens and beside Copy Source and Save file.
- **FR-024**: The editor MUST NOT claim that exact layout is preserved in exported Mermaid.
- **FR-025**: Users MUST still be able to inspect and copy the generated Mermaid source.

**Saving and validation**

- **FR-026**: The editor MUST distinguish, in its user-facing text, between a diagram saved in the browser, an editable diagram file and exported Mermaid source.
- **FR-027**: The words "Save file" MUST refer only to saving the editable diagram to a file. The word "Copy" MUST refer only to placing content on the clipboard.
- **FR-028**: The editor MUST show unsaved changes when they exist.
- **FR-029**: The editor MUST show a visible message when a save fails.
- **FR-030**: The editor MUST NOT show "saved" until the save operation has succeeded. The save logic already reports Saved only after the write completes.
- **FR-031**: Diagram validity MUST be shown as a status separate from the save status. Validity already shows as Valid or Invalid, apart from save status.

**Accessibility and responsive layout**

- **FR-032**: Add, label, select, move, connect, delete, undo and redo MUST all be possible from the keyboard without mouse dragging. Arrow keys already move a selected node and F2 already renames it; both stay.
- **FR-033**: Interactive controls MUST have accessible names. Keyboard focus MUST be visible. Contrast MUST meet WCAG 2.2 AA where applicable.
- **FR-034**: At every width from 360 px upward, the toolbox, canvas, properties panel, toolbar and preview MUST remain usable. No important action may become unreachable.
- **FR-035**: New states MUST work in both the Blueprint Studio and Light appearances.

**Preserved behaviour**

- **FR-036**: Existing diagram types, shapes, connection types, import, export, undo and redo, persistence, keyboard shortcuts and theme MUST keep working.
- **FR-037**: The editor MUST NOT discard diagram data or constructs when the user moves between editing and preview.
- **FR-038**: Mermaid generation MUST NOT change, unless a defect is found and fixed.

**Iconography and action identification**

- **FR-039**: Each repeated action MUST show the same icon, label and tooltip wherever it appears.
- **FR-040**: Icons MUST come from one shared icon set drawn in the codebase as inline SVG. No icon library is added as a dependency.
- **FR-041**: Each action in the table below MUST keep a visible text label, unless the table allows icon-only display.
- **FR-042**: Undo, Redo, Zoom in, Zoom out and Fit to view MUST keep their text label wherever the toolbar has room. Only where it has no room MAY they show an icon alone. Each MUST have an accessible name and a tooltip.
- **FR-043**: A tooltip MUST NOT be the only accessible name of a control, and MUST NOT cover an essential control.
- **FR-044**: Delete MUST be identifiable by its text label and icon, not by colour alone.
- **FR-045**: The toolbox MUST keep its shape illustrations and connection previews. Generic icons MUST NOT replace them.
- **FR-046**: Toolbar icons MUST share one size, button size, spacing and alignment. Hover, keyboard focus, selection, disabled and active states MUST each look different from one another, and none may depend on colour alone.
- **FR-047**: Decorative icons MUST be hidden from assistive technology. Toggled, disabled, expanded and selected states MUST be exposed to assistive technology.
- **FR-048**: Icons and their labels MUST stay understandable at a 360 px width and at 200 % browser zoom.
- **FR-049**: Icons MUST NOT obscure the diagram, the selection, error messages or the save status.
- **FR-050**: Icons MUST change presentation only. Existing actions MUST keep their behaviour unless a separate requirement changes it.

### Action identification

| Action (existing label) | Icon concept | Display |
| --- | --- | --- |
| Undo | Curved arrow pointing back | Icon with tooltip; text where room allows |
| Redo | Curved arrow pointing forward | Icon with tooltip; text where room allows |
| Add shape (toolbox) | Plus in a square | Text label |
| Connect… (properties panel) | Two connected nodes | Text label |
| Zoom in | Magnifier with plus | Icon with accessible name |
| Zoom out | Magnifier with minus | Icon with accessible name |
| Fit to view | Expand to fit | Icon with tooltip |
| Preview as Mermaid draws it | Branching diagram | Text label; icon optional |
| Copy Source | Code brackets | Text label |
| Copy for Markdown | Document marked as Markdown | Text label |
| Save file | Save symbol | Text label |
| Rename (node and diagram) | Pencil | Text label |
| Change type | Shape outline | Text label |
| Move to… | Arrow into a box | Text label |
| Reverse | Opposing arrows | Text label |
| Change endpoints | Arrowhead moved to another end | Text label |
| Delete | Trash | Text label, distinct from other actions |
| Mermaid source (show or hide) | Code brackets with disclosure arrow | Text label; expanded state exposed |
| Appearance (Blueprint, Light) | None | Keep the text toggle and its pressed state |

### Key Entities

- **Diagram**: The user's diagram. It holds elements, layout and undo history.
- **Element**: A node or a connection in the diagram. Each has a type, a label and, for connections, a source and a destination.
- **Selection**: The element or elements the user has chosen. The canvas and the properties panel both reflect it.
- **Saved diagram**: The diagram as stored in the browser or in an editable file.
- **Mermaid source**: The generated text. It is read-only and is never edited directly.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a first-use check, at least 4 of 5 people with no Mermaid knowledge add, label and connect two shapes within 3 minutes and without outside help.
- **SC-002**: In every selection test, the element type and its available actions are shown in the properties panel and agree with the canvas.
- **SC-003**: In a check of 10 scenarios, participants correctly say whether their work is saved, and whether they are copying source or saving a file, in at least 9 of 10 cases.
- **SC-004**: In every preview check, the rendered output matches the Mermaid source copied from the same diagram.
- **SC-005**: Every core editing task in the test suite can be completed from the keyboard, without mouse dragging.
- **SC-006**: At every supported viewport width, every toolbar action and panel can be reached without horizontal page scrolling.
- **SC-007**: Each acceptance scenario in this specification has at least one automated test. Existing automated workflow tests continue to pass, except where a requirement intentionally changes behaviour.
- **SC-008**: Usability findings from a realistic task check with business analysts and developers are documented before the feature is marked complete.
- **SC-009**: Every action in the action identification table shows the same icon and label in each place it appears. This is checked by review of each place, or by an automated test.
- **SC-010**: Automated accessibility and component tests cover every icon-only control and its states (disabled, focused, expanded and pressed), and they all pass.

## Assumptions

- The work extends the existing editor. It does not replace it or add a second editor.
- Shared controls (toolbar, preview, save status, validity status) apply to every supported diagram type. Element wording and guidance follow each type's own elements. Settled in Clarifications: all three types, each keeping its own element names and connection rules.
- Keyboard moves of a selected node use fixed steps. The exact step size is a planning decision.
- The preview renders with the Mermaid version the application already uses. No new dependency is added.
- No user testing has been run yet. SC-001 to SC-003 and SC-008 are planned checks, not existing results.
- Out of scope: replacing Mermaid as the diagram language; preserving arbitrary canvas coordinates in exported Mermaid; new diagram types or new Mermaid syntax; a visual redesign; collaborative editing, accounts or cloud sync; unrelated refactoring.
- Icons come from one set drawn in the repository as inline SVG, as the shape previews already are (FR-040). This adds no dependency.
- Undo, Redo, Zoom in, Zoom out and Fit to view show an icon alone only where the toolbar has no room for text (FR-042).
- The appearance switch keeps its text labels, Blueprint and Light, and adds no sun or moon icons.
- The 200 % browser zoom reference is the WCAG resize-text criterion.
- Behaviour is verified in desktop Chromium and, for touch, an emulated Android phone. Firefox is not a supported browser under the constitution (3.0.0).
- Change endpoints is a new label for a selected connection. Endpoints can be changed today only by dragging the handles, so the label adds a keyboard route (FR-014).
