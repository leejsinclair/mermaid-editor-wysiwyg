# Handover: Firefox flake in the keyboard-only e2e test

Spec 008 (`specs/008-ux-workflow-clarity`), `/speckit-companion-implement` in progress.

## The problem

`e2e/keyboard-only.spec.ts:65`, "a flowchart is built and edited with the keyboard alone", fails intermittently in Firefox only. Chromium passes. About 1 run in 3 fails in Firefresolveox.

The test does this:

1. Add three shapes from the toolbox and press Enter on the label editor after each.
2. Select the first shape and nudge it with the arrow keys.
3. Press Connect… in the properties panel and complete the connection.
4. Expect a `.react-flow__edge` on the canvas.

What fails: the model always holds the connection (`n1 --> n2`), but the canvas sometimes draws no `.react-flow__edge`. The test then times out waiting for the edge.

## Why it appeared

US1 made a new flowchart shape open its label editor straight away (FR for "new node selected with its label open"). The change is `addAndLabel` in `app/editor/Editor.tsx`. It captures `diagram.nextId`, dispatches the commit and `select`, then runs `window.setTimeout(() => dispatch({ type: "startInlineEdit" }), 0)`. It is used for the toolbox-button add and the canvas drop add.

With auto-open disabled, the keyboard-only test passed 3 out of 3 runs. So the trigger is the auto-opened label editor, not the connection code.

## What has been tried

| Attempt | Result |
| --- | --- |
| Open the editor synchronously inside the drop handler | Broke Firefox drag-connect tests: Firefox drops the next pointer press if focus moves while a toolbox drag is still ending. |
| Open the editor one tick later with `setTimeout(…, 0)` (current code) | Fixed the drag-connect failures. The keyboard-only flake remains. |
| Toolbar layout note capped at `maxWidth: 340`, kept inside the Export group | Fixed a separate Firefox failure (a line-release test) caused by a 3-row toolbar pushing the toolbox down. Not related to this flake. |
| Disable auto-open entirely (experiment) | Keyboard-only test passes 3/3. Confirms the editor opening is the trigger. `Editor.tsx` was restored afterwards. |
| Check that handles always render | Ruled out. Handles are present. |
| Check node size | Ruled out. Node size is fixed. |
| Inspect the model | Ruled out. The connection is always in the model. |

All temporary debug specs (`e2e/zz-debug.spec.ts`) are deleted. `Editor.tsx` has no `console.log`.

## Where the investigation stopped

I was reading the edge and node derivation in `app/rendering/flowchart/FlowchartCanvas.tsx` (about lines 205–300):

- The `edges` `useMemo` builds each edge with `stableFor(edgeCache, id, [connection, name, selected, edit, sides.source, sides.target], …)`.
- `inlineEdit` is among the memo's inputs, and so is `coveredSides`.
- `nodes` uses `stableFor` and `keepOnly` caches (`app/rendering/shared/stable.ts`).

Working hypothesis, not yet verified: when the label editor closes, the node and edge inputs change, a cached edge object or its handle sides become stale, or React Flow has not re-measured the node, so it renders no edge. Firefox timing makes this intermittent.

## Options for the next session

1. Make `edges` and `nodes` insensitive to `inlineEdit` for node edits, so closing the editor does not change the edge inputs. Check `coveredSides` and the `stableFor` cache keys for the same dependency.
2. Check whether React Flow needs `updateNodeInternals` after a node's content changes while the editor is open.
3. Adapt the test so it waits for the editor to close and for the node to settle before pressing Connect… (`settleNewShape` in `e2e/support/flowchart.ts` does this for drop-based tests). If this is chosen, record the residual risk as a concern, because a person using the keyboard could hit the same state.

Option 1 or 2 is preferable, since a real user can reach the same state.

## How to reproduce

```bash
npx playwright test e2e/keyboard-only.spec.ts -g "flowchart is built and edited" --project=firefox --repeat-each=6
```

Per project rules, the evidence runs go through `tdd_check.py run` (see `CLAUDE.md`). Direct Playwright runs are fine for diagnosis.

## State of the wider work

Done and closed: T001–T015 (setup and Foundational), T027–T032 (US3 toolbar), T036–T040 (US5 save status).

Code written, no gate record yet: T016–T021 (US1). `e2e/guided-first-use.spec.ts` exists and passes in both browsers. There is no failing-first record for it, so disclose that as a concern when closing.

Still open:

- T041 (US5 checkpoint).
- A green full `e2e-all` checkpoint through the gate. The last full run failed about 56 tests across both browsers; since then most were fixed by updating tests and helpers, and this flake is the one known remainder.
- Phase 4 US2 (properties panel), Phase 6 US4 (Preview), Phase 8 US6, Phase 9 US7, Phase 9b (Sequence and C4 canvases, by worker), Phase 10.
- T060 is the Business Analyst's own checks; only the user can do it.

## Concerns to record at the end

- Pre-existing flake: `e2e/import-error.spec.ts:24` (1-second timing assertion, fails under load). It also made the baseline e2e run record `fail`.
- This Firefox flake, if it is mitigated in the test rather than fixed in code.
- `vitest.config.ts` include widened to `app/**/*.test.{ts,tsx}`, outside the task files.
- T014 and T015 deviation: the Escape listeners in `useDrag.ts` and `FlowchartCanvas.tsx` were kept, made capture-phase, and call `preventDefault()` on an in-flight gesture. `keyboard.ts` ignores an already-prevented Escape. Existing tests need Escape to cancel drags.
- The toolbar's "Diagram editing" group renders no buttons, because those actions live in the properties panel.
- `appearance.blueprintLabel = "Blueprint"` sits beside `appearance.blueprint = "Blueprint Studio"`; the user never answered which to keep.
- `saveStatus.saved` stays the bare "Saved" because existing e2e tests assert it exactly.
- No new keyboard keys for add and connect; the toolbox and panel buttons already dispatch through the reducer.
- Prettier already flags `Toolbar.tsx` and `Toolbar.orig` (pre-existing).
