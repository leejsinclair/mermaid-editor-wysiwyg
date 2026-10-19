---

description: "Task list for publishing the editor as a GitHub Page"
---

# Tasks: Publish the Editor as a GitHub Page

**Input**: Design documents from `/specs/003-github-pages-publish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (addresses, publish-workflow), quickstart.md, tests/behaviour-checklist.md

**Tests**: Required. Every obligation in the plan's Verification Plan (VO-001 to VO-009) has a test task placed before the task that delivers its behaviour. Manual checks MV-001 to MV-005 are recorded by a person after the first publish, with `tdd_check.py manual`, never by the agent.

**Organization**: US1 (P1) carries the app changes (hash addresses, relative build). US2 (P2) and US3 (P3) carry the workflow and the README. Because the app change touches every existing browser test, US1 writes its failing tests first, records Red, and only then migrates.

## Format: `[ID] [P?] [Story] [Label] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to
- **[Label]**: `[VO-nnn]` or `[NT: reason]` (see "Verification labels" at the end)

## Path Conventions

- Single client-only project: source in `app/`, browser tests in `e2e/` (plan, Project Structure)
- Runs are recorded only through `python3 .specify/extensions/integrated-tdd/scripts/python/tdd_check.py run --command <unit|unit-all|e2e|e2e-all> ...`
- Tests open views as `page.goto("#/new/flowchart")`, with a leading `#` and no leading `/`, so a base URL that carries a path is kept (research R7)

---

## Phase 1: Setup

**Purpose**: Dependency named by the plan. No behaviour.

- [X] T001 [NT: dependency declaration only] Add `@vitejs/plugin-react` to `devDependencies` in package.json and run `npm install`; remove `@react-router/dev` and `isbot` in task T012, not here, so the app still builds until it is migrated (plan, Technical Context)

---

## Phase 2: Foundational

**Purpose**: Record the baseline before any behaviour changes.

- [X] T002 [NT: baseline run only] Record a `baseline` run of `unit-all` and `e2e-all` through `tdd_check.py run --phase baseline`, naming any test already failing in `--note`

**Checkpoint**: Baseline recorded.

---

## Phase 3: User Story 1 - Anyone can open the editor from a public web address (Priority: P1) 🎯 MVP

**Goal**: The built app works from any folder of a host that serves only real files: views are named after `#`, files are referred to relatively, reload and new tabs show the same view.

**Independent Test**: Build, serve `build/client` under `/mermaid-editor-wysiwyg/` with a server that answers 404 for non-files, load the page, create a diagram, reload.

### Tests for User Story 1 (Red first)

- [X] T003 [P] [US1] [VO-001] Write the failing test e2e/hash-addresses.spec.ts: `#/` shows the start screen; `#/new/flowchart` opens a new flowchart; after the first save the address ends `#/d/<id>`; reloading and opening that address in a new page show the same diagram; the part before `#` never changes (contracts/addresses.md). Run `--phase red` with `--expect` naming the address assertion
- [X] T004 [P] [US1] [VO-004] Change every address in the existing e2e specs to the `#/…` form, changing no other assertion: `page.goto("/new/flowchart")` becomes `page.goto("#/new/flowchart")`, a bare `page.goto("/")` becomes `page.goto("#/")` (a leading `/` would drop a base-URL sub-path, research R7), `toHaveURL(/\/d\/[\w-]+$/)` becomes `toHaveURL(/#\/d\/[\w-]+$/)` and `toHaveURL(/\/$/)` becomes `toHaveURL(/#\/$/)`. A `goto` that only changes the part after `#` does not reload the page, so wherever a spec calls `goto` a second time and relies on a fresh load (module state reset), follow it with `page.reload()`; check at least `storage-failure`, `lock-release`, `two-tabs`, `reopen`, `leave-page` and `unsaved-new`, and name each spec changed this way in the final report. The address style is visible behaviour (FR-015), so record the change with `tdd_check.py expectation --alters-behaviour` once the Red run names the test files, explain it to the developer, and record `approve --id <XC-nn> --by "<name>"` only after the developer approves in the conversation. Run a representative subset (`flowchart-add`, `open-file`, `c4-move-to`, `two-tabs`) with `--phase red`
- [X] T005 [P] [US1] [VO-003] Change e2e/static-offline.spec.ts to build with Vite (`node_modules/vite/bin/vite.js build`) instead of the React Router CLI, to open `${origin}/` with `#/` addresses, and to assert `toHaveURL(/#\/d\/[\w-]+$/)`; keep the static-file, no-foreign-request and offline assertions; run `--phase red`
- [X] T006 [P] [US1] [VO-002] Write the failing test e2e/published-build.spec.ts: build with Vite once (Chromium run only); serve `build/client` from a Node server at the prefix `/mermaid-editor-wysiwyg/` and, in a second test, at `/`; answer 404 for any path that is not a file and no fallback page; record every response and console error; load the page, create a diagram, open its `#/d/<id>` address in a new page and reload; expect every own-file response 2xx, no console error, the editor visible each time. Run `--phase red`

### Implementation for User Story 1

- [X] T007 [US1] [VO-001] Create index.html at the repository root (title from the start screen heading, viewport meta, `<div id="root">`, `<script type="module" src="/app/main.tsx">`) and app/main.tsx that mounts `RouterProvider` with `createHashRouter` over the table in app/routes.tsx inside the root layout; no `Scripts`, `Meta`, `Links` or `ScrollRestoration`
- [X] T008 [US1] [VO-001] Replace app/routes.ts with app/routes.tsx: route objects for `/`, `/new/c4/:kind`, `/new/:type` and `/d/:id` pointing at the unchanged modules app/routes/start.tsx and app/routes/editor.tsx, under the root element; unknown paths render the start screen through a `*` route that redirects to `/` (DC-02)
- [X] T009 [US1] [VO-001] Edit app/root.tsx: remove `Layout`, the `react-router` imports of `Links`, `Meta`, `Scripts`, `ScrollRestoration`, and keep the theme, `GlobalStyles`, `CssBaseline` and `Outlet`; turn `HydrateFallback` into a loading element passed to the router
- [X] T010 [US1] [VO-002] [VO-003] Replace vite.config.ts with plain Vite: `@vitejs/plugin-react`, `base: "./"`, `build.outDir: "build/client"`, `build.emptyOutDir: true`; keep the `server.hmr.overlay: false` setting and its comment (DC-01, research R1–R4)
- [X] T011 [US1] [VO-001] [VO-004] Update package.json scripts: `dev` is `vite`, `build` is `vite build`, add `preview` as `vite preview --outDir build/client`, `typecheck` is `tsc --noEmit`; update playwright.config.ts `webServer.command` to `npm run dev -- --port 5173` (unchanged text, now Vite) and make `baseURL` and the web server follow an optional `E2E_BASE_URL` (no web server when it is set), documented in a comment
- [X] T012 [US1] [VO-001] [VO-004] Delete react-router.config.ts, remove `.react-router` from tsconfig.json `include` and `rootDirs`, remove `@react-router/dev` and `isbot` from package.json and run `npm install`; leave the `.react-router` ignore entries alone (harmless)
- [X] T013 [US1] [VO-001] [VO-002] [VO-003] [VO-004] Run `unit-all`, `typecheck`, then `e2e` for T003, T005 and T006 with `--phase green`, then `e2e-all` as `checkpoint`; fix only application wiring for any failure, never a test (test integrity); classify any failure
- [X] T014 [US1] [NT: lint of changed files] Run `npm run lint` and fix findings in the changed files (the layer rules still name `react-router` and `**/routes/**`, which stay valid)

**Checkpoint**: The app runs and builds with hash addresses and relative URLs; US1 is verifiable by `npm run build && npm run preview`.

---

## Phase 4: User Story 2 - Publishing happens automatically from the main branch (Priority: P2)

**Goal**: A merge into `main` deploys only after the checks pass; other branches never deploy.

**Independent Test**: Read `.github/workflows/pages.yml` against contracts/publish-workflow.md.

### Tests and implementation for User Story 2

- [X] T015 [P] [US2] [NT: shared test helper] Create e2e/support/workflow.ts exporting `readWorkflow()` (the text of `.github/workflows/pages.yml`) and `jobBlock(text, name)` (the lines of one top-level job), using string operations only and no YAML library
- [X] T016 [US2] [VO-005] Write the failing test e2e/publish-triggers.spec.ts: the `on:` block lists `push` with branch `main` and `workflow_dispatch` and nothing else; the `deploy` job carries `if: github.ref == 'refs/heads/main'`. Run `--phase red`
- [X] T017 [US2] [VO-005] Create .github/workflows/pages.yml with name `Publish`, the two triggers, empty-shell `check` and `deploy` jobs on `ubuntu-latest`, and the `deploy` guard; run `--phase green`
- [X] T018 [US2] [VO-006] Write the failing test e2e/publish-gate.spec.ts: `deploy` lists `check` in `needs`; `check` contains steps running `npm ci`, `npm run typecheck`, `npm test`, `npm run test:e2e` and a Playwright install naming `chromium` and `firefox`; the e2e step carries `--grep-invert "within a second"` (leaves out the timing test in e2e/performance.spec.ts, which must keep that phrase in its title); the text contains no `continue-on-error`. Run `--phase red`
- [X] T019 [US2] [VO-006] Fill the `check` job (checkout, setup-node 24 with npm cache, the five steps above, the e2e step passing `--grep-invert "within a second"`) and add `needs: check` to `deploy`; run `--phase green`
- [X] T020 [US2] [VO-007] Write the failing test e2e/publish-supersede.spec.ts: a top-level `concurrency` group with `cancel-in-progress: true`; `deploy` uploads one artifact from `build/client` with the Pages upload action. Run `--phase red`
- [X] T021 [US2] [VO-007] Add the `concurrency` block and give `deploy` its own checkout, setup-node, `npm ci` and `npm run build` steps followed by the Pages upload step with path `build/client`, so the deployed files are built from the revision that passed `check`; run `--phase green`
- [X] T022 [US2] [VO-008] Write the failing test e2e/publish-fail-visible.spec.ts: `deploy` runs the Pages configure action before the upload and deploy actions; permissions `pages: write` and `id-token: write` on `deploy` only, `contents: read` elsewhere; environment `github-pages` with `url` taken from the deploy step output. Run `--phase red`
- [X] T023 [US2] [VO-008] Add the configure, deploy steps, permissions and environment to `deploy`; run `--phase green`, then `e2e` for the four publish specs as `refactor`
- [X] T024 [US2] [NT: record manual checks for later] Add to the final report that MV-002 and MV-003 await a real merge and a real failing run, with the commands for a person to record results (`tdd_check.py manual --check MV-002 --result <pass|fail> --by "<name>"`)

**Checkpoint**: The workflow matches the contract. Nothing deploys until the editor work is merged into `main` (spec dependency).

---

## Phase 5: User Story 3 - Maintainer can publish on demand and see what is live (Priority: P3)

**Goal**: A manual start is available and the README names the address and how publishing works.

**Independent Test**: Read README.md.

- [X] T025 [US3] [VO-009] Write the failing test e2e/readme.spec.ts: README.md contains `https://leejsinclair.github.io/mermaid-editor-wysiwyg/`, mentions `main` and "Run workflow", and gives `npm run build` and `npm run preview` for the local production check. Run `--phase red`
- [X] T026 [US3] [VO-009] Create README.md: what the project is (one paragraph), the public address, how publishing works (merge to `main`, the checks, manual start from the Actions tab), the one-time Pages setting and visibility requirement, and the local production check (quickstart.md); markdownlint-clean. Run `--phase green`

**Checkpoint**: All obligations have a green run.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T027 [NT: documentation only] Update CLAUDE.md Commands: add `npm run preview`, note the hash-address convention for tests, and replace "React Router v8 (client-only SPA, Vite)" wording so it says React Router v8 in data mode with a hash router
- [X] T028 [NT: lint and type check gate] Run `npm run lint`, `npm run typecheck` and `unit-all` and `e2e-all` as `checkpoint`; report any file in the existing tests changed (T004, T005) with its reason
- [X] T029 [NT: manual checks await the first publish] Report MV-001 to MV-005 as open manual checks, with the steps from plan.md; a person records each result. Also remind the maintainer of the one-time steps no task performs: make the repository public (or use a plan that allows Pages) and set Settings → Pages → Source to GitHub Actions

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 → Phase 2 → Phase 3. Phases 4 and 5 touch only new files and can start after T002; T013 should finish first so the check job's commands exist.
- Within Phase 3: T003–T006 (Red) → T007–T012 (migration) → T013 (Green and checkpoint) → T014.
- Within Phase 4: each test task precedes its behaviour task; T015 precedes T016.

### Parallel Opportunities

- T003, T004, T005, T006 touch different files.
- T025–T026 are independent of Phase 4.

## Implementation Strategy

### MVP First (User Story 1)

1. Phases 1–2, then Phase 3, then stop and run `npm run build && npm run preview`.
2. Add the workflow (Phase 4) and README (Phase 5) in any order.
3. After the editor work is merged into `main`, the first publish runs; then record the manual checks.

---

## Verification labels

<!--
  Added by the Integrated TDD preset. These conventions apply to every task above.
  Keep this section in the generated tasks.md so a reviewer can read the labels.
-->

Every task carries a verification label, placed after the story label and before the
description. The rest of the task line is unchanged.

| Label | Meaning |
|-------|---------|
| `[VO-nnn]` | The task satisfies this obligation from the plan's Verification Plan. Repeat the label for several obligations |
| `[NT: reason]` | The task has no behaviour to verify. The reason is required |

```markdown
- [ ] T011 [P] [US1] [VO-001] Write the failing test for an empty cart total in tests/test_cart.py
- [ ] T012 [US1] [VO-001] Implement the cart total in src/cart.py
- [ ] T013 [US1] [NT: README wording only] Document the cart total in README.md
```

A task's kind follows from its labels and its position in this file:

| Kind | Rule |
|------|------|
| `no-test` | Carries `[NT: reason]` and no `[VO-nnn]` |
| `test` | The first task in the file to name a given obligation |
| `behaviour` | Any later task naming that obligation |

- Test tasks are required for every task that delivers behaviour. They are not optional.
- When the feature has a behaviour checklist, each obligation a test task names must be
  named by a behaviour item, so that the test traces to a planned behaviour.
- Every obligation needs a `test` task and at least one `behaviour` task, so it is named
  by at least two tasks.
- The first task to name an obligation is its test task whatever its description says, so
  the test task must be written first: the task that writes the failing test comes before
  the task that implements the behaviour.
- A task naming several obligations is a `test` task only when it is the first to name
  all of them.
