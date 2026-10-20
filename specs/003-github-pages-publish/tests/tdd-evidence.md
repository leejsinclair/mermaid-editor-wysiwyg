# TDD Evidence: 003-github-pages-publish

<!-- Written by tdd_check.py. Do not edit by hand: use the script's subcommands. -->

## Summary

_Generated from the tables below on 2026-10-19T21:18:04Z._

| Obligation | Requirements | Status | Tests | Latest result |
|------------|--------------|--------|-------|---------------|
| VO-001 | FR-015, US1-AS3, EC-02 | verified | hash-addresses --project=chromium, hash-addresses, flowchart-add, open-file | pass (#32) |
| VO-002 | FR-004, FR-005, FR-014, US1-AS1, US1-AS3, EC-01, DC-01 | verified | published-build | pass (#33) |
| VO-003 | FR-002, FR-012, FR-003 | verified | static-offline | pass (#34) |
| VO-004 | FR-003, FR-004, US1-AS2, DC-02 | verified | flowchart-add, open-file | pass (#18) |
| VO-005 | FR-006, FR-008, FR-009, US2-AS3, US3-AS1 | verified | publish-triggers | pass (#47) |
| VO-006 | FR-007, US2-AS2, DC-03 | verified | publish-gate | pass (#38) |
| VO-007 | FR-010, EC-06 | verified | publish-supersede | pass (#40) |
| VO-008 | FR-011, EC-07 | verified | publish-fail-visible | pass (#42) |
| VO-009 | FR-013, US3-AS2 | verified | readme | pass (#48) |

| Behaviour item | Scenario | Obligations | Status | Tests |
|----------------|----------|-------------|--------|-------|
| BI-001 | US1-AS1 | VO-002, exemption FR-001 | verified | published-build |
| BI-002 | US1-AS2 | VO-003, VO-004, MV-005 | verified | static-offline, flowchart-add, open-file |
| BI-003 | US1-AS3 | VO-001, VO-002 | verified | hash-addresses --project=chromium, hash-addresses, flowchart-add, open-file, published-build |
| BI-004 | US2-AS1 | exemption US2-AS1, VO-005 | verified | publish-triggers |
| BI-005 | US2-AS2 | VO-006, VO-008, MV-003 | verified | publish-gate, publish-fail-visible |
| BI-006 | US2-AS3 | VO-005 | verified | publish-triggers |
| BI-007 | US3-AS1 | VO-005, MV-004 | verified | publish-triggers |
| BI-008 | US3-AS2 | VO-009 | verified | readme |
| BI-009 | - | VO-003 | verified | static-offline |
| BI-010 | - | VO-007 | verified | publish-supersede |
| BI-011 | - | VO-008, MV-004 | verified | publish-fail-visible |
| BI-012 | - | VO-002 | verified | published-build |
| BI-013 | - | exemption EC-03 | exempt | - |
| BI-014 | - | exemption EC-04 | exempt | - |
| BI-015 | - | exemption EC-05 | exempt | - |
| BI-016 | - | exemption EC-08 | exempt | - |

Not verified by tests

- MV-001 manual: open
- MV-002 manual: open
- MV-003 manual: open
- MV-004 manual: open
- MV-005 manual: open

Counts: verified 9, deferred 0, manual checks 5 open

**Not verified**: FR-001 (exempt: see plan), US2-AS1 (exempt: see plan), EC-03 (exempt: see plan), EC-04 (exempt: see plan), EC-05 (exempt: see plan), EC-08 (exempt: see plan).

**Open decisions**: none. **Exceptions**: none. **Expectation changes**: XC-01 on T007 for FR-015; XC-02 on T008 for FR-015; XC-03 on T009 for FR-015; XC-04 on T011 for FR-015; XC-05 on T012 for FR-015; XC-06 on T013 for FR-015; XC-07 on T010 for FR-014; XC-08 on T013 for FR-014; XC-09 on T004 for FR-015, alters behaviour (approved by Lee Sinclair); XC-10 on T007 for FR-015; XC-11 on T008 for FR-015; XC-12 on T009 for FR-015; XC-13 on T011 for FR-015; XC-14 on T012 for FR-015; XC-15 on T013 for FR-015; XC-16 on T010 for FR-014; XC-17 on T010 for FR-002; XC-18 on T013 for FR-014; XC-19 on T013 for FR-002; XC-20 on T017 for FR-006; XC-21 on T017 for FR-006.

**Item changes**: none.

**Pre-existing failures**: #2 e2e-all: T002 e2e baseline; Pre-existing: e2e/performance.spec.ts flowchart 100 elements timed out (30s) at baseline under parallel load; it passes in isolation per feature 002. Excluded from the publish gate (FR-007)..

## Baseline

| Seq | Command | Result | Pre-existing failures |
|-----|---------|--------|-----------------------|
| 1 | unit-all | pass | - |
| 2 | e2e-all | fail | T002 e2e baseline; Pre-existing: e2e/performance.spec.ts flowchart 100 elements timed out (30s) at baseline under parallel load; it passes in isolation per feature 002. Excluded from the publish gate (FR-007). |

## Test execution records

| Seq | Time | Task | Obligations | Phase | Command | Selector | Result | Valid | Classification | Files | Fingerprint | Note | Check |
|-----|------|------|-------------|-------|---------|----------|--------|-------|----------------|-------|-------------|------|-------|
| 1 | 2026-10-19T10:04:59Z | - | - | baseline | unit-all | - | pass | yes | - | - | - | T002 unit baseline | abd40d |
| 2 | 2026-10-19T10:08:48Z | - | - | baseline | e2e-all | - | fail | yes | unreliable | - | - | T002 e2e baseline; Pre-existing: e2e/performance.spec.ts flowchart 100 elements timed out (30s) at baseline under parallel load; it passes in isolation per feature 002. Excluded from the publish gate (FR-007). | 7ea42d |
| 3 | 2026-10-19T10:09:32Z | T003 | VO-001 | red | e2e | hash-addresses --project=chromium | fail | no | environment | e2e/hash-addresses.spec.ts | c43d7f | failed for a different reason; Selector with a space was passed as one argument, so Playwright found no tests; rerun with a single selector (#4). | d3bc54 |
| 4 | 2026-10-19T10:10:25Z | T003 | VO-001 | red | e2e | hash-addresses | fail | yes | assertion | e2e/hash-addresses.spec.ts | c43d7f | expected: Diagram canvas | 016f5c |
| 5 | 2026-10-19T10:11:51Z | T004 | VO-004 | red | e2e | flowchart-add | fail | yes | assertion | e2e/accessible-names.spec.ts, e2e/announcements.spec.ts, e2e/c4-delete.spec.ts, e2e/c4-kind-picker.spec.ts, e2e/c4-move-to.spec.ts, e2e/c4-title.spec.ts, e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/copy-failure.spec.ts, e2e/copy-markdown.spec.ts, e2e/copy-source.spec.ts, e2e/delete-diagram.spec.ts, e2e/empty-state.spec.ts, e2e/flowchart-add.spec.ts, e2e/flowchart-connect.spec.ts, e2e/flowchart-drag-cancel.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/flowchart-move.spec.ts, e2e/flowchart-preview.spec.ts, e2e/flowchart-toolbox.spec.ts, e2e/gestures.spec.ts, e2e/keyboard-only.spec.ts, e2e/labels-special.spec.ts, e2e/leave-page.spec.ts, e2e/lock-release.spec.ts, e2e/new-diagram.spec.ts, e2e/node-arrow-move.spec.ts, e2e/not-offered.spec.ts, e2e/open-file.spec.ts, e2e/open-invalid-file.spec.ts, e2e/performance.spec.ts, e2e/rejections.spec.ts, e2e/reopen.spec.ts, e2e/return-to-start.spec.ts, e2e/save-file.spec.ts, e2e/save-status.spec.ts, e2e/saved-list.spec.ts, e2e/selection-feedback.spec.ts, e2e/sequence-reorder.spec.ts, e2e/sequence-toolbox.spec.ts, e2e/start-screen.spec.ts, e2e/storage-failure.spec.ts, e2e/support/c4.ts, e2e/two-tabs.spec.ts, e2e/undo-redo.spec.ts, e2e/unreadable-record.spec.ts, e2e/unsaved-new.spec.ts, e2e/untrusted-text.spec.ts, e2e/wcag.spec.ts, e2e/zoom-pan.spec.ts | 47e3a4 | expected: Diamond | a79065 |
| 6 | 2026-10-19T10:27:08Z | T005 | VO-003 | red | e2e | static-offline | fail | no | environment | e2e/static-offline.spec.ts | 2976a1 | timed out; Plain vite build with the React Router plugin does not exit, so the run timed out; the test now builds with npm run build (#7). | bcea94 |
| 7 | 2026-10-19T10:29:47Z | T005 | VO-003 | red | e2e | static-offline | fail | yes | assertion | e2e/static-offline.spec.ts | 758fbf | expected: toHaveURL | 5750ea |
| 8 | 2026-10-19T10:30:12Z | T006 | VO-002 | red | e2e | published-build | fail | yes | assertion | e2e/published-build.spec.ts | 754ad9 | expected: New diagram | d25741 |
| 9 | 2026-10-19T10:31:43Z | T007 | VO-001 | green | e2e | hash-addresses | fail | no | assertion | e2e/hash-addresses.spec.ts | c43d7f | New-tab test left the first tab open, so the one-editing-tab lock (feature 002 FR-050) showed the start screen; the test now closes the first tab, as lock-release does (#10). | 134cde |
| 10 | 2026-10-19T10:32:05Z | T007 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | 4d15ab |
| 11 | 2026-10-19T10:32:23Z | T008 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | 0a6dbd |
| 12 | 2026-10-19T10:32:29Z | T009 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | 550965 |
| 13 | 2026-10-19T10:32:34Z | T011 | VO-001, VO-004 | green | e2e | flowchart-add | pass | yes | - | e2e/flowchart-add.spec.ts | 34405b | - | 9ea83e |
| 14 | 2026-10-19T10:32:38Z | T012 | VO-001, VO-004 | green | e2e | open-file | pass | yes | - | e2e/open-file.spec.ts | a8e74e | - | 3318c7 |
| 15 | 2026-10-19T10:33:00Z | T010 | VO-002 | green | e2e | published-build | fail | no | assertion | e2e/published-build.spec.ts | 754ad9 | Same cause as #9 in published-build: the first tab still held the lock; the test now closes it (#16). | afdc42 |
| 16 | 2026-10-19T10:33:12Z | T010 | VO-002 | green | e2e | published-build | pass | yes | - | e2e/published-build.spec.ts | 9ec03e | - | dd658c |
| 17 | 2026-10-19T10:33:27Z | T010 | VO-003 | green | e2e | static-offline | pass | yes | - | e2e/static-offline.spec.ts | 758fbf | - | ccc54d |
| 18 | 2026-10-19T10:33:40Z | T013 | VO-004 | green | unit-all | - | pass | yes | - | e2e/accessible-names.spec.ts, e2e/announcements.spec.ts, e2e/c4-delete.spec.ts, e2e/c4-kind-picker.spec.ts, e2e/c4-move-to.spec.ts, e2e/c4-title.spec.ts, e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/copy-failure.spec.ts, e2e/copy-markdown.spec.ts, e2e/copy-source.spec.ts, e2e/delete-diagram.spec.ts, e2e/empty-state.spec.ts, e2e/flowchart-add.spec.ts, e2e/flowchart-connect.spec.ts, e2e/flowchart-drag-cancel.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/flowchart-move.spec.ts, e2e/flowchart-preview.spec.ts, e2e/flowchart-toolbox.spec.ts, e2e/gestures.spec.ts, e2e/keyboard-only.spec.ts, e2e/labels-special.spec.ts, e2e/leave-page.spec.ts, e2e/lock-release.spec.ts, e2e/new-diagram.spec.ts, e2e/node-arrow-move.spec.ts, e2e/not-offered.spec.ts, e2e/open-file.spec.ts, e2e/open-invalid-file.spec.ts, e2e/performance.spec.ts, e2e/rejections.spec.ts, e2e/reopen.spec.ts, e2e/return-to-start.spec.ts, e2e/save-file.spec.ts, e2e/save-status.spec.ts, e2e/saved-list.spec.ts, e2e/selection-feedback.spec.ts, e2e/sequence-reorder.spec.ts, e2e/sequence-toolbox.spec.ts, e2e/start-screen.spec.ts, e2e/storage-failure.spec.ts, e2e/support/c4.ts, e2e/two-tabs.spec.ts, e2e/undo-redo.spec.ts, e2e/unreadable-record.spec.ts, e2e/unsaved-new.spec.ts, e2e/untrusted-text.spec.ts, e2e/wcag.spec.ts, e2e/zoom-pan.spec.ts | 47e3a4 | - | 41f0d1 |
| 19 | 2026-10-19T10:37:10Z | - | - | checkpoint | e2e-all | - | fail | no | unreliable | - | - | saved-list 'moves to the top' (Firefox) raced the editor's delayed move to the saved address after the first save; fixed by waiting for the saved address before leaving (same wait added to open-file). | d58d6f |
| 20 | 2026-10-19T10:45:06Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | c056dc |
| 21 | 2026-10-19T10:45:41Z | T007 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | d5c596 |
| 22 | 2026-10-19T10:45:47Z | T008 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | f0dcec |
| 23 | 2026-10-19T10:45:53Z | T009 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | bedfdd |
| 24 | 2026-10-19T10:46:00Z | T011 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | 556b1e |
| 25 | 2026-10-19T10:46:06Z | T012 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | 1fd0a3 |
| 26 | 2026-10-19T10:46:12Z | T013 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | a147dd | - | 7dde87 |
| 27 | 2026-10-19T11:00:01Z | T007 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | 50f9e1 | - | 4f76d8 |
| 28 | 2026-10-19T11:00:07Z | T008 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | 50f9e1 | - | 84db55 |
| 29 | 2026-10-19T11:00:14Z | T009 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | 50f9e1 | - | a02450 |
| 30 | 2026-10-19T11:00:20Z | T011 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | 50f9e1 | - | aa7363 |
| 31 | 2026-10-19T11:00:26Z | T012 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | 50f9e1 | - | 5770a1 |
| 32 | 2026-10-19T11:00:32Z | T013 | VO-001 | green | e2e | hash-addresses | pass | yes | - | e2e/hash-addresses.spec.ts | 50f9e1 | - | 46c2eb |
| 33 | 2026-10-19T11:00:37Z | T010 | VO-002 | green | e2e | published-build | pass | yes | - | e2e/published-build.spec.ts | 192626 | - | d49ad9 |
| 34 | 2026-10-19T11:00:43Z | T010 | VO-003 | green | e2e | static-offline | pass | yes | - | e2e/static-offline.spec.ts | 2976a1 | - | 79b4aa |
| 35 | 2026-10-19T11:01:39Z | T016 | VO-005 | red | e2e | publish-triggers | fail | yes | assertion | e2e/publish-triggers.spec.ts, e2e/support/workflow.ts | 0f0ca6 | expected: pages.yml | e38a66 |
| 36 | 2026-10-19T11:01:46Z | T017 | VO-005 | green | e2e | publish-triggers | pass | yes | - | e2e/publish-triggers.spec.ts, e2e/support/workflow.ts | 0f0ca6 | - | 0e990e |
| 37 | 2026-10-19T11:01:56Z | T018 | VO-006 | red | e2e | publish-gate | fail | yes | assertion | e2e/publish-gate.spec.ts | 85e2b1 | expected: needs | 2a6798 |
| 38 | 2026-10-19T11:02:05Z | T019 | VO-006 | green | e2e | publish-gate | pass | yes | - | e2e/publish-gate.spec.ts | 85e2b1 | - | 7dcc1a |
| 39 | 2026-10-19T11:02:19Z | T020 | VO-007 | red | e2e | publish-supersede | fail | yes | assertion | e2e/publish-supersede.spec.ts | 813738 | expected: concurrency | 7b4821 |
| 40 | 2026-10-19T11:02:20Z | T021 | VO-007 | green | e2e | publish-supersede | pass | yes | - | e2e/publish-supersede.spec.ts | 813738 | - | f670dd |
| 41 | 2026-10-19T11:02:36Z | T022 | VO-008 | red | e2e | publish-fail-visible | fail | yes | assertion | e2e/publish-fail-visible.spec.ts | 96b81f | expected: configure-pages | ba7182 |
| 42 | 2026-10-19T11:02:49Z | T023 | VO-008 | green | e2e | publish-fail-visible | pass | yes | - | e2e/publish-fail-visible.spec.ts | 96b81f | - | 7b3f64 |
| 43 | 2026-10-19T11:03:28Z | T025 | VO-009 | red | e2e | readme | fail | yes | assertion | e2e/readme.spec.ts | cea4db | expected: README.md | 2a0da5 |
| 44 | 2026-10-19T11:03:39Z | T026 | VO-009 | green | e2e | readme | pass | yes | - | e2e/readme.spec.ts | cea4db | - | 03fbc8 |
| 45 | 2026-10-19T11:04:21Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | d8d5d2 |
| 46 | 2026-10-19T11:07:46Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | dac0c6 |
| 47 | 2026-10-19T11:08:18Z | T017 | VO-005 | green | e2e | publish-triggers | pass | yes | - | e2e/publish-triggers.spec.ts, e2e/support/workflow.ts | 915bd9 | - | 6a682e |
| 48 | 2026-10-19T21:18:04Z | T026 | VO-009 | green | e2e | readme | pass | yes | - | e2e/readme.spec.ts | cea4db | - | 7b4f2c |

## Exceptions

| ID | Time | Task | Obligations | Kind | Rationale | Alternative verification | Needs approval | Approved by |
|----|------|------|-------------|------|-----------|--------------------------|----------------|-------------|

## Expectation changes

| ID | Time | Task | Files | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|-------|--------------|---------------|------------------|-------------|-----------------|
| XC-01 | 2026-10-19T10:45:22Z | T007 | e2e/hash-addresses.spec.ts | FR-015 | Correction: the new-tab test closes the first tab before opening the saved address, because one tab edits a diagram at a time (feature 002 FR-050). No assertion about addresses changed. | no | - | a147dd |
| XC-02 | 2026-10-19T10:45:22Z | T008 | e2e/hash-addresses.spec.ts | FR-015 | Correction: the new-tab test closes the first tab before opening the saved address, because one tab edits a diagram at a time (feature 002 FR-050). No assertion about addresses changed. | no | - | a147dd |
| XC-03 | 2026-10-19T10:45:22Z | T009 | e2e/hash-addresses.spec.ts | FR-015 | Correction: the new-tab test closes the first tab before opening the saved address, because one tab edits a diagram at a time (feature 002 FR-050). No assertion about addresses changed. | no | - | a147dd |
| XC-04 | 2026-10-19T10:45:22Z | T011 | e2e/hash-addresses.spec.ts | FR-015 | Correction: the new-tab test closes the first tab before opening the saved address, because one tab edits a diagram at a time (feature 002 FR-050). No assertion about addresses changed. | no | - | a147dd |
| XC-05 | 2026-10-19T10:45:22Z | T012 | e2e/hash-addresses.spec.ts | FR-015 | Correction: the new-tab test closes the first tab before opening the saved address, because one tab edits a diagram at a time (feature 002 FR-050). No assertion about addresses changed. | no | - | a147dd |
| XC-06 | 2026-10-19T10:45:22Z | T013 | e2e/hash-addresses.spec.ts | FR-015 | Correction: the new-tab test closes the first tab before opening the saved address, because one tab edits a diagram at a time (feature 002 FR-050). No assertion about addresses changed. | no | - | a147dd |
| XC-07 | 2026-10-19T10:45:23Z | T010 | e2e/published-build.spec.ts | FR-014 | Correction: the new-tab step closes the first tab before opening the saved address (one editing tab per diagram, feature 002 FR-050), and the second tab's requests and console are also checked. No assertion was weakened. | no | - | 9ec03e |
| XC-08 | 2026-10-19T10:45:23Z | T013 | e2e/published-build.spec.ts | FR-014 | Correction: the new-tab step closes the first tab before opening the saved address (one editing tab per diagram, feature 002 FR-050), and the second tab's requests and console are also checked. No assertion was weakened. | no | - | 9ec03e |
| XC-09 | 2026-10-19T10:46:18Z | T004 | e2e/accessible-names.spec.ts, e2e/announcements.spec.ts, e2e/c4-delete.spec.ts, e2e/c4-kind-picker.spec.ts, e2e/c4-move-to.spec.ts, e2e/c4-title.spec.ts, e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/copy-failure.spec.ts, e2e/copy-markdown.spec.ts, e2e/copy-source.spec.ts, e2e/delete-diagram.spec.ts, e2e/empty-state.spec.ts, e2e/flowchart-add.spec.ts, e2e/flowchart-connect.spec.ts, e2e/flowchart-drag-cancel.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/flowchart-move.spec.ts, e2e/flowchart-preview.spec.ts, e2e/flowchart-toolbox.spec.ts, e2e/gestures.spec.ts, e2e/keyboard-only.spec.ts, e2e/labels-special.spec.ts, e2e/leave-page.spec.ts, e2e/lock-release.spec.ts, e2e/new-diagram.spec.ts, e2e/node-arrow-move.spec.ts, e2e/not-offered.spec.ts, e2e/open-file.spec.ts, e2e/open-invalid-file.spec.ts, e2e/performance.spec.ts, e2e/rejections.spec.ts, e2e/reopen.spec.ts, e2e/return-to-start.spec.ts, e2e/save-file.spec.ts, e2e/save-status.spec.ts, e2e/saved-list.spec.ts, e2e/selection-feedback.spec.ts, e2e/sequence-reorder.spec.ts, e2e/sequence-toolbox.spec.ts, e2e/start-screen.spec.ts, e2e/storage-failure.spec.ts, e2e/support/c4.ts, e2e/two-tabs.spec.ts, e2e/undo-redo.spec.ts, e2e/unreadable-record.spec.ts, e2e/unsaved-new.spec.ts, e2e/untrusted-text.spec.ts, e2e/wcag.spec.ts, e2e/zoom-pan.spec.ts | FR-015 | In-app addresses move from path style (/d/abc) to hash style (#/d/abc) as FR-015 requires; every e2e spec's goto, URL assertion and href assertion was rewritten to the new style, a reload follows a second goto on a page, and saved-list and open-file wait for the saved address before leaving it. No assertion about editor behaviour was changed. | yes | Lee Sinclair | e13b58 |
| XC-10 | 2026-10-19T11:00:51Z | T007 | e2e/hash-addresses.spec.ts | FR-015 | Correction: a lint rule required an imported type instead of an inline import() annotation; no assertion changed. | no | - | 50f9e1 |
| XC-11 | 2026-10-19T11:00:51Z | T008 | e2e/hash-addresses.spec.ts | FR-015 | Correction: a lint rule required an imported type instead of an inline import() annotation; no assertion changed. | no | - | 50f9e1 |
| XC-12 | 2026-10-19T11:00:52Z | T009 | e2e/hash-addresses.spec.ts | FR-015 | Correction: a lint rule required an imported type instead of an inline import() annotation; no assertion changed. | no | - | 50f9e1 |
| XC-13 | 2026-10-19T11:00:52Z | T011 | e2e/hash-addresses.spec.ts | FR-015 | Correction: a lint rule required an imported type instead of an inline import() annotation; no assertion changed. | no | - | 50f9e1 |
| XC-14 | 2026-10-19T11:00:52Z | T012 | e2e/hash-addresses.spec.ts | FR-015 | Correction: a lint rule required an imported type instead of an inline import() annotation; no assertion changed. | no | - | 50f9e1 |
| XC-15 | 2026-10-19T11:00:52Z | T013 | e2e/hash-addresses.spec.ts | FR-015 | Correction: a lint rule required an imported type instead of an inline import() annotation; no assertion changed. | no | - | 50f9e1 |
| XC-16 | 2026-10-19T11:00:52Z | T010 | e2e/published-build.spec.ts | FR-014 | Correction: the build is started with Node and Vite's script instead of the npm program, as the lint rule on PATH lookups requires; no assertion changed. | no | - | 192626 |
| XC-17 | 2026-10-19T11:00:52Z | T010 | e2e/static-offline.spec.ts | FR-002 | Correction: the build is started with Node and Vite's script instead of the npm program (lint rule on PATH lookups); no assertion changed. | no | - | 2976a1 |
| XC-18 | 2026-10-19T11:00:52Z | T013 | e2e/published-build.spec.ts | FR-014 | Correction: the build is started with Node and Vite's script instead of the npm program, as the lint rule on PATH lookups requires; no assertion changed. | no | - | 192626 |
| XC-19 | 2026-10-19T11:00:52Z | T013 | e2e/static-offline.spec.ts | FR-002 | Correction: the build is started with Node and Vite's script instead of the npm program (lint rule on PATH lookups); no assertion changed. | no | - | 2976a1 |
| XC-20 | 2026-10-19T11:08:18Z | T017 | e2e/publish-triggers.spec.ts | FR-006 | Correction: the sort of trigger names takes a compare function, as the lint rule requires; no assertion changed. | no | - | 64ad08 |
| XC-21 | 2026-10-19T11:08:28Z | T017 | e2e/publish-triggers.spec.ts, e2e/support/workflow.ts | FR-006 | Correction: the sort of trigger names takes a compare function, as the lint rule requires; no assertion changed. | no | - | 915bd9 |

## Decisions

| ID | Opened | Question | Tasks | Status | Answer | Decided by | Resolved |
|----|--------|----------|-------|--------|--------|------------|----------|

## Behaviour items at baseline

| Item | Verified by | Fingerprint | Seq |
|------|-------------|-------------|-----|
| BI-001 | VO-002, exemption FR-001 | da9fbc | 1 |
| BI-002 | VO-003, VO-004, MV-005 | 599c6b | 1 |
| BI-003 | VO-001, VO-002 | 1d5288 | 1 |
| BI-004 | exemption US2-AS1, VO-005 | 353cba | 1 |
| BI-005 | VO-006, VO-008, MV-003 | 5d93a2 | 1 |
| BI-006 | VO-005 | 417e01 | 1 |
| BI-007 | VO-005, MV-004 | cb3120 | 1 |
| BI-008 | VO-009 | 44abb2 | 1 |
| BI-009 | VO-003 | 570c1d | 1 |
| BI-010 | VO-007 | 038845 | 1 |
| BI-011 | VO-008, MV-004 | 9ce224 | 1 |
| BI-012 | VO-002 | ff6be7 | 1 |
| BI-013 | exemption EC-03 | cf061e | 1 |
| BI-014 | exemption EC-04 | a2375c | 1 |
| BI-015 | exemption EC-05 | 81655e | 1 |
| BI-016 | exemption EC-08 | 34d071 | 1 |

## Behaviour item changes

| ID | Time | Item | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|--------------|---------------|------------------|-------------|-----------------|
