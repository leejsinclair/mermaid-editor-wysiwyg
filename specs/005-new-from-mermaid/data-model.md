# Data Model: New Diagram From Mermaid Text

Phase 1 for [plan.md](plan.md). **The visual model, the saved record, the file format and the generated Mermaid
source do not change**, and neither does the format version: an imported diagram is an ordinary `Diagram`
(`app/model/types.ts`) that passes the same `checkDiagram` an opened file passes. What follows is the data that exists
only while the dialog is open (never saved), and the rules that turn a document into a diagram.

## Import state (dialog only)

| Entity | Fields | Notes |
|--------|--------|-------|
| **Document** | `text`; `fileName?`; `source`: `"typed"` or `"file"`; `startLine` (the line of the text within a Markdown file, 1 for pasted text) | Kept in memory for the page's visit (EC-10); never stored |
| **Split document** | `text` (the first block), `lineOffset`, `frontMatter?` (`title`), `ignored`: `IgnoredBlock[]` | `IgnoredBlock` is `{ line, firstLine }` |
| **Detection** | `{ type: "flowchart" }`, `{ type: "sequence" }`, `{ type: "c4", kind }`, `{ type: "unsupported", found }` or `{ type: "none" }` | `found` is the header word, e.g. `classDiagram` |
| **Snapshot** | one of three plain shapes (below) | What the document says, before it is turned into a model |
| **Report entry** | `{ line, column?, category, construct, reason, becomes? }` | `category`: `dropped`, `approximated`, `ignored`. `becomes` is set for `approximated`. `construct` is a short name (`subgraph`, `classDef`, `note`, `double circle`...). `reason` is one plain sentence |
| **Import result** | `{ diagram, report, detection, name }` | `diagram` is a complete `Diagram` with a fresh id; `report` is ordered by line |
| **Outcome** | `empty`; `invalid` (`message`, `line`, `column`); `unsupported` (`found`); `refused` (`reason`: `tooLarge`, `tooDeep`, `kindUndetected`, `kindsMixed`, `notValid`); or `ready` (an Import result) | The dialog renders exactly one |
| **Compare line** | `{ kind: "same" \| "changed" \| "removed" \| "added", original?, generated?, originalLine?, generatedLine? }` | `changed` pairs the removed and added line |

### Snapshots

```text
FlowchartSnapshot  direction: "TD" | "LR" | "RL" | "BT"
                   vertices:  { key, text, shape }[]           in first-appearance order
                   edges:     { from, to, text, arrow, stroke }[] in order
                   subgraphs: { id, title }[]                   (reported, not imported)
SequenceSnapshot   actors:    { key, label, role }[]            in declaration or first-use order
                   steps:     { type, from?, to?, text, block? }[] in order, blocks and notes included
C4Snapshot         kind, title, statements: { macro, args, line, depth }[]
```

`shape`, `arrow`, `stroke` and `type` hold the parser's own words (`square`, `arrow_point`, `dotted`, `0`...). Turning
them into editor values is one table per type, in the pure layer, and is what the contract tests pin (R1).

## From snapshot to model

**Flowchart.** Vertices become nodes (ids 1.. in order), edges become connections (ids follow the nodes). Shape and line
tables: R7. A vertex with no brackets is a rectangle labelled with its key. Self-loops, parallel edges and cycles are
kept (constitution IV). Node positions come from the layout (R6); `nextId` is nodes + connections + 1.

**Sequence.** Actors become participants in order; `role` is `actor` for `actor`, else `participant`. Steps of a message
type become messages in order, whatever block they sat in (Clarification Q5). Notes, block starts, ends and `else`/`and`
lines, activations and `autonumber` become report entries. A message's `block` is the nearest enclosing block's kind and
title, used only in its report entry. Message styles: `->>` solid-arrow, `-->>` dashed-arrow, `->` solid-open, `-->`
dashed-open, `-x` solid-cross, `--x` dashed-cross, `-)` solid-async, `--)` dashed-async (pinned by VO-010).

**C4.** Statements are read depth first by the statement reader (R1): `Person`, `System`, `Container`, `Component` and
their `Db`, `Queue` and `_Ext` forms become elements; `Enterprise_Boundary`, `System_Boundary`, `Container_Boundary` and
`Boundary` become boundaries; `Deployment_Node`, `Node`, `Node_L` and `Node_R` become Deployment nodes; `Rel`, `BiRel`,
`RelIndex` and the directional forms (`Rel_U`, `Rel_Down`, `Rel_Back`...) become relationships (the direction hint is
a layout hint and is reported as dropped). Arguments are `alias, label, [technology,] [description]` for Container and
Component forms and `alias, label, [description]` for the rest, as generation writes them. Relationship arguments are
`from, to, label, [technology]`. `title` sets the C4 title. Elements and relationships whose ends are unknown
(an alias never declared) are dropped and reported.

## Rules every import meets

1. The diagram is built, then checked with `checkDiagram`. A result that fails the check is a `refused` outcome
   (`notValid`) naming the problem, never a half-imported diagram (FR-016).
2. Every non-blank line of the document is accounted for: it is represented in the diagram, or it has a report entry,
   or it is a header, a blank line or a closing brace (R3, SC-003).
3. Report entries are unique per (line, construct), ordered by line then column.
4. An id the document uses for two labels follows the parser's reading; the second label is reported (EC-04).
5. The name is the front-matter title, else the C4 title, else the default name; it needs a visible character (R11).
6. `changedAt` is empty until saved; the saved record carries the current format version (R10).

## What is saved

On confirm: the library's existing record write, with `toRecord(diagram)` and a fresh `crypto.randomUUID()` id. The
history starts empty because the editor opens the stored diagram. Nothing about the document (text, report, file name,
ignored blocks) is stored.
