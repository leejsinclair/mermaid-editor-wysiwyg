# Behaviour Checklist: 005-new-from-mermaid

**Specification**: [spec.md](../spec.md) | **Verification Plan**: [plan.md](../plan.md#verification-plan) | **Tasks**: [tasks.md](../tasks.md)

## US1-AS1

> **Given** the start screen, **When** the developer chooses "New from Mermaid…", **Then** a dialog opens with a paste area and a way to choose a file, with focus in the paste area.

- **BI-001** Expresses: FR-001, US1-AS1. Verified by: VO-001.
  - **Given** the start screen is open
  - **When** the developer chooses New from Mermaid… by pointer or by keyboard
  - **Then** a dialog opens with a paste area and a way to choose a file, and focus is in the paste area
  - **And** the entry sits beside the existing ways to start a diagram

## US1-AS2

> **Given** a valid flowchart document, **When** it is pasted, **Then** within one second a preview shows the diagram, the dialog names the detected type, and the Import report says nothing was dropped.

- **BI-002** Expresses: FR-002, FR-003, US1-AS2. Verified by: VO-002, VO-005.
  - **Given** the dialog is open
  - **When** a valid five-node flowchart is pasted
  - **Then** within one second a preview shows the diagram
  - **And** the dialog names the detected type
  - **And** the Import report says nothing was dropped

## US1-AS3

> **Given** a valid document and a shown preview, **When** the developer confirms, **Then** a new diagram is created and opened in the editor, and nothing is created if they cancel.

- **BI-003** Expresses: FR-003, US1-AS3. Verified by: VO-003.
  - **Given** a valid document and a shown preview
  - **When** the developer confirms
  - **Then** a new diagram is created and opened in the editor
  - **And** cancelling instead creates nothing

## US1-AS4

> **Given** an imported diagram, **When** the developer undoes, **Then** nothing is undone (the import is the starting point, not an edit), and the diagram can be edited, saved and reopened like any other.

- **BI-004** Expresses: FR-011, US1-AS4. Verified by: VO-004.
  - **Given** an imported diagram is open
  - **When** the developer undoes
  - **Then** nothing is undone, because Undo is unavailable
  - **And** the diagram can be edited, saved and reopened like any other, and reopened it holds the edit and everything imported

## US1-AS5

> **Given** a valid sequence or C4 document, **When** it is pasted and confirmed, **Then** the same holds for participants and messages, or for elements, boundaries and relationships, with the type and, for C4, the kind detected from the first line.

- **BI-005** Expresses: FR-002, FR-005, US1-AS5. Verified by: VO-005, VO-006.
  - **Given** a valid sequence document or a valid C4 document
  - **When** it is pasted and confirmed
  - **Then** the editor opens on a diagram of the detected type, and for C4 the detected kind, taken from the first line
  - **And** it holds every participant and message in order, or every element, boundary, relationship and title

## US2-AS1

> **Given** a document with unsupported constructs, **When** it is pasted, **Then** the preview shows what can be represented and the Import report lists each dropped or approximated construct with its line number and a one-line reason.

- **BI-006** Expresses: FR-006, US2-AS1. Verified by: VO-017, VO-019.
  - **Given** a document with unsupported constructs
  - **When** it is pasted
  - **Then** the preview shows what can be represented
  - **And** the Import report lists each dropped or approximated construct with its line number and a one-line reason

## US2-AS2

> **Given** the Import report, **When** the developer selects an entry, **Then** the matching line of the document is highlighted in the paste area.

- **BI-007** Expresses: FR-007, US2-AS2. Verified by: VO-021.
  - **Given** an Import report with entries
  - **When** the developer selects an entry
  - **Then** the matching line of the document is highlighted in the paste area

## US2-AS3

> **Given** a node shape or line ending the editor has no exact match for, **When** the report is shown, **Then** the node or line is kept as the nearest editor shape or ending (for example double circle as circle, asymmetric as rectangle, `--o` as a plain line), and the report says it was approximated and what it became.

- **BI-008** Expresses: FR-006, US2-AS3. Verified by: VO-020.
  - **Given** a node shape or line ending the editor has no exact match for
  - **When** the report is shown
  - **Then** the node or line is kept as the nearest editor shape or ending, for example double circle as circle, asymmetric as rectangle, `--o` as a plain line
  - **And** the report says it was approximated and what it became

## US2-AS4

> **Given** nothing was dropped, **When** the report is shown, **Then** it says so plainly instead of being empty.

- **BI-009** Expresses: FR-007, US2-AS4. Verified by: VO-022.
  - **Given** nothing was dropped
  - **When** the report is shown
  - **Then** it says so plainly instead of being empty
  - **And** it can be dismissed and shown again

## US2-AS5

> **Given** the report is announced to assistive technology, **When** the preview updates, **Then** the number of entries is announced without moving focus.

- **BI-010** Expresses: FR-013, US2-AS5. Verified by: VO-023.
  - **Given** the report is announced to assistive technology
  - **When** the preview updates
  - **Then** the number of entries is announced
  - **And** focus does not move

## US3-AS1

> **Given** text that Mermaid cannot parse, **When** it is pasted, **Then** an error shows the message with line and column and the offending line is marked, and Confirm is disabled.

- **BI-011** Expresses: FR-004, SC-004, US3-AS1. Verified by: VO-012, VO-013.
  - **Given** text that Mermaid cannot parse
  - **When** it is pasted
  - **Then** an error shows Mermaid's message with the line and column
  - **And** the offending line is marked by more than colour
  - **And** no diagram is shown and Import is disabled
  - **And** none of at least twenty deliberately broken documents can be imported, and each is reported at the correct line

## US3-AS2

> **Given** an error is shown, **When** the developer edits the text so it is valid, **Then** the error clears and the preview appears within one second of the last keystroke.

- **BI-012** Expresses: US3-AS2. Verified by: VO-014.
  - **Given** an error is shown
  - **When** the developer edits the text so it is valid
  - **Then** the error clears and the preview appears within one second of the last keystroke

## US3-AS3

> **Given** text that is valid Mermaid but of a diagram type the editor does not support (for example a class diagram), **When** it is pasted, **Then** the dialog says which type it found and which types are supported, and Confirm is disabled.

- **BI-013** Expresses: US3-AS3. Verified by: VO-015.
  - **Given** valid Mermaid text of a diagram type the editor does not support, for example a class diagram
  - **When** it is pasted
  - **Then** the dialog says which type it found and which types are supported
  - **And** Import is disabled

## US3-AS4

> **Given** empty text, **When** the dialog is open, **Then** no error is shown, only a hint of what can be pasted.

- **BI-014** Expresses: US3-AS4. Verified by: VO-016.
  - **Given** empty text, or only spaces, in the open dialog
  - **When** the dialog is shown
  - **Then** no error is shown, only a hint of what can be pasted
  - **And** Import is disabled

## US4-AS1

> **Given** a valid document, **When** the developer opens the compare view, **Then** the original and the generated text are shown side by side with differing lines marked by more than colour.

- **BI-015** Expresses: FR-010, US4-AS1. Verified by: VO-029, VO-032.
  - **Given** a valid document
  - **When** the developer opens the compare view
  - **Then** the original and the generated text are shown side by side
  - **And** differing lines are marked with a text marker as well as a style, in order and with line numbers

## US4-AS2

> **Given** the generated text is normalised, **When** the original already matches the normal form, **Then** the compare view says the texts are identical apart from nothing.

- **BI-016** Expresses: US4-AS2. Verified by: VO-030.
  - **Given** a document already in the editor's normal form
  - **When** the compare view is opened
  - **Then** it says the original already matches the generated text

## US4-AS3

> **Given** a dropped construct, **When** the compare view is open, **Then** its original lines appear as removed.

- **BI-017** Expresses: US4-AS3. Verified by: VO-031.
  - **Given** a document with a dropped construct
  - **When** the compare view is open
  - **Then** the construct's original lines appear as removed

## US5-AS1

> **Given** the start screen, **When** the developer drops a supported file on it, **Then** the "New from Mermaid…" dialog opens with the file's Mermaid text loaded.

- **BI-018** Expresses: US5-AS1. Verified by: VO-038.
  - **Given** the start screen is open
  - **When** the developer drops a .mmd, .md or .txt file on it
  - **Then** a drop target is shown while the file is over the page
  - **And** the dialog opens with the file's Mermaid text loaded

## US5-AS2

> **Given** a Markdown file with several Mermaid blocks, **When** it is opened, **Then** only the first block is loaded and the Import report lists each further block as *ignored*, with its starting line number and first line.

- **BI-019** Expresses: FR-012, US5-AS2. Verified by: VO-039.
  - **Given** a Markdown file with several Mermaid blocks
  - **When** it is opened
  - **Then** only the first block is loaded
  - **And** the report lists each further block as ignored with its starting line number and first line

## US5-AS3

> **Given** a file that is not text or is too large, **When** it is chosen, **Then** the dialog explains why it was not loaded and changes nothing.

- **BI-020** Expresses: US5-AS3. Verified by: VO-040.
  - **Given** a file that is not text, or is too large
  - **When** it is chosen
  - **Then** the dialog explains why it was not loaded
  - **And** nothing is changed

## Other behaviours

- **BI-021** Expresses: FR-005. Verified by: VO-007, VO-008, VO-009, VO-010, VO-011.
  - **Given** a valid flowchart, sequence or C4 document using only constructs the editor can hold
  - **When** it is imported
  - **Then** every node shape, connection type and ending, participant, actor and message style, element type, description, technology, boundary and nesting, relationship direction and label, and the C4 title is kept as in the document
  - **And** two relationships between the same two elements are both kept
  - **And** Dynamic relationships are numbered by position
- **BI-022** Expresses: FR-006, EC-05. Verified by: VO-018.
  - **Given** a sequence document with loop, alt, opt, par or critical blocks, notes, activations, autonumber, create or destroy
  - **When** it is imported
  - **Then** the messages inside blocks are kept in order and the block wrappers are dropped
  - **And** every block line, note, activation, autonumber, create and destroy has an entry with its line number
  - **And** each kept message's entry names its block
- **BI-023** Expresses: FR-006. Verified by: VO-024.
  - **Given** a valid document with dropped or approximated constructs
  - **When** the developer looks at Import
  - **Then** Import is enabled
  - **And** its accessible description states how many constructs were dropped and approximated
- **BI-024** Expresses: FR-008. Verified by: VO-025, VO-026.
  - **Given** a flowchart document with a direction keyword
  - **When** it is imported
  - **Then** nodes are placed in ranks along the direction, an edge outside a cycle ends in a later rank than it starts, spacing is even and no two nodes overlap
  - **And** the positions are the same every time and are not arranged again after the developer moves nodes, adds nodes or reopens the diagram
- **BI-025** Expresses: FR-009, EC-03, SC-006. Verified by: VO-027, VO-028.
  - **Given** labels with escapes, entities, quotes, Unicode, line breaks or HTML tags
  - **When** they are imported
  - **Then** each is the text the editor would have typed, line breaks are line breaks, and tags are stripped with the text kept and reported as dropped
  - **And** generating the source and importing it again gives the same source
- **BI-026** Expresses: FR-011, SC-006. Verified by: VO-033, VO-034, VO-035.
  - **Given** a confirmed import
  - **When** the diagram is created
  - **Then** it is stored and saved like any other, with the current format version and unique stable item ids
  - **And** its name is the front-matter title, else the C4 title, else the default, and can be changed in the dialog before confirming
  - **And** a blank name cannot be confirmed
- **BI-027** Expresses: FR-011. Verified by: VO-036.
  - **Given** browser storage fails when the developer confirms
  - **When** the import is attempted
  - **Then** nothing is created, a message says the diagram could not be saved and why, and the text stays in the dialog
- **BI-028** Expresses: FR-002. Verified by: VO-056.
  - **Given** the dialog is open
  - **When** the developer chooses a file in it
  - **Then** the file's text is loaded into the paste area and checked like pasted text
- **BI-029** Expresses: FR-013, SC-007. Verified by: VO-043, VO-044.
  - **Given** the dialog in each of its states
  - **When** it is used with the keyboard alone and checked for accessibility
  - **Then** every control is reachable, operable and named, focus is in the paste area on opening and returns to the opener on closing, and no WCAG 2.2 AA violation is found
- **BI-030** Expresses: FR-014, EC-12. Verified by: VO-045, VO-046.
  - **Given** a document with a link, a click handler and HTML in a label
  - **When** it is imported
  - **Then** no network request other than the app's own files is made and nothing is followed or run
  - **And** links and click handlers are dropped and tags stripped, each with a report entry, and the document is shown as text
- **BI-031** Expresses: FR-015. Verified by: VO-047.
  - **Given** an imported diagram is open
  - **When** the developer looks for a way to edit Mermaid text
  - **Then** the source panel stays read-only and nothing in the editor lets Mermaid text change the diagram
- **BI-032** Expresses: FR-016, EC-08. Verified by: VO-041.
  - **Given** text larger than the editor's file limit, or C4 nested deeper than the editor allows
  - **When** it is pasted
  - **Then** it is refused with the limit stated and nothing is half imported
- **BI-033** Expresses: FR-016, EC-06. Verified by: VO-042.
  - **Given** a document of an unsupported type, or a C4 document whose kind cannot be detected or that has two kinds
  - **When** it is pasted
  - **Then** it is refused or reduced with a message naming the reason and, for C4, the kinds found
- **BI-034** Expresses: EC-01, EC-13. Verified by: VO-048.
  - **Given** a document with front matter, an init directive, accTitle or accDescr lines, or `%%` comments
  - **When** it is imported
  - **Then** each is listed as ignored with its line number and none becomes a diagram element
- **BI-035** Expresses: EC-02. Verified by: VO-037.
  - **Given** a document with several diagrams
  - **When** it is imported
  - **Then** only the first is imported and the report says the rest were not imported
- **BI-036** Expresses: EC-04. Verified by: VO-049.
  - **Given** a node mentioned twice, defined after use, or an id used for two labels
  - **When** it is imported
  - **Then** each id is one item, as Mermaid reads it, and an id used for two labels is reported
- **BI-037** Expresses: EC-07, SC-005. Verified by: VO-050.
  - **Given** a document of 100 nodes, and one of 500 nodes being typed
  - **When** it is pasted or typed
  - **Then** the preview appears within one second for 100 nodes
  - **And** typing never stalls more than 100 ms for 500 nodes
- **BI-038** Expresses: EC-09. Verified by: VO-051.
  - **Given** text pasted while the preview of earlier text is still being made
  - **When** the later text arrives
  - **Then** only the preview and report of the latest text are shown
- **BI-039** Expresses: EC-10. Verified by: VO-052.
  - **Given** the dialog is closed with Escape
  - **When** it is empty, or has text and is reopened in the same visit
  - **Then** the empty dialog closes without asking, and the text is still there on reopening
- **BI-040** Expresses: EC-11. Verified by: VO-053.
  - **Given** the dialog open in two tabs
  - **When** the developer confirms in one
  - **Then** a diagram is created only in that tab and the other tab is unaffected
- **BI-041** Expresses: SC-002. Verified by: VO-054.
  - **Given** at least 30 documents using only supported constructs
  - **When** they are imported
  - **Then** every node, participant, element, connection, message and relationship is present and correctly labelled
- **BI-042** Expresses: SC-003. Verified by: VO-055.
  - **Given** documents with unsupported constructs
  - **When** they are imported
  - **Then** every dropped or approximated construct appears in the report with the correct line number, and no line is lost silently
