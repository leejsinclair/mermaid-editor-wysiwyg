# Quickstart: validating the Flowchart Visual Editor

Run from the repository root. Prerequisites: Node.js with dependencies installed (`npm install`), and the
Playwright browsers for Chromium and Firefox (`npx playwright install chromium firefox`). Tests are run through
`tdd_check.py run` during implementation; the commands below are for a person checking the finished feature.

## 1. Automated checks

| Step | Command | Expected |
|------|---------|----------|
| Type check | `npm run typecheck` | No errors |
| Lint | `npm run lint` | No errors |
| Pure layers | `npm test` | All pass: model, validation, generation, history, copy and source-status logic |
| Browser | `npm run test:e2e` | All pass in Chromium and Firefox |

## 2. Walk-through by hand

Start the app with `npm run dev` and open the printed address (localhost) in Chrome or Firefox.

1. **Start (US1)**: the page asks for a diagram type and offers Flowchart only. Choose it. An empty canvas opens,
   showing "Flowchart". Open the source panel: it reads `flowchart TD`.
2. **Build (US1)**: drag a Rectangle, a Diamond and a Cylinder onto the canvas. Choose "Solid arrow" and drag
   from one node's handle to another. The source panel now lists the nodes and the connection.
3. **Copy (US1)**: press Copy Source and paste into any text field. It matches the source panel and parses in
   any Mermaid tool.
4. **Edit (US2)**: move a node (connections follow); rename one to `say "hi" [x] | y`; give a connection a label.
   The label shows exactly as typed and the source stays valid.
5. **Delete (US3)**: with A to B to C built, delete B. A and C remain, no A to C connection appears.
6. **Undo and redo (US4)**: press Undo until the canvas is empty, then Redo until the diagram is back; the
   source panel matches the canvas at every step. A drag undoes in one step.
7. **Refusals (US5)**: confirm an empty node label (refused, message shown, old label kept); release a
   connection over empty canvas (refused, message shown); press Delete with nothing selected (asks you to
   select something).
8. **Keyboard (FR-024)**: Tab to a node, press Enter to rename, Escape to cancel, Delete to delete, Ctrl+Z to
   undo, Ctrl+Shift+Z to redo, and activate Copy Source, all without the mouse.
9. **Not offered (FR-015, FR-023)**: there is no way to edit or import source, export, save or change
   direction; reload the page and the diagram is gone.

## 3. Cross-checks

- Paste any copied source into the Mermaid Live Editor (or run `node scripts/lint-mermaid.mjs` on a `.mmd` file
  holding it): it must render with the same nodes, shapes, labels and connections.
- Contract details: [contracts/mermaid-output.md](contracts/mermaid-output.md),
  [contracts/operations.md](contracts/operations.md), [contracts/editor-ui.md](contracts/editor-ui.md).
- Data shapes: [data-model.md](data-model.md).
