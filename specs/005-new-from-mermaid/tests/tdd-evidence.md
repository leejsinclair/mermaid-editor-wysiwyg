# TDD Evidence: 005-new-from-mermaid

<!-- Written by tdd_check.py. Do not edit by hand: use the script's subcommands. -->

## Summary

_Generated from the tables below on 2026-10-20T23:27:21Z._

| Obligation | Requirements | Status | Tests | Latest result |
|------------|--------------|--------|-------|---------------|
| VO-001 | FR-001, US1-AS1 | verified | e2e/import-open.spec.ts | pass (#40) |
| VO-002 | FR-002, FR-003, US1-AS2 | verified | e2e/import-preview.spec.ts | pass (#42) |
| VO-003 | FR-003, US1-AS3 | verified | e2e/import-confirm.spec.ts | pass (#44) |
| VO-004 | FR-011, US1-AS4 | verified | e2e/import-undo-reopen.spec.ts | pass (#46) |
| VO-005 | FR-002, US1-AS5 | verified | app/importing/document.test.ts | pass (#7) |
| VO-006 | FR-005, US1-AS5 | verified | e2e/import-types.spec.ts | pass (#51) |
| VO-007 | FR-005 | verified | app/importing/flowchart.test.ts | pass (#21) |
| VO-008 | FR-005 | verified | app/editor/mermaidSnapshot.flowchart.test.ts | pass (#17) |
| VO-009 | FR-005 | verified | app/importing/sequence.test.ts | pass (#23) |
| VO-010 | FR-005 | verified | app/editor/mermaidSnapshot.sequence.test.ts | pass (#19) |
| VO-011 | FR-005 | verified | app/importing/c4.test.ts | pass (#25) |
| VO-012 | FR-004, US3-AS1 | verified | e2e/import-error.spec.ts | pass (#99) |
| VO-013 | FR-004, SC-004 | verified | app/editor/mermaidParser.test.ts | pass (#15) |
| VO-014 | US3-AS2 | verified | e2e/import-error.spec.ts | pass (#101) |
| VO-015 | US3-AS3 | verified | e2e/import-unsupported.spec.ts | pass (#103) |
| VO-016 | US3-AS4 | verified | e2e/import-empty.spec.ts | pass (#105) |
| VO-017 | FR-006, US2-AS1 | verified | app/importing/scan.test.ts | pass (#65) |
| VO-018 | FR-006, EC-05 | verified | app/importing/scan.test.ts | pass (#67) |
| VO-019 | FR-006 | verified | app/importing/scan.test.ts | pass (#69) |
| VO-020 | FR-006, US2-AS3 | verified | app/importing/approximate.test.ts | pass (#71) |
| VO-021 | FR-007, US2-AS2 | verified | e2e/import-report.spec.ts | pass (#83) |
| VO-022 | FR-007, US2-AS4 | verified | e2e/import-report.spec.ts | pass (#85) |
| VO-023 | FR-013, US2-AS5 | verified | e2e/import-report.spec.ts | pass (#88) |
| VO-024 | FR-006 | verified | e2e/import-report.spec.ts | pass (#91) |
| VO-025 | FR-008 | verified | app/importing/layout.test.ts | pass (#13) |
| VO-026 | FR-008 | verified | e2e/import-positions.spec.ts | pass (#54) |
| VO-027 | FR-009, EC-03 | verified | app/importing/decode.test.ts | pass (#5) |
| VO-028 | FR-009, SC-006 | verified | app/importing/roundtrip.test.ts | pass (#32) |
| VO-029 | FR-010, US4-AS1 | verified | e2e/import-compare.spec.ts | pass (#118) |
| VO-030 | US4-AS2 | verified | e2e/import-compare.spec.ts | pass (#120) |
| VO-031 | US4-AS3 | verified | e2e/import-compare.spec.ts | pass (#122) |
| VO-032 | FR-010 | verified | app/importing/compare.test.ts | pass (#116) |
| VO-033 | FR-011 | verified | app/importing/naming.test.ts, app/importing/readDocument.test.ts | pass (#30) |
| VO-034 | FR-011 | verified | e2e/import-name.spec.ts | pass (#56) |
| VO-035 | FR-011, SC-006, DC-01 | verified | app/importing/saved.test.ts | pass (#37) |
| VO-036 | FR-011 | verified | e2e/import-storage-failure.spec.ts | pass (#60) |
| VO-037 | FR-012, EC-02 | verified | app/importing/document.test.ts, app/importing/readDocument.test.ts | pass (#81) |
| VO-038 | US5-AS1 | verified | e2e/import-drop.spec.ts | pass (#143) |
| VO-039 | FR-012, US5-AS2 | verified | e2e/import-markdown.spec.ts | pass (#129) |
| VO-040 | US5-AS3 | verified | e2e/import-bad-file.spec.ts | pass (#141) |
| VO-041 | FR-016, EC-08 | verified | app/importing/readDocument.test.ts | pass (#27) |
| VO-042 | FR-016, EC-06 | verified | app/importing/readDocument.test.ts | pass (#107) |
| VO-043 | FR-013, SC-007 | verified | e2e/import-wcag.spec.ts | pass (#147) |
| VO-044 | FR-013 | verified | e2e/import-keyboard.spec.ts | pass (#149) |
| VO-045 | FR-014, EC-12 | verified | e2e/import-no-network.spec.ts | pass (#151) |
| VO-046 | FR-014, EC-12 | verified | app/importing/untrusted.test.ts | pass (#73) |
| VO-047 | FR-015 | verified | e2e/import-source-readonly.spec.ts | pass (#153) |
| VO-048 | EC-01, EC-13 | verified | app/importing/scan.test.ts | pass (#75) |
| VO-049 | EC-04 | verified | app/importing/flowchart.test.ts | pass (#78) |
| VO-050 | EC-07, SC-005 | verified | e2e/import-performance.spec.ts | pass (#155) |
| VO-051 | EC-09 | verified | e2e/import-latest.spec.ts | pass (#110) |
| VO-052 | EC-10 | verified | e2e/import-escape.spec.ts | pass (#157) |
| VO-053 | EC-11 | verified | e2e/import-two-tabs.spec.ts | pass (#159) |
| VO-054 | SC-002 | verified | app/importing/corpus.test.ts | pass (#93) |
| VO-055 | SC-003 | verified | app/importing/corpus.test.ts | pass (#95) |
| VO-056 | FR-002 | verified | e2e/import-choose-file.spec.ts, e2e/import-(drop bad-file choose-file).spec.ts, e2e/import-drop.spec.ts e2e/import-bad-file.spec.ts e2e/import-choose-file.spec.ts, e2e/import-drop.spec.ts | pass (#142) |

| Behaviour item | Scenario | Obligations | Status | Tests |
|----------------|----------|-------------|--------|-------|
| BI-001 | US1-AS1 | VO-001 | verified | e2e/import-open.spec.ts |
| BI-002 | US1-AS2 | VO-002, VO-005 | verified | e2e/import-preview.spec.ts, app/importing/document.test.ts |
| BI-003 | US1-AS3 | VO-003 | verified | e2e/import-confirm.spec.ts |
| BI-004 | US1-AS4 | VO-004 | verified | e2e/import-undo-reopen.spec.ts |
| BI-005 | US1-AS5 | VO-005, VO-006 | verified | app/importing/document.test.ts, e2e/import-types.spec.ts |
| BI-006 | US2-AS1 | VO-017, VO-019 | verified | app/importing/scan.test.ts |
| BI-007 | US2-AS2 | VO-021 | verified | e2e/import-report.spec.ts |
| BI-008 | US2-AS3 | VO-020 | verified | app/importing/approximate.test.ts |
| BI-009 | US2-AS4 | VO-022 | verified | e2e/import-report.spec.ts |
| BI-010 | US2-AS5 | VO-023 | verified | e2e/import-report.spec.ts |
| BI-011 | US3-AS1 | VO-012, VO-013 | verified | e2e/import-error.spec.ts, app/editor/mermaidParser.test.ts |
| BI-012 | US3-AS2 | VO-014 | verified | e2e/import-error.spec.ts |
| BI-013 | US3-AS3 | VO-015 | verified | e2e/import-unsupported.spec.ts |
| BI-014 | US3-AS4 | VO-016 | verified | e2e/import-empty.spec.ts |
| BI-015 | US4-AS1 | VO-029, VO-032 | verified | e2e/import-compare.spec.ts, app/importing/compare.test.ts |
| BI-016 | US4-AS2 | VO-030 | verified | e2e/import-compare.spec.ts |
| BI-017 | US4-AS3 | VO-031 | verified | e2e/import-compare.spec.ts |
| BI-018 | US5-AS1 | VO-038 | verified | e2e/import-drop.spec.ts |
| BI-019 | US5-AS2 | VO-039 | verified | e2e/import-markdown.spec.ts |
| BI-020 | US5-AS3 | VO-040 | verified | e2e/import-bad-file.spec.ts |
| BI-021 | - | VO-007, VO-008, VO-009, VO-010, VO-011 | verified | app/importing/flowchart.test.ts, app/editor/mermaidSnapshot.flowchart.test.ts, app/importing/sequence.test.ts, app/editor/mermaidSnapshot.sequence.test.ts, app/importing/c4.test.ts |
| BI-022 | - | VO-018 | verified | app/importing/scan.test.ts |
| BI-023 | - | VO-024 | verified | e2e/import-report.spec.ts |
| BI-024 | - | VO-025, VO-026 | verified | app/importing/layout.test.ts, e2e/import-positions.spec.ts |
| BI-025 | - | VO-027, VO-028 | verified | app/importing/decode.test.ts, app/importing/roundtrip.test.ts |
| BI-026 | - | VO-033, VO-034, VO-035 | verified | app/importing/naming.test.ts, app/importing/readDocument.test.ts, e2e/import-name.spec.ts, app/importing/saved.test.ts |
| BI-027 | - | VO-036 | verified | e2e/import-storage-failure.spec.ts |
| BI-028 | - | VO-056 | verified | e2e/import-choose-file.spec.ts, e2e/import-(drop bad-file choose-file).spec.ts, e2e/import-drop.spec.ts e2e/import-bad-file.spec.ts e2e/import-choose-file.spec.ts, e2e/import-drop.spec.ts |
| BI-029 | - | VO-043, VO-044 | verified | e2e/import-wcag.spec.ts, e2e/import-keyboard.spec.ts |
| BI-030 | - | VO-045, VO-046 | verified | e2e/import-no-network.spec.ts, app/importing/untrusted.test.ts |
| BI-031 | - | VO-047 | verified | e2e/import-source-readonly.spec.ts |
| BI-032 | - | VO-041 | verified | app/importing/readDocument.test.ts |
| BI-033 | - | VO-042 | verified | app/importing/readDocument.test.ts |
| BI-034 | - | VO-048 | verified | app/importing/scan.test.ts |
| BI-035 | - | VO-037 | verified | app/importing/document.test.ts, app/importing/readDocument.test.ts |
| BI-036 | - | VO-049 | verified | app/importing/flowchart.test.ts |
| BI-037 | - | VO-050 | verified | e2e/import-performance.spec.ts |
| BI-038 | - | VO-051 | verified | e2e/import-latest.spec.ts |
| BI-039 | - | VO-052 | verified | e2e/import-escape.spec.ts |
| BI-040 | - | VO-053 | verified | e2e/import-two-tabs.spec.ts |
| BI-041 | - | VO-054 | verified | app/importing/corpus.test.ts |
| BI-042 | - | VO-055 | verified | app/importing/corpus.test.ts |

Not verified by tests

- MV-001 manual: open
- MV-002 manual: open
- MV-003 manual: open
- MV-004 manual: open

Counts: verified 56, deferred 0, manual checks 4 open

**Not verified**: none.

**Open decisions**: none. **Exceptions**: EX-01 no-meaningful-red on T026 for VO-033; EX-02 no-meaningful-red on T030 for VO-035; EX-03 no-meaningful-red on T039 for VO-004; EX-04 no-meaningful-red on T041 for VO-006; EX-05 no-meaningful-red on T043 for VO-026; EX-06 no-meaningful-red on T073 for VO-054; EX-07 no-meaningful-red on T079 for VO-014; EX-08 no-meaningful-red on T087 for VO-051; EX-09 no-meaningful-red on T099 for VO-039; EX-10 no-meaningful-red on T105 for VO-043; EX-11 no-meaningful-red on T111 for VO-047; EX-12 no-meaningful-red on T115 for VO-052; EX-13 no-meaningful-red on T117 for VO-053. **Expectation changes**: XC-01 on T016 for FR-005; XC-02 on T017 for FR-005; XC-03 on T028 for SC-006; XC-04 on T029 for SC-006; XC-05 on T037 for FR-003; XC-06 on T038 for FR-003; XC-07 on T041 for FR-005; XC-08 on T042 for FR-002; XC-09 on T041 for FR-005; XC-10 on T042 for FR-002; XC-11 on T041 for FR-002; XC-12 on T042 for FR-002; XC-13 on T043 for FR-008; XC-14 on T044 for FR-008; XC-15 on T047 for FR-011; XC-16 on T048 for FR-011; XC-17 on T047 for FR-011; XC-18 on T048 for FR-011; XC-19 on T055 for FR-006; XC-20 on T056 for FR-006; XC-21 on T061 for FR-009; XC-22 on T062 for FR-009; XC-23 on T063 for FR-012; XC-24 on T064 for FR-012; XC-25 on T007 for FR-012; XC-26 on T073 for SC-002; XC-27 on T088 for SC-005; XC-28 on T113 for SC-005; XC-29 on T114 for SC-005.

**Item changes**: none.

**Pre-existing failures**: none.

## Baseline

| Seq | Command | Result | Pre-existing failures |
|-----|---------|--------|-----------------------|
| 1 | unit-all | pass | - |
| 2 | e2e-all | pass | - |

## Test execution records

| Seq | Time | Task | Obligations | Phase | Command | Selector | Result | Valid | Classification | Files | Fingerprint | Note | Check |
|-----|------|------|-------------|-------|---------|----------|--------|-------|----------------|-------|-------------|------|-------|
| 1 | 2026-10-20T09:24:40Z | - | - | baseline | unit-all | - | pass | yes | - | - | - | - | de33c0 |
| 2 | 2026-10-20T09:32:13Z | - | - | baseline | e2e-all | - | pass | yes | - | - | - | - | e939f0 |
| 3 | 2026-10-20T09:32:19Z | T009 | VO-033 | green | unit | app/importing/naming.test.ts | pass | yes | - | - | - | - | eac98a |
| 4 | 2026-10-20T09:32:49Z | T002 | VO-027 | red | unit | app/importing/decode.test.ts | fail | yes | assertion | app/importing/decode.test.ts | b51894 | expected: decodeLabel: not implemented; replay: evidence was overwritten by a concurrent baseline run; test file unchanged since its original red | 1a407e |
| 5 | 2026-10-20T09:32:49Z | T003 | VO-027 | green | unit | app/importing/decode.test.ts | pass | yes | - | app/importing/decode.test.ts | b51894 | replay after the evidence overwrite | 9f37af |
| 6 | 2026-10-20T09:32:56Z | T004 | VO-005 | red | unit | app/importing/document.test.ts | fail | yes | assertion | app/importing/document.test.ts | dc29ca | expected: detectType: not implemented; replay: evidence was overwritten by a concurrent baseline run; test file as it was at the original red | 3b526b |
| 7 | 2026-10-20T09:32:57Z | T005 | VO-005 | green | unit | app/importing/document.test.ts | pass | yes | - | app/importing/document.test.ts | dc29ca | replay after the evidence overwrite | 92cc32 |
| 8 | 2026-10-20T09:32:57Z | T006 | VO-037 | red | unit | app/importing/document.test.ts | fail | yes | assertion | app/importing/document.test.ts | cc3ed6 | expected: splitDocument: not implemented; replay after the evidence overwrite | 6b18b9 |
| 9 | 2026-10-20T09:32:58Z | T007 | VO-037 | green | unit | app/importing/document.test.ts | pass | yes | - | app/importing/document.test.ts | cc3ed6 | replay after the evidence overwrite | 01a4fd |
| 10 | 2026-10-20T09:33:04Z | T008 | VO-033 | red | unit | app/importing/naming.test.ts | fail | yes | assertion | app/importing/naming.test.ts | 546465 | expected: nameFor: not implemented; replay after the evidence overwrite | 447c4d |
| 11 | 2026-10-20T09:33:04Z | T009 | VO-033 | green | unit | app/importing/naming.test.ts | pass | yes | - | app/importing/naming.test.ts | 546465 | replay after the evidence overwrite | c05cf4 |
| 12 | 2026-10-20T09:33:58Z | T010 | VO-025 | red | unit | app/importing/layout.test.ts | fail | yes | assertion | app/importing/layout.test.ts | fe178c | expected: layoutFlowchart: not implemented | ca7242 |
| 13 | 2026-10-20T09:34:40Z | T011 | VO-025 | green | unit | app/importing/layout.test.ts | pass | yes | - | app/importing/layout.test.ts | fe178c | - | 6e458e |
| 14 | 2026-10-20T09:35:41Z | T012 | VO-013 | red | unit | app/editor/mermaidParser.test.ts | fail | yes | assertion | app/editor/mermaidParser.test.ts | e7003f | expected: parseLocated: not implemented | b5cce4 |
| 15 | 2026-10-20T09:36:16Z | T013 | VO-013 | green | unit | app/editor/mermaidParser.test.ts | pass | yes | - | app/editor/mermaidParser.test.ts | e7003f | - | 8b76f1 |
| 16 | 2026-10-20T09:36:45Z | T014 | VO-008 | red | unit | app/editor/mermaidSnapshot.flowchart.test.ts | fail | yes | assertion | app/editor/mermaidSnapshot.flowchart.test.ts | 16f7b8 | expected: snapshotFlowchart: not implemented | eb2c78 |
| 17 | 2026-10-20T09:37:08Z | T015 | VO-008 | green | unit | app/editor/mermaidSnapshot.flowchart.test.ts | pass | yes | - | app/editor/mermaidSnapshot.flowchart.test.ts | 16f7b8 | - | 434fba |
| 18 | 2026-10-20T09:37:42Z | T016 | VO-010 | red | unit | app/editor/mermaidSnapshot.sequence.test.ts | fail | yes | assertion | app/editor/mermaidSnapshot.sequence.test.ts | 1d5555 | expected: snapshotSequence: not implemented | eb6b94 |
| 19 | 2026-10-20T09:38:09Z | T017 | VO-010 | green | unit | app/editor/mermaidSnapshot.sequence.test.ts | pass | yes | - | app/editor/mermaidSnapshot.sequence.test.ts | 1360f8 | - | ccef6b |
| 20 | 2026-10-20T09:39:40Z | T018 | VO-007 | red | unit | app/importing/flowchart.test.ts | fail | yes | assertion | app/importing/flowchart.test.ts | 0d1879 | expected: readFlowchart: not implemented | daa171 |
| 21 | 2026-10-20T09:39:58Z | T019 | VO-007 | green | unit | app/importing/flowchart.test.ts | pass | yes | - | app/importing/flowchart.test.ts | 0d1879 | - | 2fbedc |
| 22 | 2026-10-20T09:40:14Z | T020 | VO-009 | red | unit | app/importing/sequence.test.ts | fail | yes | assertion | app/importing/sequence.test.ts | 019fbf | expected: readSequence: not implemented | 4c8702 |
| 23 | 2026-10-20T09:40:31Z | T021 | VO-009 | green | unit | app/importing/sequence.test.ts | pass | yes | - | app/importing/sequence.test.ts | 019fbf | - | 5df539 |
| 24 | 2026-10-20T09:41:17Z | T022 | VO-011 | red | unit | app/importing/c4.test.ts | fail | yes | assertion | app/importing/c4.test.ts | bbadcf | expected: readC4: not implemented | 04ac7a |
| 25 | 2026-10-20T09:42:32Z | T023 | VO-011 | green | unit | app/importing/c4.test.ts | pass | yes | - | app/importing/c4.test.ts | bbadcf | - | cac4c2 |
| 26 | 2026-10-20T09:43:32Z | T024 | VO-041 | red | unit | app/importing/readDocument.test.ts | fail | yes | assertion | app/importing/readDocument.test.ts | 4659af | expected: readDocument: not implemented | 11d5f1 |
| 27 | 2026-10-20T09:45:16Z | T025 | VO-041 | green | unit | app/importing/readDocument.test.ts | pass | yes | - | app/importing/readDocument.test.ts | 4659af | - | 2ecbe4 |
| 28 | 2026-10-20T09:45:29Z | T026 | VO-033 | red | unit | app/importing/readDocument.test.ts | pass | no | - | app/importing/readDocument.test.ts | 70f3ee | passed on first run: investigate | f6cadb |
| 29 | 2026-10-20T09:45:54Z | T026 | VO-033 | red | unit | app/importing/readDocument.test.ts | pass | no | - | app/importing/readDocument.test.ts | 46fa92 | passed on first run: investigate | e53648 |
| 30 | 2026-10-20T09:45:59Z | T027 | VO-033 | green | unit | app/importing/readDocument.test.ts | pass | yes | - | app/importing/naming.test.ts | 546465 | - | a8fad0 |
| 31 | 2026-10-20T09:46:46Z | T028 | VO-028 | red | unit | app/importing/roundtrip.test.ts | fail | yes | assertion | app/importing/roundtrip.test.ts | 99e1d4 | expected: expected | a9852c |
| 32 | 2026-10-20T09:47:33Z | T029 | VO-028 | green | unit | app/importing/roundtrip.test.ts | pass | yes | - | app/importing/roundtrip.test.ts | 26d28e | - | 44f581 |
| 33 | 2026-10-20T09:47:44Z | - | - | checkpoint | unit-all | - | fail | no | unclassified | - | - | Phase 2 checkpoint, recorded late: it should have followed T017; run after T029 | 849627 |
| 34 | 2026-10-20T09:48:36Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | Phase 2 checkpoint, recorded late (it should have followed T017); run after T029 | 5f93b6 |
| 35 | 2026-10-20T09:49:01Z | T030 | VO-035 | red | unit | app/importing/saved.test.ts | fail | no | defect | app/importing/saved.test.ts | 2d7be6 | failed for a different reason; The test itself read the wrong property of the open-file result (diagram, not model), so the run failed for a reason outside the imported behaviour. Corrected in the test before the Green run; no implementation was involved. | d35ba1 |
| 36 | 2026-10-20T09:49:21Z | T030 | VO-035 | red | unit | app/importing/saved.test.ts | pass | no | - | app/importing/saved.test.ts | 73c255 | passed on first run: investigate | 8819fc |
| 37 | 2026-10-20T09:49:40Z | T031 | VO-035 | green | unit | app/importing/saved.test.ts | pass | yes | - | - | - | - | 6a03cc |
| 38 | 2026-10-20T20:18:35Z | T032 | VO-001 | red | e2e | e2e/import-open.spec.ts | fail | yes | assertion | e2e/import-open.spec.ts | 90eed8 | expected: New from Mermaid | caee25 |
| 39 | 2026-10-20T20:19:25Z | T033 | VO-001 | green | e2e | e2e/import-open.spec.ts | fail | no | defect | e2e/import-open.spec.ts | 90eed8 | The dialog did not move focus to the paste area when it opened: the first focusable element was not the one the contract names. Fixed by focusing the paste area on open; no test was changed. | 15425e |
| 40 | 2026-10-20T20:19:47Z | T033 | VO-001 | green | e2e | e2e/import-open.spec.ts | pass | yes | - | e2e/import-open.spec.ts | 90eed8 | - | 72a68d |
| 41 | 2026-10-20T20:20:15Z | T034 | VO-002 | red | e2e | e2e/import-preview.spec.ts | fail | yes | assertion | e2e/import-preview.spec.ts | 800490 | expected: detected-type | 2754a6 |
| 42 | 2026-10-20T20:21:47Z | T036 | VO-002 | green | e2e | e2e/import-preview.spec.ts | pass | yes | - | e2e/import-preview.spec.ts | 800490 | - | f7de23 |
| 43 | 2026-10-20T20:22:36Z | T037 | VO-003 | red | e2e | e2e/import-confirm.spec.ts | fail | yes | assertion | e2e/import-confirm.spec.ts | b376a0 | expected: Import | 8419a1 |
| 44 | 2026-10-20T20:23:12Z | T038 | VO-003 | green | e2e | e2e/import-confirm.spec.ts | pass | yes | - | e2e/import-confirm.spec.ts | 12f8a7 | - | 624a72 |
| 45 | 2026-10-20T20:23:44Z | T039 | VO-004 | red | e2e | e2e/import-undo-reopen.spec.ts | pass | no | - | e2e/import-undo-reopen.spec.ts | 5202e6 | passed on first run: investigate | 876c92 |
| 46 | 2026-10-20T20:23:55Z | T040 | VO-004 | green | e2e | e2e/import-undo-reopen.spec.ts | pass | yes | - | - | - | no change needed: the behaviour already held when T039 was first run | 4c0d50 |
| 47 | 2026-10-20T20:24:16Z | T041 | VO-006 | red | e2e | e2e/import-types.spec.ts | fail | yes | assertion | e2e/import-types.spec.ts | fd1c92 | expected: expected | c0b6fc |
| 48 | 2026-10-20T20:24:41Z | T041 | VO-006 | red | e2e | e2e/import-types.spec.ts | fail | yes | assertion | e2e/import-types.spec.ts | d78f80 | expected: expected | a9fda7 |
| 49 | 2026-10-20T20:25:06Z | T041 | VO-006 | red | e2e | e2e/import-types.spec.ts | pass | no | - | e2e/import-types.spec.ts | c81ce6 | passed on first run: investigate | 48763c |
| 50 | 2026-10-20T20:25:36Z | T042 | VO-006 | green | e2e | e2e/import-types.spec.ts | fail | no | defect | e2e/import-types.spec.ts | 4c0658 | The detected type for C4 read 'C4 Container diagram' rather than the contract's 'C4 Container'. Fixed in the dialog's label; the test's expectation was the contract's wording. | a8c935 |
| 51 | 2026-10-20T20:26:15Z | T042 | VO-006 | green | e2e | e2e/import-types.spec.ts | pass | yes | - | e2e/import-types.spec.ts | 4c0658 | - | aa9265 |
| 52 | 2026-10-20T20:26:47Z | T043 | VO-026 | red | e2e | e2e/import-positions.spec.ts | pass | no | - | e2e/import-positions.spec.ts | 9d74a8 | passed on first run: investigate | c33b97 |
| 53 | 2026-10-20T20:27:01Z | T043 | VO-026 | red | e2e | e2e/import-positions.spec.ts | pass | no | - | e2e/import-positions.spec.ts | 86074a | passed on first run: investigate | a6d99d |
| 54 | 2026-10-20T20:27:13Z | T044 | VO-026 | green | e2e | e2e/import-positions.spec.ts | pass | yes | - | - | - | no change needed: the behaviour already held when T043 was first run | b8c38e |
| 55 | 2026-10-20T20:27:41Z | T045 | VO-034 | red | e2e | e2e/import-name.spec.ts | fail | yes | assertion | e2e/import-name.spec.ts | 046507 | expected: expected | 74f0b1 |
| 56 | 2026-10-20T20:28:02Z | T046 | VO-034 | green | e2e | e2e/import-name.spec.ts | pass | yes | - | e2e/import-name.spec.ts | 046507 | - | 9f1147 |
| 57 | 2026-10-20T20:28:37Z | T047 | VO-036 | red | e2e | e2e/import-storage-failure.spec.ts | fail | yes | assertion | e2e/import-storage-failure.spec.ts | 89018a | expected: expected | 9d00e7 |
| 58 | 2026-10-20T20:29:10Z | T047 | VO-036 | red | e2e | e2e/import-storage-failure.spec.ts | fail | yes | assertion | e2e/import-storage-failure.spec.ts | 7b1fbf | expected: expected | a80ab7 |
| 59 | 2026-10-20T20:29:51Z | T048 | VO-036 | green | e2e | e2e/import-storage-failure.spec.ts | fail | no | defect | e2e/import-storage-failure.spec.ts | 7b1fbf | Import did not show the save failure: the dialog had no path for a rejected save. Fixed by returning the reason from the route to the dialog; the first Green attempt also ran with storage not yet failing (test setup, see XC-17). | 581d8c |
| 60 | 2026-10-20T20:30:46Z | T048 | VO-036 | green | e2e | e2e/import-storage-failure.spec.ts | pass | yes | - | e2e/import-storage-failure.spec.ts | 23dabb | - | 1bf89d |
| 61 | 2026-10-20T20:31:06Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | Phase 3 (US1) checkpoint | e9073e |
| 62 | 2026-10-20T20:39:09Z | - | - | checkpoint | e2e-all | - | fail | no | unclassified | - | - | Phase 3 (US1) checkpoint; run alone, no other evidence writes until it ends | 1d1186 |
| 63 | 2026-10-20T20:47:32Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | Phase 3 (US1) checkpoint, rerun after the start screen moved the import button into its own section | 40347f |
| 64 | 2026-10-20T20:48:02Z | T049 | VO-017 | red | unit | app/importing/scan.test.ts | fail | yes | assertion | app/importing/scan.test.ts | 68da65 | expected: scanFlowchart: not implemented | a4a013 |
| 65 | 2026-10-20T20:48:30Z | T050 | VO-017 | green | unit | app/importing/scan.test.ts | pass | yes | - | app/importing/scan.test.ts | 68da65 | - | 85a904 |
| 66 | 2026-10-20T20:49:23Z | T051 | VO-018 | red | unit | app/importing/scan.test.ts | fail | yes | assertion | app/importing/scan.test.ts | 1f5a3d | expected: scanSequence: not implemented | 9f9ba2 |
| 67 | 2026-10-20T20:50:12Z | T052 | VO-018 | green | unit | app/importing/scan.test.ts | pass | yes | - | app/importing/scan.test.ts | 1f5a3d | - | 366d30 |
| 68 | 2026-10-20T20:50:42Z | T053 | VO-019 | red | unit | app/importing/scan.test.ts | fail | yes | assertion | app/importing/scan.test.ts | 022d85 | expected: scanC4: not implemented; replay order: the stub was restored for this Red run, then the implementation | d153bf |
| 69 | 2026-10-20T20:50:43Z | T054 | VO-019 | green | unit | app/importing/scan.test.ts | pass | yes | - | app/importing/scan.test.ts | 022d85 | - | 984634 |
| 70 | 2026-10-20T20:51:11Z | T055 | VO-020 | red | unit | app/importing/approximate.test.ts | fail | yes | assertion | app/importing/approximate.test.ts | 5666a0 | expected: expected | 16966f |
| 71 | 2026-10-20T20:54:06Z | T056 | VO-020 | green | unit | app/importing/approximate.test.ts | pass | yes | - | app/importing/approximate.test.ts | 20d620 | - | 449bbb |
| 72 | 2026-10-20T20:54:25Z | T057 | VO-046 | red | unit | app/importing/untrusted.test.ts | fail | yes | assertion | app/importing/untrusted.test.ts | 462314 | expected: expected | 95a024 |
| 73 | 2026-10-20T20:55:25Z | T058 | VO-046 | green | unit | app/importing/untrusted.test.ts | pass | yes | - | app/importing/untrusted.test.ts | 462314 | - | 46e385 |
| 74 | 2026-10-20T20:56:39Z | T059 | VO-048 | red | unit | app/importing/scan.test.ts | fail | yes | assertion | app/importing/scan.test.ts | cae433 | expected: expected | 083132 |
| 75 | 2026-10-20T20:57:07Z | T060 | VO-048 | green | unit | app/importing/scan.test.ts | pass | yes | - | app/importing/scan.test.ts | cae433 | - | daf93e |
| 76 | 2026-10-20T20:57:14Z | T061 | VO-049 | red | unit | app/importing/flowchart.test.ts | fail | yes | assertion | app/importing/flowchart.test.ts | e11969 | expected: expected | cb281c |
| 77 | 2026-10-20T20:57:21Z | T061 | VO-049 | red | unit | app/importing/flowchart.test.ts | fail | yes | assertion | app/importing/flowchart.test.ts | 82a188 | expected: expected | b4e251 |
| 78 | 2026-10-20T20:57:55Z | T062 | VO-049 | green | unit | app/importing/flowchart.test.ts | pass | yes | - | app/importing/flowchart.test.ts | 82a188 | - | 8af93a |
| 79 | 2026-10-20T20:58:20Z | T063 | VO-037 | red | unit | app/importing/readDocument.test.ts | fail | yes | assertion | app/importing/readDocument.test.ts | 531406 | expected: expected | 7226fd |
| 80 | 2026-10-20T20:58:38Z | T063 | VO-037 | red | unit | app/importing/readDocument.test.ts | pass | no | - | app/importing/readDocument.test.ts | bbc6d0 | passed on first run: investigate | 86a3c3 |
| 81 | 2026-10-20T20:58:46Z | T064 | VO-037 | green | unit | app/importing/readDocument.test.ts | pass | yes | - | app/importing/readDocument.test.ts | bbc6d0 | - | dc399a |
| 82 | 2026-10-20T20:59:15Z | T065 | VO-021 | red | e2e | e2e/import-report.spec.ts | fail | yes | assertion | e2e/import-report.spec.ts | dd571d | expected: report-entry | aadb69 |
| 83 | 2026-10-20T20:59:40Z | T066 | VO-021 | green | e2e | e2e/import-report.spec.ts | pass | yes | - | e2e/import-report.spec.ts | dd571d | - | edb8f0 |
| 84 | 2026-10-20T21:00:25Z | T067 | VO-022 | red | e2e | e2e/import-report.spec.ts | fail | yes | assertion | e2e/import-report.spec.ts | 342827 | expected: Hide report | 0adb83 |
| 85 | 2026-10-20T21:00:47Z | T068 | VO-022 | green | e2e | e2e/import-report.spec.ts | pass | yes | - | e2e/import-report.spec.ts | 342827 | - | 95f09e |
| 86 | 2026-10-20T21:01:20Z | T069 | VO-023 | red | e2e | e2e/import-report.spec.ts | fail | yes | assertion | e2e/import-report.spec.ts | 3682b6 | expected: Import status | 3745d8 |
| 87 | 2026-10-20T21:01:46Z | T070 | VO-023 | green | e2e | e2e/import-report.spec.ts | pass | yes | - | e2e/import-report.spec.ts | 3682b6 | - | 620a53 |
| 88 | 2026-10-20T21:02:09Z | T070 | VO-023 | green | e2e | e2e/import-report.spec.ts | pass | yes | - | e2e/import-report.spec.ts | 3682b6 | - | 55f0c9 |
| 89 | 2026-10-20T21:02:43Z | T071 | VO-024 | red | e2e | e2e/import-report.spec.ts | fail | no | assertion | e2e/import-report.spec.ts | c95e59 | failed for a different reason; The first Red run failed on the expected assertion (no description on the Import button), but its --expect text did not match the output; the run was repeated as #90 with the text the failure prints. | 9e1082 |
| 90 | 2026-10-20T21:03:36Z | T071 | VO-024 | red | e2e | e2e/import-report.spec.ts | fail | yes | assertion | e2e/import-report.spec.ts | c95e59 | expected: Expected pattern | 9abe9d |
| 91 | 2026-10-20T21:04:00Z | T072 | VO-024 | green | e2e | e2e/import-report.spec.ts | pass | yes | - | e2e/import-report.spec.ts | c95e59 | - | cba7f1 |
| 92 | 2026-10-20T21:29:50Z | T073 | VO-054 | red | unit | app/importing/corpus.test.ts | pass | no | - | app/importing/corpus.test.ts | cc5400 | passed on first run: investigate; first run of T073: the ten C4 documents already import in full; the reader satisfies the contract before any change | 882904 |
| 93 | 2026-10-20T21:33:32Z | T074 | VO-054 | green | unit | app/importing/corpus.test.ts | pass | yes | - | app/importing/corpus.test.ts | 3e686e | corpus holds thirty supported documents; the reader needed no change for them | 7e0793 |
| 94 | 2026-10-20T21:34:26Z | T075 | VO-055 | red | unit | app/importing/corpus.test.ts | fail | yes | assertion | app/importing/corpus.test.ts | 630e3e | expected: reports each unsupported line it adds; 24 of 30 variants fail: the sequence and C4 scanners are not run by readDocument, so their added lines are silent | ec822e |
| 95 | 2026-10-20T21:34:44Z | T076 | VO-055 | green | unit | app/importing/corpus.test.ts | pass | yes | - | app/importing/corpus.test.ts | 630e3e | readDocument now runs the sequence and C4 scanners as well as the flowchart scanner | aa792f |
| 96 | 2026-10-20T21:34:54Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | end of Phase 4 (US2): corpus and report wiring | 267ad0 |
| 97 | 2026-10-20T21:42:42Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | end of Phase 4 (US2): e2e after the report wiring | f736ca |
| 98 | 2026-10-20T21:44:47Z | T077 | VO-012 | red | e2e | e2e/import-error.spec.ts | fail | yes | assertion | e2e/import-error.spec.ts | 159462 | expected: an unclosed bracket shows the line and column | 2ac2e3 |
| 99 | 2026-10-20T21:45:14Z | T078 | VO-012 | green | e2e | e2e/import-error.spec.ts | pass | yes | - | e2e/import-error.spec.ts | 159462 | - | d58097 |
| 100 | 2026-10-20T21:45:27Z | T079 | VO-014 | red | e2e | e2e/import-error.spec.ts | pass | no | - | e2e/import-error.spec.ts | 6456dc | passed on first run: investigate | 3c5b1f |
| 101 | 2026-10-20T21:45:41Z | T080 | VO-014 | green | e2e | e2e/import-error.spec.ts | pass | yes | - | e2e/import-error.spec.ts | 6456dc | no code change: the outcome is replaced on each new read in useImport.ts | 2b8ac7 |
| 102 | 2026-10-20T21:45:52Z | T081 | VO-015 | red | e2e | e2e/import-unsupported.spec.ts | fail | yes | assertion | e2e/import-unsupported.spec.ts | 8991df | expected: a class diagram says its type is unsupported | 8c3efd |
| 103 | 2026-10-20T21:46:04Z | T082 | VO-015 | green | e2e | e2e/import-unsupported.spec.ts | pass | yes | - | e2e/import-unsupported.spec.ts | 8991df | - | 0dcd23 |
| 104 | 2026-10-20T21:46:30Z | T083 | VO-016 | red | e2e | e2e/import-empty.spec.ts | fail | yes | assertion | e2e/import-empty.spec.ts | df75f5 | expected: an empty text shows only the hint | a14113 |
| 105 | 2026-10-20T21:46:39Z | T084 | VO-016 | green | e2e | e2e/import-empty.spec.ts | pass | yes | - | e2e/import-empty.spec.ts | df75f5 | - | ee6436 |
| 106 | 2026-10-20T21:47:14Z | T085 | VO-042 | red | unit | app/importing/readDocument.test.ts | fail | yes | assertion | app/importing/readDocument.test.ts | d1e33f | expected: refuses a C4 document whose kind cannot be found | a8b31c |
| 107 | 2026-10-20T21:47:41Z | T086 | VO-042 | green | unit | app/importing/readDocument.test.ts | pass | yes | - | app/importing/readDocument.test.ts | d1e33f | - | 6b70a7 |
| 108 | 2026-10-20T21:48:03Z | T087 | VO-051 | red | e2e | e2e/import-latest.spec.ts | pass | no | - | e2e/import-latest.spec.ts | 307651 | passed on first run: investigate | b47b1d |
| 109 | 2026-10-20T21:48:26Z | T088 | VO-051 | red | e2e | e2e/import-latest.spec.ts | fail | yes | assertion | e2e/import-latest.spec.ts | 4bc5ab | expected: while a text is being checked the status says so | b0f33a |
| 110 | 2026-10-20T21:48:48Z | T088 | VO-051 | green | e2e | e2e/import-latest.spec.ts | pass | yes | - | e2e/import-latest.spec.ts | 4bc5ab | - | 769ecb |
| 111 | 2026-10-20T21:49:39Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | end of Phase 5 (US3): errors, unsupported, empty, C4 kind refusals, latest text | a3161d |
| 112 | 2026-10-20T21:57:34Z | - | - | checkpoint | e2e-all | - | fail | no | unclassified | - | - | end of Phase 5 (US3): e2e | e81998 |
| 113 | 2026-10-20T22:05:54Z | - | - | checkpoint | e2e-all | - | fail | no | unclassified | - | - | end of Phase 5 (US3): e2e, rerun after one timing failure in import-latest on firefox under full load | 3e3708 |
| 114 | 2026-10-20T22:15:11Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | end of Phase 5 (US3): e2e, rerun after making the checking test's set-up wait tolerant of the parallel run | 5295c7 |
| 115 | 2026-10-20T22:34:02Z | T089 | VO-032 | red | unit | app/importing/compare.test.ts | fail | yes | assertion | app/importing/compare.test.ts | b61a1d | expected: compareLines: not implemented | f4d0d0 |
| 116 | 2026-10-20T22:34:20Z | T090 | VO-032 | green | unit | app/importing/compare.test.ts | pass | yes | - | app/importing/compare.test.ts | b61a1d | - | e4cb46 |
| 117 | 2026-10-20T22:35:08Z | T091 | VO-029 | red | e2e | e2e/import-compare.spec.ts | fail | yes | assertion | e2e/import-compare.spec.ts | 5fe280 | expected: Compare original with generated | 9baedc |
| 118 | 2026-10-20T22:35:26Z | T092 | VO-029 | green | e2e | e2e/import-compare.spec.ts | pass | yes | - | e2e/import-compare.spec.ts | 5fe280 | - | d2d370 |
| 119 | 2026-10-20T22:36:25Z | T093 | VO-030 | red | e2e | e2e/import-compare.spec.ts | fail | yes | assertion | e2e/import-compare.spec.ts | 758fad | expected: a document already in the editor's normal form says so | 6e5518 |
| 120 | 2026-10-20T22:36:37Z | T094 | VO-030 | green | e2e | e2e/import-compare.spec.ts | pass | yes | - | e2e/import-compare.spec.ts | 758fad | - | a0b6ea |
| 121 | 2026-10-20T22:36:52Z | T095 | VO-031 | red | e2e | e2e/import-compare.spec.ts | fail | yes | assertion | e2e/import-compare.spec.ts | 53c6fe | expected: a dropped construct's original lines show as removed | 4f5561 |
| 122 | 2026-10-20T22:37:15Z | T096 | VO-031 | green | e2e | e2e/import-compare.spec.ts | pass | yes | - | e2e/import-compare.spec.ts | 53c6fe | the view separates a dropped construct's original line from its pairing; the generated text itself is unchanged | 3dc558 |
| 123 | 2026-10-20T22:37:32Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | end of Phase 6 (US4): compare view | 09a031 |
| 124 | 2026-10-20T22:45:36Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | end of Phase 6 (US4): e2e | 4e1655 |
| 125 | 2026-10-20T22:45:59Z | T097 | VO-038 | red | e2e | e2e/import-drop.spec.ts | fail | yes | assertion | e2e/import-drop.spec.ts | 95621b | expected: a file dragged over the start screen shows the overlay | 2e38b8 |
| 126 | 2026-10-20T22:46:19Z | T098 | VO-038 | green | e2e | e2e/import-drop.spec.ts | pass | yes | - | e2e/import-drop.spec.ts | 95621b | - | 14864e |
| 127 | 2026-10-20T22:46:35Z | T099 | VO-039 | red | e2e | e2e/import-markdown.spec.ts | pass | no | - | e2e/import-markdown.spec.ts | d771fd | passed on first run: investigate | 8dd5a7 |
| 128 | 2026-10-20T22:46:56Z | T099 | VO-039 | red | e2e | e2e/import-markdown.spec.ts | pass | no | - | e2e/import-markdown.spec.ts | b1ab1e | passed on first run: investigate | 3e41e5 |
| 129 | 2026-10-20T22:47:05Z | T100 | VO-039 | green | e2e | e2e/import-markdown.spec.ts | pass | yes | - | e2e/import-markdown.spec.ts | b1ab1e | no code change: the reader splits the Markdown file and reports the ignored block | 89154d |
| 130 | 2026-10-20T22:47:57Z | T101 | VO-040 | red | e2e | e2e/import-bad-file.spec.ts | fail | yes | assertion | e2e/import-bad-file.spec.ts | 30ef94 | expected: a binary file and a file over 5 MB are not loaded | e51508 |
| 131 | 2026-10-20T22:48:10Z | T101 | VO-040 | red | e2e | e2e/import-bad-file.spec.ts | fail | yes | assertion | e2e/import-bad-file.spec.ts | 69f9b8 | expected: a binary file and a file over 5 MB are not loaded | 0c446d |
| 132 | 2026-10-20T22:48:19Z | T101 | VO-040 | red | e2e | e2e/import-bad-file.spec.ts | fail | yes | assertion | e2e/import-bad-file.spec.ts | 69f9b8 | expected: a binary file and a file over 5 MB are not loaded | 563665 |
| 133 | 2026-10-20T22:48:39Z | T102 | VO-040 | green | e2e | e2e/import-bad-file.spec.ts | pass | yes | - | e2e/import-bad-file.spec.ts | 69f9b8 | - | b9c9e0 |
| 134 | 2026-10-20T22:49:02Z | T103 | VO-056 | red | e2e | e2e/import-choose-file.spec.ts | fail | yes | assertion | e2e/import-choose-file.spec.ts | d5cd3b | expected: a chosen valid file loads its text | 2e6f16 |
| 135 | 2026-10-20T22:49:15Z | T104 | VO-056 | green | e2e | e2e/import-choose-file.spec.ts | pass | yes | - | e2e/import-choose-file.spec.ts | d5cd3b | - | 343dad |
| 136 | 2026-10-20T22:49:58Z | T104 | VO-056 | refactor | e2e | e2e/import-(drop bad-file choose-file).spec.ts | fail | no | environment | e2e/import-choose-file.spec.ts | d5cd3b | refactor: the dialog takes a file handed in from outside through its key instead of an effect; the same multi-file selector was refused by the runner; the specs ran as a set, but the record does not show one selector | a34600 |
| 137 | 2026-10-20T22:50:04Z | T104 | VO-056 | refactor | e2e | e2e/import-drop.spec.ts e2e/import-bad-file.spec.ts e2e/import-choose-file.spec.ts | fail | no | environment | e2e/import-choose-file.spec.ts | d5cd3b | refactor: the dialog takes a file handed in from outside through its key instead of an effect; the runner rejected a selector with several files; no test ran. The same run was repeated for one file (record 138) | c9f7c8 |
| 138 | 2026-10-20T22:50:12Z | T104 | VO-056 | refactor | e2e | e2e/import-drop.spec.ts | pass | yes | - | e2e/import-choose-file.spec.ts | d5cd3b | refactor: the dialog takes a file handed in from outside through its key instead of an effect | d9bfd2 |
| 139 | 2026-10-20T22:50:22Z | T102 | VO-040 | refactor | e2e | e2e/import-bad-file.spec.ts | fail | no | defect | e2e/import-bad-file.spec.ts | 69f9b8 | refactor: the file reader and the dialog's file state; a real regression: the dialog remounted on a refused file and lost the text; fixed by applying hand-ins in place (records 141 to 143 pass) | 4e06d8 |
| 140 | 2026-10-20T22:50:27Z | T104 | VO-056 | refactor | e2e | e2e/import-choose-file.spec.ts | pass | yes | - | e2e/import-choose-file.spec.ts | d5cd3b | refactor: the dialog takes a file handed in from outside through its key instead of an effect | ad8439 |
| 141 | 2026-10-20T22:51:13Z | T102 | VO-040 | refactor | e2e | e2e/import-bad-file.spec.ts | pass | yes | - | e2e/import-bad-file.spec.ts | 69f9b8 | refactor: the dialog applies a hand-in once during render, keeping its text when a file is refused | 851529 |
| 142 | 2026-10-20T22:51:18Z | T104 | VO-056 | refactor | e2e | e2e/import-choose-file.spec.ts | pass | yes | - | e2e/import-choose-file.spec.ts | d5cd3b | refactor: the same hand-in path for chosen and dropped files | efe636 |
| 143 | 2026-10-20T22:51:21Z | T098 | VO-038 | refactor | e2e | e2e/import-drop.spec.ts | pass | yes | - | e2e/import-drop.spec.ts | 95621b | refactor: the dialog applies a hand-in once during render | f35bdf |
| 144 | 2026-10-20T22:51:31Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | end of Phase 7 (US5): file drop, Markdown, bad files, choose file | 10ef09 |
| 145 | 2026-10-20T22:59:44Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | end of Phase 7 (US5): e2e | d03424 |
| 146 | 2026-10-20T23:00:11Z | T105 | VO-043 | red | e2e | e2e/import-wcag.spec.ts | pass | no | - | e2e/import-wcag.spec.ts | b10347 | passed on first run: investigate | 03f17a |
| 147 | 2026-10-20T23:00:28Z | T106 | VO-043 | green | e2e | e2e/import-wcag.spec.ts | pass | yes | - | e2e/import-wcag.spec.ts | b10347 | no violation found: no code change needed | 9a19cb |
| 148 | 2026-10-20T23:00:45Z | T107 | VO-044 | red | e2e | e2e/import-keyboard.spec.ts | fail | yes | assertion | e2e/import-keyboard.spec.ts | 9b733a | expected: an import is completed with the keyboard alone | 85f216 |
| 149 | 2026-10-20T23:01:24Z | T108 | VO-044 | green | e2e | e2e/import-keyboard.spec.ts | pass | yes | - | e2e/import-keyboard.spec.ts | 9b733a | - | 3811e6 |
| 150 | 2026-10-20T23:02:23Z | T109 | VO-045 | red | e2e | e2e/import-no-network.spec.ts | fail | yes | assertion | e2e/import-no-network.spec.ts | 07df6c | expected: a document with a link, a click handler and HTML makes no request | 6ebf47 |
| 151 | 2026-10-20T23:02:54Z | T110 | VO-045 | green | e2e | e2e/import-no-network.spec.ts | pass | yes | - | e2e/import-no-network.spec.ts | 07df6c | a label that is only tags keeps its typed text, so the reader no longer refuses it as empty | 368176 |
| 152 | 2026-10-20T23:03:30Z | T111 | VO-047 | red | e2e | e2e/import-source-readonly.spec.ts | pass | no | - | e2e/import-source-readonly.spec.ts | 9f7f2d | passed on first run: investigate | 11407e |
| 153 | 2026-10-20T23:03:39Z | T112 | VO-047 | green | e2e | e2e/import-source-readonly.spec.ts | pass | yes | - | e2e/import-source-readonly.spec.ts | 9f7f2d | no change: the source panel was already read-only | 377e35 |
| 154 | 2026-10-20T23:04:00Z | T113 | VO-050 | red | e2e | e2e/import-performance.spec.ts | fail | yes | assertion | e2e/import-performance.spec.ts | aec57c | expected: typing into a 500-node document delays no keystroke | 6a7f8e |
| 155 | 2026-10-20T23:05:43Z | T114 | VO-050 | green | e2e | e2e/import-performance.spec.ts | pass | yes | - | e2e/import-performance.spec.ts | 1b32c4 | the dialog starts loading Mermaid as it opens; the 500-node typing budget passes without the R5 contingency | 6025aa |
| 156 | 2026-10-20T23:05:59Z | T115 | VO-052 | red | e2e | e2e/import-escape.spec.ts | pass | no | - | e2e/import-escape.spec.ts | e6e752 | passed on first run: investigate | 9d5f60 |
| 157 | 2026-10-20T23:06:10Z | T116 | VO-052 | green | e2e | e2e/import-escape.spec.ts | pass | yes | - | e2e/import-escape.spec.ts | e6e752 | no change: the dialog's text survives within the start screen's visit | f84357 |
| 158 | 2026-10-20T23:06:25Z | T117 | VO-053 | red | e2e | e2e/import-two-tabs.spec.ts | pass | no | - | e2e/import-two-tabs.spec.ts | 92d055 | passed on first run: investigate | d33704 |
| 159 | 2026-10-20T23:06:36Z | T118 | VO-053 | green | e2e | e2e/import-two-tabs.spec.ts | pass | yes | - | e2e/import-two-tabs.spec.ts | 92d055 | no change: the library broadcast leaves the other tab's dialog open and its text unchanged | 4cc154 |
| 160 | 2026-10-20T23:07:07Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | final regression (T120): unit | 8864f0 |
| 161 | 2026-10-20T23:15:17Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | final regression (T120): e2e | c28652 |
| 162 | 2026-10-20T23:27:21Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | final regression (T120): e2e after the lint fixes to the new specs | a66962 |

## Exceptions

| ID | Time | Task | Obligations | Kind | Rationale | Alternative verification | Needs approval | Approved by |
|----|------|------|-------------|------|-----------|--------------------------|----------------|-------------|
| EX-01 | 2026-10-20T09:45:54Z | T026 | VO-033 | no-meaningful-red | The pure import has no clock or random source (T025): the same text gives the same ids on every read, so the test passes when first run and no failure can be shown first. The test still asserts the identity and the uniqueness of every id. | The test asserts the whole outcome and the ids of a flowchart read twice; it passes now and guards against any later source of variation. | no | - |
| EX-02 | 2026-10-20T09:49:21Z | T030 | VO-035 | no-meaningful-red | The file and record codecs and openFile already hold the stored form (persistence, DC-01): an imported diagram is an ordinary Diagram that they accept, so the contract passes when first run. No failure can be shown first. The test pins the guarantees T031 relies on. | The test writes each imported diagram as a file and as a record, opens both again and compares them with what was imported, for each type. | no | - |
| EX-03 | 2026-10-20T20:23:50Z | T039 | VO-004 | no-meaningful-red | The editor already opens a stored diagram with an empty history, and already keeps edits and reloads; the import only adds a stored diagram. The behaviour already holds, so no failure can be shown first. | The test imports the sample, checks that Undo is disabled, renames a node, reloads, and reopens the diagram from the start screen, checking node counts and the edit. | no | - |
| EX-04 | 2026-10-20T20:26:22Z | T041 | VO-006 | no-meaningful-red | The import already creates sequence and C4 diagrams with their participants, elements and relationships in order (T028 round trip and the readers): when the test was first run against the final expectations it passed, so no failure can be shown first. | The test imports a sequence and a C4 Container document and checks the editor's source holds each participant, message, element and relationship in order, and that the C4 detected type names the kind. | no | - |
| EX-05 | 2026-10-20T20:27:07Z | T043 | VO-026 | no-meaningful-red | Positions are stored with the record at import and the editor already keeps moved nodes across a reload and a reopen; the test passes when first run, with a guard that the drag really moved the node. No failure can be shown first. | The test drags a node, adds another, reloads and reopens, and checks the node is where it was left. | no | - |
| EX-06 | 2026-10-20T21:29:56Z | T073 | VO-054 | no-meaningful-red | The ten C4 documents already import in full with the current reader, so the test cannot fail first. The test is a regression guard for the first ten documents. | Mutating the expected relationships makes all ten fail (checked by hand, then reverted); the cases are the same ones c4.test.ts and roundtrip.test.ts cover. | no | - |
| EX-07 | 2026-10-20T21:45:36Z | T079 | VO-014 | no-meaningful-red | The reader already replaces the outcome each time a new text is read, so the error clears and the picture returns at once: the test passes on the first run. | The test first asserts the error is visible for the unclosed text, so the clearing is not vacuous; the picture timing is the one the existing VO-002 test checks. | no | - |
| EX-08 | 2026-10-20T21:48:21Z | T087 | VO-051 | no-meaningful-red | The 300 ms pause before a read already drops a text that is replaced before it is read, so the later text's report is the only one shown: the test passes on the first run. A read cannot be held back from the test, because the reader runs in the page's own bundle. | The test asserts the first text's report entry never appears, and that the later text's picture and report are shown. The checking state, which covers a read still in progress, is tested under T088. | no | - |
| EX-09 | 2026-10-20T22:46:57Z | T099 | VO-039 | no-meaningful-red | The reader already splits Markdown at its mermaid fences and lists each further block as ignored, so the test passes on its first run. Behaviour was in place from the document splitter (T016 to T019). | document.test.ts and readDocument.test.ts cover splitDocument's fences, and this test checks the first block and the ignored entry's line and first line end to end. | no | - |
| EX-10 | 2026-10-20T23:00:18Z | T105 | VO-043 | no-meaningful-red | The axe scan finds no WCAG 2.2 AA violation in any of the five dialog states, so the test passes on its first run. The scan is the same one e2e/wcag.spec.ts uses. | The same axe tags run in every state the contract lists, with the transitions finished before each scan (as wcag.spec.ts does). | no | - |
| EX-11 | 2026-10-20T23:03:34Z | T111 | VO-047 | no-meaningful-red | The source panel is a read-only pre element, and the editor has no text field that takes Mermaid text, so the test passes on its first run. Nothing needed changing. | The test checks the panel for text fields and editable content, and types into it to confirm the source is unchanged, after a real import. | no | - |
| EX-12 | 2026-10-20T23:06:05Z | T115 | VO-052 | no-meaningful-red | The dialog stays mounted while the start screen is open, so its text is kept when it closes and reopens. The test passes on its first run. | The test closes with Escape, reopens from the start button, and checks the text is still there, which is the case EC-10 names. | no | - |
| EX-13 | 2026-10-20T23:06:31Z | T117 | VO-053 | no-meaningful-red | The library announces its change to other tabs, but the second tab's dialog is a separate page state and keeps its text, so the test passes on its first run. | The test confirms in one tab, checks the other tab's dialog and its text are unchanged, and counts the saved diagrams afterwards. | no | - |

## Expectation changes

| ID | Time | Task | Files | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|-------|--------------|---------------|------------------|-------------|-----------------|
| XC-01 | 2026-10-20T09:38:04Z | T016 | app/editor/mermaidSnapshot.sequence.test.ts | FR-005 | Correction: messagesOf excluded Mermaid's activation steps (types 17 and 18), which are steps with a sender but not messages; no arrow or actor expectation changed. The activation case asserts the message only. | no | - | 1360f8 |
| XC-02 | 2026-10-20T09:38:14Z | T017 | app/editor/mermaidSnapshot.sequence.test.ts | FR-005 | Correction, the same as for T016: messagesOf excludes Mermaid's activation steps (types 17 and 18), which are not messages. No arrow or actor expectation changed. | no | - | 1360f8 |
| XC-03 | 2026-10-20T09:47:31Z | T028 | app/importing/roundtrip.test.ts | SC-006 | Correction: the C4 original is put in the editor's normal form (ids in statement order, SC-006) before the round trip, and the deployment fixture gives its node a child, since Mermaid rejects an empty node. The Red failures were the isOutcome defect in readDocument (fixed in T029) and alias numbering from the fixture's arbitrary ids; no assertion of the round trip was changed. | no | - | 26d28e |
| XC-04 | 2026-10-20T09:47:31Z | T029 | app/importing/roundtrip.test.ts | SC-006 | Correction: the C4 original is put in the editor's normal form (ids in statement order, SC-006) before the round trip, and the deployment fixture gives its node a child, since Mermaid rejects an empty node. The Red failures were the isOutcome defect in readDocument (fixed in T029) and alias numbering from the fixture's arbitrary ids; no assertion of the round trip was changed. | no | - | 26d28e |
| XC-05 | 2026-10-20T20:22:51Z | T037 | e2e/import-confirm.spec.ts | FR-003 | Correction: a type-only import (Page) replaces an inline import() type, which lint forbids. No assertion changed. | no | - | 12f8a7 |
| XC-06 | 2026-10-20T20:22:51Z | T038 | e2e/import-confirm.spec.ts | FR-003 | Correction: a type-only import (Page) replaces an inline import() type, which lint forbids. No assertion changed. | no | - | 12f8a7 |
| XC-07 | 2026-10-20T20:24:32Z | T041 | e2e/import-types.spec.ts | FR-005 | Correction: lint-driven form only (a type-only import of Page, and a block body in forEach). No assertion changed. | no | - | d78f80 |
| XC-08 | 2026-10-20T20:24:32Z | T042 | e2e/import-types.spec.ts | FR-002 | Correction: lint-driven form only (a type-only import of Page, and a block body in forEach). No assertion changed. | no | - | d78f80 |
| XC-09 | 2026-10-20T20:25:01Z | T041 | e2e/import-types.spec.ts | FR-005 | Correction: the editor's normal form names participants p1 and p2 (as the generator writes them), so the expected lines use those names. The import itself was correct; the expectation about the form was wrong. | no | - | c81ce6 |
| XC-10 | 2026-10-20T20:25:01Z | T042 | e2e/import-types.spec.ts | FR-002 | Correction: the editor's normal form names participants p1 and p2 (as the generator writes them), so the expected lines use those names. The import itself was correct; the expectation about the form was wrong. | no | - | c81ce6 |
| XC-11 | 2026-10-20T20:25:16Z | T041 | e2e/import-types.spec.ts | FR-002 | Correction: the C4 case now also checks that the detected type names the kind (C4 Container), which FR-002 and T042 require; the sequence and C4 assertions are otherwise unchanged. | no | - | 4c0658 |
| XC-12 | 2026-10-20T20:25:17Z | T042 | e2e/import-types.spec.ts | FR-002 | Correction: the C4 case now also checks that the detected type names the kind (C4 Container), which FR-002 and T042 require; the sequence and C4 assertions are otherwise unchanged. | no | - | 4c0658 |
| XC-13 | 2026-10-20T20:26:54Z | T043 | e2e/import-positions.spec.ts | FR-008 | Correction: a guard that the drag moved the node, so the later position checks cannot pass vacuously. No position assertion changed. | no | - | 86074a |
| XC-14 | 2026-10-20T20:26:55Z | T044 | e2e/import-positions.spec.ts | FR-008 | Correction: a guard that the drag moved the node, so the later position checks cannot pass vacuously. No position assertion changed. | no | - | 86074a |
| XC-15 | 2026-10-20T20:28:50Z | T047 | e2e/import-storage-failure.spec.ts | FR-011 | Correction: an unused import removed (lint). No assertion changed. | no | - | 7b1fbf |
| XC-16 | 2026-10-20T20:28:50Z | T048 | e2e/import-storage-failure.spec.ts | FR-011 | Correction: an unused import removed (lint). No assertion changed. | no | - | 7b1fbf |
| XC-17 | 2026-10-20T20:30:41Z | T047 | e2e/import-storage-failure.spec.ts | FR-011 | Correction: fillStorage must run before the first page load (an init script applies only on a real navigation; the hash change to #/ does not reload the page). No assertion changed. | no | - | 23dabb |
| XC-18 | 2026-10-20T20:30:41Z | T048 | e2e/import-storage-failure.spec.ts | FR-011 | Correction: fillStorage must run before the first page load (an init script applies only on a real navigation; the hash change to #/ does not reload the page). No assertion changed. | no | - | 23dabb |
| XC-19 | 2026-10-20T20:54:05Z | T055 | app/importing/approximate.test.ts | FR-006 | Correction: a Dynamic number that differs from its place is reported on every such line, so both RelIndex lines of the out-of-order example are listed (the first run expected only one). The rule is in research R7; the expectation was incomplete, not the behaviour. | no | - | 20d620 |
| XC-20 | 2026-10-20T20:54:05Z | T056 | app/importing/approximate.test.ts | FR-006 | Correction: a Dynamic number that differs from its place is reported on every such line, so both RelIndex lines of the out-of-order example are listed (the first run expected only one). The rule is in research R7; the expectation was incomplete, not the behaviour. | no | - | 20d620 |
| XC-21 | 2026-10-20T20:57:20Z | T061 | app/importing/flowchart.test.ts | FR-009 | Correction: the first label of an id is the one kept; only a later, different label is reported, so only line 5 is listed (line 4 is the first label of A). | no | - | 82a188 |
| XC-22 | 2026-10-20T20:57:20Z | T062 | app/importing/flowchart.test.ts | FR-009 | Correction: the first label of an id is the one kept; only a later, different label is reported, so only line 5 is listed (line 4 is the first label of A). | no | - | 82a188 |
| XC-23 | 2026-10-20T20:58:37Z | T063 | app/importing/readDocument.test.ts | FR-012 | Correction: the assertion reads the reason text directly instead of a matcher object (lint). The expected entry is unchanged. | no | - | bbc6d0 |
| XC-24 | 2026-10-20T20:58:37Z | T064 | app/importing/readDocument.test.ts | FR-012 | Correction: the assertion reads the reason text directly instead of a matcher object (lint). The expected entry is unchanged. | no | - | bbc6d0 |
| XC-25 | 2026-10-20T21:04:22Z | T007 | app/importing/readDocument.test.ts | FR-012 | Correction, the same as XC-23 and XC-24 for T063 and T064: VO-037 is also verified by readDocument.test.ts, whose assertion was made to read the reason text directly (lint). No expected outcome changed. | no | - | bbc6d0 |
| XC-26 | 2026-10-20T21:33:26Z | T073 | app/importing/corpus.test.ts | SC-002 | T074 extends the corpus test from the first ten C4 documents to the whole thirty-document corpus, as T074 requires. The expectations are the same as the Red run's, checked against the document text; no behaviour changes. | no | - | 3e686e |
| XC-27 | 2026-10-20T22:06:58Z | T088 | e2e/import-latest.spec.ts | SC-005 | The set-up wait for the first picture in the checking test used the one-second budget. Mermaid loads on first use, and under the parallel e2e run on Firefox the first draw exceeds one second. The one-second checks on the checking state are unchanged. | no | - | a65972 |
| XC-28 | 2026-10-20T23:05:19Z | T113 | e2e/import-performance.spec.ts | SC-005 | The 100-node budget was measured on the first picture of a session, which also loads Mermaid (about 1.6 s cold, 68 ms warm). The test now draws a small document first, so the budget measures use once the editor is ready. The 500-node typing measurement is unchanged. | no | - | 1b32c4 |
| XC-29 | 2026-10-20T23:05:47Z | T114 | e2e/import-performance.spec.ts | SC-005 | The same correction as XC-28 for T113: the 100-node budget is measured once Mermaid is loaded, so the test draws a small document first. | no | - | 1b32c4 |

## Decisions

| ID | Opened | Question | Tasks | Status | Answer | Decided by | Resolved |
|----|--------|----------|-------|--------|--------|------------|----------|

## Behaviour items at baseline

| Item | Verified by | Fingerprint | Seq |
|------|-------------|-------------|-----|
| BI-001 | VO-001 | c19537 | 1 |
| BI-002 | VO-002, VO-005 | 3b2a24 | 1 |
| BI-003 | VO-003 | 565f4d | 1 |
| BI-004 | VO-004 | 922f72 | 1 |
| BI-005 | VO-005, VO-006 | 8f3ba4 | 1 |
| BI-006 | VO-017, VO-019 | f21bfd | 1 |
| BI-007 | VO-021 | 25d3c5 | 1 |
| BI-008 | VO-020 | c98644 | 1 |
| BI-009 | VO-022 | 1b3d5c | 1 |
| BI-010 | VO-023 | c62c56 | 1 |
| BI-011 | VO-012, VO-013 | 860bec | 1 |
| BI-012 | VO-014 | c59a81 | 1 |
| BI-013 | VO-015 | 79e9a5 | 1 |
| BI-014 | VO-016 | 93174f | 1 |
| BI-015 | VO-029, VO-032 | 8376b1 | 1 |
| BI-016 | VO-030 | 35d863 | 1 |
| BI-017 | VO-031 | 61d24a | 1 |
| BI-018 | VO-038 | 74dcc3 | 1 |
| BI-019 | VO-039 | d0a8a5 | 1 |
| BI-020 | VO-040 | b067c2 | 1 |
| BI-021 | VO-007, VO-008, VO-009, VO-010, VO-011 | 3ea76c | 1 |
| BI-022 | VO-018 | ef4b3c | 1 |
| BI-023 | VO-024 | 657757 | 1 |
| BI-024 | VO-025, VO-026 | 41be9a | 1 |
| BI-025 | VO-027, VO-028 | f6f005 | 1 |
| BI-026 | VO-033, VO-034, VO-035 | 55835f | 1 |
| BI-027 | VO-036 | 234f90 | 1 |
| BI-028 | VO-056 | c905b5 | 1 |
| BI-029 | VO-043, VO-044 | c4d25c | 1 |
| BI-030 | VO-045, VO-046 | d2a052 | 1 |
| BI-031 | VO-047 | 179275 | 1 |
| BI-032 | VO-041 | 354ba4 | 1 |
| BI-033 | VO-042 | 7d3810 | 1 |
| BI-034 | VO-048 | ed3f03 | 1 |
| BI-035 | VO-037 | 238253 | 1 |
| BI-036 | VO-049 | 2e5f67 | 1 |
| BI-037 | VO-050 | 3c7791 | 1 |
| BI-038 | VO-051 | 409a36 | 1 |
| BI-039 | VO-052 | d78637 | 1 |
| BI-040 | VO-053 | f88a3b | 1 |
| BI-041 | VO-054 | 748760 | 1 |
| BI-042 | VO-055 | 99c732 | 1 |

## Behaviour item changes

| ID | Time | Item | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|--------------|---------------|------------------|-------------|-----------------|
