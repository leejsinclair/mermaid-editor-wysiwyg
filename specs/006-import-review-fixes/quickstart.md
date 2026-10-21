# Quickstart: validating the import review fixes

Prerequisites: `npm ci`, then `npm run dev` for manual checks. Tests are run through `tdd_check.py run` during
implementation; the commands it wraps are in the plan's Verification Plan.

## Automated

- Unit: `npm test -- app/importing` (decoding, C4, document, compare) and `npm test -- app/rendering/import` (file reading).
- End to end: `npm run test:e2e -- e2e/import-` (the dialog), and `npm run test:e2e -- e2e/import-performance.spec.ts`
  (the 100-node budget, with the measured time in the run's annotations).

## Manual walk-through

1. **C4 round trip.** New C4 Context diagram. Add a Person labelled `R&D`, description `"fast" <cheap>` and technology
   `C#`. Copy the source. Open New from Mermaid and paste it. The preview and the imported diagram show the same three
   values, and the compare view shows no differences.
2. **Stale Import.** Paste a flowchart and wait for the preview. Select all and delete, then press Import at once.
   Nothing is created, and the preview is gone. Paste text A, wait, then change one label and press Import at once.
   Import is disabled until the new preview appears.
3. **Report selection.** Paste a flowchart with an asymmetric node (`A>Flag]`). Select its report entry, click at the end
   of the text and type `abc`. All three characters appear at the caret.
4. **Report wording.** The same entry reads "… Kept as a rectangle."
5. **Directive.** Paste `%%{init: {\n "theme": "dark"\n}}%%` followed by `flowchart TD\n A --> B`. It is detected as a
   flowchart, and one ignored entry names line 1.
6. **Second header.** Paste `flowchart TD\n A --> B\nflowchart LR\n C --> D`. A and B are imported. Line 3 is listed as
   not imported, and the import succeeds.
7. **Unreadable file.** Choose a file, then delete it on disk before the dialog reads it (or use the e2e test). The
   dialog says "The file could not be read."
8. **Large compare.** Paste a flowchart of about 10,000 lines and open Compare. It opens within 2 s and the tab stays
   responsive. The simplified note is checked by the unit tests, which compare two completely different texts directly.
9. **MV-001.** See the plan's Manual verification table.
