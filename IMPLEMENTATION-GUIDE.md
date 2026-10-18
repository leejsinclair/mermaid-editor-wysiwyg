# Implementation guide

Steps for you, the Business Analyst, to take the project from set-up to a working editor.
Interactive steps (you answer questions) are marked **[you]**. Crew steps run unattended and are marked **[crew]**.

Everything is run from the project root, `/home/lee/projects/mermaid-editor-wysiwyg`.

## 0. Before you start (once)

1. Restart Claude Code in this directory so the Spec Kit skills, the TDD hook and the micro-kanban mod load.
   Confirm with `/help` that `/speckit-*` skills are listed, and check `.claude/settings.json` still has the `PreToolUse` hook.
2. Make an initial commit so you can see what each step changes:
   `git add -A && git commit -m "Project set-up"`
3. Optional: start the spec viewer in a second terminal: `python3 tools/specview.py` (the printed URL, usually <http://localhost:8000>).
   It needs internet access to jsDelivr to draw Mermaid diagrams.

## 0b. Tooling already installed

| Concern | Tool | Config |
|---|---|---|
| Framework | React 19, React Router v8 (SPA), Vite | `react-router.config.ts`, `vite.config.ts` |
| Types | TypeScript 6.0, strict plus `noUncheckedIndexedAccess` | `tsconfig.json` |
| JS/TS lint | ESLint 9: typescript-eslint strict, react, react-hooks, jsx-a11y, security, sonarjs | `eslint.config.js` |
| CSS, HTML, Markdown lint | Stylelint, HTMLHint, markdownlint-cli2 | `stylelint.config.js`, `.htmlhintrc`, `.markdownlint-cli2.jsonc` |
| Mermaid lint | Mermaid's own parser, via `scripts/lint-mermaid.mjs` (`.mmd` files and fenced blocks in `.md`) | |
| Unit tests | Vitest | none yet |
| Browser tests | Playwright, Chromium only | `playwright.config.ts`, tests in `e2e/` |

Pinned deliberately: ESLint 9 (the react and jsx-a11y plugins do not support 10 yet) and TypeScript 6.0 (typescript-eslint does not support 7 yet).
Revisit those pins when the plugins catch up.

**Lint hook.** `scripts/hooks/lint-edited.sh` runs after every Edit, Write or MultiEdit (registered in `.claude/settings.json`).
It lints the file just written with the right tool and, on failure, returns the output to the agent to fix.
This applies to your session and to the crew's agents. Markdown in `specs/` and `setup.md` skip markdownlint, but their Mermaid blocks are still validated.
`npm run lint` runs every linter over the whole project.

## 1. Constitution **[you]**

Run `/speckit-constitution`. It is still the empty template, and the crew's directives point at it.

Give it the decisions that are not in `setup.md`, in particular:

- **Fixed already**: the language is **TypeScript** (strict mode) and the deliverable is a **web app** that runs in the browser.
  The stack has been chosen and its tooling installed (step 0b), so record it rather than re-deciding it.
  State both in the constitution, and add: no server-side component is needed, because persistence and export are out of scope.
- **Chosen and installed**: React 19 with **React Router v8** in framework mode as a client-only SPA (`ssr: false`, Vite-based), **Vitest** for the pure layers and **Playwright** (Chromium) for drag-and-drop, selection and Copy Source.
  The TDD extension will not choose a test framework for you, so name them in the constitution. Their commands are already in `package.json`: `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`.
- **Still to choose, in the plan**: the canvas approach. React Flow (`@xyflow/react`) is the obvious candidate for a node-and-edge editor; weigh it against hand-rolled SVG and record the decision.
- **Browser support**: say which browsers count as supported, because the Definition of Done requires Copy Source to work in them (the async clipboard API needs a secure context: localhost or HTTPS).
- **Test and lint commands**: for example the unit test runner and the type checker. The plan reads these from the project's own scripts.
- **Mermaid library** used for rendering and for validating generated output against the grammar (Definition of Done).
- **Principles from `setup.md`**: visual model is the source of truth, strict separation of model / validation / generation / rendering / history, no partial state after a rejected operation, tests first.

Commit afterwards.

The tooling is installed but there is no application source yet. The first phase of tasks creates `app/` (`root.tsx`, `routes.ts`, the first route) so that `npm run dev`, `npm run typecheck` and `npm run build` work. `npm run dev` and Playwright's web server will fail until then. The plan has to say so; otherwise the TDD plan check reports "no runnable test command".

## 2. Specify and grill **[you]**

1. Run `/speckit-specify` and paste the whole brief from `setup.md` (purpose, scope, business rules, AC1–AC17, definition of done).
   This creates the `NNN-name` branch and `specs/NNN-name/spec.md`.
2. The grill starts automatically straight after. Answer its questions; it saves settled terms and decisions to the knowledge docs.
   - To stop early, say so. The spec is labelled `(stopped early, N points open)`; resume with `/speckit-grill-specify-with-docs`.
   - To make it mandatory, set `grill: "strict"` in `.specify/extensions/grill-specify/grill-specify-config.yml`.
3. Optional: `/speckit-clarify` for anything left ambiguous.
4. Read `spec.md` against `setup.md`. Fix any lost acceptance criteria now, since later steps treat the spec as the source of truth.

Commit.

## 3. Plan **[you]**

Run `/speckit-plan`. Besides the design artifacts it writes:

- a **Verification Plan** (test commands, one verification obligation `VO-nnn` per requirement and scenario, exemptions with reasons), and
- `tests/behaviour-checklist.md` (one behaviour item per observable behaviour).

Review both. Compare each scenario's quote against `setup.md` (`python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py status --scenarios`).
Correct the spec or the Verification Plan first, then the checklist. Ambiguities the plan raises are yours to answer. Do not let it guess.

Check that the plan keeps the five layers separate (model, validation, Mermaid generation, rendering, history) and puts the project scaffold in the first phase.

## 4. Tasks and analysis **[you]**

1. `/speckit-tasks` produces `tasks.md` with test tasks ahead of the behaviour they verify, each labelled `[VO-nnn]` or `[NT: reason]`.
2. `/speckit-analyze` is a read-only consistency report across spec, plan and tasks. Fix every finding, then re-run it until clean (fix in the spec or plan, then regenerate tasks, not by editing `tasks.md` by hand).

Commit.

## 5. Pre-implementation review **[crew]**

```bash
scripts/crew.sh review
```

The business-analyst and tech-lead agents review spec, plan and tasks in parallel (read-only). Their reports and an aggregate are in `.crews/output/review-<feature>/`.
Act on anything critical. Answer every `## Open Questions` item in the spec's Clarifications through `/speckit-clarify`, not by editing the file.

## 6. Implement, one phase at a time

Work phase by phase, as the phases appear in `tasks.md`. Start with scaffolding and the visual model, then generation, then the rest.

Either route works, and the TDD hook gates `[X]` marks in both:

**A. Crew [crew]**

```bash
scripts/crew.sh implement "Phase 1: Setup"
```

Runs qa, developer, tech-lead and business-analyst in sequence, with up to 3 rounds, until both reviewers say `Verdict: Ready to merge`.
The micro-kanban bar will not show here (it is for `/speckit-implement` only); use the viewer's board instead: <http://localhost:8000/specs/002-visual-diagram-editor/kanban>
(start the viewer first with `python3 tools/specview.py`; if port 8000 is taken it uses the next free port up to 8019, so use the URL it prints).
Add `CREWS_MOCK=true` to dry-run.

**B. Interactive [you]**

```text
/speckit-implement
```

Runs all tasks through Red, Green, Refactor with the micro-kanban above the prompt.
Use this for risky phases (undo/redo, delete semantics, label escaping) so you can watch.

After each phase:

1. Read `tests/tdd-evidence.md` (or run `tdd_check.py status`). Every behaviour needs a failing run then a passing run.
2. Read the crew's reports in `.crews/output/implement-<feature>/round-N/`, in particular `## Critical Issues`, `## Open Questions` and any `## New Decisions` (appended to `.crews/decisions.md`).
3. Run the app and exercise the acceptance criteria by hand.
4. Commit. The crew never commits.

If a crew run stops with "max rounds exhausted", read the last tech-lead and business-analyst output, fix the cause (spec, plan or task), and re-run with a narrower scope.

## 7. Close out **[you]**

1. `/speckit-converge` compares the finished code with the spec, plan and tasks and appends any unbuilt work to `tasks.md`. Run it, then implement what it adds (step 6).
2. Walk through AC1–AC17 in `setup.md` against the running editor, then check the Definition of Done:
   - Mermaid generation and label escaping covered by automated tests
   - generated output validated against the flowchart grammar
   - Copy Source works and reports failure correctly
   - undo/redo covers every committed operation
   - view, render and source stay consistent
3. Run `python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py status` and confirm nothing is `deferred`, `manual (open)` or exempt without a reason you accept.
4. Final commit, then push or open a PR yourself.

## Things to watch

- **Never hand-edit** `tests/tdd-evidence.md`, and don't edit `tasks.md` from a shell to tick tasks. The hook can't see shell edits, and the compliance check will flag them.
- **Don't weaken a test** to get a pass. A changed behaviour item needs a recorded expectation change and your approval.
- **Crew agents don't ask you questions.** Anything they cannot decide appears under `## Open Questions`; check for it after every run.
- **Fresh feature, fresh crew run.** `scripts/crew.sh` reads `.specify/feature.json`, which `/speckit-specify` sets. If you switch features, check it points where you expect.
- **Later diagram types** (sequence, class, and so on) are new features: repeat steps 2–7, and define their elements, rules and tests first, as `setup.md` requires.
- The generated task files (`tasks/`) and crew output (`.crews/output/`) are git-ignored.
