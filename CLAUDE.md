# Mermaid Editor (WYSIWYG)

Visual drag-and-drop editor, written in strict TypeScript on React 19 and React Router v8 (client-only SPA in data mode with a hash router, plain Vite), delivered as a browser web app and published to GitHub Pages from `main`, that generates read-only Mermaid flowchart source. The brief, business
rules and acceptance criteria AC1–AC17 are in `setup.md`.

## Workflow (Spec Kit + extensions)

Interactive session, with the human Business Analyst present:
`/speckit-constitution` (once) → `/speckit-specify` (the grill starts automatically afterwards;
`.specify/extensions/grill-specify/grill-specify-config.yml`) → `/speckit-clarify` if needed →
`/speckit-plan` → `/speckit-tasks` → `/speckit-analyze`.

Run `/speckit-implement` in a session. The integrated-TDD hook gates every `[X]` in `tasks.md`.

Spec viewer and kanban: `python3 tools/specview.py` (browse `specs/`, board at `/specs/<story>/kanban`).
The micro-kanban mod shows progress above the prompt during `/speckit-implement`.

## Commands

- `npm run dev`, `npm run build`, `npm run preview` (serves the production build in `build/client`), `npm run typecheck`
- In-app addresses are hash-style (`#/d/<id>`), so e2e tests open views as `page.goto("#/new/flowchart")` with no leading `/`
- `npm test` (Vitest, pure layers), `npm run test:e2e` (Playwright: desktop Chromium, and an emulated Android phone for the touch suite)
- `npm run lint` (ESLint with security and sonarjs, Stylelint, HTMLHint, markdownlint, Mermaid syntax)

A `PostToolUse` hook (`scripts/hooks/lint-edited.sh`) lints each edited file and returns failures to the agent.

## Rules for any agent

- Run tests only via `tdd_check.py run`; never hand-edit evidence files.
- Commit and push only when the user asks.
