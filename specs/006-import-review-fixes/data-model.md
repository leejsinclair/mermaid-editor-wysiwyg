# Data Model: Import Review Fixes

No stored data changes. The diagram model, the file format and its version are untouched. The changes are to
in-memory values in the import layer, each a correction of feature 005's
[data model](../005-new-from-mermaid/data-model.md).

## Import report entry (changed: text only)

| Field | Change |
|-------|--------|
| `becomes` | Required in practice for `approximated` entries, and now shown. Each value completes the phrase "Kept as …" (research R6). |

Shown text: `line {line}: {construct} ({category}). {reason}`, plus ` Kept as {becomes}.` when `becomes` is set.

## Directive (new, internal)

| Field | Meaning |
|-------|---------|
| `first` | 1-based line where `%%{` opens |
| `last` | 1-based line holding the closing `}%%`, or none when it never closes |

Rules: it opens on a line whose trimmed text starts with `%%{`. It closes on the first line, the same one or a later one,
that contains `}%%`. It is reported once, as `ignored`, on `first`. An unclosed directive makes the outcome `invalid`, with
its line.

## Detection (changed)

Adds `{ type: "unclosedDirective"; line: number }` to the existing detections (`none`, `flowchart`, `sequence`,
`c4`, `unsupported`).

## Split document (changed: meaning of `text`)

`text` ends before a second diagram header (research R5). The C4 mixed-kind check still reads the whole first block.

## Compare result (changed)

| Field | Meaning |
|-------|---------|
| `lines` | The existing compare lines (`same`, `changed`, `removed`, `added`) |
| `simplified` | True when the work limit (2,000 edits) was reached and the middle was marked in simple form |

## Import state in the dialog (changed)

| Value | Meaning |
|-------|---------|
| `outcome` | None when the text is empty or whitespace only. Otherwise the outcome of the last text read. |
| `checking` | True when the text on screen differs from the text the outcome was read from. Import is unavailable while it is true. |
