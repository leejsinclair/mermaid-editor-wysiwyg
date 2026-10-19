# TDD Evidence: 002-visual-diagram-editor

<!-- Written by tdd_check.py. Do not edit by hand: use the script's subcommands. -->

## Summary

_Generated from the tables below on 2026-10-18T23:02:44Z._

| Obligation | Requirements | Status | Tests | Latest result |
|------------|--------------|--------|-------|---------------|
| VO-001 | FR-001, FR-037, US1-AS1 | verified | e2e/start-screen.spec.ts | pass (#11) |
| VO-002 | FR-001, FR-002, US1-AS2 | verified | e2e/new-diagram.spec.ts, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) | pass (#384) |
| VO-003 | FR-002, FR-024, US1-AS3 | verified | e2e/flowchart-toolbox.spec.ts, e2e/flowchart-toolbox.spec.ts e2e/new-diagram.spec.ts e2e/start-screen.spec.ts, e2e/(flowchart-toolbox new-diagram start-screen) | pass (#19) |
| VO-004 | FR-007, FR-016, US1-AS4, EC-01 | verified | app/model/flowchart/addNode.test.ts | pass (#6) |
| VO-005 | US1-AS4 | verified | e2e/flowchart-add.spec.ts, e2e/(flowchart-add flowchart-toolbox new-diagram start-screen) | pass (#21) |
| VO-006 | FR-025, US1-AS5 | verified | e2e/flowchart-connect.spec.ts, e2e/flowchart-connect | pass (#25) |
| VO-007 | FR-013, FR-024, SC-002 | verified | app/generation/flowchart.fidelity.test.ts, app/generation | pass (#9) |
| VO-008 | FR-014, US1-AS6, SC-007 | verified | e2e/copy-source | pass (#40) |
| VO-009 | FR-014, US1-AS7, EC-07 | verified | e2e/copy-failure, e2e/copy- | pass (#42) |
| VO-010 | FR-016, US1-AS8 | verified | e2e/flowchart-drag-cancel | pass (#29) |
| VO-011 | FR-003, US1-AS9 | verified | e2e/flowchart-layout-note, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) | pass (#384) |
| VO-012 | FR-053, US1-AS10, EC-06 | verified | e2e/flowchart-preview | pass (#125) |
| VO-013 | FR-012, FR-053, EC-06 | verified | app/editor/sourceCheck.test.ts, e2e/(start-screen new-diagram flowchart-) | pass (#38) |
| VO-014 | FR-014, US1-AS11 | verified | e2e/copy-markdown, e2e/copy- | pass (#44) |
| VO-015 | FR-003, US2-AS1, EC-01, DC-03 | verified | app/model/flowchart/moveNode.test.ts app/history/noChange.test.ts, app/model/flowchart/moveNode.test.ts, app/history/noChange.test.ts | pass (#52) |
| VO-016 | US2-AS1 | verified | e2e/flowchart-move | pass (#54) |
| VO-017 | FR-006, US2-AS2, SC-003, EC-03 | verified | app/generation/escape.fidelity.test.ts, app/generation/escape.fidelity | pass (#330) |
| VO-018 | US2-AS2, SC-003, EC-03 | verified | e2e/labels-special, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) | pass (#384) |
| VO-019 | FR-006, FR-026, US2-AS3, EC-04 | verified | app/validation/label.test.ts, app/validation/label.test, app/validation/label | pass (#323) |
| VO-020 | FR-026, US2-AS4 | verified | app/model/flowchart/connectionLabel.test.ts | pass (#59) |
| VO-021 | FR-011, US2-AS5, SC-005, EC-02 | verified | app/model/flowchart/deleteNode.test.ts | pass (#73) |
| VO-022 | US2-AS6 | verified | app/model/flowchart/deleteConnection.test.ts | pass (#74) |
| VO-023 | FR-010, FR-025, US2-AS7 | verified | app/model/flowchart/structures.test.ts | pass (#76) |
| VO-024 | FR-009, US2-AS8, SC-006 | verified | app/history/rejections.test.ts, app/history/rejections | pass (#325) |
| VO-025 | FR-009, US2-AS8 | verified | e2e/rejections, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls) | pass (#447) |
| VO-026 | FR-040, US2-AS9 | verified | app/model/flowchart/changeShape.test.ts | pass (#84) |
| VO-027 | FR-040, FR-041, US2-AS10, EC-18 | verified | app/model/flowchart/changeConnection.test.ts, e2e/controls, app/model/flowchart/changeConnection | pass (#446) |
| VO-028 | FR-041, US2-AS11 | verified | app/model/flowchart/reverse.test.ts | pass (#91) |
| VO-029 | FR-008, US3-AS1, US3-AS2, SC-004 | verified | app/history/history.test.ts, app/history/history.test | pass (#327) |
| VO-030 | US3-AS3 | verified | e2e/undo-redo | pass (#112) |
| VO-031 | FR-008, US3-AS4 | verified | app/history/redoCleared.test.ts, app/history | pass (#107) |
| VO-032 | FR-008, US3-AS5, EC-08 | verified | e2e/gestures | pass (#117) |
| VO-033 | FR-008, US3-AS6 | verified | app/history/longHistory.test.ts, app/history | pass (#109) |
| VO-034 | FR-012, SC-004 | verified | e2e/canvas-source-agree, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) | pass (#384) |
| VO-035 | FR-027, US4-AS1 | verified | e2e/sequence-toolbox | pass (#249) |
| VO-036 | FR-013, FR-027, SC-002 | verified | app/generation/sequence.fidelity | pass (#209) |
| VO-037 | FR-028, FR-030, US4-AS2 | verified | app/model/sequence/addMessage | pass (#210) |
| VO-038 | FR-028, US4-AS3 | verified | app/model/sequence/selfMessage | pass (#214) |
| VO-039 | FR-029, US4-AS4 | verified | app/model/sequence/equalLabels | pass (#215) |
| VO-040 | FR-011, FR-029, US4-AS5, SC-005 | verified | app/model/sequence/deleteParticipant | pass (#227) |
| VO-041 | FR-028, FR-039, US4-AS6 | verified | app/model/sequence/reorder | pass (#228) |
| VO-042 | FR-039, US4-AS6 | verified | e2e/sequence-reorder | pass (#253) |
| VO-043 | FR-028, US4-AS7 | verified | app/model/sequence/blankMessage | pass (#229) |
| VO-044 | FR-040, US4-AS8 | verified | app/model/sequence/changeRole | pass (#230) |
| VO-045 | FR-040, FR-041, US4-AS9 | verified | app/model/sequence/changeMessage | pass (#231) |
| VO-046 | FR-036, US5-AS1 | verified | e2e/c4-kind-picker | pass (#348) |
| VO-047 | FR-031, US5-AS2 | verified | e2e/c4-toolbox | pass (#351) |
| VO-048 | FR-013, FR-031, FR-035, SC-002 | verified | app/generation/c4.fidelity, app/generation | pass (#268) |
| VO-049 | FR-005, FR-032, US5-AS3 | verified | app/model/c4/editElement, app/model/c4, e2e/c4-edit-fields | pass (#356) |
| VO-050 | FR-032, US5-AS4 | verified | app/model/c4/relationships, app/model/c4 | pass (#280) |
| VO-051 | FR-033, US5-AS5 | verified | app/model/c4/dynamic, app/model/c4 | pass (#284) |
| VO-052 | FR-033, FR-039, US5-AS5 | verified | e2e/c4-dynamic-reorder | pass (#367) |
| VO-053 | FR-011, US5-AS6, SC-005 | verified | app/model/c4/delete, app/model/c4, e2e/c4-delete | pass (#361) |
| VO-054 | FR-034, US5-AS7 | verified | app/model/c4/nesting, app/model/c4 | pass (#289) |
| VO-055 | FR-034, US5-AS8 | verified | app/model/c4/deployment | pass (#291) |
| VO-056 | FR-034, US5-AS9 | verified | app/model/c4/moveMembership | pass (#301) |
| VO-057 | FR-019, FR-034, US5-AS9 | verified | e2e/c4-move-to | pass (#371) |
| VO-058 | FR-054, US5-AS10 | verified | app/model/c4/title | pass (#274) |
| VO-059 | FR-054 | verified | e2e/c4-title | pass (#376) |
| VO-060 | FR-040, US5-AS11, EC-17 | verified | app/model/c4/changeType, app/model/c4 | pass (#299) |
| VO-061 | FR-041, US5-AS12 | verified | app/model/c4/relationshipEnds, app/model/c4 | pass (#352) |
| VO-062 | FR-019, FR-020, US6-AS1, SC-008 | verified | e2e/keyboard-only | pass (#405) |
| VO-063 | FR-019, EC-19 | verified | app/history/merge, app/history, e2e/node-arrow-move | pass (#393) |
| VO-064 | FR-019, EC-20 | verified | app/editor/targets | pass (#397) |
| VO-065 | FR-018, US6-AS2 | verified | e2e/leave-page | pass (#414) |
| VO-066 | FR-018, US6-AS3 | verified | e2e/return-to-start, app/editor | pass (#418) |
| VO-067 | FR-017, US6-AS4 | verified | e2e/zoom-pan | pass (#411) |
| VO-068 | FR-013, US6-AS5, EC-05 | verified | app/generation/empty | pass (#399) |
| VO-069 | US6-AS5, EC-05 | verified | e2e/empty-state | pass (#402) |
| VO-070 | FR-020, US6-AS6 | verified | e2e/announcements | pass (#420) |
| VO-071 | FR-020, SC-009 | verified | e2e/wcag | pass (#426) |
| VO-072 | FR-020 | verified | e2e/accessible-names | pass (#423) |
| VO-073 | FR-042, US7-AS1, SC-013 | verified | e2e/save-status | pass (#153) |
| VO-074 | FR-044, US7-AS2, US7-AS12 | verified | e2e/saved-list | pass (#160) |
| VO-075 | FR-046, US7-AS3, US3-AS6, SC-013 | verified | e2e/reopen, e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) | pass (#384) |
| VO-076 | FR-046, FR-052, SC-014 | verified | app/persistence/codec.test.ts, app/persistence/codec.test | pass (#338) |
| VO-077 | FR-045, US7-AS4 | verified | app/model/names.test.ts | pass (#131) |
| VO-078 | FR-042, US7-AS5, EC-15 | verified | e2e/unsaved-new | pass (#156) |
| VO-079 | FR-047, US7-AS6, EC-13 | verified | e2e/delete-diagram, e2e/(delete-diagram unreadable-record saved-list) | pass (#173) |
| VO-080 | FR-048, US7-AS7 | verified | e2e/save-file | pass (#181) |
| VO-081 | FR-048 | verified | app/persistence/fileName.test.ts | pass (#146) |
| VO-082 | FR-049, US7-AS8, SC-014 | verified | e2e/open-file | pass (#185) |
| VO-083 | FR-049, FR-050, US7-AS9, SC-014, EC-12 | verified | app/persistence/openFile.test.ts, app/persistence/openFile | pass (#337) |
| VO-084 | FR-049, US7-AS9 | verified | e2e/open-invalid-file | pass (#188) |
| VO-085 | FR-043, US7-AS10, SC-015 | verified | e2e/storage-failure | pass (#176) |
| VO-086 | FR-051, US7-AS11 | verified | e2e/two-tabs | pass (#199) |
| VO-087 | FR-051, EC-14 | verified | e2e/lock-release | pass (#202) |
| VO-088 | FR-050, EC-11 | verified | e2e/unreadable-record | pass (#169) |
| VO-089 | FR-050, EC-12 | verified | app/persistence/migrations.test.ts | pass (#143) |
| VO-090 | FR-049, DC-04 | verified | e2e/untrusted-text | pass (#193) |
| VO-091 | FR-021, FR-052, SC-010 | verified | e2e/static-offline | pass (#441) |
| VO-092 | FR-003, FR-004, FR-015, FR-023 | verified | e2e/not-offered | pass (#443) |
| VO-093 | FR-015, EC-09 | verified | e2e/controls, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) | pass (#384) |
| VO-094 | FR-038 | verified | app/rendering/layout/sequenceLayout, app/rendering/layout/c4Layout, app/rendering/layout | pass (#343) |
| VO-095 | SC-012 | verified | e2e/performance | pass (#438) |
| VO-096 | SC-016 | verified | app/model/familyChanges | pass (#434) |
| VO-097 | FR-013, FR-034 | verified | app/generation/c4.notices, app/generation | pass (#271) |
| VO-098 | FR-013, FR-034 | verified | e2e/c4-notices | pass (#381) |
| VO-099 | FR-049, DC-05 | verified | app/persistence/openFile.size.test.ts | pass (#137) |
| VO-100 | FR-009, SC-006, DC-06 | verified | app/validation/checkDiagram.property.test.ts, app/validation/checkDiagram.property | pass (#329) |
| VO-101 | US2-AS1, FR-020 | verified | e2e/selection-feedback | pass (#430) |

| Behaviour item | Scenario | Obligations | Status | Tests |
|----------------|----------|-------------|--------|-------|
| BI-001 | US1-AS1 | VO-001 | verified | e2e/start-screen.spec.ts |
| BI-002 | US1-AS2 | VO-002 | verified | e2e/new-diagram.spec.ts, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) |
| BI-003 | US1-AS3 | VO-003 | verified | e2e/flowchart-toolbox.spec.ts, e2e/flowchart-toolbox.spec.ts e2e/new-diagram.spec.ts e2e/start-screen.spec.ts, e2e/(flowchart-toolbox new-diagram start-screen) |
| BI-004 | US1-AS4 | VO-004, VO-005 | verified | app/model/flowchart/addNode.test.ts, e2e/flowchart-add.spec.ts, e2e/(flowchart-add flowchart-toolbox new-diagram start-screen) |
| BI-005 | US1-AS5 | VO-006 | verified | e2e/flowchart-connect.spec.ts, e2e/flowchart-connect |
| BI-006 | US1-AS6 | VO-008 | verified | e2e/copy-source |
| BI-007 | US1-AS7 | VO-009 | verified | e2e/copy-failure, e2e/copy- |
| BI-008 | US1-AS8 | VO-010 | verified | e2e/flowchart-drag-cancel |
| BI-009 | US1-AS9 | VO-011 | verified | e2e/flowchart-layout-note, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) |
| BI-010 | US1-AS10 | VO-012 | verified | e2e/flowchart-preview |
| BI-011 | US1-AS11 | VO-014 | verified | e2e/copy-markdown, e2e/copy- |
| BI-012 | US2-AS1 | VO-015, VO-016 | verified | app/model/flowchart/moveNode.test.ts app/history/noChange.test.ts, app/model/flowchart/moveNode.test.ts, app/history/noChange.test.ts, e2e/flowchart-move |
| BI-095 | US2-AS1 | VO-101 | verified | e2e/selection-feedback |
| BI-013 | US2-AS2 | VO-017, VO-018 | verified | app/generation/escape.fidelity.test.ts, app/generation/escape.fidelity, e2e/labels-special, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) |
| BI-014 | US2-AS3 | VO-019 | verified | app/validation/label.test.ts, app/validation/label.test, app/validation/label |
| BI-015 | US2-AS4 | VO-020 | verified | app/model/flowchart/connectionLabel.test.ts |
| BI-016 | US2-AS5 | VO-021 | verified | app/model/flowchart/deleteNode.test.ts |
| BI-017 | US2-AS6 | VO-022 | verified | app/model/flowchart/deleteConnection.test.ts |
| BI-018 | US2-AS7 | VO-023 | verified | app/model/flowchart/structures.test.ts |
| BI-019 | US2-AS8 | VO-024, VO-025 | verified | app/history/rejections.test.ts, app/history/rejections, e2e/rejections, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls) |
| BI-020 | US2-AS9 | VO-026 | verified | app/model/flowchart/changeShape.test.ts |
| BI-021 | US2-AS10 | VO-027 | verified | app/model/flowchart/changeConnection.test.ts, e2e/controls, app/model/flowchart/changeConnection |
| BI-022 | US2-AS11 | VO-028 | verified | app/model/flowchart/reverse.test.ts |
| BI-023 | US3-AS1 | VO-029 | verified | app/history/history.test.ts, app/history/history.test |
| BI-024 | US3-AS2 | VO-029 | verified | app/history/history.test.ts, app/history/history.test |
| BI-025 | US3-AS3 | VO-030 | verified | e2e/undo-redo |
| BI-026 | US3-AS4 | VO-031 | verified | app/history/redoCleared.test.ts, app/history |
| BI-027 | US3-AS5 | VO-032 | verified | e2e/gestures |
| BI-028 | US3-AS6 | VO-033, VO-075 | verified | app/history/longHistory.test.ts, app/history, e2e/reopen, e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) |
| BI-029 | US4-AS1 | VO-035 | verified | e2e/sequence-toolbox |
| BI-030 | US4-AS2 | VO-037 | verified | app/model/sequence/addMessage |
| BI-031 | US4-AS3 | VO-038 | verified | app/model/sequence/selfMessage |
| BI-032 | US4-AS4 | VO-039 | verified | app/model/sequence/equalLabels |
| BI-033 | US4-AS5 | VO-040 | verified | app/model/sequence/deleteParticipant |
| BI-034 | US4-AS6 | VO-041, VO-042 | verified | app/model/sequence/reorder, e2e/sequence-reorder |
| BI-035 | US4-AS7 | VO-043 | verified | app/model/sequence/blankMessage |
| BI-036 | US4-AS8 | VO-044 | verified | app/model/sequence/changeRole |
| BI-037 | US4-AS9 | VO-045 | verified | app/model/sequence/changeMessage |
| BI-038 | US5-AS1 | VO-046 | verified | e2e/c4-kind-picker |
| BI-039 | US5-AS2 | VO-047 | verified | e2e/c4-toolbox |
| BI-040 | US5-AS3 | VO-049 | verified | app/model/c4/editElement, app/model/c4, e2e/c4-edit-fields |
| BI-041 | US5-AS4 | VO-050 | verified | app/model/c4/relationships, app/model/c4 |
| BI-042 | US5-AS5 | VO-051, VO-052 | verified | app/model/c4/dynamic, app/model/c4, e2e/c4-dynamic-reorder |
| BI-043 | US5-AS6 | VO-053 | verified | app/model/c4/delete, app/model/c4, e2e/c4-delete |
| BI-044 | US5-AS7 | VO-054 | verified | app/model/c4/nesting, app/model/c4 |
| BI-045 | US5-AS8 | VO-055 | verified | app/model/c4/deployment |
| BI-046 | US5-AS9 | VO-056, VO-057 | verified | app/model/c4/moveMembership, e2e/c4-move-to |
| BI-047 | US5-AS10 | VO-058 | verified | app/model/c4/title |
| BI-048 | US5-AS11 | VO-060 | verified | app/model/c4/changeType, app/model/c4 |
| BI-049 | US5-AS12 | VO-061 | verified | app/model/c4/relationshipEnds, app/model/c4 |
| BI-050 | US6-AS1 | VO-062 | verified | e2e/keyboard-only |
| BI-051 | US6-AS2 | VO-065 | verified | e2e/leave-page |
| BI-052 | US6-AS3 | VO-066 | verified | e2e/return-to-start, app/editor |
| BI-053 | US6-AS4 | VO-067 | verified | e2e/zoom-pan |
| BI-054 | US6-AS5 | VO-068, VO-069 | verified | app/generation/empty, e2e/empty-state |
| BI-055 | US6-AS6 | VO-070 | verified | e2e/announcements |
| BI-056 | US7-AS1 | VO-073 | verified | e2e/save-status |
| BI-057 | US7-AS2 | VO-074 | verified | e2e/saved-list |
| BI-058 | US7-AS3 | VO-075 | verified | e2e/reopen, e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) |
| BI-059 | US7-AS4 | VO-077 | verified | app/model/names.test.ts |
| BI-060 | US7-AS5 | VO-078 | verified | e2e/unsaved-new |
| BI-061 | US7-AS6 | VO-079 | verified | e2e/delete-diagram, e2e/(delete-diagram unreadable-record saved-list) |
| BI-062 | US7-AS7 | VO-080 | verified | e2e/save-file |
| BI-063 | US7-AS8 | VO-082 | verified | e2e/open-file |
| BI-064 | US7-AS9 | VO-083, VO-084 | verified | app/persistence/openFile.test.ts, app/persistence/openFile, e2e/open-invalid-file |
| BI-065 | US7-AS10 | VO-085 | verified | e2e/storage-failure |
| BI-066 | US7-AS11 | VO-086 | verified | e2e/two-tabs |
| BI-067 | US7-AS12 | VO-074 | verified | e2e/saved-list |
| BI-068 | - | VO-007 | verified | app/generation/flowchart.fidelity.test.ts, app/generation |
| BI-069 | - | VO-013 | verified | app/editor/sourceCheck.test.ts, e2e/(start-screen new-diagram flowchart-) |
| BI-070 | - | VO-034 | verified | e2e/canvas-source-agree, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) |
| BI-071 | - | VO-036 | verified | app/generation/sequence.fidelity |
| BI-072 | - | VO-048 | verified | app/generation/c4.fidelity, app/generation |
| BI-073 | - | VO-059 | verified | e2e/c4-title |
| BI-074 | - | VO-063 | verified | app/history/merge, app/history, e2e/node-arrow-move |
| BI-075 | - | VO-064 | verified | app/editor/targets |
| BI-076 | - | VO-071 | verified | e2e/wcag |
| BI-077 | - | VO-072 | verified | e2e/accessible-names |
| BI-078 | - | VO-076 | verified | app/persistence/codec.test.ts, app/persistence/codec.test |
| BI-079 | - | VO-081 | verified | app/persistence/fileName.test.ts |
| BI-080 | - | VO-087 | verified | e2e/lock-release |
| BI-081 | - | VO-088 | verified | e2e/unreadable-record |
| BI-082 | - | VO-089 | verified | app/persistence/migrations.test.ts |
| BI-083 | - | VO-090 | verified | e2e/untrusted-text |
| BI-084 | - | VO-091 | verified | e2e/static-offline |
| BI-085 | - | VO-092 | verified | e2e/not-offered |
| BI-086 | - | VO-093 | verified | e2e/controls, e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls), e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen, e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) |
| BI-087 | - | VO-094 | verified | app/rendering/layout/sequenceLayout, app/rendering/layout/c4Layout, app/rendering/layout |
| BI-088 | - | VO-095 | verified | e2e/performance |
| BI-089 | - | VO-096 | verified | app/model/familyChanges |
| BI-090 | - | VO-097 | verified | app/generation/c4.notices, app/generation |
| BI-091 | - | VO-098 | verified | e2e/c4-notices |
| BI-092 | - | VO-099 | verified | app/persistence/openFile.size.test.ts |
| BI-093 | - | VO-100 | verified | app/validation/checkDiagram.property.test.ts, app/validation/checkDiagram.property |
| BI-094 | - | exemption FR-022 | exempt | - |

Not verified by tests

- MV-001 manual: open
- MV-002 manual: open
- MV-003 manual: open
- MV-004 manual: open
- MV-005 manual: open

Counts: verified 101, deferred 0, manual checks 5 open

**Not verified**: FR-022 (exempt: see plan).

**Open decisions**: none. **Exceptions**: EX-01 no-meaningful-red on T045 for VO-016; EX-02 no-meaningful-red on T046 for VO-016; EX-03 no-meaningful-red on T059 for VO-023; EX-04 no-meaningful-red on T060 for VO-023; EX-05 no-meaningful-red on T076 for VO-031; EX-06 no-meaningful-red on T077 for VO-031; EX-07 no-meaningful-red on T078 for VO-033; EX-08 no-meaningful-red on T079 for VO-033; EX-09 no-meaningful-red on T084 for VO-034; EX-10 no-meaningful-red on T085 for VO-034; EX-11 no-meaningful-red on T115 for VO-085; EX-12 no-meaningful-red on T116 for VO-085; EX-13 no-meaningful-red on T123 for VO-090; EX-14 no-meaningful-red on T124 for VO-090; EX-15 no-meaningful-red on T127 for VO-087; EX-16 no-meaningful-red on T128 for VO-087; EX-17 no-meaningful-red on T133 for VO-038; EX-18 no-meaningful-red on T134 for VO-038; EX-19 no-meaningful-red on T135 for VO-039; EX-20 no-meaningful-red on T136 for VO-039; EX-21 no-meaningful-red on T147 for VO-017; EX-22 no-meaningful-red on T148 for VO-017; EX-23 no-meaningful-red on T147 for VO-019; EX-24 no-meaningful-red on T148 for VO-019; EX-25 no-meaningful-red on T147 for VO-024; EX-26 no-meaningful-red on T148 for VO-024; EX-27 no-meaningful-red on T147 for VO-029; EX-28 no-meaningful-red on T148 for VO-029; EX-29 no-meaningful-red on T147 for VO-100; EX-30 no-meaningful-red on T148 for VO-100; EX-31 no-meaningful-red on T149 for VO-076; EX-32 no-meaningful-red on T149 for VO-083; EX-33 no-meaningful-red on T150 for VO-076; EX-34 no-meaningful-red on T150 for VO-083; EX-35 no-meaningful-red on T159 for VO-075; EX-36 no-meaningful-red on T160 for VO-075; EX-37 no-meaningful-red on T177 for VO-055; EX-38 no-meaningful-red on T178 for VO-055; EX-39 no-meaningful-red on T179 for VO-056; EX-40 no-meaningful-red on T180 for VO-056; EX-41 no-meaningful-red on T185 for VO-017; EX-42 no-meaningful-red on T186 for VO-017; EX-43 no-meaningful-red on T185 for VO-019; EX-44 no-meaningful-red on T186 for VO-019; EX-45 no-meaningful-red on T185 for VO-024; EX-46 no-meaningful-red on T186 for VO-024; EX-47 no-meaningful-red on T185 for VO-029; EX-48 no-meaningful-red on T186 for VO-029; EX-49 no-meaningful-red on T185 for VO-100; EX-50 no-meaningful-red on T186 for VO-100; EX-51 no-meaningful-red on T187 for VO-076; EX-52 no-meaningful-red on T188 for VO-076; EX-53 no-meaningful-red on T187 for VO-083; EX-54 no-meaningful-red on T188 for VO-083; EX-55 no-meaningful-red on T203 for VO-002; EX-56 no-meaningful-red on T203 for VO-011; EX-57 no-meaningful-red on T203 for VO-018; EX-58 no-meaningful-red on T203 for VO-034; EX-59 no-meaningful-red on T203 for VO-093; EX-60 no-meaningful-red on T203 for VO-075; EX-61 no-meaningful-red on T204 for VO-002; EX-62 no-meaningful-red on T204 for VO-011; EX-63 no-meaningful-red on T204 for VO-018; EX-64 no-meaningful-red on T204 for VO-034; EX-65 no-meaningful-red on T204 for VO-093; EX-66 no-meaningful-red on T204 for VO-075; EX-67 no-meaningful-red on T209 for VO-068; EX-68 no-meaningful-red on T210 for VO-068; EX-69 no-meaningful-red on T230 for VO-096; EX-70 no-meaningful-red on T231 for VO-096; EX-71 no-meaningful-red on T232 for VO-092; EX-72 no-meaningful-red on T233 for VO-092; EX-73 no-meaningful-red on T234 for VO-095; EX-74 no-meaningful-red on T235 for VO-095. **Expectation changes**: XC-01 on T017 for SC-002; XC-02 on T029 for FR-025; XC-03 on T030 for FR-025; XC-04 on T032 for FR-016; XC-05 on T036 for FR-014; XC-06 on T062 for FR-009; XC-07 on T072 for EC-09; XC-08 on T073 for EC-09; XC-09 on T075 for FR-011; XC-10 on T083 for EC-08; XC-11 on T087 for FR-016; XC-12 on T100 for FR-048; XC-13 on T104 for FR-043; XC-14 on T106 for EC-15; XC-15 on T108 for FR-044; XC-16 on T110 for FR-043; XC-17 on T114 for EC-13; XC-18 on T118 for FR-047; XC-19 on T126 for FR-050; XC-20 on T140 for FR-029; XC-21 on T148 for FR-018; XC-22 on T147 for FR-006, FR-026, FR-009, FR-008, DC-06; XC-23 on T148 for FR-006, FR-026, FR-009, FR-008, DC-06; XC-24 on T147 for FR-006, FR-026, FR-009, FR-008, DC-06, US2-AS2, US2-AS3, US2-AS8, US3-AS1, SC-003, SC-006, SC-004, EC-03, EC-04; XC-25 on T148 for FR-006, FR-026, FR-009, FR-008, DC-06, US2-AS2, US2-AS3, US2-AS8, US3-AS1, SC-003, SC-006, SC-004, EC-03, EC-04; XC-26 on T149 for FR-052; XC-27 on T149 for FR-050, DC-04, DC-06; XC-28 on T150 for FR-052; XC-29 on T150 for FR-050, DC-04, DC-06; XC-30 on T152 for FR-003; XC-31 on T157 for FR-001, FR-003, FR-006, FR-009, FR-005, FR-041, FR-008, SC-003, EC-03, EC-09; XC-32 on T158 for FR-001, FR-003, FR-006, FR-009, FR-005, FR-041, FR-008, SC-003, EC-03, EC-09; XC-33 on T160 for FR-042, FR-043; XC-34 on T159 for FR-042, FR-043; XC-35 on T161 for FR-031, FR-032, FR-035; XC-36 on T162 for FR-031, FR-032, FR-035; XC-37 on T165 for FR-054; XC-38 on T171 for FR-033; XC-39 on T172 for FR-033; XC-40 on T183 for FR-040, FR-041; XC-41 on T184 for FR-040, FR-041; XC-42 on T185 for FR-006, FR-026, FR-009, FR-008, DC-06, US2-AS2, US2-AS3, US2-AS8, US3-AS1, SC-003, SC-006, SC-004, EC-03, EC-04; XC-43 on T186 for FR-006, FR-026, FR-009, FR-008, DC-06, US2-AS2, US2-AS3, US2-AS8, US3-AS1, SC-003, SC-006, SC-004, EC-03, EC-04; XC-44 on T185 for FR-009, SC-006, DC-06; XC-45 on T186 for FR-009, SC-006, DC-06; XC-46 on T185 for FR-006, US2-AS2, SC-003, EC-03; XC-47 on T186 for FR-006, US2-AS2, SC-003, EC-03; XC-48 on T185 for FR-008, US3-AS1, SC-004; XC-49 on T186 for FR-008, US3-AS1, SC-004; XC-50 on T185 for FR-006, FR-026, US2-AS3, EC-04; XC-51 on T186 for FR-006, FR-026, US2-AS3, EC-04; XC-52 on T185 for FR-009, US2-AS8, SC-006; XC-53 on T186 for FR-009, US2-AS8, SC-006; XC-54 on T187 for FR-052, FR-050, DC-04, DC-06; XC-55 on T188 for FR-052, FR-050, DC-04, DC-06; XC-56 on T187 for FR-052, FR-050, DC-04, DC-06; XC-57 on T188 for FR-052, FR-050, DC-04, DC-06; XC-58 on T191 for FR-036, FR-037; XC-59 on T192 for FR-036, FR-037; XC-60 on T194 for FR-040, FR-041; XC-61 on T195 for FR-033; XC-62 on T196 for FR-033; XC-63 on T199 for FR-054; XC-64 on T200 for FR-054; XC-65 on T205 for EC-19; XC-66 on T206 for EC-19; XC-67 on T208 for FR-019; XC-68 on T212 for FR-019; XC-69 on T214 for FR-019; XC-70 on T215 for FR-019; XC-71 on T223 for FR-020; XC-72 on T225 for FR-020; XC-73 on T227 for FR-020; XC-74 on T229 for AC4; XC-75 on T048 for FR-006; XC-76 on T052 for FR-006; XC-77 on T062 for FR-009; XC-78 on T075 for FR-008; XC-79 on T091 for FR-049; XC-80 on T092 for FR-049; XC-81 on T096 for FR-052; XC-82 on T102 for FR-009; XC-83 on T147 for FR-006; XC-84 on T147 for FR-006; XC-85 on T147 for FR-009; XC-86 on T147 for FR-008; XC-87 on T147 for FR-009; XC-88 on T148 for FR-006; XC-89 on T148 for FR-006; XC-90 on T148 for FR-009; XC-91 on T148 for FR-008; XC-92 on T148 for FR-009; XC-93 on T149 for FR-052; XC-94 on T149 for FR-049; XC-95 on T150 for FR-052; XC-96 on T150 for FR-049; XC-97 on T214 for FR-019; XC-98 on T064 for FR-009; XC-99 on T157 for FR-009; XC-100 on T158 for FR-009.

**Item changes**: none.

**Pre-existing failures**: #1 unit-all: No test files exist yet; Vitest exits non-zero when none are found; No tests exist before Phase 3; pre-existing, not a regression; #2 e2e-all: No spec files exist yet; Playwright exits non-zero when none are found (and Firefox browser may be missing); No tests exist before Phase 3; pre-existing, not a regression.

## Baseline

| Seq | Command | Result | Pre-existing failures |
|-----|---------|--------|-----------------------|
| 1 | unit-all | fail | No test files exist yet; Vitest exits non-zero when none are found; No tests exist before Phase 3; pre-existing, not a regression |
| 2 | e2e-all | fail | No spec files exist yet; Playwright exits non-zero when none are found (and Firefox browser may be missing); No tests exist before Phase 3; pre-existing, not a regression |

## Test execution records

| Seq | Time | Task | Obligations | Phase | Command | Selector | Result | Valid | Classification | Files | Fingerprint | Note | Check |
|-----|------|------|-------------|-------|---------|----------|--------|-------|----------------|-------|-------------|------|-------|
| 1 | 2026-10-18T10:18:16Z | - | - | baseline | unit-all | - | fail | yes | environment | - | - | No test files exist yet; Vitest exits non-zero when none are found; No tests exist before Phase 3; pre-existing, not a regression | 222038 |
| 2 | 2026-10-18T10:18:22Z | - | - | baseline | e2e-all | - | fail | yes | environment | - | - | No spec files exist yet; Playwright exits non-zero when none are found (and Firefox browser may be missing); No tests exist before Phase 3; pre-existing, not a regression | 0b316f |
| 3 | 2026-10-18T10:19:59Z | - | - | checkpoint | unit-all | - | fail | no | environment | - | - | No test files exist yet at the end of Phase 2 (type declarations only); Vitest exits 1 when it finds none. Rerun as checkpoint once Phase 3 tests exist. | e84340 |
| 4 | 2026-10-18T10:21:49Z | T013 | VO-004 | red | unit | app/model/flowchart/addNode.test.ts | fail | yes | assertion | app/model/flowchart/addNode.test.ts | 549ae1 | expected: to have a length of 1 | e2c18c |
| 5 | 2026-10-18T10:22:34Z | T015 | VO-004 | green | unit | app/model/flowchart/addNode.test.ts | fail | no | defect | app/model/flowchart/addNode.test.ts | 549ae1 | Test helper readBack did not call mermaid.initialize, so no diagram type was registered (UnknownDiagramError); fixed in app/testing/mermaidReadback.ts | d48454 |
| 6 | 2026-10-18T10:22:52Z | T015 | VO-004 | green | unit | app/model/flowchart/addNode.test.ts | pass | yes | - | app/model/flowchart/addNode.test.ts | 549ae1 | - | 24190e |
| 7 | 2026-10-18T10:23:53Z | T016 | VO-007 | red | unit | app/generation/flowchart.fidelity.test.ts | fail | yes | assertion | app/generation/flowchart.fidelity.test.ts | dd775b | expected: to deeply equal | d8a313 |
| 8 | 2026-10-18T10:24:11Z | T017 | VO-007 | green | unit | app/generation | fail | no | defect | app/generation/flowchart.fidelity.test.ts | dd775b | Test bug: the ninth chained connection pointed at a node n10 that does not exist; corrected to wrap to n1 | 86efe2 |
| 9 | 2026-10-18T10:24:22Z | T017 | VO-007 | green | unit | app/generation | pass | yes | - | app/generation/flowchart.fidelity.test.ts | 3db027 | - | 792788 |
| 10 | 2026-10-18T10:26:04Z | T018 | VO-001 | red | e2e | e2e/start-screen.spec.ts | fail | yes | assertion | e2e/start-screen.spec.ts | 3ccdf0 | expected: getByRole( | 8eade6 |
| 11 | 2026-10-18T10:26:57Z | T019 | VO-001 | green | e2e | e2e/start-screen.spec.ts | pass | yes | - | e2e/start-screen.spec.ts | 3ccdf0 | - | 340ddf |
| 12 | 2026-10-18T10:27:37Z | T020 | VO-002 | red | e2e | e2e/new-diagram.spec.ts | fail | yes | assertion | e2e/new-diagram.spec.ts | 8195fa | expected: getByRole( | 68d2f0 |
| 13 | 2026-10-18T10:27:54Z | T020 | VO-002 | red | e2e | e2e/new-diagram.spec.ts | fail | yes | assertion | e2e/new-diagram.spec.ts | 67c901 | expected: getByRole( | cd6dcd |
| 14 | 2026-10-18T10:29:09Z | T021 | VO-002 | green | e2e | e2e/new-diagram.spec.ts | pass | yes | - | e2e/new-diagram.spec.ts | 67c901 | - | bb2b32 |
| 15 | 2026-10-18T10:29:18Z | T022 | VO-002 | green | e2e | e2e/new-diagram.spec.ts | pass | yes | - | e2e/new-diagram.spec.ts | 67c901 | - | a5f0c9 |
| 16 | 2026-10-18T10:29:25Z | T023 | VO-002 | green | e2e | e2e/new-diagram.spec.ts | pass | yes | - | e2e/new-diagram.spec.ts | 67c901 | - | ac27f4 |
| 17 | 2026-10-18T10:30:00Z | T024 | VO-003 | red | e2e | e2e/flowchart-toolbox.spec.ts | fail | yes | assertion | e2e/flowchart-toolbox.spec.ts | ba5924 | expected: getByRole( | 560341 |
| 18 | 2026-10-18T10:30:34Z | T025 | VO-003 | green | e2e | e2e/flowchart-toolbox.spec.ts e2e/new-diagram.spec.ts e2e/start-screen.spec.ts | fail | no | environment | e2e/flowchart-toolbox.spec.ts | ba5924 | Selector with spaces was passed as one pattern, so no test matched; not a test result. Rerun with a regex selector | bfe926 |
| 19 | 2026-10-18T10:30:49Z | T025 | VO-003 | green | e2e | e2e/(flowchart-toolbox new-diagram start-screen) | pass | yes | - | e2e/flowchart-toolbox.spec.ts | ba5924 | - | f696e5 |
| 20 | 2026-10-18T10:31:38Z | T026 | VO-005 | red | e2e | e2e/flowchart-add.spec.ts | fail | yes | assertion | e2e/flowchart-add.spec.ts | 3a40b1 | expected: Diamond node: Diamond | ab60c1 |
| 21 | 2026-10-18T10:32:26Z | T027 | VO-005 | green | e2e | e2e/(flowchart-add flowchart-toolbox new-diagram start-screen) | pass | yes | - | e2e/flowchart-add.spec.ts | 3a40b1 | - | d4506f |
| 22 | 2026-10-18T10:33:45Z | T028 | VO-006 | red | e2e | e2e/flowchart-connect.spec.ts | fail | yes | assertion | e2e/flowchart-connect.spec.ts | 756ccd | expected: react-flow__handle | 2164e2 |
| 23 | 2026-10-18T10:34:56Z | T029 | VO-006 | green | e2e | e2e/flowchart-connect | fail | no | defect | e2e/flowchart-connect.spec.ts | 756ccd | Test layout flaw: the two nodes were vertically aligned, so the edge's bounding box has zero width and Playwright treats it as hidden; the second node is now offset | 0b0e5c |
| 24 | 2026-10-18T10:35:54Z | T029 | VO-006 | green | e2e | e2e/flowchart-connect | pass | yes | - | e2e/flowchart-connect.spec.ts | 699e75 | - | 2bf876 |
| 25 | 2026-10-18T10:36:04Z | T030 | VO-006 | green | e2e | e2e/flowchart-connect | pass | yes | - | e2e/flowchart-connect.spec.ts | 699e75 | - | 1ebfb6 |
| 26 | 2026-10-18T10:36:59Z | T031 | VO-010 | red | e2e | e2e/flowchart-drag-cancel | fail | yes | assertion | e2e/flowchart-drag-cancel.spec.ts | 7e6c77 | expected: toBeCloseTo | 6c3286 |
| 27 | 2026-10-18T10:37:28Z | T032 | VO-010 | green | e2e | e2e/flowchart-drag-cancel | fail | no | defect | e2e/flowchart-drag-cancel.spec.ts | 7e6c77 | Test movement flaw: React Flow begins a drag on the first move, so the first stepped move was absorbed; the test now nudges the pointer first | 7b18a2 |
| 28 | 2026-10-18T10:37:50Z | T032 | VO-010 | green | e2e | e2e/flowchart-drag-cancel | fail | no | defect | e2e/flowchart-drag-cancel.spec.ts | 01016e | Implementation: React Flow auto-panned the viewport while the pointer left the canvas, so the node moved on screen; autoPanOnNodeDrag is now off | 64e49b |
| 29 | 2026-10-18T10:38:12Z | T032 | VO-010 | green | e2e | e2e/flowchart-drag-cancel | pass | yes | - | e2e/flowchart-drag-cancel.spec.ts | 01016e | - | 93e93c |
| 30 | 2026-10-18T10:38:53Z | T033 | VO-011 | red | e2e | e2e/flowchart-layout-note | fail | yes | assertion | e2e/flowchart-layout-note.spec.ts | 2b22bf | expected: getByRole( | 5fff6e |
| 31 | 2026-10-18T10:39:06Z | T034 | VO-011 | green | e2e | e2e/flowchart-layout-note | pass | yes | - | e2e/flowchart-layout-note.spec.ts | 2b22bf | - | 765c99 |
| 32 | 2026-10-18T10:40:34Z | T035 | VO-008 | red | e2e | e2e/copy-source | fail | yes | assertion | e2e/copy-source.spec.ts | 260ddb | expected: Copy Source | a9e817 |
| 33 | 2026-10-18T10:41:38Z | T041 | VO-013 | red | unit | app/editor/sourceCheck.test.ts | fail | yes | assertion | app/editor/sourceCheck.test.ts | bc3525 | expected: expected undefined | d8c366 |
| 34 | 2026-10-18T10:42:15Z | T042 | VO-013 | green | unit | app/editor/sourceCheck.test.ts | pass | yes | - | app/editor/sourceCheck.test.ts | bc3525 | - | 0285f0 |
| 35 | 2026-10-18T10:43:46Z | T042 | VO-013 | refactor | e2e | e2e/(start-screen new-diagram flowchart-) | fail | no | environment | app/editor/sourceCheck.test.ts | bc3525 | Intermittent Firefox timeouts under 8 parallel workers on the unbundled dev server (also Vite error overlay for the benign ResizeObserver notice); fixed by overlay off, 4 workers, 15s expect timeout. Passed 4/4 afterwards | e3fdc4 |
| 36 | 2026-10-18T10:44:27Z | T042 | VO-013 | refactor | e2e | e2e/(start-screen new-diagram flowchart-) | fail | no | environment | app/editor/sourceCheck.test.ts | bc3525 | Intermittent Firefox timeouts under 8 parallel workers on the unbundled dev server (also Vite error overlay for the benign ResizeObserver notice); fixed by overlay off, 4 workers, 15s expect timeout. Passed 4/4 afterwards | 489162 |
| 37 | 2026-10-18T10:46:31Z | T042 | VO-013 | refactor | e2e | e2e/(start-screen new-diagram flowchart-) | fail | no | environment | app/editor/sourceCheck.test.ts | bc3525 | Intermittent Firefox timeouts under 8 parallel workers on the unbundled dev server (also Vite error overlay for the benign ResizeObserver notice); fixed by overlay off, 4 workers, 15s expect timeout. Passed 4/4 afterwards | 30c7b5 |
| 38 | 2026-10-18T10:53:39Z | T042 | VO-013 | refactor | e2e | e2e/(start-screen new-diagram flowchart-) | pass | yes | - | app/editor/sourceCheck.test.ts | bc3525 | - | eb0343 |
| 39 | 2026-10-18T10:54:49Z | T036 | VO-008 | green | e2e | e2e/copy-source | fail | no | defect | e2e/copy-source.spec.ts | 260ddb | Test bug: the route pattern /mermaid/i also matched every script under the project folder mermaid-editor-wysiwyg, holding back the whole app; narrowed to the pre-bundled mermaid dependency | a5c48f |
| 40 | 2026-10-18T10:55:03Z | T036 | VO-008 | green | e2e | e2e/copy-source | pass | yes | - | e2e/copy-source.spec.ts | 9c89b4 | - | e93b1d |
| 41 | 2026-10-18T10:55:49Z | T037 | VO-009 | red | e2e | e2e/copy-failure | fail | yes | assertion | e2e/copy-failure.spec.ts | 4acfb9 | expected: could not be copied | eff001 |
| 42 | 2026-10-18T10:56:12Z | T038 | VO-009 | green | e2e | e2e/copy- | pass | yes | - | e2e/copy-failure.spec.ts | 4acfb9 | - | 6710b7 |
| 43 | 2026-10-18T10:57:14Z | T039 | VO-014 | red | e2e | e2e/copy-markdown | fail | yes | assertion | e2e/copy-markdown.spec.ts | 942b10 | expected: Copy for Markdown | 71d901 |
| 44 | 2026-10-18T10:57:33Z | T040 | VO-014 | green | e2e | e2e/copy- | pass | yes | - | e2e/copy-markdown.spec.ts | 942b10 | - | e3f50e |
| 45 | 2026-10-18T10:57:45Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | d4a2c0 |
| 46 | 2026-10-18T10:58:01Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | ea62fa |
| 47 | 2026-10-18T10:58:54Z | T043 | VO-015 | red | unit | app/model/flowchart/moveNode.test.ts app/history/noChange.test.ts | fail | no | environment | app/history/noChange.test.ts, app/model/flowchart/moveNode.test.ts | 7ec6fb | failed for a different reason; Two files in one selector were passed as a single filter string, so nothing matched; not a test result | 9f6dbf |
| 48 | 2026-10-18T10:59:01Z | T043 | VO-015 | red | unit | app/model/flowchart/moveNode.test.ts | fail | yes | assertion | app/model/flowchart/moveNode.test.ts | 7cc8b9 | expected: toMatchObject | 9c77cd |
| 49 | 2026-10-18T10:59:01Z | T043 | VO-015 | red | unit | app/history/noChange.test.ts | fail | yes | assertion | app/history/noChange.test.ts | 4cb0c8 | expected: committed | 7d5189 |
| 50 | 2026-10-18T10:59:24Z | T044 | VO-015 | green | unit | app/model/flowchart/moveNode.test.ts | pass | yes | - | app/model/flowchart/moveNode.test.ts | 7cc8b9 | - | d295f0 |
| 51 | 2026-10-18T10:59:25Z | T044 | VO-015 | green | unit | app/history/noChange.test.ts | pass | yes | - | app/history/noChange.test.ts | 4cb0c8 | - | ffd402 |
| 52 | 2026-10-18T10:59:31Z | T044 | VO-015 | refactor | unit-all | - | pass | yes | - | app/history/noChange.test.ts | 4cb0c8 | - | 97671c |
| 53 | 2026-10-18T11:00:03Z | T045 | VO-016 | red | e2e | e2e/flowchart-move | pass | no | - | e2e/flowchart-move.spec.ts | 7c6a1d | passed on first run: investigate | 35a488 |
| 54 | 2026-10-18T11:00:21Z | T046 | VO-016 | green | e2e | e2e/flowchart-move | pass | yes | - | e2e/flowchart-move.spec.ts | c8ef69 | - | a57d10 |
| 55 | 2026-10-18T11:01:00Z | T047 | VO-019 | red | unit | app/validation/label.test.ts | fail | yes | assertion | app/validation/label.test.ts | 0cb2fd | expected: blankLabel | 5894cc |
| 56 | 2026-10-18T11:01:18Z | T048 | VO-019 | green | unit | app/validation/label.test.ts | pass | yes | - | app/validation/label.test.ts | 0cb2fd | - | 993790 |
| 57 | 2026-10-18T11:01:39Z | T049 | VO-020 | red | unit | app/model/flowchart/connectionLabel.test.ts | fail | yes | assertion | app/model/flowchart/connectionLabel.test.ts | 5859a2 | expected: committed | f64dc3 |
| 58 | 2026-10-18T11:01:59Z | T050 | VO-020 | green | unit | app/model/flowchart/connectionLabel.test.ts | pass | yes | - | app/model/flowchart/connectionLabel.test.ts | 5859a2 | - | cba21b |
| 59 | 2026-10-18T11:02:00Z | T050 | VO-020 | refactor | unit-all | - | pass | yes | - | app/model/flowchart/connectionLabel.test.ts | 5859a2 | - | cf560c |
| 60 | 2026-10-18T11:02:43Z | T051 | VO-017 | red | unit | app/generation/escape.fidelity.test.ts | fail | no | defect | app/generation/escape.fidelity.test.ts | 752267 | failed for a different reason; Test file held literal U+2028 characters instead of escapes, a syntax error; escapes restored | bcf92d |
| 61 | 2026-10-18T11:03:05Z | T051 | VO-017 | red | unit | app/generation/escape.fidelity.test.ts | fail | yes | assertion | app/generation/escape.fidelity.test.ts | 56f1b9 | expected: Parse error | 5f9b33 |
| 62 | 2026-10-18T11:03:27Z | T052 | VO-017 | green | unit | app/generation/escape.fidelity.test.ts | fail | no | defect | app/generation/escape.fidelity.test.ts | 56f1b9 | escape.ts held a literal U+2028 character, a syntax error; rewritten with Unicode property escapes | 47d4ac |
| 63 | 2026-10-18T11:03:44Z | T052 | VO-017 | green | unit | app/generation/escape.fidelity.test.ts | fail | no | defect | app/generation/escape.fidelity.test.ts | 56f1b9 | Test helper decode() converted placeholders before <br>, turning a typed <br/> into a line break; order fixed | a83932 |
| 64 | 2026-10-18T11:04:05Z | T052 | VO-017 | green | unit | app/generation/escape.fidelity.test.ts | pass | yes | - | app/generation/escape.fidelity.test.ts | 56f1b9 | - | 0c02fe |
| 65 | 2026-10-18T11:04:41Z | T052 | VO-017 | refactor | unit-all | - | pass | yes | - | app/generation/escape.fidelity.test.ts | 56f1b9 | - | 4224ce |
| 66 | 2026-10-18T11:05:49Z | T053 | VO-018 | red | e2e | e2e/labels-special | fail | yes | assertion | e2e/labels-special.spec.ts | 1979b7 | expected: Properties | 1a3679 |
| 67 | 2026-10-18T11:06:26Z | T054 | VO-018 | green | e2e | e2e/labels-special | pass | yes | - | e2e/labels-special.spec.ts | 1979b7 | - | 195ece |
| 68 | 2026-10-18T11:07:00Z | T054 | VO-018 | refactor | e2e-all | - | pass | yes | - | e2e/labels-special.spec.ts | 1979b7 | - | 998db0 |
| 69 | 2026-10-18T11:07:47Z | T055 | VO-021 | red | unit | app/model/flowchart/deleteNode.test.ts | fail | yes | assertion | app/model/flowchart/deleteNode.test.ts | 6ae99e | expected: not built yet | 321440 |
| 70 | 2026-10-18T11:07:48Z | T057 | VO-022 | red | unit | app/model/flowchart/deleteConnection.test.ts | fail | yes | assertion | app/model/flowchart/deleteConnection.test.ts | 5a26fc | expected: not built yet | 898d1a |
| 71 | 2026-10-18T11:08:05Z | T056 | VO-021 | green | unit | app/model/flowchart/deleteNode.test.ts | pass | yes | - | app/model/flowchart/deleteNode.test.ts | 6ae99e | - | 2858f1 |
| 72 | 2026-10-18T11:08:05Z | T058 | VO-022 | green | unit | app/model/flowchart/deleteConnection.test.ts | pass | yes | - | app/model/flowchart/deleteConnection.test.ts | 5a26fc | - | 49f901 |
| 73 | 2026-10-18T11:08:24Z | T056 | VO-021 | refactor | unit-all | - | pass | yes | - | app/model/flowchart/deleteNode.test.ts | 6ae99e | - | 7c87b0 |
| 74 | 2026-10-18T11:08:26Z | T058 | VO-022 | refactor | unit-all | - | pass | yes | - | app/model/flowchart/deleteConnection.test.ts | 5a26fc | - | e32721 |
| 75 | 2026-10-18T11:08:57Z | T059 | VO-023 | red | unit | app/model/flowchart/structures.test.ts | pass | no | - | app/model/flowchart/structures.test.ts | 5a1240 | passed on first run: investigate | d33c00 |
| 76 | 2026-10-18T11:09:04Z | T060 | VO-023 | green | unit | app/model/flowchart/structures.test.ts | pass | yes | - | app/model/flowchart/structures.test.ts | 5a1240 | - | df4066 |
| 77 | 2026-10-18T11:09:35Z | T061 | VO-024 | red | unit | app/history/rejections.test.ts | fail | yes | assertion | app/history/rejections.test.ts | 7a43a8 | expected: rejectionMessage | 30ea31 |
| 78 | 2026-10-18T11:09:51Z | T062 | VO-024 | green | unit | app/history/rejections.test.ts | pass | yes | - | app/history/rejections.test.ts | 78788d | - | e51b3d |
| 79 | 2026-10-18T11:09:58Z | T062 | VO-024 | refactor | unit-all | - | pass | yes | - | app/history/rejections.test.ts | 78788d | - | 3791bb |
| 80 | 2026-10-18T11:10:39Z | T063 | VO-025 | red | e2e | e2e/rejections | fail | yes | assertion | e2e/rejections.spec.ts | 208818 | expected: A label needs at least one visible character | c3bb4b |
| 81 | 2026-10-18T11:10:55Z | T064 | VO-025 | green | e2e | e2e/rejections | pass | yes | - | e2e/rejections.spec.ts | 208818 | - | 46cf12 |
| 82 | 2026-10-18T11:11:39Z | T065 | VO-026 | red | unit | app/model/flowchart/changeShape.test.ts | fail | yes | assertion | app/model/flowchart/changeShape.test.ts | e9e316 | expected: not built yet | 2317fd |
| 83 | 2026-10-18T11:11:50Z | T066 | VO-026 | green | unit | app/model/flowchart/changeShape.test.ts | pass | yes | - | app/model/flowchart/changeShape.test.ts | e9e316 | - | b52d6f |
| 84 | 2026-10-18T11:11:56Z | T066 | VO-026 | refactor | unit-all | - | pass | yes | - | app/model/flowchart/changeShape.test.ts | e9e316 | - | 04a67c |
| 85 | 2026-10-18T11:12:20Z | T067 | VO-027 | red | unit | app/model/flowchart/changeConnection.test.ts | fail | yes | assertion | app/model/flowchart/changeConnection.test.ts | 33ce88 | expected: not built yet | c7b45a |
| 86 | 2026-10-18T11:12:41Z | T068 | VO-027 | green | unit | app/model/flowchart/changeConnection.test.ts | pass | yes | - | app/model/flowchart/changeConnection.test.ts | 33ce88 | - | 66a40b |
| 87 | 2026-10-18T11:12:43Z | T068 | VO-027 | refactor | unit-all | - | pass | yes | - | app/model/flowchart/changeConnection.test.ts | 33ce88 | - | 10dcc8 |
| 88 | 2026-10-18T11:13:12Z | T068 | VO-027 | refactor | unit-all | - | pass | yes | - | app/model/flowchart/changeConnection.test.ts | 33ce88 | - | eea2de |
| 89 | 2026-10-18T11:13:48Z | T069 | VO-028 | red | unit | app/model/flowchart/reverse.test.ts | fail | yes | assertion | app/model/flowchart/reverse.test.ts | 3d4ded | expected: not built yet | 7a9989 |
| 90 | 2026-10-18T11:13:59Z | T070 | VO-028 | green | unit | app/model/flowchart/reverse.test.ts | pass | yes | - | app/model/flowchart/reverse.test.ts | 3d4ded | - | 47296e |
| 91 | 2026-10-18T11:14:01Z | T070 | VO-028 | refactor | unit-all | - | pass | yes | - | app/model/flowchart/reverse.test.ts | 3d4ded | - | 2ebfcf |
| 92 | 2026-10-18T11:17:33Z | T071 | VO-093 | red | e2e | e2e/controls | fail | yes | assertion | e2e/controls.spec.ts | 5827d9 | expected: Delete | cc21aa |
| 93 | 2026-10-18T11:21:38Z | T072 | VO-093, VO-027 | green | e2e | e2e/controls | fail | no | defect | e2e/controls.spec.ts | 5827d9 | Test bug: the Diamond was dropped at x=880, beyond the visible canvas, where the Properties panel intercepted the drop; moved into view | 12cce8 |
| 94 | 2026-10-18T11:23:05Z | T072 | VO-093, VO-027 | green | e2e | e2e/controls | fail | no | defect | e2e/controls.spec.ts | ce7c6a | Test bug: the closing menu's backdrop still covered the edge when it was clicked; the test now waits for the menu to close | a3426b |
| 95 | 2026-10-18T11:23:55Z | T072 | VO-093, VO-027 | green | e2e | e2e/controls | fail | no | defect | e2e/controls.spec.ts | 78eec3 | Test bug: the closed menu's invisible backdrop was still fading out and swallowed the edge click; the test now waits for it to be removed | 8c1d7e |
| 96 | 2026-10-18T11:26:53Z | T072 | VO-093, VO-027 | green | e2e | e2e/controls | pass | yes | - | e2e/controls.spec.ts | 744a59 | - | cb2d1d |
| 97 | 2026-10-18T11:27:16Z | T073 | VO-093 | green | e2e | e2e/controls | pass | yes | - | e2e/controls.spec.ts | 744a59 | - | e91831 |
| 98 | 2026-10-18T11:27:48Z | T073 | VO-093 | refactor | e2e-all | - | pass | yes | - | e2e/controls.spec.ts | 744a59 | - | 9877c6 |
| 99 | 2026-10-18T11:28:03Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | bfef9c |
| 100 | 2026-10-18T11:28:36Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | e3efa0 |
| 101 | 2026-10-18T11:29:13Z | T074 | VO-029 | red | unit | app/history/history.test.ts | fail | yes | assertion | app/history/history.test.ts | 042354 | expected: toEqual | bfbc8c |
| 102 | 2026-10-18T11:29:30Z | T075 | VO-029 | green | unit | app/history/history.test.ts | pass | yes | - | app/history/history.test.ts | fd76ec | - | dd4f6f |
| 103 | 2026-10-18T11:29:36Z | T075 | VO-029 | refactor | unit-all | - | pass | yes | - | app/history/history.test.ts | fd76ec | - | 8186ce |
| 104 | 2026-10-18T11:30:06Z | T076 | VO-031 | red | unit | app/history/redoCleared.test.ts | pass | no | - | app/history/redoCleared.test.ts | ae575b | passed on first run: investigate | 8ca6c4 |
| 105 | 2026-10-18T11:30:06Z | T078 | VO-033 | red | unit | app/history/longHistory.test.ts | pass | no | - | app/history/longHistory.test.ts | bb7723 | passed on first run: investigate | 456ac1 |
| 106 | 2026-10-18T11:30:15Z | T076 | VO-031 | green | unit | app/history | pass | yes | - | app/history/redoCleared.test.ts | ae575b | - | fbbc2e |
| 107 | 2026-10-18T11:30:16Z | T077 | VO-031 | green | unit | app/history | pass | yes | - | app/history/redoCleared.test.ts | ae575b | - | dfcfc9 |
| 108 | 2026-10-18T11:30:17Z | T078 | VO-033 | green | unit | app/history | pass | yes | - | app/history/longHistory.test.ts | bb7723 | - | b619aa |
| 109 | 2026-10-18T11:30:18Z | T079 | VO-033 | green | unit | app/history | pass | yes | - | app/history/longHistory.test.ts | bb7723 | - | 882087 |
| 110 | 2026-10-18T11:31:08Z | T080 | VO-030 | red | e2e | e2e/undo-redo | fail | yes | assertion | e2e/undo-redo.spec.ts | 8669e1 | expected: Undo | 200425 |
| 111 | 2026-10-18T11:31:39Z | T081 | VO-030 | green | e2e | e2e/undo-redo | pass | yes | - | e2e/undo-redo.spec.ts | 8669e1 | - | d1b953 |
| 112 | 2026-10-18T11:32:19Z | T081 | VO-030 | refactor | e2e-all | - | pass | yes | - | e2e/undo-redo.spec.ts | 8669e1 | - | 17b977 |
| 113 | 2026-10-18T11:33:02Z | T082 | VO-032 | red | e2e | e2e/gestures | pass | no | - | e2e/gestures.spec.ts | 3dc880 | passed on first run: investigate | 878059 |
| 114 | 2026-10-18T11:33:30Z | T082 | VO-032 | red | e2e | e2e/gestures | fail | yes | assertion | e2e/gestures.spec.ts | 48a958 | expected: toBeCloseTo | 3678d3 |
| 115 | 2026-10-18T11:33:58Z | T083 | VO-032 | green | e2e | e2e/gestures | pass | yes | - | e2e/gestures.spec.ts | 48a958 | - | 9d9bb9 |
| 116 | 2026-10-18T11:34:30Z | T083 | VO-032 | green | e2e | e2e/gestures | pass | yes | - | e2e/gestures.spec.ts | 48a958 | - | 72967a |
| 117 | 2026-10-18T11:35:26Z | T083 | VO-032 | refactor | e2e-all | - | pass | yes | - | e2e/gestures.spec.ts | 48a958 | - | c12729 |
| 118 | 2026-10-18T11:36:02Z | T084 | VO-034 | red | e2e | e2e/canvas-source-agree | pass | no | - | e2e/canvas-source-agree.spec.ts | 425f0d | passed on first run: investigate | 4a91ac |
| 119 | 2026-10-18T11:36:22Z | T084 | VO-034 | red | e2e | e2e/canvas-source-agree | pass | no | - | e2e/canvas-source-agree.spec.ts | c35564 | passed on first run: investigate | 14c289 |
| 120 | 2026-10-18T11:36:51Z | T084 | VO-034 | red | e2e | e2e/canvas-source-agree | pass | no | - | e2e/canvas-source-agree.spec.ts | d10ac6 | passed on first run: investigate | d04efa |
| 121 | 2026-10-18T11:37:07Z | T085 | VO-034 | green | e2e | e2e/canvas-source-agree | pass | yes | - | e2e/canvas-source-agree.spec.ts | d10ac6 | - | c661bc |
| 122 | 2026-10-18T11:38:50Z | T086 | VO-012 | red | e2e | e2e/flowchart-preview | fail | yes | assertion | e2e/flowchart-preview.spec.ts | f8ebeb | expected: Preview as Mermaid draws it | 1c260b |
| 123 | 2026-10-18T11:40:25Z | T087 | VO-012 | green | e2e | e2e/flowchart-preview | fail | no | defect | e2e/flowchart-preview.spec.ts | f8ebeb | Test and code defects: the Alert's own icon counted as an svg in the failure case, and Mermaid's renderer needs its scratch container in the document, not detached | ba5e90 |
| 124 | 2026-10-18T11:41:51Z | T087 | VO-012 | green | e2e | e2e/flowchart-preview | pass | yes | - | e2e/flowchart-preview.spec.ts | cbc799 | - | 10ad3a |
| 125 | 2026-10-18T11:42:41Z | T087 | VO-012 | refactor | e2e-all | - | pass | yes | - | e2e/flowchart-preview.spec.ts | cbc799 | - | 200086 |
| 126 | 2026-10-18T11:42:51Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | 1bad37 |
| 127 | 2026-10-18T11:43:33Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | d1b7aa |
| 128 | 2026-10-18T11:44:15Z | T088 | VO-077 | red | unit | app/model/names.test.ts | fail | yes | assertion | app/model/names.test.ts | f31b9e | expected: Untitled | c8bc66 |
| 129 | 2026-10-18T11:44:37Z | T089 | VO-077 | green | unit | app/model/names.test.ts | pass | yes | - | app/model/names.test.ts | f31b9e | - | bebdbf |
| 130 | 2026-10-18T11:45:22Z | T089 | VO-077 | refactor | unit-all | - | pass | yes | - | app/model/names.test.ts | f31b9e | - | 4ad619 |
| 131 | 2026-10-18T11:46:04Z | T089 | VO-077 | refactor | e2e-all | - | pass | yes | - | app/model/names.test.ts | f31b9e | - | 4f8387 |
| 132 | 2026-10-18T11:48:04Z | T090 | VO-083 | red | unit | app/persistence/openFile.test.ts | fail | yes | assertion | app/persistence/openFile.test.ts | 5d9f66 | expected: notJson | 61116d |
| 133 | 2026-10-18T11:49:18Z | T091 | VO-083 | green | unit | app/persistence/openFile.test.ts | pass | yes | - | app/persistence/openFile.test.ts | 5d9f66 | - | 2edc26 |
| 134 | 2026-10-18T11:49:37Z | T092 | VO-083 | green | unit | app/persistence/openFile.test.ts | pass | yes | - | app/persistence/openFile.test.ts | 5d9f66 | - | 96f203 |
| 135 | 2026-10-18T11:49:39Z | T092 | VO-083 | refactor | unit-all | - | pass | yes | - | app/persistence/openFile.test.ts | 5d9f66 | - | d1fc81 |
| 136 | 2026-10-18T11:50:22Z | T093 | VO-099 | red | unit | app/persistence/openFile.size.test.ts | fail | yes | assertion | app/persistence/openFile.size.test.ts | 8e8b05 | expected: fileTooLarge | e63e4a |
| 137 | 2026-10-18T11:50:34Z | T094 | VO-099 | green | unit | app/persistence/openFile.size.test.ts | pass | yes | - | app/persistence/openFile.size.test.ts | 8e8b05 | - | b4a2ea |
| 138 | 2026-10-18T11:51:18Z | T095 | VO-076 | red | unit | app/persistence/codec.test.ts | fail | yes | assertion | app/persistence/codec.test.ts | 5bc353 | expected: not built yet | 9628c9 |
| 139 | 2026-10-18T11:51:39Z | T096 | VO-076 | green | unit | app/persistence/codec.test.ts | pass | yes | - | app/persistence/codec.test.ts | 5bc353 | - | 0e151e |
| 140 | 2026-10-18T11:51:58Z | T096 | VO-076 | refactor | unit-all | - | pass | yes | - | app/persistence/codec.test.ts | 5bc353 | - | 86334b |
| 141 | 2026-10-18T11:52:26Z | T097 | VO-089 | red | unit | app/persistence/migrations.test.ts | fail | yes | assertion | app/persistence/migrations.test.ts | 7d5788 | expected: ok | b7791f |
| 142 | 2026-10-18T11:52:38Z | T098 | VO-089 | green | unit | app/persistence/migrations.test.ts | pass | yes | - | app/persistence/migrations.test.ts | 7d5788 | - | 9b6eda |
| 143 | 2026-10-18T11:52:51Z | T098 | VO-089 | refactor | unit-all | - | pass | yes | - | app/persistence/migrations.test.ts | 7d5788 | - | 6774b9 |
| 144 | 2026-10-18T11:53:04Z | T099 | VO-081 | red | unit | app/persistence/fileName.test.ts | fail | yes | assertion | app/persistence/fileName.test.ts | ebb29b | expected: not built yet | 707a29 |
| 145 | 2026-10-18T11:53:30Z | T100 | VO-081 | green | unit | app/persistence/fileName.test.ts | fail | no | defect | app/persistence/fileName.test.ts | ba8966 | Test expectation contradicted the contract: only an empty or all-space name falls back to diagram; a zero-width character becomes an underscore | ab3d3f |
| 146 | 2026-10-18T11:53:38Z | T100 | VO-081 | green | unit | app/persistence/fileName.test.ts | pass | yes | - | app/persistence/fileName.test.ts | ec93b0 | - | 703fcb |
| 147 | 2026-10-18T11:54:07Z | T101 | VO-100 | red | unit | app/validation/checkDiagram.property.test.ts | fail | yes | assertion | app/validation/checkDiagram.property.test.ts | 915601 | expected: ok | c94232 |
| 148 | 2026-10-18T11:54:33Z | T102 | VO-100 | green | unit | app/validation/checkDiagram.property.test.ts | pass | yes | - | app/validation/checkDiagram.property.test.ts | 915601 | - | e90abd |
| 149 | 2026-10-18T11:54:40Z | T102 | VO-100 | refactor | unit-all | - | pass | yes | - | app/validation/checkDiagram.property.test.ts | 915601 | - | 4411d6 |
| 150 | 2026-10-18T11:55:24Z | T102 | VO-100 | refactor | e2e-all | - | pass | yes | - | app/validation/checkDiagram.property.test.ts | 915601 | - | 057d21 |
| 151 | 2026-10-18T11:56:23Z | T103 | VO-073 | red | e2e | e2e/save-status | fail | yes | assertion | e2e/save-status.spec.ts | a95fc9 | expected: Save status | d907e6 |
| 152 | 2026-10-18T11:57:41Z | T104 | VO-073 | green | e2e | e2e/save-status | pass | yes | - | e2e/save-status.spec.ts | c8a909 | - | 5d4640 |
| 153 | 2026-10-18T11:58:36Z | T104 | VO-073 | refactor | e2e-all | - | pass | yes | - | e2e/save-status.spec.ts | c8a909 | - | a74b99 |
| 154 | 2026-10-18T11:59:39Z | T105 | VO-078 | red | e2e | e2e/unsaved-new | fail | yes | assertion | e2e/unsaved-new.spec.ts | 8d0341 | expected: toHaveURL | 894bba |
| 155 | 2026-10-18T12:00:19Z | T106 | VO-078 | green | e2e | e2e/unsaved-new | pass | yes | - | e2e/unsaved-new.spec.ts | 6e1e66 | - | fd3cb7 |
| 156 | 2026-10-18T12:01:17Z | T106 | VO-078 | refactor | e2e-all | - | pass | yes | - | e2e/unsaved-new.spec.ts | 6e1e66 | - | 091581 |
| 157 | 2026-10-18T12:02:53Z | T107 | VO-074 | red | e2e | e2e/saved-list | fail | yes | assertion | e2e/saved-list.spec.ts | fbdd11 | expected: Saved diagrams | 4427e4 |
| 158 | 2026-10-18T12:04:01Z | T108 | VO-074 | green | e2e | e2e/saved-list | fail | no | defect | e2e/saved-list.spec.ts | fbdd11 | Test scope: opening a saved diagram needs the /d/:id loader built in T110; the list test now checks the link target only and opening is covered by e2e/reopen.spec.ts (T109) | 67da28 |
| 159 | 2026-10-18T12:04:25Z | T108 | VO-074 | green | e2e | e2e/saved-list | pass | yes | - | e2e/saved-list.spec.ts | 45857c | - | 78ef53 |
| 160 | 2026-10-18T12:05:18Z | T108 | VO-074 | refactor | e2e-all | - | pass | yes | - | e2e/saved-list.spec.ts | 45857c | - | 18941b |
| 161 | 2026-10-18T12:06:20Z | T109 | VO-075 | red | e2e | e2e/reopen | fail | yes | assertion | e2e/reopen.spec.ts | f7c4cb | expected: Save status | 16fcfe |
| 162 | 2026-10-18T12:06:57Z | T110 | VO-075 | green | e2e | e2e/reopen | fail | no | defect | e2e/reopen.spec.ts | f7c4cb | Test bug: the layout was read before the reopened diagram had loaded; it now waits for the expected node count | c29c0e |
| 163 | 2026-10-18T12:07:40Z | T110 | VO-075 | green | e2e | e2e/reopen | fail | no | defect | e2e/reopen.spec.ts | 93aa07 | Test bug: the address was read before the move from /new/... to /d/<id>; the test now waits for it | e45636 |
| 164 | 2026-10-18T12:08:21Z | T110 | VO-075 | green | e2e | e2e/reopen | pass | yes | - | e2e/reopen.spec.ts | 081e00 | - | de2c7c |
| 165 | 2026-10-18T12:09:23Z | T110 | VO-075 | refactor | e2e-all | - | pass | yes | - | e2e/reopen.spec.ts | 081e00 | - | efd0a4 |
| 166 | 2026-10-18T12:10:06Z | T111 | VO-088 | red | e2e | e2e/unreadable-record | fail | no | defect | e2e/unreadable-record.spec.ts | 6aba11 | failed for a different reason; The expected failure text named the missing feature; the failure shows the list count assertion | ca5b6e |
| 167 | 2026-10-18T12:10:32Z | T111 | VO-088 | red | e2e | e2e/unreadable-record | fail | yes | assertion | e2e/unreadable-record.spec.ts | 6aba11 | expected: toHaveCount | bead56 |
| 168 | 2026-10-18T12:11:05Z | T112 | VO-088 | green | e2e | e2e/unreadable-record | pass | yes | - | e2e/unreadable-record.spec.ts | 6aba11 | - | 078485 |
| 169 | 2026-10-18T12:12:07Z | T112 | VO-088 | refactor | e2e-all | - | pass | yes | - | e2e/unreadable-record.spec.ts | 6aba11 | - | d07928 |
| 170 | 2026-10-18T12:13:28Z | T113 | VO-079 | red | e2e | e2e/delete-diagram | fail | yes | assertion | e2e/delete-diagram.spec.ts | aa2a7f | expected: Delete | 034074 |
| 171 | 2026-10-18T12:14:46Z | T114 | VO-079 | green | e2e | e2e/(delete-diagram unreadable-record saved-list) | fail | no | defect | e2e/delete-diagram.spec.ts | aa2a7f | Test bug: the poll counted the Delete… buttons straight after a reload, before the list had loaded; it now waits for the row | e18c91 |
| 172 | 2026-10-18T12:15:26Z | T114 | VO-079 | green | e2e | e2e/(delete-diagram unreadable-record saved-list) | pass | yes | - | e2e/delete-diagram.spec.ts | d42ba9 | - | ad6ccf |
| 173 | 2026-10-18T12:16:31Z | T114 | VO-079 | refactor | e2e-all | - | pass | yes | - | e2e/delete-diagram.spec.ts | d42ba9 | - | 471911 |
| 174 | 2026-10-18T12:17:30Z | T116 | VO-085 | green | e2e | e2e/storage-failure | pass | yes | - | e2e/storage-failure.spec.ts | 11850f | - | 1266b5 |
| 175 | 2026-10-18T12:18:44Z | T116 | VO-085 | refactor | e2e-all | - | pass | yes | - | - | - | - | 20bcd7 |
| 176 | 2026-10-18T12:18:57Z | T116 | VO-085 | green | e2e | e2e/storage-failure | pass | yes | - | e2e/storage-failure.spec.ts | 11850f | - | 943fdd |
| 177 | 2026-10-18T12:19:28Z | T117 | VO-080 | red | e2e | e2e/save-file | fail | yes | assertion | e2e/save-file.spec.ts | fcc9fd | expected: Save file | baff2b |
| 178 | 2026-10-18T12:20:13Z | T117 | VO-080 | red | e2e | e2e/save-file | fail | yes | assertion | e2e/save-file.spec.ts | 37fb96 | expected: Save file | 11b2a8 |
| 179 | 2026-10-18T12:21:01Z | T118 | VO-080 | green | e2e | e2e/save-file | fail | no | defect | e2e/save-file.spec.ts | 37fb96 | Test bug: the live region has role status, not region | 2d8653 |
| 180 | 2026-10-18T12:21:15Z | T118 | VO-080 | green | e2e | e2e/save-file | pass | yes | - | e2e/save-file.spec.ts | b41dd7 | - | ab0a3c |
| 181 | 2026-10-18T12:22:19Z | T118 | VO-080 | refactor | e2e-all | - | pass | yes | - | e2e/save-file.spec.ts | b41dd7 | - | 5795e0 |
| 182 | 2026-10-18T12:23:15Z | T119 | VO-082 | red | e2e | e2e/open-file | fail | yes | assertion | e2e/open-file.spec.ts | 55d331 | expected: Open file | ffa962 |
| 183 | 2026-10-18T12:23:43Z | T120 | VO-082 | green | e2e | e2e/open-file | pass | yes | - | e2e/open-file.spec.ts | 55d331 | - | f5730b |
| 184 | 2026-10-18T12:25:06Z | T120 | VO-082 | refactor | e2e-all | - | fail | no | defect | e2e/open-file.spec.ts | 55d331 | Regression from my change: the Open file… button was placed inside the New diagram region, adding a fourth button; moved to its own section | 02b318 |
| 185 | 2026-10-18T12:29:19Z | T120 | VO-082 | refactor | e2e-all | - | pass | yes | - | e2e/open-file.spec.ts | 55d331 | - | 614357 |
| 186 | 2026-10-18T12:30:33Z | T121 | VO-084 | red | e2e | e2e/open-invalid-file | fail | yes | assertion | e2e/open-invalid-file.spec.ts | d662f1 | expected: Messages | 6575cc |
| 187 | 2026-10-18T12:31:00Z | T122 | VO-084 | green | e2e | e2e/open-invalid-file | pass | yes | - | e2e/open-invalid-file.spec.ts | d662f1 | - | e411c0 |
| 188 | 2026-10-18T12:32:10Z | T122 | VO-084 | refactor | e2e-all | - | pass | yes | - | e2e/open-invalid-file.spec.ts | d662f1 | - | 65893c |
| 189 | 2026-10-18T12:32:55Z | T124 | VO-090 | green | e2e | e2e/untrusted-text | fail | no | defect | e2e/untrusted-text.spec.ts | a78953 | Test bug: the source panel must be opened with its button first; also run as green by mistake before a red run | a8557b |
| 190 | 2026-10-18T12:33:08Z | T124 | VO-090 | green | e2e | e2e/untrusted-text | fail | no | defect | e2e/untrusted-text.spec.ts | 30caee | Test bug: two application roles; the drawing is located by its name | e981b5 |
| 191 | 2026-10-18T12:33:19Z | T124 | VO-090 | green | e2e | e2e/untrusted-text | pass | yes | - | e2e/untrusted-text.spec.ts | 6432a6 | - | 5ee13a |
| 192 | 2026-10-18T12:33:32Z | T124 | VO-090 | green | e2e | e2e/untrusted-text | pass | yes | - | e2e/untrusted-text.spec.ts | 6432a6 | - | 79d10b |
| 193 | 2026-10-18T12:34:41Z | T124 | VO-090 | refactor | e2e-all | - | pass | yes | - | - | - | - | 1757f8 |
| 194 | 2026-10-18T12:36:41Z | T125 | VO-086 | red | e2e | e2e/two-tabs | fail | yes | assertion | e2e/two-tabs.spec.ts | 20fb5b | expected: Open in another tab | dd4cfc |
| 195 | 2026-10-18T12:38:55Z | T126 | VO-086 | green | e2e | e2e/two-tabs | fail | no | defect | e2e/two-tabs.spec.ts | 20fb5b | Production bug: React strict mode asked for the lock twice and the second ask failed against the first; asks are now deduplicated (also a type error in the route) | 8882b9 |
| 196 | 2026-10-18T12:39:55Z | T126 | VO-086 | green | e2e | e2e/two-tabs | fail | no | defect | e2e/two-tabs.spec.ts | 20fb5b | Test bugs: the hidden-by-dialog label field lookup and the decline test reading the address before it moved to /d/<id> | a706f0 |
| 197 | 2026-10-18T12:41:01Z | T126 | VO-086 | green | e2e | e2e/two-tabs | pass | yes | - | e2e/two-tabs.spec.ts | 8bf3d8 | - | 95a5db |
| 198 | 2026-10-18T12:41:11Z | T126 | VO-086 | green | e2e | e2e/two-tabs | pass | yes | - | e2e/two-tabs.spec.ts | 8bf3d8 | - | 776a1a |
| 199 | 2026-10-18T12:42:46Z | T126 | VO-086 | refactor | e2e-all | - | pass | yes | - | e2e/two-tabs.spec.ts | 8bf3d8 | - | c97a61 |
| 200 | 2026-10-18T12:43:21Z | T128 | VO-087 | green | e2e | e2e/lock-release | pass | yes | - | e2e/lock-release.spec.ts | bdc957 | - | db5443 |
| 201 | 2026-10-18T12:43:40Z | T128 | VO-087 | green | e2e | e2e/lock-release | pass | yes | - | e2e/lock-release.spec.ts | 0b194e | - | b846a3 |
| 202 | 2026-10-18T12:44:54Z | T128 | VO-087 | refactor | e2e-all | - | pass | yes | - | - | - | - | 9f8e11 |
| 203 | 2026-10-18T12:45:05Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | ae579d |
| 204 | 2026-10-18T12:46:19Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | 4405db |
| 205 | 2026-10-18T12:47:14Z | T129 | VO-036 | red | unit | app/generation/sequence.fidelity | fail | yes | assertion | app/generation/sequence.fidelity.test.ts | 8083b2 | expected: not built yet | 5a17c8 |
| 206 | 2026-10-18T12:47:24Z | T130 | VO-036 | green | unit | app/generation/sequence.fidelity | pass | yes | - | app/generation/sequence.fidelity.test.ts | 8083b2 | - | acd4af |
| 207 | 2026-10-18T12:47:51Z | T131 | VO-037 | red | unit | app/model/sequence/addMessage | fail | yes | assertion | app/model/sequence/addMessage.test.ts | 380063 | expected: not built yet | 46e97b |
| 208 | 2026-10-18T12:48:35Z | T132 | VO-037 | green | unit | app/model/sequence/addMessage | pass | yes | - | app/model/sequence/addMessage.test.ts | 380063 | - | 6e4049 |
| 209 | 2026-10-18T12:48:45Z | T130 | VO-036 | refactor | unit-all | - | pass | yes | - | app/generation/sequence.fidelity.test.ts | 8083b2 | - | 245f03 |
| 210 | 2026-10-18T12:48:48Z | T132 | VO-037 | refactor | unit-all | - | pass | yes | - | app/model/sequence/addMessage.test.ts | 380063 | - | 99b6cc |
| 211 | 2026-10-18T12:49:19Z | T134 | VO-038 | green | unit | app/model/sequence/selfMessage | pass | yes | - | app/model/sequence/selfMessage.test.ts | 4c46d3 | - | 8508fa |
| 212 | 2026-10-18T12:49:21Z | T136 | VO-039 | green | unit | app/model/sequence/equalLabels | fail | no | defect | app/model/sequence/equalLabels.test.ts | 8a7bf6 | Test bug: the set-up used setLabel, which is not built for Sequence until T142; the diagram is now written out directly | 65d35f |
| 213 | 2026-10-18T12:49:38Z | T136 | VO-039 | green | unit | app/model/sequence/equalLabels | pass | yes | - | app/model/sequence/equalLabels.test.ts | e113a1 | - | 7ec1d5 |
| 214 | 2026-10-18T12:49:44Z | T134 | VO-038 | refactor | unit-all | - | pass | yes | - | - | - | - | 9b9412 |
| 215 | 2026-10-18T12:49:47Z | T136 | VO-039 | refactor | unit-all | - | pass | yes | - | - | - | - | c90bf0 |
| 216 | 2026-10-18T12:50:43Z | T137 | VO-040 | red | unit | app/model/sequence/deleteParticipant | fail | yes | assertion | app/model/sequence/deleteParticipant.test.ts | eb81f8 | expected: not built yet | 4f30c4 |
| 217 | 2026-10-18T12:50:44Z | T139 | VO-041 | red | unit | app/model/sequence/reorder | fail | yes | assertion | app/model/sequence/reorder.test.ts | 0fe676 | expected: not built yet | 04af59 |
| 218 | 2026-10-18T12:50:45Z | T141 | VO-043 | red | unit | app/model/sequence/blankMessage | fail | yes | assertion | app/model/sequence/blankMessage.test.ts | d4875c | expected: not built yet | 394aed |
| 219 | 2026-10-18T12:50:45Z | T143 | VO-044 | red | unit | app/model/sequence/changeRole | fail | yes | assertion | app/model/sequence/changeRole.test.ts | 3a95c2 | expected: not built yet | dc66be |
| 220 | 2026-10-18T12:50:46Z | T145 | VO-045 | red | unit | app/model/sequence/changeMessage | fail | yes | assertion | app/model/sequence/changeMessage.test.ts | ae09a7 | expected: not built yet | 280c5d |
| 221 | 2026-10-18T12:51:25Z | T138 | VO-040 | green | unit | app/model/sequence/deleteParticipant | pass | yes | - | app/model/sequence/deleteParticipant.test.ts | eb81f8 | - | 79a15a |
| 222 | 2026-10-18T12:51:25Z | T140 | VO-041 | green | unit | app/model/sequence/reorder | fail | no | defect | app/model/sequence/reorder.test.ts | 0fe676 | Test bug: the open-arrow operator is written '->', the expectation lacked the '>' | 780723 |
| 223 | 2026-10-18T12:51:26Z | T142 | VO-043 | green | unit | app/model/sequence/blankMessage | pass | yes | - | app/model/sequence/blankMessage.test.ts | d4875c | - | 2d4942 |
| 224 | 2026-10-18T12:51:27Z | T144 | VO-044 | green | unit | app/model/sequence/changeRole | pass | yes | - | app/model/sequence/changeRole.test.ts | 3a95c2 | - | f68719 |
| 225 | 2026-10-18T12:51:27Z | T146 | VO-045 | green | unit | app/model/sequence/changeMessage | pass | yes | - | app/model/sequence/changeMessage.test.ts | ae09a7 | - | ad3283 |
| 226 | 2026-10-18T12:51:32Z | T140 | VO-041 | green | unit | app/model/sequence/reorder | pass | yes | - | app/model/sequence/reorder.test.ts | 496d70 | - | dae0f2 |
| 227 | 2026-10-18T12:51:40Z | T138 | VO-040 | refactor | unit-all | - | pass | yes | - | app/model/sequence/deleteParticipant.test.ts | eb81f8 | - | d33f33 |
| 228 | 2026-10-18T12:51:44Z | T140 | VO-041 | refactor | unit-all | - | pass | yes | - | app/model/sequence/reorder.test.ts | 496d70 | - | 8f8053 |
| 229 | 2026-10-18T12:51:47Z | T142 | VO-043 | refactor | unit-all | - | pass | yes | - | app/model/sequence/blankMessage.test.ts | d4875c | - | 1970ea |
| 230 | 2026-10-18T12:51:51Z | T144 | VO-044 | refactor | unit-all | - | pass | yes | - | app/model/sequence/changeRole.test.ts | 3a95c2 | - | 106cd3 |
| 231 | 2026-10-18T12:51:54Z | T146 | VO-045 | refactor | unit-all | - | pass | yes | - | app/model/sequence/changeMessage.test.ts | ae09a7 | - | 068bbf |
| 232 | 2026-10-18T12:53:28Z | T147 | VO-017, VO-019, VO-024, VO-029, VO-100 | red | unit-all | - | fail | yes | assertion | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | bd951d | expected: expected | 246e6c |
| 233 | 2026-10-18T12:53:51Z | T148 | VO-017, VO-019, VO-024, VO-029, VO-100 | green | unit-all | - | pass | yes | - | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | 7cfbb2 | - | e536f6 |
| 234 | 2026-10-18T12:53:53Z | T148 | VO-017, VO-019, VO-024, VO-029, VO-100 | refactor | unit-all | - | pass | yes | - | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | 7cfbb2 | - | 3cc6f9 |
| 235 | 2026-10-18T12:54:23Z | T147 | VO-017, VO-019, VO-024, VO-029, VO-100 | green | unit-all | - | pass | yes | - | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | 7cfbb2 | - | 9a1992 |
| 236 | 2026-10-18T12:55:12Z | T150 | VO-076, VO-083 | green | unit-all | - | pass | yes | - | app/persistence/codec.test.ts, app/persistence/openFile.test.ts | 7c3cd4 | - | b5f0fd |
| 237 | 2026-10-18T12:55:14Z | T149 | VO-076, VO-083 | green | unit-all | - | pass | yes | - | app/persistence/codec.test.ts, app/persistence/openFile.test.ts | 7c3cd4 | - | a5f99a |
| 238 | 2026-10-18T12:55:25Z | T149 | VO-076 | green | unit-all | - | pass | yes | - | app/persistence/codec.test.ts | a96b71 | - | 9a5fcb |
| 239 | 2026-10-18T12:55:28Z | T149 | VO-083 | green | unit-all | - | pass | yes | - | app/persistence/openFile.test.ts | 9d4783 | - | 896ada |
| 240 | 2026-10-18T12:55:30Z | T150 | VO-076 | green | unit-all | - | pass | yes | - | app/persistence/codec.test.ts | a96b71 | - | 81f2db |
| 241 | 2026-10-18T12:55:32Z | T150 | VO-083 | green | unit-all | - | pass | yes | - | app/persistence/openFile.test.ts | 9d4783 | - | 8ea485 |
| 242 | 2026-10-18T12:56:03Z | T151 | VO-094 | red | unit | app/rendering/layout/sequenceLayout | fail | yes | assertion | app/rendering/layout/sequenceLayout.test.ts | 9a7f9f | expected: sequenceLayout | ba45b2 |
| 243 | 2026-10-18T12:56:23Z | T152 | VO-094 | green | unit | app/rendering/layout/sequenceLayout | fail | no | defect | app/rendering/layout/sequenceLayout.test.ts | fa3e9a | Production gap: an operation a Sequence diagram does not have (moveNode) threw instead of being refused; checkSequence now refuses operations it does not offer | f70293 |
| 244 | 2026-10-18T12:56:36Z | T152 | VO-094 | green | unit | app/rendering/layout/sequenceLayout | pass | yes | - | app/rendering/layout/sequenceLayout.test.ts | fa3e9a | - | b20017 |
| 245 | 2026-10-18T12:56:38Z | T152 | VO-094 | refactor | unit-all | - | pass | yes | - | app/rendering/layout/sequenceLayout.test.ts | fa3e9a | - | 868874 |
| 246 | 2026-10-18T12:56:45Z | T152 | VO-094 | green | unit | app/rendering/layout/sequenceLayout | pass | yes | - | app/rendering/layout/sequenceLayout.test.ts | fa3e9a | - | 42fccd |
| 247 | 2026-10-18T12:57:44Z | T153 | VO-035 | red | e2e | e2e/sequence-toolbox | fail | yes | assertion | e2e/sequence-toolbox.spec.ts | f6c24a | expected: Toolbox | 8e1dff |
| 248 | 2026-10-18T12:59:32Z | T154 | VO-035 | green | e2e | e2e/sequence-toolbox | pass | yes | - | e2e/sequence-toolbox.spec.ts | f6c24a | - | 309baf |
| 249 | 2026-10-18T13:00:51Z | T154 | VO-035 | refactor | e2e-all | - | pass | yes | - | e2e/sequence-toolbox.spec.ts | f6c24a | - | 261da9 |
| 250 | 2026-10-18T13:03:12Z | T155 | VO-042 | red | e2e | e2e/sequence-reorder | fail | yes | assertion | e2e/sequence-reorder.spec.ts | 4ac1e0 | expected: participant | 522dcf |
| 251 | 2026-10-18T13:05:18Z | T156 | VO-042 | green | e2e | e2e/sequence-reorder | fail | no | defect | e2e/sequence-reorder.spec.ts | 4ac1e0 | Production bug: the drop was reported from inside a state update, which strict mode runs twice, so one drag created two messages; the drag is now tracked in a ref | df06b5 |
| 252 | 2026-10-18T13:05:57Z | T156 | VO-042 | green | e2e | e2e/sequence-reorder | pass | yes | - | e2e/sequence-reorder.spec.ts | 4ac1e0 | - | 2fff4f |
| 253 | 2026-10-18T13:07:38Z | T156 | VO-042 | refactor | e2e-all | - | pass | yes | - | e2e/sequence-reorder.spec.ts | 4ac1e0 | - | e6081c |
| 254 | 2026-10-18T13:09:55Z | T157 | VO-002, VO-011, VO-018, VO-025, VO-034, VO-093 | red | e2e | e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls) | fail | yes | assertion | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | e2bbed | expected: toEqual | 982c21 |
| 255 | 2026-10-18T13:11:26Z | T158 | VO-002, VO-011, VO-018, VO-025, VO-034, VO-093 | green | e2e | e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls) | fail | no | defect | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | 62cd1b | Test bug: the label of a message was read with the wrong pattern from its accessible name | bdb408 |
| 256 | 2026-10-18T13:12:34Z | T158 | VO-002, VO-011, VO-018, VO-025, VO-034, VO-093 | green | e2e | e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls) | fail | no | defect | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | 607656 | Test bug: undo count and the Reverse step on a self-message were wrong | 14a324 |
| 257 | 2026-10-18T13:13:23Z | T158 | VO-002, VO-011, VO-018, VO-025, VO-034, VO-093 | green | e2e | e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls) | fail | no | defect | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | 56731a | Test bug: Reverse was applied to a self-message, which is refused; the test now reverses the other message | 31be89 |
| 258 | 2026-10-18T13:14:07Z | T158 | VO-002, VO-011, VO-018, VO-025, VO-034, VO-093 | green | e2e | e2e/(new-diagram flowchart-layout-note labels-special rejections canvas-source-agree controls) | pass | yes | - | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | 7a169a | - | c45d95 |
| 259 | 2026-10-18T13:15:53Z | T157 | VO-002 | green | e2e-all | - | pass | yes | - | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | 7a169a | - | 1b81ec |
| 260 | 2026-10-18T13:16:35Z | T160 | VO-075 | green | e2e | e2e/reopen | pass | yes | - | e2e/reopen.spec.ts | 292911 | - | a694fb |
| 261 | 2026-10-18T13:16:52Z | T160 | VO-075 | green | e2e | e2e/reopen | pass | yes | - | e2e/reopen.spec.ts | 292911 | - | 14916b |
| 262 | 2026-10-18T13:17:10Z | T159 | VO-075 | green | e2e | e2e/reopen | pass | yes | - | e2e/reopen.spec.ts | 292911 | - | 31e849 |
| 263 | 2026-10-18T13:17:20Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | 13e7fc |
| 264 | 2026-10-18T13:18:58Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | 16e398 |
| 265 | 2026-10-18T13:20:56Z | T161 | VO-048 | red | unit | app/generation/c4.fidelity | fail | yes | assertion | app/generation/c4.fidelity.test.ts | 0494c0 | expected: not built yet | 135e92 |
| 266 | 2026-10-18T13:21:25Z | T162 | VO-048 | green | unit | app/generation/c4.fidelity | pass | yes | - | app/generation/c4.fidelity.test.ts | 990f21 | - | 457302 |
| 267 | 2026-10-18T13:21:39Z | T162 | VO-048 | green | unit | app/generation | pass | yes | - | app/generation/c4.fidelity.test.ts | 990f21 | - | 46003e |
| 268 | 2026-10-18T13:21:41Z | T162 | VO-048 | refactor | unit-all | - | pass | yes | - | app/generation/c4.fidelity.test.ts | 990f21 | - | 74a1d0 |
| 269 | 2026-10-18T13:21:59Z | T163 | VO-097 | red | unit | app/generation/c4.notices | fail | yes | assertion | app/generation/c4.notices.test.ts | 7b74e7 | expected: toEqual | 5a91ed |
| 270 | 2026-10-18T13:22:24Z | T164 | VO-097 | green | unit | app/generation | pass | yes | - | app/generation/c4.notices.test.ts | 7b74e7 | - | 57db75 |
| 271 | 2026-10-18T13:22:30Z | T164 | VO-097 | refactor | unit-all | - | pass | yes | - | app/generation/c4.notices.test.ts | 7b74e7 | - | f38c5d |
| 272 | 2026-10-18T13:23:11Z | T165 | VO-058 | red | unit | app/model/c4/title | fail | yes | assertion | app/model/c4/title.test.ts | d0e6b8 | expected: not built yet | eeae59 |
| 273 | 2026-10-18T13:23:37Z | T166 | VO-058 | green | unit | app/model/c4/title | pass | yes | - | app/model/c4/title.test.ts | d0e6b8 | - | b5161d |
| 274 | 2026-10-18T13:23:56Z | T166 | VO-058 | refactor | unit-all | - | pass | yes | - | app/model/c4/title.test.ts | d0e6b8 | - | e71a84 |
| 275 | 2026-10-18T13:24:34Z | T167 | VO-049 | red | unit | app/model/c4/editElement | fail | no | defect | app/model/c4/editElement.test.ts | c7b622 | failed for a different reason; Test bug: the shared fixture was built in the describe body, so the file failed to collect; it is now built per test | 70a0c6 |
| 276 | 2026-10-18T13:24:47Z | T167 | VO-049 | red | unit | app/model/c4/editElement | fail | yes | assertion | app/model/c4/editElement.test.ts | cf2b55 | expected: unknownItem | 83f517 |
| 277 | 2026-10-18T13:25:35Z | T168 | VO-049 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/editElement.test.ts | cf2b55 | - | b1e61f |
| 278 | 2026-10-18T13:25:58Z | T169 | VO-050 | red | unit | app/model/c4/relationships | fail | yes | assertion | app/model/c4/relationships.test.ts | 7e4724 | expected: addContainer | 7367ae |
| 279 | 2026-10-18T13:26:39Z | T170 | VO-050 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/relationships.test.ts | 7e4724 | - | 21aead |
| 280 | 2026-10-18T13:26:46Z | T170 | VO-050 | refactor | unit-all | - | pass | yes | - | app/model/c4/relationships.test.ts | 7e4724 | - | 2a9052 |
| 281 | 2026-10-18T13:27:18Z | T171 | VO-051 | red | unit | app/model/c4/dynamic | fail | yes | assertion | app/model/c4/dynamic.test.ts | 26f698 | expected: reorder | 3a84d7 |
| 282 | 2026-10-18T13:27:50Z | T172 | VO-051 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/dynamic.test.ts | 73c0af | - | d0c139 |
| 283 | 2026-10-18T13:27:55Z | T172 | VO-051 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/dynamic.test.ts | 73c0af | - | 5a0130 |
| 284 | 2026-10-18T13:27:58Z | T172 | VO-051 | refactor | unit-all | - | pass | yes | - | app/model/c4/dynamic.test.ts | 73c0af | - | 6758ec |
| 285 | 2026-10-18T13:28:54Z | T173 | VO-053 | red | unit | app/model/c4/delete | fail | yes | assertion | app/model/c4/delete.test.ts | 32d2be | expected: unknownItem | 11e464 |
| 286 | 2026-10-18T13:29:24Z | T174 | VO-053 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/delete.test.ts | 32d2be | - | 45c763 |
| 287 | 2026-10-18T13:30:04Z | T175 | VO-054 | red | unit | app/model/c4/nesting | fail | yes | assertion | app/model/c4/nesting.test.ts | 06b2c7 | expected: unknownItem | bb7ee7 |
| 288 | 2026-10-18T13:30:33Z | T176 | VO-054 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/nesting.test.ts | 06b2c7 | - | 0b1b17 |
| 289 | 2026-10-18T13:30:42Z | T176 | VO-054 | refactor | unit-all | - | pass | yes | - | app/model/c4/nesting.test.ts | 06b2c7 | - | 092073 |
| 290 | 2026-10-18T13:31:05Z | T178 | VO-055 | green | unit | app/model/c4/deployment | pass | yes | - | app/model/c4/deployment.test.ts | b5c3c8 | - | b18dd4 |
| 291 | 2026-10-18T13:31:10Z | T177 | VO-055 | green | unit | app/model/c4/deployment | pass | yes | - | app/model/c4/deployment.test.ts | b5c3c8 | - | 36e815 |
| 292 | 2026-10-18T13:31:47Z | T181 | VO-060 | red | unit | app/model/c4/changeType | fail | yes | assertion | app/model/c4/changeType.test.ts | c9ed32 | expected: unknownItem | 8cca13 |
| 293 | 2026-10-18T13:32:14Z | T182 | VO-060 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/changeType.test.ts | c9ed32 | - | adf2e8 |
| 294 | 2026-10-18T13:32:39Z | T183 | VO-061 | red | unit | app/model/c4/relationshipEnds | fail | yes | assertion | app/model/c4/relationshipEnds.test.ts | 0c6430 | expected: unknownItem | 34ae71 |
| 295 | 2026-10-18T13:33:17Z | T184 | VO-061 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/relationshipEnds.test.ts | 290b28 | - | a03b3e |
| 296 | 2026-10-18T13:33:24Z | T184 | VO-061 | green | unit | app/model/c4 | pass | yes | - | app/model/c4/relationshipEnds.test.ts | 290b28 | - | 37c1bf |
| 297 | 2026-10-18T13:33:27Z | T184 | VO-061 | refactor | unit-all | - | pass | yes | - | app/model/c4/relationshipEnds.test.ts | 290b28 | - | 0c4800 |
| 298 | 2026-10-18T13:33:28Z | T182 | VO-060 | green | unit | app/model/c4/changeType | pass | yes | - | app/model/c4/changeType.test.ts | c9ed32 | - | e45751 |
| 299 | 2026-10-18T13:33:31Z | T182 | VO-060 | refactor | unit-all | - | pass | yes | - | app/model/c4/changeType.test.ts | c9ed32 | - | d57d2c |
| 300 | 2026-10-18T13:34:06Z | T179 | VO-056 | green | unit | app/model/c4/moveMembership | pass | yes | - | app/model/c4/moveMembership.test.ts | 356e55 | - | 01c7a9 |
| 301 | 2026-10-18T13:34:07Z | T180 | VO-056 | green | unit | app/model/c4/moveMembership | pass | yes | - | app/model/c4/moveMembership.test.ts | 356e55 | - | 8254f4 |
| 302 | 2026-10-18T13:36:39Z | T185 | VO-017 | red | unit | app/generation/escape.fidelity | fail | no | defect | app/generation/escape.fidelity.test.ts | ce42d3 | failed for a different reason; Test bug: the second element's default description was not blank, so the expected readback was wrong | 338f7d |
| 303 | 2026-10-18T13:36:40Z | T185 | VO-019 | red | unit | app/validation/label.test | pass | no | - | app/validation/label.test.ts | 8df29d | passed on first run: investigate | e3008d |
| 304 | 2026-10-18T13:36:41Z | T185 | VO-024 | red | unit | app/history/rejections | pass | no | - | app/history/rejections.test.ts | 6f1097 | passed on first run: investigate | b6ae77 |
| 305 | 2026-10-18T13:36:41Z | T185 | VO-029 | red | unit | app/history/history.test | fail | yes | assertion | app/history/history.test.ts | d6a09e | expected: toEqual | 402f4c |
| 306 | 2026-10-18T13:36:43Z | T185 | VO-100 | red | unit | app/validation/checkDiagram.property | fail | no | defect | app/validation/checkDiagram.property.test.ts | b127bc | failed for a different reason; Test bug: the Deployment operations list changed an element to a type the kind does not offer | 986447 |
| 307 | 2026-10-18T13:37:19Z | T185 | VO-017 | red | unit | app/generation/escape.fidelity | pass | no | - | app/generation/escape.fidelity.test.ts | 447aa7 | passed on first run: investigate | 22dead |
| 308 | 2026-10-18T13:37:20Z | T185 | VO-029 | red | unit | app/history/history.test | pass | no | - | app/history/history.test.ts | 728c1f | passed on first run: investigate | 8824d7 |
| 309 | 2026-10-18T13:37:22Z | T185 | VO-100 | red | unit | app/validation/checkDiagram.property | pass | no | - | app/validation/checkDiagram.property.test.ts | 30d7be | passed on first run: investigate | be7c90 |
| 310 | 2026-10-18T13:37:53Z | T185 | VO-017 | green | unit | app/generation/escape.fidelity | pass | yes | - | app/generation/escape.fidelity.test.ts | 447aa7 | - | 0af506 |
| 311 | 2026-10-18T13:37:55Z | T186 | VO-017 | green | unit | app/generation/escape.fidelity | pass | yes | - | app/generation/escape.fidelity.test.ts | 447aa7 | - | d7adfe |
| 312 | 2026-10-18T13:37:56Z | T185 | VO-019 | green | unit | app/validation/label.test | pass | yes | - | app/validation/label.test.test.ts | 44c052 | - | bb2cee |
| 313 | 2026-10-18T13:37:56Z | T186 | VO-019 | green | unit | app/validation/label.test | pass | yes | - | app/validation/label.test.test.ts | 44c052 | - | dfb8fe |
| 314 | 2026-10-18T13:37:57Z | T185 | VO-024 | green | unit | app/history/rejections | pass | yes | - | app/history/rejections.test.ts | 6f1097 | - | c9f883 |
| 315 | 2026-10-18T13:37:58Z | T186 | VO-024 | green | unit | app/history/rejections | pass | yes | - | app/history/rejections.test.ts | 6f1097 | - | 5436c8 |
| 316 | 2026-10-18T13:37:59Z | T185 | VO-029 | green | unit | app/history/history.test | pass | yes | - | app/history/history.test.test.ts | ab0a7a | - | 561e31 |
| 317 | 2026-10-18T13:38:00Z | T186 | VO-029 | green | unit | app/history/history.test | pass | yes | - | app/history/history.test.test.ts | ab0a7a | - | 0b6dc6 |
| 318 | 2026-10-18T13:38:02Z | T185 | VO-100 | green | unit | app/validation/checkDiagram.property | pass | yes | - | app/validation/checkDiagram.property.test.ts | d0f0e8 | - | c50f4d |
| 319 | 2026-10-18T13:38:05Z | T186 | VO-100 | green | unit | app/validation/checkDiagram.property | pass | yes | - | app/validation/checkDiagram.property.test.ts | d0f0e8 | - | 768387 |
| 320 | 2026-10-18T13:38:23Z | T185 | VO-017 | green | unit | app/generation/escape.fidelity | pass | yes | - | app/generation/escape.fidelity.test.ts | 447aa7 | - | 3e024b |
| 321 | 2026-10-18T13:38:25Z | T186 | VO-017 | green | unit | app/generation/escape.fidelity | pass | yes | - | app/generation/escape.fidelity.test.ts | 447aa7 | - | 2dbfe8 |
| 322 | 2026-10-18T13:38:26Z | T185 | VO-019 | green | unit | app/validation/label | pass | yes | - | app/validation/label.test.ts | 8df29d | - | 336acf |
| 323 | 2026-10-18T13:38:27Z | T186 | VO-019 | green | unit | app/validation/label | pass | yes | - | app/validation/label.test.ts | 8df29d | - | 87922f |
| 324 | 2026-10-18T13:38:27Z | T185 | VO-024 | green | unit | app/history/rejections | pass | yes | - | app/history/rejections.test.ts | 6f1097 | - | 85cd72 |
| 325 | 2026-10-18T13:38:28Z | T186 | VO-024 | green | unit | app/history/rejections | pass | yes | - | app/history/rejections.test.ts | 6f1097 | - | 38576a |
| 326 | 2026-10-18T13:38:29Z | T185 | VO-029 | green | unit | app/history/history.test | pass | yes | - | app/history/history.test.ts | 728c1f | - | c9dd73 |
| 327 | 2026-10-18T13:38:29Z | T186 | VO-029 | green | unit | app/history/history.test | pass | yes | - | app/history/history.test.ts | 728c1f | - | 73e936 |
| 328 | 2026-10-18T13:38:32Z | T185 | VO-100 | green | unit | app/validation/checkDiagram.property | pass | yes | - | app/validation/checkDiagram.property.test.ts | d0f0e8 | - | e5771f |
| 329 | 2026-10-18T13:38:34Z | T186 | VO-100 | green | unit | app/validation/checkDiagram.property | pass | yes | - | app/validation/checkDiagram.property.test.ts | d0f0e8 | - | 5d798d |
| 330 | 2026-10-18T13:38:38Z | T186 | VO-017 | refactor | unit-all | - | pass | yes | - | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | fda081 | - | 2c3125 |
| 331 | 2026-10-18T13:40:01Z | T187 | VO-076 | red | unit | app/persistence/codec.test | fail | yes | assertion | app/persistence/codec.test.ts | 7dd1a5 | expected: toEqual | 013697 |
| 332 | 2026-10-18T13:40:02Z | T187 | VO-083 | red | unit | app/persistence/openFile | pass | no | - | app/persistence/openFile.test.ts | eb22dc | passed on first run: investigate | e8634c |
| 333 | 2026-10-18T13:40:17Z | T187 | VO-076 | red | unit | app/persistence/codec.test | pass | no | - | app/persistence/codec.test.ts | 0044c3 | passed on first run: investigate | 4d6ea4 |
| 334 | 2026-10-18T13:40:30Z | T187 | VO-076 | green | unit | app/persistence/codec.test | pass | yes | - | app/persistence/codec.test.ts | 6fb6d0 | - | c63d20 |
| 335 | 2026-10-18T13:40:31Z | T188 | VO-076 | green | unit | app/persistence/codec.test | pass | yes | - | app/persistence/codec.test.ts | 6fb6d0 | - | b4cba2 |
| 336 | 2026-10-18T13:40:32Z | T187 | VO-083 | green | unit | app/persistence/openFile | pass | yes | - | app/persistence/openFile.test.ts | eb22dc | - | 3ace10 |
| 337 | 2026-10-18T13:40:33Z | T188 | VO-083 | green | unit | app/persistence/openFile | pass | yes | - | app/persistence/openFile.test.ts | eb22dc | - | 3f52df |
| 338 | 2026-10-18T13:40:36Z | T188 | VO-076 | refactor | unit-all | - | pass | yes | - | app/persistence/codec.test.ts | 6fb6d0 | - | 0bd950 |
| 339 | 2026-10-18T13:41:23Z | T189 | VO-094 | red | unit | app/rendering/layout/c4Layout | fail | yes | assertion | app/rendering/layout/c4Layout.test.ts | 022ec4 | expected: toHaveLength | d9c4f5 |
| 340 | 2026-10-18T13:41:55Z | T190 | VO-094 | green | unit | app/rendering/layout | pass | yes | - | app/rendering/layout/c4Layout.test.ts | 022ec4 | - | 6c538e |
| 341 | 2026-10-18T13:42:12Z | T190 | VO-094 | green | unit | app/rendering/layout | pass | yes | - | app/rendering/layout/c4Layout.test.ts | 022ec4 | - | 4aeae0 |
| 342 | 2026-10-18T13:42:15Z | T190 | VO-094 | refactor | unit-all | - | pass | yes | - | app/rendering/layout/c4Layout.test.ts | 022ec4 | - | 447636 |
| 343 | 2026-10-18T13:42:31Z | T189 | VO-094 | green | unit | app/rendering/layout | pass | yes | - | app/rendering/layout/c4Layout.test.ts | 022ec4 | - | 6c02c6 |
| 344 | 2026-10-18T13:44:06Z | T191 | VO-046 | red | e2e | e2e/c4-kind-picker | fail | yes | assertion | e2e/c4-kind-picker.spec.ts | 1ba159 | expected: experimental | 59e8f7 |
| 345 | 2026-10-18T13:45:13Z | T192 | VO-046 | green | e2e | e2e/c4-kind-picker | fail | no | defect | e2e/c4-kind-picker.spec.ts | 1ba159 | Test bug: the header shows the kind capitalised, which the new C4 header cases did not expect | a43e4a |
| 346 | 2026-10-18T13:45:31Z | T192 | VO-046 | green | e2e | e2e/c4-kind-picker | pass | yes | - | e2e/c4-kind-picker.spec.ts | 48ded9 | - | 3e12ba |
| 347 | 2026-10-18T13:45:46Z | T191 | VO-046 | green | e2e | e2e/c4-kind-picker | pass | yes | - | e2e/c4-kind-picker.spec.ts | 48ded9 | - | 3ae3f1 |
| 348 | 2026-10-18T13:47:28Z | T192 | VO-046 | refactor | e2e-all | - | pass | yes | - | e2e/c4-kind-picker.spec.ts | 48ded9 | - | 6aa3c1 |
| 349 | 2026-10-18T13:51:11Z | T193 | VO-047 | red | e2e | e2e/c4-toolbox | fail | yes | assertion | e2e/c4-toolbox.spec.ts | 3d1880 | expected: Toolbox | 021621 |
| 350 | 2026-10-18T13:54:35Z | T194 | VO-047 | green | e2e | e2e/c4-toolbox | pass | yes | - | e2e/c4-toolbox.spec.ts | 3d1880 | - | 7990a1 |
| 351 | 2026-10-18T13:54:42Z | T194 | VO-047 | refactor | unit-all | - | pass | yes | - | e2e/c4-toolbox.spec.ts | 3d1880 | - | e360e6 |
| 352 | 2026-10-18T13:54:53Z | T194 | VO-061 | green | unit | app/model/c4/relationshipEnds | pass | yes | - | app/model/c4/relationshipEnds.test.ts | 290b28 | - | d61d69 |
| 353 | 2026-10-18T13:55:50Z | T168 | VO-049 | green | e2e | e2e/c4-edit-fields | pass | yes | - | e2e/c4-edit-fields.spec.ts | a84dc2 | - | 6f8507 |
| 354 | 2026-10-18T13:58:07Z | T168 | VO-049 | refactor | e2e-all | - | pass | yes | - | app/model/c4/editElement.test.ts | cf2b55 | - | 1e42d0 |
| 355 | 2026-10-18T13:58:26Z | T168 | VO-049 | green | e2e | e2e/c4-edit-fields | pass | yes | - | e2e/c4-edit-fields.spec.ts | 530ab4 | - | a9ef2e |
| 356 | 2026-10-18T13:58:31Z | T168 | VO-049 | green | unit | app/model/c4/editElement | pass | yes | - | app/model/c4/editElement.test.ts | cf2b55 | - | cb73d2 |
| 357 | 2026-10-18T13:59:34Z | T173 | VO-053 | red | e2e | e2e/c4-delete | fail | yes | assertion | e2e/c4-delete.spec.ts | 5973b2 | expected: was deleted | e1d5b5 |
| 358 | 2026-10-18T14:00:00Z | T174 | VO-053 | green | e2e | e2e/c4-delete | pass | yes | - | e2e/c4-delete.spec.ts | 5973b2 | - | a18334 |
| 359 | 2026-10-18T14:00:05Z | T174 | VO-053 | green | unit | app/model/c4/delete | pass | yes | - | app/model/c4/delete.test.ts | 32d2be | - | 7e6db1 |
| 360 | 2026-10-18T14:00:08Z | T174 | VO-053 | refactor | unit-all | - | pass | yes | - | e2e/c4-delete.spec.ts | 5973b2 | - | 755320 |
| 361 | 2026-10-18T14:00:24Z | T174 | VO-053 | green | e2e | e2e/c4-delete | pass | yes | - | e2e/c4-delete.spec.ts | 5973b2 | - | 3f4420 |
| 362 | 2026-10-18T14:01:44Z | T195 | VO-052 | red | e2e | e2e/c4-dynamic-reorder | fail | no | defect | e2e/c4-dynamic-reorder.spec.ts | 4985f9 | failed for a different reason; Expected text was a wrong guess; the test fails for the right reason (numbers and Move buttons missing) | 049b05 |
| 363 | 2026-10-18T14:03:16Z | T195 | VO-052 | red | e2e | e2e/c4-dynamic-reorder | fail | yes | assertion | e2e/c4-dynamic-reorder.spec.ts | 4985f9 | expected: Move down | f956da |
| 364 | 2026-10-18T14:04:13Z | T196 | VO-052 | green | e2e | e2e/c4-dynamic-reorder | pass | yes | - | e2e/c4-dynamic-reorder.spec.ts | 4985f9 | - | 36bad7 |
| 365 | 2026-10-18T14:04:37Z | T196 | VO-052 | green | e2e | e2e/c4-dynamic-reorder | pass | yes | - | e2e/c4-dynamic-reorder.spec.ts | 65e032 | - | ffcf1f |
| 366 | 2026-10-18T14:06:42Z | T196 | VO-052 | refactor | e2e-all | - | pass | yes | - | e2e/c4-dynamic-reorder.spec.ts | 65e032 | - | 312405 |
| 367 | 2026-10-18T14:06:58Z | T196 | VO-052 | green | e2e | e2e/c4-dynamic-reorder | pass | yes | - | e2e/c4-dynamic-reorder.spec.ts | 65e032 | - | d68947 |
| 368 | 2026-10-18T14:09:08Z | T197 | VO-057 | red | e2e | e2e/c4-move-to | fail | yes | assertion | e2e/c4-move-to.spec.ts | 835c54 | expected: Move to | 1f53cb |
| 369 | 2026-10-18T14:10:21Z | T198 | VO-057 | green | e2e | e2e/c4-move-to | pass | yes | - | e2e/c4-move-to.spec.ts | 835c54 | - | f9ed1a |
| 370 | 2026-10-18T14:12:39Z | T198 | VO-057 | refactor | e2e-all | - | pass | yes | - | e2e/c4-move-to.spec.ts | 835c54 | - | 32e8af |
| 371 | 2026-10-18T14:12:50Z | T198 | VO-057 | green | e2e | e2e/c4-move-to | pass | yes | - | e2e/c4-move-to.spec.ts | 835c54 | - | 9599ae |
| 372 | 2026-10-18T14:14:04Z | T199 | VO-059 | red | e2e | e2e/c4-title | fail | yes | assertion | e2e/c4-title.spec.ts | f4834c | expected: Title | b5634a |
| 373 | 2026-10-18T14:14:35Z | T200 | VO-059 | green | e2e | e2e/c4-title | fail | no | defect | e2e/c4-title.spec.ts | f4834c | Test bug: an empty Dynamic diagram's source panel also shows the empty-diagram notice, so the cleared title is checked by the absence of a title line | 499b5f |
| 374 | 2026-10-18T14:15:00Z | T200 | VO-059 | green | e2e | e2e/c4-title | pass | yes | - | e2e/c4-title.spec.ts | 5f8f98 | - | 5d8a04 |
| 375 | 2026-10-18T14:17:12Z | T200 | VO-059 | refactor | e2e-all | - | pass | yes | - | e2e/c4-title.spec.ts | 5f8f98 | - | 101a97 |
| 376 | 2026-10-18T14:17:22Z | T200 | VO-059 | green | e2e | e2e/c4-title | pass | yes | - | e2e/c4-title.spec.ts | 5f8f98 | - | 0b0fd3 |
| 377 | 2026-10-18T14:18:16Z | T201 | VO-098 | red | e2e | e2e/c4-notices | fail | yes | assertion | e2e/c4-notices.spec.ts | 8928a8 | expected: Mermaid cannot draw | a1d976 |
| 378 | 2026-10-18T14:18:33Z | T202 | VO-098 | green | e2e | e2e/c4-notices | pass | yes | - | e2e/c4-notices.spec.ts | 8928a8 | - | e6ed26 |
| 379 | 2026-10-18T14:18:41Z | T202 | VO-098 | refactor | unit-all | - | pass | yes | - | e2e/c4-notices.spec.ts | 8928a8 | - | dd1167 |
| 380 | 2026-10-18T14:20:57Z | T202 | VO-098 | refactor | e2e-all | - | pass | yes | - | e2e/c4-notices.spec.ts | 8928a8 | - | a2c246 |
| 381 | 2026-10-18T14:21:06Z | T202 | VO-098 | green | e2e | e2e/c4-notices | pass | yes | - | e2e/c4-notices.spec.ts | 8928a8 | - | 951195 |
| 382 | 2026-10-18T14:23:29Z | T203 | VO-002, VO-011, VO-018, VO-034, VO-093, VO-075 | red | e2e | e2e/new-diagram e2e/flowchart-layout-note e2e/labels-special e2e/canvas-source-agree e2e/controls e2e/reopen | fail | yes | assertion | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/reopen.spec.ts | fcbd98 | expected: Error | 125f1f |
| 383 | 2026-10-18T14:24:41Z | T203 | VO-002, VO-011, VO-018, VO-034, VO-093, VO-075 | red | e2e | e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) | pass | no | - | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/reopen.spec.ts | fcbd98 | passed on first run: investigate | 822a2a |
| 384 | 2026-10-18T14:26:00Z | T204 | VO-002, VO-011, VO-018, VO-034, VO-093, VO-075 | green | e2e | e2e/(new-diagram flowchart-layout-note labels-special canvas-source-agree controls reopen) | pass | yes | - | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/reopen.spec.ts | fcbd98 | - | a2f102 |
| 385 | 2026-10-18T14:26:36Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | 8dcb46 |
| 386 | 2026-10-18T14:29:13Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | d3e300 |
| 387 | 2026-10-18T14:29:56Z | T205 | VO-063 | red | unit | app/history/merge | fail | yes | assertion | app/history/merge.test.ts | 1c9a74 | expected: seal | 6ca1a9 |
| 388 | 2026-10-18T14:30:07Z | T206 | VO-063 | green | unit | app/history | fail | no | defect | app/history/merge.test.ts | 1c9a74 | Test bug: equally near candidates resolve north first, so the first move lands at y -64 | ce8267 |
| 389 | 2026-10-18T14:30:20Z | T206 | VO-063 | green | unit | app/history | pass | yes | - | app/history/merge.test.ts | 4d958e | - | e58c08 |
| 390 | 2026-10-18T14:30:23Z | T206 | VO-063 | refactor | unit-all | - | pass | yes | - | app/history/merge.test.ts | 4d958e | - | 66f211 |
| 391 | 2026-10-18T14:30:24Z | T206 | VO-063 | green | unit | app/history/merge | pass | yes | - | app/history/merge.test.ts | 4d958e | - | 65cfea |
| 392 | 2026-10-18T21:42:29Z | T206 | VO-063 | green | e2e | e2e/node-arrow-move | pass | yes | - | app/history/merge.test.ts | 4d958e | arrow-key move wiring, e2e smoke | 4fe9b1 |
| 393 | 2026-10-18T21:42:33Z | T206 | VO-063 | green | unit | app/history/merge | pass | yes | - | app/history/merge.test.ts | 4d958e | - | 3d10e1 |
| 394 | 2026-10-18T21:42:59Z | T207 | VO-064 | red | unit | app/editor/targets | fail | yes | assertion | app/editor/targets.test.ts | 9dee62 | expected: targets | 3ba0db |
| 395 | 2026-10-18T21:43:51Z | T208 | VO-064 | green | unit-all | - | fail | no | defect | app/editor/targets.test.ts | c59456 | test bug: the tree is walked depth first, so the node comes before the element nested in it | 93a71e |
| 396 | 2026-10-18T21:44:06Z | T208 | VO-064 | green | unit-all | - | pass | yes | - | app/editor/targets.test.ts | 8fdca8 | - | 8682f6 |
| 397 | 2026-10-18T21:44:07Z | T208 | VO-064 | green | unit | app/editor/targets | pass | yes | - | app/editor/targets.test.ts | 8fdca8 | - | 18e605 |
| 398 | 2026-10-18T21:44:41Z | T209 | VO-068 | green | unit | app/generation/empty | pass | yes | - | app/generation/empty.test.ts | 13729b | - | 021ade |
| 399 | 2026-10-18T21:44:42Z | T210 | VO-068 | green | unit | app/generation/empty | pass | yes | - | app/generation/empty.test.ts | 13729b | - | 2c5c6d |
| 400 | 2026-10-18T21:46:13Z | T211 | VO-069 | red | e2e | e2e/empty-state | fail | yes | assertion | e2e/empty-state.spec.ts | 016732 | expected: Drag an element from the toolbox | 977099 |
| 401 | 2026-10-18T21:47:20Z | T212 | VO-069 | green | e2e | e2e/empty-state | fail | no | defect | e2e/empty-state.spec.ts | 016732 | test bug: Copy was pressed before the source check finished, and the C4 panel text also holds the empty notice | 776c6e |
| 402 | 2026-10-18T21:48:04Z | T212 | VO-069 | green | e2e | e2e/empty-state | pass | yes | - | e2e/empty-state.spec.ts | 99b33d | - | b9e185 |
| 403 | 2026-10-18T21:49:46Z | T213 | VO-062 | red | e2e | e2e/keyboard-only | fail | yes | assertion | e2e/keyboard-only.spec.ts | 48c0e7 | expected: Error | 29750c |
| 404 | 2026-10-18T21:52:07Z | T214 | VO-062 | green | e2e | e2e/keyboard-only | pass | yes | - | e2e/keyboard-only.spec.ts | d5dc86 | - | f3485d |
| 405 | 2026-10-18T21:52:37Z | T215 | VO-062 | green | e2e | e2e/keyboard-only | pass | yes | - | e2e/keyboard-only.spec.ts | 4cb267 | - | 9fda5d |
| 406 | 2026-10-18T21:54:12Z | T216 | VO-067 | red | e2e | e2e/zoom-pan | fail | yes | assertion | e2e/zoom-pan.spec.ts | 316c6e | expected: Zoom in | 7456a2 |
| 407 | 2026-10-18T21:55:25Z | T217 | VO-067 | green | e2e | e2e/zoom-pan | fail | no | defect | e2e/zoom-pan.spec.ts | 316c6e | defect in my change: the sequence svg kept min-width 100%, so a small diagram's size did not change when zoomed | 9f4104 |
| 408 | 2026-10-18T21:55:54Z | T217 | VO-067 | green | e2e | e2e/zoom-pan | pass | yes | - | e2e/zoom-pan.spec.ts | 316c6e | - | 0c8de6 |
| 409 | 2026-10-18T21:59:55Z | T217 | VO-067 | refactor | e2e-all | - | fail | no | defect | e2e/zoom-pan.spec.ts | 316c6e | regression run after zoom and empty hint changes to the three canvases; defect in my change: focus selected the node on pointer press, then the click landed on the pane and cleared it; selection on focus now only follows keyboard focus | 36bc44 |
| 410 | 2026-10-18T22:11:31Z | T217 | VO-067 | refactor | e2e-all | - | pass | yes | - | e2e/zoom-pan.spec.ts | 316c6e | regression run after zoom, empty hint and keyboard focus changes | 2926db |
| 411 | 2026-10-18T22:11:40Z | T217 | VO-067 | green | e2e | e2e/zoom-pan | pass | yes | - | e2e/zoom-pan.spec.ts | 316c6e | - | ac2535 |
| 412 | 2026-10-18T22:12:43Z | T218 | VO-065 | red | e2e | e2e/leave-page | fail | yes | assertion | e2e/leave-page.spec.ts | aca920 | expected: toBe | cce113 |
| 413 | 2026-10-18T22:13:17Z | T219 | VO-065 | green | e2e | e2e/leave-page | pass | yes | - | e2e/leave-page.spec.ts | aca920 | - | dccb8f |
| 414 | 2026-10-18T22:13:45Z | T219 | VO-065 | green | e2e | e2e/leave-page | pass | yes | - | e2e/leave-page.spec.ts | aca920 | - | d529e6 |
| 415 | 2026-10-18T22:14:37Z | T220 | VO-066 | red | e2e | e2e/return-to-start | fail | yes | assertion | e2e/return-to-start.spec.ts | 5e4413 | expected: Start screen | b7d015 |
| 416 | 2026-10-18T22:14:59Z | T221 | VO-066 | green | unit | app/editor | pass | yes | - | e2e/return-to-start.spec.ts | 5e4413 | - | 29b4e1 |
| 417 | 2026-10-18T22:15:22Z | T221 | VO-066 | green | e2e | e2e/return-to-start | fail | no | defect | e2e/return-to-start.spec.ts | 5e4413 | defect in my change: the first-save navigation to the diagram's own address ran after Start screen and replaced it | 322edc |
| 418 | 2026-10-18T22:16:15Z | T221 | VO-066 | green | e2e | e2e/return-to-start | pass | yes | - | e2e/return-to-start.spec.ts | 5e4413 | - | 381d2a |
| 419 | 2026-10-18T22:16:49Z | T222 | VO-070 | red | e2e | e2e/announcements | fail | yes | assertion | e2e/announcements.spec.ts | 87037d | expected: Error | e5f5a9 |
| 420 | 2026-10-18T22:17:32Z | T223 | VO-070 | green | e2e | e2e/announcements | pass | yes | - | e2e/announcements.spec.ts | e21c65 | - | 7151b7 |
| 421 | 2026-10-18T22:18:58Z | T224 | VO-072 | red | e2e | e2e/accessible-names | fail | yes | assertion | e2e/accessible-names.spec.ts | 2893bd | expected: not.toBe | c3026f |
| 422 | 2026-10-18T22:19:28Z | T225 | VO-072 | green | e2e | e2e/accessible-names | fail | no | defect | e2e/accessible-names.spec.ts | 2893bd | test bug: in Firefox Tab does not wrap round to the top of the page, so the test now starts from the first toolbox button | 23bb78 |
| 423 | 2026-10-18T22:20:09Z | T225 | VO-072 | green | e2e | e2e/accessible-names | pass | yes | - | e2e/accessible-names.spec.ts | 53b4e8 | - | 665690 |
| 424 | 2026-10-18T22:21:48Z | T226 | VO-071 | red | e2e | e2e/wcag | fail | yes | assertion | e2e/wcag.spec.ts | 15df7e | expected: color-contrast | 373016 |
| 425 | 2026-10-18T22:27:02Z | T227 | VO-071 | refactor | e2e-all | - | pass | yes | - | e2e/wcag.spec.ts | 31d41b | regression run after theme, list markup, attribution and focus style changes | cbaad9 |
| 426 | 2026-10-18T22:27:21Z | T227 | VO-071 | green | e2e | e2e/wcag | pass | yes | - | e2e/wcag.spec.ts | 31d41b | - | f9628c |
| 427 | 2026-10-18T22:29:07Z | T228 | VO-101 | red | e2e | e2e/selection-feedback | fail | yes | assertion | e2e/selection-feedback.spec.ts | cb6c74 | expected: marked | 2fb931 |
| 428 | 2026-10-18T22:34:44Z | T229 | VO-101 | refactor | e2e-all | - | pass | yes | - | e2e/selection-feedback.spec.ts | 69c97d | regression run after selection cue, Enter/Space and Escape changes | b2d103 |
| 429 | 2026-10-18T22:34:47Z | T229 | VO-101 | green | unit-all | - | pass | yes | - | e2e/selection-feedback.spec.ts | 69c97d | - | c3886f |
| 430 | 2026-10-18T22:34:57Z | T229 | VO-101 | green | e2e | e2e/selection-feedback | pass | yes | - | e2e/selection-feedback.spec.ts | 69c97d | - | a6bd1d |
| 431 | 2026-10-18T22:35:28Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | e47718 |
| 432 | 2026-10-18T22:38:53Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | 31cfde |
| 433 | 2026-10-18T22:40:57Z | T230 | VO-096 | green | unit | app/model/familyChanges | pass | yes | - | app/model/familyChanges.test.ts | 6eb7b5 | - | 923b5b |
| 434 | 2026-10-18T22:40:57Z | T231 | VO-096 | green | unit | app/model/familyChanges | pass | yes | - | app/model/familyChanges.test.ts | 6eb7b5 | - | 4407f8 |
| 435 | 2026-10-18T22:46:37Z | T232 | VO-092 | green | e2e | e2e/not-offered | pass | yes | - | e2e/not-offered.spec.ts | 046c2c | - | 3e8b46 |
| 436 | 2026-10-18T22:46:48Z | T233 | VO-092 | green | e2e | e2e/not-offered | pass | yes | - | e2e/not-offered.spec.ts | 046c2c | - | 96524d |
| 437 | 2026-10-18T22:48:07Z | T234 | VO-095 | green | e2e | e2e/performance | pass | yes | - | e2e/performance.spec.ts | f51bfd | - | b75c26 |
| 438 | 2026-10-18T22:48:17Z | T235 | VO-095 | green | e2e | e2e/performance | pass | yes | - | e2e/performance.spec.ts | f51bfd | - | 09d15f |
| 439 | 2026-10-18T22:50:33Z | T236 | VO-091 | red | e2e | e2e/static-offline | fail | yes | assertion | e2e/static-offline.spec.ts | 342f64 | expected: build/server | e55ed3 |
| 440 | 2026-10-18T22:51:51Z | T236 | VO-091 | red | e2e | e2e/static-offline | fail | yes | assertion | e2e/static-offline.spec.ts | 431bb9 | expected: build/server/index.js | df8442 |
| 441 | 2026-10-18T22:52:18Z | T237 | VO-091 | green | e2e | e2e/static-offline | pass | yes | - | e2e/static-offline.spec.ts | 431bb9 | - | 72a666 |
| 442 | 2026-10-18T22:53:38Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | after moving the sequence and C4 display names into the text catalogue (T238) | 632ada |
| 443 | 2026-10-18T22:55:07Z | T233 | VO-092 | green | e2e | e2e/not-offered | pass | yes | - | e2e/not-offered.spec.ts | cbed0a | - | ff7d92 |
| 444 | 2026-10-18T22:57:06Z | - | - | checkpoint | unit-all | - | pass | yes | - | - | - | - | e637ad |
| 445 | 2026-10-18T23:00:41Z | - | - | checkpoint | e2e-all | - | pass | yes | - | - | - | - | 465c86 |
| 446 | 2026-10-18T23:02:29Z | T068 | VO-027 | green | unit | app/model/flowchart/changeConnection | pass | yes | - | app/model/flowchart/changeConnection.test.ts | 33ce88 | - | 2b2d63 |
| 447 | 2026-10-18T23:02:38Z | T064 | VO-025 | green | e2e | e2e/rejections | pass | yes | - | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | ec49bb | - | 59edf9 |

## Exceptions

| ID | Time | Task | Obligations | Kind | Rationale | Alternative verification | Needs approval | Approved by |
|----|------|------|-------------|------|-----------|--------------------------|----------------|-------------|
| EX-01 | 2026-10-18T11:00:15Z | T045 | VO-016 | no-meaningful-red | The behaviour already holds: node dragging was built and committed in T032 (VO-010) and connections are drawn from node positions in T030 (VO-006), so the new e2e test passed on its first run. It asserts a real position change and edge end points, so it would fail if either behaviour regressed. | The test is written and passes in Chromium and Firefox; it asserts the node's new position and that the drawn connection's end lies on the node's top handle. | no | - |
| EX-02 | 2026-10-18T11:00:15Z | T046 | VO-016 | no-meaningful-red | Same as T045: connections already redraw from committed positions. | T045's test passes and covers the redraw. | no | - |
| EX-03 | 2026-10-18T11:09:02Z | T059 | VO-023 | no-meaningful-red | The behaviour already holds: validation (T022/T048) rejects no operation for structure and generation (T018) writes every connection by id, so the structures test passed on its first run. It checks acceptance, distinct ids and Mermaid's own edge list, so it fails if either ever starts dropping or rejecting a structure. | Test passes and reads back the source with Mermaid's parser for seven structures. | no | - |
| EX-04 | 2026-10-18T11:09:02Z | T060 | VO-023 | no-meaningful-red | Same as T059: no change was needed in validation or generation; both already treat every structure alike. | T059's test passes and covers it. | no | - |
| EX-05 | 2026-10-18T11:30:14Z | T076 | VO-031 | no-meaningful-red | commit (T022) was written to push a snapshot with future: [] and T075's undo/redo only move snapshots, so the redo stack is already emptied on every commit. The test passed on its first run. | The test asserts Redo is unavailable, future is empty, redo returns the same reference, and that a rejected or no-change commit keeps Redo. | no | - |
| EX-06 | 2026-10-18T11:30:14Z | T077 | VO-031 | no-meaningful-red | Same as T076: no change was needed in history.ts. | T076's test passes and covers it. | no | - |
| EX-07 | 2026-10-18T11:30:14Z | T078 | VO-033 | no-meaningful-red | History is an unbounded array of immutable snapshots with no cap or trimming, so 2 000 operations already undo and redo. The test passed on its first run. | The test commits 2 000 distinct changes, undoes every one back to the start state and redoes them all to the final state. | no | - |
| EX-08 | 2026-10-18T11:30:14Z | T079 | VO-033 | no-meaningful-red | Same as T078: nothing to change. Each commit copies the past array (cost grows linearly with history length, about 2 million element copies for 2 000 steps, well under a second); a persistent stack is not needed at this size. | T078's test passes and covers it. Per-step cost growth is not asserted by timing because timing tests are unreliable. | no | - |
| EX-09 | 2026-10-18T11:36:58Z | T084 | VO-034 | no-meaningful-red | Canvas, source and history already derive from one value: the history's present (T022 commit, T075 undo/redo, useSourceCheck). The agreement test passed on its first run. | The test compares node ids, labels and connection pairs on the canvas with those parsed from the source panel after each of 17 steps of adds, a connection, a rename, a shape change, undos, redos and a delete. | no | - |
| EX-10 | 2026-10-18T11:36:58Z | T085 | VO-034 | no-meaningful-red | Same as T084: Editor.tsx already regenerates source and redraws the canvas from state.history.present on every commit, Undo and Redo. | T084's test passes and covers it. | no | - |
| EX-11 | 2026-10-18T12:17:42Z | T115 | VO-085 | no-meaningful-red | Save status handling for full, disabled and unavailable storage was built with T104 (saveStatus.ts, store.ts), so the new test passes on first run. | T116's test passes and covers it; the failure paths were checked by breaking storage in the browser. | no | - |
| EX-12 | 2026-10-18T12:17:42Z | T116 | VO-085 | no-meaningful-red | Save status handling for full, disabled and unavailable storage was built with T104 (saveStatus.ts, store.ts), so the new test passes on first run. | T116's test passes and covers it; the failure paths were checked by breaking storage in the browser. | no | - |
| EX-13 | 2026-10-18T12:33:24Z | T123 | VO-090 | no-meaningful-red | Every text is rendered as React text, escaped on generation (escapeLabel) and drawn by Mermaid with securityLevel strict; no path interprets text as markup, so the test passes on first run. | The test uses a hostile fixture (HTML, script tag, Mermaid directive) and checks canvas, list, source panel, preview and that no script ran; a grep of app/ finds no dangerouslySetInnerHTML. | no | - |
| EX-14 | 2026-10-18T12:33:24Z | T124 | VO-090 | no-meaningful-red | Every text is rendered as React text, escaped on generation (escapeLabel) and drawn by Mermaid with securityLevel strict; no path interprets text as markup, so the test passes on first run. | The test uses a hostile fixture (HTML, script tag, Mermaid directive) and checks canvas, list, source panel, preview and that no script ran; a grep of app/ finds no dangerouslySetInnerHTML. | no | - |
| EX-15 | 2026-10-18T12:43:33Z | T127 | VO-087 | no-meaningful-red | The lock is held by a request that never settles, so the browser releases it when the page closes or crashes; this was built with the lock in T114/T126, and the new test passes on first run. | The test closes the editing tab and, in Chromium, crashes it (chrome://crash), then edits in another tab with no dialog; a lock held by code would make the dialog appear and fail it. | no | - |
| EX-16 | 2026-10-18T12:43:33Z | T128 | VO-087 | no-meaningful-red | The lock is held by a request that never settles, so the browser releases it when the page closes or crashes; this was built with the lock in T114/T126, and the new test passes on first run. | The test closes the editing tab and, in Chromium, crashes it (chrome://crash), then edits in another tab with no dialog; a lock held by code would make the dialog appear and fail it. | no | - |
| EX-17 | 2026-10-18T12:49:18Z | T133 | VO-038 | no-meaningful-red | The behaviour was delivered with addMessage in T132: endpoints are checked only for existence, and generation derives aliases from ids (T130), so the new test passes on first run. | The test builds the situation through commit and reads the source back through Mermaid's parser; it would fail if self-messages were refused or aliases came from labels. | no | - |
| EX-18 | 2026-10-18T12:49:18Z | T134 | VO-038 | no-meaningful-red | The behaviour was delivered with addMessage in T132: endpoints are checked only for existence, and generation derives aliases from ids (T130), so the new test passes on first run. | The test builds the situation through commit and reads the source back through Mermaid's parser; it would fail if self-messages were refused or aliases came from labels. | no | - |
| EX-19 | 2026-10-18T12:49:19Z | T135 | VO-039 | no-meaningful-red | The behaviour was delivered with addMessage in T132: endpoints are checked only for existence, and generation derives aliases from ids (T130), so the new test passes on first run. | The test builds the situation through commit and reads the source back through Mermaid's parser; it would fail if self-messages were refused or aliases came from labels. | no | - |
| EX-20 | 2026-10-18T12:49:19Z | T136 | VO-039 | no-meaningful-red | The behaviour was delivered with addMessage in T132: endpoints are checked only for existence, and generation derives aliases from ids (T130), so the new test passes on first run. | The test builds the situation through commit and reads the source back through Mermaid's parser; it would fail if self-messages were refused or aliases came from labels. | no | - |
| EX-21 | 2026-10-18T12:53:41Z | T147 | VO-017 | no-meaningful-red | The Sequence cases of this test were already satisfied by the generation (T130, escapeLabel applied) and validation (T142 to T146) built earlier in this phase, so they pass on first run. | The same assertions run for Sequence as for Flowchart: Mermaid readback of every test text, blank rejections, fixed rejection sentences, an undo and redo walk, and seeded random sequences checked by checkDiagram. | no | - |
| EX-22 | 2026-10-18T12:53:41Z | T148 | VO-017 | no-meaningful-red | Same as T147: nothing was left to implement for these Sequence cases. | T147's tests cover them. | no | - |
| EX-23 | 2026-10-18T12:53:41Z | T147 | VO-019 | no-meaningful-red | The Sequence cases of this test were already satisfied by the generation (T130, escapeLabel applied) and validation (T142 to T146) built earlier in this phase, so they pass on first run. | The same assertions run for Sequence as for Flowchart: Mermaid readback of every test text, blank rejections, fixed rejection sentences, an undo and redo walk, and seeded random sequences checked by checkDiagram. | no | - |
| EX-24 | 2026-10-18T12:53:41Z | T148 | VO-019 | no-meaningful-red | Same as T147: nothing was left to implement for these Sequence cases. | T147's tests cover them. | no | - |
| EX-25 | 2026-10-18T12:53:42Z | T147 | VO-024 | no-meaningful-red | The Sequence cases of this test were already satisfied by the generation (T130, escapeLabel applied) and validation (T142 to T146) built earlier in this phase, so they pass on first run. | The same assertions run for Sequence as for Flowchart: Mermaid readback of every test text, blank rejections, fixed rejection sentences, an undo and redo walk, and seeded random sequences checked by checkDiagram. | no | - |
| EX-26 | 2026-10-18T12:53:42Z | T148 | VO-024 | no-meaningful-red | Same as T147: nothing was left to implement for these Sequence cases. | T147's tests cover them. | no | - |
| EX-27 | 2026-10-18T12:53:42Z | T147 | VO-029 | no-meaningful-red | The Sequence cases of this test were already satisfied by the generation (T130, escapeLabel applied) and validation (T142 to T146) built earlier in this phase, so they pass on first run. | The same assertions run for Sequence as for Flowchart: Mermaid readback of every test text, blank rejections, fixed rejection sentences, an undo and redo walk, and seeded random sequences checked by checkDiagram. | no | - |
| EX-28 | 2026-10-18T12:53:42Z | T148 | VO-029 | no-meaningful-red | Same as T147: nothing was left to implement for these Sequence cases. | T147's tests cover them. | no | - |
| EX-29 | 2026-10-18T12:53:42Z | T147 | VO-100 | no-meaningful-red | The Sequence cases of this test were already satisfied by the generation (T130, escapeLabel applied) and validation (T142 to T146) built earlier in this phase, so they pass on first run. | The same assertions run for Sequence as for Flowchart: Mermaid readback of every test text, blank rejections, fixed rejection sentences, an undo and redo walk, and seeded random sequences checked by checkDiagram. | no | - |
| EX-30 | 2026-10-18T12:53:42Z | T148 | VO-100 | no-meaningful-red | Same as T147: nothing was left to implement for these Sequence cases. | T147's tests cover them. | no | - |
| EX-31 | 2026-10-18T12:55:09Z | T149 | VO-076 | no-meaningful-red | The codec, the file parser and the full checkDiagram validator were written for all three types in Phase 2 and 6 (T093 to T100), so the Sequence cases pass on first run. | The added cases round-trip a Sequence diagram through the stored and file forms, and refuse invalid Sequence files with the contract's sentences; they would fail if the codec dropped order or accepted a damaged file. | no | - |
| EX-32 | 2026-10-18T12:55:09Z | T149 | VO-083 | no-meaningful-red | The codec, the file parser and the full checkDiagram validator were written for all three types in Phase 2 and 6 (T093 to T100), so the Sequence cases pass on first run. | The added cases round-trip a Sequence diagram through the stored and file forms, and refuse invalid Sequence files with the contract's sentences; they would fail if the codec dropped order or accepted a damaged file. | no | - |
| EX-33 | 2026-10-18T12:55:10Z | T150 | VO-076 | no-meaningful-red | The codec, the file parser and the full checkDiagram validator were written for all three types in Phase 2 and 6 (T093 to T100), so the Sequence cases pass on first run. | The added cases round-trip a Sequence diagram through the stored and file forms, and refuse invalid Sequence files with the contract's sentences; they would fail if the codec dropped order or accepted a damaged file. | no | - |
| EX-34 | 2026-10-18T12:55:10Z | T150 | VO-083 | no-meaningful-red | The codec, the file parser and the full checkDiagram validator were written for all three types in Phase 2 and 6 (T093 to T100), so the Sequence cases pass on first run. | The added cases round-trip a Sequence diagram through the stored and file forms, and refuse invalid Sequence files with the contract's sentences; they would fail if the codec dropped order or accepted a damaged file. | no | - |
| EX-35 | 2026-10-18T13:16:22Z | T159 | VO-075 | no-meaningful-red | Saving and loading a Sequence diagram follows the same codec and route as a Flowchart (T093 to T110) and Sequence order is part of the model, so the new case passes on first run. | The case builds a Sequence diagram, reorders a participant and a message, closes the browser and reopens it on the same profile, and compares the order on the canvas; it would fail if order were not saved. | no | - |
| EX-36 | 2026-10-18T13:16:23Z | T160 | VO-075 | no-meaningful-red | Saving and loading a Sequence diagram follows the same codec and route as a Flowchart (T093 to T110) and Sequence order is part of the model, so the new case passes on first run. | The case builds a Sequence diagram, reorders a participant and a message, closes the browser and reopens it on the same profile, and compares the order on the canvas; it would fail if order were not saved. | no | - |
| EX-37 | 2026-10-18T13:31:03Z | T177 | VO-055 | no-meaningful-red | Nested Deployment_Node blocks and top-level Containers were written by generateC4 (T162) and the tree operations (T168, T176), which the Deployment cases of c4.fidelity.test.ts and nesting.test.ts already exercise, so this test passes on first run. | The test builds a nested Deployment diagram through the operations and compares the exact source lines and Mermaid's reading of each parent; it would fail if blocks were not nested or a Container were written outside its node. | no | - |
| EX-38 | 2026-10-18T13:31:04Z | T178 | VO-055 | no-meaningful-red | Nested Deployment_Node blocks and top-level Containers were written by generateC4 (T162) and the tree operations (T168, T176), which the Deployment cases of c4.fidelity.test.ts and nesting.test.ts already exercise, so this test passes on first run. | The test builds a nested Deployment diagram through the operations and compares the exact source lines and Mermaid's reading of each parent; it would fail if blocks were not nested or a Container were written outside its node. | no | - |
| EX-39 | 2026-10-18T13:34:05Z | T179 | VO-056 | no-meaningful-red | moveToParent was written with its nesting rules in T176, which keeps relationships and order because it only moves a subtree of the tree, so the membership cases pass on first run. | The test moves elements, Containers and nodes between boundaries, nodes and the top level, and compares the exact tree, the relationships and the source after each move; it would fail if a move dropped or reordered a relationship or left the item in two places. | no | - |
| EX-40 | 2026-10-18T13:34:06Z | T180 | VO-056 | no-meaningful-red | moveToParent was written with its nesting rules in T176, which keeps relationships and order because it only moves a subtree of the tree, so the membership cases pass on first run. | The test moves elements, Containers and nodes between boundaries, nodes and the top level, and compares the exact tree, the relationships and the source after each move; it would fail if a move dropped or reordered a relationship or left the item in two places. | no | - |
| EX-41 | 2026-10-18T13:37:51Z | T185 | VO-017 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-42 | 2026-10-18T13:37:53Z | T186 | VO-017 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-43 | 2026-10-18T13:37:55Z | T185 | VO-019 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-44 | 2026-10-18T13:37:56Z | T186 | VO-019 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-45 | 2026-10-18T13:37:57Z | T185 | VO-024 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-46 | 2026-10-18T13:37:57Z | T186 | VO-024 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-47 | 2026-10-18T13:37:58Z | T185 | VO-029 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-48 | 2026-10-18T13:37:59Z | T186 | VO-029 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-49 | 2026-10-18T13:38:00Z | T185 | VO-100 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-50 | 2026-10-18T13:38:02Z | T186 | VO-100 | no-meaningful-red | The C4 operations, the C4 rules of checkDiagram and generateC4 were built in T161 to T184 behind their own failing tests, so the C4 cases added here to the shared test pass on first run. | The C4 cases cover all five kinds and every text field, required label, rejection reason, operation kind and random operation; they fail if any C4 field is left unescaped, a blank required label is accepted, an operation is not undone exactly, or an accepted operation leaves an invalid diagram. | no | - |
| EX-51 | 2026-10-18T13:40:29Z | T187 | VO-076 | no-meaningful-red | The codec checks every C4 kind through checkDiagram's C4 rules, which were built with the C4 model, so the C4 round trips and refusals added here pass on first run. | The cases save and open a full diagram of each of the five kinds, and refuse a repeated id, a cycle-like nesting and an element type the kind does not offer; they fail if the C4 content were not stored, read back whole, or validated. | no | - |
| EX-52 | 2026-10-18T13:40:30Z | T188 | VO-076 | no-meaningful-red | The codec checks every C4 kind through checkDiagram's C4 rules, which were built with the C4 model, so the C4 round trips and refusals added here pass on first run. | The cases save and open a full diagram of each of the five kinds, and refuse a repeated id, a cycle-like nesting and an element type the kind does not offer; they fail if the C4 content were not stored, read back whole, or validated. | no | - |
| EX-53 | 2026-10-18T13:40:31Z | T187 | VO-083 | no-meaningful-red | The codec checks every C4 kind through checkDiagram's C4 rules, which were built with the C4 model, so the C4 round trips and refusals added here pass on first run. | The cases save and open a full diagram of each of the five kinds, and refuse a repeated id, a cycle-like nesting and an element type the kind does not offer; they fail if the C4 content were not stored, read back whole, or validated. | no | - |
| EX-54 | 2026-10-18T13:40:32Z | T188 | VO-083 | no-meaningful-red | The codec checks every C4 kind through checkDiagram's C4 rules, which were built with the C4 model, so the C4 round trips and refusals added here pass on first run. | The cases save and open a full diagram of each of the five kinds, and refuse a repeated id, a cycle-like nesting and an element type the kind does not offer; they fail if the C4 content were not stored, read back whole, or validated. | no | - |
| EX-55 | 2026-10-18T14:24:49Z | T203 | VO-002 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-56 | 2026-10-18T14:24:49Z | T203 | VO-011 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-57 | 2026-10-18T14:24:49Z | T203 | VO-018 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-58 | 2026-10-18T14:24:49Z | T203 | VO-034 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-59 | 2026-10-18T14:24:49Z | T203 | VO-093 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-60 | 2026-10-18T14:24:49Z | T203 | VO-075 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-61 | 2026-10-18T14:24:49Z | T204 | VO-002 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-62 | 2026-10-18T14:24:50Z | T204 | VO-011 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-63 | 2026-10-18T14:24:50Z | T204 | VO-018 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-64 | 2026-10-18T14:24:50Z | T204 | VO-034 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-65 | 2026-10-18T14:24:50Z | T204 | VO-093 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-66 | 2026-10-18T14:24:50Z | T204 | VO-075 | no-meaningful-red | The C4 canvas, toolbox, Properties panel, kind picker and source panel were built in T191 to T202 behind their own failing end-to-end tests, so the C4 cases added here to the shared specs pass on first run. Record #382 is a run error (the select was read as one filter and no tests were found) that the check script accepted as a failing run and cannot reclassify; #383 is the same specs run correctly. | The C4 cases cover all five kinds: they fail if a kind opens with another header or a type control, if the layout note appears for C4, if special text is not shown exactly as typed, if the canvas and source disagree after any edit, undo or redo, if a control without its selection changes anything, or if the order, boundaries, relationships and title are not restored after the browser is reopened. | no | - |
| EX-67 | 2026-10-18T21:44:39Z | T209 | VO-068 | no-meaningful-red | The empty-diagram headers and the c4-empty notice were generated since the generation layer was built (T0xx, EC-05); this test only pins that behaviour, so it passes on first run | The test reads each empty diagram back through Mermaid's own parser and asserts the exact source and notice; it was shown to fail while its indentation expectation was wrong | no | - |
| EX-68 | 2026-10-18T21:44:39Z | T210 | VO-068 | no-meaningful-red | The empty-diagram headers and the c4-empty notice were generated since the generation layer was built (T0xx, EC-05); this test only pins that behaviour, so it passes on first run | The test reads each empty diagram back through Mermaid's own parser and asserts the exact source and notice; it was shown to fail while its indentation expectation was wrong | no | - |
| EX-69 | 2026-10-18T22:40:56Z | T230 | VO-096 | no-meaningful-red | The model operations changeType and moveEnd already change only the item or link they name (built and tested in earlier phases); this test pins SC-016 across the three types and passes on first run | The test compares every other link before and after in diagrams of 6 items and 12 links, in each type and C4 kind; a change to any other link would fail it | no | - |
| EX-70 | 2026-10-18T22:40:56Z | T231 | VO-096 | no-meaningful-red | The model operations changeType and moveEnd already change only the item or link they name (built and tested in earlier phases); this test pins SC-016 across the three types and passes on first run | The test compares every other link before and after in diagrams of 6 items and 12 links, in each type and C4 kind; a change to any other link would fail it | no | - |
| EX-71 | 2026-10-18T22:46:26Z | T232 | VO-092 | no-meaningful-red | The editor never offered the excluded features: the toolbox, toolbar and panels were built without them and React Flow's multi-select, selection box, copy and paste and snap grid were switched off (selectionKeyCode, multiSelectionKeyCode set to null, no snapToGrid); the test pins this and passes on first run | The test lists the name of every control on the start screen and on each editor, checks the source panel holds no field or editable text, and exercises multi-select, copy and paste and a 5 pixel drag in a browser; it fails if any is added | no | - |
| EX-72 | 2026-10-18T22:46:26Z | T233 | VO-092 | no-meaningful-red | The editor never offered the excluded features: the toolbox, toolbar and panels were built without them and React Flow's multi-select, selection box, copy and paste and snap grid were switched off (selectionKeyCode, multiSelectionKeyCode set to null, no snapToGrid); the test pins this and passes on first run | The test lists the name of every control on the start screen and on each editor, checks the source panel holds no field or editable text, and exercises multi-select, copy and paste and a 5 pixel drag in a browser; it fails if any is added | no | - |
| EX-73 | 2026-10-18T22:47:56Z | T234 | VO-095 | no-meaningful-red | The derived nodes and edges are memoised and the source is generated once per present diagram (built in earlier phases), so a diagram of 100 elements and 150 relationships already meets the 1 second limit on this machine; the test passes on first run and there is nothing to remove | Each expectation that the canvas and the source show the edit, Undo and Redo is given a 1 second timeout, so the test fails if any step is slower; it runs against fixtures of 100 elements and 150 relationships in each type, in Chromium and Firefox | no | - |
| EX-74 | 2026-10-18T22:47:56Z | T235 | VO-095 | no-meaningful-red | The derived nodes and edges are memoised and the source is generated once per present diagram (built in earlier phases), so a diagram of 100 elements and 150 relationships already meets the 1 second limit on this machine; the test passes on first run and there is nothing to remove | Each expectation that the canvas and the source show the edit, Undo and Redo is given a 1 second timeout, so the test fails if any step is slower; it runs against fixtures of 100 elements and 150 relationships in each type, in Chromium and Firefox | no | - |

## Expectation changes

| ID | Time | Task | Files | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|-------|--------------|---------------|------------------|-------------|-----------------|
| XC-01 | 2026-10-18T10:24:22Z | T017 | app/generation/flowchart.fidelity.test.ts | SC-002 | Correction: the test built a connection to a node that does not exist, so Mermaid invented a tenth vertex; connections now wrap to the first node. No assertion was weakened. | no | - | 3db027 |
| XC-02 | 2026-10-18T10:35:54Z | T029 | e2e/flowchart-connect.spec.ts | FR-025 | Correction: the second node is dropped at x=520 instead of x=200 so the drawn edge has a non-zero bounding box and Playwright can see it; no assertion changed. | no | - | 699e75 |
| XC-03 | 2026-10-18T10:36:11Z | T030 | e2e/flowchart-connect.spec.ts | FR-025 | Correction (same change as XC-02): the second node is dropped at x=520 so the drawn edge has a non-zero bounding box; no assertion changed. | no | - | 699e75 |
| XC-04 | 2026-10-18T10:38:17Z | T032 | e2e/flowchart-drag-cancel.spec.ts | FR-016 | Correction: the pointer now makes a small first move to start the drag, because React Flow begins a drag on the first move; assertions unchanged. | no | - | 01016e |
| XC-05 | 2026-10-18T10:55:08Z | T036 | e2e/copy-source.spec.ts | FR-014 | Correction: the route that holds Mermaid back matched every script under the project folder name; it now matches only the pre-bundled mermaid dependency. No assertion changed. | no | - | 9c89b4 |
| XC-06 | 2026-10-18T11:09:56Z | T062 | app/history/rejections.test.ts | FR-009 | Correction: the catalogue check read en.rejections by a computed key, a lint warning; it now asks rejectionMessage for each reason, which still proves every reason has a non-empty fixed sentence. No expected behaviour changed. | no | - | 78788d |
| XC-07 | 2026-10-18T11:27:16Z | T072 | e2e/controls.spec.ts | EC-09 | Correction to test set-up only: the Diamond is dropped inside the visible canvas, and the test waits for the closing menu's backdrop to be removed before clicking the canvas. No assertion changed. | no | - | 744a59 |
| XC-08 | 2026-10-18T11:27:16Z | T073 | e2e/controls.spec.ts | EC-09 | Correction to test set-up only: the Diamond is dropped inside the visible canvas, and the test waits for the closing menu's backdrop to be removed before clicking the canvas. No assertion changed. | no | - | 744a59 |
| XC-09 | 2026-10-18T11:29:34Z | T075 | app/history/history.test.ts | FR-011 | Correction: replaced type assertions on indexed states with a checked lookup helper to satisfy lint. No assertion changed. | no | - | fd76ec |
| XC-10 | 2026-10-18T11:35:26Z | T083 | e2e/gestures.spec.ts | EC-08 | Correction: the first Red run passed, so the Undo-during-drag test was rewritten to drag the node that Undo does not remove, which can show a partial change; the other tests are unchanged. | no | - | 48a958 |
| XC-11 | 2026-10-18T11:41:57Z | T087 | e2e/flowchart-preview.spec.ts | FR-016 | Correction to how the test finds the picture: the error alert has its own icon svg, so the drawing is found by its application role instead of any svg. No expected behaviour changed. | no | - | cbc799 |
| XC-12 | 2026-10-18T11:53:38Z | T100 | app/persistence/fileName.test.ts | FR-048 | Correction to match the contract (contracts/file-format.md): a name of only a zero-width character keeps it as an underscore; the fallback applies only when nothing remains after trimming. | no | - | ec93b0 |
| XC-13 | 2026-10-18T11:57:46Z | T104 | e2e/save-status.spec.ts | FR-043 | Correction: fixed waits were replaced by elapsed-time assertions to satisfy lint; the expected behaviour (Saved only after the delayed write completes, within a second when undelayed) is unchanged. | no | - | c8a909 |
| XC-14 | 2026-10-18T12:00:26Z | T106 | e2e/unsaved-new.spec.ts | EC-15 | Correction: the helper that counts stored diagrams was flattened to satisfy the lint limit on nested functions; nothing it asserts changed. | no | - | 6e1e66 |
| XC-15 | 2026-10-18T12:04:25Z | T108 | e2e/saved-list.spec.ts | FR-044 | Scope correction: the test that followed a list link to the editor depended on loading a saved diagram (T110); it now checks the link target, and opening is tested by T109. | no | - | 45857c |
| XC-16 | 2026-10-18T12:08:26Z | T110 | e2e/reopen.spec.ts | FR-043 | Correction to the test's set-up: it waits for the address to move to /d/<id> and for the reopened diagram to load before reading them, and passes the base address correctly under exactOptionalPropertyTypes. No assertion changed. | no | - | 081e00 |
| XC-17 | 2026-10-18T12:15:31Z | T114 | e2e/delete-diagram.spec.ts | EC-13 | Correction to how the last test waits: it reloads and waits for the row before counting Delete… buttons. The expected behaviour (Delete offered again once the editing tab is closed) is unchanged. | no | - | d42ba9 |
| XC-18 | 2026-10-18T12:21:15Z | T118 | e2e/save-file.spec.ts | FR-047 | Correction: the messages live region is located by its real role (status); no assertion changed. | no | - | b41dd7 |
| XC-19 | 2026-10-18T12:42:50Z | T126 | e2e/two-tabs.spec.ts | FR-050 | Correction to the test's set-up: the draft check finds the label field with hidden elements included (the dialog hides the page from the accessibility tree) and the decline test waits for the address to move to /d/<id> before opening the second tab. No expectation about behaviour changed. | no | - | 8bf3d8 |
| XC-20 | 2026-10-18T12:51:32Z | T140 | app/model/sequence/reorder.test.ts | FR-029 | Correction: the expected source line for the open arrow is written '->'; no behaviour expectation changed. | no | - | 496d70 |
| XC-21 | 2026-10-18T12:53:51Z | T148 | app/history/history.test.ts | FR-018 | Correction: the first reorder in the Sequence walk asked for the position the participant already held, so nothing changed; it now moves it to the right-hand end. No expectation about behaviour changed. | no | - | 8aecad |
| XC-22 | 2026-10-18T12:54:09Z | T147 | app/history/history.test.ts | FR-006, FR-026, FR-009, FR-008, DC-06 | Correction: the first reorder in the Sequence walk asked for the position the participant already held, so nothing changed; it now moves it to the right-hand end. No expectation about behaviour changed. | no | - | 8aecad |
| XC-23 | 2026-10-18T12:54:09Z | T148 | app/history/history.test.ts | FR-006, FR-026, FR-009, FR-008, DC-06 | Correction: the first reorder in the Sequence walk asked for the position the participant already held, so nothing changed; it now moves it to the right-hand end. No expectation about behaviour changed. | no | - | 8aecad |
| XC-24 | 2026-10-18T12:54:15Z | T147 | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | FR-006, FR-026, FR-009, FR-008, DC-06, US2-AS2, US2-AS3, US2-AS8, US3-AS1, SC-003, SC-006, SC-004, EC-03, EC-04 | Correction: the first reorder in the Sequence walk of history.test.ts asked for the position the participant already held, so nothing changed; it now moves it to the right-hand end. No expectation about behaviour changed. | no | - | 7cfbb2 |
| XC-25 | 2026-10-18T12:54:15Z | T148 | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | FR-006, FR-026, FR-009, FR-008, DC-06, US2-AS2, US2-AS3, US2-AS8, US3-AS1, SC-003, SC-006, SC-004, EC-03, EC-04 | Correction: the first reorder in the Sequence walk of history.test.ts asked for the position the participant already held, so nothing changed; it now moves it to the right-hand end. No expectation about behaviour changed. | no | - | 7cfbb2 |
| XC-26 | 2026-10-18T12:55:23Z | T149 | app/persistence/codec.test.ts | FR-052 | Extension: Sequence cases are added to the test written for Flowchart; no earlier assertion was changed. | no | - | a96b71 |
| XC-27 | 2026-10-18T12:55:23Z | T149 | app/persistence/openFile.test.ts | FR-050, DC-04, DC-06 | Extension: Sequence cases are added to the test written for Flowchart; no earlier assertion was changed. | no | - | 9d4783 |
| XC-28 | 2026-10-18T12:55:28Z | T150 | app/persistence/codec.test.ts | FR-052 | Extension: Sequence cases are added to the test written for Flowchart; no earlier assertion was changed. | no | - | a96b71 |
| XC-29 | 2026-10-18T12:55:28Z | T150 | app/persistence/openFile.test.ts | FR-050, DC-04, DC-06 | Extension: Sequence cases are added to the test written for Flowchart; no earlier assertion was changed. | no | - | 9d4783 |
| XC-30 | 2026-10-18T12:56:44Z | T152 | app/rendering/layout/sequenceLayout.test.ts | FR-003 | Correction: the even-spacing assertion used non-null assertions the lint rules forbid; it now compares the gaps between lifelines. No expectation about behaviour changed. | no | - | fa3e9a |
| XC-31 | 2026-10-18T13:14:19Z | T157 | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | FR-001, FR-003, FR-006, FR-009, FR-005, FR-041, FR-008, SC-003, EC-03, EC-09 | Correction to the Sequence cases written in this task: reading of the canvas (data attributes instead of the accessible name), the number of undo steps, and a Reverse step that had landed on a self-message. No expectation about behaviour was weakened. | no | - | 7a169a |
| XC-32 | 2026-10-18T13:14:19Z | T158 | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | FR-001, FR-003, FR-006, FR-009, FR-005, FR-041, FR-008, SC-003, EC-03, EC-09 | Correction to the Sequence cases written in this task: reading of the canvas (data attributes instead of the accessible name), the number of undo steps, and a Reverse step that had landed on a self-message. No expectation about behaviour was weakened. | no | - | 7a169a |
| XC-33 | 2026-10-18T13:16:39Z | T160 | e2e/reopen.spec.ts | FR-042, FR-043 | Extension: a Sequence case is added to the test written for Flowchart; no earlier assertion was changed. | no | - | 292911 |
| XC-34 | 2026-10-18T13:16:57Z | T159 | e2e/reopen.spec.ts | FR-042, FR-043 | Extension: a Sequence case is added to the test written for Flowchart; no earlier assertion was changed. | no | - | 292911 |
| XC-35 | 2026-10-18T13:21:37Z | T161 | app/generation/c4.fidelity.test.ts | FR-031, FR-032, FR-035 | Lint corrections to the test after its Red run (nested conditionals, a non-null assertion); the assertions are unchanged. | no | - | 990f21 |
| XC-36 | 2026-10-18T13:21:37Z | T162 | app/generation/c4.fidelity.test.ts | FR-031, FR-032, FR-035 | Lint corrections to the test after its Red run (nested conditionals, a non-null assertion); the assertions are unchanged. | no | - | 990f21 |
| XC-37 | 2026-10-18T13:23:54Z | T165 | app/model/c4/title.test.ts | FR-054 | Unchanged assertions; the test file is the one recorded at Red. | no | - | d0e6b8 |
| XC-38 | 2026-10-18T13:27:53Z | T171 | app/model/c4/dynamic.test.ts | FR-033 | A lint correction to the test after its Red run (a sort given a compare function); the assertions are unchanged. | no | - | 73c0af |
| XC-39 | 2026-10-18T13:27:54Z | T172 | app/model/c4/dynamic.test.ts | FR-033 | A lint correction to the test after its Red run (a sort given a compare function); the assertions are unchanged. | no | - | 73c0af |
| XC-40 | 2026-10-18T13:33:22Z | T183 | app/model/c4/relationshipEnds.test.ts | FR-040, FR-041 | Correction after the Red run: changing an element's type to a direction is not a cross-family change but an operation the element does not offer, so the expected reason is notOfferedInKind. | no | - | 290b28 |
| XC-41 | 2026-10-18T13:33:22Z | T184 | app/model/c4/relationshipEnds.test.ts | FR-040, FR-041 | Correction after the Red run: changing an element's type to a direction is not a cross-family change but an operation the element does not offer, so the expected reason is notOfferedInKind. | no | - | 290b28 |
| XC-42 | 2026-10-18T13:38:15Z | T185 | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | FR-006, FR-026, FR-009, FR-008, DC-06, US2-AS2, US2-AS3, US2-AS8, US3-AS1, SC-003, SC-006, SC-004, EC-03, EC-04 | Extension: the C4 cases are added to the shared tests. The two fixes made before the first valid run corrected the C4 cases themselves (a default description in an expected readback, and a type the kind does not offer in an operation list); no earlier assertion was changed or weakened. | no | - | fda081 |
| XC-43 | 2026-10-18T13:38:15Z | T186 | app/generation/escape.fidelity.test.ts, app/history/history.test.ts, app/history/rejections.test.ts, app/validation/checkDiagram.property.test.ts, app/validation/label.test.ts | FR-006, FR-026, FR-009, FR-008, DC-06, US2-AS2, US2-AS3, US2-AS8, US3-AS1, SC-003, SC-006, SC-004, EC-03, EC-04 | Extension: the C4 cases are added to the shared tests. The two fixes made before the first valid run corrected the C4 cases themselves (a default description in an expected readback, and a type the kind does not offer in an operation list); no earlier assertion was changed or weakened. | no | - | fda081 |
| XC-44 | 2026-10-18T13:39:02Z | T185 | app/validation/checkDiagram.property.test.ts | FR-009, SC-006, DC-06 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | d0f0e8 |
| XC-45 | 2026-10-18T13:39:03Z | T186 | app/validation/checkDiagram.property.test.ts | FR-009, SC-006, DC-06 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | d0f0e8 |
| XC-46 | 2026-10-18T13:39:03Z | T185 | app/generation/escape.fidelity.test.ts | FR-006, US2-AS2, SC-003, EC-03 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | 447aa7 |
| XC-47 | 2026-10-18T13:39:03Z | T186 | app/generation/escape.fidelity.test.ts | FR-006, US2-AS2, SC-003, EC-03 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | 447aa7 |
| XC-48 | 2026-10-18T13:39:03Z | T185 | app/history/history.test.ts | FR-008, US3-AS1, SC-004 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | 728c1f |
| XC-49 | 2026-10-18T13:39:03Z | T186 | app/history/history.test.ts | FR-008, US3-AS1, SC-004 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | 728c1f |
| XC-50 | 2026-10-18T13:39:03Z | T185 | app/validation/label.test.ts | FR-006, FR-026, US2-AS3, EC-04 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | 8df29d |
| XC-51 | 2026-10-18T13:39:03Z | T186 | app/validation/label.test.ts | FR-006, FR-026, US2-AS3, EC-04 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | 8df29d |
| XC-52 | 2026-10-18T13:39:04Z | T185 | app/history/rejections.test.ts | FR-009, US2-AS8, SC-006 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | 6f1097 |
| XC-53 | 2026-10-18T13:39:04Z | T186 | app/history/rejections.test.ts | FR-009, US2-AS8, SC-006 | Extension: the C4 cases are added to this shared test. The fixes made before the first valid run corrected the C4 cases themselves; no earlier assertion was changed or weakened. | no | - | 6f1097 |
| XC-54 | 2026-10-18T13:40:30Z | T187 | app/persistence/codec.test.ts | FR-052, FR-050, DC-04, DC-06 | Extension: C4 cases are added to the shared test; the one correction made before its first valid run fixed the expected value in the new case itself. | no | - | 6fb6d0 |
| XC-55 | 2026-10-18T13:40:31Z | T188 | app/persistence/codec.test.ts | FR-052, FR-050, DC-04, DC-06 | Extension: C4 cases are added to the shared test; the one correction made before its first valid run fixed the expected value in the new case itself. | no | - | 6fb6d0 |
| XC-56 | 2026-10-18T13:40:32Z | T187 | app/persistence/openFile.test.ts | FR-052, FR-050, DC-04, DC-06 | Extension: C4 cases are added to the shared test; the one correction made before its first valid run fixed the expected value in the new case itself. | no | - | eb22dc |
| XC-57 | 2026-10-18T13:40:33Z | T188 | app/persistence/openFile.test.ts | FR-052, FR-050, DC-04, DC-06 | Extension: C4 cases are added to the shared test; the one correction made before its first valid run fixed the expected value in the new case itself. | no | - | eb22dc |
| XC-58 | 2026-10-18T13:45:35Z | T191 | e2e/c4-kind-picker.spec.ts | FR-036, FR-037 | Correction after the Red run: the kind is shown capitalised in the header ('C4 Context diagram'), as the existing type label has always shown it; no behaviour expectation changed. | no | - | 48ded9 |
| XC-59 | 2026-10-18T13:45:36Z | T192 | e2e/c4-kind-picker.spec.ts | FR-036, FR-037 | Correction after the Red run: the kind is shown capitalised in the header ('C4 Context diagram'), as the existing type label has always shown it; no behaviour expectation changed. | no | - | 48ded9 |
| XC-60 | 2026-10-18T13:54:53Z | T194 | app/model/c4/relationshipEnds.test.ts | FR-040, FR-041 | Correction after the Red run (see XC-40): changing an element's type to a direction is not a cross-family change but an operation the element does not offer, so the expected reason is notOfferedInKind. No behaviour expectation changed. | no | - | 290b28 |
| XC-61 | 2026-10-18T14:04:20Z | T195 | e2e/c4-dynamic-reorder.spec.ts | FR-033 | Correction: a test title claimed an explanation for Move up on the first relationship, as the sequence diagram's equivalent does not give one either; only the title changed. | no | - | 65e032 |
| XC-62 | 2026-10-18T14:04:20Z | T196 | e2e/c4-dynamic-reorder.spec.ts | FR-033 | Correction: a test title claimed an explanation for Move up on the first relationship, as the sequence diagram's equivalent does not give one either; only the title changed. | no | - | 65e032 |
| XC-63 | 2026-10-18T14:14:50Z | T199 | e2e/c4-title.spec.ts | FR-054 | Correction after the first Green run: the source panel of an empty C4 diagram also shows the empty-diagram notice, so the cleared title is checked by the absence of a title line instead of an empty source; no behaviour expectation changed. | no | - | 5f8f98 |
| XC-64 | 2026-10-18T14:14:50Z | T200 | e2e/c4-title.spec.ts | FR-054 | Correction after the first Green run: the source panel of an empty C4 diagram also shows the empty-diagram notice, so the cleared title is checked by the absence of a title line instead of an empty source; no behaviour expectation changed. | no | - | 5f8f98 |
| XC-65 | 2026-10-18T14:30:19Z | T205 | app/history/merge.test.ts | EC-19 | Correction after the first Green run: equally near free positions resolve north first (EC-19 ring order), so the expected y is -64; no behaviour expectation changed. | no | - | 4d958e |
| XC-66 | 2026-10-18T14:30:19Z | T206 | app/history/merge.test.ts | EC-19 | Correction after the first Green run: equally near free positions resolve north first (EC-19 ring order), so the expected y is -64; no behaviour expectation changed. | no | - | 4d958e |
| XC-67 | 2026-10-18T21:44:03Z | T208 | app/editor/targets.test.ts | FR-019 | Correction: the expected order of the C4 targets followed the walk order wrongly; the requirement (distinct entries by type and position number) is unchanged | no | - | 8fdca8 |
| XC-68 | 2026-10-18T21:47:53Z | T212 | e2e/empty-state.spec.ts | FR-019 | Correction: the test waits for the source check before copying and allows the c4-empty notice after the header; the empty-state requirement (EC-05) is unchanged | no | - | 99b33d |
| XC-69 | 2026-10-18T21:51:55Z | T214 | e2e/keyboard-only.spec.ts | FR-019 | Correction: participant and element names carry their position among items of that type (T208), so the test picks them by that name; the keyboard-only requirement is unchanged | no | - | d5dc86 |
| XC-70 | 2026-10-18T21:52:24Z | T215 | e2e/keyboard-only.spec.ts | FR-019 | Addition: the test now also drives Connect… for Sequence and C4, which T215 covers; the keyboard-only requirement is unchanged | no | - | 4cb267 |
| XC-71 | 2026-10-18T22:17:22Z | T223 | e2e/announcements.spec.ts | FR-020 | Correction: focus is compared by element identity instead of by its text; the requirement (announce without moving focus) is unchanged | no | - | e21c65 |
| XC-72 | 2026-10-18T22:19:58Z | T225 | e2e/accessible-names.spec.ts | FR-020 | Correction: the test reaches each item by pressing Tab from the first toolbox button, because Firefox does not wrap focus to the top; the requirement is unchanged | no | - | 53b4e8 |
| XC-73 | 2026-10-18T22:23:41Z | T227 | e2e/wcag.spec.ts | FR-020 | Correction: the scan waits for transitions to finish so colours are measured at rest, and the preview and second-tab steps use the right locators; the WCAG 2.2 AA requirement is unchanged | no | - | 31d41b |
| XC-74 | 2026-10-18T22:31:19Z | T229 | e2e/selection-feedback.spec.ts | AC4 | Correction: the blank-canvas click is made at a point inside the visible page (the earlier point was off screen); the selection-feedback requirement is unchanged | no | - | 69c97d |
| XC-75 | 2026-10-18T23:02:03Z | T048 | app/validation/label.test.ts | FR-006 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 8df29d |
| XC-76 | 2026-10-18T23:02:15Z | T052 | app/generation/escape.fidelity.test.ts | FR-006 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 447aa7 |
| XC-77 | 2026-10-18T23:02:16Z | T062 | app/history/rejections.test.ts | FR-009 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 6f1097 |
| XC-78 | 2026-10-18T23:02:16Z | T075 | app/history/history.test.ts | FR-008 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 728c1f |
| XC-79 | 2026-10-18T23:02:16Z | T091 | app/persistence/openFile.test.ts | FR-049 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | eb22dc |
| XC-80 | 2026-10-18T23:02:16Z | T092 | app/persistence/openFile.test.ts | FR-049 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | eb22dc |
| XC-81 | 2026-10-18T23:02:16Z | T096 | app/persistence/codec.test.ts | FR-052 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 6fb6d0 |
| XC-82 | 2026-10-18T23:02:16Z | T102 | app/validation/checkDiagram.property.test.ts | FR-009 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | d0f0e8 |
| XC-83 | 2026-10-18T23:02:16Z | T147 | app/generation/escape.fidelity.test.ts | FR-006 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 447aa7 |
| XC-84 | 2026-10-18T23:02:17Z | T147 | app/validation/label.test.ts | FR-006 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 8df29d |
| XC-85 | 2026-10-18T23:02:17Z | T147 | app/history/rejections.test.ts | FR-009 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 6f1097 |
| XC-86 | 2026-10-18T23:02:17Z | T147 | app/history/history.test.ts | FR-008 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 728c1f |
| XC-87 | 2026-10-18T23:02:17Z | T147 | app/validation/checkDiagram.property.test.ts | FR-009 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | d0f0e8 |
| XC-88 | 2026-10-18T23:02:17Z | T148 | app/generation/escape.fidelity.test.ts | FR-006 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 447aa7 |
| XC-89 | 2026-10-18T23:02:17Z | T148 | app/validation/label.test.ts | FR-006 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 8df29d |
| XC-90 | 2026-10-18T23:02:17Z | T148 | app/history/rejections.test.ts | FR-009 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 6f1097 |
| XC-91 | 2026-10-18T23:02:18Z | T148 | app/history/history.test.ts | FR-008 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 728c1f |
| XC-92 | 2026-10-18T23:02:18Z | T148 | app/validation/checkDiagram.property.test.ts | FR-009 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | d0f0e8 |
| XC-93 | 2026-10-18T23:02:18Z | T149 | app/persistence/codec.test.ts | FR-052 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 6fb6d0 |
| XC-94 | 2026-10-18T23:02:18Z | T149 | app/persistence/openFile.test.ts | FR-049 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | eb22dc |
| XC-95 | 2026-10-18T23:02:18Z | T150 | app/persistence/codec.test.ts | FR-052 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | 6fb6d0 |
| XC-96 | 2026-10-18T23:02:18Z | T150 | app/persistence/openFile.test.ts | FR-049 | Extension: later tasks (the Sequence and C4 phases) extended this shared test file with their own cases and re-ran the obligation; the assertions this task introduced are unchanged and still pass | no | - | eb22dc |
| XC-97 | 2026-10-18T23:02:19Z | T214 | e2e/keyboard-only.spec.ts | FR-019 | Extension: the keyboard-only test also drives Connect… for Sequence and C4 (T215); the keyboard requirement is unchanged | no | - | 4cb267 |
| XC-98 | 2026-10-18T23:02:39Z | T064 | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | FR-009 | Extension: later tasks (the Sequence and C4 phases) extended these shared end-to-end specs; the blank-label rejection cases this task introduced in e2e/rejections.spec.ts are unchanged and pass | no | - | ec49bb |
| XC-99 | 2026-10-18T23:02:44Z | T157 | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | FR-009 | Extension: later tasks extended these shared end-to-end specs after this task's run; the cases this task introduced are unchanged and pass | no | - | ec49bb |
| XC-100 | 2026-10-18T23:02:44Z | T158 | e2e/canvas-source-agree.spec.ts, e2e/controls.spec.ts, e2e/flowchart-layout-note.spec.ts, e2e/labels-special.spec.ts, e2e/new-diagram.spec.ts, e2e/rejections.spec.ts | FR-009 | Extension: later tasks extended these shared end-to-end specs after this task's run; the cases this task introduced are unchanged and pass | no | - | ec49bb |

## Decisions

| ID | Opened | Question | Tasks | Status | Answer | Decided by | Resolved |
|----|--------|----------|-------|--------|--------|------------|----------|

## Behaviour items at baseline

| Item | Verified by | Fingerprint | Seq |
|------|-------------|-------------|-----|
| BI-001 | VO-001 | 39ee00 | 1 |
| BI-002 | VO-002 | fbcfbb | 1 |
| BI-003 | VO-003 | 0002f3 | 1 |
| BI-004 | VO-004, VO-005 | eb80a7 | 1 |
| BI-005 | VO-006 | 79b40c | 1 |
| BI-006 | VO-008 | 82b1cf | 1 |
| BI-007 | VO-009 | a7113f | 1 |
| BI-008 | VO-010 | e276c8 | 1 |
| BI-009 | VO-011 | 21797e | 1 |
| BI-010 | VO-012 | e5daa7 | 1 |
| BI-011 | VO-014 | 2dbf93 | 1 |
| BI-012 | VO-015, VO-016 | dc7ec1 | 1 |
| BI-095 | VO-101 | 8acbdf | 1 |
| BI-013 | VO-017, VO-018 | c5befa | 1 |
| BI-014 | VO-019 | 2390be | 1 |
| BI-015 | VO-020 | 35ff70 | 1 |
| BI-016 | VO-021 | 184f95 | 1 |
| BI-017 | VO-022 | 01f1a2 | 1 |
| BI-018 | VO-023 | 5d94fc | 1 |
| BI-019 | VO-024, VO-025 | 7984ac | 1 |
| BI-020 | VO-026 | 42c9ea | 1 |
| BI-021 | VO-027 | c0b24c | 1 |
| BI-022 | VO-028 | bc92d8 | 1 |
| BI-023 | VO-029 | 7e1f0b | 1 |
| BI-024 | VO-029 | c0d2de | 1 |
| BI-025 | VO-030 | ad1f25 | 1 |
| BI-026 | VO-031 | 8b653b | 1 |
| BI-027 | VO-032 | 09ea1a | 1 |
| BI-028 | VO-033, VO-075 | 8141e5 | 1 |
| BI-029 | VO-035 | e4b133 | 1 |
| BI-030 | VO-037 | ed7347 | 1 |
| BI-031 | VO-038 | b0b3a9 | 1 |
| BI-032 | VO-039 | 5636f8 | 1 |
| BI-033 | VO-040 | ccdb2b | 1 |
| BI-034 | VO-041, VO-042 | 9cd4b1 | 1 |
| BI-035 | VO-043 | 08ef5f | 1 |
| BI-036 | VO-044 | a1021c | 1 |
| BI-037 | VO-045 | 0377e1 | 1 |
| BI-038 | VO-046 | 6b3e8c | 1 |
| BI-039 | VO-047 | c5ff71 | 1 |
| BI-040 | VO-049 | a68139 | 1 |
| BI-041 | VO-050 | cf287e | 1 |
| BI-042 | VO-051, VO-052 | d3cda1 | 1 |
| BI-043 | VO-053 | a40781 | 1 |
| BI-044 | VO-054 | f170df | 1 |
| BI-045 | VO-055 | 2dd451 | 1 |
| BI-046 | VO-056, VO-057 | 9c0a33 | 1 |
| BI-047 | VO-058 | 6766e9 | 1 |
| BI-048 | VO-060 | 8a9694 | 1 |
| BI-049 | VO-061 | 4b87d6 | 1 |
| BI-050 | VO-062 | 1c9025 | 1 |
| BI-051 | VO-065 | 7cc5bc | 1 |
| BI-052 | VO-066 | bfd9c1 | 1 |
| BI-053 | VO-067 | 45cff4 | 1 |
| BI-054 | VO-068, VO-069 | 4f66bb | 1 |
| BI-055 | VO-070 | fb5b45 | 1 |
| BI-056 | VO-073 | 65da00 | 1 |
| BI-057 | VO-074 | 4ef6bb | 1 |
| BI-058 | VO-075 | fcd9df | 1 |
| BI-059 | VO-077 | cf1005 | 1 |
| BI-060 | VO-078 | f26e3a | 1 |
| BI-061 | VO-079 | 09e331 | 1 |
| BI-062 | VO-080 | 563aff | 1 |
| BI-063 | VO-082 | c34389 | 1 |
| BI-064 | VO-083, VO-084 | 1e402e | 1 |
| BI-065 | VO-085 | 8e61fc | 1 |
| BI-066 | VO-086 | 5a96d4 | 1 |
| BI-067 | VO-074 | 17f8ac | 1 |
| BI-068 | VO-007 | ab8cfe | 1 |
| BI-069 | VO-013 | cf870d | 1 |
| BI-070 | VO-034 | 0c1253 | 1 |
| BI-071 | VO-036 | 65b77f | 1 |
| BI-072 | VO-048 | a31a05 | 1 |
| BI-073 | VO-059 | e5cb7a | 1 |
| BI-074 | VO-063 | 7b5082 | 1 |
| BI-075 | VO-064 | 8a1e55 | 1 |
| BI-076 | VO-071 | 850aaa | 1 |
| BI-077 | VO-072 | 484ed4 | 1 |
| BI-078 | VO-076 | 117550 | 1 |
| BI-079 | VO-081 | 2f0951 | 1 |
| BI-080 | VO-087 | c303d4 | 1 |
| BI-081 | VO-088 | 6d771e | 1 |
| BI-082 | VO-089 | bc37fe | 1 |
| BI-083 | VO-090 | 670c91 | 1 |
| BI-084 | VO-091 | 5b3b1f | 1 |
| BI-085 | VO-092 | e98e18 | 1 |
| BI-086 | VO-093 | 6a25e8 | 1 |
| BI-087 | VO-094 | adf9c6 | 1 |
| BI-088 | VO-095 | 959dd2 | 1 |
| BI-089 | VO-096 | efc881 | 1 |
| BI-090 | VO-097 | dda1bb | 1 |
| BI-091 | VO-098 | f20da4 | 1 |
| BI-092 | VO-099 | 8c6cc3 | 1 |
| BI-093 | VO-100 | eb4957 | 1 |
| BI-094 | exemption FR-022 | 10ac6f | 1 |

## Behaviour item changes

| ID | Time | Item | Requirements | Justification | Alters behaviour | Approved by | New fingerprint |
|----|------|------|--------------|---------------|------------------|-------------|-----------------|
