# Quickstart: validating the Visual Diagram Editor

How to prove the feature works end to end. Behaviour is defined in [spec.md](spec.md); interfaces in
[contracts/](contracts/); obligations in the [Verification Plan](plan.md#verification-plan).

## Prerequisites

- Node.js 24 and the project's dependencies: `npm install` (adds `@xyflow/react`, `@mui/material`,
  `@emotion/react`, `@emotion/styled` and the dev dependency `@axe-core/playwright` once the setup tasks have
  added them).
- Playwright browsers: `npx playwright install chromium firefox`.

## Automated checks

| Check | Command | Expected |
|-------|---------|----------|
| Types | `npm run typecheck` | No errors |
| Lint (incl. Mermaid in Markdown) | `npm run lint` | No errors |
| Pure layers, generation fidelity, codec | `npm test` | All pass; fidelity tests parse every generated source with Mermaid 12.2 |
| Browser behaviour (Chromium, Firefox) | `npm run test:e2e` | All pass |

Tests are run for the record only through
`python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py run --command <id> ...` (see the plan's
verification commands).

## Manual walk-through (about 10 minutes)

1. `npm run dev`, open `http://localhost:5173`. The start screen offers Flowchart, Sequence and C4 and says
   diagrams are kept only in this browser.
2. **Flowchart**: drag a Rectangle and a Diamond onto the canvas, connect them with a dotted arrow, label the
   Diamond `Is it "ok" <yes>?; #1`. Open "Mermaid source": both nodes, one `-.->` connection, the label escaped.
   Open **Preview as Mermaid draws it**: the diagram appears, laid out by Mermaid. **Copy Source**, paste into
   any text field: identical to the panel.
3. Undo three times, Redo three times: canvas, source and preview follow each step.
4. **Sequence**: add two Participants and an Actor, three messages of different types, move the last message up.
   The source lists declarations, then messages in the new order.
5. **C4 → Dynamic**: the kind picker shows the experimental note. Add three Components and two relationships;
   they read `1:` and `2:`. Move the second up: numbers swap. Add a Container boundary: the source panel warns that
   the empty boundary cannot be drawn; move a Component into it: the warning goes.
6. Close the browser, reopen the editor: all three diagrams are listed, newest first; each opens identical with
   Undo unavailable.
7. **Save file** on one diagram, delete it from the list, **Open file…**: it comes back as a new diagram.
   Open a text file renamed to `.mermaid-editor.json`: refused, nothing added.
8. Open one diagram in a second tab: "open in another tab"; **Edit here instead**; the first tab says editing
   moved and offers **Take it back**.
9. Repeat step 2 using only the keyboard (toolbox buttons, **Connect…**, arrow keys, Enter, Delete,
   Ctrl+Z).

## Expected failure behaviour

- With the browser's site data blocked, editing works and the status reads "Browser storage is unavailable…";
  leaving the page asks for confirmation.
- With clipboard permission denied, both copy actions report failure and never success.
