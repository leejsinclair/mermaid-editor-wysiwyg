# Quickstart: validating Mermaid Editor UX and Workflow Clarity

This guide shows how to run the checks that prove the feature works. It refers to the plan's Verification Plan for what each check covers and does not repeat it.

## Prerequisites

- Node and npm, with the project's dependencies installed (`npm install`).
- Playwright browsers installed for the e2e suite.
- Python 3, for the integrated-TDD check script.

## 1. Automated checks

Run them from the repository root, in this order:

```bash
npm run typecheck
npm test
npm run test:e2e
npm run lint
```

Each command is the project's own script (see the plan's Verification commands table). The integrated-TDD gate runs these through `tdd_check.py run`, which records the result; run them that way during implementation.

## 2. Verification plan check

```bash
python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py plan
```

It must exit 0 before the plan is reported complete.

## 3. Manual checks

Three checks need people, not tests (plan, Manual verification MV-001 to MV-003):

- First-use check with five people who have no Mermaid knowledge.
- Save and copy comprehension check with ten scenarios.
- Usability review with business analysts and developers.

Record the results in `usability-findings.md`.

## 4. Hand walk-through in the browser

Start the app with `npm run dev`, then open the editor at `#/new/flowchart`.

1. On the empty canvas, confirm the hint names the three steps: add a shape, label it, connect two shapes.
2. Add a shape. Confirm it is selected and its label is open. Type a label and press Enter; confirm it is saved. Start another label edit and press Escape; confirm the previous label is kept.
3. Connect two shapes. Confirm the prompt says whether to choose the source or the destination, and how to cancel. Press Escape once: the connection cancels and the selection stays. Press Escape again: the selection clears.
4. Select a connection. Confirm the panel shows source, destination, direction, and Change endpoints.
5. Open the preview with the View group. Confirm the explanation about node positions shows, that the preview updates after an edit, and that Back to editing returns with the diagram and undo history unchanged.
6. Narrow the window to 360 px. Confirm every panel is reachable without horizontal page scrolling.

Repeat steps 1 to 6 for the sequence and C4 diagram types.

## Expected outcome

- Typecheck, unit, e2e and lint all pass in desktop Chromium, with the touch suite on the emulated Android phone.
- The plan check exits 0.
- Every manual check has a recorded result.
