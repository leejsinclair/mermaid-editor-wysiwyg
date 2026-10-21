# Contract changes: Import Review Fixes

These are changes to feature 005's contracts
([import-reading.md](../../005-new-from-mermaid/contracts/import-reading.md),
[import-dialog.md](../../005-new-from-mermaid/contracts/import-dialog.md)). Everything not listed stays as it is.

## Reading (import-reading.md)

1. **C4 text decoding.** Every C4 text field the import keeps is decoded in a single pass: each Mermaid escape `#<n>;` or
   `#<name>;`, each `<br/>` (which becomes a newline) and each HTML entity is replaced once, and no replacement is read
   again, so text typed as `<br/>` or `&amp;` comes back as typed. An entity is matched whole, and one whose number names
   no character is kept as typed. Other HTML tags stay as text.
   Stable guarantee added: for any C4 diagram the editor builds, generate, then import, then generate gives the same
   source, and it stays the same after three round trips.
2. **Directives.** A `%%{ … }%%` directive may span lines. It is one `ignored` entry on its first line. A directive that
   never closes gives an `invalid` outcome on its first line:
   "The directive that opens on line {line} is never closed with }%%."
3. **Second diagram header.** The text given to the parser ends before a second diagram header. The header keeps its
   `ignored` entry. A C4 block with two different kinds is still refused (005 EC-06). Lines inside a directive are never
   taken for a diagram header. A line is a header only when, trimmed, it is a diagram type word alone or followed by
   white space and that type's header arguments (a direction for `flowchart` and `graph`), so a statement such as
   `pie[Chart]` or `graph->>Bob: Next` is not a header and an indented `  flowchart LR` is.
4. **Approximated entries.** `becomes` completes "Kept as …" (see the data model).
5. **Compare.** `compareLines(original, generated)` returns `{ lines, simplified }`. Memory is bounded by the text length
   plus a fixed trace limit. The edit script is minimal up to 2,000 edits. Past that, shared lines at the start and end
   are matched, the middle is shown as changed, removed and added lines, and `simplified` is true.

## Dialog (import-dialog.md)

1. **Import availability.** Import is enabled only when the preview was read from exactly the text in the paste area,
   the outcome is ready and the name is filled. Any edit disables it at once. Emptying the text removes the preview at
   once.
2. **Selecting a report entry.** Selects its line once. Typing afterwards edits at the caret. A line number past the end
   of the current text selects nothing.
3. **Report entry text.** `line {line}: {construct} ({category}). {reason}`, plus ` Kept as {becomes}.` for approximated
   entries. The visible text is the entry's accessible name.
4. **File problems.** Adds "The file could not be read." for a file whose contents cannot be read. The text and preview
   are unchanged.
5. **Compare view.** When `simplified` is true, the view shows the note "Differences in the middle of this text are
   shown in simple form because the texts are very large." above the comparison, in the compare region.
6. **Reading pause.** A change of more than one character at once (a paste, a drop or a file) is read 100 ms after it;
   a keystroke keeps the 300 ms pause. This keeps the 100-node preview inside 005 SC-005's one second (decision DN-01).
