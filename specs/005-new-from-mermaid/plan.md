# Implementation Plan: New Diagram From Mermaid Text (One-Way Import)

**Branch**: `feature/005-new-from-mermaid` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-new-from-mermaid/spec.md`

## Summary

A developer with Mermaid text already in hand can start a flowchart, sequence or C4 diagram from it. The start screen
gets **New from Mermaid…** (and accepts a dropped `.mmd`, `.md` or `.txt` file), which opens a dialog with a paste area,
a file picker, the detected type, a live preview drawn from the diagram the import would create, an Import report, a
name field and a compare view. Mermaid's own parser judges the text and reports errors with line and column. A pure
import layer turns what the parser (flowchart, sequence) or the project's statement reader (C4) found into the visual
model, lays flowcharts out in layers following the direction keyword, and lists every construct it dropped,
approximated or ignored with its line number. Confirming saves an ordinary diagram first and then opens it, so it
reopens identically and Undo starts empty. No model, saved record, file format or generated source changes, and no
runtime dependency is added. Details: [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript ~6.0, strict, ES2022 (unchanged)

**Primary Dependencies**: React 19, React Router 8, `@mui/material` ^9.5, `@xyflow/react` ^12.12, `mermaid` ^12.2
(unchanged). No new dependency: the parser is already shipped and loaded lazily, and the layout is written for this
feature (research R1, R6).

**Storage**: The existing browser store (IndexedDB) and file format, unchanged. The document text and report are
held in memory only, never stored.

**Testing**: Vitest (`npm test`) for the pure layer, the adapter contract tests (jsdom, the real parser) and the corpus;
Playwright (`npm run test:e2e`, Chromium and Firefox) for the dialog

**Target Platform**: Current stable Chromium-based browsers and Firefox on desktop (unchanged)

**Project Type**: Web application, client-only single-page app (unchanged)

**Performance Goals**: Preview within 1 s for documents up to 100 nodes; typing never stalls more than 100 ms for
documents up to 500 nodes (SC-005); layout of 500 nodes in well under 100 ms

**Constraints**: Constitution layers kept; no DOM in the import layer; WCAG 2.2 AA; no network; nothing in the document
is executed or followed; files and pasted text up to 5 MiB (the editor's file limit)

**Scale/Scope**: 1 new pure folder (about 10 modules), 1 Mermaid adapter, 1 dialog with 3 parts (report, compare,
preview), a changed start screen, one extracted drawing function, one new library function, about 80 new text strings

## Constitution Check

*GATE: must pass before research; re-checked after design.*

| Principle or constraint | Status | How the plan meets it |
|-------------------------|--------|-----------------------|
| I. Visual model is the source of truth (v1.3.0) | Pass | Mermaid text is read once, to start a diagram, into the visual model; every dropped or approximated construct is reported; the source panel stays read-only and the dialog's text is never an editable state after the import (nothing is stored but the model) |
| II. Layered architecture | Pass | New pure folder `app/importing/` imports only model, validation, generation and text; no earlier layer imports it. The only DOM or parser access is the adapter in the composition layer and the dialog in rendering |
| III. Test-first | Pass | Verification Plan below; every requirement and scenario has an obligation; the generated source of each imported fixture is validated by Mermaid's parser |
| IV. Invalid operations never corrupt | Pass | A diagram that fails `checkDiagram` is refused whole; cancel and a failed save create nothing; cycles, fan-in, fan-out, self-loops and disconnected nodes are kept as the document has them |
| V. Undoable, consistent, honest feedback | Pass | The import is the starting point, so Undo starts empty (US1-AS4); success is shown only after the record is saved (research R10); unsupported or refused input gets an explicit message |
| Technology and scope | Pass | Excluded list reads "Mermaid source import other than starting a new diagram" (v1.3.0); direct source editing, SVG export and URL import stay out; no new dependency |
| Workflow: ambiguity raised, not assumed | Pass | Seven decisions in spec Clarifications (one asked during planning, EC-12); four plan-level choices are listed in research under "Decisions to overrule" |

Post-design re-check: unchanged, all Pass. No Complexity Tracking entry is needed.

### Design constraints

- **DC-01** The saved diagram, the stored record and the file format do not change: an imported diagram is written with
  the current format version and is accepted by the same checks as an opened file.

## Project Structure

### Documentation (this feature)

```text
specs/005-new-from-mermaid/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (dialog data and the rules from document to model)
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── import-dialog.md     # the dialog, states, messages, test hooks
│   └── import-reading.md    # the pure import: input, output, report rules
├── checklists/
│   └── requirements.md
├── tests/
│   └── behaviour-checklist.md   # Phase 1 output (integrated TDD)
└── tasks.md             # Phase 2 output (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
app/
├── importing/                 # new, pure: no DOM, no React, no Mermaid import
│   ├── document.ts            # size limit, Markdown blocks, front matter, directives, type detection
│   ├── scan.ts                # per-line classification: kept, dropped, ignored, with names
│   ├── report.ts              # report entry types, ordering, counts, wording
│   ├── decode.ts              # entity and <br> decoding, tag stripping (moved from test support)
│   ├── flowchart.ts           # snapshot to nodes and connections, shape and line tables
│   ├── sequence.ts            # snapshot to participants and messages, block handling
│   ├── c4.ts                  # statement reader and mapping per kind
│   ├── layout.ts              # layered layout, four directions
│   ├── naming.ts              # name from front matter, C4 title, default
│   ├── compare.ts             # line diff
│   ├── readDocument.ts        # the one entry point: text and parser in, Outcome out
│   └── corpus/                # sample documents used by the corpus tests
├── editor/
│   ├── mermaidSnapshot.ts     # new: Mermaid's parser and diagram database to the snapshots (lazy)
│   ├── mermaidParser.ts       # also reports the error location
│   └── library.ts             # createImported: saves an imported diagram as a new record
├── rendering/
│   ├── import/
│   │   ├── ImportDialog.tsx   # new: the dialog
│   │   ├── ImportReport.tsx   # new: grouped entries, counts, live region
│   │   ├── CompareView.tsx    # new: side-by-side diff
│   │   ├── PasteArea.tsx      # new: text area with gutter, marked and selected lines
│   │   └── useImport.ts       # new: debounce, latest-only, file reading, outcome state
│   └── shared/MermaidPicture.tsx   # extracted from the flowchart preview: draw source with Mermaid
├── routes/start.tsx           # New from Mermaid… button, drop target, dialog
└── text/en.ts                 # dialog, report and refusal wording
e2e/                           # import-*.spec.ts; support/import.ts (open dialog, paste, read report)
```

**Structure Decision**: The existing single-project layout. All decisions about what an import means are in one pure
folder that tests can drive with strings; the browser parts are thin.

## Complexity Tracking

None.

## Verification Plan

### Verification commands

| ID | Command | Scope | Source |
|----|---------|-------|--------|
| unit | `npm test -- {select}` | focused | package.json script `test` (Vitest) |
| unit-all | `npm test` | broad | package.json script `test` (Vitest) |
| e2e | `npm run test:e2e -- {select}` | focused | package.json script `test:e2e` (Playwright) |
| e2e-all | `npm run test:e2e` | broad | package.json script `test:e2e` (Playwright) |

### Verification obligations

| ID | Requirements | Scenario | Expected outcome | Level | Origin |
|----|--------------|----------|------------------|-------|--------|
| VO-001 | FR-001, US1-AS1 | On the start screen, the developer chooses New from Mermaid… with the pointer, and again with the keyboard alone | A dialog with a paste area and a way to choose a file opens, focus is in the paste area, and the button sits beside the three existing ways to start a diagram | end-to-end | planned |
| VO-002 | FR-002, FR-003, US1-AS2 | A valid five-node flowchart is pasted | Within one second the detected type is named, a picture of the diagram is shown, and the Import report says nothing was dropped | end-to-end | planned |
| VO-003 | FR-003, US1-AS3 | With a shown preview the developer confirms, and in a second run cancels | Confirming creates one new diagram and opens it in the editor; cancelling leaves the saved list exactly as it was | end-to-end | planned |
| VO-004 | FR-011, US1-AS4 | After an import the developer looks at Undo, edits a label, reloads the page and reopens the diagram from the start screen | Undo is unavailable at first, the diagram can be edited and saved, and reopened it holds the edit and everything imported | end-to-end | planned |
| VO-005 | FR-002, US1-AS5 | Documents whose first significant line follows blank lines, comments, front matter or an init directive start with each supported header, and with an unsupported one | Flowchart (also written graph), sequence and each of the five C4 kinds are detected; an unsupported header is reported as that header; nothing is detected for empty text | unit | planned |
| VO-006 | FR-005, US1-AS5 | A valid sequence document and a valid document of each C4 kind are pasted and confirmed | The editor opens on a diagram of the detected type and kind holding every participant and message in order, or every element, boundary, nesting level, relationship and title | end-to-end | planned |
| VO-007 | FR-005 | A flowchart snapshot holds every node shape and every connection type the editor has, with and without labels, chains, a self-loop, parallel connections and a cycle | Each node and connection comes out with the same shape, line style, ending, label and endpoints; ids are 1 upward in document order | unit | planned |
| VO-008 | FR-005 | Each flowchart shape form and arrow operator is read by Mermaid's real parser | The reading reports the form Mermaid reports for it, so a Mermaid upgrade that changes it fails here | contract | planned |
| VO-009 | FR-005 | A sequence snapshot holds participants, actors, aliases, implicit participants, all eight message styles, self-messages and equal labels | Participants keep their order, role and alias label; messages keep their order, style, ends and text | unit | planned |
| VO-010 | FR-005 | Each sequence arrow operator and each actor form is read by Mermaid's real parser | The reading reports the type Mermaid reports for it, so a Mermaid upgrade that changes it fails here | contract | planned |
| VO-011 | FR-005 | C4 documents of each kind hold every element macro with its database, queue and external forms, descriptions, technologies, nested boundaries, Deployment nodes, one-way, two-way and numbered relationships, two relationships between the same two elements, and a title | Every element, boundary, nesting level, relationship (including both between the same pair), direction, label, technology and the title is kept; Dynamic relationships are numbered by position | unit | planned |
| VO-012 | FR-004, US3-AS1 | A flowchart with an unclosed bracket is pasted | An error shows Mermaid's message with the line and column, the offending line is marked in a way that is not colour alone, no picture is shown and Import is disabled | end-to-end | planned |
| VO-013 | FR-004, SC-004 | At least twenty deliberately broken documents of all three types, some with front matter and some with the error at the end of the text, are judged | Each is rejected by the same parser that checks the editor's own source, with the correct line and a column, and none can be read into a diagram | contract | planned |
| VO-014 | US3-AS2 | After an error is shown the developer corrects the text | The error clears and the picture appears within one second of the last keystroke | end-to-end | planned |
| VO-015 | US3-AS3 | A valid class diagram is pasted | The dialog names the type it found and lists the supported types, no picture is shown and Import is disabled | end-to-end | planned |
| VO-016 | US3-AS4 | The dialog is open with no text, and again with only spaces | No error is shown, only a hint of what can be pasted, and Import is disabled | end-to-end | planned |
| VO-017 | FR-006, US2-AS1 | A flowchart snapshot and text hold a subgraph, classDef, class, style, linkStyle, click, a `:::` class and a link, among supported parts | The supported nodes and connections are kept; each unsupported construct has one entry with its line number and a one-line reason; the nodes of a dropped subgraph are kept | unit | planned |
| VO-018 | FR-006, EC-05 | A sequence document holds loop, alt, opt, par and critical blocks, notes, activations (activate, deactivate and the plus and minus forms), autonumber, create, destroy, boxes and links | Messages inside blocks are kept in order; every block start, else and end line, note, activation, autonumber, create, destroy, box and link has an entry with its line number, and each kept message's entry names its block | unit | planned |
| VO-019 | FR-006 | A C4 document holds style, layout and tag lines, directional relationship forms and a relationship to an alias that was never declared | Each such line has an entry with its line number; the direction hint is reported, the relationship kept; a relationship with an unknown end is dropped and reported | unit | planned |
| VO-020 | FR-006, US2-AS3 | A document holds a double circle, asymmetric, trapezoid and unknown-shape node, circle and cross endings, an invisible link, a C4 element and boundary the kind does not offer, a blank-labelled message and out-of-order Dynamic numbers | Each is kept as the nearest editor value (or dropped, for the invisible link) and its entry says approximated with what it became | unit | planned |
| VO-021 | FR-007, US2-AS2 | The developer activates a report entry | The matching line of the text is selected and scrolled into view in the paste area | end-to-end | planned |
| VO-022 | FR-007, US2-AS4 | A document with nothing unsupported is pasted, and the developer hides and shows the report | The report says plainly that nothing was dropped or approximated instead of being empty, and can be dismissed and brought back | end-to-end | planned |
| VO-023 | FR-013, US2-AS5 | The preview updates after each of two edits | The number of entries is announced in a polite status region and focus stays where it was | end-to-end | planned |
| VO-024 | FR-006 | A document with dropped and approximated constructs is valid | Import stays enabled and its accessible description states the counts | end-to-end | planned |
| VO-025 | FR-008 | Flowcharts of each direction keyword with a chain, a fan-out, a cycle, a disconnected node and 500 nodes are laid out | Along the direction each edge outside a cycle ends in a later rank than it starts, ranks are evenly spaced, no two nodes overlap, coordinates are whole numbers inside the editor's bounds, the result is identical on every run, and 500 nodes take under 100 ms | unit | planned |
| VO-026 | FR-008 | After an import the developer moves a node, adds another, reloads and reopens | Positions are as the developer left them; nothing is arranged again | end-to-end | planned |
| VO-027 | FR-009, EC-03 | Labels hold the entity forms, numeric entities, named HTML entities, line breaks, quotes, Unicode and HTML tags | They decode to the text the editor would have typed, line breaks become line breaks, and tags are stripped with the text kept and the label reported as dropped | unit | planned |
| VO-028 | FR-009, SC-006 | For each diagram the generation tests already cover, the generated source is imported and generated again | The second source equals the first, and the imported diagram equals the original apart from positions | contract | planned |
| VO-029 | FR-010, US4-AS1 | With a valid document the developer opens the compare view | Original and generated text are side by side, and each differing line carries a text marker as well as a style | end-to-end | planned |
| VO-030 | US4-AS2 | A document already in the editor's normal form is compared | The view states that the original already matches the generated text | end-to-end | planned |
| VO-031 | US4-AS3 | A document with a dropped construct is compared | The dropped construct's original lines appear as removed | end-to-end | planned |
| VO-032 | FR-010 | Two texts that are equal, differ in a line, lack a line and gain a line are compared | Lines are classed as the same, changed, removed or added, in order, with line numbers on each side | unit | planned |
| VO-033 | FR-011 | Documents with a front-matter title, a C4 title only, both and neither are named, and the same text is imported twice | The name is the front-matter title, else the C4 title, else the default; ids are unique and identical across both runs | unit | planned |
| VO-034 | FR-011 | The developer renames the diagram in the dialog, then tries a blank name | The opened diagram, the saved list and the editor carry the new name; a blank name cannot be confirmed | end-to-end | planned |
| VO-035 | FR-011, SC-006, DC-01 | Imported diagrams of each type are written as a file, opened again, and also saved and reloaded | They pass the same checks as any opened file, carry the current format version and equal what was imported | contract | planned |
| VO-036 | FR-011 | Browser storage fails when the developer confirms | Nothing is created, a message says the diagram could not be saved and why, and the text stays in the dialog | end-to-end | planned |
| VO-037 | FR-012, EC-02 | A Markdown text with three Mermaid blocks, and a block with a second header, are split | The first block is returned with its line offset; each further block is listed as ignored with the line it starts on and its first line; a second header in one block is reported as not imported | unit | planned |
| VO-038 | US5-AS1 | The developer drops a supported file on the start screen | A drop target is shown while the file is over the page, and the dialog opens with the file's text loaded | end-to-end | planned |
| VO-039 | FR-012, US5-AS2 | A Markdown file with two Mermaid blocks is dropped | Only the first block is loaded and the report lists the second as ignored with its starting line and first line | end-to-end | planned |
| VO-040 | US5-AS3 | A binary file and a file over the size limit are chosen | The dialog says why each was not loaded and changes nothing | end-to-end | planned |
| VO-041 | FR-016, EC-08 | Text over 5 MiB, and a C4 document nested deeper than 50 levels | Each is refused with the limit stated and no diagram is produced | unit | planned |
| VO-042 | FR-016, EC-06 | A document of an unsupported type, a C4 document with no recognisable kind and a text with two different C4 headers | Each is refused or reduced with a message that names the reason and, for C4, the kinds found | unit | planned |
| VO-043 | FR-013, SC-007 | The dialog is checked for accessibility violations when empty, with a preview, with an error, with a report and with the compare view open | No WCAG 2.2 AA violations are found in any state | end-to-end | planned |
| VO-044 | FR-013 | An import is completed with the keyboard alone, then dismissed with Escape | Every control is reachable and named, focus starts in the paste area, and focus returns to the control that opened the dialog | end-to-end | planned |
| VO-045 | FR-014, EC-12 | A document with a link, a click handler and HTML in a label is imported while all network requests but the app's own files are blocked | No other request is made, nothing is followed or run, and every such construct appears as text | end-to-end | planned |
| VO-046 | FR-014, EC-12 | A flowchart with click, a link in a label and HTML tags in labels is read | Click and link are dropped with entries; tags are stripped from labels with an entry per label; no markup survives in any label | unit | planned |
| VO-047 | FR-015 | After an import the developer looks for a way to edit Mermaid text | The source panel offers no editing and nothing outside the start dialog accepts Mermaid text | end-to-end | planned |
| VO-048 | EC-01, EC-13 | A document opens with front matter, an init directive, accTitle and accDescr lines and `%%` comment lines | Each has an ignored entry with its line number, the title is used for the name, and the diagram is unaffected | unit | planned |
| VO-049 | EC-04 | A node is mentioned twice, defined after use, and an id is given two different labels | One node results for each id, as Mermaid reads it, and the second label is reported | unit | planned |
| VO-050 | EC-07, SC-005 | A 100-node document is pasted, and a 500-node document is typed into | The picture appears within one second for 100 nodes, and no keystroke is delayed more than 100 ms for 500 | end-to-end | planned |
| VO-051 | EC-09 | One document is pasted and a different one at once after | Only the picture and report for the later text are ever shown | end-to-end | planned |
| VO-052 | EC-10 | Escape is pressed on an empty dialog, and on a dialog with text which is then reopened in the same visit | The empty dialog closes without asking; the text is still there on reopening | end-to-end | planned |
| VO-053 | EC-11 | The dialog is open in two tabs and the developer confirms in one | One diagram is created and opened in that tab; the other tab's dialog and text are unaffected | end-to-end | planned |
| VO-054 | SC-002 | At least thirty documents using only supported constructs, across all three types | Every one imports with every node, participant, element, connection, message and relationship present and labelled as in the document | contract | planned |
| VO-055 | SC-003 | The same corpus with unsupported constructs added | Every non-blank line is represented or has an entry with the right line number; none is silent | contract | planned |
| VO-056 | FR-002 | The developer chooses a file in the dialog | The file's text is loaded into the paste area and checked like pasted text | end-to-end | planned |

### Verification exemptions

| Requirement | Reason | Alternative verification |
|-------------|--------|--------------------------|
| None | - | - |

### Manual verification

| ID | Covers | Steps | Expected result | Why not automated |
|----|--------|-------|-----------------|-------------------|
| MV-001 | SC-001 | Give a developer a README with a flowchart; time them from the start screen to the same diagram open in the editor | Under 30 seconds, nothing redrawn | A task time depends on a person |
| MV-002 | SC-008 | Ask at least five developers to import a document, read the report and confirm, without help | At least four finish unaided | A usability judgement; recommended follow-up that does not block release |
| MV-003 | FR-014 | Review the diff of package.json and the lock file | No runtime dependency is added | A review of what was and was not added |
| MV-004 | FR-013, SC-007 | Use the dialog, report and compare view with a screen reader | Opening, errors, the report count and the compare view are announced and operable | Real speech output cannot be asserted in a test |

### Behaviour checklist

Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).
