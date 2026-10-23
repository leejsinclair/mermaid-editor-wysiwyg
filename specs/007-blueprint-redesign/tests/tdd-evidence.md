# TDD Evidence: 007-blueprint-redesign

<!-- Written by tdd_check.py. Do not edit by hand: use the script's subcommands. -->

## Summary

_Generated from the tables below on 2026-10-22T21:21:04Z._

| Obligation | Requirements | Status | Tests | Latest result |
|------------|--------------|--------|-------|---------------|
| VO-001 | FR-001, FR-002 | verified | app/rendering/theme/tokens.test.ts | pass (#10) |
| VO-002 | FR-001, SC-004 | verified | app/rendering/theme/noColourLiterals.test.ts | pass (#148) |
| VO-003 | FR-002, FR-004, FR-020, EC-08, EC-09 | verified | app/rendering/theme/contrast.test.ts, app/rendering/theme | pass (#14) |
| VO-004 | FR-020, SC-003, EC-07, EC-08, EC-09, EC-11 | verified | e2e/wcag.spec.ts e2e/canvas-wcag.spec.ts e2e/import-wcag.spec.ts, e2e/(wcag canvas-wcag import-wcag)\.spec\.ts, e2e/wcag\.spec\.ts | pass (#153) |
| VO-005 | FR-003, FR-025, SC-008 | verified | e2e/fonts-network.spec.ts | pass (#45) |
| VO-006 | FR-018, US3-AS3, EC-06 | verified | app/rendering/shared/sourceStatus.test.ts | pass (#81) |
| VO-007 | FR-018, FR-004, US3-AS3 | verified | e2e/source-status.spec.ts | pass (#84) |
| VO-008 | US1-AS1 | verified | e2e/appearance-start.spec.ts | pass (#18) |
| VO-009 | FR-005, FR-006, US1-AS2 | verified | e2e/workspace-header.spec.ts | pass (#22) |
| VO-010 | FR-009, FR-023, US1-AS3 | verified | e2e/workspace-controls.spec.ts | pass (#107) |
| VO-011 | FR-026, US1-AS4 | verified | e2e/appearance-switch.spec.ts | pass (#28) |
| VO-012 | FR-021, FR-022, US1-AS5, EC-10 | verified | e2e/interaction-states.spec.ts | pass (#43) |
| VO-013 | FR-026 | verified | app/persistence/appearance.test.ts | pass (#16) |
| VO-014 | FR-026 | verified | e2e/appearance-persistence.spec.ts | pass (#30) |
| VO-015 | FR-011, EC-04 | verified | app/rendering/shared/grid.test.ts | pass (#52) |
| VO-016 | FR-011, US2-AS1 | verified | e2e/grid.spec.ts | pass (#55) |
| VO-017 | FR-013, US2-AS2, EC-04, EC-05, SC-006 | verified | e2e/grid-alignment.spec.ts | pass (#67) |
| VO-018 | FR-012, US2-AS3 | verified | e2e/grid-hit.spec.ts | pass (#62) |
| VO-019 | FR-015, US2-AS4, EC-07 | verified | e2e/selection-style.spec.ts | pass (#48) |
| VO-020 | FR-015, US2-AS5 | verified | e2e/connection-style.spec.ts | pass (#65) |
| VO-021 | FR-016, FR-023, FR-024, SC-001, SC-007 | verified | e2e/ | pass (#158) |
| VO-022 | FR-017, US3-AS1 | verified | app/rendering/shared/highlight.test.ts | pass (#74) |
| VO-023 | FR-017, US3-AS1 | verified | e2e/source-highlight.spec.ts | pass (#77) |
| VO-024 | US3-AS2 | verified | e2e/source-follows.spec.ts, e2e/source-follows | pass (#156) |
| VO-025 | FR-019 | verified | app/rendering/shared/mermaidRuntime.test.ts, app/importing, app/editor | pass (#91) |
| VO-026 | FR-019, US4-AS1 | verified | e2e/mermaid-look.spec.ts | pass (#93) |
| VO-027 | FR-019, US4-AS2 | verified | e2e/mermaid-look-switch.spec.ts | pass (#95) |
| VO-028 | FR-019, US4-AS3 | verified | e2e/mermaid-style-wins.spec.ts | pass (#119) |
| VO-029 | FR-019, FR-024, US4-AS4 | verified | e2e/output-identity.spec.ts | pass (#97) |
| VO-030 | FR-007 | verified | e2e/workspace-tools.spec.ts | pass (#36) |
| VO-031 | FR-008 | verified | e2e/status-bar.spec.ts | pass (#38) |
| VO-032 | FR-010 | verified | app/rendering/shared/layout.test.ts | pass (#100) |
| VO-033 | FR-010, US5-AS1 | verified | e2e/narrow-layout.spec.ts | pass (#104) |
| VO-034 | US5-AS2 | verified | e2e/narrow-panel-keeps.spec.ts | pass (#106) |
| VO-035 | FR-010, US5-AS3, SC-005 | verified | e2e/narrow-controls.spec.ts | pass (#111) |
| VO-036 | FR-027, US5-AS4, SC-009 | verified | e2e/touch/flowchart.spec.ts | pass (#128) |
| VO-037 | FR-027, US5-AS4, SC-009 | deferred | e2e/touch/sequence-c4.spec.ts | fail (#130) |
| VO-038 | FR-027, US5-AS4, SC-009 | deferred | e2e/touch/files-copy.spec.ts, e2e/touch/files-copy.spec.ts --project=mobile-android | fail (#140) |
| VO-039 | FR-027 | deferred | e2e/touch/targets.spec.ts | fail (#144) |
| VO-040 | FR-028 | verified | app/rendering/shared/pinch.test.ts | pass (#102) |
| VO-041 | FR-028, SC-009 | verified | e2e/touch/gestures.spec.ts | pass (#114) |
| VO-042 | FR-026 | verified | e2e/appearance-notice.spec.ts | pass (#34) |
| VO-043 | FR-028 | verified | e2e/touch/second-finger.spec.ts | pass (#116) |
| VO-044 | SC-002, FR-024, US4-AS4 | verified | app/generation/redesign-output.test.ts | pass (#160) |
| VO-045 | SC-007, EC-01 | verified | e2e/redesign-performance.spec.ts, app/editor/reducerSelect.test.ts, e2e/, redesign-performance | pass (#163) |

| Behaviour item | Scenario | Obligations | Status | Tests |
|----------------|----------|-------------|--------|-------|
| BI-001 | US1-AS1 | VO-008, MV-003 | verified | e2e/appearance-start.spec.ts |
| BI-002 | US1-AS2 | VO-009 | verified | e2e/workspace-header.spec.ts |
| BI-003 | US1-AS3 | VO-010 | verified | e2e/workspace-controls.spec.ts |
| BI-004 | US1-AS4 | VO-011 | verified | e2e/appearance-switch.spec.ts |
| BI-005 | US1-AS5 | VO-012, VO-003 | verified | e2e/interaction-states.spec.ts, app/rendering/theme/contrast.test.ts, app/rendering/theme |
| BI-006 | US2-AS1 | VO-015, VO-016, MV-001 | verified | app/rendering/shared/grid.test.ts, e2e/grid.spec.ts |
| BI-007 | US2-AS2 | VO-017, VO-015 | verified | e2e/grid-alignment.spec.ts, app/rendering/shared/grid.test.ts |
| BI-008 | US2-AS3 | VO-018, VO-021 | verified | e2e/grid-hit.spec.ts, e2e/ |
| BI-009 | US2-AS4 | VO-019 | verified | e2e/selection-style.spec.ts |
| BI-010 | US2-AS5 | VO-020 | verified | e2e/connection-style.spec.ts |
| BI-011 | US3-AS1 | VO-022, VO-023 | verified | app/rendering/shared/highlight.test.ts, e2e/source-highlight.spec.ts |
| BI-012 | US3-AS2 | VO-024 | verified | e2e/source-follows.spec.ts, e2e/source-follows |
| BI-013 | US3-AS3 | VO-006, VO-007 | verified | app/rendering/shared/sourceStatus.test.ts, e2e/source-status.spec.ts |
| BI-014 | US4-AS1 | VO-025, VO-026 | verified | app/rendering/shared/mermaidRuntime.test.ts, app/importing, app/editor, e2e/mermaid-look.spec.ts |
| BI-015 | US4-AS2 | VO-027 | verified | e2e/mermaid-look-switch.spec.ts |
| BI-016 | US4-AS3 | VO-028 | verified | e2e/mermaid-style-wins.spec.ts |
| BI-017 | US4-AS4 | VO-029, VO-021 | verified | e2e/output-identity.spec.ts, e2e/ |
| BI-018 | US5-AS1 | VO-032, VO-033 | verified | app/rendering/shared/layout.test.ts, e2e/narrow-layout.spec.ts |
| BI-019 | US5-AS2 | VO-034 | verified | e2e/narrow-panel-keeps.spec.ts |
| BI-020 | US5-AS3 | VO-035 | verified | e2e/narrow-controls.spec.ts |
| BI-021 | US5-AS4 | VO-036, VO-037, VO-038, VO-039 | in progress | e2e/touch/flowchart.spec.ts, e2e/touch/sequence-c4.spec.ts, e2e/touch/files-copy.spec.ts, e2e/touch/files-copy.spec.ts --project=mobile-android, e2e/touch/targets.spec.ts |
| BI-022 | - | VO-001 | verified | app/rendering/theme/tokens.test.ts |
| BI-023 | - | VO-002 | verified | app/rendering/theme/noColourLiterals.test.ts |
| BI-024 | - | VO-003, VO-004 | verified | app/rendering/theme/contrast.test.ts, app/rendering/theme, e2e/wcag.spec.ts e2e/canvas-wcag.spec.ts e2e/import-wcag.spec.ts, e2e/(wcag canvas-wcag import-wcag)\.spec\.ts, e2e/wcag\.spec\.ts |
| BI-025 | - | VO-005, MV-002 | verified | e2e/fonts-network.spec.ts |
| BI-026 | - | VO-030 | verified | e2e/workspace-tools.spec.ts |
| BI-027 | - | VO-031 | verified | e2e/status-bar.spec.ts |
| BI-028 | - | exemption FR-014 | exempt | - |
| BI-029 | - | VO-021 | verified | e2e/ |
| BI-030 | - | VO-013, VO-014 | verified | app/persistence/appearance.test.ts, e2e/appearance-persistence.spec.ts |
| BI-031 | - | VO-040, VO-041 | verified | app/rendering/shared/pinch.test.ts, e2e/touch/gestures.spec.ts |
| BI-033 | - | VO-042 | verified | e2e/appearance-notice.spec.ts |
| BI-034 | - | VO-043 | verified | e2e/touch/second-finger.spec.ts |
| BI-035 | - | VO-044 | verified | app/generation/redesign-output.test.ts |
| BI-036 | - | VO-045 | verified | e2e/redesign-performance.spec.ts, app/editor/reducerSelect.test.ts, e2e/, redesign-performance |
| BI-032 | - | MV-001 | manual (open) | - |

Not verified by tests

- VO-037 deferred: mobile-ios cannot launch on this host (WebKit build needs libicu74, libxml2, libflite1, libjxl); the test passes on mobile-android; developer chose to defer the iOS profile (DF-01)
- VO-038 deferred: mobile-ios cannot launch on this host (WebKit build needs libicu74, libxml2, libflite1, libjxl); passes on mobile-android; developer chose to defer the iOS profile (DF-02)
- VO-039 deferred: mobile-ios cannot launch on this host (WebKit build needs libicu74, libxml2, libflite1, libjxl); passes on mobile-android; developer chose to defer the iOS profile (DF-03)
- MV-001 manual: open
- MV-002 manual: open
- MV-003 manual: open

Counts: verified 42, deferred 3, manual checks 3 open

**Not verified**: FR-027 (VO-037 deferred, VO-038 deferred, VO-039 deferred), US5-AS4 (VO-037 deferred, VO-038 deferred), SC-009 (VO-037 deferred, VO-038 deferred), FR-014 (exempt: see plan), BI-021 (in progress), BI-032 (manual (open)).

**Open decisions**: none. **Exceptions**: EX-01 no-meaningful-red on T016 for VO-010; EX-02 no-meaningful-red on T020 for VO-014; EX-03 no-meaningful-red on T024 for VO-030; EX-04 no-meaningful-red on T039 for VO-018; EX-05 no-meaningful-red on T050 for VO-024; EX-06 no-meaningful-red on T065 for VO-029; EX-07 no-meaningful-red on T072 for VO-034; EX-08 no-meaningful-red on T080 for VO-043; EX-09 no-meaningful-red on T063 for VO-028; EX-10 other on T099 for VO-045 (approved by Lee Sinclair); EX-11 no-meaningful-red on T082 for VO-036; EX-12 no-meaningful-red on T086 for VO-038; EX-13 no-meaningful-red on T091 for VO-002; EX-14 behaviour-preserving on T095 for VO-021; EX-15 behaviour-preserving on T097 for VO-044. **Expectation changes**: XC-01 on T042 for FR-015; XC-02 on T038 for FR-013; XC-03 on T038 for FR-013; XC-04 on T049 for FR-017; XC-05 on T055 for FR-018; XC-06 on T058 for FR-019; XC-07 on T017 for FR-009; XC-08 on T075 for FR-010; XC-09 on T079 for FR-028; XC-10 on T099 for SC-007, alters behaviour (approved by Lee Sinclair); XC-11 on T099 for SC-007, alters behaviour (approved by Lee Sinclair); XC-12 on T094 for FR-020; XC-13 on T094 for FR-020.

**Item changes**: BX-01 on BI-016, alters behaviour (approved by Lee Sinclair); BX-02 on BI-036, alters behaviour (approved by Lee Sinclair); BX-03 on BI-036, alters behaviour (approved by Lee Sinclair).

**Pre-existing failures**: none.

## Baseline

| Seq | Command | Result | Pre-existing failures |
|-----|---------|--------|-----------------------|
| 1 | unit-all | pass | - |
| 2 | e2e-all | pass | - |

## Test execution records

| Seq | Time | Task | Obligations | Phase | Command | Selector | Result | Valid | Classification | Files | Fingerprint | Note | Check |
|-----|------|------|-------------|-------|---------|----------|--------|-------|----------------|-------|-------------|------|-------|
| 1 | 2026-10-22T12:27:26Z | - | - | baseline | unit-all | - | pass | yes | - | - | - | unit baseline before the Blueprint Studio redesign | 52a80f |
| 2 | 2026-10-22T12:36:28Z | - | - | baseline | e2e-all | - | pass | yes | - | - | - | e2e baseline before the Blueprint Studio redesign (desktop projects only; mobile projects do not exist yet) | 0eb9b7 |
| 3 | 2026-10-22T12:36:52Z | - | - | checkpoint | e2e | --project=chromium-timing --project=firefox-timing e2e/redesign-performance.spec.ts | fail | no | defect | - | - | command scope is not broad; T003: records e2e/fixtures/redesign-timing.json from the unchanged editor (capture mode); T003 capture: my --select passed two projects as one argument, so Playwright found no such project; the e2e-timing command was added to the plan | bb36cc |
| 4 | 2026-10-22T12:38:08Z | - | - | checkpoint | e2e-timing | e2e/redesign-performance.spec.ts | fail | no | defect | - | - | command scope is not broad; T003: records e2e/fixtures/redesign-timing.json from the unchanged editor (capture mode); T003 capture: the timing test needed more than the default 30 s test timeout in Firefox; a longer timeout was set in the spec | c3c3ee |
| 5 | 2026-10-22T12:39:23Z | - | - | checkpoint | e2e-timing | e2e/redesign-performance.spec.ts | pass | no | - | - | - | command scope is not broad; T003: records e2e/fixtures/redesign-timing.json from the unchanged editor (capture mode, second run: longer test timeout) | 546ad9 |
| 6 | 2026-10-22T12:40:27Z | - | - | checkpoint | e2e-timing | e2e/redesign-performance.spec.ts | pass | no | - | - | - | command scope is not broad; T003: stability of the compare mode on the unchanged editor, run 1 of 3 | 96186d |
| 7 | 2026-10-22T12:41:24Z | - | - | checkpoint | e2e-timing | e2e/redesign-performance.spec.ts | pass | no | - | - | - | command scope is not broad; T003: stability of the compare mode on the unchanged editor, run 2 of 3 | 26ccdb |
| 8 | 2026-10-22T12:42:21Z | - | - | checkpoint | e2e-timing | e2e/redesign-performance.spec.ts | pass | no | - | - | - | command scope is not broad; T003: stability of the compare mode on the unchanged editor, run 3 of 3 | 312ec7 |
| 9 | 2026-10-22T12:43:21Z | T005 | VO-001 | red | unit | app/rendering/theme/tokens.test.ts | fail | yes | assertion | app/rendering/theme/tokens.test.ts | 333e32 | expected: the surfaces group | bb4519 |
| 10 | 2026-10-22T12:43:59Z | T006 | VO-001 | green | unit | app/rendering/theme/tokens.test.ts | pass | yes | - | app/rendering/theme/tokens.test.ts | 333e32 | - | 75937a |
| 11 | 2026-10-22T12:44:05Z | T007 | VO-003 | red | unit | app/rendering/theme/contrast.test.ts | fail | no | assertion | app/rendering/theme/contrast.test.ts | cb1180 | failed for a different reason; The tests failed on their assertions as intended; my --expect text did not match vitest's wording, so the run was repeated as #12 with the exact text | 0cf99b |
| 12 | 2026-10-22T12:44:12Z | T007 | VO-003 | red | unit | app/rendering/theme/contrast.test.ts | fail | yes | assertion | app/rendering/theme/contrast.test.ts | cb1180 | expected: to be close to 21 | f30bcf |
| 13 | 2026-10-22T12:44:33Z | T008 | VO-003 | green | unit | app/rendering/theme/contrast.test.ts | pass | yes | - | app/rendering/theme/contrast.test.ts | cb1180 | - | 97fe23 |
| 14 | 2026-10-22T12:44:49Z | T008 | VO-003 | refactor | unit | app/rendering/theme | pass | yes | - | app/rendering/theme/contrast.test.ts | cb1180 | - | 9e3b8c |
| 15 | 2026-10-22T12:45:25Z | T009 | VO-013 | red | unit | app/persistence/appearance.test.ts | fail | yes | assertion | app/persistence/appearance.test.ts | d54976 | expected: to be 'light' | 5afd19 |
| 16 | 2026-10-22T12:45:49Z | T010 | VO-013 | green | unit | app/persistence/appearance.test.ts | pass | yes | - | app/persistence/appearance.test.ts | d54976 | - | b504a3 |
| 17 | 2026-10-22T12:46:29Z | T011 | VO-008 | red | e2e | e2e/appearance-start.spec.ts | fail | yes | assertion | e2e/appearance-start.spec.ts | 6afb32 | expected: rgb(7, 28, 48) | a20cd7 |
| 18 | 2026-10-22T12:47:42Z | T012 | VO-008 | green | e2e | e2e/appearance-start.spec.ts | pass | yes | - | e2e/appearance-start.spec.ts | 6afb32 | - | 523a9f |
| 19 | 2026-10-22T12:47:53Z | - | - | checkpoint | unit-all | - | fail | no | defect | - | - | The output snapshot test picked up the new redesign-timing.json fixture as a diagram; fixtures are now limited to *.mermaid-editor.json (the generated output itself was unchanged) | 03f948 |
| 20 | 2026-10-22T12:48:28Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | 75e303 |
| 21 | 2026-10-22T12:49:59Z | T014 | VO-009 | red | e2e | e2e/workspace-header.spec.ts | fail | yes | assertion | e2e/workspace-header.spec.ts | 379cfd | expected: Mermaid diagram editor | 9902d3 |
| 22 | 2026-10-22T12:51:09Z | T015 | VO-009 | green | e2e | e2e/workspace-header.spec.ts | pass | yes | - | e2e/workspace-header.spec.ts | 379cfd | - | f72f51 |
| 23 | 2026-10-22T12:52:46Z | T016 | VO-010 | red | e2e | e2e/workspace-controls.spec.ts | fail | no | defect | e2e/workspace-controls.spec.ts | 90572e | failed for a different reason; The test file was generated with a shell-expansion error (unterminated string); regenerated | c0d372 |
| 24 | 2026-10-22T12:53:14Z | T016 | VO-010 | red | e2e | e2e/workspace-controls.spec.ts | pass | no | - | e2e/workspace-controls.spec.ts | 54d949 | passed on first run: investigate | 4854ab |
| 25 | 2026-10-22T12:53:29Z | T017 | VO-010 | green | e2e | e2e/workspace-controls.spec.ts | pass | yes | - | e2e/workspace-controls.spec.ts | 54d949 | - | b7c458 |
| 26 | 2026-10-22T12:54:28Z | T018 | VO-011 | red | e2e | e2e/appearance-switch.spec.ts | fail | no | assertion | e2e/appearance-switch.spec.ts | 6039b9 | failed for a different reason; Failed on its assertions as intended (the tools area is not yet on the panel surface and the switch is not wired); my --expect named the wrong colour, so the run was repeated as the next record | 95e260 |
| 27 | 2026-10-22T12:54:56Z | T018 | VO-011 | red | e2e | e2e/appearance-switch.spec.ts | fail | yes | assertion | e2e/appearance-switch.spec.ts | 6039b9 | expected: Expected: "rgb(13, 43, 69)" | b28422 |
| 28 | 2026-10-22T12:55:32Z | T019 | VO-011 | green | e2e | e2e/appearance-switch.spec.ts | pass | yes | - | e2e/appearance-switch.spec.ts | 6039b9 | - | 45e208 |
| 29 | 2026-10-22T12:56:23Z | T020 | VO-014 | red | e2e | e2e/appearance-persistence.spec.ts | pass | no | - | e2e/appearance-persistence.spec.ts | 40c14e | passed on first run: investigate | f5ceec |
| 30 | 2026-10-22T12:56:39Z | T021 | VO-014 | green | e2e | e2e/appearance-persistence.spec.ts | pass | yes | - | e2e/appearance-persistence.spec.ts | 40c14e | - | 5642ba |
| 31 | 2026-10-22T12:57:17Z | T022 | VO-042 | red | e2e | e2e/appearance-notice.spec.ts | fail | yes | assertion | e2e/appearance-notice.spec.ts | 61c13b | expected: could not be saved for next time | 93ddd0 |
| 32 | 2026-10-22T12:57:49Z | T022 | VO-042 | red | e2e | e2e/appearance-notice.spec.ts | fail | yes | assertion | e2e/appearance-notice.spec.ts | c9949c | expected: could not be saved for next time | 5af541 |
| 33 | 2026-10-22T12:58:11Z | T023 | VO-042 | green | e2e | e2e/appearance-notice.spec.ts | pass | yes | - | e2e/appearance-notice.spec.ts | c9949c | - | 67cd59 |
| 34 | 2026-10-22T12:58:35Z | T023 | VO-042 | refactor | e2e | e2e/appearance-notice.spec.ts | pass | yes | - | e2e/appearance-notice.spec.ts | c9949c | - | 4b13ac |
| 35 | 2026-10-22T12:59:14Z | T024 | VO-030 | red | e2e | e2e/workspace-tools.spec.ts | pass | no | - | e2e/workspace-tools.spec.ts | 6f73e0 | passed on first run: investigate | c0dd0f |
| 36 | 2026-10-22T12:59:27Z | T025 | VO-030 | green | e2e | e2e/workspace-tools.spec.ts | pass | yes | - | e2e/workspace-tools.spec.ts | 6f73e0 | - | cf3a9e |
| 37 | 2026-10-22T13:00:57Z | T026 | VO-031 | red | e2e | e2e/status-bar.spec.ts | fail | yes | assertion | e2e/status-bar.spec.ts | e09582 | expected: Editor status | 8dea02 |
| 38 | 2026-10-22T13:02:23Z | T027 | VO-031 | green | e2e | e2e/status-bar.spec.ts | pass | yes | - | e2e/status-bar.spec.ts | e09582 | - | f9be77 |
| 39 | 2026-10-22T13:03:45Z | T028 | VO-012 | red | e2e | e2e/interaction-states.spec.ts | fail | yes | assertion | e2e/interaction-states.spec.ts | 4ac772 | expected: 3px | 0ef452 |
| 40 | 2026-10-22T13:04:17Z | T028 | VO-012 | red | e2e | e2e/interaction-states.spec.ts | fail | yes | assertion | e2e/interaction-states.spec.ts | d5ee80 | expected: 3px | fc0e24 |
| 41 | 2026-10-22T13:04:54Z | T029 | VO-012 | green | e2e | e2e/interaction-states.spec.ts | fail | no | defect | e2e/interaction-states.spec.ts | d5ee80 | First attempt at the theme overrides did not type-check (Alert override keys MUI does not offer), so the run used the previous build of the theme; fixed in the next two runs | 39070a |
| 42 | 2026-10-22T13:05:21Z | T029 | VO-012 | green | e2e | e2e/interaction-states.spec.ts | fail | no | defect | e2e/interaction-states.spec.ts | d5ee80 | The Alert state colours were put under style override keys MUI's Alert does not resolve; they now sit in nested selectors of the root override | 24ac64 |
| 43 | 2026-10-22T13:05:55Z | T029 | VO-012 | green | e2e | e2e/interaction-states.spec.ts | pass | yes | - | e2e/interaction-states.spec.ts | d5ee80 | - | fda4b8 |
| 44 | 2026-10-22T13:06:42Z | T030 | VO-005 | red | e2e | e2e/fonts-network.spec.ts | fail | yes | assertion | e2e/fonts-network.spec.ts | 9d29f5 | expected: ui-monospace | 683d11 |
| 45 | 2026-10-22T13:07:04Z | T031 | VO-005 | green | e2e | e2e/fonts-network.spec.ts | pass | yes | - | e2e/fonts-network.spec.ts | 9d29f5 | - | 321141 |
| 46 | 2026-10-22T13:08:47Z | T041 | VO-019 | red | e2e | e2e/selection-style.spec.ts | fail | yes | assertion | e2e/selection-style.spec.ts | dd6b62 | expected: outline | c5df65 |
| 47 | 2026-10-22T13:09:35Z | T042 | VO-019 | green | e2e | e2e/selection-style.spec.ts | fail | no | defect | e2e/selection-style.spec.ts | dd6b62 | The test hovered the middle of a sequence participant, which is its lifeline, not its header that owns the hover outline; the test was corrected | 034800 |
| 48 | 2026-10-22T13:10:06Z | T042 | VO-019 | green | e2e | e2e/selection-style.spec.ts | pass | yes | - | e2e/selection-style.spec.ts | 080b80 | - | b23263 |
| 49 | 2026-10-22T13:19:25Z | - | - | checkpoint | e2e-all | - | fail | no | defect | - | - | Phase 3 checkpoint (US1 plus the canvas colours of VO-019); Two publish-gate tests read the CI workflow text, and my edit changed the install line and the grep-invert; the workflow now keeps both original lines (WebKit has its own step) and the new timing test skips itself on CI. Rerun of publish-gate passed (#50); the next phase checkpoint is a full run. | 58559e |
| 50 | 2026-10-22T13:19:49Z | - | - | checkpoint | e2e | e2e/publish-gate.spec.ts | pass | no | - | - | - | command scope is not broad | 9c7a6d |
| 51 | 2026-10-22T13:20:14Z | T033 | VO-015 | red | unit | app/rendering/shared/grid.test.ts | fail | yes | assertion | app/rendering/shared/grid.test.ts | c9c440 | expected: minor | f77b20 |
| 52 | 2026-10-22T13:20:18Z | T034 | VO-015 | green | unit | app/rendering/shared/grid.test.ts | pass | yes | - | app/rendering/shared/grid.test.ts | c9c440 | - | 13d7ec |
| 53 | 2026-10-22T13:20:49Z | T035 | VO-016 | red | e2e | e2e/grid.spec.ts | fail | yes | assertion | e2e/grid.spec.ts | f4a7e5 | expected: minor spacing | db094c |
| 54 | 2026-10-22T13:21:36Z | T036 | VO-016 | green | e2e | e2e/grid.spec.ts | fail | no | defect | e2e/grid.spec.ts | f4a7e5 | The test helper counted a computed transparent gradient stop as a line colour for the sequence and C4 canvases; the helper was fixed, the grid itself was right | f8a90a |
| 55 | 2026-10-22T13:22:07Z | T036 | VO-016 | green | e2e | e2e/grid.spec.ts | pass | yes | - | e2e/grid.spec.ts | f4a7e5 | - | 965452 |
| 56 | 2026-10-22T13:23:11Z | T037 | VO-017 | red | e2e | e2e/grid-alignment.spec.ts | fail | yes | assertion | e2e/grid-alignment.spec.ts | 024d4e | expected: offset from the grid | b8f677 |
| 57 | 2026-10-22T13:24:07Z | T038 | VO-017 | green | e2e | e2e/grid-alignment.spec.ts | fail | no | defect | e2e/grid-alignment.spec.ts | 492a2a | The test read the item's place against the grid while an animated button zoom was still settling; the test now waits for a stable read | dcab5e |
| 58 | 2026-10-22T13:25:09Z | T038 | VO-017 | green | e2e | e2e/grid-alignment.spec.ts | fail | no | defect | e2e/grid-alignment.spec.ts | f7e872 | The test helper picked the minor background as the major grid at some zooms; fixed to take the widest | 2cb483 |
| 59 | 2026-10-22T13:25:42Z | T038 | VO-017 | green | e2e | e2e/grid-alignment.spec.ts | pass | yes | - | e2e/grid-alignment.spec.ts | f7e872 | - | 681394 |
| 60 | 2026-10-22T13:26:21Z | T039 | VO-018 | red | e2e | e2e/grid-hit.spec.ts | pass | no | - | e2e/grid-hit.spec.ts | f0b780 | passed on first run: investigate | f09469 |
| 61 | 2026-10-22T13:26:40Z | T039 | VO-018 | red | e2e | e2e/grid-hit.spec.ts | pass | no | - | e2e/grid-hit.spec.ts | 07c450 | passed on first run: investigate | 44db7c |
| 62 | 2026-10-22T13:26:46Z | T040 | VO-018 | green | e2e | e2e/grid-hit.spec.ts | pass | yes | - | e2e/grid-hit.spec.ts | 07c450 | - | 584066 |
| 63 | 2026-10-22T13:27:50Z | T043 | VO-020 | red | e2e | e2e/connection-style.spec.ts | fail | yes | assertion | e2e/connection-style.spec.ts | 9890b2 | expected: ring | cf1a20 |
| 64 | 2026-10-22T13:28:18Z | T043 | VO-020 | red | e2e | e2e/connection-style.spec.ts | fail | yes | assertion | e2e/connection-style.spec.ts | 882ba9 | expected: rgb(177, 177, 183) | baae7f |
| 65 | 2026-10-22T13:28:44Z | T044 | VO-020 | green | e2e | e2e/connection-style.spec.ts | pass | yes | - | e2e/connection-style.spec.ts | 882ba9 | - | fdd473 |
| 66 | 2026-10-22T13:38:03Z | - | - | checkpoint | e2e-all | - | fail | no | defect | - | - | Phase 4 checkpoint (US2: drafting canvas); Checkpoint 4: my grid-alignment test read the C4 item's place straight after a wheel scroll while Firefox was still scrolling smoothly; it now waits for a settled read. 1102 passed; 16 timing tests did not run because their projects depend on the desktop projects passing, so the next checkpoint must run them. | 8777a5 |
| 67 | 2026-10-22T13:38:44Z | T038 | VO-017 | refactor | e2e | e2e/grid-alignment.spec.ts | pass | yes | - | e2e/grid-alignment.spec.ts | 978365 | - | d7263d |
| 68 | 2026-10-22T13:40:13Z | - | - | checkpoint | e2e-timing | - | fail | no | assertion | - | - | command scope is not broad; Timing projects after US2 (they did not run in checkpoint 4); A real slowdown: the redesigned editor is slower than the recorded baseline for flowchart pan (about +40% in Chromium) and some zoom medians. Calibrated against the pre-redesign build served side by side (baseline pan 133 ms, current 191 ms; render counts of nodes and edges are equal, the Editor re-renders more often). To be fixed in the VO-045 tasks, once the final component structure is in place. | 296e4f |
| 69 | 2026-10-22T13:41:03Z | - | - | checkpoint | e2e | e2e/status-bar.spec.ts | pass | no | - | - | - | command scope is not broad | 25409a |
| 70 | 2026-10-22T13:42:02Z | - | - | checkpoint | e2e-timing | e2e/redesign-performance.spec.ts | fail | no | assertion | - | - | command scope is not broad; Timing comparison after isolating the zoom state; A real slowdown: the redesigned editor is slower than the recorded baseline for flowchart pan (about +40% in Chromium) and some zoom medians. Calibrated against the pre-redesign build served side by side (baseline pan 133 ms, current 191 ms; render counts of nodes and edges are equal, the Editor re-renders more often). To be fixed in the VO-045 tasks, once the final component structure is in place. | d0e33c |
| 71 | 2026-10-22T13:43:21Z | - | - | checkpoint | e2e-timing | e2e/redesign-performance.spec.ts | fail | no | assertion | - | - | command scope is not broad; EXPERIMENT: timing with the grid disabled, to find the cause of the slowdown (code restored right after); A real slowdown: the redesigned editor is slower than the recorded baseline for flowchart pan (about +40% in Chromium) and some zoom medians. Calibrated against the pre-redesign build served side by side (baseline pan 133 ms, current 191 ms; render counts of nodes and edges are equal, the Editor re-renders more often). To be fixed in the VO-045 tasks, once the final component structure is in place. | 94a9d2 |
| 72 | 2026-10-22T13:48:10Z | T046 | VO-022 | red | unit | app/rendering/shared/highlight.test.ts | fail | yes | assertion | app/rendering/shared/highlight.test.ts | 9ccee4 | expected: keyword | 50739d |
| 73 | 2026-10-22T13:48:18Z | T047 | VO-022 | green | unit | app/rendering/shared/highlight.test.ts | pass | yes | - | app/rendering/shared/highlight.test.ts | 9ccee4 | - | b11fc0 |
| 74 | 2026-10-22T13:48:34Z | T047 | VO-022 | refactor | unit | app/rendering/shared/highlight.test.ts | pass | yes | - | app/rendering/shared/highlight.test.ts | 9ccee4 | - | 208578 |
| 75 | 2026-10-22T13:49:21Z | T048 | VO-023 | red | e2e | e2e/source-highlight.spec.ts | fail | yes | assertion | e2e/source-highlight.spec.ts | f2b606 | expected: keyword run | 613913 |
| 76 | 2026-10-22T13:50:03Z | T049 | VO-023 | green | e2e | e2e/source-highlight.spec.ts | fail | no | defect | e2e/source-highlight.spec.ts | f2b606 | My test expected quoted labels in the sequence source, which the editor does not write; the per-type kinds were corrected (a lint error in the component was fixed in the same step) | e6d182 |
| 77 | 2026-10-22T13:50:33Z | T049 | VO-023 | green | e2e | e2e/source-highlight.spec.ts | pass | yes | - | e2e/source-highlight.spec.ts | 267416 | - | f8a135 |
| 78 | 2026-10-22T13:50:52Z | T050 | VO-024 | red | e2e | e2e/source-follows.spec.ts | pass | no | - | e2e/source-follows.spec.ts | d9e68a | passed on first run: investigate | 984483 |
| 79 | 2026-10-22T13:50:57Z | T051 | VO-024 | green | e2e | e2e/source-follows.spec.ts | pass | yes | - | e2e/source-follows.spec.ts | d9e68a | - | 2caa33 |
| 80 | 2026-10-22T13:51:06Z | T052 | VO-006 | red | unit | app/rendering/shared/sourceStatus.test.ts | fail | yes | assertion | app/rendering/shared/sourceStatus.test.ts | 640924 | expected: error | 22d55a |
| 81 | 2026-10-22T13:51:21Z | T053 | VO-006 | green | unit | app/rendering/shared/sourceStatus.test.ts | pass | yes | - | app/rendering/shared/sourceStatus.test.ts | 640924 | - | 322836 |
| 82 | 2026-10-22T13:51:40Z | T054 | VO-007 | red | e2e | e2e/source-status.spec.ts | fail | yes | assertion | e2e/source-status.spec.ts | 3c06fe | expected: color | 9842cb |
| 83 | 2026-10-22T13:52:35Z | T055 | VO-007 | green | e2e | e2e/source-status.spec.ts | fail | no | defect | e2e/source-status.spec.ts | 3c06fe | My test moved between diagrams by a hash-only navigation, which left the previous diagram open; each diagram now opens in its own page | 047929 |
| 84 | 2026-10-22T13:53:05Z | T055 | VO-007 | green | e2e | e2e/source-status.spec.ts | pass | yes | - | e2e/source-status.spec.ts | cae316 | - | 80c16c |
| 85 | 2026-10-22T13:53:28Z | - | - | checkpoint | unit-all | - | fail | no | assertion | - | - | The three failures are tests written ahead for later tasks (layout.test.ts, pinch.test.ts, mermaidRuntime.test.ts) that fail on their skeletons by design until their own Red and Green runs; everything else passed (84 files, 1469 tests). | cb1dbc |
| 86 | 2026-10-22T13:53:37Z | T057 | VO-025 | red | unit | app/rendering/shared/mermaidRuntime.test.ts | fail | yes | assertion | app/rendering/shared/mermaidRuntime.test.ts | 78607c | expected: theme | a2652b |
| 87 | 2026-10-22T13:54:15Z | T058 | VO-025 | green | unit | app/rendering/shared/mermaidRuntime.test.ts | pass | yes | - | app/rendering/shared/mermaidRuntime.test.ts | 78607c | - | fe9887 |
| 88 | 2026-10-22T13:54:18Z | T058 | VO-025 | refactor | unit | app/importing | pass | yes | - | app/rendering/shared/mermaidRuntime.test.ts | 78607c | - | 0f5263 |
| 89 | 2026-10-22T13:54:20Z | T058 | VO-025 | refactor | unit | app/editor | pass | yes | - | app/rendering/shared/mermaidRuntime.test.ts | 78607c | - | 79da77 |
| 90 | 2026-10-22T13:55:04Z | T059 | VO-026 | red | e2e | e2e/mermaid-look.spec.ts | fail | yes | assertion | e2e/mermaid-look.spec.ts | ed8e88 | expected: node | ae8b8e |
| 91 | 2026-10-22T13:55:26Z | T058 | VO-025 | refactor | unit | app/rendering/shared/mermaidRuntime.test.ts | pass | yes | - | app/rendering/shared/mermaidRuntime.test.ts | e31bed | - | 3b3334 |
| 92 | 2026-10-22T13:55:33Z | T059 | VO-026 | red | e2e | e2e/mermaid-look.spec.ts | fail | yes | assertion | e2e/mermaid-look.spec.ts | 981cdf | expected: preview surface | d01eb4 |
| 93 | 2026-10-22T13:55:57Z | T060 | VO-026 | green | e2e | e2e/mermaid-look.spec.ts | pass | yes | - | e2e/mermaid-look.spec.ts | 981cdf | - | dbc33c |
| 94 | 2026-10-22T13:56:41Z | T061 | VO-027 | red | e2e | e2e/mermaid-look-switch.spec.ts | fail | yes | assertion | e2e/mermaid-look-switch.spec.ts | 5b8239 | expected: rgb(236, 236, 255) | 68edd3 |
| 95 | 2026-10-22T13:56:57Z | T062 | VO-027 | green | e2e | e2e/mermaid-look-switch.spec.ts | pass | yes | - | e2e/mermaid-look-switch.spec.ts | 5b8239 | - | cff9d6 |
| 96 | 2026-10-22T13:59:21Z | T065 | VO-029 | red | e2e | e2e/output-identity.spec.ts | pass | no | - | e2e/output-identity.spec.ts | 4b3570 | passed on first run: investigate | 9f2861 |
| 97 | 2026-10-22T13:59:44Z | T066 | VO-029 | green | e2e | e2e/output-identity.spec.ts | pass | yes | - | e2e/output-identity.spec.ts | 4b3570 | - | 8fb7da |
| 98 | 2026-10-22T14:10:23Z | - | - | checkpoint | e2e-all | - | fail | no | assertion | - | - | Phase 6 checkpoint (US3 and US4, VO-028 held by DN-01); Checkpoint 6: 1130 passed. The one failure is the known redesign-performance comparison (VO-045) for the flowchart, a genuine slowdown already classified at #68; its fix is the VO-045 tasks near the end. The 8 timing tests after it did not run because their projects depend on it. | 74a6b6 |
| 99 | 2026-10-22T14:10:54Z | T068 | VO-032 | red | unit | app/rendering/shared/layout.test.ts | fail | yes | assertion | app/rendering/shared/layout.test.ts | 9a25d7 | expected: wide | 01680d |
| 100 | 2026-10-22T14:10:55Z | T069 | VO-032 | green | unit | app/rendering/shared/layout.test.ts | pass | yes | - | app/rendering/shared/layout.test.ts | 9a25d7 | - | 956846 |
| 101 | 2026-10-22T14:10:56Z | T076 | VO-040 | red | unit | app/rendering/shared/pinch.test.ts | fail | yes | assertion | app/rendering/shared/pinch.test.ts | 17def3 | expected: to be | 104834 |
| 102 | 2026-10-22T14:10:56Z | T077 | VO-040 | green | unit | app/rendering/shared/pinch.test.ts | pass | yes | - | app/rendering/shared/pinch.test.ts | 17def3 | - | f85445 |
| 103 | 2026-10-22T14:11:34Z | T070 | VO-033 | red | e2e | e2e/narrow-layout.spec.ts | fail | yes | assertion | e2e/narrow-layout.spec.ts | 6e1150 | expected: aria-expanded | ce3799 |
| 104 | 2026-10-22T14:12:57Z | T071 | VO-033 | green | e2e | e2e/narrow-layout.spec.ts | pass | yes | - | e2e/narrow-layout.spec.ts | 6e1150 | - | fb4d67 |
| 105 | 2026-10-22T14:13:10Z | T072 | VO-034 | red | e2e | e2e/narrow-panel-keeps.spec.ts | pass | no | - | e2e/narrow-panel-keeps.spec.ts | 5299d8 | passed on first run: investigate | 839f9b |
| 106 | 2026-10-22T14:13:26Z | T073 | VO-034 | green | e2e | e2e/narrow-panel-keeps.spec.ts | pass | yes | - | e2e/narrow-panel-keeps.spec.ts | 5299d8 | - | 492d55 |
| 107 | 2026-10-22T14:13:53Z | T017 | VO-010 | refactor | e2e | e2e/workspace-controls.spec.ts | pass | yes | - | e2e/workspace-controls.spec.ts | fcfdb5 | - | 3c277e |
| 108 | 2026-10-22T14:15:14Z | T074 | VO-035 | red | e2e | e2e/narrow-controls.spec.ts | fail | yes | assertion | e2e/narrow-controls.spec.ts | 3d595d | expected: More actions | da894b |
| 109 | 2026-10-22T14:16:35Z | T074 | VO-035 | red | e2e | e2e/narrow-controls.spec.ts | fail | yes | assertion | e2e/narrow-controls.spec.ts | cefac7 | expected: More actions | 8e3991 |
| 110 | 2026-10-22T14:17:58Z | T075 | VO-035 | green | e2e | e2e/narrow-controls.spec.ts | fail | no | defect | e2e/narrow-controls.spec.ts | cefac7 | An open MUI menu is modal and hides the rest of the page from the accessibility tree, so my test looked for page controls while the menu was open; it now checks the page first and the menu separately | 584d27 |
| 111 | 2026-10-22T14:18:35Z | T075 | VO-035 | green | e2e | e2e/narrow-controls.spec.ts | pass | yes | - | e2e/narrow-controls.spec.ts | 81bda4 | - | b6b810 |
| 112 | 2026-10-22T14:23:37Z | T078 | VO-041 | red | e2e-touch | e2e/touch/gestures.spec.ts | fail | yes | assertion | e2e/touch/gestures.spec.ts | 40cd28 | expected: Error | be9e7c |
| 113 | 2026-10-22T14:25:23Z | T078 | VO-041 | red | e2e-touch | e2e/touch/gestures.spec.ts | fail | yes | assertion | e2e/touch/gestures.spec.ts | fefd69 | expected: Received | 3451c5 |
| 114 | 2026-10-22T14:32:04Z | T079 | VO-041 | green | e2e-touch | e2e/touch/gestures.spec.ts | pass | yes | - | e2e/touch/gestures.spec.ts | 466a35 | - | b40fe9 |
| 115 | 2026-10-22T14:35:39Z | T080 | VO-043 | red | e2e-touch | e2e/touch/second-finger.spec.ts | pass | no | - | e2e/touch/second-finger.spec.ts | 1929bf | passed on first run: investigate | 516ce7 |
| 116 | 2026-10-22T14:35:51Z | T081 | VO-043 | green | e2e-touch | e2e/touch/second-finger.spec.ts | pass | yes | - | e2e/touch/second-finger.spec.ts | 1929bf | - | ccf63d |
| 117 | 2026-10-22T17:44:59Z | T063 | VO-028 | red | e2e | e2e/mermaid-style-wins.spec.ts | pass | no | - | e2e/mermaid-style-wins.spec.ts | f8d218 | passed on first run: investigate | eeb1c6 |
| 118 | 2026-10-22T17:45:22Z | T063 | VO-028 | red | e2e | e2e/mermaid-style-wins.spec.ts | pass | no | - | e2e/mermaid-style-wins.spec.ts | 65f825 | passed on first run: investigate | a7ea35 |
| 119 | 2026-10-22T17:45:26Z | T064 | VO-028 | green | e2e | e2e/mermaid-style-wins.spec.ts | pass | yes | - | e2e/mermaid-style-wins.spec.ts | 65f825 | - | 30b39b |
| 120 | 2026-10-22T17:54:36Z | T100 | VO-045 | green | e2e-timing | e2e/redesign-performance.spec.ts | fail | no | assertion | e2e/redesign-performance.spec.ts | bbda72 | Timing comparison against the recorded baseline failed on a case that was then fixed or allowed | a6bf60 |
| 121 | 2026-10-22T18:01:29Z | T100 | VO-045 | green | unit | app/editor/reducerSelect.test.ts | pass | yes | - | app/editor/reducerSelect.test.ts | c5789e | - | 186337 |
| 122 | 2026-10-22T18:01:35Z | T100 | VO-045 | refactor | unit-all | - | pass | yes | - | app/editor/reducerSelect.test.ts | c5789e | - | da6bce |
| 123 | 2026-10-22T18:07:02Z | T100 | VO-045 | green | e2e-timing | e2e/redesign-performance.spec.ts | fail | no | assertion | e2e/redesign-performance.spec.ts | bbda72 | Timing comparison against the recorded baseline failed on a case that was then fixed or allowed | 082021 |
| 124 | 2026-10-22T18:22:53Z | T100 | VO-045 | refactor | e2e | e2e/ | pass | yes | - | app/editor/reducerSelect.test.ts | c5789e | - | d84987 |
| 125 | 2026-10-22T18:52:10Z | T100 | VO-045 | green | e2e-timing | e2e/redesign-performance.spec.ts | fail | no | assertion | e2e/redesign-performance.spec.ts | 1dd121 | Timing comparison against the recorded baseline failed on a case that was then fixed or allowed | ca8e41 |
| 126 | 2026-10-22T19:49:45Z | T100 | VO-045 | green | e2e-timing | e2e/redesign-performance.spec.ts | pass | yes | - | e2e/redesign-performance.spec.ts | 75d4af | - | e24e9c |
| 127 | 2026-10-22T19:52:10Z | T100 | VO-045 | green | e2e-timing | e2e/redesign-performance.spec.ts | pass | yes | - | e2e/redesign-performance.spec.ts | 75d4af | - | c2a5ea |
| 128 | 2026-10-22T19:59:31Z | T083 | VO-036 | green | e2e-touch | e2e/touch/flowchart.spec.ts | pass | yes | - | e2e/touch/flowchart.spec.ts, e2e/touch/support.ts | 5e26ec | - | 886b40 |
| 129 | 2026-10-22T20:08:13Z | T084 | VO-037 | red | e2e-touch | e2e/touch/sequence-c4.spec.ts | fail | yes | assertion | e2e/touch/sequence-c4.spec.ts | 31c197 | expected: Expected | c7e92e |
| 130 | 2026-10-22T20:08:28Z | T084 | VO-037 | red | e2e-touch | e2e/touch/sequence-c4.spec.ts | fail | no | environment | e2e/touch/sequence-c4.spec.ts | ffe74d | failed for a different reason; mobile-ios cannot launch: Playwright's WebKit build (webkit-2370) needs libicu74, libxml2, libflite1 and libjxl, which this host lacks; mobile-android ran both tests and they passed (the touch editing of sequence and C4 already works there) | 8f3b46 |
| 131 | 2026-10-22T20:22:32Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts | fail | yes | assertion | e2e/touch/files-copy.spec.ts | 2f9e2d | expected: Error | c9fbf4 |
| 132 | 2026-10-22T20:23:14Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts | fail | yes | assertion | e2e/touch/files-copy.spec.ts | 3d87c9 | expected: Error | f5cf59 |
| 133 | 2026-10-22T20:23:34Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts --project=mobile-android | fail | yes | assertion | e2e/touch/files-copy.spec.ts | d2b91e | expected: Error | 459b2c |
| 134 | 2026-10-22T20:23:40Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts --project=mobile-android | fail | yes | assertion | e2e/touch/files-copy.spec.ts | 7e3a13 | expected: Error | bebc3e |
| 135 | 2026-10-22T20:23:43Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts --project=mobile-android | fail | yes | assertion | e2e/touch/files-copy.spec.ts | 7e3a13 | expected: Error | d2ca50 |
| 136 | 2026-10-22T20:23:52Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts | fail | yes | assertion | e2e/touch/files-copy.spec.ts | 7e3a13 | expected: DIAG | ec92cc |
| 137 | 2026-10-22T20:24:02Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts | fail | yes | assertion | e2e/touch/files-copy.spec.ts | c41dad | expected: DIAG | 6da2b4 |
| 138 | 2026-10-22T20:24:15Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts | fail | yes | assertion | e2e/touch/files-copy.spec.ts | 3de3ef | expected: DIAG | 6f982c |
| 139 | 2026-10-22T20:24:39Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts | fail | yes | assertion | e2e/touch/files-copy.spec.ts | 77266f | expected: DIAG | 1823e3 |
| 140 | 2026-10-22T20:24:55Z | T086 | VO-038 | red | e2e-touch | e2e/touch/files-copy.spec.ts | fail | yes | assertion | e2e/touch/files-copy.spec.ts | 240088 | expected: Error | 725422 |
| 141 | 2026-10-22T20:25:35Z | T088 | VO-039 | red | e2e-touch | e2e/touch/targets.spec.ts | fail | yes | assertion | e2e/touch/targets.spec.ts | 00d0de | expected: Received | 5ce7c2 |
| 142 | 2026-10-22T20:25:43Z | T088 | VO-039 | red | e2e-touch | e2e/touch/targets.spec.ts | fail | yes | assertion | e2e/touch/targets.spec.ts | 578a2b | expected: with the | 8eaa2e |
| 143 | 2026-10-22T20:26:01Z | T089 | VO-039 | green | e2e-touch | e2e/touch/targets.spec.ts | fail | no | unclassified | e2e/touch/targets.spec.ts | 578a2b | - | dda602 |
| 144 | 2026-10-22T20:27:12Z | T089 | VO-039 | green | e2e-touch | e2e/touch/targets.spec.ts | fail | no | environment | e2e/touch/targets.spec.ts | 578a2b | mobile-android passes all three tests; mobile-ios cannot launch (WebKit libraries missing) | 0924db |
| 145 | 2026-10-22T20:37:10Z | - | - | checkpoint | e2e-all | - | fail | no | environment | - | - | Phase 7 checkpoint; 12 mobile-ios tests cannot launch WebKit (libraries missing on this host); 1162 others passed; the one chromium failure, source-follows, passed on its own rerun (#146) in both browsers, so it was a flake under full-suite load, not a regression | f9b7eb |
| 146 | 2026-10-22T20:37:21Z | T051 | VO-024 | refactor | e2e | e2e/source-follows.spec.ts | pass | yes | - | e2e/source-follows.spec.ts | d9e68a | - | 0a5eca |
| 147 | 2026-10-22T20:37:29Z | T091 | VO-002 | red | unit | app/rendering/theme/noColourLiterals.test.ts | pass | no | - | app/rendering/theme/noColourLiterals.test.ts | bccc4e | passed on first run: investigate | d1f39c |
| 148 | 2026-10-22T20:37:38Z | T092 | VO-002 | green | unit | app/rendering/theme/noColourLiterals.test.ts | pass | yes | - | app/rendering/theme/noColourLiterals.test.ts | bccc4e | - | 4a779c |
| 149 | 2026-10-22T20:38:15Z | T093 | VO-004 | red | e2e | e2e/wcag.spec.ts e2e/canvas-wcag.spec.ts e2e/import-wcag.spec.ts | fail | no | defect | e2e/canvas-wcag.spec.ts, e2e/import-wcag.spec.ts, e2e/support/appearance.ts, e2e/wcag.spec.ts | 1d5c5c | failed for a different reason; my select string was passed as one argument, so no tests ran | ef0f88 |
| 150 | 2026-10-22T20:38:19Z | T093 | VO-004 | red | e2e | e2e/wcag.spec.ts e2e/canvas-wcag.spec.ts e2e/import-wcag.spec.ts | fail | no | defect | e2e/canvas-wcag.spec.ts, e2e/import-wcag.spec.ts, e2e/support/appearance.ts, e2e/wcag.spec.ts | 1d5c5c | failed for a different reason; same select mistake, no tests ran | a6ca61 |
| 151 | 2026-10-22T20:39:25Z | T093 | VO-004 | red | e2e | e2e/(wcag canvas-wcag import-wcag)\.spec\.ts | fail | yes | assertion | e2e/canvas-wcag.spec.ts, e2e/import-wcag.spec.ts, e2e/support/appearance.ts, e2e/wcag.spec.ts | 1d5c5c | expected: color-contrast | f8d987 |
| 152 | 2026-10-22T20:41:21Z | T094 | VO-004 | green | e2e | e2e/(wcag canvas-wcag import-wcag)\.spec\.ts | fail | no | defect | e2e/canvas-wcag.spec.ts, e2e/import-wcag.spec.ts, e2e/support/appearance.ts, e2e/wcag.spec.ts | 8dbb52 | my new test selected the second diagram in the same page, which the unsaved-diagram guard blocks; the test was split in two | 7676a6 |
| 153 | 2026-10-22T20:42:01Z | T094 | VO-004 | green | e2e | e2e/wcag\.spec\.ts | pass | yes | - | e2e/canvas-wcag.spec.ts, e2e/import-wcag.spec.ts, e2e/support/appearance.ts, e2e/wcag.spec.ts | 3d0b68 | - | 179480 |
| 154 | 2026-10-22T20:42:27Z | T095 | VO-021 | refactor | unit-all | - | pass | yes | - | - | - | - | e6ec84 |
| 155 | 2026-10-22T20:52:45Z | T095 | VO-021 | refactor | e2e | e2e/ | fail | no | unreliable | - | - | source-follows raced the background source check under full-suite load (Copy Source refused: still being checked); the test now waits for Valid before copying; every other test passed (1184) | 8af3cb |
| 156 | 2026-10-22T20:53:07Z | T051 | VO-024 | refactor | e2e | e2e/source-follows | pass | yes | - | e2e/source-follows.spec.ts | 120fb5 | - | 7981bb |
| 157 | 2026-10-22T21:03:18Z | T095 | VO-021 | refactor | e2e | e2e/ | pass | yes | - | - | - | - | 3ed4d1 |
| 158 | 2026-10-22T21:04:36Z | T095 | VO-021 | refactor | e2e-timing | e2e/ | pass | yes | - | - | - | - | ac19b9 |
| 159 | 2026-10-22T21:04:45Z | T098 | VO-044 | green | unit | app/generation/redesign-output.test.ts | pass | yes | - | app/generation/redesign-output.test.ts | 6cb572 | - | a3b18c |
| 160 | 2026-10-22T21:04:50Z | T098 | VO-044 | refactor | unit | app/generation/redesign-output.test.ts | pass | yes | - | app/generation/redesign-output.test.ts | 6cb572 | - | e2a3c0 |
| 161 | 2026-10-22T21:19:07Z | - | - | checkpoint | e2e-all | - | fail | no | environment | - | - | Final checkpoint; 12 mobile-ios tests cannot launch WebKit (libraries missing); firefox-timing sequence timing failed under load straight after the suite and passed on rerun (#163); 1212 others passed | 7ea023 |
| 162 | 2026-10-22T21:20:05Z | T100 | VO-045 | refactor | e2e-timing | redesign-performance | fail | no | unreliable | e2e/redesign-performance.spec.ts | 75d4af | chromium-timing flowchart timing missed its 10% limit on a loaded machine; the same suite passed in #158 and #163 with nothing changed | 8c5c73 |
| 163 | 2026-10-22T21:20:59Z | T100 | VO-045 | refactor | e2e-timing | redesign-performance | pass | yes | - | e2e/redesign-performance.spec.ts | 75d4af | - | 8bbd54 |

## Exceptions

| ID | Time | Task | Obligations | Kind | Rationale | Alternative verification | Needs approval | Approved by |
|----|------|------|-------------|------|-----------|--------------------------|----------------|-------------|
| EX-01 | 2026-10-22T12:53:22Z | T016 | VO-010 | no-meaningful-red | The header work of T015 changed no control except to add the two appearance buttons, so the control inventory already equals the pre-redesign inventory plus the switch when the test is first run. The test compares against lists recorded from the code at the pre-redesign commit, so it fails if any control is removed, renamed or added. | The test is written and passes against lists recorded from the pre-redesign code; it runs again at each later phase checkpoint, where it would catch a control removed by a layout change. | no | - |
| EX-02 | 2026-10-22T12:56:32Z | T020 | VO-014 | no-meaningful-red | The appearance is already written on every switch by the provider (T010 and T012) and read before the first frame, and the file, source and Markdown paths do not import the appearance, so the test passes on its first run. It asserts the reload result, the fallback for an unknown stored value and byte-equality of the outputs, so it fails if a write is dropped or an appearance leaks into the output. | The test is written and passes; it reloads the page, plants an unknown value and compares the saved file and both copies across appearances, and runs again at each later checkpoint. | no | - |
| EX-03 | 2026-10-22T12:59:21Z | T024 | VO-030 | no-meaningful-red | The tools area already exists: each diagram type's toolbox sits left of the canvas and the Properties region right of it, and the redesign moves neither (T015 changed only the header, T019 only their surface colour). The test passes on its first run. It names each type's toolbox items, selects an item, and checks the three regions' order on the page, so it fails if the layout changes. | The test is written and passes; it runs again at each phase checkpoint, including after the narrow layouts of US5 move these regions. | no | - |
| EX-04 | 2026-10-22T13:26:41Z | T039 | VO-018 | no-meaningful-red | The grid layers are drawn by T036 as React Flow background layers (which the library gives pointer-events: none) and as CSS backgrounds of the scrolling areas (which are not elements at all), so by the time this test is written nothing in the grid can receive an event, and the test passes on its first run. It reads the topmost element at points that show only grid, the grid layers' pointer-events, their number on a small and an enlarged canvas, and the running animations, so it fails if a grid layer starts to catch events, grows with the canvas or animates. | The test is written and passes; it runs again at each phase checkpoint. | no | - |
| EX-05 | 2026-10-22T13:50:52Z | T050 | VO-024 | no-meaningful-red | The source view has always shown the source generated from the diagram as it is now (it renders the source it is given on every change), and T049 only changed how that text is coloured, so the test passes on its first run. It compares the view with what Copy Source puts on the clipboard after an edit, an Undo and a Redo, so it fails if the view ever shows stale source. | The test is written and passes; it runs again at each checkpoint. | no | - |
| EX-06 | 2026-10-22T13:59:34Z | T065 | VO-029 | no-meaningful-red | Nothing in generation, the clipboard path or the file code imports the appearance (checked by search), and the Mermaid look is applied only when drawing, so the outputs are identical in both appearances and the test passes on its first run. It saves the file and copies the source and the Markdown in each appearance for each diagram type, and compares them with each other and with the Markdown fence, so it fails if any look leaks into the output. | The test is written and passes; the byte comparison with the pre-redesign output (VO-044) covers the same property against recorded snapshots. | no | - |
| EX-07 | 2026-10-22T14:13:21Z | T072 | VO-034 | no-meaningful-red | The tools panel (T071) keeps its open state in the Workspace component and the draft and selection in the editor's reducer from the start, so closing and reopening it cannot lose them, and the test passes on its first run. It selects a node, opens the panel, types a draft, closes the panel, and checks the selection, the draft after reopening, and the canvas's transform and zoom shown, so it fails if the panel's state ever moves into what the canvas or the draft depends on. | The test is written and passes; it runs again at each checkpoint. | no | - |
| EX-08 | 2026-10-22T14:35:39Z | T080 | VO-043 | no-meaningful-red | The rule that a finger which goes down while an item drag is under way is ignored was written with the touch handler itself (T079, which also tracks pan and pinch), so the test passes on its first run. To show the test can fail, the rule was removed for one run (a mutation, restored at once): with it removed the same test failed on the Android profile with the zoom at 267% instead of 100% and the C4 drag giving a different source. With the rule in place it passes on both profiles. | The test is written and passes on both emulated phones; the mutation run above shows it fails without the rule. | no | - |
| EX-09 | 2026-10-22T17:45:23Z | T063 | VO-028 | no-meaningful-red | The drawing function draws through Mermaid, which lets style and class statements in the source win over theme variables, and the blueprint look is only theme variables (T058), so the property holds when the test is first run. The test draws a source with a style, a class and a plain node in Blueprint Studio and reads the computed fills, so it fails if the look were ever applied in a way that overrides source styles (for example by restyling the drawn SVG). | The test is written and passes in both desktop browsers (decision DN-01: verified at the drawing function). | no | - |
| EX-10 | 2026-10-22T19:50:03Z | T099 | VO-045 | other | The test compares the redesigned editor with medians captured from the unchanged editor (T003), so it can only fail once the redesign exists. It was first run at checkpoints (#68, #70, #71, assertion failures: a real slowdown, flowchart pan 191 ms against 133 ms) rather than as a red run of its own task. | Records #68, #70 and #71 show the failure; the later runs #120, #123 and #125 failed on assertions; #126 passes. | yes | Lee Sinclair |
| EX-11 | 2026-10-22T19:59:21Z | T082 | VO-036 | no-meaningful-red | A flowchart is built by touch with React Flow's own touch handling, which the redesign leaves as it was, so the test passes once the touch helper is right. The earlier failure at the rename after a connect drag was the test's: a finger lifted while still moving starts a fling in Chromium, and the next tap only stops it. | Mutation check: with the double-tap rename switched off in FlowchartCanvas the test fails on Android at the label field; the code was restored. | no | - |
| EX-12 | 2026-10-22T20:25:05Z | T086 | VO-038 | no-meaningful-red | Saving, reopening, copying and switching appearance by touch already work: the test passes on mobile-android on its first correct run; its earlier failures were test timing, and the iOS profile cannot launch on this host | The test passes on mobile-android; the iOS profile is deferred (environment) | no | - |
| EX-13 | 2026-10-22T20:37:37Z | T091 | VO-002 | no-meaningful-red | Earlier tasks (T006, T012, T042, T044) already moved every colour into app/rendering/theme/tokens.ts, so no literal remains; a manual grep for hex, rgb(), hsl() and white/black finds none, and the test's patterns were checked to match sample literals | The test passes and its search is shown non-empty by a second assertion | no | - |
| EX-14 | 2026-10-22T20:42:21Z | T095 | VO-021 | behaviour-preserving | The redesign must leave behaviour as it was; the existing unit and desktop end-to-end suites passed at the T001 baseline and are rerun unchanged, so there is no failing-first test to write | unit-all and the full desktop end-to-end suite (and the timing projects) pass before (baseline) and after the redesign | no | - |
| EX-15 | 2026-10-22T21:04:42Z | T097 | VO-044 | behaviour-preserving | Generation is unchanged by the redesign, and the snapshot was taken from the unchanged code (T002), so the comparison is expected to pass on its first run | The test compares every corpus document and e2e fixture byte for byte with the T002 snapshot, and passes | no | - |

## Expectation changes

| ID | Time | Task | Files | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|-------|--------------|---------------|------------------|-------------|-----------------|
| XC-01 | 2026-10-22T13:10:00Z | T042 | e2e/selection-style.spec.ts | FR-015 | Correction: the sequence case hovers the participant's header, which owns the hover outline, instead of the middle of the whole participant (its lifeline). No assertion about colour, width or dash was changed. | no | - | 080b80 |
| XC-02 | 2026-10-22T13:25:50Z | T038 | e2e/grid-alignment.spec.ts | FR-013 | Correction: the test waits for the animated zoom to settle before reading the item's place against the grid, and reads the settled zoom from the grid spacing. The tolerance (1 px) and every assertion about alignment are unchanged. The product needed no change: the grid already followed the viewport. | no | - | f7e872 |
| XC-03 | 2026-10-22T13:38:27Z | T038 | e2e/grid-alignment.spec.ts | FR-013 | Correction: after panning or scrolling the test now waits for the item's place against the grid to settle (Firefox scrolls smoothly) before comparing, as it already does after zooming. The 1 px tolerance and all assertions are unchanged. | no | - | 978365 |
| XC-04 | 2026-10-22T13:50:24Z | T049 | e2e/source-highlight.spec.ts | FR-017 | Correction: a sequence diagram's generated source has no quoted labels and a C4 one has no arrows, so each type is checked for the kinds of run it has (flowchart: keyword, string, operator; sequence: keyword, operator; C4: keyword, string). Every assertion about text equality, the monospace face, distinct colours and read-only is unchanged. | no | - | 267416 |
| XC-05 | 2026-10-22T13:52:58Z | T055 | e2e/source-status.spec.ts | FR-018 | Correction: each diagram (C4 notice, flowchart valid) is opened in its own page, because a hash-only navigation inside one page left the previous diagram open. The colours asserted (amber warning, green success, in both appearances) and the words are unchanged. | no | - | cae316 |
| XC-06 | 2026-10-22T13:55:24Z | T058 | app/rendering/shared/mermaidRuntime.test.ts | FR-019 | Correction found by the preview test (VO-026): Mermaid 12's base theme outlines nodes with a gradient unless the theme variable useGradient is false, so the Blueprint Studio configuration sets it. This adds one theme variable to the expected configuration; the security level, theme and every colour are unchanged. | no | - | e31bed |
| XC-07 | 2026-10-22T14:13:46Z | T017 | e2e/workspace-controls.spec.ts | FR-009 | Refactor of the test file only: the recorded pre-redesign control lists moved unchanged into e2e/support/controlInventory.ts so the narrow layout test (VO-035) holds the editor to the same lists. No assertion changed. | no | - | fcfdb5 |
| XC-08 | 2026-10-22T14:18:23Z | T075 | e2e/narrow-controls.spec.ts | FR-010 | Correction: the test looks for each pre-redesign control on the page first and then, for those not on it, as an item of the More actions menu opened on its own (an open menu is modal and hides the page from the accessibility tree). The widths, the list of controls, the no-sideways-scroll check and the Copy Source assertion are unchanged. | no | - | 81bda4 |
| XC-09 | 2026-10-22T14:31:55Z | T079 | e2e/touch/gestures.spec.ts | FR-028 | Corrections to the test's geometry, found while making it pass: the drag starts at a point of empty canvas found on the screen (not a fixed corner, which can be off screen or on an item or a link); a sequence or C4 drawing is zoomed only until it scrolls (at the maximum one item covers the screen); each pinch starts with both fingers on empty canvas (a finger on an item belongs to that item's drag by design) and runs together then apart; the double-tap on a sequence participant targets its header. Every assertion about panning, scrolling, zooming, the page's own scale, the header's size and renaming is unchanged. | no | - | 466a35 |
| XC-10 | 2026-10-22T18:51:15Z | T099 | e2e/redesign-performance.spec.ts | SC-007 | Firefox needs one extra frame (1000/60 ms) to scroll a sequence diagram of 100 elements, because the canvas now scrolls inside itself; the allowance is for that action in that browser only | yes | Lee Sinclair | 1dd121 |
| XC-11 | 2026-10-22T19:47:09Z | T099 | e2e/redesign-performance.spec.ts | SC-007 | Firefox: one extra frame for scrolling a sequence or C4 diagram (canvas scrolls inside itself) and for actions with a baseline under 100 ms (a few frames, varies by one between runs); Chromium keeps the 10 % limit | yes | Lee Sinclair | 75d4af |
| XC-12 | 2026-10-22T20:42:09Z | T094 | e2e/wcag.spec.ts | FR-020 | Correction: the new test for a selected C4 element and a selected participant waited for a Label field that appears only once the item is selected, and tried two diagrams in one page; it now selects the item as the other tests do and is two tests. No assertion was weakened. | no | - | 691017 |
| XC-13 | 2026-10-22T20:42:13Z | T094 | e2e/canvas-wcag.spec.ts, e2e/import-wcag.spec.ts, e2e/support/appearance.ts, e2e/wcag.spec.ts | FR-020 | Correction: the new selected-item tests in e2e/wcag.spec.ts were fixed to select the item as the other tests do and split in two; no assertion was weakened and the other files are unchanged | no | - | 3d0b68 |

## Decisions

| ID | Opened | Question | Tasks | Status | Answer | Decided by | Resolved |
|----|--------|----------|-------|--------|--------|------------|----------|
| DN-01 | 2026-10-22T13:58:45Z | US4-AS3 says styles written in imported source stay visible in its picture over the blueprint defaults. But the editor drops style, classDef and class statements on import (the report says 'Styling is not kept') and the import picture draws the source generated from the imported model, so no screen draws source with custom styles. How should VO-028 be verified: (A) at the drawing function, by drawing a source with a style statement in the browser and checking the style wins over the blueprint theme, noting that no editor screen shows it; (B) change the import picture to draw the original text (alters feature 005 behaviour, not allowed by FR-024 without approval); or (C) drop the clause from US4-AS3 and FR-019? | T063, T064 | resolved | A: VO-028 is verified at the drawing function; no editor screen draws source with custom styles because import drops them (feature 005, kept as is). | Lee Sinclair | 2026-10-22T17:44:20Z |

## Behaviour items at baseline

| Item | Verified by | Fingerprint | Seq |
|------|-------------|-------------|-----|
| BI-001 | VO-008, MV-003 | 95457d | 1 |
| BI-002 | VO-009 | 48113a | 1 |
| BI-003 | VO-010 | 878524 | 1 |
| BI-004 | VO-011 | f8d9b3 | 1 |
| BI-005 | VO-012, VO-003 | 0ef3d2 | 1 |
| BI-006 | VO-015, VO-016, MV-001 | 4391f3 | 1 |
| BI-007 | VO-017, VO-015 | 56a991 | 1 |
| BI-008 | VO-018, VO-021 | 7c8457 | 1 |
| BI-009 | VO-019 | fc507b | 1 |
| BI-010 | VO-020 | 16cd21 | 1 |
| BI-011 | VO-022, VO-023 | f85fdc | 1 |
| BI-012 | VO-024 | 065516 | 1 |
| BI-013 | VO-006, VO-007 | 1b5db6 | 1 |
| BI-014 | VO-025, VO-026 | ae0fa2 | 1 |
| BI-015 | VO-027 | 7cab54 | 1 |
| BI-016 | VO-028 | d487a6 | 1 |
| BI-017 | VO-029, VO-021 | e1bb78 | 1 |
| BI-018 | VO-032, VO-033 | 6f0b29 | 1 |
| BI-019 | VO-034 | 5321c5 | 1 |
| BI-020 | VO-035 | e2620d | 1 |
| BI-021 | VO-036, VO-037, VO-038, VO-039 | 44c951 | 1 |
| BI-022 | VO-001 | a01c2a | 1 |
| BI-023 | VO-002 | b6f8e6 | 1 |
| BI-024 | VO-003, VO-004 | 2ea338 | 1 |
| BI-025 | VO-005, MV-002 | 3d9b4b | 1 |
| BI-026 | VO-030 | b68247 | 1 |
| BI-027 | VO-031 | 4240db | 1 |
| BI-028 | exemption FR-014 | 55f0d0 | 1 |
| BI-029 | VO-021 | cd0ade | 1 |
| BI-030 | VO-013, VO-014 | 28c794 | 1 |
| BI-031 | VO-040, VO-041 | d1f6c8 | 1 |
| BI-033 | VO-042 | 6b78d2 | 1 |
| BI-034 | VO-043 | 922805 | 1 |
| BI-035 | VO-044 | d77097 | 1 |
| BI-036 | VO-045 | 05a0c7 | 1 |
| BI-032 | MV-001 | d2284a | 1 |

## Behaviour item changes

| ID | Time | Item | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|--------------|---------------|------------------|-------------|-----------------|
| BX-01 | 2026-10-22T17:44:36Z | BI-016 | FR-019 | Decision DN-01 (Lee Sinclair, 2026-10-23): the editor drops style statements on import and draws generated source, so the scenario is verified at the drawing function instead of the import picture. The expected result (style wins over the blueprint fill, other nodes keep it) is unchanged. | yes | Lee Sinclair | dc7233 |
| BX-02 | 2026-10-22T18:51:15Z | BI-036 | SC-007 | Same allowance recorded in the item: one extra frame for scrolling a sequence diagram in Firefox | yes | Lee Sinclair | cf0606 |
| BX-03 | 2026-10-22T19:47:09Z | BI-036 | SC-007 | Same allowance in the item: Firefox one extra frame for sequence/C4 scroll and for actions with a baseline under 100 ms | yes | Lee Sinclair | a37932 |

## Deferrals

| ID | Time | Obligations | Reason | Basis | Needs approval | Approved by | Check |
|----|------|-------------|--------|-------|----------------|-------------|-------|
| DF-01 | 2026-10-22T20:21:29Z | VO-037 | mobile-ios cannot launch on this host (WebKit build needs libicu74, libxml2, libflite1, libjxl); the test passes on mobile-android; developer chose to defer the iOS profile | environment failure #130 | no | - | 56bc83 |
| DF-02 | 2026-10-22T20:25:05Z | VO-038 | mobile-ios cannot launch on this host (WebKit build needs libicu74, libxml2, libflite1, libjxl); passes on mobile-android; developer chose to defer the iOS profile | other | yes | Lee Sinclair | 04fe1f |
| DF-03 | 2026-10-22T20:27:16Z | VO-039 | mobile-ios cannot launch on this host (WebKit build needs libicu74, libxml2, libflite1, libjxl); passes on mobile-android; developer chose to defer the iOS profile | environment failure #144 | no | - | 26de2e |
