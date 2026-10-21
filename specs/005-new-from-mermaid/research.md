# Research: New Diagram From Mermaid Text

Phase 0 for [plan.md](plan.md). Each entry is a decision with its reason and the alternatives rejected. Facts about
Mermaid 12.2 were observed by reading probe documents through the installed parser (the same route the editor's
fidelity tests use), not taken from documentation.

## R1. Who judges the text, and where the model comes from

**Decision.** Mermaid's own parser judges every document (FR-004). Only text it accepts is read further. The model is
then read from the parser's result for flowcharts and sequence diagrams, and by the project's own statement reader for
C4.

**Evidence.**

- A Flowchart or Sequence document read through the parser's diagram database gives vertices with shape types,
  edges with arrow type and stroke, direction, subgraphs, actors with role and alias, and messages in order with a
  numeric type. Chains (`A --> B --> C`), fan-out (`A --> B & C`), `:::` classes, `@{ shape }` nodes and entity
  placeholders are all already resolved. Reading these by hand would re-implement the grammar.
- The C4 database **merges relationships with the same two ends**: `Rel(p,s,"b")`, `Rel(s,p,"c")` and a repeated
  `Rel(p,s,"b")` come back as two relationships, and a `Rel` followed by a `BiRel` between the same pair comes back
  as one. Importing from it would lose relationships silently, which FR-006 forbids. C4 statements are regular
  (`Macro(alias, "arg", ...)`), so a small statement reader is safer than the database.
- The database does not carry source line numbers for anything.

**Consequence.** One reader per type, all behind the same shape: a *snapshot* of what the document says (plain data),
turned into the visual model by pure functions. The Mermaid-facing adapter is the only code that touches the parser
and the DOM (R2).

**Alternatives rejected.**

- *A hand-written parser for all three types.* Flowchart grammar (shape forms, edge forms with inline text, chains,
  `&`, `@{}`) is large and would drift from Mermaid's; the editor would accept documents Mermaid rejects or the reverse.
- *The database for C4 too.* Rejected for the silent loss above.
- *Langium-based `mermaid.parse` result.* It returns only the diagram type, not a model.

**Risk.** The database is an internal API (`mermaidAPI.getDiagramFromText` is marked deprecated). The editor's tests
already depend on it (fidelity tests). The adapter is the single place that knows its shape, and a contract test per
construct (VO-008, VO-010) fails on a Mermaid upgrade that changes it.

## R2. Where the code lives (constitution, Principle II)

**Decision.** A new pure folder, `app/importing/`, holds everything that decides what an import means: document
splitting, type detection, snapshots to model, the line scanner, the report, the layout, the label decoding, the
naming and the line diff. It imports only the model, validation, generation (for the compare view) and text layers;
none of those imports it. The DOM-free rule holds, so it is tested without a browser.

Two thin modules sit outside it, in the composition layer: the Mermaid adapter (`app/editor/mermaidSnapshot.ts`, next
to the existing `mermaidParser.ts`, loaded lazily like it) and the saved-library entry (`app/editor/library.ts`
gains one function). The dialog is rendering (`app/rendering/import/`).

**Alternatives rejected.** Putting the readers in `app/editor/` (the folder is the state composition root, not a
place for a feature of this size); putting them in `app/model/` (the model layer must not know Mermaid text).

## R3. Line numbers and "never lose content" (FR-006, SC-003)

**Decision.** A pure line scanner classifies every line of the document, independently of the readers: *blank*,
*comment*, *directive*, *header*, *a construct the model keeps*, or *a construct it cannot keep* (with a name).
Reports take their line numbers from it. The invariant that gives "no silent loss" is checked as a property: **every
non-blank line of the document is either accounted for by something in the model or has a report entry**, over the
whole test corpus (VO-055).

**Why.** The parser's results are the truth for *what is kept*; the scanner is the truth for *where things are*.
Neither can replace the other (R1), and the invariant ties them together: a kept item has a line, a dropped one has an
entry, and a line with neither fails the test.

**Alternative rejected.** Asking the parser for locations: the diagram database does not hold them and the jison
lexer's locations are for tokens, not for statements.

## R4. Syntax errors with line and column (FR-004, SC-004)

**Decision.** On rejection the parser throws an error that carries its location: a line, and first and last columns
(`hash.loc`), besides a message that starts "Parse error on line N". The dialog uses the location, adds the offset of
a removed front-matter block, and marks the line. When the location points past the last line (an unclosed bracket
at the end of input reports the end), the last non-blank line is marked. The message text is shown as written, with
the expected-token list shortened to its first five entries.

**Evidence.** For `A[oops -->` / `B` the message says line 4 for a 3-line document, so the message line cannot be used
as is; `hash.loc.first_line` is 2, the right line. For `A->>: x` it is 2, which is right. The corpus test (VO-013, at
least 20 broken documents, SC-004) pins this behaviour, including documents with front matter, and fails if a
Mermaid upgrade changes it.

**Alternative rejected.** Parsing "line N" out of the message: shown wrong above.

## R5. The live preview (FR-003, SC-005)

**Decision.** The preview draws the **generated** source of the imported diagram with Mermaid, exactly as the
flowchart preview already does, so what the developer checks is what the editor will produce and later show. The
drawing function is extracted from the flowchart preview and shared. It is debounced (300 ms after the last
keystroke), runs latest-only (the existing `latestOnly`, EC-09), and shows an error rather than a stale picture.

**Why not read-only canvases.** The three canvases are bound to the editor's state and gestures; a read-only mode is a
change to all three for no gain, and a Mermaid drawing also exercises the generated source.

**Risk (EC-07).** Drawing runs on the main thread. If measured typing stalls exceed 100 ms for 500 nodes (VO-050), the
mitigation is already chosen: above 150 items the picture is drawn on request ("Show preview") while parsing,
the report and the confirm control stay live. This is a contingency, not part of the first build.

## R6. Layout (FR-008)

**Decision.** A small layered layout, written for this feature, with no new dependency:

1. Break cycles: a depth-first walk reverses back edges (the original edge is untouched; only the layering sees it).
2. Rank: longest-path layering, so every edge that is not part of a cycle ends at a later rank than it starts.
3. Order within a rank: four barycentre sweeps, down and up, ties by first appearance. Deterministic.
4. Coordinates: ranks `NODE_HEIGHT + 80` apart (vertical for TD and BT, `NODE_WIDTH + 80` for LR and RL), nodes in a rank
   `NODE_WIDTH + 48` (or `NODE_HEIGHT + 48`) apart, each rank centred on the widest. BT and RL mirror TD and LR. Integers
   only, non-negative, within the editor's bounds, so no two footprints overlap and the file checks pass.

Isolated nodes form a rank-0 row. Cost is O(sweeps x (n + m)), a few milliseconds at 500 nodes.

**Alternatives rejected.** `dagre` / `elkjs` (a new runtime dependency, FR-014; Mermaid bundles dagre but does not
expose it); force layout (not layered, not deterministic); a grid (ignores connections, contradicts Clarification Q4).

## R7. Approximations (Clarification Q1, FR-006)

Fixed tables, in the report as *approximated* with what each became.

| Mermaid | Becomes | Note |
|---------|---------|------|
| double circle `(((x)))`, `@{shape: dbl-circ}` | circle | |
| asymmetric `>x]`, trapezoid `[/x\]`, inverted trapezoid `[\x/]`, lean-left `[\x\]` | rectangle, rectangle, rectangle, parallelogram | the nearest outline |
| any other `@{ shape }` name the editor lacks | rectangle | |
| a bare id with no brackets | rectangle, label = the id | not reported (that is Mermaid's own default) |
| `--o`, `--x` (circle, cross ending) | plain line | |
| `o--o`, `x--x` | two-way (both) | |
| invisible link `~~~` | **dropped** | no visible line exists in the model |
| line length (`--->`, `-.->`) | length ignored | a layout hint like position; not reported (see Decisions to overrule) |
| C4 element type the kind does not offer | the nearest type the kind offers: Component to Container to System to Person, keeping the database, queue and external variants where the kind has them | e.g. `Container` in `C4Context` becomes `System` |
| C4 boundary type the kind does not offer | generic boundary; in Deployment, where no boundary exists, the boundary is dropped and its children moved up | |
| Sequence actor of another kind (`@{ "type": "database" }`) | participant | |
| a message, relationship or element label with no visible character | the default text the editor gives a new one | |
| Dynamic `RelIndex` numbers that are not 1, 2, 3 in order | the editor numbers by position; relationships are sorted by their given number | reported as approximated |

## R8. Label text (FR-009, EC-03, EC-12 and the HTML clarification)

**Decision.** One pure `decodeLabel`, built from the test-support `decode` that already exists
(`app/testing/mermaidReadback.ts`) and moved into the importing folder: Mermaid's placeholder form of `#NN;` and
`#name;` entities, the named HTML entities `&amp; &lt; &gt; &quot; &apos; &nbsp;` and numeric `&#NN;`, and `<br>` /
`<br/>` as line breaks. Any other HTML tag is **stripped and the text kept**, and the label is reported as dropped
(Clarification on EC-12). The decoded text is given to the model as typed; generation escapes it with the editor's
own scheme. The round trip (generate, import, generate) is a contract test (VO-028).

## R9. Document handling (FR-002, FR-012, FR-016)

- **Type from the first significant line.** Skipping blank lines, `%%` comments, a front-matter block (`---` ...
  `---`) and `%%{ ... }%%` directives: `flowchart` / `graph` (flowchart), `sequenceDiagram`, and the five C4 headers.
  Anything else is "valid Mermaid, not supported" if the parser accepts it, and a syntax error otherwise.
- **Markdown.** A file named `.md` (or text with a code fence whose info string is `mermaid`) is split into
  blocks; the first is loaded, the rest listed as *ignored* with the line of the fence and the block's first line.
- **Several diagrams.** A second header line in one block (EC-02) is not a thing the parser accepts for most
  types; where it is accepted (a second `flowchart` line is read as a node or rejected) the parser's verdict stands and
  the scanner lists any later header as *ignored*.
- **Size.** The file limit is the editor's `MAX_FILE_BYTES` (5 MiB) for a file and for pasted text; C4 nesting beyond
  the editor's depth of 50 is refused. These are the only limits the editor has (the editor spec sets none on counts).
  A refusal names the limit and creates nothing (EC-08).

## R10. Saving and opening the result (FR-011)

**Decision.** Confirming builds the diagram, **saves it as a stored record first** (the library's existing write, the
same format version, a new id), and then opens `#/d/<id>`. The editor loads it from storage with an empty history, so
"saved and reopened is identical" (SC-006) holds by construction and the Undo button starts unavailable. If the write
fails, nothing is created: the dialog stays open with the text and says why (storage is unavailable or full). This is
the honest behaviour of constitution Principle V ("success only after it has occurred"). It differs from a diagram
started blank, which can be edited unsaved; there the user has made no work to lose, here they would navigate away
from a dialog that still holds their text.

**Ids.** Items are numbered from 1 in the order the document introduces them (nodes by first appearance, then
connections; participants then messages; tree depth first then relationships), and `nextId` is one more than the last.
Importing the same text twice gives the same ids (stable) and the editor's id check passes (unique).

**No format change.** The model, the record and the file are unchanged; no migration; `CURRENT_FORMAT_VERSION` stays.

## R11. Name (FR-011, Clarification Q2)

Front-matter `title:` (quotes removed), else a C4 `title` line (also kept as the diagram's C4 title), else the editor's
default name for the type. Entered in a text field in the dialog; saving needs a visible character, as for any rename.

## R12. Start screen, dropping and the dialog

- `New from Mermaid…` is a button beside the three type buttons. It opens a modal dialog (the C4 kind dialog is the
  pattern; MUI `Dialog` gives focus trap, Escape and restore-focus for free).
- Dropping a file anywhere on the start screen opens the dialog with the file loaded; the page shows a drop overlay
  while a file is dragged over it. The same file reader is used by the dialog's file picker.
- Pasted or loaded text is kept in memory for the visit (EC-10), not in storage: no key is written until confirm.
- Selecting a report entry highlights its line in the paste area (a plain `textarea` cannot highlight, so the
  paste area is a `textarea` with an aligned, read-only line gutter and the selected line selected in the text with
  `setSelectionRange`, which also scrolls it into view).
- Accessibility: one polite live region carries "N constructs dropped, M approximated" and the error summary; focus
  never moves on update (FR-013). The compare view is two `pre` blocks in a labelled region with a text marker on each
  changed line (`+`, `-`, `~` with a visually hidden word), so colour is never the only signal.

## R13. Compare view (FR-010)

A line diff (longest common subsequence on lines, linear space is not needed at these sizes) between the document and
the generated source. Each line is *same*, *changed* (shown as removed then added), *removed* or *added*. Dropped
constructs show as removed because the generated text never holds them. Identical text is stated as such.

## R14. No network, nothing executed (FR-014, EC-12)

The parser is run in its non-rendering mode and nothing is drawn from the document except the generated source,
drawn with `securityLevel: "strict"` as the existing preview does. `click`, links and HTML are never passed to anything
that follows them. No new runtime dependency: Mermaid, MUI and React are already shipped.

## Decisions to overrule

These are choices made without a spec statement; the developer can overrule any.

1. Line length (`--->`) is ignored without a report entry.
2. C4 element types and boundaries a kind does not offer are approximated, not dropped (R7).
3. A failed save refuses the import instead of opening it unsaved (R10).
4. Above 150 items the preview may become on request, only if measurement requires it (R5).
