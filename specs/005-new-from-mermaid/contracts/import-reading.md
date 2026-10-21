# Contract: Reading Mermaid Text Into a Diagram

The behaviour of the pure import (no DOM) that the dialog, the tests and the corpus rely on.

## Input and output

`readDocument(text, parse)` takes the document text and the Mermaid parser as a function (so the pure layer stays
testable), and returns one **Outcome** (data-model.md): `empty`, `invalid`, `unsupported`, `refused` or `ready`. It
never throws and never returns a diagram that `checkDiagram` rejects.

## Order of work

1. Empty after trimming: `empty`.
2. Over the size limit: `refused` (`tooLarge`) before anything else is read.
3. Split Markdown, front matter and directives; detect the type (R9). `none` or `unsupported` stops here
   when the parser accepts the text; when it rejects it, the outcome is `invalid`.
4. Parse with Mermaid. Rejection: `invalid` with the line and column of R4.
5. Read the snapshot, then build the diagram and the report (data-model.md).
6. Name, ids, layout (flowchart only), `checkDiagram`.

## Line numbers

Every report line number is a line of the **text the developer sees in the text area**, counting from 1, including any
front matter and, for a Markdown file, the first block's own lines (the fence is not part of the text).
`startLine` maps them back to the file when a Markdown block is shown in the report of ignored blocks.

## Report category rules

| Category | When | Example entry |
|----------|------|---------------|
| dropped | The editor has nothing to hold it | "line 12: subgraph Billing. The editor has no groups; its nodes were kept." |
| approximated | Kept as the nearest thing the editor has | "line 7: asymmetric shape. Kept as a rectangle." |
| ignored | Not part of this diagram | "line 1: front matter. Only its title is used." |

An entry is never added for something the model keeps. A group's contents are kept even when the group is dropped.

## Stable guarantees (asserted by tests)

- The same text always gives the same diagram, ids, positions and report.
- The generated source of an imported diagram is valid Mermaid (the editor's own check passes).
- Generating from a model, then reading that source, then generating again gives the same source (SC-006).
- A line that is neither represented nor reported is a test failure (SC-003).

## Changes in feature 006

Feature 006 (import review fixes) changed this contract in five places: C4 text decoding, multi-line and unclosed
directives, the block ending before a second diagram header, "Kept as …" for approximated entries, and a bounded
compare. The changes are listed in [006 contracts/import-changes.md](../../006-import-review-fixes/contracts/import-changes.md#reading-import-readingmd).
