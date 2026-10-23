# Behaviour Checklist: 007-blueprint-redesign

**Specification**: [spec.md](../spec.md) | **Verification Plan**: [plan.md](../plan.md#verification-plan) | **Tasks**: [tasks.md](../tasks.md)

## US1-AS1

> **Given** the start page in the Blueprint Studio appearance, **When** it loads, **Then** it shows the application name "Mermaid diagram editor" and uses only the Blueprint Studio palette and type faces.

- **BI-001** Expresses: FR-001, US1-AS1. Verified by: VO-008, MV-003.
  - **Given** the start page with no stored appearance preference
  - **When** it loads
  - **Then** it shows the application name "Mermaid diagram editor"
  - **And** its surfaces and text use only the Blueprint Studio palette (background `#071C30`, panel `#0D2B45`, ivory `#F1E9D7` text) and the interface and source faces

## US1-AS2

> **Given** an open diagram, **When** the editor loads, **Then** the header shows the application name, the diagram's name, the document actions (copy source, copy Markdown, save file and any others offered today) and undo/redo, and the canvas takes most of the window.

- **BI-002** Expresses: FR-005, FR-006, US1-AS2. Verified by: VO-009.
  - **Given** a diagram of each type open at 1440 × 900
  - **When** the editor loads
  - **Then** the header shows the application name, the diagram's name with Rename, Copy Source, Copy for Markdown, Save file, Undo, Redo and the appearance switch
  - **And** the canvas is the largest area and covers at least half the window

## US1-AS3

> **Given** an open diagram, **When** the author compares the controls offered with those offered before the redesign, **Then** every earlier control is still offered, with the same name and effect, and no new control is offered that has no working effect.

- **BI-003** Expresses: FR-009, FR-023, US1-AS3. Verified by: VO-010.
  - **Given** a diagram of each type open at 1440 × 900
  - **When** its controls are listed by role and name and compared with those offered before the redesign
  - **Then** every earlier control is still offered with the same name and effect
  - **And** the only new controls are the appearance switch's two buttons, each with an accessible name and a working effect

## US1-AS4

> **Given** the editor in either appearance, **When** the author uses the appearance switch in the header, **Then** every surface changes to the other appearance at once, and the diagram, selection, any draft label, undo history and generated source are unchanged.

- **BI-004** Expresses: FR-026, US1-AS4. Verified by: VO-011.
  - **Given** the editor in either appearance with an item selected, a label draft open and an undoable edit made
  - **When** the author chooses the other appearance in the header
  - **Then** every surface (page, panels, toolbar, canvas) changes to the other appearance at once
  - **And** the diagram, selection, draft text, Undo availability and generated source are unchanged

## US1-AS5

> **Given** any control, **When** it is hovered, focused, pressed, disabled, or reports success or an error, **Then** each state is visibly distinct, amber is used only for emphasis and warnings, and red only for actual errors.

- **BI-005** Expresses: FR-004, FR-021, FR-022, US1-AS5, EC-10. Verified by: VO-012, VO-003.
  - **Given** a control in the editor
  - **When** it is hovered, focused by keyboard, pressed and disabled, and the editor reports a success and an error
  - **Then** each state looks distinct, warnings and emphasis are amber and errors red, each with its text
  - **And** transitions last at most 200 ms, nothing animates while idle, and no transition runs when reduced motion is requested

## US2-AS1

> **Given** a canvas at default zoom, **When** it is shown, **Then** a minor grid is drawn every 16 px and a major grid every 80 px (5 minor cells), both faint enough that items, labels and lines stand out clearly above them.

- **BI-006** Expresses: FR-011, US2-AS1. Verified by: VO-015, VO-016, MV-001.
  - **Given** a canvas of each diagram type at default zoom, in Blueprint Studio and in Light
  - **When** it is shown
  - **Then** a minor grid is drawn every 16 px and a major grid every 80 px in the appearance's grid colours, the major more visible than the minor
  - **And** items, labels and lines stand out clearly above the grid

## US2-AS2

> **Given** a canvas that pans or zooms, **When** the author pans or zooms, **Then** the grid moves and scales with the drawing so that an item keeps the same position relative to the grid lines.

- **BI-007** Expresses: FR-013, US2-AS2, EC-04, EC-05, SC-006. Verified by: VO-017, VO-015.
  - **Given** an item on a canvas of each diagram type
  - **When** the author pans (flowchart) or scrolls (sequence, C4) and zooms to the minimum, default and maximum zoom
  - **Then** the grid moves and scales with the drawing so the item keeps its position relative to the grid lines, to within 1 px
  - **And** at minimum zoom only the major grid is shown

## US2-AS3

> **Given** any canvas, **When** the author presses, drags, hovers or double-activates anywhere, **Then** the grid and any decoration never receive the event, and every gesture behaves exactly as before the redesign.

- **BI-008** Expresses: FR-012, FR-016, US2-AS3. Verified by: VO-018, VO-021.
  - **Given** any canvas
  - **When** the author presses, drags, hovers or double-activates on any point, including points that show only grid
  - **Then** the grid never receives the event
  - **And** every gesture behaves exactly as before the redesign

## US2-AS4

> **Given** a selected item, **When** it is shown, **Then** its cyan selection highlight is clearly distinguishable from the hover outline and from an unselected item.

- **BI-009** Expresses: FR-015, US2-AS4, EC-07. Verified by: VO-019.
  - **Given** an item in each diagram type
  - **When** it is hovered and then selected
  - **Then** unselected items are drawn in the canvas ink on the node fill and hover shows the dashed outline
  - **And** the selected item's outline is in the cyan selection colour and wider, clearly distinct from the hover outline and from an unselected item

## US2-AS5

> **Given** a line being drawn, **When** valid ends are ringed and one is under the pointer, **Then** the rings and the line preview use the drafting style and remain distinguishable from each other as they are today.

- **BI-010** Expresses: FR-015, US2-AS5. Verified by: VO-020.
  - **Given** a line being drawn from a flowchart node, a sequence lifeline or a C4 element
  - **When** valid ends are ringed and one is under the pointer
  - **Then** valid ends show a thin dashed ring and the end under the pointer a thick solid ring, in the drafting palette
  - **And** the line preview is visible in the canvas ink

## US3-AS1

> **Given** a diagram, **When** the source view is shown, **Then** its text is character-for-character the text that Copy source places on the clipboard, highlighted, in a monospace face, and cannot be edited.

- **BI-011** Expresses: FR-017, US3-AS1. Verified by: VO-022, VO-023.
  - **Given** a diagram of each type
  - **When** the source view is shown
  - **Then** its text is character-for-character the text Copy Source places on the clipboard
  - **And** it is highlighted (keywords, identifiers, labels, arrows and comments distinct), in a monospace face, and typing into it changes nothing

## US3-AS2

> **Given** an edit, undo or redo, **When** it completes, **Then** the source view shows the new generated source.

- **BI-012** Expresses: FR-017, US3-AS2. Verified by: VO-024.
  - **Given** the source view expanded
  - **When** an edit, an Undo or a Redo completes
  - **Then** the source view shows the newly generated source

## US3-AS3

> **Given** source Mermaid rejects, **When** the status is shown, **Then** it is in the error colour with the reason in text; a notice is in amber with its text; acceptance is in the success colour; colour is never the only cue.

- **BI-013** Expresses: FR-018, FR-004, US3-AS3, EC-06. Verified by: VO-006, VO-007.
  - **Given** the source status
  - **When** it is invalid, has a notice, is valid or is being checked
  - **Then** invalid is shown in the error colour with the reason in text, a notice in amber with its text, valid in the success colour, checking in the muted colour
  - **And** every state has text, so colour is never the only cue

## US4-AS1

> **Given** the flowchart preview in Blueprint Studio, **When** it is drawn, **Then** nodes, labels, outlines and connectors use the blueprint look and every shape is still the shape Mermaid draws for it.

- **BI-014** Expresses: FR-019, US4-AS1. Verified by: VO-025, VO-026.
  - **Given** the flowchart preview in Blueprint Studio for a diagram with every node shape
  - **When** it is drawn
  - **Then** nodes are filled with the blueprint node fill, outlined in cyan, labelled in ivory, and connectors are clearly visible
  - **And** every shape has the outline Mermaid draws for it

## US4-AS2

> **Given** an open preview, **When** the author switches to Light, **Then** the preview is redrawn in Mermaid's default look.

- **BI-015** Expresses: FR-019, US4-AS2. Verified by: VO-027.
  - **Given** the flowchart preview open in Blueprint Studio
  - **When** the author switches to Light
  - **Then** the preview is redrawn in Mermaid's default look without being closed

## US4-AS3

> **Given** imported source containing its own style or class statements, **When** its picture is drawn, **Then** those styles are visible over the blueprint defaults.

- **BI-016** Expresses: FR-019, US4-AS3. Verified by: VO-028.
  - **Given** source with a style statement giving node A a pink fill and a class statement giving node B its own fill, drawn by the editor's drawing function in Blueprint Studio (no editor screen draws such source: import drops styles)
  - **When** it is drawn
  - **Then** A is drawn in its pink fill and B in its class's fill
  - **And** nodes without their own style use the blueprint defaults

## US4-AS4

> **Given** any diagram, **When** source or Markdown is copied or the diagram is saved to a file, **Then** the result is identical to what the editor produced before the redesign for the same diagram.

- **BI-017** Expresses: FR-019, FR-024, US4-AS4. Verified by: VO-029, VO-021.
  - **Given** a diagram of each type, in Blueprint Studio and in Light
  - **When** source or Markdown is copied or the diagram is saved to a file
  - **Then** the copied text equals the generated source (in a Markdown fence for Markdown) with no theme or init directive
  - **And** the copied texts and saved files are identical across appearances and to what the editor produced before the redesign

## US5-AS1

> **Given** a window narrower than the wide layout needs, **When** the editor is shown, **Then** the canvas occupies most of the window and the tools and source areas are reachable through clearly labelled panel controls.

- **BI-018** Expresses: FR-010, US5-AS1. Verified by: VO-032, VO-033.
  - **Given** the editor at 800 px and at 360 px wide
  - **When** it is shown
  - **Then** a labelled "Tools" control opens the toolbox and properties and the labelled "Mermaid source" disclosure opens the source view
  - **And** with both closed the canvas covers at least half the window

## US5-AS2

> **Given** a collapsed tools panel, **When** the author opens it, selects a property and closes it, **Then** the selection and any draft label are kept and the canvas is unchanged.

- **BI-019** Expresses: FR-010, US5-AS2. Verified by: VO-034.
  - **Given** the editor at 800 px with the tools panel closed and an item selected
  - **When** the author opens the tools panel, types a label draft in Properties and closes the panel
  - **Then** the selection and the draft text are kept
  - **And** the canvas's zoom and position are unchanged

## US5-AS3

> **Given** any width from 360 px upward, **When** the editor is shown, **Then** the page never scrolls horizontally and the header controls stay reachable (wrapping or collapsing into a labelled menu).

- **BI-020** Expresses: FR-010, US5-AS3, SC-005. Verified by: VO-035.
  - **Given** the editor of each type at 360, 768 and 1440 px wide
  - **When** it is shown
  - **Then** the page never scrolls horizontally
  - **And** every control offered before the redesign is reachable and works, through the labelled "More actions" menu at 360 px

## US5-AS4

> **Given** a supported mobile browser, **When** the author creates, edits, saves and copies a diagram by touch, **Then** every operation available on desktop can be completed.

- **BI-021** Expresses: FR-027, US5-AS4, SC-009. Verified by: VO-036, VO-037, VO-038, VO-039.
  - **Given** emulated Chrome on Android and Safari on iOS
  - **When** the author creates, edits (add, connect, move or reorder, rename, delete, Undo, Redo), saves, opens and copies a flowchart, a sequence diagram and a C4 diagram by touch
  - **Then** every operation has the same result as on desktop, and a copy reports success only when the text reached the clipboard
  - **And** every control is at least 24 × 24 px and every connection handle's hit area at least 28 px

## Other behaviours

- **BI-022** Expresses: FR-001, FR-002. Verified by: VO-001.
  - **Given** the two appearances' token sets
  - **When** they are read
  - **Then** each defines every token group (surfaces, text, accent, states, canvas, borders, source highlighting, type, shape, motion)
  - **And** Blueprint Studio uses `#071C30`, `#0D2B45`, `#174565`, `#72D7F2`, `#F1E9D7`, `#E8AD63` and `#A9C0D0` in their named roles and adds an error red and a success colour
- **BI-023** Expresses: FR-001, SC-004. Verified by: VO-002.
  - **Given** the editor's interface parts
  - **When** every colour on screen is traced
  - **Then** each comes from a named design token, and no colour value is written outside the token definitions
- **BI-024** Expresses: FR-002, FR-020, EC-08, EC-09. Verified by: VO-003, VO-004.
  - **Given** both appearances
  - **When** contrast is measured and accessibility checks run on the start page, each editor with a selection and a notice, the import dialog with an error, and each dialog
  - **Then** text meets 4.5:1 and focus indicators, outlines and boundaries 3:1, including the canvas attribution link and the focus ring on navy
  - **And** the checks report no contrast or focus violation
- **BI-025** Expresses: FR-003, FR-025, SC-008. Verified by: VO-005, MV-002.
  - **Given** the editor loaded with network requests recorded
  - **When** it is used and the appearance switched
  - **Then** no request is made after load
  - **And** interface text is in the device's sans-serif face and source text in its monospace face
  - **And** no dependency is added
- **BI-026** Expresses: FR-007. Verified by: VO-030.
  - **Given** a diagram of each type at 1440 × 900 with an item selected
  - **When** the tools area is shown
  - **Then** it holds that type's toolbox and the selected item's properties
- **BI-027** Expresses: FR-008. Verified by: VO-031.
  - **Given** an open diagram
  - **When** the canvas is zoomed with the buttons and the wheel and an edit is made
  - **Then** the status area shows the zoom level following each change, the save status and the source check status
  - **And** it offers no grid or snap control
- **BI-028** Expresses: FR-014. Verified by: exemption FR-014.
  - **Given** the canvas
  - **When** it is shown
  - **Then** no drafting border or registration mark is drawn, so none can cover content, take events or reach copied or saved output
- **BI-029** Expresses: FR-016, FR-023, FR-024, SC-001, SC-007. Verified by: VO-021.
  - **Given** the editor after the redesign
  - **When** the existing unit and desktop end-to-end suites, timing tests included, are run
  - **Then** every test that passed before passes, so hit areas, handle sizes, gestures, shortcuts, names, announcements, generation, files, persistence and timing are as before
- **BI-030** Expresses: FR-026. Verified by: VO-013, VO-014.
  - **Given** a stored appearance preference
  - **When** the editor loads after Light was chosen, after an unknown value was stored, with nothing stored, or with storage that fails
  - **Then** Light is restored after it was chosen
  - **And** any other case opens in Blueprint Studio with no error shown
  - **And** the preference is never part of a diagram, a saved file or copied output
- **BI-031** Expresses: FR-028. Verified by: VO-040, VO-041.
  - **Given** each diagram type on emulated Chrome on Android and Safari on iOS
  - **When** one finger drags across empty canvas, two fingers pinch apart and together, and an item is double-tapped
  - **Then** the drawing pans or scrolls with the finger
  - **And** the drawing zooms within the zoom buttons' limits while the page itself does not zoom
  - **And** the double-tapped item opens for renaming
- **BI-033** Expresses: FR-026. Verified by: VO-042.
  - **Given** browser storage that refuses to save
  - **When** the other appearance is chosen
  - **Then** the appearance changes for the session
  - **And** a notice says the choice could not be saved for next time, and no notice appears when saving succeeds
- **BI-034** Expresses: FR-028. Verified by: VO-043.
  - **Given** a sequence participant or a C4 element being dragged by one finger on emulated Chrome on Android and Safari on iOS
  - **When** a second finger touches down and moves before the drag ends
  - **Then** the second finger is ignored and the drag continues to its end with the usual result
  - **And** the zoom is unchanged
- **BI-035** Expresses: SC-002. Verified by: VO-044.
  - **Given** every import corpus document and every valid end-to-end fixture diagram
  - **When** its source, Markdown and saved file are produced after the redesign
  - **Then** each is byte-identical to what the editor produced for it before the redesign
- **BI-036** Expresses: SC-007, EC-01. Verified by: VO-045.
  - **Given** a flowchart, a sequence and a C4 diagram of 100 elements and 150 relationships
  - **When** items are dragged, the canvas panned or scrolled, and zoomed
  - **Then** each action takes no longer than before the redesign, within 10 % of its median
  - **And** in Firefox, scrolling a sequence or C4 diagram, and any action whose baseline median is under 100 ms, may take one extra frame (1000/60 ms) more than that
- **BI-032** Expresses: EC-01, EC-02, EC-03. Verified by: MV-001.
  - **Given** diagrams of each type with 100 elements and 150 relationships, long and labelled connections, in each appearance
  - **When** they are viewed at minimum, default and maximum zoom
  - **Then** every label and line is readable above the grid
  - **And** long labels wrap or truncate as before
