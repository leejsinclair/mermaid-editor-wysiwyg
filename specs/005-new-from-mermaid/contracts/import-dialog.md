# Contract: The "New from Mermaid…" Dialog

The user-facing contract for starting a diagram from Mermaid text. It extends
`specs/002-visual-diagram-editor/contracts/editor-ui.md`; anything not stated here is unchanged. Tests rely on the
names and attributes in the last section.

## Entry points

| Where | What | Result |
|-------|------|--------|
| Start screen, beside the three type buttons | Button **New from Mermaid…** | Opens the dialog, empty |
| Start screen | A file dragged over the page shows a drop overlay; dropping a `.mmd`, `.md` or `.txt` file | Opens the dialog with the file's Mermaid text loaded |
| Dialog | **Choose file…** | The same file reader as a drop |

No other screen offers the dialog. The editor has no way to open it, and the source panel stays read-only.

## Layout

A modal dialog titled **New from Mermaid**. Two columns at 900 px and wider, one column below:

1. **Mermaid text**: a multi-line text area with a line-number gutter, and **Choose file…**.
2. **Preview**: the detected type (for example "Flowchart" or "C4 Container"), the diagram drawn from the
   generated source, and a **Compare** toggle.
3. **Import report**: a heading with counts, then entries grouped *Dropped*, *Approximated*, *Ignored*.
4. **Name**: a text field, prefilled (FR-011).
5. Footer: **Cancel**, **Import**.

## States

| State | Text area | Preview | Report | Import |
|-------|-----------|---------|--------|--------|
| Empty | hint of what can be pasted | blank | none | disabled |
| Checking | unchanged | previous picture dimmed, "Checking…" | previous | disabled |
| Invalid | the offending line marked | none | none | disabled |
| Unsupported type | unchanged | none | none | disabled |
| Refused | unchanged | none | the reason | disabled |
| Ready | unchanged | drawn | entries or "Nothing was dropped" | enabled |

The state changes 300 ms after the last keystroke, or 100 ms after a paste, a drop or a file (feature 006); the newest
text always wins (EC-09).
Checking never blocks typing.

## Messages

- Invalid: "Line 4, column 9: <Mermaid's message>". The marked line has a visible marker and an accessible text
  ("error here"), not colour alone.
- Unsupported: "This looks like a classDiagram. The editor supports flowcharts, sequence diagrams and C4 diagrams
  (context, container, component, dynamic, deployment)."
- Refused: names the reason and the limit ("larger than 5 MB", "nested deeper than 50 levels", "the C4 kind could not be
  found", "more than one C4 kind: Context, Container").
- Report heading: "Import report: 3 dropped, 1 approximated, 1 ignored", or "Nothing was dropped or approximated".
- Import control description: "Import, 3 constructs dropped" (counts dropped and approximated, FR-006).
- Storage failure: "The diagram could not be saved in this browser: <reason>. Nothing was created." The text stays.

## Report entries

Each entry is a button: **line N: construct (category). Reason.** Activating it selects that line in the text area and
scrolls it into view. Entries are in line order within a group. The report can be dismissed (**Hide report**) and shown
again; hiding does not change the counts in the Import control's description.

## Compare view

A region named **Compare original with generated** with two panes, each a numbered list of lines. A line that differs
carries a text marker as well as a style: `−` removed, `+` added, `~` changed (with a visually hidden word). When there
is no difference the region says "The original already matches the generated text."

## Focus and keyboard

- Opening puts focus in the text area; closing returns focus to the control that opened it (**New from Mermaid…**, or the
  page after a drop).
- Escape closes the dialog; on an empty dialog it closes at once, on a non-empty one it also closes and the text is
  kept for the visit (EC-10).
- **Tab** order: text area, **Choose file…**, report entries, **Compare**, name, **Cancel**, **Import**.
- Updates are announced in one polite live region (the report counts, the error summary) and never move focus.

## Attributes tests rely on

| Element | Role and accessible name |
|---------|--------------------------|
| Entry button | button **New from Mermaid…** |
| Dialog | dialog **New from Mermaid** |
| Text area | textbox **Mermaid text** |
| File button | button **Choose file…** |
| Detected type | text with test id `detected-type` |
| Preview | region **Preview**, image child |
| Report | region **Import report**; entries are buttons; test id `report-entry` with `data-category` |
| Live region | `role="status"` named **Import status** |
| Compare | button **Compare** (toggle), region **Compare original with generated**; changed lines `data-change` |
| Name field | textbox **Diagram name** |
| Confirm | button **Import** |
| Drop overlay | test id `drop-overlay` |

## Changes in feature 006

Feature 006 (import review fixes) made Import follow the Checking state above for every edit, including emptying the
text, and changed report selection, report entry text, file problems and the compare view. The changes are listed in
[006 contracts/import-changes.md](../../006-import-review-fixes/contracts/import-changes.md#dialog-import-dialogmd).
