# Behaviour Checklist: 008-ux-workflow-clarity

**Specification**: [spec.md](../spec.md) | **Verification Plan**: [plan.md](../plan.md#verification-plan) | **Tasks**: [tasks.md](../tasks.md)

## US1-AS1

> **Given** an empty canvas, **When** the editor opens, **Then** concise guidance covering add, label and connect is visible and does not cover the canvas.

- **BI-001** Expresses: FR-001, US1-AS1. Verified by: VO-001.
  - **Given** the editor is open on an empty canvas
  - **When** the editor opens
  - **Then** guidance covering adding a shape, labelling it and connecting two shapes is visible
  - **And** the guidance does not cover the canvas

## US1-AS2

> **Given** the user adds a shape, **When** the shape appears, **Then** it is selected and its label opens for inline editing.

- **BI-002** Expresses: FR-004, US1-AS2. Verified by: VO-002.
  - **Given** the user adds a shape to the canvas
  - **When** the shape appears
  - **Then** the shape is selected
  - **And** its label opens for inline editing

## US1-AS3

> **Given** inline label editing is open, **When** the user presses Enter, **Then** the label is saved. **When** the user presses Escape, **Then** the previous label is kept.

- **BI-003** Expresses: FR-005, US1-AS3. Verified by: VO-003.
  - **Given** inline label editing is open with a new label typed
  - **When** the user presses Enter
  - **Then** the label is saved

- **BI-004** Expresses: FR-005, US1-AS3. Verified by: VO-003.
  - **Given** inline label editing is open with a new label typed
  - **When** the user presses Escape
  - **Then** the previous label is kept

## US1-AS4

> **Given** the connection tool is active, **When** the user looks at the canvas, **Then** a visible text prompt says whether to choose the source or the destination, and says how to cancel.

- **BI-005** Expresses: FR-007, FR-009, US1-AS4. Verified by: VO-004.
  - **Given** the connection tool is active
  - **When** the user looks at the canvas
  - **Then** a visible text prompt says whether to choose the source or the destination
  - **And** the prompt says how to cancel

## US1-AS5

> **Given** the canvas has content, **When** the user views it, **Then** the empty-canvas hint is not shown. **When** the canvas is emptied again, **Then** the hint returns.

- **BI-006** Expresses: FR-002, US1-AS5. Verified by: VO-005.
  - **Given** the canvas has content
  - **When** the user views it
  - **Then** the empty-canvas hint is not shown

- **BI-007** Expresses: FR-002, US1-AS5. Verified by: VO-005.
  - **Given** the canvas has been emptied again
  - **When** the user views it
  - **Then** the empty-canvas hint returns

## US2-AS1

> **Given** nothing is selected, **When** the user views the properties panel, **Then** it shows getting-started help and no element-level editing controls.

- **BI-008** Expresses: FR-014, US2-AS1. Verified by: VO-006.
  - **Given** nothing is selected
  - **When** the user views the properties panel
  - **Then** it shows getting-started help
  - **And** it shows no element-level editing controls

## US2-AS2

> **Given** a node is selected on the canvas, **When** the user views the properties panel, **Then** it shows the node's type and its relevant actions: rename, create connection, delete.

- **BI-009** Expresses: FR-013, FR-014, US2-AS2. Verified by: VO-007.
  - **Given** a node is selected on the canvas
  - **When** the user views the properties panel
  - **Then** it shows the node's type
  - **And** it shows the relevant actions: rename, create connection and delete

## US2-AS3

> **Given** a connection is selected, **When** the user views the properties panel, **Then** it shows the connection's source, destination and direction, with actions to change endpoints, reverse direction and delete.

- **BI-010** Expresses: FR-010, FR-014, US2-AS3. Verified by: VO-008.
  - **Given** a connection is selected
  - **When** the user views the properties panel
  - **Then** it shows the connection's source, destination and direction
  - **And** it shows actions to change endpoints, reverse direction and delete

## US2-AS4

> **Given** an action cannot be used in the current state, **When** the user views it, **Then** it is disabled and announced as unavailable.

- **BI-011** Expresses: FR-016, US2-AS4. Verified by: VO-009.
  - **Given** an action cannot be used in the current state
  - **When** the user views it
  - **Then** it is disabled
  - **And** it is announced as unavailable

## US3-AS1

> **Given** the toolbar is visible, **When** the user looks at it, **Then** Undo and Redo are in History, Zoom in, Zoom out, Fit to view and Preview as Mermaid draws it are in View, and Copy Source, Copy for Markdown and Save file are in Export and sharing.

- **BI-012** Expresses: FR-017, FR-019, US3-AS1. Verified by: VO-010.
  - **Given** the toolbar is visible
  - **When** the user looks at it
  - **Then** Undo and Redo are in History
  - **And** Zoom in, Zoom out, Fit to view and Preview as Mermaid draws it are in View
  - **And** Copy Source, Copy for Markdown and Save file are in Export and sharing

## US3-AS2

> **Given** an action is used rarely, **When** the toolbar is shown, **Then** it is in a secondary menu, and it still works from that menu.

- **BI-013** Expresses: FR-018, US3-AS2. Verified by: VO-011.
  - **Given** an action is used rarely
  - **When** the toolbar is shown
  - **Then** it is in a secondary menu
  - **And** it still works from that menu

## US3-AS3

> **Given** a toolbar action, **When** the user reaches it by keyboard, **Then** it can be used and its focus is visible.

- **BI-014** Expresses: FR-033, US3-AS3. Verified by: VO-012.
  - **Given** a toolbar action
  - **When** the user reaches it by keyboard
  - **Then** it can be used
  - **And** its focus is visible

## US4-AS1

> **Given** a diagram has been edited, **When** the user opens the preview, **Then** the rendered output matches the Mermaid source generated from the current diagram.

- **BI-015** Expresses: FR-020, US4-AS1. Verified by: VO-013.
  - **Given** a diagram has been edited
  - **When** the user opens the preview
  - **Then** the rendered output matches the Mermaid source generated from the current diagram

## US4-AS2

> **Given** the preview is open, **When** the user returns to editing, **Then** the diagram, its layout and its undo history are unchanged.

- **BI-016** Expresses: FR-022, FR-037, US4-AS2. Verified by: VO-014.
  - **Given** the preview is open
  - **When** the user returns to editing
  - **Then** the diagram, its layout and its undo history are unchanged
  - **And** the return control is labelled Back to editing

## US4-AS3

> **Given** the user uses the preview or an export action, **When** the explanation is shown, **Then** it says that editor node positions are not necessarily kept in Mermaid output.

- **BI-017** Expresses: FR-023, US4-AS3. Verified by: VO-015.
  - **Given** the user uses the preview or an export action
  - **When** the explanation is shown
  - **Then** it says that editor node positions are not necessarily kept in Mermaid output

## US5-AS1

> **Given** the diagram has unsaved changes, **When** the user views the header, **Then** the save status says the changes are not saved.

- **BI-018** Expresses: FR-028, US5-AS1. Verified by: VO-016.
  - **Given** the diagram has unsaved changes
  - **When** the user views the header
  - **Then** the save status says the changes are not saved

## US5-AS2

> **Given** a save fails, **When** the failure happens, **Then** the editor shows a visible message that the diagram was not saved.

- **BI-019** Expresses: FR-029, US5-AS2. Verified by: VO-017.
  - **Given** a save fails
  - **When** the failure happens
  - **Then** the editor shows a visible message that the diagram was not saved

## US5-AS3

> **Given** the diagram is invalid, **When** the user views the status, **Then** validity is shown separately from save status.

- **BI-020** Expresses: FR-031, US5-AS3. Verified by: VO-018.
  - **Given** the diagram is invalid
  - **When** the user views the status
  - **Then** validity is shown separately from save status

## US6-AS1

> **Given** a node is selected, **When** the user moves it with the keyboard, **Then** the node moves and its new position is kept.

- **BI-021** Expresses: FR-032, US6-AS1. Verified by: VO-019.
  - **Given** a node is selected
  - **When** the user moves it with the keyboard
  - **Then** the node moves
  - **And** its new position is kept

## US6-AS2

> **Given** the viewport is at its narrowest supported width, **When** the user opens each panel, **Then** every important action is reachable without horizontal page scrolling.

- **BI-022** Expresses: FR-034, US6-AS2. Verified by: VO-020.
  - **Given** the viewport is at its narrowest supported width
  - **When** the user opens each panel
  - **Then** every important action is reachable without horizontal page scrolling

## US7-AS1

> **Given** an action appears in more than one place, **When** the user compares them, **Then** it has the same icon and label in each.

- **BI-023** Expresses: FR-039, US7-AS1. Verified by: VO-021.
  - **Given** an action appears in more than one place
  - **When** the user compares them
  - **Then** it has the same icon and label in each place

## US7-AS2

> **Given** an action whose meaning is not obvious, **When** it is shown, **Then** it has a visible text label.

- **BI-024** Expresses: FR-041, US7-AS2. Verified by: VO-022.
  - **Given** an action whose meaning is not obvious
  - **When** it is shown
  - **Then** it has a visible text label

## US7-AS3

> **Given** an icon-only control, **When** it has keyboard focus, **Then** its accessible name is announced and its focus is visible.

- **BI-025** Expresses: FR-033, FR-043, US7-AS3. Verified by: VO-023.
  - **Given** an icon-only control
  - **When** it has keyboard focus
  - **Then** its accessible name is announced
  - **And** its focus is visible
  - **And** its tooltip is not its only accessible name

## US7-AS4

> **Given** a selected element, an error or the save status is shown, **When** icons are on screen, **Then** no icon hides the diagram, the selection, the error or the save status.

- **BI-026** Expresses: FR-049, US7-AS4. Verified by: VO-024.
  - **Given** a selected element, an error or the save status is shown
  - **When** icons are on screen
  - **Then** no icon hides the diagram, the selection, the error or the save status

## Other behaviours

- **BI-027** Expresses: FR-003. Verified by: VO-025.
  - **Given** an inline label is being edited
  - **When** the label editor is open
  - **Then** contextual guidance is visible

- **BI-028** Expresses: FR-006. Verified by: VO-026.
  - **Given** a label has been changed inline
  - **When** the user views the properties panel
  - **Then** the panel shows the changed label

- **BI-029** Expresses: FR-008, FR-011, FR-044, FR-046. Verified by: VO-027.
  - **Given** nodes and connections are unselected, hovered, focused, selected or active
  - **When** the user views them
  - **Then** each state looks different from the others without relying on colour alone
  - **And** Delete is identified by its text label and its icon

- **BI-030** Expresses: FR-010. Verified by: VO-028.
  - **Given** a connection has been created
  - **When** the user views the canvas
  - **Then** the connection's direction is visible

- **BI-031** Expresses: FR-012, FR-013. Verified by: VO-029.
  - **Given** an element is selected on the canvas
  - **When** the user views the properties panel
  - **Then** the canvas and the properties panel show the same selection
  - **And** the panel names the selected element's type

- **BI-032** Expresses: FR-015. Verified by: VO-030.
  - **Given** the user views the toolbar and the properties panel
  - **When** the user compares their actions
  - **Then** diagram-level actions are in the toolbar and element-level actions are in the properties panel, structurally separate

- **BI-033** Expresses: FR-021. Verified by: VO-031.
  - **Given** the preview is open
  - **When** the user edits the diagram
  - **Then** the preview shows the new source

- **BI-034** Expresses: FR-025. Verified by: VO-032.
  - **Given** a diagram is open
  - **When** the user chooses Copy Source
  - **Then** the generated Mermaid source is copied
  - **And** the user can inspect that source

- **BI-035** Expresses: FR-026, FR-027. Verified by: VO-033.
  - **Given** the user reads the save and export wording
  - **When** the user compares the three kinds of output
  - **Then** saved in this browser, saved as an editable file and exported Mermaid source each have a distinct phrase
  - **And** Save file names only the file action
  - **And** Copy names only placing content on the clipboard

- **BI-036** Expresses: FR-030. Verified by: VO-034.
  - **Given** a save operation has not yet succeeded
  - **When** the user views the save status
  - **Then** the word saved is not shown
  - **And** the word saved appears only after the save operation has succeeded

- **BI-037** Expresses: FR-033, FR-047. Verified by: VO-035.
  - **Given** interactive controls are on screen
  - **When** assistive technology reads them
  - **Then** each control has an accessible name
  - **And** contrast meets WCAG 2.2 AA
  - **And** decorative icons are hidden while toggled, disabled, expanded and selected states are exposed

- **BI-038** Expresses: FR-035. Verified by: VO-036.
  - **Given** the new states are on screen
  - **When** the user views them in Blueprint Studio and in Light
  - **Then** the new states are shown in both appearances

- **BI-039** Expresses: FR-036, FR-050. Verified by: VO-037.
  - **Given** existing diagram types, shapes, connections, import, export, undo, redo, persistence, shortcuts and theme are in use
  - **When** the user uses each of them after the change
  - **Then** each works as before
  - **And** a changed icon alters only how an action looks

- **BI-040** Expresses: FR-042. Verified by: VO-038.
  - **Given** the toolbar has room for text
  - **When** the user views Undo, Redo, Zoom in, Zoom out and Fit to view
  - **Then** each shows its text label
  - **And** where the toolbar has no room, an icon alone is shown with an accessible name and a tooltip

- **BI-041** Expresses: FR-045. Verified by: VO-039.
  - **Given** the toolbox is open
  - **When** the user views the shapes
  - **Then** the shape illustrations and connection previews are kept
  - **And** no generic icon replaces them

- **BI-042** Expresses: FR-048. Verified by: VO-040.
  - **Given** toolbar icons and their labels are on screen
  - **When** the viewport is 360 px wide or the browser is at 200% zoom
  - **Then** the icons and labels stay understandable

- **BI-043** Expresses: FR-005, EC-01. Verified by: VO-041.
  - **Given** a label is being edited
  - **When** the user confirms an empty label
  - **Then** the editor stays open
  - **And** a message says that a label cannot be empty
  - **And** the node keeps its previous label

- **BI-044** Expresses: FR-005, FR-009, EC-02. Verified by: VO-042.
  - **Given** a label is being edited and a connection is in progress
  - **When** the user presses Escape
  - **Then** only the label edit is cancelled

- **BI-045** Expresses: FR-009, EC-02. Verified by: VO-042.
  - **Given** a connection is in progress and no label is being edited
  - **When** the user presses Escape
  - **Then** the connection is cancelled
  - **And** the selection is kept

- **BI-046** Expresses: FR-005, EC-02. Verified by: VO-042.
  - **Given** nothing is being edited or connected and an element is selected
  - **When** the user presses Escape
  - **Then** the selection is cleared

- **BI-047** Expresses: FR-005, EC-03. Verified by: VO-043.
  - **Given** a label is being edited
  - **When** the element is deleted
  - **Then** the label editor closes
  - **And** no label is applied to the missing element

- **BI-048** Expresses: FR-029, FR-030, EC-04. Verified by: VO-044.
  - **Given** the preview is open and a save fails
  - **When** the user returns to editing
  - **Then** the save status still says not saved

- **BI-049** Expresses: FR-020, EC-05. Verified by: VO-045.
  - **Given** the diagram is invalid
  - **When** the user opens it in the preview
  - **Then** the preview shows the validation problem and not a blank area

- **BI-050** Expresses: FR-002, EC-06. Verified by: VO-046.
  - **Given** the canvas has been emptied again
  - **When** the user views the canvas
  - **Then** the hint returns and names the three steps

- **BI-051** Expresses: FR-036, EC-07. Verified by: VO-047.
  - **Given** a shape is connected to itself
  - **When** the user creates the connection
  - **Then** the self-connection is allowed
  - **And** reversing it is refused

- **BI-052** Expresses: FR-020, FR-025, EC-08. Verified by: VO-048.
  - **Given** a label contains special characters
  - **When** the user views the preview and copies the source
  - **Then** the preview and the copied source show the same escaped text

- **BI-053** Expresses: FR-028, FR-030, EC-09. Verified by: VO-049.
  - **Given** the editor is reloaded with unsaved changes
  - **When** the user views the save status
  - **Then** the status never says saved for changes that were not persisted

- **BI-054** Expresses: FR-034, EC-10. Verified by: VO-050.
  - **Given** an element is selected at the narrowest supported width
  - **When** the user uses the properties panel
  - **Then** the properties panel stays reachable

- **BI-055** Expresses: FR-024. Verified by: exemption FR-024.
  - **Given** the editor explains that node positions may not be kept
  - **When** the user reads the explanation
  - **Then** it does not claim that exact layout is kept

- **BI-056** Expresses: FR-038. Verified by: exemption FR-038.
  - **Given** Mermaid source is generated for any diagram
  - **When** the change is delivered
  - **Then** the generated Mermaid source is unchanged unless a defect is fixed

- **BI-057** Expresses: FR-040. Verified by: exemption FR-040.
  - **Given** the project's dependencies
  - **When** the feature is delivered
  - **Then** no icon library is added as a dependency

- **BI-058** Expresses: FR-019, FR-027. Verified by: VO-051.
  - **Given** the labels and messages the UI contract pins verbatim
  - **When** the English catalogue is read
  - **Then** each one appears in it exactly as written

- **BI-059** Expresses: FR-026, FR-028. Verified by: VO-052.
  - **Given** a diagram open in the editor
  - **When** its save state changes or an operation can be cancelled
  - **Then** the status display receives the save text and the unsaved flag
  - **And** the canvas receives the cancel target
