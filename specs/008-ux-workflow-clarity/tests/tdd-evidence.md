# TDD Evidence: 008-ux-workflow-clarity

<!-- Written by tdd_check.py. Do not edit by hand: use the script's subcommands. -->

## Summary

_Generated from the tables below on 2026-10-25T20:57:57Z._

| Obligation | Requirements | Status | Tests | Latest result |
|------------|--------------|--------|-------|---------------|
| VO-001 | FR-001, US1-AS1 | verified | e2e/guided-first-use.spec.ts, app/text/typeWording.test.ts, e2e/per-type-first-use\.spec, app/text | pass (#98) |
| VO-002 | FR-004, US1-AS2 | verified | e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec, e2e/(per-type-first-use per-type-selection)\.spec, e2e/(touch/)?(c4-move-to c4-dynamic-reorder c4-notices c4-toolbox c4-edit-fields c4-delete c4-kind-picker accessible-names canvas-wcag c4-title controls end-handles drop-targets empty-state grid-alignment hover grid-hit handle-size connection-style keyboard-only labels-special lines-unchanged canvas-source-agree grid per-type-preview handle-visibility move-vs-connect rejections canvas-descriptions sequence-lifeline flowchart-layout-note narrow-controls pointer-types selection-style per-type-first-use line-release per-type-selection zoom-pan status-bar handles selection-feedback not-offered reopen zones sequence-reorder workspace-controls workspace-header wcag sequence-toolbox workspace-tools source-status sequence-c4 unsaved-new second-finger inline-edit inline-edit-lines inline-edit-text inline-edit-view inline-focus undo-redo selection-panel guided-first-use)\.spec, e2e/(empty-state handle-visibility inline-edit inline-edit-text inline-edit-lines inline-edit-view inline-focus keyboard-only accessible-names canvas-descriptions canvas-wcag hover properties-draft small-gestures import-source-readonly import-types import-undo-reopen per-type-first-use per-type-selection)\.spec | pass (#98) |
| VO-003 | FR-005, US1-AS3 | verified | app/editor/reducerCancel.test.ts, e2e/guided-first-use\.spec, e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec, e2e/(per-type-first-use per-type-selection)\.spec | pass (#98) |
| VO-004 | FR-007, FR-009, US1-AS4 | verified | e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec, e2e/(per-type-first-use per-type-selection)\.spec | pass (#98) |
| VO-005 | FR-002, US1-AS5 | in progress | e2e/guided-first-use.spec.ts | pass (#49) |
| VO-006 | FR-014, US2-AS1 | verified | app/editor/selection.test.ts, e2e/per-type-selection\.spec | pass (#99) |
| VO-007 | FR-013, FR-014, US2-AS2 | verified | app/editor/selection.test.ts | pass (#55) |
| VO-008 | FR-010, FR-014, US2-AS3 | verified | app/editor/selection.test.ts, e2e/per-type-selection\.spec, e2e/(per-type-first-use per-type-selection)\.spec | pass (#99) |
| VO-009 | FR-016, US2-AS4 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel, e2e/(controls keyboard-only narrow-controls workspace-controls)\.spec, e2e/per-type-selection\.spec | pass (#99) |
| VO-010 | FR-017, FR-019, US3-AS1 | in progress | toolbarGroups | fail (#25) |
| VO-011 | FR-018, US3-AS2 | planned | - | - |
| VO-012 | FR-033, US3-AS3 | planned | - | - |
| VO-013 | FR-020, US4-AS1 | verified | e2e/preview-round-trip, e2e/per-type-preview, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec, e2e/(per-type-preview preview-round-trip)\.spec, e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec | pass (#74) |
| VO-014 | FR-022, FR-037, US4-AS2 | verified | e2e/preview-round-trip, e2e/per-type-preview, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec, e2e/(per-type-preview preview-round-trip)\.spec, e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec | pass (#74) |
| VO-015 | FR-023, US4-AS3 | in progress | e2e/preview-round-trip, e2e/(preview-round-trip toolbar-groups)\.spec, e2e/(per-type-preview preview-round-trip)\.spec, e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec, e2e/toolbar-groups.spec.ts e2e/flowchart-layout-note.spec.ts --project=chromium, (toolbar-groups flowchart-layout-note), (toolbar-groups flowchart-layout-note per-type-preview preview-round-trip narrow-layout) | pass (#117) |
| VO-016 | FR-028, US5-AS1 | blocked | leavePage, e2e/storage-wording, e2e/(storage-failure leave-page status-bar storage-wording) | fail (#36) |
| VO-017 | FR-029, US5-AS2 | planned | - | - |
| VO-018 | FR-031, US5-AS3 | planned | - | - |
| VO-019 | FR-032, US6-AS1 | verified | app/editor/keyboard.test.ts | pass (#20) |
| VO-020 | FR-034, US6-AS2 | verified | e2e/(keyboard-only narrow-layout)\.spec, e2e/(keyboard-only narrow-layout narrow-controls narrow-panel-keeps workspace-tools)\.spec | pass (#79) |
| VO-021 | FR-039, US7-AS1 | verified | e2e/(icon-consistency accessible-names)\.spec | pass (#83) |
| VO-022 | FR-041, US7-AS2 | planned | - | - |
| VO-023 | FR-033, FR-043, US7-AS3 | verified | e2e/(icon-consistency accessible-names)\.spec | pass (#83) |
| VO-024 | FR-049, US7-AS4 | verified | e2e/(icon-consistency accessible-names)\.spec | pass (#83) |
| VO-025 | FR-003 | in progress | e2e/guided-first-use.spec.ts | pass (#50) |
| VO-026 | FR-006 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel | pass (#61) |
| VO-027 | FR-008, FR-011, FR-044, FR-046 | verified | e2e/(icon-consistency accessible-names)\.spec | pass (#83) |
| VO-028 | FR-010 | in progress | e2e/guided-first-use.spec.ts | pass (#50) |
| VO-029 | FR-012, FR-013 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel | pass (#61) |
| VO-030 | FR-015 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel | pass (#61) |
| VO-031 | FR-021 | verified | e2e/preview-round-trip, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec | pass (#67) |
| VO-032 | FR-025 | verified | e2e/preview-round-trip, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec | pass (#67) |
| VO-033 | FR-026, FR-027 | planned | - | - |
| VO-034 | FR-030 | planned | - | - |
| VO-035 | FR-033, FR-047 | in progress | app/rendering/shared/icons.test.tsx | pass (#14) |
| VO-036 | FR-035 | verified | e2e/(icon-consistency accessible-names)\.spec | pass (#83) |
| VO-037 | FR-036, FR-050 | blocked | e2e/redesign-performance\.spec | fail (#106) |
| VO-038 | FR-042 | planned | - | - |
| VO-039 | FR-045 | verified | e2e/(icon-consistency accessible-names)\.spec | pass (#83) |
| VO-040 | FR-048 | verified | e2e/(icon-consistency accessible-names)\.spec | pass (#83) |
| VO-041 | FR-005 | verified | e2e/guided-first-use\.spec, e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec | pass (#98) |
| VO-042 | FR-005, FR-009 | in progress | app/editor/escape.test.ts, e2e/gestures.spec.ts e2e/move-vs-connect.spec.ts e2e/controls.spec.ts e2e/hover.spec.ts e2e/inline-edit.spec.ts e2e/selection-style.spec.ts --project=chromium, e2e/(gestures move-vs-connect controls hover inline-edit selection-style)\.spec | pass (#24) |
| VO-043 | FR-005 | in progress | e2e/guided-first-use\.spec, e2e/guided-first-use.spec.ts | pass (#47) |
| VO-044 | FR-029, FR-030 | in progress | e2e/storage-wording | fail (#28) |
| VO-045 | FR-020 | verified | e2e/preview-round-trip, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec, e2e/(per-type-preview preview-round-trip)\.spec, e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec | pass (#73) |
| VO-046 | FR-002 | in progress | e2e/guided-first-use.spec.ts | pass (#49) |
| VO-047 | FR-036 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel | pass (#61) |
| VO-048 | FR-020, FR-025 | verified | e2e/preview-round-trip, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec | pass (#67) |
| VO-049 | FR-028, FR-030 | verified | app/editor/(saveStatus leavePage)\.test, editor/(saveStatus leavePage), saveStatus | pass (#30) |
| VO-050 | FR-034 | verified | e2e/(keyboard-only narrow-layout)\.spec, e2e/(keyboard-only narrow-layout narrow-controls narrow-panel-keeps workspace-tools)\.spec | pass (#79) |
| VO-051 | FR-005, FR-014, FR-017, FR-019, FR-022, FR-027 | in progress | app/text/en.test.ts | pass (#19) |
| VO-052 | FR-005, FR-009, FR-026, FR-028 | planned | - | - |

| Behaviour item | Scenario | Obligations | Status | Tests |
|----------------|----------|-------------|--------|-------|
| BI-001 | US1-AS1 | VO-001 | verified | e2e/guided-first-use.spec.ts, app/text/typeWording.test.ts, e2e/per-type-first-use\.spec, app/text |
| BI-002 | US1-AS2 | VO-002 | verified | e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec, e2e/(per-type-first-use per-type-selection)\.spec, e2e/(touch/)?(c4-move-to c4-dynamic-reorder c4-notices c4-toolbox c4-edit-fields c4-delete c4-kind-picker accessible-names canvas-wcag c4-title controls end-handles drop-targets empty-state grid-alignment hover grid-hit handle-size connection-style keyboard-only labels-special lines-unchanged canvas-source-agree grid per-type-preview handle-visibility move-vs-connect rejections canvas-descriptions sequence-lifeline flowchart-layout-note narrow-controls pointer-types selection-style per-type-first-use line-release per-type-selection zoom-pan status-bar handles selection-feedback not-offered reopen zones sequence-reorder workspace-controls workspace-header wcag sequence-toolbox workspace-tools source-status sequence-c4 unsaved-new second-finger inline-edit inline-edit-lines inline-edit-text inline-edit-view inline-focus undo-redo selection-panel guided-first-use)\.spec, e2e/(empty-state handle-visibility inline-edit inline-edit-text inline-edit-lines inline-edit-view inline-focus keyboard-only accessible-names canvas-descriptions canvas-wcag hover properties-draft small-gestures import-source-readonly import-types import-undo-reopen per-type-first-use per-type-selection)\.spec |
| BI-003 | US1-AS3 | VO-003 | verified | app/editor/reducerCancel.test.ts, e2e/guided-first-use\.spec, e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec, e2e/(per-type-first-use per-type-selection)\.spec |
| BI-004 | US1-AS3 | VO-003 | verified | app/editor/reducerCancel.test.ts, e2e/guided-first-use\.spec, e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec, e2e/(per-type-first-use per-type-selection)\.spec |
| BI-005 | US1-AS4 | VO-004 | verified | e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec, e2e/(per-type-first-use per-type-selection)\.spec |
| BI-006 | US1-AS5 | VO-005 | in progress | e2e/guided-first-use.spec.ts |
| BI-007 | US1-AS5 | VO-005 | in progress | e2e/guided-first-use.spec.ts |
| BI-008 | US2-AS1 | VO-006 | verified | app/editor/selection.test.ts, e2e/per-type-selection\.spec |
| BI-009 | US2-AS2 | VO-007 | verified | app/editor/selection.test.ts |
| BI-010 | US2-AS3 | VO-008 | verified | app/editor/selection.test.ts, e2e/per-type-selection\.spec, e2e/(per-type-first-use per-type-selection)\.spec |
| BI-011 | US2-AS4 | VO-009 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel, e2e/(controls keyboard-only narrow-controls workspace-controls)\.spec, e2e/per-type-selection\.spec |
| BI-012 | US3-AS1 | VO-010 | in progress | toolbarGroups |
| BI-013 | US3-AS2 | VO-011 | planned | - |
| BI-014 | US3-AS3 | VO-012 | planned | - |
| BI-015 | US4-AS1 | VO-013 | verified | e2e/preview-round-trip, e2e/per-type-preview, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec, e2e/(per-type-preview preview-round-trip)\.spec, e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec |
| BI-016 | US4-AS2 | VO-014 | verified | e2e/preview-round-trip, e2e/per-type-preview, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec, e2e/(per-type-preview preview-round-trip)\.spec, e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec |
| BI-017 | US4-AS3 | VO-015 | in progress | e2e/preview-round-trip, e2e/(preview-round-trip toolbar-groups)\.spec, e2e/(per-type-preview preview-round-trip)\.spec, e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec, e2e/toolbar-groups.spec.ts e2e/flowchart-layout-note.spec.ts --project=chromium, (toolbar-groups flowchart-layout-note), (toolbar-groups flowchart-layout-note per-type-preview preview-round-trip narrow-layout) |
| BI-018 | US5-AS1 | VO-016 | blocked | leavePage, e2e/storage-wording, e2e/(storage-failure leave-page status-bar storage-wording) |
| BI-019 | US5-AS2 | VO-017 | planned | - |
| BI-020 | US5-AS3 | VO-018 | planned | - |
| BI-021 | US6-AS1 | VO-019 | verified | app/editor/keyboard.test.ts |
| BI-022 | US6-AS2 | VO-020 | verified | e2e/(keyboard-only narrow-layout)\.spec, e2e/(keyboard-only narrow-layout narrow-controls narrow-panel-keeps workspace-tools)\.spec |
| BI-023 | US7-AS1 | VO-021 | verified | e2e/(icon-consistency accessible-names)\.spec |
| BI-024 | US7-AS2 | VO-022 | planned | - |
| BI-025 | US7-AS3 | VO-023 | verified | e2e/(icon-consistency accessible-names)\.spec |
| BI-026 | US7-AS4 | VO-024 | verified | e2e/(icon-consistency accessible-names)\.spec |
| BI-027 | - | VO-025 | in progress | e2e/guided-first-use.spec.ts |
| BI-028 | - | VO-026 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel |
| BI-029 | - | VO-027 | verified | e2e/(icon-consistency accessible-names)\.spec |
| BI-030 | - | VO-028 | in progress | e2e/guided-first-use.spec.ts |
| BI-031 | - | VO-029 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel |
| BI-032 | - | VO-030 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel |
| BI-033 | - | VO-031 | verified | e2e/preview-round-trip, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec |
| BI-034 | - | VO-032 | verified | e2e/preview-round-trip, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec |
| BI-035 | - | VO-033 | planned | - |
| BI-036 | - | VO-034 | planned | - |
| BI-037 | - | VO-035 | in progress | app/rendering/shared/icons.test.tsx |
| BI-038 | - | VO-036 | verified | e2e/(icon-consistency accessible-names)\.spec |
| BI-039 | - | VO-037 | blocked | e2e/redesign-performance\.spec |
| BI-040 | - | VO-038 | planned | - |
| BI-041 | - | VO-039 | verified | e2e/(icon-consistency accessible-names)\.spec |
| BI-042 | - | VO-040 | verified | e2e/(icon-consistency accessible-names)\.spec |
| BI-043 | - | VO-041 | verified | e2e/guided-first-use\.spec, e2e/guided-first-use.spec.ts, e2e/per-type-first-use\.spec |
| BI-044 | - | VO-042 | in progress | app/editor/escape.test.ts, e2e/gestures.spec.ts e2e/move-vs-connect.spec.ts e2e/controls.spec.ts e2e/hover.spec.ts e2e/inline-edit.spec.ts e2e/selection-style.spec.ts --project=chromium, e2e/(gestures move-vs-connect controls hover inline-edit selection-style)\.spec |
| BI-045 | - | VO-042 | in progress | app/editor/escape.test.ts, e2e/gestures.spec.ts e2e/move-vs-connect.spec.ts e2e/controls.spec.ts e2e/hover.spec.ts e2e/inline-edit.spec.ts e2e/selection-style.spec.ts --project=chromium, e2e/(gestures move-vs-connect controls hover inline-edit selection-style)\.spec |
| BI-046 | - | VO-042 | in progress | app/editor/escape.test.ts, e2e/gestures.spec.ts e2e/move-vs-connect.spec.ts e2e/controls.spec.ts e2e/hover.spec.ts e2e/inline-edit.spec.ts e2e/selection-style.spec.ts --project=chromium, e2e/(gestures move-vs-connect controls hover inline-edit selection-style)\.spec |
| BI-047 | - | VO-043 | in progress | e2e/guided-first-use\.spec, e2e/guided-first-use.spec.ts |
| BI-048 | - | VO-044 | in progress | e2e/storage-wording |
| BI-049 | - | VO-045 | verified | e2e/preview-round-trip, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec, e2e/(per-type-preview preview-round-trip)\.spec, e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec |
| BI-050 | - | VO-046 | in progress | e2e/guided-first-use.spec.ts |
| BI-051 | - | VO-047 | verified | e2e/selection-panel.spec.ts --project=chromium --reporter=line, e2e/selection-panel |
| BI-052 | - | VO-048 | verified | e2e/preview-round-trip, e2e/(preview-round-trip flowchart-preview)\.spec, e2e/(preview-round-trip toolbar-groups)\.spec |
| BI-053 | - | VO-049 | verified | app/editor/(saveStatus leavePage)\.test, editor/(saveStatus leavePage), saveStatus |
| BI-054 | - | VO-050 | verified | e2e/(keyboard-only narrow-layout)\.spec, e2e/(keyboard-only narrow-layout narrow-controls narrow-panel-keeps workspace-tools)\.spec |
| BI-055 | - | exemption FR-024 | exempt | - |
| BI-056 | - | exemption FR-038 | exempt | - |
| BI-057 | - | exemption FR-040 | exempt | - |
| BI-058 | - | VO-051 | in progress | app/text/en.test.ts |
| BI-059 | - | VO-052 | planned | - |

Not verified by tests

- MV-001 manual: open
- MV-002 manual: open
- MV-003 manual: open

Counts: verified 30, deferred 0, manual checks 3 open

**Not verified**: FR-005 (VO-042 in progress, VO-043 in progress, VO-051 in progress, VO-052 planned), FR-009 (VO-042 in progress, VO-052 planned), FR-002 (VO-005 in progress, VO-046 in progress), US1-AS5 (VO-005 in progress), FR-014 (VO-051 in progress), FR-010 (VO-028 in progress), FR-017 (VO-010 in progress, VO-051 in progress), FR-019 (VO-010 in progress, VO-051 in progress), US3-AS1 (VO-010 in progress), FR-018 (VO-011 planned), US3-AS2 (VO-011 planned), FR-033 (VO-012 planned, VO-035 in progress), US3-AS3 (VO-012 planned), FR-022 (VO-051 in progress), FR-023 (VO-015 in progress), US4-AS3 (VO-015 in progress), FR-028 (VO-016 blocked, VO-052 planned), US5-AS1 (VO-016 blocked), FR-029 (VO-017 planned, VO-044 in progress), US5-AS2 (VO-017 planned), FR-031 (VO-018 planned), US5-AS3 (VO-018 planned), FR-041 (VO-022 planned), US7-AS2 (VO-022 planned), FR-003 (VO-025 in progress), FR-026 (VO-033 planned, VO-052 planned), FR-027 (VO-033 planned, VO-051 in progress), FR-030 (VO-034 planned, VO-044 in progress), FR-047 (VO-035 in progress), FR-036 (VO-037 blocked), FR-050 (VO-037 blocked), FR-042 (VO-038 planned), FR-024 (exempt: see plan), FR-038 (exempt: see plan), FR-040 (exempt: see plan), BI-006 (in progress), BI-007 (in progress), BI-012 (in progress), BI-013 (planned), BI-014 (planned), BI-017 (in progress), BI-018 (blocked), BI-019 (planned), BI-020 (planned), BI-024 (planned), BI-027 (in progress), BI-030 (in progress), BI-035 (planned), BI-036 (planned), BI-037 (in progress), BI-039 (blocked), BI-040 (planned), BI-044 (in progress), BI-045 (in progress), BI-046 (in progress), BI-047 (in progress), BI-048 (in progress), BI-050 (in progress), BI-058 (in progress), BI-059 (planned).

**Open decisions**: none. **Exceptions**: EX-01 other on T005 for VO-051 (awaiting approval); EX-02 other on T008 for VO-051 (awaiting approval); EX-03 other on T016 for VO-001, VO-002, VO-004, VO-025, VO-028, VO-041, VO-043 (awaiting approval); EX-04 other on T017 for VO-005, VO-046 (awaiting approval); EX-05 other on T018 for VO-001, VO-005, VO-046 (awaiting approval); EX-06 other on T019 for VO-004, VO-025, VO-028 (awaiting approval); EX-07 other on T020 for VO-003, VO-041, VO-043 (awaiting approval); EX-08 behaviour-preserving on T058 for VO-037. **Expectation changes**: XC-01 on T025 for FR-012, FR-016; XC-02 on T025 for FR-012; XC-03 on T025 for FR-014, FR-016, alters behaviour (awaiting approval); XC-04 on T034 for FR-022; XC-05 on T055 for FR-023, FR-024, alters behaviour (approved by Lee Sinclair (session decision 2026-10-24: layout note for flowchart only)); XC-06 on T055 for FR-020, alters behaviour (awaiting approval); XC-07 on T055 for FR-022; XC-08 on T050 for FR-023, FR-024, alters behaviour (approved by Lee Sinclair (session decision 2026-10-24: layout note for flowchart only)); XC-09 on T053 for FR-004; XC-10 on T053 for FR-001, FR-002, alters behaviour (awaiting approval).

**Item changes**: none.

**Pre-existing failures**: #3 e2e-all: timed out; baseline e2e; #4 e2e-all: baseline e2e rerun, default timeout hit.

## Baseline

| Seq | Command | Result | Pre-existing failures |
|-----|---------|--------|-----------------------|
| 1 | typecheck | pass | - |
| 2 | unit-all | pass | - |
| 3 | e2e-all | fail | timed out; baseline e2e |
| 4 | e2e-all | fail | baseline e2e rerun, default timeout hit |

## Test execution records

| Seq | Time | Task | Obligations | Phase | Command | Selector | Result | Valid | Classification | Files | Fingerprint | Note | Check |
|-----|------|------|-------------|-------|---------|----------|--------|-------|----------------|-------|-------------|------|-------|
| 1 | 2026-10-24T00:29:02Z | - | - | baseline | typecheck | - | pass | yes | - | - | - | baseline typecheck | 20cadc |
| 2 | 2026-10-24T00:29:09Z | - | - | baseline | unit-all | - | pass | yes | - | - | - | baseline unit | 390da9 |
| 3 | 2026-10-24T00:39:12Z | - | - | baseline | e2e-all | - | fail | yes | unclassified | - | - | timed out; baseline e2e | 559f56 |
| 4 | 2026-10-24T00:51:02Z | - | - | baseline | e2e-all | - | fail | yes | unclassified | - | - | baseline e2e rerun, default timeout hit | 8a3702 |
| 5 | 2026-10-24T00:51:58Z | T002 | VO-042 | red | unit | app/editor/escape.test.ts | fail | yes | assertion | app/editor/escape.test.ts | d9ab92 | expected: escape; T002 red: escape resolver not yet implemented | 044b07 |
| 6 | 2026-10-24T00:52:09Z | T003 | VO-035 | red | unit | app/rendering/shared/icons.test.tsx | fail | yes | assertion | app/rendering/shared/icons.test.tsx | e8e800 | expected: icons; T003 red: icon tests before icons.tsx exists | 8b1bd3 |
| 7 | 2026-10-24T00:52:15Z | T004 | VO-003 | red | unit | app/editor/reducerCancel.test.ts | fail | yes | assertion | app/editor/reducerCancel.test.ts | e654ec | expected: keeps the selection | 960c9b |
| 8 | 2026-10-24T00:56:17Z | T009 | VO-003 | green | unit | app/editor/reducerCancel.test.ts | pass | yes | - | app/editor/reducerCancel.test.ts | e654ec | - | 5fc896 |
| 9 | 2026-10-24T00:56:19Z | T006 | VO-042 | green | unit | app/editor/escape.test.ts | pass | yes | - | app/editor/escape.test.ts | d9ab92 | - | a956a5 |
| 10 | 2026-10-24T00:56:28Z | T007 | VO-035 | green | unit | app/rendering/shared/icons.test.tsx | pass | yes | - | app/rendering/shared/icons.test.tsx | e8e800 | - | fa9a30 |
| 11 | 2026-10-24T00:56:33Z | T009 | VO-003 | green | unit | app/editor/reducerCancel.test.ts | pass | yes | - | app/editor/reducerCancel.test.ts | e654ec | - | 22aaba |
| 12 | 2026-10-24T00:56:44Z | T007 | VO-035 | green | unit | app/rendering/shared/icons.test.tsx | pass | yes | - | app/rendering/shared/icons.test.tsx | e8e800 | - | d3357f |
| 13 | 2026-10-24T00:57:09Z | T007 | VO-035 | green | unit | app/rendering/shared/icons.test.tsx | pass | yes | - | app/rendering/shared/icons.test.tsx | e8e800 | - | 9f85d3 |
| 14 | 2026-10-24T00:57:51Z | T003 | VO-035 | green | unit | app/rendering/shared/icons.test.tsx | pass | yes | - | app/rendering/shared/icons.test.tsx | 7265ad | - | 3c07c7 |
| 15 | 2026-10-24T01:05:15Z | - | - | checkpoint | unit | app/text/en.test.ts | pass | no | - | - | - | command scope is not broad; T005/T008 copy presence | d00cbb |
| 16 | 2026-10-24T01:05:26Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | Foundational wave 1-2 checkpoint, covers T005/T008 copy presence | 71362b |
| 17 | 2026-10-24T01:06:21Z | T010 | VO-019 | red | unit | app/editor/keyboard.test.ts | fail | yes | assertion | app/editor/keyboard.test.ts | 27b1fe | expected: cancelDraft | 4e4d86 |
| 18 | 2026-10-24T01:08:07Z | - | - | checkpoint | unit | app/editor/Editor.test.tsx | fail | no | unclassified | - | - | command scope is not broad; T012 wiring test red | 9dee13 |
| 19 | 2026-10-24T01:08:29Z | T008 | VO-051 | green | unit | app/text/en.test.ts | pass | yes | - | app/text/en.test.ts | 1d2361 | VO-051 green after relabel from NT | 551b9d |
| 20 | 2026-10-24T01:09:45Z | T011 | VO-019 | green | unit | app/editor/keyboard.test.ts | pass | yes | - | app/editor/keyboard.test.ts | 27b1fe | - | 4a151d |
| 21 | 2026-10-24T01:09:54Z | - | - | checkpoint | unit-all | - | fail | no | unclassified | - | - | Foundational wave 3-4 checkpoint, covers T012/T013 wiring | 777f76 |
| 22 | 2026-10-24T01:10:27Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | Foundational wave 3-4 checkpoint, covers T012/T013 wiring | 7bbb5a |
| 23 | 2026-10-24T01:11:47Z | T014 | VO-042 | green | e2e | e2e/gestures.spec.ts e2e/move-vs-connect.spec.ts e2e/controls.spec.ts e2e/hover.spec.ts e2e/inline-edit.spec.ts e2e/selection-style.spec.ts --project=chromium | fail | no | unclassified | e2e/controls.spec.ts, e2e/gestures.spec.ts, e2e/hover.spec.ts, e2e/inline-edit.spec.ts, e2e/move-vs-connect.spec.ts, e2e/selection-style.spec.ts | 90933a | - | 6886c0 |
| 24 | 2026-10-24T01:14:13Z | T014 | VO-042 | green | e2e | e2e/(gestures move-vs-connect controls hover inline-edit selection-style)\.spec | pass | yes | - | e2e/controls.spec.ts, e2e/gestures.spec.ts, e2e/hover.spec.ts, e2e/inline-edit.spec.ts, e2e/move-vs-connect.spec.ts, e2e/selection-style.spec.ts | 90933a | - | fd6416 |
| 25 | 2026-10-24T01:15:37Z | T027 | VO-010 | red | unit | toolbarGroups | fail | yes | assertion | app/rendering/shared/toolbarGroups.test.ts | e52316 | expected: toolbarGroups | 1dd40d |
| 26 | 2026-10-24T01:15:46Z | T036 | VO-049 | red | unit | app/editor/(saveStatus leavePage)\.test | fail | no | unclassified | app/editor/leavePage.test.ts | 15372c | failed for a different reason | 662eb0 |
| 27 | 2026-10-24T01:15:50Z | T036 | VO-049 | red | unit | editor/(saveStatus leavePage) | fail | no | unclassified | app/editor/leavePage.test.ts | 15372c | failed for a different reason | beaebe |
| 28 | 2026-10-24T01:16:29Z | T037 | VO-044 | red | e2e | e2e/storage-wording | fail | yes | assertion | e2e/storage-wording.spec.ts | de2fbf | expected: The diagram was not saved | 699380 |
| 29 | 2026-10-24T01:16:34Z | T036 | VO-049 | red | unit | saveStatus | fail | yes | assertion | app/editor/saveStatus.test.ts | 5cc621 | expected: hasUnsavedChange | 9c76e0 |
| 30 | 2026-10-24T01:16:43Z | T038 | VO-049 | green | unit | saveStatus | pass | yes | - | app/editor/saveStatus.test.ts | 5cc621 | - | 9f136b |
| 31 | 2026-10-24T01:16:44Z | T039 | VO-016 | green | unit | leavePage | pass | yes | - | app/editor/leavePage.test.ts | 15372c | - | 43c432 |
| 32 | 2026-10-24T01:16:57Z | T040 | VO-016 | green | e2e | e2e/storage-wording | pass | yes | - | e2e/storage-wording.spec.ts | 518cb7 | - | b9c3d0 |
| 33 | 2026-10-24T01:18:04Z | - | - | checkpoint | e2e | e2e/(storage-failure leave-page status-bar storage-wording) | fail | no | environment | - | - | command scope is not broad; select used spaces instead of in the regex, so Playwright matched no tests | bc6209 |
| 34 | 2026-10-24T01:18:08Z | - | - | checkpoint | unit | editor | pass | no | - | - | - | command scope is not broad | 49c6a1 |
| 35 | 2026-10-24T01:18:45Z | T040 | VO-016 | green | e2e | e2e/(storage-failure leave-page status-bar storage-wording) | fail | no | environment | - | - | select used spaces instead of in the regex, so Playwright matched no tests | 92a361 |
| 36 | 2026-10-24T01:19:20Z | T040 | VO-016 | green | e2e | e2e/(storage-failure leave-page status-bar storage-wording) | fail | no | environment | - | - | select used spaces instead of in the regex, so Playwright matched no tests | 5633cb |
| 37 | 2026-10-24T01:21:17Z | T020 | VO-003, VO-041, VO-043 | green | e2e | e2e/guided-first-use\.spec | fail | no | defect | e2e/guided-first-use.spec.ts | ceb59a | US1 implementation was incomplete at the time; fixed before run #42/#46 | 5444e8 |
| 38 | 2026-10-24T01:51:34Z | - | - | checkpoint | e2e-all | - | fail | no | unclassified | - | - | after US1, US3, US5: full e2e | 9453c4 |
| 39 | 2026-10-24T02:50:37Z | - | - | checkpoint | e2e | e2e/keyboard-only.spec.ts --project=firefox --repeat-each=6 | fail | no | unclassified | e2e/keyboard-only.spec.ts | 7ed260 | command scope is not broad; Firefox flake fix: nodes carry measured so React Flow keeps handle bounds on re-adoption (FlowchartCanvas.tsx) | f8d600 |
| 40 | 2026-10-24T03:32:39Z | - | - | checkpoint | e2e-all | - | fail | no | unclassified | - | - | after fixing the C4 end-handle test's off-screen press in Chromium (page scrolled by the toolbox) | dbb7fe |
| 41 | 2026-10-24T03:47:21Z | - | - | checkpoint | e2e-all | - | fail | no | unclassified | - | - | after widening the storage delay in return-to-start.spec.ts (Saving… missed under load in Firefox) | a03e29 |
| 42 | 2026-10-24T04:03:06Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | after dropping the incidental 1 s wait in import-keyboard.spec.ts (missed under load in Firefox) | 55173c |
| 43 | 2026-10-24T05:15:18Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | status check after the e2e fixes | 396179 |
| 44 | 2026-10-24T05:15:23Z | - | - | checkpoint | typecheck | - | pass | yes | - | - | - | status check after the e2e fixes | a8a3f6 |
| 45 | 2026-10-24T05:16:01Z | - | - | checkpoint | lint | - | pass | yes | - | - | - | status check after the e2e fixes | 97dd5d |
| 46 | 2026-10-24T05:20:22Z | T020 | VO-003, VO-041, VO-043 | green | e2e | e2e/guided-first-use.spec.ts | pass | yes | - | e2e/guided-first-use.spec.ts | bc3fb4 | re-run on resume | 1b5da8 |
| 47 | 2026-10-24T06:17:56Z | T016 | VO-001, VO-002, VO-004, VO-025, VO-028, VO-041, VO-043 | green | e2e | e2e/guided-first-use.spec.ts | pass | yes | - | e2e/guided-first-use.spec.ts | bc3fb4 | - | d8f0de |
| 48 | 2026-10-24T06:18:11Z | T017 | VO-005, VO-046 | green | e2e | e2e/guided-first-use.spec.ts | pass | yes | - | e2e/guided-first-use.spec.ts | bc3fb4 | - | 21c1e4 |
| 49 | 2026-10-24T06:18:26Z | T018 | VO-001, VO-005, VO-046 | green | e2e | e2e/guided-first-use.spec.ts | pass | yes | - | e2e/guided-first-use.spec.ts | bc3fb4 | - | 62e678 |
| 50 | 2026-10-24T06:18:41Z | T019 | VO-004, VO-025, VO-028 | green | e2e | e2e/guided-first-use.spec.ts | pass | yes | - | e2e/guided-first-use.spec.ts | bc3fb4 | - | 2d5b21 |
| 51 | 2026-10-24T06:18:42Z | T020 | VO-003 | green | unit | app/editor/reducerCancel.test.ts | pass | yes | - | app/editor/reducerCancel.test.ts | e654ec | - | 7f5b31 |
| 52 | 2026-10-24T06:21:42Z | T022 | VO-006, VO-007, VO-008 | red | unit | app/editor/selection.test.ts | fail | yes | assertion | app/editor/selection.test.ts | e014e3 | expected: expected | 8db1d5 |
| 53 | 2026-10-24T06:22:32Z | T023 | VO-009, VO-026, VO-029, VO-030, VO-047 | red | e2e | e2e/selection-panel.spec.ts --project=chromium --reporter=line | fail | no | environment | e2e/selection-panel.spec.ts | 2a904c | failed for a different reason; select string passed flags as one regex, so Playwright found no tests; rerun as #54 | 87eed5 |
| 54 | 2026-10-24T06:23:47Z | T023 | VO-009, VO-026, VO-029, VO-030, VO-047 | red | e2e | e2e/selection-panel | fail | yes | assertion | e2e/selection-panel.spec.ts | 2a904c | expected: failed | e6721e |
| 55 | 2026-10-24T06:25:00Z | T024 | VO-006, VO-007, VO-008 | green | unit | app/editor/selection.test.ts | pass | yes | - | app/editor/selection.test.ts | e014e3 | - | 6f46d0 |
| 56 | 2026-10-24T06:28:02Z | T025 | VO-009, VO-026, VO-029, VO-030, VO-047 | green | e2e | e2e/selection-panel | fail | no | assertion | e2e/selection-panel.spec.ts | 2a904c | test located the labelled element not the node wrapper for aria-pressed, and clicked an aria-disabled button, which Playwright refuses | 344c5e |
| 57 | 2026-10-24T06:30:17Z | T025 | VO-009, VO-026, VO-029, VO-030, VO-047 | green | e2e | e2e/selection-panel | fail | no | assertion | e2e/selection-panel.spec.ts | bf0e7d | canvas marks the selected node with aria-current, not aria-pressed | 60b7d7 |
| 58 | 2026-10-24T06:31:01Z | T025 | VO-009, VO-026, VO-029, VO-030, VO-047 | green | e2e | e2e/selection-panel | pass | yes | - | e2e/selection-panel.spec.ts | ebf01b | - | 72c70a |
| 59 | 2026-10-24T06:41:12Z | - | - | checkpoint | e2e | e2e/(accessible-names announcements appearance-switch c4-delete c4-edit-fields c4-move-to c4-notices c4-title canvas-source-agree controls empty-state end-handles gestures guided-first-use handle-size keyboard-only labels-special leave-page narrow-controls narrow-layout narrow-panel-keeps not-offered performance pointer-types rejections reopen selection-feedback selection-panel sequence-toolbox static-offline touch/flowchart touch/sequence-c4 two-tabs undo-redo wcag workspace-controls workspace-tools)\.spec | fail | no | assertion | - | - | command scope is not broad; US2 panel: specs that touch the Properties panel; old tests asserted always-shown panel controls and Change end…; updated under XC-03, green in #60 | 2cb996 |
| 60 | 2026-10-24T06:43:23Z | T025 | VO-009 | green | e2e | e2e/(controls keyboard-only narrow-controls workspace-controls)\.spec | pass | yes | - | e2e/controls.spec.ts, e2e/keyboard-only.spec.ts | 5791f7 | - | 22a085 |
| 61 | 2026-10-24T06:43:46Z | T025 | VO-009, VO-026, VO-029, VO-030, VO-047 | green | e2e | e2e/selection-panel | pass | yes | - | e2e/selection-panel.spec.ts | ebf01b | - | 0f518b |
| 62 | 2026-10-24T06:46:08Z | T033 | VO-013, VO-014, VO-031, VO-032, VO-045, VO-048 | red | e2e | e2e/preview-round-trip | fail | yes | assertion | e2e/preview-round-trip.spec.ts | 77baa2 | expected: failed | cdc1cb |
| 63 | 2026-10-24T06:47:53Z | T050 | VO-013, VO-014 | red | e2e | e2e/per-type-preview | fail | yes | assertion | e2e/per-type-preview.spec.ts | 8670f8 | expected: failed | 078053 |
| 64 | 2026-10-24T06:48:37Z | T034 | VO-013, VO-014, VO-031, VO-032, VO-045, VO-048 | green | e2e | e2e/(preview-round-trip flowchart-preview)\.spec | fail | no | assertion | e2e/preview-round-trip.spec.ts | 77baa2 | test compared screen boxes; the page scrolls when the preview opens below the canvas | 37cebd |
| 65 | 2026-10-24T06:49:13Z | T034 | VO-013, VO-014, VO-031, VO-032, VO-045, VO-048 | green | e2e | e2e/(preview-round-trip flowchart-preview)\.spec | pass | yes | - | e2e/preview-round-trip.spec.ts | 910100 | - | e62cb9 |
| 66 | 2026-10-24T06:49:53Z | T034 | VO-015 | red | e2e | e2e/preview-round-trip | fail | yes | assertion | e2e/preview-round-trip.spec.ts | 910100 | expected: Node positions are kept; note removed from the preview to show the test fails without it | 337cc0 |
| 67 | 2026-10-24T06:50:14Z | T034 | VO-013, VO-014, VO-015, VO-031, VO-032, VO-045, VO-048 | green | e2e | e2e/(preview-round-trip toolbar-groups)\.spec | pass | yes | - | e2e/preview-round-trip.spec.ts | 910100 | - | 3c11e5 |
| 68 | 2026-10-24T06:51:15Z | T055 | VO-013, VO-014, VO-015, VO-045 | green | e2e | e2e/(per-type-preview preview-round-trip)\.spec | pass | yes | - | e2e/per-type-preview.spec.ts | 8670f8 | - | b9d63f |
| 69 | 2026-10-24T07:01:25Z | - | - | checkpoint | e2e | e2e/(workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note workspace-tools redesign-performance narrow-panel-keeps)\.spec | fail | no | assertion | - | - | command scope is not broad; T055: preview toggle and note for every type; inventories and layout-note test predate the sequence/C4 preview; note restricted to flowchart by decision, inventories updated | 47c444 |
| 70 | 2026-10-24T08:19:11Z | T055 | VO-013, VO-014, VO-015, VO-045 | green | e2e | e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec | fail | no | environment | e2e/per-type-preview.spec.ts | acd16f | all 26 failures were Firefox 30 s timeouts in an 8.9 min run; rerun follows | 4f6d1d |
| 71 | 2026-10-24T08:23:48Z | T055 | VO-013, VO-014, VO-015, VO-045 | green | e2e | e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec | fail | no | environment | e2e/per-type-preview.spec.ts | acd16f | Firefox timeouts while the machine load average was ~43 (other apps); rerun at normal load | be7886 |
| 72 | 2026-10-24T08:24:53Z | T055 | VO-013, VO-014, VO-015, VO-045 | green | e2e | e2e/(per-type-preview preview-round-trip workspace-controls narrow-controls not-offered toolbar-groups narrow-layout flowchart-layout-note flowchart-preview)\.spec | pass | yes | - | e2e/per-type-preview.spec.ts | acd16f | - | 9cbda5 |
| 73 | 2026-10-24T08:25:14Z | T055 | VO-015, VO-045 | green | e2e | e2e/preview-round-trip | pass | yes | - | e2e/preview-round-trip.spec.ts | 910100 | - | c39973 |
| 74 | 2026-10-24T08:25:27Z | T050 | VO-013, VO-014 | green | e2e | e2e/per-type-preview | pass | yes | - | e2e/per-type-preview.spec.ts | acd16f | - | 345ab6 |
| 75 | 2026-10-24T08:25:59Z | - | - | checkpoint | unit | app/editor/saveStatus.test.ts app/editor/leavePage.test.ts | fail | no | environment | - | - | command scope is not broad; T041 US5 checkpoint; two paths passed as one argument; vitest found no file | 4fa82e |
| 76 | 2026-10-24T08:26:32Z | - | - | checkpoint | e2e | e2e/(storage-failure leave-page status-bar storage-wording save-status unsaved-new return-to-start)\.spec | pass | no | - | - | - | command scope is not broad; T041 US5 checkpoint | 2d0f91 |
| 77 | 2026-10-24T08:26:49Z | - | - | checkpoint | unit | app/editor/ | pass | no | - | - | - | command scope is not broad; T041 US5 checkpoint: editor unit tests incl. saveStatus and leavePage | a1cb42 |
| 78 | 2026-10-24T08:28:13Z | T042 | VO-020, VO-050 | red | e2e | e2e/(keyboard-only narrow-layout)\.spec | fail | yes | assertion | e2e/keyboard-only.spec.ts, e2e/narrow-layout.spec.ts | 7074bf | expected: failed | cab628 |
| 79 | 2026-10-24T08:29:05Z | T043 | VO-020, VO-050 | green | e2e | e2e/(keyboard-only narrow-layout narrow-controls narrow-panel-keeps workspace-tools)\.spec | pass | yes | - | e2e/keyboard-only.spec.ts, e2e/narrow-layout.spec.ts | 7074bf | - | 011446 |
| 80 | 2026-10-24T08:31:57Z | T045 | VO-021, VO-023, VO-024, VO-027, VO-036, VO-039, VO-040 | red | e2e | e2e/(icon-consistency accessible-names)\.spec | fail | yes | assertion | e2e/accessible-names.spec.ts, e2e/icon-consistency.spec.ts | 9b7ad9 | expected: failed | 83d7fb |
| 81 | 2026-10-24T08:33:58Z | T045 | VO-021, VO-023, VO-024, VO-027, VO-036, VO-039, VO-040 | red | e2e | e2e/(icon-consistency accessible-names)\.spec | fail | yes | assertion | e2e/accessible-names.spec.ts, e2e/icon-consistency.spec.ts | 9e02ac | expected: failed; re-recorded after test-only fixes, before implementation | 9971e5 |
| 82 | 2026-10-24T08:34:57Z | T045 | VO-021, VO-023, VO-024, VO-027, VO-036, VO-039, VO-040 | red | e2e | e2e/(icon-consistency accessible-names)\.spec | fail | yes | assertion | e2e/accessible-names.spec.ts, e2e/icon-consistency.spec.ts | 594ed4 | expected: failed; re-recorded after a test-only tooltip fix, before implementation | 5fa166 |
| 83 | 2026-10-24T08:35:45Z | T046 | VO-021, VO-023, VO-024, VO-027, VO-036, VO-039, VO-040 | green | e2e | e2e/(icon-consistency accessible-names)\.spec | pass | yes | - | e2e/accessible-names.spec.ts, e2e/icon-consistency.spec.ts | 594ed4 | - | 3f0bdf |
| 84 | 2026-10-24T08:39:14Z | T051 | VO-001 | red | unit | app/text/typeWording.test.ts | fail | yes | assertion | app/text/typeWording.test.ts | bc70fe | expected: failed | ff3357 |
| 85 | 2026-10-24T08:41:55Z | T048 | VO-001, VO-002, VO-003, VO-004, VO-041 | red | e2e | e2e/per-type-first-use\.spec | fail | yes | assertion | e2e/per-type-first-use.spec.ts | 668831 | expected: failed | 0e30a8 |
| 86 | 2026-10-24T08:42:44Z | T049 | VO-006, VO-008, VO-009 | red | e2e | e2e/per-type-selection\.spec | fail | yes | assertion | e2e/per-type-selection.spec.ts | 6873b6 | expected: failed | b3b226 |
| 87 | 2026-10-24T08:43:22Z | T052 | VO-001 | green | unit | app/text | pass | yes | - | app/text/en.test.ts, app/text/typeWording.test.ts | a452c6 | - | 9c16c2 |
| 88 | 2026-10-24T08:44:42Z | T053 | VO-002, VO-003, VO-004, VO-008 | green | e2e | e2e/(per-type-first-use per-type-selection)\.spec | pass | yes | - | e2e/per-type-first-use.spec.ts, e2e/per-type-selection.spec.ts | 3f6530 | - | f4ec98 |
| 89 | 2026-10-24T08:55:12Z | - | - | checkpoint | e2e | e2e/(touch/)?(c4-move-to c4-dynamic-reorder c4-notices c4-toolbox c4-edit-fields c4-delete c4-kind-picker accessible-names canvas-wcag c4-title controls end-handles drop-targets empty-state grid-alignment hover grid-hit handle-size connection-style keyboard-only labels-special lines-unchanged canvas-source-agree grid per-type-preview handle-visibility move-vs-connect rejections canvas-descriptions sequence-lifeline flowchart-layout-note narrow-controls pointer-types selection-style per-type-first-use line-release per-type-selection zoom-pan status-bar handles selection-feedback not-offered reopen zones sequence-reorder workspace-controls workspace-header wcag sequence-toolbox workspace-tools source-status sequence-c4 unsaved-new second-finger inline-edit inline-edit-lines inline-edit-text inline-edit-view inline-focus undo-redo selection-panel guided-first-use)\.spec | fail | no | environment | - | - | command scope is not broad; regression sweep: every spec touching sequence or C4; checkpoint run cut short at the 600 s gate timeout and not broad; superseded by #91 | cafc77 |
| 90 | 2026-10-24T08:55:18Z | T051 | VO-001 | green | unit | app/text/typeWording.test.ts | pass | yes | - | app/text/typeWording.test.ts | bc70fe | - | 2def4c |
| 91 | 2026-10-24T09:18:05Z | T053 | VO-002 | green | e2e | e2e/(touch/)?(c4-move-to c4-dynamic-reorder c4-notices c4-toolbox c4-edit-fields c4-delete c4-kind-picker accessible-names canvas-wcag c4-title controls end-handles drop-targets empty-state grid-alignment hover grid-hit handle-size connection-style keyboard-only labels-special lines-unchanged canvas-source-agree grid per-type-preview handle-visibility move-vs-connect rejections canvas-descriptions sequence-lifeline flowchart-layout-note narrow-controls pointer-types selection-style per-type-first-use line-release per-type-selection zoom-pan status-bar handles selection-feedback not-offered reopen zones sequence-reorder workspace-controls workspace-header wcag sequence-toolbox workspace-tools source-status sequence-c4 unsaved-new second-finger inline-edit inline-edit-lines inline-edit-text inline-edit-view inline-focus undo-redo selection-panel guided-first-use)\.spec | fail | no | assertion | e2e/per-type-first-use.spec.ts, e2e/per-type-selection.spec.ts | 3f6530 | regression sweep: every spec touching sequence or C4; expected: specs that add a participant or C4 item from the toolbox and then act on it now meet the label editor that opens on the new item (FR-004), and empty-state still expects the old generic hint | 2af758 |
| 92 | 2026-10-24T09:23:53Z | T053 | VO-002 | green | e2e | e2e/(empty-state handle-visibility inline-edit inline-edit-text inline-edit-lines inline-edit-view inline-focus keyboard-only accessible-names canvas-descriptions canvas-wcag hover properties-draft small-gestures import-source-readonly import-types import-undo-reopen per-type-first-use per-type-selection)\.spec | pass | yes | - | e2e/per-type-first-use.spec.ts, e2e/per-type-selection.spec.ts | 3f6530 | rerun of specs updated for the label editor that opens on a new sequence or C4 item | 0eb6a7 |
| 93 | 2026-10-24T09:24:35Z | T053 | VO-002, VO-003, VO-004 | green | e2e | e2e/per-type-first-use\.spec | pass | yes | - | e2e/per-type-first-use.spec.ts | 668831 | - | e288a1 |
| 94 | 2026-10-24T09:24:48Z | T053 | VO-008 | green | e2e | e2e/per-type-selection\.spec | pass | yes | - | e2e/per-type-selection.spec.ts | 6873b6 | - | 983280 |
| 95 | 2026-10-24T09:25:03Z | T054 | VO-002, VO-003, VO-004 | green | e2e | e2e/per-type-first-use\.spec | pass | yes | - | e2e/per-type-first-use.spec.ts | 668831 | - | 1a53cd |
| 96 | 2026-10-24T09:25:16Z | T054 | VO-008 | green | e2e | e2e/per-type-selection\.spec | pass | yes | - | e2e/per-type-selection.spec.ts | 6873b6 | - | 354d90 |
| 97 | 2026-10-24T09:25:31Z | T052 | VO-001 | green | e2e | e2e/per-type-first-use\.spec | pass | yes | - | e2e/per-type-first-use.spec.ts | 668831 | - | 289770 |
| 98 | 2026-10-24T09:25:54Z | T048 | VO-001, VO-002, VO-003, VO-004, VO-041 | green | e2e | e2e/per-type-first-use\.spec | pass | yes | - | e2e/per-type-first-use.spec.ts | 668831 | - | 44487b |
| 99 | 2026-10-24T09:26:07Z | T049 | VO-006, VO-008, VO-009 | green | e2e | e2e/per-type-selection\.spec | pass | yes | - | e2e/per-type-selection.spec.ts | 6873b6 | - | d0be11 |
| 100 | 2026-10-24T09:26:51Z | - | - | checkpoint | e2e | e2e/(per-type-first-use per-type-selection per-type-preview)\.spec | pass | no | - | - | - | command scope is not broad; T056 and T057: per-type first-use, selection and preview in Chromium and Firefox | 03d8cc |
| 101 | 2026-10-24T09:27:05Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | unit suite after Phase 9b | aa2a63 |
| 102 | 2026-10-24T09:28:12Z | - | - | checkpoint | typecheck | - | pass | yes | - | - | - | T058 Polish: full typecheck | 99cd56 |
| 103 | 2026-10-24T09:28:49Z | - | - | checkpoint | lint | - | pass | yes | - | - | - | T058 Polish: full lint | b8d8fa |
| 104 | 2026-10-24T09:28:57Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | T058 Polish: full unit-all | a31bc9 |
| 105 | 2026-10-24T13:58:35Z | - | - | checkpoint | e2e-all | - | fail | no | unreliable | - | - | T058 full e2e re-run after memory freed; 1351 other tests passed; Firefox flowchart zoom median 286.7 ms against a 283.8 ms ceiling (1% over); timing noise, re-run to confirm | 51c920 |
| 106 | 2026-10-24T14:09:00Z | T058 | VO-037 | refactor | e2e | e2e/redesign-performance\.spec | fail | no | environment | - | - | timed out; re-check of the Firefox flowchart zoom timing that ran 1% over in #105; the timing project's dependencies ran the whole suite and hit the 600 s timeout; no verdict on the timing | 2a2175 |
| 107 | 2026-10-24T14:23:48Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | T058 full e2e re-run to confirm the #105 timing overrun | 2f29a8 |
| 108 | 2026-10-24T14:25:15Z | - | - | checkpoint | typecheck | - | pass | yes | - | - | - | after removing the dead wording maps, needsSelection reason and Change end… string | 15254b |
| 109 | 2026-10-24T14:25:50Z | - | - | checkpoint | lint | - | pass | yes | - | - | - | after removing the dead wording maps, needsSelection reason and Change end… string | 8bf7e0 |
| 110 | 2026-10-24T14:25:57Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | after removing the dead wording maps, needsSelection reason and Change end… string | 1f0a9a |
| 111 | 2026-10-25T00:36:30Z | - | - | checkpoint | typecheck | - | pass | yes | - | - | - | after dropping the Firefox projects (constitution 3.0.0) | 03dd83 |
| 112 | 2026-10-25T00:37:05Z | - | - | checkpoint | lint | - | pass | yes | - | - | - | after dropping the Firefox projects (constitution 3.0.0) | 4986f5 |
| 113 | 2026-10-25T00:43:38Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | after dropping the Firefox projects (constitution 3.0.0) | 10ead1 |
| 114 | 2026-10-25T20:56:29Z | T031 | VO-015 | red | e2e | e2e/toolbar-groups.spec.ts e2e/flowchart-layout-note.spec.ts --project=chromium | fail | no | unclassified | e2e/flowchart-layout-note.spec.ts, e2e/toolbar-groups.spec.ts | 53c5fd | failed for a different reason; BA asked for the node-position note as a tooltip on the copy and save buttons, not inline text | 398013 |
| 115 | 2026-10-25T20:56:56Z | T031 | VO-015 | red | e2e | (toolbar-groups flowchart-layout-note) | fail | yes | assertion | e2e/flowchart-layout-note.spec.ts, e2e/toolbar-groups.spec.ts | 53c5fd | expected: toHaveAccessibleDescription; BA asked for the node-position note as a tooltip on the copy and save buttons, not inline text | 634038 |
| 116 | 2026-10-25T20:57:36Z | T031 | VO-015 | green | e2e | (toolbar-groups flowchart-layout-note per-type-preview preview-round-trip narrow-layout) | fail | no | unclassified | e2e/flowchart-layout-note.spec.ts, e2e/per-type-preview.spec.ts, e2e/toolbar-groups.spec.ts | 7b2e18 | node-position note as a tooltip on Copy Source, Copy for Markdown and Save file | abe35a |
| 117 | 2026-10-25T20:57:57Z | T031 | VO-015 | green | e2e | (toolbar-groups flowchart-layout-note per-type-preview preview-round-trip narrow-layout) | pass | yes | - | e2e/flowchart-layout-note.spec.ts, e2e/per-type-preview.spec.ts, e2e/toolbar-groups.spec.ts | d2a747 | node-position note as a tooltip on Copy Source, Copy for Markdown and Save file | 1d9597 |

## Exceptions

| ID | Time | Task | Obligations | Kind | Rationale | Alternative verification | Needs approval | Approved by |
|----|------|------|-------------|------|-----------|--------------------------|----------------|-------------|
| EX-01 | 2026-10-24T01:08:28Z | T005 | VO-051 | other | Task was completed under an NT label before VO-051 existed, so no failing-first run names VO-051; the label was corrected afterwards | A green unit run of app/text/en.test.ts naming VO-051, recorded after this exception; records #15 and #16 show the same test passing at completion | yes | - |
| EX-02 | 2026-10-24T01:08:28Z | T008 | VO-051 | other | Task was completed under an NT label before VO-051 existed, so no failing-first run names VO-051; the label was corrected afterwards | A green unit run of app/text/en.test.ts naming VO-051, recorded after this exception; records #15 and #16 show the same test passing at completion | yes | - |
| EX-03 | 2026-10-24T06:17:23Z | T016 | VO-001, VO-002, VO-004, VO-025, VO-028, VO-041, VO-043 | other | US1 test and code were written in an earlier session before a failing-first run was recorded for this obligation; no meaningful red can be recorded now without backing out shipped code | Green e2e run #46 of e2e/guided-first-use.spec.ts (22 tests, Chromium and Firefox), recorded after this exception | yes | - |
| EX-04 | 2026-10-24T06:17:24Z | T017 | VO-005, VO-046 | other | US1 test and code were written in an earlier session before a failing-first run was recorded for this obligation; no meaningful red can be recorded now without backing out shipped code | Green e2e run #46 of e2e/guided-first-use.spec.ts (22 tests, Chromium and Firefox), recorded after this exception | yes | - |
| EX-05 | 2026-10-24T06:17:24Z | T018 | VO-001, VO-005, VO-046 | other | US1 test and code were written in an earlier session before a failing-first run was recorded for this obligation; no meaningful red can be recorded now without backing out shipped code | Green e2e run #46 of e2e/guided-first-use.spec.ts (22 tests, Chromium and Firefox), recorded after this exception | yes | - |
| EX-06 | 2026-10-24T06:17:24Z | T019 | VO-004, VO-025, VO-028 | other | US1 test and code were written in an earlier session before a failing-first run was recorded for this obligation; no meaningful red can be recorded now without backing out shipped code | Green e2e run #46 of e2e/guided-first-use.spec.ts (22 tests, Chromium and Firefox), recorded after this exception | yes | - |
| EX-07 | 2026-10-24T06:17:24Z | T020 | VO-003, VO-041, VO-043 | other | US1 test and code were written in an earlier session before a failing-first run was recorded for this obligation; no meaningful red can be recorded now without backing out shipped code | Green e2e run #46 of e2e/guided-first-use.spec.ts (22 tests, Chromium and Firefox), recorded after this exception | yes | - |
| EX-08 | 2026-10-24T14:24:10Z | T058 | VO-037 | behaviour-preserving | VO-037 asserts existing functions work as before, so there is no new behaviour to see fail first | the full existing suites: e2e-all checkpoint #107 (1353 passed), typecheck #102, lint #103, unit-all #104 | no | - |

## Expectation changes

| ID | Time | Task | Files | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|-------|--------------|---------------|------------------|-------------|-----------------|
| XC-01 | 2026-10-24T06:29:51Z | T025 | e2e/selection-panel.spec.ts | FR-012, FR-016 | Test mechanics only: read aria-pressed from the node wrapper, and try the unavailable Reverse with the keyboard because Playwright will not click an aria-disabled button; expectations unchanged | no | - | bf0e7d |
| XC-02 | 2026-10-24T06:30:48Z | T025 | e2e/selection-panel.spec.ts | FR-012 | Test mechanics only: the canvas exposes selection as aria-current (as selection-feedback.spec reads it), not aria-pressed; expectation unchanged | no | - | ebf01b |
| XC-03 | 2026-10-24T06:42:33Z | T025 | e2e/controls.spec.ts, e2e/keyboard-only.spec.ts, e2e/support/controlInventory.ts | FR-014, FR-016 | Spec 008 FR-014 replaces always-shown panel controls that explained a missing selection with controls offered only when they apply; Change end… is renamed Change endpoints per the UI contract; a two-way relationship's Reverse is disabled with its reason instead of refused on click. Control inventories updated to match | yes | - | 0aae2f |
| XC-04 | 2026-10-24T06:48:53Z | T034 | e2e/preview-round-trip.spec.ts | FR-022 | Test mechanics only: compare node canvas transforms instead of screen boxes, since opening the preview scrolls the page; expectation (layout unchanged) is the same | no | - | 910100 |
| XC-05 | 2026-10-24T08:10:09Z | T055 | e2e/per-type-preview.spec.ts | FR-023, FR-024 | Sequence and C4 layout comes from order, so the node-position note is shown for flowcharts only, keeping flowchart-layout-note.spec (VO-011 of an earlier spec) true; T050 now asserts the note is absent for sequence and C4 | yes | Lee Sinclair (session decision 2026-10-24: layout note for flowchart only) | acd16f |
| XC-06 | 2026-10-24T08:10:09Z | T055 | e2e/support/controlInventory.ts | FR-020 | Sequence and C4 editors gain the Preview as Mermaid draws it toggle (spec Clarifications 2026-10-24: preview covers all three types), so their control inventories list it | yes | - | 79e885 |
| XC-07 | 2026-10-24T08:25:38Z | T055 | e2e/preview-round-trip.spec.ts | FR-022 | Same change as XC-04: compare node canvas transforms instead of screen boxes; expectation unchanged | no | - | 910100 |
| XC-08 | 2026-10-24T08:25:38Z | T050 | e2e/per-type-preview.spec.ts | FR-023, FR-024 | Same decision as XC-05: sequence and C4 show no node-position note, so T050 asserts its absence | yes | Lee Sinclair (session decision 2026-10-24: layout note for flowchart only) | acd16f |
| XC-09 | 2026-10-24T09:24:03Z | T053 | e2e/accessible-names.spec.ts, e2e/keyboard-only.spec.ts, e2e/support/c4.ts, e2e/support/items.ts, e2e/support/sequence.ts | FR-004 | Test mechanics only: a participant or C4 item added from the toolbox now opens its label editor (FR-004), so these specs and helpers name the new item in that editor, or close it, before going on; what each test asserts is unchanged | no | - | 4426c3 |
| XC-10 | 2026-10-24T09:24:03Z | T053 | e2e/empty-state.spec.ts | FR-001, FR-002 | The sequence and C4 empty-canvas hint now names the three steps in each type's own words (1. Add a participant. / 1. Add an element.) instead of the general hint, as the spec's Clarifications 2026-10-24 settle; the test's own comment anticipated this. Also closes the label editor a new item opens (FR-004) before deleting it | yes | - | d21bd9 |

## Decisions

| ID | Opened | Question | Tasks | Status | Answer | Decided by | Resolved |
|----|--------|----------|-------|--------|--------|------------|----------|

## Behaviour items at baseline

| Item | Verified by | Fingerprint | Seq |
|------|-------------|-------------|-----|
| BI-001 | VO-001 | ab605d | 1 |
| BI-002 | VO-002 | 4d8a28 | 1 |
| BI-003 | VO-003 | 5245fe | 1 |
| BI-004 | VO-003 | 440cd2 | 1 |
| BI-005 | VO-004 | d606ef | 1 |
| BI-006 | VO-005 | 742b13 | 1 |
| BI-007 | VO-005 | be4e5d | 1 |
| BI-008 | VO-006 | 7c5a1a | 1 |
| BI-009 | VO-007 | f1421d | 1 |
| BI-010 | VO-008 | 96a420 | 1 |
| BI-011 | VO-009 | 3a1477 | 1 |
| BI-012 | VO-010 | 38d579 | 1 |
| BI-013 | VO-011 | 859db3 | 1 |
| BI-014 | VO-012 | 71867b | 1 |
| BI-015 | VO-013 | c965b9 | 1 |
| BI-016 | VO-014 | 1f9fcf | 1 |
| BI-017 | VO-015 | d745ba | 1 |
| BI-018 | VO-016 | 3b363a | 1 |
| BI-019 | VO-017 | 3b86c1 | 1 |
| BI-020 | VO-018 | ded0b2 | 1 |
| BI-021 | VO-019 | 1939b1 | 1 |
| BI-022 | VO-020 | de9608 | 1 |
| BI-023 | VO-021 | f2b316 | 1 |
| BI-024 | VO-022 | 320396 | 1 |
| BI-025 | VO-023 | 1a16ee | 1 |
| BI-026 | VO-024 | 64ffab | 1 |
| BI-027 | VO-025 | 13c6a5 | 1 |
| BI-028 | VO-026 | fd3249 | 1 |
| BI-029 | VO-027 | 46ccf5 | 1 |
| BI-030 | VO-028 | e1debe | 1 |
| BI-031 | VO-029 | 007b03 | 1 |
| BI-032 | VO-030 | 5b62ed | 1 |
| BI-033 | VO-031 | 56a286 | 1 |
| BI-034 | VO-032 | cd6097 | 1 |
| BI-035 | VO-033 | a53d52 | 1 |
| BI-036 | VO-034 | f9cae8 | 1 |
| BI-037 | VO-035 | 97a955 | 1 |
| BI-038 | VO-036 | e80903 | 1 |
| BI-039 | VO-037 | c6cfe4 | 1 |
| BI-040 | VO-038 | 10470e | 1 |
| BI-041 | VO-039 | 244a63 | 1 |
| BI-042 | VO-040 | 2d757e | 1 |
| BI-043 | VO-041 | 9dc825 | 1 |
| BI-044 | VO-042 | b3a61d | 1 |
| BI-045 | VO-042 | 08d320 | 1 |
| BI-046 | VO-042 | 96fea6 | 1 |
| BI-047 | VO-043 | 7c68fd | 1 |
| BI-048 | VO-044 | f9f3bb | 1 |
| BI-049 | VO-045 | 53d6d5 | 1 |
| BI-050 | VO-046 | fbf1ef | 1 |
| BI-051 | VO-047 | da2a91 | 1 |
| BI-052 | VO-048 | f853f3 | 1 |
| BI-053 | VO-049 | c36305 | 1 |
| BI-054 | VO-050 | 4f2365 | 1 |
| BI-055 | exemption FR-024 | c16f08 | 1 |
| BI-056 | exemption FR-038 | 233f80 | 1 |
| BI-057 | exemption FR-040 | b6bf73 | 1 |
| BI-058 | VO-051 | c79550 | 19 |
| BI-059 | VO-052 | 4fe964 | 19 |

## Behaviour item changes

| ID | Time | Item | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|--------------|---------------|------------------|-------------|-----------------|
