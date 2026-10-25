# Tasks: Mermaid Editor UX and Workflow Clarity

**Scale note**: about 18 source files and about 10 new test files across `app/editor`, `app/rendering/shared`, `app/rendering/flowchart`, `app/text`, and the sequence and C4 canvases in Phase 9b. Watch the Escape key (one resolver, tested first), the shared files (`en.ts`, `keyboard.ts`, `reducer.ts`, `Editor.tsx`, `useDrag.ts` and `FlowchartCanvas.tsx` are owned by Foundational only), and the preview scope (`Preview.tsx` is owned by Phase 6 and covers all three diagram types, per plan.md Open Questions).

Format: `- [ ] T### [P?] [US#?] [VO-nnn | NT: reason] Description · file`

Each task carries a verification label: `[VO-nnn]` for each obligation it satisfies in the plan's Verification Plan, or `[NT: reason]` when it has no behaviour to verify. Each task writes its failing test before its implementation, under the integrated-TDD gate.

## Phase 1: Setup

Files: none. Confirms the baseline before any change.

**Wave 1 — independent:**

- [x] T001 [VO-037] Confirm the baseline is green: typecheck, unit tests and e2e run through the integrated-TDD gate before any edit · `tdd_check.py run`

## Phase 2: Foundational (blocks all stories)

Files owned: `app/editor/escape.ts`, `app/editor/escape.test.ts`, `app/editor/keyboard.ts`, `app/editor/keyboard.test.ts`, `app/rendering/shared/icons.tsx`, `app/rendering/shared/icons.test.tsx`, `app/text/en.ts`, `app/text/en.test.ts`, `app/editor/reducer.ts`, `app/editor/reducerCancel.test.ts`, `app/editor/Editor.tsx`, `app/editor/Editor.test.tsx`, `app/rendering/shared/useDrag.ts`, `app/rendering/flowchart/FlowchartCanvas.tsx`.

**Wave 1 — independent (different files):**

- [x] T002 [P] [VO-042] Write failing tests for the Escape order: label edit first, then connection, then selection, and text fields keep their own Escape · `app/editor/escape.test.ts`
- [x] T003 [P] [VO-035] Write failing tests for each icon: one shared size, `aria-hidden` when decorative, one component per contract action · `app/rendering/shared/icons.test.tsx`
- [x] T004 [P] [VO-003] Write failing reducer tests: cancel label edit keeps the previous label; cancel connection keeps the selection · `app/editor/reducerCancel.test.ts`
- [x] T005 [P] [VO-051] Write a failing test that every new string in the UI contract appears in `app/text/en.ts` · `app/text/en.test.ts`

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 — independent (different files):**

- [x] T006 [P] [US1] [VO-042] Implement the pure Escape resolver (label, connection, selection, innermost first) · `app/editor/escape.ts`
- [x] T007 [P] [VO-035] Implement the shared icon set, one inline SVG per contract action · `app/rendering/shared/icons.tsx`
- [x] T008 [P] [VO-051] Add every new string from the UI contract and the spec's messages (empty label, save wording, three steps, Back to editing, getting-started help) · `app/text/en.ts`
- [x] T009 [P] [VO-003] Implement cancel actions in the reducer, with history untouched · `app/editor/reducer.ts`

**⟶ Wait for Wave 2 to finish, then:**

**Wave 3 — tests, independent (different files):**

- [x] T010 [P] [VO-019] Write failing keyboard tests: Escape uses the resolver; keyboard add, connect and delete route through the reducer; text entry is excluded · `app/editor/keyboard.test.ts`
- [x] T012 [P] [VO-052] Write a failing test that the Editor passes the save-text map, unsaved flag and cancel target to its children · `app/editor/Editor.test.tsx`

**⟶ Wait for Wave 3 to finish, then:**

**Wave 4 — implementation, independent (different files):**

- [x] T011 [P] [VO-019] Implement keyboard routing: Escape via the resolver, and keyboard add, connect and delete actions · `app/editor/keyboard.ts`
- [x] T013 [P] [VO-052] Wire every new prop in the editor (preview toggle, save-text map, unsaved flag, cancel target) to its source, with placeholders where a story fills it later · `app/editor/Editor.tsx`

**⟶ Wait for Wave 4 to finish, then:**

**Wave 5 — dependent on T011 and T013** (one Escape press fires one listener from the start):

- [x] T014 [P] [VO-042] Remove the Escape handling from the drag hook; the resolver owns it · `app/rendering/shared/useDrag.ts`
- [x] T015 [P] [VO-042] Remove the canvas Escape handling; keep arrow nudging · `app/rendering/flowchart/FlowchartCanvas.tsx`

## Phase 3: US1 — Create a labelled, connected flowchart from a blank canvas (P1, MVP)

Files: `app/rendering/shared/EmptyHint.tsx`, `app/rendering/shared/CanvasHelp.tsx`, `app/rendering/shared/InlineLabelEditor.tsx`, `e2e/guided-first-use.spec.ts`.

### Tests

**Wave 1 — the first e2e file:**

- [ ] T016 [US1] [VO-001] [VO-002] [VO-004] [VO-025] [VO-028] [VO-041] [VO-043] Write failing e2e tests: hint names the three steps, a new node is selected with its label open, Enter saves, Escape restores, empty label shows the message, connection prompt names source or destination and the cancel key, contextual guidance is visible while a label is edited, a created connection's direction is visible on the canvas, and deleting an element while its label is edited applies no label · `e2e/guided-first-use.spec.ts`

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 — same file as T016, so it waits:**

- [ ] T017 [US1] [VO-005] [VO-046] Write failing e2e tests: the hint is hidden once the canvas has content and returns, naming the three steps, when the canvas is emptied again · `e2e/guided-first-use.spec.ts`

### Implementation

**Wave 1 — independent (different files):**

- [ ] T018 [P] [US1] [VO-001] [VO-005] [VO-046] Name the three steps in the empty-canvas hint and hide it when the canvas has content · `app/rendering/shared/EmptyHint.tsx`
- [ ] T019 [P] [US1] [VO-004] [VO-025] [VO-028] Show contextual prompts while connecting and while a label is edited; show each connection's direction on the canvas once it is created (FR-010) · `app/rendering/shared/CanvasHelp.tsx`
- [ ] T020 [P] [US1] [VO-003] [VO-041] [VO-043] Enter confirms, Escape cancels, empty label keeps the editor open with the message; a deleted element's label editor closes and applies nothing · `app/rendering/shared/InlineLabelEditor.tsx`

**⟶ Wait for Wave 1 to finish, then:**

- [ ] T021 [US1] [NT: checkpoint; the obligations named in T016 and T017 carry the behaviour] Checkpoint: first-use e2e passes; a person with no Mermaid knowledge can add, label and connect two shapes

## Phase 4: US2 — Know what is selected and what I can do with it (P2)

Files: `app/rendering/shared/PropertiesPanel.tsx`, `app/editor/selection.ts`, `app/editor/selection.test.ts`, `e2e/selection-panel.spec.ts`.

### Tests

**Wave 1 — independent (different files):**

- [x] T022 [P] [US2] [VO-006] [VO-007] [VO-008] Write failing unit tests: selection kind and action list per type (flowchart, sequence, C4); no element actions with nothing selected · `app/editor/selection.test.ts`
- [x] T023 [P] [US2] [VO-009] [VO-026] [VO-029] [VO-030] [VO-047] Write failing e2e tests: canvas and panel agree; panel names the type; a label changed inline shows in the panel; diagram-level and element-level actions are structurally separate; connection shows source, destination, direction and Change endpoints; disabled actions carry `aria-disabled` and the reason; a self-connection is allowed and reversing it is refused · `e2e/selection-panel.spec.ts`

### Implementation

**Wave 1 — independent:**

- [x] T024 [P] [US2] [VO-006] [VO-007] [VO-008] Return the action list and type name per selection and diagram type · `app/editor/selection.ts`

**⟶ Wait for Wave 1 to finish, then:**

- [ ] T025 [US2] [VO-006] [VO-007] [VO-008] [VO-009] [VO-026] [VO-029] [VO-030] [VO-047] Render the element type, relevant actions only, labelled Change endpoints, and disabled-and-announced actions; use the shared icons from `icons.tsx` for each action, with the same label as the toolbar; show getting-started help with nothing selected; reverse is disabled for a self-connection · `app/rendering/shared/PropertiesPanel.tsx`
- [ ] T026 [US2] [NT: checkpoint; the obligations named in T023 carry the behaviour] Checkpoint: every selection test in the matrix agrees across canvas and panel

## Phase 5: US3 — Find actions by intent in the toolbar (P2)

Files: `app/rendering/shared/Toolbar.tsx`, `app/rendering/shared/toolbarGroups.ts`, `app/rendering/shared/toolbarGroups.test.ts`, `app/rendering/shared/MoreActions.tsx`, `e2e/toolbar-groups.spec.ts`.

### Tests

**Wave 1 — independent (different files):**

- [x] T027 [P] [US3] [VO-010] Write failing unit tests: four groups in order; every existing action appears in exactly one group or in the overflow menu · `app/rendering/shared/toolbarGroups.test.ts`
- [x] T028 [P] [US3] [VO-011] [VO-012] [VO-015] [VO-022] [VO-038] Write failing e2e tests: group headings; overflow action still works; keyboard focus visible; the node-position explanation sits beside Copy Source and Save file; an action whose meaning is not obvious has a visible text label; text labels where the toolbar has room, an icon alone only where it has none · `e2e/toolbar-groups.spec.ts`

### Implementation

**Wave 1 — independent (different files):**

- [x] T029 [P] [US3] [VO-010] Define the grouping as data: History, Diagram editing, Export and sharing, View · `app/rendering/shared/toolbarGroups.ts`
- [x] T030 [P] [US3] [VO-011] Move less frequent actions into the overflow menu under its label · `app/rendering/shared/MoreActions.tsx`

**⟶ Wait for Wave 1 to finish, then:**

- [x] T031 [US3] [VO-010] [VO-011] [VO-012] [VO-015] [VO-022] [VO-038] Render the grouped toolbar with the shared icons and text labels, and place the node-position explanation beside Copy Source and Save file (FR-023) · `app/rendering/shared/Toolbar.tsx`
- [x] T032 [US3] [NT: checkpoint; the obligations named in T028 carry the behaviour] Checkpoint: toolbar grouping e2e passes at wide and 360 px widths

## Phase 6: US4 — Preview the Mermaid output before exporting (P2)

Files: `app/rendering/flowchart/Preview.tsx`, `e2e/preview-round-trip.spec.ts`, `e2e/per-type-preview.spec.ts`. This phase owns `Preview.tsx` for all three diagram types. The generators already exist (`app/generation/sequence.ts`, `app/generation/c4.ts`), so the preview reuses them.

### Tests

**Wave 1 — independent (different files):**

- [x] T033 [P] [US4] [VO-013] [VO-014] [VO-031] [VO-032] [VO-045] [VO-048] Write failing e2e tests: preview matches source from the current diagram; preview refreshes after an edit made while it is open; Back to editing keeps diagram, layout and undo history; an invalid diagram shows the problem; a label with special characters is escaped the same way in the preview and the copied source; the generated source can be inspected and copied · `e2e/preview-round-trip.spec.ts`
- [x] T050 [P] [US4] [VO-013] [VO-014] Write failing e2e tests for sequence and C4: the preview matches the source generated from the current diagram and refreshes after an edit; Back to editing keeps the diagram, layout and undo history; the explanation shows where the preview opens and beside Copy Source and Save file · `e2e/per-type-preview.spec.ts`

### Implementation

**Wave 1 — flowchart preview:**

- [x] T034 [US4] [VO-013] [VO-014] [VO-015] [VO-031] [VO-032] [VO-045] [VO-048] Add the labelled Back to editing control and the explanation text; show an error state, not a blank area, for an invalid diagram; let the user inspect and copy the generated source · `app/rendering/flowchart/Preview.tsx`

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 — same file as T034, so it waits:**

- [ ] T055 [US4] [VO-013] [VO-014] [VO-015] [VO-045] Generalise the preview to show the source generated for the current sequence or C4 diagram, rendered as Mermaid draws it, with Back to editing and the explanation · `app/rendering/flowchart/Preview.tsx`

**⟶ Wait for Wave 2 to finish, then:**

- [ ] T035 [US4] [NT: checkpoint; the obligations named in T033 and T050 carry the behaviour] Checkpoint: preview round-trip e2e passes for flowchart, sequence and C4

## Phase 7: US5 — Know whether my work is saved and whether the diagram is valid (P2)

Files: `app/editor/saveStatus.ts`, `app/editor/saveStatus.test.ts`, `app/editor/leavePage.ts`, `app/editor/leavePage.test.ts`, `app/rendering/shared/StatusBar.tsx`, `e2e/storage-wording.spec.ts`.

### Tests

**Wave 1 — independent (different files):**

- [x] T036 [P] [US5] [VO-016] [VO-034] [VO-049] Write failing unit tests: unsaved derived from a commit with no completed write; `saved` only after the newest revision is written; unsaved feeds `unsafeToLeave`; the word saved never appears for a change that was not persisted on reload · `app/editor/saveStatus.test.ts` and `app/editor/leavePage.test.ts`
- [x] T037 [P] [US5] [VO-017] [VO-018] [VO-033] [VO-044] Write failing e2e tests: a failed save shows a visible not-saved message; "Save file" is used only for the file action; validity shown separately from save status; a save that fails while the preview is open leaves the status as not saved on return · `e2e/storage-wording.spec.ts`

### Implementation

**Wave 1 — the unsaved state the rest depends on:**

- [x] T038 [US5] [VO-016] [VO-034] [VO-049] Derive the unsaved state and keep `saved` tied to the newest write · `app/editor/saveStatus.ts`

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 — independent of each other, both use T038:**

- [x] T039 [P] [US5] [VO-016] Feed unsaved changes into the leave-page guard · `app/editor/leavePage.ts`
- [x] T040 [P] [US5] [VO-016] [VO-017] [VO-018] [VO-033] [VO-044] Show browser-saved, editable-file and exported-source wording separately, with validity as its own status · `app/rendering/shared/StatusBar.tsx`
- [x] T041 [US5] [NT: checkpoint; the obligations named in T036 and T037 carry the behaviour] Checkpoint: save status tests pass; no state says "saved" for an unpersisted change, including reload

## Phase 8: US6 — Complete essential edits without dragging, at any supported width (P2)

Files: `app/rendering/shared/Workspace.tsx`, `e2e/keyboard-only.spec.ts`, `e2e/narrow-layout.spec.ts`.

### Tests

**Wave 1 — independent (different files):**

- [x] T042 [US6] [VO-020] [VO-050] Write failing e2e tests: add, label, select, move, connect, delete, undo and redo with the keyboard only; no horizontal page scroll and every panel reachable at 360 px; a selected element's panel stays reachable at narrow width · `e2e/keyboard-only.spec.ts` and `e2e/narrow-layout.spec.ts`

### Implementation

**Wave 1 — independent:**

- [x] T043 [US6] [VO-020] [VO-050] Keep the properties panel reachable at narrow width with a selected element; tools disclosure works without dragging · `app/rendering/shared/Workspace.tsx`
- [x] T044 [US6] [NT: checkpoint; the obligations named in T042 carry the behaviour] Checkpoint: keyboard-only e2e passes at the narrowest supported width

## Phase 9: US7 — Recognise repeated actions by a consistent icon and label (P3)

Files: `app/rendering/shared/Toolbox.tsx`, `e2e/icon-consistency.spec.ts`, `e2e/accessible-names.spec.ts`.

### Tests

**Wave 1 — independent (different files):**

- [x] T045 [US7] [VO-021] [VO-023] [VO-024] [VO-027] [VO-036] [VO-039] [VO-040] Write failing e2e tests: each repeated action shows the same icon and label in toolbar, panel and toolbox; icon-only controls have a name, a visible focus, and their disabled, focused, expanded and pressed states exposed; icons do not cover the diagram, the selection, errors or the save status; unselected, hovered, focused, selected, disabled and active states differ without colour alone; the new states are shown in both Blueprint Studio and Light; icons and labels stay understandable at 360 px and at 200% zoom; the toolbox keeps its shape illustrations · `e2e/icon-consistency.spec.ts` and `e2e/accessible-names.spec.ts`

### Implementation

**Wave 1 — independent:**

- [x] T046 [US7] [VO-021] [VO-023] [VO-024] [VO-027] [VO-036] [VO-039] [VO-040] Use the shared icons and keep the shape illustrations and connection previews · `app/rendering/shared/Toolbox.tsx`
- [x] T047 [US7] [NT: checkpoint; the obligations named in T045 carry the behaviour] Checkpoint: icon consistency e2e passes in Blueprint Studio and Light

## Phase 9b: Sequence and C4 editors (per type, Clarifications 2026-10-24)

Files: `app/rendering/sequence/SequenceCanvas.tsx`, `app/rendering/c4/C4Canvas.tsx`, `app/text/typeWording.ts`, `app/text/typeWording.test.ts`, `e2e/per-type-first-use.spec.ts`, `e2e/per-type-selection.spec.ts`. The preview for these types is in Phase 6 (T050, T055).

The spec settles that all three diagram types get these behaviours, each with its own element names and connection rules. These tasks cover the sequence and C4 editors, which the flowchart-only tasks above do not reach.

### Tests

**Wave 1 — independent (different files):**

- [x] T048 [P] [US1] [VO-001] [VO-002] [VO-003] [VO-004] [VO-041] Write failing e2e tests for sequence and C4: the empty-canvas hint names the three steps; a new element is selected with its label open; Enter saves and Escape restores; the connection prompt names source or destination and the cancel key · `e2e/per-type-first-use.spec.ts`
- [x] T049 [P] [US2] [VO-006] [VO-008] [VO-009] Write failing e2e tests for sequence and C4: selection names the element type and shows only relevant actions; disabled actions carry `aria-disabled` and the reason; a selected connection offers Change endpoints · `e2e/per-type-selection.spec.ts`
- [x] T051 [P] [US1] [VO-001] Write failing unit tests that each type's hint and connection prompt use that type's own element names, and that no flowchart wording appears for sequence or C4 · `app/text/typeWording.test.ts`

### Implementation

**Wave 2 — pure wording first:**

- [x] T052 [US1] [VO-001] Add pure per-type wording for the hint and connection prompt, keyed by diagram type · `app/text/typeWording.ts`

**⟶ Wait for Wave 2 to finish, then:**

**Wave 3 — independent (different files), both use T052:**

- [x] T053 [P] [US1] [US2] [VO-002] [VO-003] [VO-004] [VO-008] Sequence canvas: first-use flow (selected and labelled new element, Enter, Escape, empty-label message), connection prompt, selection reported to the panel, Change endpoints for a selected connection · `app/rendering/sequence/SequenceCanvas.tsx`
- [x] T054 [P] [US1] [US2] [VO-002] [VO-003] [VO-004] [VO-008] C4 canvas: the same first-use flow, connection prompt, selection and Change endpoints as T053, with C4 element names · `app/rendering/c4/C4Canvas.tsx`

**⟶ Wait for Wave 3 to finish, then:**

- [x] T056 [US1] [US2] [NT: checkpoint; the obligations named in T048 and T049 carry the behaviour] Checkpoint: per-type first-use and selection e2e pass for sequence and C4
- [x] T057 [NT: checkpoint; the obligations named in T048, T049, T050 and T055 carry the behaviour] Checkpoint: per-type e2e (first-use, selection, preview) passes in Chromium and Firefox for sequence and C4

## Phase 10: Polish

Files: `specs/008-ux-workflow-clarity/usability-findings.md`.

**Wave 1 — validation:**

- [ ] T058 [VO-037] Run every suite through the integrated-TDD gate: typecheck, unit tests, Playwright e2e in Chromium, and in the mobile-android project for the touch suite that Playwright already runs; lint. Firefox and Safari on iOS are not supported browsers under the constitution (3.0.0), so they are not covered here · `tdd_check.py run`

**⟶ Wait for Wave 1 to finish, then:**

**Wave 2 — review record:**

- [ ] T059 [NT: review of exempt requirements FR-024 and FR-040 and of the verification record; no behaviour of its own] Check each acceptance scenario and SC-001 to SC-010 against a test; record any gap; check FR-024 (no claim that exact layout is kept) and FR-040 (no icon library dependency) by review, and record the review · `specs/008-ux-workflow-clarity/usability-findings.md`

**⟶ Wait for Wave 2 to finish, then:**

**Wave 3 — user checks, same file as T059, so it waits:**

- [ ] T060 [NT: user checks by the Business Analyst, recorded in usability-findings.md; not automated] The Business Analyst runs the user checks for SC-001 to SC-003 and SC-008 with real people, before the feature is marked complete. Record each result, pass or fail, in usability-findings.md. Until a result is recorded, the check is not counted as passed · `specs/008-ux-workflow-clarity/usability-findings.md`

## Dependencies & Execution Order

- Setup → Foundational → stories → Polish.
- Phase 2 (Foundational): Wave 1 tests, icons, strings and reducer tests → Wave 2 Escape resolver, icon set, strings and cancel reducer → Wave 3 keyboard and Editor tests → Wave 4 keyboard routing and Editor wiring → Wave 5 remove the drag and canvas Escape listeners.
- US1 through US7 depend only on Foundational, and each story's own waves run in its listed order. Stories can run in parallel because each owns its files.
- Phase 6 (US4) owns `Preview.tsx` for all three types: Wave 1 flowchart preview → Wave 2 sequence and C4 preview.
- Phase 9b (sequence and C4) depends on Foundational, US1, US2 and US4, because it reuses their hint, prompt, selection and preview. Its waves run in order: tests → wording → canvases → checkpoints.
- Phase 10 (Polish) waits for every story: gate → review record → user checks.

## Verification labels

- Each task carries `[VO-nnn]` for every obligation it satisfies, or `[NT: reason]` with a stated reason when it has no behaviour to verify.
- For each obligation, the first task in this file to name it is its test task, and the tasks after it are its behaviour tasks. A task that names an obligation for the first time names no obligation named by an earlier task, so the test is never mixed into behaviour work.
- Every obligation in the plan's Verification Plan is named by at least two tasks.
- Tests are written one increment at a time, each just before its behaviour task, within the same story phase.
- Checked by `tdd_check.py tasks`. Obligations VO-001 to VO-050 are in plan.md; exempt requirements FR-024, FR-038 and FR-040 have no task of their own.
