# Tasks: Inline Edit Caret Stays Put

**Input**: [inline-edit-caret.spec.md](./inline-edit-caret.spec.md) (Approach section)

## Phase 1: User Story 1 - Type in the middle of a shape label (P1)

- [x] **T001** [US1] Failing e2e: typing at the start, in the middle and over a selection of a flowchart shape label keeps every character at the caret and the caret after it; Enter commits that exact text to the source (FR-001, FR-002, FR-003, FR-006) + e2e/inline-edit-caret.spec.ts
- [x] **T002** [US1] Failing e2e: Backspace and Delete mid-label leave the caret at the deletion point; Shift+Enter mid-label inserts a line break at the caret (FR-004) + e2e/inline-edit-caret.spec.ts
- [x] **T003** [US1] Fix: the field keeps its own text and caret while typing and only takes a prop value that differs from what it shows; paste and open-selects-all still work (FR-001 to FR-004, FR-007) + app/rendering/shared/InlineLabelEditor.tsx

## Phase 2: User Story 2 - Connections, sequence and C4 labels (P2)

- [x] **T004** [P] [US2] e2e: typing at the start and in the middle of a flowchart connection label lands at the caret (FR-005) + e2e/inline-edit-caret.spec.ts
- [x] **T005** [P] [US2] e2e: typing in the middle of a sequence label and a C4 label lands at the caret (FR-005) + e2e/inline-edit-caret.spec.ts

- [x] **T006** [P] [US1] Touch e2e on the emulated phone: typing at the start and in the middle of a shape label lands at the caret (FR-008) + e2e/touch/inline-edit-caret.spec.ts

## Phase 3: Polish

- [x] **T007** Regression: existing inline-edit e2e suites and `npm run lint` and `npm run typecheck` pass (SC-003) + e2e/inline-edit*.spec.ts, e2e/touch/
