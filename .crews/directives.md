# Project Directives

Injected into every crew agent on every run. Keep concise.

## Project

A visual drag-and-drop editor that generates Mermaid source. Flowcharts only to start.
Language is TypeScript (strict mode; `any` is a lint error). Stack: React 19, React Router v8 as a
client-only SPA, Vite, Vitest (unit), Playwright (browser, in `e2e/`). The deliverable is a
browser web app with no server component. The model, validation, generation and history layers are
pure TypeScript with no DOM access, so they can be tested without a browser.
The product brief and the 17 acceptance criteria (AC1–AC17) are in `setup.md`. The
visual model is the source of truth; generated Mermaid is read-only output.

## Where the crew sits in the Spec Kit workflow

Spec Kit owns the lifecycle. The crew runs only the implementation and review stages.

| Stage | Who | How |
|-------|-----|-----|
| constitution, specify, clarify, grill, plan, tasks, analyze | The human Business Analyst, in an interactive Claude Code session | `/speckit-*` skills |
| Pre-implementation review (spec, plan, tasks) | Crew, parallel, read-only | `scripts/crew.sh review` |
| Implementation of `tasks.md` | Crew, sequential retry loop | `scripts/crew.sh implement "<scope>"` |

Crew agents must never run or emulate `specify`, `clarify`, the grill, `plan`, `tasks` or
`analyze`, never create or switch feature directories, and never edit `spec.md`. The grill
and clarifications need the human. If the spec is ambiguous or contradicts itself, stop and
report it under `## Open Questions`; do not pick an interpretation.

## Source of truth, in order

1. `setup.md` acceptance criteria and business rules
2. `specs/<feature>/spec.md` (including Clarifications)
3. `.specify/memory/constitution.md`
4. `specs/<feature>/plan.md`, `tasks.md`, `tests/behaviour-checklist.md`
5. `.crews/decisions.md`

A lower item never overrides a higher one. If the plan contradicts the spec, the plan is
wrong.

## Integrated TDD (enforced by a hook, not optional)

- Read `.specify/extensions/integrated-tdd/templates/tdd-process-rules.md` before touching a task.
- Work Red, Green, Refactor. The failing test is written and run before the behaviour it verifies.
- Run tests only through `python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py run ...`
  so the run is recorded. Never hand-edit `tests/tdd-evidence.md` or `tdd-evidence.md`.
- A task is marked `[X]` in `tasks.md` only after its gate passes. The edit is refused otherwise;
  do not work around it with shell edits.
- Never weaken, skip or delete a test to get a pass. Changing a behaviour item needs a recorded
  expectation change (see the rules) and the Business Analyst's approval.
- Do not choose or install a test framework, linter or build tool that the plan does not name.
- `npm run typecheck` and `npm run lint` must pass before a task is marked `[X]`. A hook lints every
  file you write and reports failures; fix them, never silence a rule with a disable comment unless
  you state the reason in the same comment.
- Unit tests live beside the code they test and run under Vitest. Browser tests live in `e2e/` and run
  under Playwright. Prefer unit tests for the pure layers; use Playwright only for behaviour that needs a browser.

## Architecture (from the brief; the plan decides the rest)

Keep these separate, with no import from a later one back into an earlier one:

1. visual diagram model (pure data, no DOM, no Mermaid text)
2. validation (decides whether an operation may be committed)
3. Mermaid generation (pure function of the model; escapes labels)
4. rendering
5. editing history (undo/redo of committed operations)

Never parse or store Mermaid text as editable state. Never let an invalid operation leave a
partial change behind. Deleting a node must not create new edges between its neighbours.
Cycles, fan-in/fan-out and disconnected nodes are valid.

## Boundaries

- Crew agents (run by `scripts/crew.sh`) do not run `git commit`, `git push`, `git checkout -b` or open PRs. In an interactive session, commit and push only when the user asks.
- Do not edit `.specify/`, `.crews/`, `.claude/`, `tools/` or `setup.md`.
- Do not add dependencies the plan does not list.
- Stay inside the scope named in the task description; do not refactor outside it.
- Code comments: only where the reason is not obvious. Match the surrounding style.

## Output conventions

- Reviewers (`tech-lead`, `business-analyst`) end with exactly one line:
  `Verdict: Ready to merge` or `Verdict: Needs fixes`, and put blocking items under `## Critical Issues`.
- Anything needing a human decision goes under `## Open Questions`, and is never a silent assumption.
