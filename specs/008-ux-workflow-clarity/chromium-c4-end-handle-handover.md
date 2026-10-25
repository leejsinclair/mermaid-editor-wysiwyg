# Handover: Chromium failure in the C4 end-handle e2e test

Spec 008 (`specs/008-ux-workflow-clarity`), `/speckit-companion-implement` in progress.

## The problem

`e2e/end-handles.spec.ts:158`, "in a c4 diagram, a new line let go over the selected line's end handle ends at that end's
item", fails in Chromium every time. It passes in Firefox. The flowchart and sequence versions of the same test pass in
both browsers.

The test does this (VO-050, FR-011, EC-13 of spec 004-canvas-usability):

1. Builds three C4 items with one relationship between the first two (the `c4` branch of `fixture` in the same file).
2. Selects the relationship, so its end handles show (`data-testid="relationship-end-to"`).
3. Drags a new line from the third item's top handle and lets go over the selected relationship's `to` end handle.
4. Expects a second relationship that ends at the item the `to` end belongs to (`/to Circle$/`-style match, `endsAtSecond`).

What fails: after the drag there is still only one relationship (`Expected: 2, Received: 1`, line 164). The drop over
the end handle does not create the new line.

## What is known

| Check | Result |
| --- | --- |
| Run alone, `--repeat-each=3`, both browsers | Chromium fails 3 of 3; Firefox passes |
| Run at the last commit `180b6ad` (clean worktree, no spec 008 changes) | Chromium fails 2 of 2. The failure is already on `main` and was not caused by spec 008 |
| With and without the Firefox flake fix (`measured` on flowchart nodes in `FlowchartCanvas.tsx`) | Fails either way. That fix is in the flowchart canvas only and does not touch C4 |
| Full `e2e-all` run on 2026-10-24 | This is the only failure: 1242 passed, 29 skipped, 1 failed |

Not yet investigated: why the drop is lost in Chromium only.

## Where to start

- `app/rendering/c4/C4Canvas.tsx`: the end handle is rendered around line 277 (`data-testid={`relationship-end-${end}`}`).
  Find how a new line's release point is resolved to an item. The flowchart canvas does it with
  `document.elementFromPoint(...).closest(".react-flow__node")` in `nodeUnder`; check whether C4 does the same and what
  element sits on top at the release point in Chromium (the end handle itself, its hit area, or the line's SVG).
- `app/rendering/shared/canvas.css` and `app/rendering/shared/handleSize.ts`: end-handle hit size, `pointer-events`,
  and the rule that hides an item handle under a selected line's end handle (VO-040).
- Chromium and Firefox differ in hit-testing SVG and in `pointerup` targets while the pointer is captured. Check whether
  the C4 drag uses `setPointerCapture`, and whether the release is read from `event.target` instead of the point.
- Compare with the sequence canvas, where the same test passes in both browsers.

Possible causes, none verified:

1. In Chromium the element under the release point is the end handle or the line, and the code does not map it back to
   the end's item.
2. The release event's target is the captured element in Chromium, so the drop target is read wrongly.
3. The test's release point (`centreOf(end)`) falls on a part of the handle that Chromium does not hit-test, such as a
   transparent SVG fill.

A real user can do this gesture, so fix it in the code, not the test, unless point 3 turns out to be the cause.

## How to reproduce

```bash
npx playwright test e2e/end-handles.spec.ts:158 --project=chromium --reporter=line
```

The failure snapshot is written to `test-results/end-handles-in-a-c4-diagra-*-chromium/error-context.md`. Add
`--trace on` and open the trace for the pointer events.

Per project rules, the evidence runs go through `tdd_check.py run` (see `CLAUDE.md`). Direct Playwright runs are fine for
diagnosis.

## State of the wider work

- The Firefox keyboard-only flake (`firefox-flake-handover.md`) is fixed: flowchart nodes carry
  `measured: { width: NODE_WIDTH, height: NODE_HEIGHT }` in `app/rendering/flowchart/FlowchartCanvas.tsx`, so React Flow
  keeps their handle bounds when it re-adopts a changed node. The test went from 6 of 6 failing to 12 of 12 passing. Not
  committed.
- Gate record #39 is an invalid `checkpoint e2e: fail` (a focused command with a `--select` that Playwright read as one
  argument). It was left in place, because evidence files are not hand-edited. Disclose it when closing.
- This failure is what stands between the work and a green `e2e-all` checkpoint. Everything else in the earlier handover's
  "Still open" list still applies.

## Concerns to record at the end

- This failure predates spec 008. If it is fixed in this spec, record that the fix is outside the spec's task files.
- Gate record #39, described above.
- `app/importing/layout.test.ts` ("lays out 500 nodes in under 100 ms") failed once at 114 ms while e2e ran alongside
  it, and passed when run alone. Like `e2e/import-error.spec.ts:24`, it is a timing assertion that fails under load.

## Resolution (2026-10-24)

The cause was in the test's setup, not the canvas, so the fix is in the test. None of the three suspected causes applied.

- The C4 toolbox runs past the bottom of the viewport (the page is 920 px tall at 720 px). When `addRelationship` presses
  "One-way relationship", Playwright scrolls the page down 200 px to reach it.
- The fixture then calls `focus()` on the relationship. Firefox scrolls the page back to the top. Chromium does not,
  because the line is already in view.
- In Chromium, Gamma's top handle was then at about y = −40, above the viewport. `mouse.down` there hit nothing, so no
  `pointerdown` reached the handle, no drag began and nothing was dropped. The drop logic (`lineEndAt` in
  `C4Canvas.tsx`) was never reached. It is geometry-based and works once a drag starts.
- Fix: the `c4` branch of `fixture` in `e2e/end-handles.spec.ts` scrolls the page back to the top after adding the
  relationship. That puts the whole drawing on screen, where a user would press its handles. No app code changed.
- `e2e/end-handles.spec.ts` with `--repeat-each=3`: 66 of 66 pass in Chromium and Firefox.
- The fix is outside spec 008's task files, and the failure predates the spec.
- Possible follow-up, not done: the editor scrolls as a whole page because the toolbox is taller than the viewport. Any
  e2e test that presses a toolbox button low in the list and then uses canvas coordinates can hit the same trap.

### Load flakes that the green run then exposed

The next two `e2e-all` runs each failed on a different Firefox test that passes when run alone. Both were short waits
that a full parallel run can outlast. In each run, the failure also stopped the 16 timing tests from running, because
those projects depend on `firefox`.

- `e2e/return-to-start.spec.ts:27` (gate record #40): writes were held for 1.2 s, and adding the shape sometimes took
  longer, so "Saving…" was gone before the assertion ran. The hold is now 5 s, still well inside the 15 s expect
  timeout for the listing.
- `e2e/import-keyboard.spec.ts:22` (gate record #41): the Import report had to appear within 1 s. That is the FR-003
  budget of spec 005, which the single-worker timing projects measure. The test is about tab order, so it now uses the
  normal expect timeout.
- Gate record #42: `checkpoint e2e-all: pass, valid` (1259 passed, 29 skipped, timing projects included).
- Still at risk: `import-drop`, `import-preview`, `import-markdown` and `import-latest` keep `{ timeout: 1000 }` waits in
  the parallel projects and could fail the same way under load.
