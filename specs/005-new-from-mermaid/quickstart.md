# Quickstart: New Diagram From Mermaid Text

Validation guide for [spec.md](spec.md). It proves the feature end to end once it is built. The model and the dialog
are described in [data-model.md](data-model.md) and [contracts/](contracts/).

## Prerequisites

```bash
npm install
npm run dev          # http://localhost:5173/
```

## 1. Happy path (US1, SC-001)

1. Open `http://localhost:5173/#/`.
2. Choose **New from Mermaid…**. Focus is in the text area.
3. Paste:

   ```text
   flowchart LR
     A[Start] --> B{Valid?}
     B -->|yes| C([Done])
     B -->|no| A
   ```

4. Within a second the preview shows four nodes, the type reads "Flowchart", and the report says nothing was dropped.
5. Choose **Import**. The editor opens with the four nodes laid out left to right, the source panel shows an
   equivalent flowchart, and **Undo** is unavailable.

## 2. A report with dropped content (US2)

Paste:

```text
sequenceDiagram
  autonumber
  Alice->>Bob: hi
  loop every minute
    Bob-->>Alice: still here
  end
  Note over Alice,Bob: done
```

Expect two messages kept in order and four report entries (autonumber, the loop wrapper and its end, the note), each
with its line number. Choose an entry: its line is selected in the text. **Import** is enabled, described as
"Import, 4 constructs dropped".

## 3. An error (US3)

Paste `flowchart TD` / `A[oops -->` / `B`. Expect "Line 2, column ...", the line marked, **Import** disabled. Fix the
bracket and the preview appears.

## 4. Compare and files (US4, US5)

- Choose **Compare** after step 1: both texts side by side, changed lines marked with `~`, `+` or `-`.
- Save a `.md` file with two `mermaid` blocks and drop it on the start screen. The dialog opens with the first block;
  the report lists the second as *ignored* with its line.

## 5. Automated checks

```bash
npm test                                  # pure layers, adapter contract tests, the corpus
npm run test:e2e -- import                # the dialog, drop, compare, accessibility, performance
npm run typecheck && npm run lint
python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py gate --all
```

Expected: all pass; no network request is made during any import (the e2e test blocks them); the generated source of
every imported fixture is accepted by Mermaid's parser.

## Manual checks

Recorded in the Verification Plan (MV-001 to MV-004): the 30-second task, the usability check with developers, the
dependency review and a screen-reader pass.
