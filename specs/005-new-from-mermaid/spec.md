# Feature Specification: New Diagram From Mermaid Text (One-Way Import)

**Feature Branch**: `feature/005-new-from-mermaid`

**Created**: 2026-10-20

**Status**: Draft

**Grilled on**: 2026-10-20

**Input**: User description: "Start a new diagram from an existing Mermaid text document (import-only, one way)". Problem: a developer who already has a Mermaid diagram in a README, a design doc or a repository cannot bring it into the editor; they must redraw it by hand. Scope: a "New from Mermaid…" way to start a flowchart, sequence or C4 diagram from pasted or opened Mermaid text, with a preview and a report of anything that could not be kept. Out of scope: live two-way text editing, exporting other formats, importing from a URL.

**Builds on**: `specs/002-visual-diagram-editor/spec.md` (the editor spec), whose model, validation, escaping, storage, file format and accessibility rules apply unchanged unless stated here.

## Clarifications

### Session 2026-10-20

- Q: What should the import do with node shapes and line endings the editor does not have? → A: Approximate each to the nearest editor shape or ending (for example double circle → circle, asymmetric → rectangle, `--o` → plain line), keep the diagram connected, and list every approximation in the Import report as "approximated" with what it became.
- Q: What should the new diagram be called? → A: The front-matter `title:` if there is one, else the C4 `title` line, else the editor's usual default name for a new diagram. The name is shown in the dialog and can be renamed there before confirming.
- Q: May the developer confirm when the report lists dropped content? → A: Yes, always, when the text is valid. The report is informational and never blocks; the confirm control's accessible description states the counts (for example "Import, 3 constructs dropped").
- Q: How is an imported flowchart laid out? → A: A layered layout: nodes are placed in ranks along the direction keyword (TD top to bottom, LR left to right, RL and BT reversed), connected nodes sit in neighbouring ranks, spacing is even and no two nodes overlap. Positions are computed once at import and then belong to the developer. A later "tidy up" command is out of scope.
- Q: What happens to messages inside a sequence `loop`, `alt` or `opt` block? → A: The messages are kept in order and the block wrapper is dropped. The block's start and end lines, notes, activations and `autonumber` are listed as dropped with their line numbers, and the report entry names which block each kept message was inside.
- Q: Which block is imported from a Markdown file with several Mermaid blocks? → A: Always the first. Each further block is listed in the Import report as *ignored* (starting line and first line), so nothing is silent; there is no block chooser, and the developer pastes another block to import it.
- Q (asked during planning, 2026-10-20): What does a label with HTML, such as `A[<b>Pay</b> now]`, import as? → A: The tags are stripped and the text kept ("Pay now"); each label that had tags is listed in the Import report as *dropped* with its line number. A line break (`<br>`) is always kept as a line break.

## Dependency: the project's rules currently forbid this

`setup.md` (Scope) and the constitution (Principle I and the Technology and scope section) excluded importing Mermaid source. Both were amended and approved by the Business Analyst, Lee Sinclair, on 2026-10-20 (constitution v1.3.0): import is allowed as a one-way way to *start* a diagram, and the visual model remains the only source of truth. Direct source editing stays excluded.

## Vocabulary

- **Document**: the Mermaid text the developer pastes or opens.
- **Import**: reading a document into a new visual diagram, once. After it, the diagram is an ordinary diagram; nothing keeps it linked to the document.
- **Import report**: the list, shown with the preview, of everything in the document that was dropped or approximated, each with its line number and a plain reason.
- **Supported**: a construct the editor's model can hold today (editor spec).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a diagram from Mermaid I already have (Priority: P1)

A developer has a Mermaid flowchart in a README. On the start screen they choose "New from Mermaid…", paste the text, see the diagram appear in a preview beside the text, check that it looks right, and confirm. The editor opens on the new diagram with every node and connection in place, ready to edit visually.

**Why this priority**: This is the whole point of the feature: no redrawing. Without it, nothing else matters.

**Independent Test**: Paste a valid flowchart with five nodes and six connections into the dialog, confirm, and check the editor shows the same nodes, shapes, labels, connection types and endpoints, and the source panel shows an equivalent flowchart.

**Acceptance Scenarios**:

1. **Given** the start screen, **When** the developer chooses "New from Mermaid…", **Then** a dialog opens with a paste area and a way to choose a file, with focus in the paste area.
2. **Given** a valid flowchart document, **When** it is pasted, **Then** within one second a preview shows the diagram, the dialog names the detected type, and the Import report says nothing was dropped.
3. **Given** a valid document and a shown preview, **When** the developer confirms, **Then** a new diagram is created and opened in the editor, and nothing is created if they cancel.
4. **Given** an imported diagram, **When** the developer undoes, **Then** nothing is undone (the import is the starting point, not an edit), and the diagram can be edited, saved and reopened like any other.
5. **Given** a valid sequence or C4 document, **When** it is pasted and confirmed, **Then** the same holds for participants and messages, or for elements, boundaries and relationships, with the type and, for C4, the kind detected from the first line.

---

### User Story 2 - See exactly what was kept, dropped or changed (Priority: P1)

A developer pastes a document that uses features the editor cannot hold (subgraphs, styling, notes). The import still works for everything it can represent, and an Import report lists each thing that was dropped or approximated, with its line number, so they know what to redo by hand and are never surprised.

**Why this priority**: Silent loss would destroy trust in the feature. Honest reporting is what makes a partial import usable.

**Independent Test**: Import a document with one subgraph, one `classDef`, one note and one comment; check the diagram holds the supported parts and the report lists the first three with their line numbers and a reason, and the comment as ignored.

**Acceptance Scenarios**:

1. **Given** a document with unsupported constructs, **When** it is pasted, **Then** the preview shows what can be represented and the Import report lists each dropped or approximated construct with its line number and a one-line reason.
2. **Given** the Import report, **When** the developer selects an entry, **Then** the matching line of the document is highlighted in the paste area.
3. **Given** a node shape or line ending the editor has no exact match for, **When** the report is shown, **Then** the node or line is kept as the nearest editor shape or ending (for example double circle as circle, asymmetric as rectangle, `--o` as a plain line), and the report says it was approximated and what it became.
4. **Given** nothing was dropped, **When** the report is shown, **Then** it says so plainly instead of being empty.
5. **Given** the report is announced to assistive technology, **When** the preview updates, **Then** the number of entries is announced without moving focus.

---

### User Story 3 - Fix mistakes in the text with precise errors (Priority: P2)

A developer pastes a document with a syntax error. The dialog says which line and column, in words they can act on, shows no diagram, and does not allow confirming until the text is valid.

**Why this priority**: Errors are common in pasted text, and a vague failure wastes the time the feature is meant to save. It follows the happy path in importance.

**Independent Test**: Paste a flowchart with an unclosed bracket; check the dialog names the line and column of the problem, the confirm control is unavailable, and fixing the text in the paste area clears the error and shows the preview.

**Acceptance Scenarios**:

1. **Given** text that Mermaid cannot parse, **When** it is pasted, **Then** an error shows the message with line and column and the offending line is marked, and Confirm is disabled.
2. **Given** an error is shown, **When** the developer edits the text so it is valid, **Then** the error clears and the preview appears within one second of the last keystroke.
3. **Given** text that is valid Mermaid but of a diagram type the editor does not support (for example a class diagram), **When** it is pasted, **Then** the dialog says which type it found and which types are supported, and Confirm is disabled.
4. **Given** empty text, **When** the dialog is open, **Then** no error is shown, only a hint of what can be pasted.

---

### User Story 4 - Compare the original with what the editor will generate (Priority: P2)

A developer wants to be sure the import preserved their intent. They open a compare view that shows the original text beside the Mermaid the editor will generate for the imported diagram, with differences marked, so they can see exactly what changed (ids, escaping, ordering, dropped lines).

**Why this priority**: It builds trust in the result and lets a developer judge the import against their own text. It is not needed to complete an import.

**Independent Test**: Import a document, open the compare view, and check both texts are shown side by side with each differing line marked and the dropped constructs from the report visible as removed lines.

**Acceptance Scenarios**:

1. **Given** a valid document, **When** the developer opens the compare view, **Then** the original and the generated text are shown side by side with differing lines marked by more than colour.
2. **Given** the generated text is normalised, **When** the original already matches the normal form, **Then** the compare view says the texts are identical apart from nothing.
3. **Given** a dropped construct, **When** the compare view is open, **Then** its original lines appear as removed.

---

### User Story 5 - Bring a file in by dropping or choosing it (Priority: P3)

A developer has a `.mmd`, `.md` or `.txt` file. They drop it on the start screen, or choose it in the dialog, and the dialog opens with its text loaded. From a Markdown file the first Mermaid code block is used, and the Import report says how many further blocks were not imported.

**Why this priority**: A convenience on top of pasting; the core flow works without it.

**Independent Test**: Drop a `.md` file with two Mermaid blocks on the start screen; check the dialog opens with the first block loaded and says a second one exists and how to use it.

**Acceptance Scenarios**:

1. **Given** the start screen, **When** the developer drops a supported file on it, **Then** the "New from Mermaid…" dialog opens with the file's Mermaid text loaded.
2. **Given** a Markdown file with several Mermaid blocks, **When** it is opened, **Then** only the first block is loaded and the Import report lists each further block as *ignored*, with its starting line number and first line.
3. **Given** a file that is not text or is too large, **When** it is chosen, **Then** the dialog explains why it was not loaded and changes nothing.

---

### Edge Cases

- EC-01: Mermaid front matter, a `%%{init}%%` directive or an `accTitle`/`accDescr` line is not a diagram element; it is reported as ignored with its line number, never silently dropped.
- EC-02: A document with several diagrams (several `flowchart` headers) imports only the first and the report says the rest were not imported.
- EC-03: Labels with Mermaid escapes (`#quot;`, `&amp;`, `<br/>`), quotes, Unicode and line breaks import as the same text the editor would have typed, and generate to the editor's own escaping.
- EC-04: Duplicate or reused ids in the document (the same node mentioned twice, a node defined after use) refer to one item, as Mermaid does; an id used for two different labels keeps the first label and reports the later one.
- EC-05: A Sequence document using `autonumber`, `activate`/`deactivate`, aliases or `create`/`destroy` is imported without them and reports each.
- EC-06: A C4 document whose kind cannot be detected, or that mixes kinds, is refused with the kinds named.
- EC-07: Very large documents (hundreds of nodes) keep the dialog responsive: typing stays smooth and the preview updates when the developer pauses, never blocking input (above about 150 items the picture may be drawn on request, FR-003).
- EC-08: A document over the editor's size limits (editor spec) is refused with the limit stated, rather than half imported.
- EC-09: Text pasted while the preview is still rendering the previous text replaces it; only the latest text is ever shown.
- EC-10: Escape closes the dialog without asking, whether it is empty or holds text; the text is kept in memory and is still there if the developer reopens the dialog in the same visit.
- EC-11: Two editor tabs: confirming creates a diagram only in the tab where the dialog is open; the other tab is unaffected.
- EC-12: Pasted text is never run or fetched: links and `click` handlers are dropped, and HTML tags in labels are stripped (the text kept); each is reported as dropped, and the document is shown as text everywhere in the dialog.
- EC-13: A `%%` comment line (not a `%%{init}%%` directive) is not a diagram element; it is reported as ignored with its line number, one entry per line, never silently dropped.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The start screen MUST offer "New from Mermaid…" beside the existing ways to start a diagram, reachable by pointer and keyboard.
- **FR-002**: The dialog MUST accept pasted text and a chosen or dropped file (`.mmd`, `.md`, `.txt`), and MUST detect the diagram type from the document (flowchart; sequence; each of the C4 kinds the editor supports) and show it.
- **FR-003**: The dialog MUST show a live preview of the diagram that would be created, updating within one second of the last change to the text, and MUST create a diagram only when the developer confirms; cancelling MUST create nothing. For documents above about 150 items, the picture MAY instead be drawn on request (a Show preview control) if live drawing would break the typing budget of SC-005; parsing, the Import report and Import stay live.
- **FR-004**: Text that Mermaid cannot parse MUST block confirming and MUST be reported with the message, line and column; the same parser the editor uses to check its own generated source MUST be the one that judges the text.
- **FR-005**: The import MUST keep everything the editor's model can hold: node shapes, labels and connection types and endings (flowchart); participants, actors, message styles and texts in order (sequence); elements, element types, descriptions, technologies, boundaries and nesting, relationships and their direction and labels, and the diagram title (C4).
- **FR-006**: Everything not kept MUST be listed in the Import report with its source line number and a one-line reason, grouped as *dropped* or *approximated* (with what it became). The import MUST NEVER lose content without a report entry. Messages inside a sequence block (`loop`, `alt`, `opt` and the like) MUST be kept in order, with the block itself reported as dropped and the entry naming the kept messages' block. Dropped or approximated entries MUST NOT block confirming; the confirm control's accessible description MUST state how many constructs were dropped and approximated.
- **FR-007**: The Import report MUST say so when nothing was dropped, MUST let the developer dismiss it, and selecting an entry MUST highlight its line in the text.
- **FR-008**: An imported flowchart MUST be given positions by an automatic layout that follows the document's direction keyword (top-down, left-right and so on) and places connected nodes in neighbouring ranks along that direction with even spacing, leaves no two nodes overlapping, and computes positions once at import (no later re-layout); Sequence and C4 diagrams MUST use their existing order-driven layout.
- **FR-009**: Labels MUST import to the text the editor would have typed (escapes and entities decoded) and MUST generate back with the editor's own escaping (editor spec, FR-006).
- **FR-010**: A compare view MUST show the original text beside the generated text, with differences and removed lines marked by more than colour. The generated text is the editor's normal output and need not equal the original.
- **FR-011**: A confirmed import MUST produce a diagram stored and saved exactly like any other (same storage and file format, with no change to the format version unless unavoidable), with unique stable item ids, a name taken from the document's front-matter `title:`, else its C4 `title` line, else the editor's default name for a new diagram (the name is shown in the dialog and can be changed there before confirming), and an empty undo history.
- **FR-012**: A Markdown file with several Mermaid blocks MUST load only the first and MUST list each further block in the Import report as *ignored* with its starting line number and first line; there is no block chooser. To import another block the developer pastes it.
- **FR-013**: The dialog MUST be fully keyboard-operable, meet WCAG 2.2 AA, give the paste area, preview, report, compare view and each control an accessible name, announce validation results and the report in a polite live region without moving focus, and keep focus management correct on open and close.
- **FR-014**: Importing MUST make no network request, MUST NOT execute or follow anything in the document (links, click handlers, HTML), and MUST NOT add a runtime dependency unless the plan justifies it.
- **FR-015**: The source panel MUST stay read-only. Nothing in the editor lets a developer edit Mermaid text and have it change the diagram after the import.
- **FR-016**: A document of a type the editor does not support, with several diagrams, or larger than the editor's size limits MUST be refused or reduced with an explicit message naming the reason (EC-02, EC-06, EC-08).

### Key Entities

- **Document**: the Mermaid text, its detected diagram type and, for a file, its name and, if it came from a Markdown file, that it was the first Mermaid block.
- **Import result**: the diagram that would be created, plus the Import report; exists only while the dialog is open.
- **Import report entry**: a line number (and column where known), a category (dropped, approximated, ignored), the construct's name and a one-line reason.
- **Imported diagram**: an ordinary diagram (editor spec) that carries no link to its document.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can go from a diagram in a README to the same diagram open in the editor in under 30 seconds, without redrawing anything.
- **SC-002**: For a sample set of at least 30 flowchart, sequence and C4 documents that use only supported constructs, drawn from the MIT-licensed `mermaid-js/mermaid` and `mermaid-js/mermaid-cli` repositories' test and demo files (and this repository's own documents), 100% import with every node, participant, element, connection, message and relationship present and correctly labelled.
- **SC-003**: For documents that use unsupported constructs, 100% of dropped or approximated constructs appear in the Import report with the correct line number; zero silent losses across the sample set.
- **SC-004**: 100% of syntax errors in a set of at least 20 deliberately broken documents are reported with the correct line, and none can be confirmed.
- **SC-005**: The preview updates within 1 second for documents up to 100 nodes, and typing in the paste area never stalls for more than 100 ms for documents up to 500 nodes.
- **SC-006**: 100% of imported diagrams, once saved and reopened, are identical to the imported result, and generated source for a document already in the editor's normal form equals the document.
- **SC-007**: The dialog, report and compare view show no WCAG 2.2 AA violations, and every control is reachable and operable with the keyboard alone.
- **SC-008**: In a short usability check with at least 5 developers, at least 4 complete an import, including reading the report, without help (recommended follow-up; it does not block release).

## Assumptions

- `setup.md` and the constitution (v1.3.0) were amended on 2026-10-20 to allow a one-way import that starts a new diagram (see Dependency). Direct source editing remains excluded.
- Supported diagram types are exactly those the editor has today: flowchart, sequence, and C4 context, container, component, dynamic and deployment.
- Where a document holds several diagrams, only the first is imported (the same holds for Markdown blocks, which are reported as ignored). A document that mixes unsupported and supported content imports the supported content and reports the rest (the developer's stated preference).
- Positions for flowcharts are not stored in Mermaid text, so an automatic layout is applied once at import; the developer arranges nodes afterwards as for any flowchart.
- The generated source is the editor's normal form, not a byte-for-byte copy of the document; the compare view exists to show the difference.
- The existing size limits for diagrams and files (editor spec) apply to imports.
- Importing uses the same Mermaid parser already shipped with the editor, so no new runtime dependency is expected; if mapping a parsed result to the model needs more than that parser exposes, the plan must justify any addition.
