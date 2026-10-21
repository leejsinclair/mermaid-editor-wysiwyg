# Research: Import Review Fixes

All findings below were confirmed against the code at `cdd33da`. Nothing in the Technical Context was left unknown.

## R1. Decoding C4 text

- **Decision**: Add one decoder for text read straight from Mermaid source, `decodeSourceText`, in `app/importing/decode.ts`.
  It replaces Mermaid's own escapes `#<decimal>;` and `#<name>;` in a single pass (the result is not scanned again),
  then turns `<br/>` into a newline and decodes HTML entities (`&amp;`, `&quot;` and so on). It leaves other HTML tags
  as typed. The C4 reader applies it to every text field it keeps: element, boundary and Deployment node labels,
  descriptions, technologies, relationship labels and technologies, and the `title` line.
- **Rationale**: The flowchart and sequence readers take their labels from Mermaid's database, where Mermaid has already
  turned `#38;` into its own placeholders, which `decodeLabel` understands. The C4 reader (research R1 of feature 005)
  reads statements itself, so it sees the raw `#38;` and needs to decode it itself. Because the replacement is one pass,
  text the developer typed as `#38;` (exported as `#35;38#59;`) imports as `#38;` and not `&` (spec EC-03).
- **Why tags are kept**: The C4 scanner does not report HTML tags as dropped (005 EC-12 is met for flowcharts and
  sequences through `decodeLabel`'s `stripped` flag). Removing tags in C4 without a report entry would be a silent loss,
  which 005 FR-006 forbids. Keeping them as text matches today's C4 behaviour. This is design constraint DC-01.
- **Alternatives considered**: Calling `decodeLabel` on raw C4 text. Rejected: it does not know the raw `#38;` form, and
  it strips tags without a report entry.

## R2. Import only from the text now on screen

- **Decision**: `useImport` reports the text its outcome was read from. The dialog enables Import only when that text
  equals the text in the paste area (the existing `checking` flag is false) and the outcome is ready. Empty or
  whitespace-only text returns no outcome at once, so the old preview disappears without waiting for the 300 ms pause.
- **Rationale**: Clarification 1. The `checking` state already exists and already dims the old picture. Today it does not
  disable Import, and it is false for empty text, which caused the reported bug.
- **Alternatives considered**: Reading the current text again on click (option C in the clarification), rejected by the
  developer. Fixing only the empty case (option B), also rejected.

## R3. Selecting a report line once

- **Decision**: The effect in `PasteArea` depends only on `selectLine` (and the ref). It reads the current text from the
  text area at the moment it runs, not from the `value` prop. A line number past the end of the text selects nothing
  (spec EC-07).
- **Rationale**: Today the effect also depends on `value`, so it runs again on every keystroke.
- **Alternatives considered**: Clearing `selectLine` after use. Rejected: selecting the same entry twice relies on the
  `at` counter, and clearing it adds an extra render for no gain.

## R4. Multi-line directives

- **Decision**: Add one helper, `directiveLines(lines)`, in `app/importing/document.ts`. It returns, for each directive,
  its first and last line. A directive opens on a line whose trimmed text starts with `%%{` and closes on the first
  line, the same one or a later one, that contains `}%%`. `detectType` skips every line of a directive. The three
  scanners report one `ignored` entry per directive, on its first line, and skip its other lines. A directive with no
  closing `}%%` makes `detectType` return a new detection, `unclosedDirective` with its line, which `readDocument` turns
  into an `invalid` outcome: the message names the line, and Import stays blocked.
- **Rationale**: Mermaid's own directive pattern spans lines (`%%{[\s\S]*?}%%`), so the parser accepts such documents
  once the type is detected. An unclosed directive would make Mermaid's parser fail too, but with a less useful message.
  Saying where it opened is clearer.
- **Alternatives considered**: Reporting each directive line separately. Rejected: 005 EC-01 counts the directive as one
  construct.

## R5. Stopping the block at a second diagram header

- **Decision**: `splitDocument` ends the block it returns at the line before a second diagram header. The ignored entry
  it already writes for that header stays. The check that refuses a C4 document mixing kinds (005 EC-06) still reads the
  whole block, so a C4 document with two different kinds is refused as before rather than imported in part. This is
  design constraint DC-02. The header scan in `splitDocument` and the kind scan in `c4KindsIn` skip every line
  `directiveLines` marks, so a directive line such as `flowchart: { curve: 'basis' }` is never taken for a header (EC-08).
- **Rationale**: The parser must not see text the report says was ignored (spec FR-007). The C4 mixing rule of 005 EC-06
  is a refusal the developer already relies on, and nothing in this spec changes it.
- **Alternatives considered**: Removing only the header line. Rejected: the second diagram's statements would then be
  read into the first.

## R6. What an approximated entry became

- **Decision**: The report entry text for an approximated entry ends with "Kept as {becomes}." Every `becomes` value the
  scanners set is written so that it completes that phrase: "a rectangle", "a circle", "a parallelogram",
  "a two-way link", "a plain line", "a message", "a message with the default text", "a participant", "a Person",
  "a System", "a Container", "a Component", "a relationship in the order it was written" and
  "a relationship without a direction hint". The entry's accessible name is its visible text, so it carries the phrase
  too.
- **Rationale**: Contract `import-reading.md` gives "Kept as a rectangle." as the example. Using one phrase keeps the
  strings in one place (`en.ts`).
- **Alternatives considered**: A separate "Becomes:" label. Rejected: it reads less naturally and differs from the
  contract.

## R7. File read failure

- **Decision**: `readTextFile` reads the bytes inside the `try`. A failed read returns
  `{ ok: false, problem: en.importMermaid.fileUnreadable }` ("The file could not be read."), which the dialog already
  shows like other file problems. The text and preview stay as they were (spec EC-06).
- **Rationale**: This uses the existing problem path. No new state is needed.

## R8. Compare in bounded memory

- **Decision**: Replace the lines × lines table with Myers' O(ND) difference algorithm. First, lines both texts share at
  the start and at the end are matched and set aside. Myers then runs on the middle, keeping one frontier array per edit
  step so the edit path can be traced back. The work limit is **2,000 edits** (D ≤ 2,000). The trace is kept in
  `Int32Array`s whose size depends on D, not on the lines × lines product: at most about 8 million numbers (32 MB) at
  the limit, and very little for ordinary documents. Past the limit, the middle is marked as removed and added lines,
  paired into changed lines as today, and the result carries `simplified: true`. The view then shows "Differences in the
  middle of this text are shown in simple form because the texts are very large." `compareLines` returns
  `{ lines, simplified }`.
- **Rationale**: Clarification 2 asked for an exact comparison up to a work limit, then a simpler marking with a note.
  Myers gives an edit script of minimal length, the same length as the current LCS. Two 10,000-line texts that differ
  in a few hundred lines finish in milliseconds. Texts that are completely different reach the limit after about
  2,000 × 20,000 diagonal steps (about 40 million cheap comparisons, well under 2 s in either browser), and then fall back.
- **Tie-breaks**: Where several minimal scripts exist, Myers may choose a different one from the current table. The
  existing four compare unit tests have one minimal answer each, so they keep passing (spec FR-010).
- **Alternatives considered**: The linear-space middle-snake version of Myers, which uses the least memory. Rejected: it
  is more code for no difference a person could see once the 2,000-edit limit bounds the trace. A fixed line-count
  threshold (option B) was rejected in Clarification 2.

## R9. A performance check that can fail

- **Decision**: In `e2e/import-performance.spec.ts`, the 100-node test first checks that the preview does not contain
  the text "Node 100". It then pastes the 100-node chain, starts a timer, and waits up to 1 s for "Node 100" to appear
  in the preview. "Node 100" exists only in the new picture. The elapsed time is logged as a test annotation so it can
  be read from the run.
- **Rationale**: The preview draws an inline SVG whose labels are text, so Playwright can find "Node 100" by its text.
  Checking first that it is absent shows the wait cannot be met by the warm-up picture.
- **Showing that it can fail**: A test cannot slow the production preview without a test-only hook in the app, which the
  constitution's layering argues against. The proof that it fails is a manual check (MV-001): set the pause to 1,500 ms
  locally, run the test, see it fail, and revert.
