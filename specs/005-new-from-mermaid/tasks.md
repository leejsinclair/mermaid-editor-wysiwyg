---

description: "Task list for New Diagram From Mermaid Text (one-way import)"
---

# Tasks: New Diagram From Mermaid Text (One-Way Import)

**Input**: Design documents from `/specs/005-new-from-mermaid/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/import-dialog.md, contracts/import-reading.md, quickstart.md, tests/behaviour-checklist.md

**Tests**: Required. Every obligation VO-001 to VO-056 in the plan's Verification Plan has a test task placed before the task that delivers its behaviour. Manual checks MV-001 to MV-004 are recorded by a person with `tdd_check.py manual`, never by the agent.

**Organization**: Phase 2 holds the pure import pieces every story uses (label decoding, document splitting and type detection, naming, layout) and the Mermaid adapter contract tests. US1 delivers the three readers, the saved record and the dialog's happy path. US2 delivers the line scanner, the Import report and its approximations. US3 delivers errors and refusals. US4 delivers the compare view. US5 delivers files and dropping. Polish holds the accessibility, keyboard, performance, network, two-tab and source-panel checks and the full regression run.

## Format: `[ID] [P?] [Story] [Label] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to
- **[Label]**: `[VO-nnn]` or `[NT: reason]` (see "Verification labels" at the end)

## Path Conventions

- Single client-only project: source in `app/`, browser tests in `e2e/`, unit tests beside the code they test as `*.test.ts` (plan, Project Structure)
- Tests are run only through `python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py run --command <unit|unit-all|e2e|e2e-all> ...`
- Tests that need Mermaid's real parser start with `// @vitest-environment jsdom` and read through the adapter or `app/testing/mermaidReadback.ts`; every other unit test stays in the default node environment
- Tests open views as `page.goto("#/")`, with a leading `#` and no leading `/`; the shared helpers (open the dialog, paste, read the report) live in `e2e/support/import.ts`
- `app/importing/` imports only model, validation, generation and text; it has no DOM, no React and no Mermaid import (plan, Constitution Check II). The parser reaches it as a function argument
- No runtime dependency is added (FR-014, MV-003)
- The import e2e tests run on Chromium and Firefox (none needs clipboard read); only e2e/import-performance.spec.ts (T113) is Chromium-only, with `test.skip(({ browserName }) => browserName !== "chromium")`

---

## Phase 1: Setup

**Purpose**: Record the baseline before any behaviour changes.

- [X] T001 [NT: baseline run only] Record a `baseline` run of `unit-all` and `e2e-all` through `tdd_check.py run --phase baseline`, naming any test already failing in `--note`

**Checkpoint**: Baseline recorded.

---

## Phase 2: Foundational (pure pieces and the Mermaid adapter)

**Purpose**: The pure functions and the parser adapter every story uses (data-model.md, research R1, R4, R6, R8, R9, R11). No React.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] [VO-027] Write the failing unit test app/importing/decode.test.ts for `decodeLabel`: `#quot;`, numeric `#NN;`, `&amp; &lt; &gt; &quot; &apos; &nbsp;`, numeric `&#NN;`, `<br>` and `<br/>` as line breaks, quotes, Unicode, and HTML tags such as `<b>Pay</b> now` stripped with the text kept and the label flagged as having had tags (the caller reports it as dropped). Run `--phase red`
- [X] T003 [VO-027] Implement `decodeLabel` in app/importing/decode.ts by moving the entity decoding out of `decode` in app/testing/mermaidReadback.ts (which then imports it, so the generation fidelity tests keep passing) and adding named and numeric HTML entities and tag stripping, so T002 passes
- [X] T004 [P] [VO-005] Write the failing unit test app/importing/document.test.ts for `detectType`: a first significant line after blank lines, `%%` comments, a front-matter block and a `%%{init}%%` directive; `flowchart` and `graph`; `sequenceDiagram`; each of `C4Context`, `C4Container`, `C4Component`, `C4Dynamic`, `C4Deployment`; an unsupported header (`classDiagram`) reported as that word; `none` for empty text. Run `--phase red`
- [X] T005 [VO-005] Implement `detectType` in app/importing/document.ts (data-model.md, "Detection"; research R9) so T004 passes
- [X] T006 [P] [VO-037] Write the failing unit test in app/importing/document.test.ts for `splitDocument`: a Markdown text with three `mermaid` fences returns the first block with its line offset and lists the other two as ignored with the line of the fence and the block's first line; text with no fence is one block; front matter `title:` is returned with quotes removed; a second diagram header inside one block is listed as ignored. Run `--phase red`
- [X] T007 [VO-037] Implement `splitDocument` in app/importing/document.ts (research R9; `IgnoredBlock` and `Split document` of data-model.md) so T006 passes
- [X] T008 [P] [VO-033] Write the failing unit test app/importing/naming.test.ts for `nameFor`: front-matter title, else C4 title, else the editor's default name for the type; both present; neither present; a blank title falls through to the next source. Also in the same file: importing the same text twice gives identical ids (this half is completed by the readers in US1). Run `--phase red`
- [X] T009 [VO-033] Implement `nameFor` in app/importing/naming.ts, using the default names in app/model/newDiagram.ts, so the name cases of T008 pass
- [X] T010 [P] [VO-025] Write the failing unit test app/importing/layout.test.ts for `layoutFlowchart` over TD, LR, RL and BT: a chain, a fan-out, a cycle, a self-loop, a disconnected node and 500 nodes. Assert each non-cycle edge ends in a later rank along the direction, ranks evenly spaced, no two footprints overlap, whole non-negative coordinates inside the editor's bounds (`checkDiagram` bounds), identical output on a second run, and 500 nodes in under 100 ms. Run `--phase red`
- [X] T011 [VO-025] Implement `layoutFlowchart` in app/importing/layout.ts (research R6: cycle breaking by depth-first back edges, longest-path ranks, four barycentre sweeps, even spacing from `NODE_WIDTH` and `NODE_HEIGHT`, mirrored for BT and RL) so T010 passes
- [X] T012 [P] [VO-013] Write the failing contract test app/editor/mermaidParser.test.ts (jsdom) with at least twenty deliberately broken documents of flowchart, sequence and C4 type, some with front matter and some with the error at the end of the text (an unclosed bracket at the end reports past the last line). For each, `parseLocated` rejects, returns the message and a 1-based line (the last non-blank line when the location is past the end, plus the front-matter offset) and a column. Include a check that `hash.loc` is the source of the line (research R4). Run `--phase red`
- [X] T013 [VO-013] Extend app/editor/mermaidParser.ts with `parseLocated(source)` returning `{ ok: true }` or `{ ok: false, message, line, column }` from Mermaid's `hash.loc` (research R4), keeping `parseWithMermaid` unchanged, and shorten the expected-token list of the message to its first five entries, so T012 passes
- [X] T014 [P] [VO-008] Write the failing contract test app/editor/mermaidSnapshot.flowchart.test.ts (jsdom) for `snapshotFlowchart(text)`: each node shape form (`[ ]`, `( )`, `([ ])`, `[( )]`, `(( ))`, `{ }`, `{{ }}`, `[/ /]`, `[\ \]`, `[/ \]`, `[\ /]`, `> ]`, `((( )))`, and `@{ shape: ... }`) and each arrow operator (`-->`, `---`, `-.->`, `==>`, `<-->`, `--o`, `--x`, `o--o`, `x--x`, `~~~`, with and without text), chains, `A --> B & C`, `:::` classes, subgraphs and direction. Assert the snapshot reports the shape, arrow and stroke words Mermaid reports, so an upgrade that changes them fails here. Run `--phase red`
- [X] T015 [VO-008] Implement `snapshotFlowchart` in app/editor/mermaidSnapshot.ts: lazily import Mermaid like `parseWithMermaid`, register the diagram types, read `getDiagramFromText(...).db` for vertices, edges, direction and subgraphs into the `FlowchartSnapshot` of data-model.md (plain data, no Mermaid objects), so T014 passes
- [X] T016 [P] [VO-010] Write the failing contract test app/editor/mermaidSnapshot.sequence.test.ts (jsdom) for `snapshotSequence(text)`: `participant`, `actor`, `actor` with `@{ "type": ... }`, `as` aliases, implicit participants, each of the eight arrow operators (`->>`, `-->>`, `->`, `-->`, `-x`, `--x`, `-)`, `--)`), `+`/`-` activation suffixes, blocks, notes and `autonumber`. Assert the numeric type Mermaid reports for each operator and the actor role. Run `--phase red`
- [X] T017 [VO-010] Implement `snapshotSequence` in app/editor/mermaidSnapshot.ts into the `SequenceSnapshot` of data-model.md so T016 passes

**Checkpoint**: Run `unit-all` as a `checkpoint`. The pure pieces and the adapter pass; nothing is wired to the UI.

---

## Phase 3: User Story 1 - Start a diagram from Mermaid I already have (Priority: P1) 🎯 MVP

**Goal**: Paste a valid flowchart, sequence or C4 document, see it detected and drawn, confirm, and land in the editor on an ordinary saved diagram with an empty Undo.

**Independent Test**: Quickstart step 1; then paste a sequence document and a C4 Container document and confirm each.

### Readers and the saved record

- [X] T018 [P] [US1] [VO-007] Write the failing unit test app/importing/flowchart.test.ts for `readFlowchart(snapshot)`: a snapshot holding every shape and connection type the editor has, with and without labels, a chain, a self-loop, parallel connections and a cycle. Assert shape, line style, ending, label and endpoints; ids 1 upward in document order (nodes by first appearance, then connections); `nextId` one more than the last; a bare id becomes a rectangle labelled with the id; positions come from `layoutFlowchart`. Run `--phase red`
- [X] T019 [US1] [VO-007] Implement app/importing/flowchart.ts (exact shape and line tables of research R7 for the forms the editor holds; labels through `decodeLabel`; `layoutFlowchart` for positions) so T018 passes
- [X] T020 [P] [US1] [VO-009] Write the failing unit test app/importing/sequence.test.ts for `readSequence(snapshot)`: participants, actors, aliases as labels, implicit participants, all eight message styles, self-messages and equal labels. Assert order, role, alias label, message ends, style and text. Run `--phase red`
- [X] T021 [US1] [VO-009] Implement app/importing/sequence.ts (the message style table of data-model.md; actor of another kind becomes a participant; steps that are not messages are skipped here and reported in US2) so T020 passes
- [X] T022 [P] [US1] [VO-011] Write the failing unit test app/importing/c4.test.ts for `readC4(text, kind)`: documents of each kind holding every element macro in its plain, `Db`, `Queue` and `_Ext` forms, descriptions and technologies as `alias, label, [technology,] [description]`, nested boundaries (`Enterprise_Boundary`, `System_Boundary`, `Container_Boundary`, `Boundary`), Deployment nodes (`Deployment_Node`, `Node`, `Node_L`, `Node_R`), `Rel`, `BiRel` and `RelIndex`, two relationships between the same two elements (both kept), and `title`. Assert every element, boundary, nesting level, relationship, direction, label, technology and the title; Dynamic relationships numbered by position. Run `--phase red`
- [X] T023 [US1] [VO-011] Implement the statement reader and mapping in app/importing/c4.ts (research R1: not the Mermaid database, which merges relationships; depth-first; ids per research R10) so T022 passes
- [X] T024 [P] [US1] [VO-041] Write the failing unit test app/importing/readDocument.test.ts for the limits: text over the 5 MiB `MAX_FILE_BYTES` is refused as `tooLarge` before anything else is read; a C4 document nested deeper than 50 levels is refused as `tooDeep`; each refusal names the limit and yields no diagram. Run `--phase red`
- [X] T025 [US1] [VO-041] Implement app/importing/readDocument.ts per contracts/import-reading.md ("Order of work": empty, size, split and detect, parse, snapshot, build, name, layout, `checkDiagram`; a result `checkDiagram` rejects is `refused` with `notValid`; never throws) with the size check and the C4 depth refusal, so T024 passes. Cases for the other outcomes are added in their own stories
- [X] T026 [P] [US1] [VO-033] Extend the unit test app/importing/readDocument.test.ts: the same text imported twice gives identical ids and an identical diagram, and ids are unique. Run `--phase red` if it fails, otherwise record a `no-meaningful-red` exception citing T025
- [X] T027 [US1] [VO-033] Make T026 pass in app/importing/readDocument.ts: name from `nameFor` and ids as numbered by the readers, with no clock or random source in the pure layer (`changedAt` empty, data-model.md rule 6)
- [X] T028 [P] [US1] [VO-028] Write the failing contract test app/importing/roundtrip.test.ts (jsdom): for each diagram the generation tests already cover (reuse the builders in app/testing/c4Builder.ts and app/testing/sequenceBuilder.ts and the flowchart fixtures), generate the source, import it through `readDocument` with the real adapter, and generate again. Assert the second source equals the first and the imported diagram equals the original apart from node positions. Run `--phase red`
- [X] T029 [US1] [VO-028] Close the gaps the T028 run finds in app/importing/flowchart.ts, sequence.ts and c4.ts (escaping, line breaks, ordering) without changing the generated source format, so T028 passes
- [X] T030 [P] [US1] [VO-035] Write the failing contract test app/importing/saved.test.ts (jsdom): imported diagrams of each type are written as a file and opened again through `openFile`, and saved and loaded again through the codec. Assert they pass the same checks as any opened file, carry `CURRENT_FORMAT_VERSION`, and equal what was imported. Run `--phase red`
- [X] T031 [US1] [VO-035] Add `createImported(diagram, name)` to app/editor/library.ts: assign a new `crypto.randomUUID()` id, stamp `changedAt`, write the record with the existing `putRecord` before returning the id, and let a storage failure surface as a rejected result with its reason (research R10); no change to the codec or format so T030 passes

### The dialog's happy path

- [X] T032 [P] [US1] [VO-001] Write the failing e2e test e2e/import-open.spec.ts and the helper e2e/support/import.ts: on the start screen, **New from Mermaid…** is a button beside the three type buttons; choosing it with the pointer, and again with the keyboard alone, opens the dialog named **New from Mermaid** with a textbox **Mermaid text**, a button **Choose file…**, and focus in the textbox. Run `--phase red`
- [X] T033 [US1] [VO-001] Add the wording used so far (about 20 of the new strings: title, labels, hint) to app/text/en.ts, add the button to app/routes/start.tsx, and add the modal dialog shell in app/rendering/import/ImportDialog.tsx with the text area in app/rendering/import/PasteArea.tsx (a `textarea` with an aligned read-only line gutter, contracts/import-dialog.md "Layout"); MUI `Dialog` restores focus on close, so T032 passes
- [X] T034 [P] [US1] [VO-002] Write the failing e2e test e2e/import-preview.spec.ts: pasting a valid five-node flowchart shows, within one second, the detected type in the element with test id `detected-type`, an image inside the region **Preview**, and the **Import report** region saying nothing was dropped. Run `--phase red`
- [X] T035 [US1] [NT: extraction with no behaviour change, covered by the existing e2e/flowchart-preview.spec.ts] Extract `drawWithMermaid` from app/rendering/flowchart/Preview.tsx into app/rendering/shared/MermaidPicture.tsx (strict security level, hidden scratch container, `latestOnly`) and use it from Preview.tsx; run `e2e` with `--select flowchart-preview` as a `refactor` run
- [X] T036 [US1] [VO-002] Implement app/rendering/import/useImport.ts (text state kept in memory, 300 ms debounce, `latestOnly`, reads through `readDocument` with the adapter), the Preview region and detected type in ImportDialog.tsx using MermaidPicture on the generated source, and a first ImportReport.tsx that states "Nothing was dropped or approximated" and carries the status live region; add the strings to app/text/en.ts so T034 passes
- [X] T037 [P] [US1] [VO-003] Write the failing e2e test e2e/import-confirm.spec.ts: with a shown preview, **Import** creates one new diagram and opens it in the editor at `#/d/<id>`; in a second run **Cancel** leaves the saved list exactly as it was. Run `--phase red`
- [X] T038 [US1] [VO-003] Wire **Cancel** and **Import** in ImportDialog.tsx: Import calls `createImported` and then navigates to `#/d/<id>`; Cancel closes without a write; Import is disabled unless the outcome is `ready`, so T037 passes
- [X] T039 [P] [US1] [VO-004] Write the failing e2e test e2e/import-undo-reopen.spec.ts: after an import Undo is unavailable; edit a label, reload the page, reopen the diagram from the start screen; it holds the edit and everything imported. Run `--phase red`
- [X] T040 [US1] [VO-004] Make T039 pass; the editor already opens a stored diagram with an empty history, so change only what the run shows is missing (record a `no-meaningful-red` exception if it passes at once)
- [X] T041 [P] [US1] [VO-006] Write the failing e2e test e2e/import-types.spec.ts: a valid sequence document and a valid document of each C4 kind are pasted and confirmed; the editor opens on a diagram of the detected type (and, for C4, kind) holding every participant and message in order, or every element, boundary, nesting level, relationship and title. Run `--phase red`
- [X] T042 [US1] [VO-006] Show the C4 kind in the detected type (`C4 Container`), and make T041 pass; the strings go to app/text/en.ts
- [X] T043 [P] [US1] [VO-026] Write the failing e2e test e2e/import-positions.spec.ts: after an import, move a node, add another, reload and reopen; positions are as left and nothing is arranged again. Run `--phase red`
- [X] T044 [US1] [VO-026] Make T043 pass; positions are stored with the record at import, so change only what the run shows is missing (record a `no-meaningful-red` exception if it passes at once)
- [X] T045 [P] [US1] [VO-034] Write the failing e2e test e2e/import-name.spec.ts: the name field **Diagram name** is prefilled; rename in the dialog and confirm, and the opened diagram, the saved list and the editor carry the new name; a blank name leaves **Import** disabled. Run `--phase red`
- [X] T046 [US1] [VO-034] Add the name field to ImportDialog.tsx (prefilled from the outcome's name, a visible character required, as for any rename) and pass it to `createImported` so T045 passes
- [X] T047 [P] [US1] [VO-036] Write the failing e2e test e2e/import-storage-failure.spec.ts: with browser storage made to fail when the developer confirms (as e2e/storage-failure.spec.ts does), nothing is created, the dialog stays open with the text, and a message says the diagram could not be saved in this browser and why. Run `--phase red`
- [X] T048 [US1] [VO-036] Catch the `createImported` failure in ImportDialog.tsx, keep the dialog and text, and show "The diagram could not be saved in this browser: <reason>. Nothing was created." (contracts/import-dialog.md "Messages") so T047 passes

**Checkpoint**: Run `unit-all` and `e2e-all` as a `checkpoint`. Quickstart step 1 works for all three types: MVP.

---

## Phase 4: User Story 2 - See exactly what was kept, dropped or changed (Priority: P1)

**Goal**: Every construct the editor cannot hold is in the Import report with its line number and reason; nothing is lost silently.

**Independent Test**: Quickstart step 2, and the corpus tests.

- [X] T049 [P] [US2] [VO-017] Write the failing unit test app/importing/scan.test.ts for flowcharts: a document holding a subgraph, `classDef`, `class`, `style`, `linkStyle`, `click`, a `:::` class and a link among supported parts. Assert the supported nodes and connections are kept; each unsupported construct has exactly one entry with its line number, category and a one-line reason; the nodes of a dropped subgraph are kept; no entry for what the model keeps (contracts/import-reading.md "Report category rules"). Run `--phase red`
- [X] T050 [US2] [VO-017] Implement the line scanner in app/importing/scan.ts and the entry type, ordering (by line then column, unique per line and construct) and wording in app/importing/report.ts, call them from readDocument.ts for flowcharts, and add the reasons to app/text/en.ts so T049 passes
- [X] T051 [P] [US2] [VO-018] Write the failing unit test in app/importing/scan.test.ts for sequences: `loop`, `alt`, `opt`, `par` and `critical` blocks, notes, `activate`, `deactivate` and the `+`/`-` forms, `autonumber`, `create`, `destroy`, boxes and links. Assert messages inside blocks are kept in order, every block start, `else`, `and` and `end` line, note, activation, autonumber, create, destroy, box and link has an entry with its line number, and each kept message's entry names its block. Run `--phase red`
- [X] T052 [US2] [VO-018] Extend app/importing/scan.ts and app/importing/sequence.ts (the block of each message from the snapshot's `block`) so T051 passes
- [X] T053 [P] [US2] [VO-019] Write the failing unit test in app/importing/scan.test.ts for C4: `UpdateElementStyle`, `UpdateRelStyle`, `UpdateLayoutConfig`, `AddElementTag`, `AddRelTag`, `LAYOUT_*` lines, directional relationship forms (`Rel_U`, `Rel_Down`, `Rel_Back`...) and a relationship to an alias never declared. Assert each such line has an entry with its line number; the direction hint is reported and the relationship kept; a relationship with an unknown end is dropped and reported. Run `--phase red`
- [X] T054 [US2] [VO-019] Extend app/importing/scan.ts and app/importing/c4.ts so T053 passes
- [X] T055 [P] [US2] [VO-020] Write the failing unit test app/importing/approximate.test.ts: a double circle, asymmetric, trapezoid, inverted trapezoid, lean-left and unknown `@{ shape }` node; circle and cross endings, `o--o` and `x--x`; an invisible link; a C4 element and a boundary the kind does not offer (including Deployment, where the boundary is dropped and its children move up); an actor of another kind; a blank-labelled message; out-of-order Dynamic numbers. Assert each is kept as the nearest editor value per research R7 (or dropped, for the invisible link) and its entry says approximated with what it became. Run `--phase red`
- [X] T056 [US2] [VO-020] Add the approximation tables of research R7 to app/importing/flowchart.ts, sequence.ts and c4.ts and their report entries so T055 passes
- [X] T057 [P] [US2] [VO-046] Write the failing unit test app/importing/untrusted.test.ts: a flowchart with `click`, a link in a label and HTML tags in labels. Assert click and link are dropped with entries, tags are stripped with one entry per label that had them, and no markup survives in any label. Run `--phase red`
- [X] T058 [US2] [VO-046] Report each stripped label and each `click` and link in app/importing/flowchart.ts and scan.ts so T057 passes
- [X] T059 [P] [US2] [VO-048] Write the failing unit test in app/importing/scan.test.ts: a document opening with front matter, an `%%{init}%%` directive, `accTitle` and `accDescr` lines and two `%%` comment lines. Assert each has an `ignored` entry with its line number, the front-matter title becomes the name, and the diagram is unaffected. Run `--phase red`
- [X] T060 [US2] [VO-048] Report front matter, directives, accessibility lines and `%%` comments as ignored in app/importing/scan.ts and app/importing/readDocument.ts so T059 passes
- [X] T061 [P] [US2] [VO-049] Write the failing unit test in app/importing/flowchart.test.ts: a node mentioned twice, defined after use, and an id given two different labels. Assert one node for each id as Mermaid reads it and the second label reported. Run `--phase red`
- [X] T062 [US2] [VO-049] Report the second label of a reused id in app/importing/flowchart.ts so T061 passes
- [X] T063 [P] [US2] [VO-037] Extend the unit test in app/importing/readDocument.test.ts: the ignored blocks and a second header from `splitDocument` appear in the outcome's report as `ignored` entries with the line they start on and their first line. Run `--phase red`
- [X] T064 [US2] [VO-037] Carry the split document's ignored entries into the report in app/importing/readDocument.ts so T063 passes
- [X] T065 [P] [US2] [VO-021] Write the failing e2e test e2e/import-report.spec.ts: activating a report entry (button, test id `report-entry`, `data-category`) selects the matching line of the textbox and scrolls it into view. Run `--phase red`
- [X] T066 [US2] [VO-021] Render the grouped entries (Dropped, Approximated, Ignored; each entry a button "line N: construct (category). Reason.") in app/rendering/import/ImportReport.tsx and select the line with `setSelectionRange` in PasteArea.tsx so T065 passes
- [X] T067 [P] [US2] [VO-022] Write the failing e2e test in e2e/import-report.spec.ts: a document with nothing unsupported shows a report that says plainly nothing was dropped or approximated, and **Hide report** dismisses it and it can be shown again. Run `--phase red`
- [X] T068 [US2] [VO-022] Add the **Hide report** and show controls to ImportReport.tsx and the counts heading ("Import report: 3 dropped, 1 approximated, 1 ignored") so T067 passes
- [X] T069 [P] [US2] [VO-023] Write the failing e2e test in e2e/import-report.spec.ts: after each of two edits the number of entries is announced in the polite region named **Import status** and focus stays where it was. Run `--phase red`
- [X] T070 [US2] [VO-023] Announce the counts and summary in the single `role="status"` live region in ImportDialog.tsx without moving focus so T069 passes
- [X] T071 [P] [US2] [VO-024] Write the failing e2e test in e2e/import-report.spec.ts: a valid document with dropped and approximated constructs leaves **Import** enabled and its accessible description reads "Import, 3 constructs dropped" style counts for dropped and approximated; hiding the report leaves the description unchanged. Run `--phase red`
- [X] T072 [US2] [VO-024] Add `aria-describedby` text with the counts to the Import button in ImportDialog.tsx so T071 passes
- [X] T073 [P] [US2] [VO-054] Write the failing contract test app/importing/corpus.test.ts (jsdom) over the documents in app/importing/corpus/: at least thirty documents of all three types using only supported constructs (lift them from the MIT-licensed `mermaid-js/mermaid` (test and demo files) and `mermaid-js/mermaid-cli` (`test-positive`) repositories and this repository's README and specs; keep each file's source path and the MIT notice in app/importing/corpus/SOURCES.md; hand-write C4 documents if too few are found). Assert every one imports with every node, participant, element, connection, message and relationship present and labelled as in the document, with the generated source accepted by `parseLocated`. Start with the first ten documents. Run `--phase red`
- [X] T074 [US2] [VO-054] Add the remaining documents to app/importing/corpus/ and close the reader gaps they reveal in app/importing/flowchart.ts, sequence.ts and c4.ts, until the corpus holds at least thirty and T073 passes
- [X] T075 [P] [US2] [VO-055] Write the failing contract test in app/importing/corpus.test.ts over a second set in app/importing/corpus/ (the same documents with unsupported constructs added, at least thirty): every non-blank line is either represented by something in the diagram or has a report entry with that line number, or is a header, a blank line or a closing brace; none is silent (data-model.md rule 2). Run `--phase red`
- [X] T076 [US2] [VO-055] Close the gaps the T075 run finds in app/importing/scan.ts so that no line is silent, until T075 passes

**Checkpoint**: Run `unit-all` and `e2e-all` as a `checkpoint`. Quickstart step 2 works and the corpus holds.

---

## Phase 5: User Story 3 - Fix mistakes in the text with precise errors (Priority: P2)

**Goal**: A syntax error shows its line and column; an unsupported type or empty text gets a clear message; confirming is blocked.

**Independent Test**: Quickstart step 3.

- [X] T077 [P] [US3] [VO-012] Write the failing e2e test e2e/import-error.spec.ts: pasting a flowchart with an unclosed bracket shows "Line 2, column N: <Mermaid's message>", the offending line is marked with a visible marker and the accessible text "error here" (not colour alone), no image is shown, and **Import** is disabled. Run `--phase red`
- [X] T078 [US3] [VO-012] Add the `invalid` outcome to readDocument.ts (using `parseLocated`, adding the front-matter offset) and render it in ImportDialog.tsx and the marked line in PasteArea.tsx so T077 passes
- [X] T079 [P] [US3] [VO-014] Write the failing e2e test in e2e/import-error.spec.ts: after an error is shown the developer corrects the text; the error clears and the picture appears within one second of the last keystroke. Run `--phase red`
- [X] T080 [US3] [VO-014] Make T079 pass; clear the previous outcome when a new one arrives in useImport.ts (record a `no-meaningful-red` exception if it passes at once)
- [X] T081 [P] [US3] [VO-015] Write the failing e2e test e2e/import-unsupported.spec.ts: a valid class diagram shows "This looks like a classDiagram. The editor supports flowcharts, sequence diagrams and C4 diagrams (context, container, component, dynamic, deployment).", no image, and **Import** disabled. Run `--phase red`
- [X] T082 [US3] [VO-015] Add the `unsupported` outcome to readDocument.ts (parser accepts, type is unsupported) and render it so T081 passes
- [X] T083 [P] [US3] [VO-016] Write the failing e2e test e2e/import-empty.spec.ts: with no text, and again with only spaces, no error is shown, only a hint of what can be pasted, and **Import** is disabled. Run `--phase red`
- [X] T084 [US3] [VO-016] Render the `empty` outcome as the hint so T083 passes
- [X] T085 [P] [US3] [VO-042] Write the failing unit test in app/importing/readDocument.test.ts: a document of an unsupported type, a C4 document with no recognisable kind (`kindUndetected`) and a text with two different C4 headers (`kindsMixed`, naming the kinds found) each give a refused or reduced outcome with a message that names the reason. Run `--phase red`
- [X] T086 [US3] [VO-042] Add the `kindUndetected` and `kindsMixed` refusals to app/importing/readDocument.ts and their wording ("the C4 kind could not be found", "more than one C4 kind: Context, Container") to app/text/en.ts so T085 passes
- [X] T087 [P] [US3] [VO-051] Write the failing e2e test e2e/import-latest.spec.ts: one document is pasted and a different one immediately after, while the first is still being checked (delay the first with a route or a slow fixture); only the picture and report of the later text are ever shown. Run `--phase red`
- [X] T088 [US3] [VO-051] Make T087 pass: every state update in useImport.ts passes through `latestOnly`, including the drawing in MermaidPicture.tsx, and "Checking…" dims the previous picture without blocking typing (record a `no-meaningful-red` exception if it passes at once)

**Checkpoint**: Run `unit-all` and `e2e-all` as a `checkpoint`. Quickstart step 3 works.

---

## Phase 6: User Story 4 - Compare the original with what the editor will generate (Priority: P2)

**Goal**: A compare view shows the original beside the generated text, with differences marked by more than colour.

**Independent Test**: Quickstart step 4, first bullet.

- [X] T089 [P] [US4] [VO-032] Write the failing unit test app/importing/compare.test.ts for `compareLines(original, generated)`: equal texts, a changed line, a missing line and an added line. Assert the lines are classed `same`, `changed`, `removed` or `added` in order with line numbers on each side (data-model.md "Compare line"). Run `--phase red`
- [X] T090 [US4] [VO-032] Implement the longest-common-subsequence line diff in app/importing/compare.ts so T089 passes
- [X] T091 [P] [US4] [VO-029] Write the failing e2e test e2e/import-compare.spec.ts: with a valid document the **Compare** toggle opens the region **Compare original with generated** with both texts side by side, and each differing line carries a text marker (`−`, `+`, `~`) and `data-change` as well as a style. Run `--phase red`
- [X] T092 [US4] [VO-029] Add app/rendering/import/CompareView.tsx (two numbered panes, a visually hidden word per marker) and the **Compare** toggle in ImportDialog.tsx so T091 passes
- [X] T093 [P] [US4] [VO-030] Write the failing e2e test in e2e/import-compare.spec.ts: a document already in the editor's normal form shows "The original already matches the generated text." Run `--phase red`
- [X] T094 [US4] [VO-030] Render the identical state in CompareView.tsx so T093 passes
- [X] T095 [P] [US4] [VO-031] Write the failing e2e test in e2e/import-compare.spec.ts: a document with a dropped construct shows the construct's original lines as removed. Run `--phase red`
- [X] T096 [US4] [VO-031] Make T095 pass; the generated text never holds dropped constructs, so change only what the run shows is missing (record a `no-meaningful-red` exception if it passes at once)

**Checkpoint**: Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 7: User Story 5 - Bring a file in by dropping or choosing it (Priority: P3)

**Goal**: A `.mmd`, `.md` or `.txt` file dropped on the start screen or chosen in the dialog loads its first Mermaid block.

**Independent Test**: Quickstart step 4, second bullet.

- [X] T097 [P] [US5] [VO-038] Write the failing e2e test e2e/import-drop.spec.ts: while a file is dragged over the start screen the element with test id `drop-overlay` is shown; dropping a supported file opens the dialog with the file's text loaded. Run `--phase red`
- [X] T098 [US5] [VO-038] Add the drop target and overlay to app/routes/start.tsx and a shared file reader in app/rendering/import/useImport.ts (UTF-8 text, loaded at once, no debounce) so T097 passes
- [X] T099 [P] [US5] [VO-039] Write the failing e2e test e2e/import-markdown.spec.ts: a Markdown file with two `mermaid` blocks is dropped; only the first block is loaded and the report lists the second as ignored with its starting line and first line. Run `--phase red`
- [X] T100 [US5] [VO-039] Use `splitDocument` for `.md` files and for text with a `mermaid` fence in useImport.ts and show the ignored entries in the report so T099 passes
- [X] T101 [P] [US5] [VO-040] Write the failing e2e test e2e/import-bad-file.spec.ts: a binary file and a file over 5 MiB are chosen; the dialog says why each was not loaded and the text and outcome are unchanged. Run `--phase red`
- [X] T102 [US5] [VO-040] Refuse a file that is not text (a NUL byte or invalid UTF-8) and a file over `MAX_FILE_BYTES` in the file reader, with a message stating the reason, so T101 passes
- [X] T103 [P] [US5] [VO-056] Write the failing e2e test e2e/import-choose-file.spec.ts: choosing a file with **Choose file…** loads its text into the textbox and checks it like pasted text (a preview appears for a valid file, an error for a broken one). Run `--phase red`
- [X] T104 [US5] [VO-056] Wire **Choose file…** to the shared file reader in ImportDialog.tsx so T103 passes

**Checkpoint**: Run `unit-all` and `e2e-all` as a `checkpoint`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, keyboard, performance, network, tabs and the read-only source panel across the whole dialog.

- [X] T105 [P] [VO-043] Write the failing e2e test e2e/import-wcag.spec.ts: an axe scan (as e2e/wcag.spec.ts does) with the dialog empty, with a preview, with an error, with a report and with the compare view open finds no WCAG 2.2 AA violations in any state. Run `--phase red`
- [X] T106 [VO-043] Fix the violations the scan finds in app/rendering/import/ so T105 passes (names, contrast, markers, live region roles)
- [X] T107 [P] [VO-044] Write the failing e2e test e2e/import-keyboard.spec.ts: an import is completed with the keyboard alone in the order text area, **Choose file…**, report entries, **Compare**, name, **Cancel**, **Import**; every control is named; focus starts in the textbox; **Escape** closes the dialog and focus returns to **New from Mermaid…**. Run `--phase red`
- [X] T108 [VO-044] Fix tab order and focus return in ImportDialog.tsx so T107 passes
- [X] T109 [P] [VO-045] Write the failing e2e test e2e/import-no-network.spec.ts: a document with a link, a click handler and HTML in a label is imported while every request but the app's own files is blocked; no other request is made, nothing is followed or run, and each such construct appears as text. Run `--phase red`
- [X] T110 [VO-045] Make T109 pass; nothing in the document is rendered as markup anywhere in the dialog (preview from generated source only, strict security level, text shown with text nodes), so change only what the run shows is missing (record a `no-meaningful-red` exception if it passes at once)
- [X] T111 [P] [VO-047] Write the failing e2e test e2e/import-source-readonly.spec.ts: after an import the source panel offers no editing and nothing outside the start dialog accepts Mermaid text. Run `--phase red`
- [X] T112 [VO-047] Make T111 pass; no editor change is expected, so record a `no-meaningful-red` exception if it passes at once and otherwise remove whatever lets text in
- [X] T113 [P] [VO-050] Write the failing e2e test e2e/import-performance.spec.ts (Chromium): a 100-node document pasted shows its picture within one second, and typing into a 500-node document delays no keystroke by more than 100 ms (measure input-to-next-frame). Run `--phase red`
- [X] T114 [VO-050] Make T113 pass; if the 500-node typing budget fails, apply the contingency of research R5 (above 150 items draw the picture on request with a **Show preview** control while parsing, the report and **Import** stay live) and record it in research.md under R5
- [X] T115 [P] [VO-052] Write the failing e2e test e2e/import-escape.spec.ts: **Escape** on an empty dialog closes it without asking; on a dialog with text it closes and, reopened in the same visit, the text is still there. Run `--phase red`
- [X] T116 [VO-052] Keep the text in memory for the visit outside the dialog's mount in app/routes/start.tsx and useImport.ts so T115 passes
- [X] T117 [P] [VO-053] Write the failing e2e test e2e/import-two-tabs.spec.ts: the dialog is open in two tabs with the same text; confirming in one creates one diagram and opens it in that tab, and the other tab's dialog and text are unaffected. Run `--phase red`
- [X] T118 [VO-053] Make T117 pass; the library change broadcast must not close or alter an open dialog (record a `no-meaningful-red` exception if it passes at once)
- [X] T119 [NT: documentation, no behaviour] Update the README start-screen description in README.md to mention New from Mermaid…, its report and file dropping
- [X] T120 [NT: final regression run] Run `unit-all` and `e2e-all` as the last `checkpoint`, then `npm run typecheck` and `npm run lint`; hand MV-001 to MV-004 to a person (`tdd_check.py manual`)

---

## Dependencies & Execution Order

- Phase 1 then Phase 2, which blocks everything.
- US1 (Phase 3) needs Phase 2. US2 needs US1 (the readers, the dialog and `readDocument.ts`). US3 needs US1 and shares `readDocument.ts` and `ImportDialog.tsx` with US2, so run US2 then US3. US4 needs US1 and is otherwise independent. US5 needs US1 and US2 (the ignored-block entries).
- Polish needs every story. T120 is the final regression checkpoint.
- Tasks that edit the same files (`readDocument.ts`, `scan.ts`, `ImportDialog.tsx`, `useImport.ts`, `en.ts`) run one after another, even where marked as the next test's [P].

### Parallel opportunities

- In Phase 2 the test tasks T002, T004, T006, T008, T010, T012, T014 and T016 are different files or different describe blocks and can be written together; their implementations touch different files except T005 and T007, which share document.ts.
- In US1, the three readers (T018 to T023) touch different files and can be written in parallel.
- US4 (compare, T089 to T096) can run beside US3 once US1 is done, if the people involved do not both edit ImportDialog.tsx.

## Implementation Strategy

1. Phases 1 and 2, then US1: the whole happy path for all three types is the MVP. Stop and validate with quickstart step 1.
2. Add US2 so nothing is lost silently, then US3 so errors are exact. Validate with quickstart steps 2 and 3.
3. Add US4, US5 and Polish. After T120, hand MV-001 to MV-004 to a person.

---

## Verification labels

<!--
  Added by the Integrated TDD preset. These conventions apply to every task above.
  Keep this section in the generated tasks.md so a reviewer can read the labels.
-->

Every task carries a verification label, placed after the story label and before the
description. The rest of the task line is unchanged.

| Label | Meaning |
|-------|---------|
| `[VO-nnn]` | The task satisfies this obligation from the plan's Verification Plan. Repeat the label for several obligations |
| `[NT: reason]` | The task has no behaviour to verify. The reason is required |

```markdown
- [ ] T011 [P] [US1] [VO-001] Write the failing test for an empty cart total in tests/test_cart.py
- [ ] T012 [US1] [VO-001] Implement the cart total in src/cart.py
- [ ] T013 [US1] [NT: README wording only] Document the cart total in README.md
```

A task's kind follows from its labels and its position in this file:

| Kind | Rule |
|------|------|
| `no-test` | Carries `[NT: reason]` and no `[VO-nnn]` |
| `test` | The first task in the file to name a given obligation |
| `behaviour` | Any later task naming that obligation |

- Test tasks are required for every task that delivers behaviour. They are not optional.
- When the feature has a behaviour checklist, each obligation a test task names must be
  named by a behaviour item, so that the test traces to a planned behaviour.
- Every obligation needs a `test` task and at least one `behaviour` task, so it is named
  by at least two tasks.
- The first task to name an obligation is its test task whatever its description says, so
  the test task must be written first: the task that writes the failing test comes before
  the task that implements the behaviour.
- A task naming several obligations is a `test` task only when it is the first to name
  all of them.
