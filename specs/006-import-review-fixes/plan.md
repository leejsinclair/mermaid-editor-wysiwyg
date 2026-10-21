# Implementation Plan: Import Review Fixes

**Branch**: `feature/006-import-review-fixes` (from `main` after PR #4 merged) | **Date**: 2026-10-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-import-review-fixes/spec.md`

## Summary

This plan fixes the nine confirmed review findings on feature 005's import. No capability is added.

- The C4 reader decodes Mermaid escapes in every text field it keeps.
- The dialog enables Import only when the preview was read from the text on screen, and selecting a report entry selects
  its line once.
- Multi-line `%%{ … }%%` directives are recognised, and an unclosed one is reported.
- The parser never sees a second diagram that the report says was ignored.
- Approximated report entries end with "Kept as …".
- A file that cannot be read gives a message.
- Compare uses Myers' algorithm in bounded memory, with a 2,000-edit work limit and a simplified fallback that says so.
- The 100-node performance check waits for "Node 100", which only the new picture contains.

The research behind each fix is in [research.md](research.md), R1 to R9.

## Technical Context

**Language/Version**: TypeScript ~6.0, strict, ES2022 (unchanged)

**Primary Dependencies**: React 19, React Router 8, `@mui/material` ^9.5, `mermaid` ^12.2 (unchanged). No new dependency.

**Storage**: Unchanged. No stored format changes.

**Testing**: Vitest (`npm test`, node environment) for the import layer and the file reader. Playwright
(`npm run test:e2e`, Chromium and Firefox) for the dialog and the performance budget.

**Target Platform**: Current stable Chromium-based browsers and Firefox on desktop (unchanged)

**Project Type**: Web application, client-only single-page app (unchanged)

**Performance Goals**: Compare opens within 2 s for two 10,000-line texts. The preview still updates within 1 s for 100
nodes (005 SC-005), now measured to content unique to the new picture.

**Constraints**:
- Compare memory is bounded by the text length plus a trace of at most about 8 million 32-bit numbers (2,000-edit limit).
- No DOM in `app/importing`.
- WCAG 2.2 AA for the new note and messages.

**Scale/Scope**: About 9 source files changed, 1 test file changed, about 4 new strings. No new module beyond helpers
inside existing ones.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| I. Visual model is the source of truth | The import stays one-way. Nothing makes Mermaid text editable after import. | Pass |
| II. Layered architecture | Decoding, directive and split rules, compare and report text stay in the pure `app/importing` layer. The dialog changes stay in `app/rendering/import`. | Pass |
| III. Test-first | Every fix has an obligation, and each is run Red before Green through `tdd_check.py run` (FR-012). The existing performance test is strengthened, not weakened. | Pass |
| IV. Invalid operations never corrupt | The C4 decoding removes corruption that grew on each round trip. An import of stale text is no longer possible. | Pass |
| V. Honest feedback | The report's "ignored" now matches what was parsed. Approximated entries say what the item became. A file read failure and an unclosed directive give messages. The compare view says when it simplified. | Pass |
| Scope constraints | No new diagram type or dependency, and no source editing. | Pass |

Re-check after Phase 1 design: unchanged, all pass. Nothing goes in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-import-review-fixes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/import-changes.md
├── tests/behaviour-checklist.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
app/importing/
├── decode.ts            # + decodeSourceText (R1)
├── c4.ts                # decode every kept text field (R1)
├── document.ts          # directiveLines, unclosedDirective detection, block ends at 2nd header (R4, R5)
├── readDocument.ts      # unclosed directive → invalid; C4 kind mix check over whole block (R4, R5)
├── scan.ts              # one entry per directive; "becomes" phrases (R4, R6)
├── compare.ts           # Myers with 2,000-edit limit, { lines, simplified } (R8)
└── types.ts             # Detection, SplitDocument changes
app/rendering/import/
├── useImport.ts         # no outcome for empty text (R2)
├── ImportDialog.tsx     # Import disabled while checking (R2)
├── PasteArea.tsx        # select once (R3)
├── ImportReport.tsx     # "Kept as …" (R6)
├── CompareView.tsx      # simplified note (R8)
└── readFile.ts          # read inside try (R7)
app/text/en.ts           # entry text, fileUnreadable, compareSimplified, unclosedDirective
e2e/import-performance.spec.ts   # wait for "Node 100" (R9)
```

Tests sit beside their modules (`*.test.ts`) and in `e2e/import-*.spec.ts`, as in feature 005.

**Structure Decision**: Keep feature 005's structure. Every change sits in a file that feature 005 created.

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
| VO-001 | FR-001, US1-AS1 | Editor-generated C4 source for an element labelled `R&D`, description `"fast" <cheap>`, technology `C#` is imported | The element's label, description and technology are `R&D`, `"fast" <cheap>` and `C#` | unit | planned |
| VO-002 | FR-001, US1-AS3 | C4 source with escapes in a boundary label, a relationship label, a relationship technology and the title is imported | Each field holds the decoded text, the same as a flowchart label with the same escapes decodes to | unit | planned |
| VO-003 | FR-002, US1-AS2, EC-03 | For C4 diagrams of each kind holding every character the editor escapes (including text typed as `#38;`), generate, import and generate, three times over | Every generated source equals the first, and a field typed as `#38;` imports as `#38;` | unit | planned |
| VO-004 | FR-001 | DC-01: C4 text holding an HTML tag such as `<b>x</b>` is imported | The tag stays in the field as text and nothing is removed without a report entry | unit | planned |
| VO-005 | FR-003, US2-AS1, EC-02 | A valid diagram is previewed, then the paste area is emptied (and, separately, left holding only spaces) | Import is unavailable and the preview is gone at once, before the preview delay passes | end-to-end | planned |
| VO-006 | FR-004, US2-AS2 | Right after the paste area is emptied, Import is activated by pointer and by keyboard within the preview delay | No diagram is created and the dialog stays open | end-to-end | planned |
| VO-007 | FR-003, FR-004, US2-AS3, EC-01 | Valid text A is previewed, then changed to valid text B | Import is unavailable until B's preview is shown; activating it then creates a diagram with B's content and none of A's | end-to-end | planned |
| VO-008 | FR-005, US2-AS4 | A report entry is selected, the caret is placed in the text and 20 characters are typed | All 20 characters are in the text at the caret, and no other text was replaced | end-to-end | planned |
| VO-009 | FR-005, US2-AS5 | After typing, the same entry and then another entry are selected | Each selection highlights that entry's line, once | end-to-end | planned |
| VO-010 | FR-005 | EC-07: an entry is selected after the text was shortened so that its line no longer exists | Nothing is selected, the text is unchanged and no error is raised | end-to-end | planned |
| VO-011 | FR-006, US3-AS1, EC-04 | A flowchart preceded by a three-line init directive, and one preceded by a one-line directive, are read | Both are detected and imported as flowcharts, each with exactly one ignored directive entry on line 1 | unit | planned |
| VO-012 | FR-006, US3-AS2 | Sequence and each C4 kind preceded by a multi-line init directive are read | Each is detected as its own type and kind | unit | planned |
| VO-013 | FR-006, US3-AS4 | A document whose `%%{` directive never closes is read | The outcome is invalid, naming the directive's first line, and no diagram type is detected from text inside it | unit | planned |
| VO-014 | FR-007, US3-AS3, EC-08 | A complete flowchart is followed by a second `flowchart` header and more nodes; and a flowchart behind a directive whose second line is `flowchart: { curve: 'basis' }` | The import succeeds with only the first diagram's nodes, and the report lists the second header as not imported with its line number; the directive line is neither the header nor a second diagram | unit | planned |
| VO-015 | FR-007, EC-05 | DC-02: a Markdown file whose first block holds a second header and which has further blocks; and a C4 block holding two different kinds | The first block's first diagram is imported and further blocks are listed as ignored; the mixed C4 block is still refused, naming both kinds | unit | planned |
| VO-016 | FR-008, US4-AS1 | A flowchart with an asymmetric node on line 7 is previewed | The report entry for line 7 names the asymmetric shape and its reason and ends "Kept as a rectangle.", and its accessible name includes "Kept as a rectangle." | end-to-end | planned |
| VO-017 | FR-008, US4-AS2 | Documents producing every kind of approximated entry are read | Every approximated entry states what the construct became, as a phrase that completes "Kept as …" | unit | planned |
| VO-018 | FR-009, US4-AS3 | A file whose contents cannot be read is given to the file reader | The reader returns the problem "The file could not be read." and raises nothing | unit | planned |
| VO-019 | FR-009, US4-AS3, EC-06 | In the dialog, holding earlier text with its preview, a file whose read fails is chosen | The dialog shows that the file could not be read, the earlier text and preview stay, and no page error is logged | end-to-end | planned |
| VO-020 | FR-010, US5-AS1 | Two 10,000-line texts differing in a few hundred lines are compared | The comparison completes within 2 seconds and marks every differing line | unit | planned |
| VO-021 | FR-010, US5-AS2 | Two completely different large texts that share a few lines at the start and end are compared | Shared start and end lines are marked same, the middle is marked changed, removed or added, and the result says it was simplified | unit | planned |
| VO-022 | FR-010, US5-AS2 | A large document whose generated text differs on nearly every line is imported and Compare is opened | The compare view shows both texts and states that the marking was simplified for size | end-to-end | planned |
| VO-023 | FR-010, US5-AS3 | Texts within the work limit are compared, including the existing compare cases | The number of removed plus added lines is the minimum possible, and the result is not marked simplified | unit | planned |
| VO-025 | FR-010, US5-AS2 | Two completely different 5,000-line texts are compared | The heap grows by less than 64 MB during the comparison | unit | planned |
| VO-024 | FR-011, US6-AS1, US6-AS3 | The warm-up picture is shown, then a 100-node chain is pasted | Before the paste the preview holds no "Node 100"; after it, "Node 100" appears in the preview within 1 second, and the measured time is reported | end-to-end | planned |
| VO-026 | FR-001, FR-002, EC-03 | A C4 diagram of each kind whose fields are typed as `one<br/>two`, `&amp;` and `&lt;b&gt;` is generated, imported and generated again, three times | Every field reads exactly as typed and every generated source equals the first | unit | discovered |
| VO-027 | FR-001 | Hand-written C4 source holds `&#65;`, `&#x42;` and `&amp;` in an element label | The label reads `A`, `B` and `&`; no entity is decoded twice or split | unit | discovered |
| VO-028 | FR-007 | A flowchart with unindented nodes `pie[Chart]` and `C4Node[Service]`, and a sequence diagram with the message `graph->>Bob: Next`, are split | The block keeps every line and nothing is listed as ignored | unit | discovered |
| VO-029 | FR-007, EC-05 | A flowchart is followed by an indented second header `  flowchart LR` and its statements | The block ends before the indented header, which is listed as ignored with its line number | unit | discovered |
| VO-030 | FR-006 | A document of 20,000 one-line directives before a flowchart header is split and its type detected | Both together finish within 200 ms | unit | discovered |
| VO-031 | FR-011, US6-AS1 | The 100-node chain is pasted after the warm-up picture | The test fails when the time from before the paste until "Node 100" is shown exceeds 1,000 ms, not only when the wait after the paste does | end-to-end | discovered |
| VO-032 | FR-001 | Hand-written C4 source holds `&#xzz;` and `&#99999999;` in an element label | The source is read without an error and the label keeps both entities as typed | unit | discovered |

### Verification exemptions

| Requirement | Reason | Alternative verification |
|-------------|--------|--------------------------|
| US6-AS2 | Showing that the check fails needs a deliberately slowed preview; adding a test-only slow-down to the shipped app would break the constitution's layering for one check | Manual check MV-001 |
| FR-012 | A process requirement about how the work is done, not a behaviour of the app | `tdd_check.py gate` for every task: each behaviour task has a recorded Red run before its Green run, and the evidence shows no weakened test |

### Manual verification

| ID | Covers | Steps | Expected result | Why not automated |
|----|--------|-------|-----------------|-------------------|
| MV-001 | US6-AS2, FR-011, VO-024 | Set both preview pauses in `useImport.ts` (`PAUSE_MS` and `PASTE_PAUSE_MS`) to 1500 ms locally; run `npm run test:e2e -- e2e/import-performance.spec.ts`; restore the pause and run it again | The 100-node test fails with the pause at 1500 ms and passes once restored | It needs a temporary change to shipped code that must not be committed |

### Behaviour checklist

Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).
