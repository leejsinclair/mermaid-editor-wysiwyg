---

description: "Task list for the import review fixes"
---

# Tasks: Import Review Fixes

**Input**: Design documents from `specs/006-import-review-fixes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/import-changes.md, tests/behaviour-checklist.md

**Tests**: Required. Every obligation in the plan's Verification Plan has a test task before its behaviour task (integrated TDD). Run every test through `tdd_check.py run`.

**Organization**: One phase per user story, in priority order. Every story changes files that feature 005 created.

## Format: `[ID] [P?] [Story] [Label] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: The user story the task belongs to (US1 to US6)
- **[Label]**: `[VO-nnn]` for the obligation it satisfies, or `[NT: reason]`

## Path Conventions

Web app, client only: `app/importing/` (pure import layer, Vitest), `app/rendering/import/` (the dialog),
`app/text/en.ts` (strings), `e2e/` (Playwright). Unit tests sit beside their modules as `*.test.ts`.

---

## Phase 1: Setup

- [X] T001 [NT: records the baseline, no behaviour] Record a `baseline` run with the `unit-all` command and then with `e2e-all`, naming any test that already fails with `--note` (`tdd_check.py run --phase baseline`); no file is changed

---

## Phase 2: Foundational

None. No change blocks more than one story.

---

## Phase 3: User Story 1 - C4 text survives a round trip (Priority: P1) 🎯 MVP

**Goal**: The C4 import decodes Mermaid escapes in every text field it keeps, so the editor's own C4 output imports unchanged (research R1).

**Independent Test**: Import editor-generated C4 source with `R&D`, `"fast" <cheap>` and `C#`; the fields match, and generating again gives the same source.

- [X] T002 [US1] [VO-001] Write the failing test in app/importing/c4.test.ts: the source the editor generates (via `generateC4`) for a Person labelled `R&D`, described `"fast" <cheap>`, technology `C#` is read by `readC4`, and the element's label, description and technology equal `R&D`, `"fast" <cheap>` and `C#`
- [X] T003 [US1] [VO-001] Add `decodeSourceText(text)` to app/importing/decode.ts. In a single pass it replaces `#<decimal>;` and `#<name>;` (the result is not scanned again); then it turns `<br/>` into a newline and decodes HTML entities; it leaves other tags as typed. Apply it to element label, description and technology in app/importing/c4.ts
- [X] T004 [US1] [VO-002] Write the failing test in app/importing/c4.test.ts: escapes in a boundary label, a Deployment node label, a relationship label, a relationship technology and the `title` line decode to the same text `decodeLabel` gives for a flowchart label with the same escapes
- [X] T005 [US1] [VO-002] Apply `decodeSourceText` to boundary and Deployment node labels and descriptions, relationship labels and technologies, and the title in app/importing/c4.ts
- [X] T006 [US1] [VO-003] Write the failing test in app/importing/roundtrip.test.ts: for a C4 diagram of each kind (context, container, component, dynamic, deployment) whose fields hold every character in the generator's special set, a line break, and a field typed as `#38;`, generate → import → generate three times; every source equals the first and the `#38;` field still reads `#38;`
- [X] T007 [US1] [VO-003] Make the round trip hold in app/importing/decode.ts and app/importing/c4.ts (for example a named `#quot;` form or a field the reader still misses); change nothing in app/generation/
- [X] T008 [US1] [VO-004] Write the failing test in app/importing/c4.test.ts: a C4 element label holding `<b>x</b>` imports as `<b>x</b>` (DC-01: the tag is kept as text; the C4 import does not report removed tags)
- [X] T009 [US1] [VO-004] Make `decodeSourceText` in app/importing/decode.ts keep tags other than `<br/>` as text, if T008 shows it does not
- [X] T010 [US1] [NT: checkpoint run, no behaviour] Run the `unit-all` command as a `checkpoint` for the phase

**Checkpoint**: C4 import round-trips; US1 is complete.

---

## Phase 4: User Story 2 - The dialog never imports stale or wrong content (Priority: P1)

**Goal**: Import is available only for a preview read from the text on screen, and selecting a report entry selects its line once (research R2, R3).

**Independent Test**: Empty or change the text and press Import at once, which creates nothing stale. Select an entry, then type, and the typing lands at the caret.

- [X] T011 [US2] [VO-005] Write the failing test in e2e/import-stale.spec.ts: with a flowchart previewed, emptying the paste area (and, separately, leaving only spaces) makes Import disabled and removes the preview's picture within 100 ms, well before the 300 ms pause
- [X] T012 [US2] [VO-005] In app/rendering/import/useImport.ts return no outcome while the text is empty or white space only. In app/rendering/import/ImportDialog.tsx disable Import while `checking` is true, as well as when there is no ready outcome or no name
- [X] T013 [US2] [VO-006] Write the failing test in e2e/import-stale.spec.ts: right after emptying the paste area, activate Import by click and, separately, by focusing it and pressing Enter, within 300 ms; no diagram is created and the dialog stays open
- [X] T014 [US2] [VO-006] Guard the Import handler in app/rendering/import/ImportDialog.tsx so that it acts only when the outcome is ready and `checking` is false
- [X] T015 [US2] [VO-007] Write the failing test in e2e/import-stale.spec.ts: preview text A (`flowchart TD\n  A1 --> A2`), replace it with text B (`flowchart TD\n  B1 --> B2`); Import is disabled until B's picture shows `B1`; Import then opens a diagram holding B1 and B2 and neither A1 nor A2
- [X] T016 [US2] [VO-007] Make any remaining change in app/rendering/import/useImport.ts and app/rendering/import/ImportDialog.tsx so that the outcome used by Import is always the one read from the current text
- [X] T017 [US2] [VO-008] Write the failing test in e2e/import-report-select.spec.ts: preview a flowchart with an asymmetric node, activate its report entry, click at the end of the text, type 20 characters; the text equals the original plus those 20 characters
- [X] T018 [US2] [VO-008] In app/rendering/import/PasteArea.tsx make the selection effect depend only on `selectLine` and the ref, reading the current text from the text area when it runs
- [X] T019 [US2] [VO-009] Write the failing test in e2e/import-report-select.spec.ts: after typing, activating the same entry and then another selects that entry's whole line each time (selection start and end equal the line's bounds), and a following keystroke is inserted, not replacing the line twice
- [X] T020 [US2] [VO-009] Keep the `at` counter path in app/rendering/import/ImportDialog.tsx and app/rendering/import/PasteArea.tsx working so that the same entry can be selected again
- [X] T021 [US2] [VO-010] Write the failing test in e2e/import-report-select.spec.ts: preview a document with a report entry on its last line, delete that line, then activate the entry before the preview updates; nothing is selected, the text is unchanged and no page error is logged (EC-07)
- [X] T022 [US2] [VO-010] In app/rendering/import/PasteArea.tsx select nothing when the line number is past the end of the current text
- [X] T023 [US2] [NT: test support only, no new behaviour] Check every e2e/import-*.spec.ts that activates Import straight after a paste; where it does not wait for the preview, make it wait for the picture (in e2e/support/import.ts if shared). Weaken no assertion, and name each changed file and why in the final report
- [X] T024 [US2] [NT: checkpoint run, no behaviour] Run the `e2e-all` command as a `checkpoint` for the phase

**Checkpoint**: No stale import, and report selection behaves. US2 is complete.

---

## Phase 5: User Story 3 - Directives and extra diagrams are handled as reported (Priority: P2)

**Goal**: Multi-line directives are recognised, an unclosed one is reported, and the parser never sees a second diagram (research R4, R5).

**Independent Test**: A flowchart behind a three-line directive imports as a flowchart. A document with two `flowchart` headers imports the first.

- [X] T025 [P] [US3] [VO-011] Write the failing test in app/importing/readDocument.test.ts: `%%{init: {\n  "theme": "dark"\n}}%%\nflowchart TD\n  A --> B` and the same with a one-line directive both give a ready flowchart outcome with exactly one `ignored` `directive` entry on line 1
- [X] T026 [US3] [VO-011] Add `directiveLines(lines)` to app/importing/document.ts. A directive opens on a line whose trimmed text starts with `%%{` and closes on the first line, the same one or a later one, that contains `}%%`. Make `firstSignificantLine` skip every directive line, and make `scanFlowchart` in app/importing/scan.ts write one entry per directive and skip its other lines
- [X] T027 [US3] [VO-012] Write the failing test in app/importing/document.test.ts: `detectType` on a sequence document and on one document of each C4 kind, each behind a multi-line init directive, gives `sequence` and the right C4 kind; the `scanSequence` and `scanC4` reports hold one directive entry each
- [X] T028 [US3] [VO-012] Use `directiveLines` in `scanSequence` and `scanC4` in app/importing/scan.ts
- [X] T029 [US3] [VO-013] Write the failing test in app/importing/readDocument.test.ts: `%%{init: {\n flowchart TD\n  A --> B` gives an `invalid` outcome on line 1 whose message says the directive is never closed, and no type is detected from the line inside it
- [X] T030 [US3] [VO-013] Add the detection `{ type: "unclosedDirective"; line }` in app/importing/types.ts and app/importing/document.ts; turn it into an `invalid` outcome in app/importing/readDocument.ts with the string `unclosedDirective` in app/text/en.ts: "The directive that opens on line {line} is never closed with }%%."
- [X] T031 [US3] [VO-014] Write the failing test in app/importing/readDocument.test.ts (real parser): `flowchart TD\n  A --> B\nflowchart LR\n  C --> D --> E` is ready, holds nodes A and B only, and its report has an `ignored` entry on line 3 for the second header; and `%%{init: {\nflowchart: { curve: 'basis' }\n}}%%\nflowchart TD\n  A --> B` is ready, holds A and B, and has no "not imported" entry (EC-08)
- [X] T032 [US3] [VO-014] In `splitDocument` in app/importing/document.ts end the returned `text` before a second diagram header, keeping its `ignored` entry; skip lines `directiveLines` marks, in this header scan and in `c4KindsIn`
- [X] T033 [US3] [VO-015] Write the failing test in app/importing/readDocument.test.ts: a Markdown file whose first block holds a second header and which has two more blocks imports the first diagram and lists the second header and both blocks as ignored; a block `C4Context … C4Container …` is still refused naming both kinds (DC-02, 005 EC-06)
- [X] T034 [US3] [VO-015] Keep the C4 mixed-kind check in app/importing/readDocument.ts over the whole first block (add the uncut block to `SplitDocument` in app/importing/types.ts)
- [X] T035 [US3] [NT: checkpoint run, no behaviour] Run the `unit-all` command as a `checkpoint` for the phase

**Checkpoint**: The report's "ignored" matches what was parsed. US3 is complete.

---

## Phase 6: User Story 4 - Clear feedback for approximations and unreadable files (Priority: P2)

**Goal**: Approximated entries say "Kept as …", and a file read failure gives a message (research R6, R7).

**Independent Test**: An asymmetric node's entry ends "Kept as a rectangle." A failing file read shows "The file could not be read."

- [X] T036 [P] [US4] [VO-017] Write the failing test in app/importing/approximate.test.ts: across documents producing every approximated construct (double circle, asymmetric, trapezoid, inverted trapezoid, lean-left, unknown named shape, two-way and one-way circle or cross endings, blank and label messages, actor, C4 type not offered, Dynamic order, direction hint), every approximated entry has a `becomes` that starts with "a " and reads as the end of "Kept as …"
- [X] T037 [US4] [VO-017] Reword every `becomes` value in app/importing/scan.ts per research R6: "a rectangle", "a circle", "a parallelogram", "a two-way link", "a plain line", "a message", "a message with the default text", "a participant", "a Person", "a System", "a Container", "a Component", "a relationship in the order it was written", "a relationship without a direction hint"
- [X] T038 [US4] [VO-016] Write the failing test in e2e/import-report.spec.ts: a flowchart with `  F>Flag]` on line 7; the report entry button for line 7 has an accessible name containing "asymmetric shape" and ending "Kept as a rectangle."
- [X] T039 [US4] [VO-016] Show the phrase in app/rendering/import/ImportReport.tsx with a new string `entryKept` in app/text/en.ts: "line {line}: {construct} ({category}). {reason} Kept as {becomes}." for entries with `becomes`
- [X] T040 [P] [US4] [VO-018] Write the failing test in app/rendering/import/readFile.test.ts: a `File` whose `arrayBuffer()` rejects gives `{ ok: false, problem: "The file could not be read." }` and the promise does not reject
- [X] T041 [US4] [VO-018] In app/rendering/import/readFile.ts read the bytes inside the `try`, returning the new string `fileUnreadable` from app/text/en.ts on failure
- [X] T042 [US4] [VO-019] Write the failing test in e2e/import-bad-file.spec.ts: with a flowchart previewed, make `File.prototype.arrayBuffer` reject in the page and choose a file; the dialog shows "The file could not be read.", the text and picture are unchanged, and no `pageerror` is raised
- [X] T043 [US4] [VO-019] Make any change needed in app/rendering/import/ImportDialog.tsx so that the problem is shown and the earlier text and preview are kept
- [X] T044 [US4] [NT: checkpoint run, no behaviour] Run `unit-all` and `e2e-all` as `checkpoint` runs for the phase

**Checkpoint**: Report and file feedback are honest. US4 is complete.

---

## Phase 7: User Story 5 - Compare stays responsive for large texts (Priority: P3)

**Goal**: Compare in bounded memory: Myers up to 2,000 edits, then a simplified marking with a note (research R8, Clarification 2).

**Independent Test**: Two 10,000-line texts compare in under 2 s. Completely different large texts give a simplified result and a note.

- [X] T045 [P] [US5] [VO-023] Write the failing test in app/importing/compare.test.ts: `compareLines` returns `{ lines, simplified }`; for small cases with a known minimum (including the four existing cases, adapted to read `.lines` without changing what they assert) the count of removed plus added lines equals the minimum, and `simplified` is false
- [X] T046 [US5] [VO-023] Rewrite app/importing/compare.ts. Match the shared lines at the start and end. Run Myers' O(ND) on the middle, keeping one `Int32Array` frontier per edit step and tracing back. Pair runs of removed then added lines into changed lines as now. Return `{ lines, simplified: false }`, and update the caller in app/rendering/import/CompareView.tsx
- [X] T047 [US5] [VO-020] Write the failing test in app/importing/compare.test.ts: two 10,000-line texts differing in 300 scattered lines compare in under 2,000 ms and mark exactly the differing lines
- [X] T048 [US5] [VO-020] Make any change needed in app/importing/compare.ts so that T047 passes (for example avoiding per-step array copies)
- [X] T049 [US5] [VO-021] Write the failing test in app/importing/compare.test.ts: two 5,000-line texts sharing 3 lines at the start and 3 at the end with all middle lines different give `simplified: true`, the 6 shared lines `same`, and every middle line `changed`, `removed` or `added`, in under 2,000 ms
- [X] T050 [US5] [VO-021] Stop Myers at 2,000 edits in app/importing/compare.ts and fall back to marking the middle, with `simplified: true`
- [X] T051 [US5] [VO-025] Write the failing test in app/importing/compare.test.ts: measure `process.memoryUsage().heapUsed` around comparing two completely different 5,000-line texts (after `global.gc` when exposed) and require growth under 64 MB
- [X] T052 [US5] [VO-025] Keep the Myers trace in `Int32Array`s sized by the edit count, and nothing sized by lines × lines, in app/importing/compare.ts
- [X] T053 [US5] [VO-022] Write the failing test in e2e/import-compare.spec.ts: paste a 1,200-node chain written as `nX-->nY` without spaces (so every line differs from the generated text, giving more than 2,000 edits), wait up to 20 s for the preview and open Compare; the compare region shows both texts and the text "shown in simple form because the texts are very large"
- [X] T054 [US5] [VO-022] Show the note in app/rendering/import/CompareView.tsx when `simplified` is true, using the new string `compareSimplified` in app/text/en.ts: "Differences in the middle of this text are shown in simple form because the texts are very large."
- [X] T055 [US5] [NT: checkpoint run, no behaviour] Run `unit-all` and `e2e-all` as `checkpoint` runs for the phase

**Checkpoint**: Compare is bounded. US5 is complete.

---

## Phase 8: User Story 6 - The 100-node performance check proves the budget (Priority: P3)

**Goal**: The SC-005 check waits for content only the new picture has (research R9).

**Independent Test**: The test fails with the pause raised to 1,500 ms (MV-001) and passes on the normal build.

- [X] T056 [US6] [VO-024] Update the 100-node test in e2e/import-performance.spec.ts: after the warm-up picture, assert the preview holds no "Node 100"; paste the chain, time until `getByText("Node 100")` is visible in the preview region with a 1,000 ms timeout, and add the measured time as a test annotation. If the first run passes, record a `no-meaningful-red` exception: the defect was in the test (it matched the old picture), and the absence assertion together with MV-001 shows it can fail
- [X] T057 [US6] [VO-024] Run the updated test green in both browsers with the `e2e` command, noting the measured time; if it exceeds 1 s, stop and raise it with the developer as a failure of 005 SC-005 rather than loosening the test

**Checkpoint**: VO-050 of feature 005 has meaningful evidence. US6 is complete.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T058 [NT: documentation only] Bring specs/005-new-from-mermaid/contracts/import-reading.md and specs/005-new-from-mermaid/contracts/import-dialog.md in line with specs/006-import-review-fixes/contracts/import-changes.md, and add a note under VO-050 in specs/005-new-from-mermaid/plan.md that its evidence is replaced by feature 006's VO-024
- [X] T059 [NT: project checks, not behaviour] Run `npm run typecheck` and `npm run lint` and fix every finding in the changed files
- [X] T060 [NT: final checkpoint, no behaviour] Run `unit-all` and `e2e-all` as the final `checkpoint`
- [ ] T061 [NT: manual check by a person] Ask the developer to carry out MV-001 from plan.md and record it with `tdd_check.py manual --check MV-001`; the agent records no result

---

## Phase 10: Review round two (PR #5)

**Goal**: The four Copilot comments on PR #5 are fixed: C4 text is decoded in one pass, only real diagram headers end a
block, directive scans are linear, and the 100-node check enforces the time it records.

**Independent Test**: The new unit tests and the 100-node test pass; each new unit test failed first.

- [X] T062 [US1] [VO-026] Add to the C4 round-trip cases in app/importing/roundtrip.test.ts fields typed as `one<br/>two`, `&amp;` and `&lt;b&gt;`: every field reads as typed and every generated source equals the first, over three rounds, for each C4 kind
- [X] T063 [US1] [VO-027] Write the failing test in app/importing/c4.test.ts: hand-written C4 source with `&#65;`, `&#x42;` and `&amp;` in an element label reads `A`, `B` and `&`
- [X] T064 [US1] [VO-026] [VO-027] Decode `#n;` and `#name;` escapes, `<br>` tags and HTML entities with one pattern in a single pass in `decodeSourceText` in app/importing/decode.ts, so no replacement is read again
- [X] T065 [US3] [VO-028] Write the failing test in app/importing/document.test.ts: `splitDocument` keeps every line and ignores nothing for a flowchart with unindented `pie[Chart]` and `C4Node[Service]` nodes, and for a sequence diagram with `graph->>Bob: Next`
- [X] T066 [US3] [VO-029] Write the failing test in app/importing/document.test.ts: a flowchart followed by `  flowchart LR` (indented) and its statements ends before that line, which is listed as ignored with its line number
- [X] T067 [US3] [VO-028] [VO-029] Recognise a diagram header in app/importing/document.ts only on the trimmed line, as the type word alone or followed by white space and its header arguments (a direction for flowchart and graph; C4 limited to the five kinds)
- [X] T068 [US3] [VO-030] Write the failing test in app/importing/document.test.ts: `splitDocument` and `detectType` on 20,000 one-line directives before a flowchart header finish within 200 ms together
- [X] T069 [US3] [VO-030] Search for each directive's closing line forward from its opening line in `directiveLines` in app/importing/document.ts
- [X] T070 [US6] [VO-031] In e2e/import-performance.spec.ts assert that the recorded time from before the paste until "Node 100" is shown is at most 1,000 ms. If the first run passes, record a `no-meaningful-red` exception: the build already meets the budget, and MV-001 shows the check can fail
- [X] T071 [US6] [VO-031] Run the 100-node test green in both browsers with the `e2e` command
- [X] T073 [US1] [VO-032] Write the failing test in app/importing/c4.test.ts: hand-written C4 source with `&#xzz;` and `&#99999999;` in an element label is read without an error and keeps both as typed
- [X] T074 [US1] [VO-032] In `decodeEntity` in app/importing/decode.ts keep an entity as typed when its number is not a valid code point
- [X] T072 [NT: documentation and checkpoint runs, no behaviour] Add the header rule and single-pass decoding to specs/006-import-review-fixes/contracts/import-changes.md, run `npm run typecheck` and `npm run lint`, and run `unit-all` and `e2e-all` as `checkpoint` runs

---

## Dependencies & Execution Order

- **Setup (T001)** comes first: no other run is accepted until the baseline exists.
- **US1 (Phase 3)**, **US3 (Phase 5)** and **US5 (Phase 7)** change only the import layer and are independent of one another.
- **US2 (Phase 4)** and **US4 (Phase 6)** both touch app/rendering/import/ImportDialog.tsx and app/text/en.ts, so run them one after the other.
- **US4's T037** (scan.ts wording) and **US3's T026/T028** (scan.ts directives) touch the same file, so do them one after the other.
- **US6 (Phase 8)** is best run after US2, because Import availability changed timing in the dialog.
- **Polish (Phase 9)** comes after all the stories.
- Within each story, every test task comes before its behaviour task, one obligation at a time.

## Parallel Example

```text
# Different files, no shared dependency, once T001 is done:
T002 (app/importing/c4.test.ts)         US1
T025 (app/importing/readDocument.test.ts) US3
T045 (app/importing/compare.test.ts)    US5
T040 (app/rendering/import/readFile.test.ts) US4
```

## Implementation Strategy

1. **MVP:** T001, then US1. This removes the data corruption on C4 round trips, the most serious finding.
2. US2, the second P1 story: no stale import, and report selection works.
3. US3 and US4, the P2 stories: honest reports and messages.
4. US5 and US6, the P3 stories: bounded compare, and a performance check that can fail.
5. Polish, then the user decides on committing, pushing and replying to each review thread.

## Verification labels

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
