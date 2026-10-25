# Implementation Plan: Mermaid Editor UX and Workflow Clarity

**Spec**: [spec.md](spec.md) | **Size**: oversized

## Summary

Make the existing editor clearer for business analysts and developers, without a redesign or new dependency. The work covers guided add-label-connect on an empty canvas, a single selection shared by canvas and properties panel, a toolbar grouped by intent, a read-only Mermaid preview with a "Back to editing" control, separate save and validity status, keyboard-only editing, and one inline-SVG icon set. The approach extends the current pure-TypeScript layers (`app/editor`) and the shared rendering components (`app/rendering/shared`) rather than adding a second editor.

**Scale note**: this touches about 18 source files across `app/editor`, `app/rendering/shared`, `app/rendering/flowchart`, `app/text`, `app/rendering/sequence` and `app/rendering/c4`, with 60 tasks (Phase 9b in tasks.md adds the sequence and C4 editors). Watch for three things: the Escape key (three window listeners fire on one press), the preview scope across all three diagram types, and the TDD gate on each icon and toolbar change, which have many states to test.

## Constitution Check

| Principle | Assessment |
| --- | --- |
| I. Visual model is the source of truth | PASS. The preview and the copied source are generated from the current model. No text editing is added. |
| II. Layered architecture | PASS. New logic (Escape resolution, toolbar grouping, icon names, save-state wording) goes into pure `.ts` modules with no DOM access. Rendering stays in `app/rendering`. |
| III. Test-first | PASS. Each task writes its failing test first under `tdd_check.py run`. |
| IV. Invalid operations never corrupt | PASS. Cancelling a connection or label edit leaves the model unchanged. Empty labels are rejected before commit. |
| V. Undoable, honest feedback | PASS. Save status keeps "saved" only after a successful write. Preview round-trip does not touch history. Disabled, announced controls for conditional actions are allowed by the 1.5.0 amendment. |
| Technology and scope | PASS. Icons are inline SVG in the codebase (FR-040). No new dependency. Browsers are desktop Chromium and Chrome on Android, under the 3.0.0 amendment that drops Firefox. |

No violations, so there is no Complexity Tracking table.

**Post-design re-check** (after data-model, contracts and the Verification Plan): unchanged. Every principle still PASSes, and the Principle V row reflects the 1.5.0 amendment.

## Project Structure

```text
app/
├── editor/
│   ├── escape.ts              pure Escape resolver: label edit, then connection, then selection
│   ├── escape.test.ts         new
│   ├── keyboard.ts            keyboard add, connect and delete routes; Escape via escape.ts
│   ├── keyboard.test.ts       new
│   ├── saveStatus.ts          unsaved-changes state and wording inputs
│   ├── leavePage.ts           unsaved state feeds unsafeToLeave
│   ├── reducer.ts             connection-cancel and label-cancel actions
│   ├── selection.ts           element kind and actions per diagram type
│   └── Editor.tsx             wires preview toggle, status, Back to editing
├── rendering/
│   ├── shared/
│   │   ├── icons.tsx          new: one shared inline-SVG icon set
│   │   ├── Toolbar.tsx        grouped History, Diagram editing, Export and sharing, View
│   │   ├── PropertiesPanel.tsx  disabled-and-announced actions, Change endpoints
│   │   ├── StatusBar.tsx      save and validity status shown separately
│   │   ├── EmptyHint.tsx      three named steps, no dismiss control
│   │   ├── CanvasHelp.tsx     contextual prompts for connect and label edit
│   │   ├── InlineLabelEditor.tsx  Enter, Escape, empty-label message
│   │   └── MoreActions.tsx    secondary menu for less frequent actions
│   ├── flowchart/
│   │   ├── FlowchartCanvas.tsx  Escape hook removed; arrow nudge kept
│   │   └── Preview.tsx        Back to editing, explanation text
│   ├── sequence/SequenceCanvas.tsx  Phase 9b: first use, selection, Change endpoints
│   ├── c4/C4Canvas.tsx        Phase 9b: same as sequence, with C4 element names
│   └── shared/useDrag.ts      Escape defers to the reducer
├── text/en.ts                 all new copy, including the three steps
└── text/typeWording.ts        per-type hint and connection prompt wording (Phase 9b)
```

**Structure Decision**: keep logic in `app/editor` pure modules and rendering in `app/rendering`. Add one new file, `icons.tsx`, because FR-040 needs a single shared icon set.

## Key Decisions

- **Two-step Escape**: a single resolver in `escape.ts` decides what Escape does. It cancels the innermost active operation (label edit, then connection), and only when nothing is active does it clear the selection. Canvas and drag listeners stop handling Escape themselves. (See [research.md](research.md) R1.)
- **Keyboard routes**: add, connect and delete become keyboard actions dispatched through the reducer, not new canvas code. Arrow nudging and F2 stay as they are.
- **Disabled, not hidden**: an action that does not apply to the current selection is hidden from the element list (FR-014), and an action whose condition fails is disabled with `aria-disabled` and an announced reason (FR-016). Both rules are stated in the contract.
- **One icon set**: `icons.tsx` exports named inline-SVG components. Toolbar, panel and toolbox import from it, so the same action gets the same icon everywhere.
- **Unsaved state**: unsaved is derived from the model and the last completed write, not stored as a save status value. It feeds `unsafeToLeave`. See [data-model.md](data-model.md).
- **Undefined terms**: "concise guidance" and "getting-started help" are the same three-step text (add, label, connect), at most three short lines. "Narrowest supported width" is 360 px (FR-034). The keyboard step size is one grid step per arrow press, the step `NUDGE_STEP` that `app/rendering/flowchart/FlowchartCanvas.tsx` already uses.

## Open Questions

This needs the Business Analyst before the matching tasks start. The plan proceeds with the stated default.

1. **Toolbar overflow.** FR-042 allows icon-only buttons only where text does not fit. Default: text labels in the toolbar at 360 px, and the overflow menu holds the rest.

## Phase 0 and Phase 1 Artifacts

- [research.md](research.md): decisions behind the Escape order, the icon set, the disabled rule and the preview scope.
- [data-model.md](data-model.md): the new state fields and their transitions.
- [contracts/ui-contract.md](contracts/ui-contract.md): the verbatim labels, groups and identifiers that tests pin.
- [quickstart.md](quickstart.md): how to run the verification commands and check the feature by hand.

## Verification Plan

Every requirement and acceptance scenario is verified by an obligation or an exemption. Edge cases (EC-01 to EC-10) have their own obligations. Verification commands come from `package.json`. Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).

### Verification commands

| ID | Command | Scope | Source |
| --- | --- | --- | --- |
| unit | `npx vitest run {select}` | focused | package.json script `test` |
| unit-all | `npm test` | broad | package.json script `test` |
| e2e | `npx playwright test {select}` | focused | package.json script `test:e2e` |
| e2e-all | `npm run test:e2e` | broad | package.json script `test:e2e` |
| typecheck | `npm run typecheck` | broad | package.json script `typecheck` |
| lint | `npm run lint` | broad | package.json script `lint` |

### Verification obligations

| ID | Requirements | Scenario | Expected outcome | Level | Origin |
| --- | --- | --- | --- | --- | --- |
| VO-001 | FR-001, US1-AS1 | US1-AS1 | On an empty canvas, concise guidance covering add, label and connect is visible and does not cover the canvas | end-to-end | planned |
| VO-002 | FR-004, US1-AS2 | US1-AS2 | After a shape is added it is selected and its label is open for inline editing | end-to-end | planned |
| VO-003 | FR-005, US1-AS3 | US1-AS3 | Enter saves the typed label; Escape restores the previous label | end-to-end | planned |
| VO-004 | FR-007, FR-009, US1-AS4 | US1-AS4 | While a connection is being chosen, a visible text prompt names source or destination and the key that cancels | end-to-end | planned |
| VO-005 | FR-002, US1-AS5 | US1-AS5 | With content on the canvas the hint is not shown; once the canvas is emptied again it returns | end-to-end | planned |
| VO-006 | FR-014, US2-AS1 | US2-AS1 | With nothing selected the panel shows getting-started help and no element-level editing controls | end-to-end | planned |
| VO-007 | FR-013, FR-014, US2-AS2 | US2-AS2 | A selected node's panel shows the node type and only rename, create connection and delete | end-to-end | planned |
| VO-008 | FR-010, FR-014, US2-AS3 | US2-AS3 | A selected connection's panel shows source, destination, direction, and actions to change endpoints, reverse direction and delete | end-to-end | planned |
| VO-009 | FR-016, US2-AS4 | US2-AS4 | An action whose condition is not met is disabled and announced as unavailable | end-to-end | planned |
| VO-010 | FR-017, FR-019, US3-AS1 | US3-AS1 | The toolbar groups Undo and Redo under History, Zoom in, Zoom out, Fit to view and Preview as Mermaid draws it under View, and Copy Source, Copy for Markdown and Save file under Export and sharing | end-to-end | planned |
| VO-011 | FR-018, US3-AS2 | US3-AS2 | A rarely used action sits in the secondary menu and works from there | end-to-end | planned |
| VO-012 | FR-033, US3-AS3 | US3-AS3 | A toolbar action reached by keyboard can be used and shows visible focus | end-to-end | planned |
| VO-013 | FR-020, US4-AS1 | US4-AS1 | The preview shows the Mermaid output generated from the current diagram, rendered as Mermaid draws it | end-to-end | planned |
| VO-014 | FR-022, FR-037, US4-AS2 | US4-AS2 | Returning from the preview leaves the diagram, its layout and its undo history unchanged, through a control labelled Back to editing | end-to-end | planned |
| VO-015 | FR-023, US4-AS3 | US4-AS3 | The explanation that node positions may not be kept in Mermaid output is shown where the preview opens and beside Copy Source and Save file | end-to-end | planned |
| VO-016 | FR-028, US5-AS1 | US5-AS1 | With unsaved changes the header says the changes are not saved | end-to-end | planned |
| VO-017 | FR-029, US5-AS2 | US5-AS2 | A failed save shows a visible message that the diagram was not saved | end-to-end | planned |
| VO-018 | FR-031, US5-AS3 | US5-AS3 | An invalid diagram shows validity as a status separate from the save status | end-to-end | planned |
| VO-019 | FR-032, US6-AS1 | US6-AS1 | A selected node moves with the keyboard and keeps its new position | end-to-end | planned |
| VO-020 | FR-034, US6-AS2 | US6-AS2 | At the narrowest supported width every important action in each panel is reachable without horizontal page scrolling | end-to-end | planned |
| VO-021 | FR-039, US7-AS1 | US7-AS1 | An action shown in more than one place has the same icon and label in each place | end-to-end | planned |
| VO-022 | FR-041, US7-AS2 | US7-AS2 | An action whose meaning is not obvious shows a visible text label | end-to-end | planned |
| VO-023 | FR-033, FR-043, US7-AS3 | US7-AS3 | An icon-only control announces its accessible name and shows visible focus, and its tooltip is not its only name | end-to-end | planned |
| VO-024 | FR-049, US7-AS4 | US7-AS4 | With icons on screen, no icon covers the diagram, the selection, an error or the save status | end-to-end | planned |
| VO-025 | FR-003 | Editing an inline label | While an inline label is being edited, contextual guidance is visible | end-to-end | planned |
| VO-026 | FR-006 | Label changed inline, panel open | A label changed inline is shown in the properties panel | end-to-end | planned |
| VO-027 | FR-008, FR-011, FR-044, FR-046 | Each interactive state on canvas and toolbar | Unselected, hovered, focused, selected and active states differ from one another without colour alone, and Delete is identified by its text label and icon | end-to-end | planned |
| VO-028 | FR-010 | Connection created between two shapes | After a connection is created its direction is visible on the canvas | end-to-end | planned |
| VO-029 | FR-012, FR-013 | Element selected on canvas, panel open | The canvas and the properties panel show the same selection, and the panel names the selected element type | end-to-end | planned |
| VO-030 | FR-015 | Toolbar and properties panel side by side | Diagram-level actions are in the toolbar and element-level actions are in the properties panel, structurally separate | end-to-end | planned |
| VO-031 | FR-021 | Preview open while the diagram is edited | With the preview open, an edit made in the editor is shown in the preview | end-to-end | planned |
| VO-032 | FR-025 | Copy Source used on a diagram | Copy Source copies the generated Mermaid source, and the user can inspect that source | end-to-end | planned |
| VO-033 | FR-026, FR-027 | Save and export wording on the controls | Saved in this browser, saved as an editable file and exported Mermaid source each have a distinct phrase; "Save file" names only the file action and "Copy" names only the clipboard | end-to-end | planned |
| VO-034 | FR-030 | Save operation in progress, then complete | The word "saved" appears only after the save operation has succeeded | end-to-end | planned |
| VO-035 | FR-033, FR-047 | Interactive controls read by assistive technology | Interactive controls have accessible names and contrast meets WCAG 2.2 AA; decorative icons are hidden from assistive technology, and toggled, disabled, expanded and selected states are exposed | end-to-end | planned |
| VO-036 | FR-035 | New states in Blueprint Studio and Light | New states are shown in both the Blueprint Studio and Light appearances | end-to-end | planned |
| VO-037 | FR-036, FR-050 | Existing functions used after the change | Existing diagram types, shapes, connections, import, export, undo, redo, persistence, shortcuts and theme work as before, and icon changes alter only how an action looks | end-to-end | planned |
| VO-038 | FR-042 | Toolbar at wide and narrow widths | Undo, Redo, Zoom in, Zoom out and Fit to view show their text label wherever the toolbar has room; an icon alone, with an accessible name and tooltip, appears only where it has no room | end-to-end | planned |
| VO-039 | FR-045 | Toolbox shown | The toolbox keeps its shape illustrations and connection previews | end-to-end | planned |
| VO-040 | FR-048 | Toolbar icons at 360 px and 200% zoom | Icons and their labels remain understandable at 360 px width and at 200% browser zoom | end-to-end | planned |
| VO-041 | FR-005 | EC-01 | Confirming an empty label keeps the editor open with a message that a label cannot be empty, and the node keeps its previous label | end-to-end | planned |
| VO-042 | FR-005, FR-009 | EC-02 | Escape cancels only the innermost active operation: a label edit first, then a connection, then the selection | end-to-end | planned |
| VO-043 | FR-005 | EC-03 | When the element is deleted during label editing, the label editor closes and no label is applied | end-to-end | planned |
| VO-044 | FR-029, FR-030 | EC-04 | A save that fails while the preview is open leaves the save status as not saved when the user returns to editing | end-to-end | planned |
| VO-045 | FR-020 | EC-05 | An invalid diagram opened in the preview shows the validation problem, not a blank area | end-to-end | planned |
| VO-046 | FR-002 | EC-06 | Emptying the canvas again shows the hint naming the three steps | end-to-end | planned |
| VO-047 | FR-036 | EC-07 | A self-connection is allowed, and reversing a self-connection is refused | end-to-end | planned |
| VO-048 | FR-020, FR-025 | EC-08 | A label with special characters is escaped the same way in the preview and in the copied source | end-to-end | planned |
| VO-049 | FR-028, FR-030 | EC-09 | After a reload with unsaved changes the status never says saved for changes that were not persisted | end-to-end | planned |
| VO-050 | FR-034 | EC-10 | With a selected element at narrow width the properties panel stays reachable | end-to-end | planned |
| VO-051 | FR-005, FR-014, FR-017, FR-019, FR-022, FR-027 | UI contract strings | Every label and message the UI contract pins verbatim is a value in the English catalogue | unit | planned |
| VO-052 | FR-005, FR-009, FR-026, FR-028 | Editor passes state to its children | The editor hands the save text and the unsaved flag to the status display, and the cancel target to the canvas | unit | planned |

### Verification exemptions

| Requirement | Reason | Alternative verification |
| --- | --- | --- |
| FR-024 | A negative claim: the explanation must not say that exact layout is kept. A test cannot show that a claim is absent, so the wording is checked as text | Review of the explanation text in `app/text/en.ts` before the feature is marked complete |
| FR-038 | unchanged by construction: the change gives no way to vary it | Review of the diff: no file under `app/generation` changes |
| FR-040 | A property of the dependency manifest, not of behaviour: no icon library is added | Review of the `package.json` and lock-file diff before the feature is marked complete |

### Manual verification

| ID | Covers | Steps | Expected result | Why not automated |
| --- | --- | --- | --- | --- |
| MV-001 | SC-001 | Give five people with no Mermaid knowledge a blank editor and no instructions. Ask each to add, label and connect two shapes, and time them | At least 4 of 5 complete it within 3 minutes without outside help | Needs real people; a test cannot measure a person's understanding |
| MV-002 | SC-003 | Ask participants ten scenarios about whether their work is saved, and whether they are copying source or saving a file. Record each answer | Correct in at least 9 of 10 cases | Needs participants' own answers |
| MV-003 | SC-008 | Run a realistic task check with business analysts and developers. Record the findings in usability-findings.md | Findings documented before the feature is marked complete | Needs people and their judgement |

### Behaviour checklist

Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).
