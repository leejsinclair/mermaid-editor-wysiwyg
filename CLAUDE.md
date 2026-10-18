# Mermaid Editor (WYSIWYG)

Visual drag-and-drop editor, written in strict TypeScript on React 19 and React Router v8 (client-only SPA, Vite), delivered as a browser web app, that generates read-only Mermaid flowchart source. The brief, business
rules and acceptance criteria AC1–AC17 are in `setup.md`.

## Workflow (Spec Kit + extensions + crew)

Interactive session, with the human Business Analyst present:
`/speckit-constitution` (once) → `/speckit-specify` (the grill starts automatically afterwards;
`.specify/extensions/grill-specify/grill-specify-config.yml`) → `/speckit-clarify` if needed →
`/speckit-plan` → `/speckit-tasks` → `/speckit-analyze`.

Then the crew (technical lead, developer, QA, business analyst; defined in `.crews/`):

    scripts/crew.sh review                       # read-only pre-implementation review
    scripts/crew.sh implement "<scope>"          # qa -> developer -> tech-lead -> business-analyst, up to 3 rounds
    CREWS_MOCK=true scripts/crew.sh ...          # dry run, no Claude calls

Or run `/speckit-implement` directly in a session. Either way, the integrated-TDD hook gates every
`[X]` in `tasks.md`.

Spec viewer and kanban: `python3 tools/specview.py` (browse `specs/`, board at `/specs/<story>/kanban`).
The micro-kanban mod shows progress above the prompt during `/speckit-implement`.

## Commands

- `npm run dev`, `npm run build`, `npm run typecheck`
- `npm test` (Vitest, pure layers), `npm run test:e2e` (Playwright, Chromium)
- `npm run lint` (ESLint with security and sonarjs, Stylelint, HTMLHint, markdownlint, Mermaid syntax)

A `PostToolUse` hook (`scripts/hooks/lint-edited.sh`) lints each edited file and returns failures to the agent.

## Rules for any agent

- Crew rules live in `.crews/directives.md` and apply here too.
- Run tests only via `tdd_check.py run`; never hand-edit evidence files.
- The human commits and pushes.
