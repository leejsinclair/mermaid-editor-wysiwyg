<!--
Sync Impact Report (temporary; remove before commit)
- Version change: (unfilled template) → 1.0.0
- Modified principles: none renamed; all five template principle slots filled
  (I. Visual Model Is the Source of Truth, II. Layered Architecture, III. Test-First (NON-NEGOTIABLE),
  IV. Invalid Operations Never Corrupt, V. Undoable, Consistent, Honest Feedback)
- Added sections: Technology and Scope Constraints; Workflow and Quality Gates
- Removed sections: none
- Deferred TODOs: none
-->
# Mermaid Editor (WYSIWYG) Constitution

## Core Principles

### I. Visual Model Is the Source of Truth
The visual diagram model is the only editable state. Mermaid source MUST be generated from the
model, MUST be read-only in the editor, and MUST NOT be parsed back into, or stored as, editable
state. Importing or hand-editing Mermaid source is out of scope. Users MUST NOT need to know
Mermaid syntax to create or modify a diagram.

Rationale: a single source of truth is the only way to keep the model, the rendering and the
source consistent (setup.md business rules 1, 2 and 10).

### II. Layered Architecture
The codebase MUST keep these layers separate, with no import from a later layer back into an
earlier one: (1) visual diagram model, (2) validation, (3) Mermaid generation, (4) rendering,
(5) editing history. Layers 1, 2, 3 and 5 MUST be pure TypeScript with no DOM access so they can
be tested without a browser. Mermaid generation MUST be a pure function of the model and MUST
escape labels.

Rationale: separation lets the logic that decides correctness be tested exhaustively and cheaply.

### III. Test-First (NON-NEGOTIABLE)
Every task follows Red, Green, Refactor under the integrated-TDD extension. The failing test MUST
be written and run before the behaviour it verifies. Tests MUST be run only through `tdd_check.py
run` so the run is recorded; evidence files MUST NOT be hand-edited. A task MAY be marked `[X]`
only after its gate passes and the type check is clean. Tests MUST NOT be weakened, skipped or
deleted to obtain a pass; changing an expected behaviour requires a recorded expectation change
and Business Analyst approval. Mermaid generation, label escaping and special-character handling
MUST have automated tests, and generated output MUST be validated against the supported grammar.

### IV. Invalid Operations Never Corrupt the Diagram
An operation is either committed whole or rejected with no partial change. Deleting a node MUST
remove its incident connections and MUST NOT create new connections between its former neighbours.
Cycles, fan-in, fan-out and disconnected nodes are valid and MUST NOT be rejected for their
structure alone. The editor MUST NOT impose meaning or restrictions beyond the supported grammar
and defined editor rules, and MUST NOT silently alter a diagram's logical meaning.

### V. Undoable, Consistent, Honest Feedback
Every committed editing operation MUST be undoable and redoable; a completed drag or label edit
is one operation. After any edit, Undo or Redo, the model, the rendering and the generated source
MUST agree. Unavailable, invalid or failed operations (including render, generation and clipboard
failures) MUST produce understandable feedback, and success MUST be reported only after it has
actually occurred. Controls MUST NOT be offered for unsupported actions.

## Technology and Scope Constraints

- Language is TypeScript in strict mode; `any` requires a comment stating why.
- The deliverable is a browser web app with no server component.
- Only Mermaid flowcharts are supported initially. Another diagram type MAY be added only after its
  elements, relationships, editing operations and validation rules are explicitly specified and
  tested.
- Excluded: direct source editing, source import, SVG/PNG export, real-time collaboration, and
  version history or persistence across sessions.
- Dependencies, test frameworks, linters and build tools MUST be those named by the approved plan.

## Workflow and Quality Gates

- Lifecycle: constitution → specify (grill follows automatically) → clarify if needed → plan →
  tasks → analyze → implement. The human Business Analyst takes part in the interactive stages.
- Source of truth, in order: `setup.md` acceptance criteria and business rules; `spec.md`
  including Clarifications; this constitution; `plan.md`, `tasks.md` and the behaviour checklist;
  `.crews/decisions.md`. A lower item never overrides a higher one.
- Ambiguity or contradiction in the spec MUST be raised as an open question, not resolved by
  assumption.
- The human commits and pushes; agents MUST NOT run `git commit` or `git push`.
- The Definition of Done in `setup.md` (all AC1–AC17 passing, among other items) gates release.

## Governance

This constitution supersedes other practices where they conflict, except that `setup.md` ranks
above it. Amendments MUST be proposed in writing, approved by the Business Analyst, and recorded
with a version bump and a migration note for any affected specs, plans or tasks. Versioning is
semantic: MAJOR for backward-incompatible removal or redefinition of a principle, MINOR for a new
principle or materially expanded guidance, PATCH for clarifications. Every plan, analysis and
review MUST check compliance with these principles, and any departure MUST be justified in the
plan's complexity record. Runtime guidance lives in `CLAUDE.md` and `.crews/directives.md`.

**Version**: 1.0.0 | **Ratified**: 2026-10-18 | **Last Amended**: 2026-10-18
