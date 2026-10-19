# Implementation Plan: Publish the Editor as a GitHub Page

**Branch**: `003-github-pages-publish` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-github-pages-publish/spec.md`

## Summary

The editor is already a client-only app that builds to static files. This feature publishes that build to GitHub
Pages from `main`, through a hosted workflow that first runs type checking, unit tests and the end-to-end tests in
Chromium and Firefox, and only then deploys. GitHub Pages serves real files only and the site lives under a
repository sub-path, so two things change in the app itself: in-app addresses become hash-style (`/#/d/abc`, spec
FR-015) and the build uses relative asset URLs, so one build works at any path. React Router's framework mode has no
hash-address option, so the app moves to its data mode (`createHashRouter`) on plain Vite; the route components and
everything under them are untouched. The existing end-to-end tests change address style once; a new test serves the
build under a sub-path and checks load, requests and reload. Details: [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript ~6.0, strict, ES2022 (unchanged); workflow runs on Node 24

**Primary Dependencies**: Existing: React 19, `react-router` 8.4 (now used in data mode), Vite 8, `mermaid`, `@xyflow/react`, `@mui/material`. New dev: `@vitejs/plugin-react` (keeps dev refresh once the React Router plugin is gone). Removed: `@react-router/dev`, `isbot` (only the framework build and its server stub used them). Workflow actions: `actions/checkout`, `actions/setup-node`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`

**Storage**: Unchanged (IndexedDB and user-held files, per origin). No new storage

**Testing**: Vitest (`npm test`) and Playwright (`npm run test:e2e`; Chromium and Firefox), both existing

**Target Platform**: GitHub Pages project site `https://leejsinclair.github.io/mermaid-editor-wysiwyg/`; browsers as feature 002

**Project Type**: Web application, client-only single-page app, static files only

**Performance Goals**: Merged change live within 10 minutes (SC-003); first load under 5 seconds on broadband (SC-001)

**Constraints**: No server component (FR-002); no network request after load (feature 002 FR-021); every request for the site's own files succeeds at the sub-path (SC-004); site never partly updated (FR-010)

**Scale/Scope**: One workflow file, one app entry point, one config change, one new README, about 45 end-to-end test files changed only in their address strings

## Constitution Check

*GATE: must pass before research; re-checked after design.*

| Principle or constraint | Status | How the plan meets it |
|-------------------------|--------|-----------------------|
| I. Visual model is the source of truth | Pass | No change to model, generation or storage; only the routing wiring and the build change |
| II. Layered architecture | Pass | No layer touched; `routes` and the new entry point stay in the UI composition layer, which no pure layer imports |
| III. Test-first | Pass | Verification Plan below; address change and sub-path load have failing-first tests before the routing change |
| IV. Invalid operations never corrupt | Pass | Not affected |
| V. Honest feedback | Pass | A failed publish is shown as a failed workflow run; a deploy step reports success only after Pages accepts the artifact |
| Technology: TypeScript strict, browser web app, no server | Pass | Static files only; the build's server stub is no longer produced |
| Technology: persistence local only | Pass | The site collects nothing (FR-012); verified by the existing no-request test run on the built output |
| Technology: dependencies named by the plan | Pass | New and removed packages are named above; nothing else |
| Excluded features | Pass | No export, collaboration, cloud storage or sync |
| Workflow: ambiguity raised, not assumed | Pass | Four questions settled in the grill; no open point blocks |

Post-design re-check: unchanged, all Pass. No Complexity Tracking entry is needed.

### Design constraints

- **DC-01** The build refers to its own files by relative URLs, so the same build works at the domain root, at
  `/mermaid-editor-wysiwyg/` and in any other folder, with no site-name setting.
- **DC-02** Only the way routes are wired changes. The route components, the editor and every layer below keep their
  code; they still navigate with the same relative targets (`/d/<id>`, `/new/<type>`, `/`), which the hash router
  turns into `#/…` addresses.
- **DC-03** The deploy step runs only after the check step succeeds, and only for `main`.

### Open points for the Business Analyst (not blocking)

- Repository Pages must be set to "GitHub Actions" as the source, once, by the maintainer (spec assumption).
- The repository must be public, or on a plan that allows Pages from a private repository.
- Old path-style links (`/d/abc`) were never published and are unsupported (EC-03).

## Project Structure

### Documentation (this feature)

```text
specs/003-github-pages-publish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── addresses.md
│   └── publish-workflow.md
├── tests/behaviour-checklist.md
└── tasks.md             # /speckit-tasks, not created here
```

### Source Code (repository root)

```text
index.html                          # new: page shell that the framework build used to generate
app/main.tsx                        # new: creates the hash router and mounts the app
app/routes.tsx                      # replaces routes.ts: route table for the hash router
app/root.tsx                        # Layout/Meta/Links/Scripts removed; theme and Outlet kept
app/routes/{start,editor}.tsx       # unchanged
vite.config.ts                      # plain Vite: React plugin, relative base, output to build/client
react-router.config.ts              # removed
tsconfig.json                       # drop generated-types entries
package.json                        # scripts: dev, build, preview, typecheck; dependency changes
playwright.config.ts                # optional E2E_BASE_URL to run the suite against a live address
e2e/*.spec.ts                       # addresses written as '#/…'; two specs build with Vite
e2e/published-build.spec.ts         # new: sub-path serve, requests, reload
e2e/publish-*.spec.ts, readme.spec.ts # new: read the workflow and README as text, no browser page
.github/workflows/pages.yml         # new: check then deploy
README.md                           # new: address, publishing, local check of the published build
```

**Structure Decision**: Keep the single-project layout. The workflow is the only new directory. The workflow's
rules are checked by a Playwright spec that reads files (no page), because the Vitest include is limited to the pure
layers under `app/` and the e2e folder already holds the build-output checks.

## Complexity Tracking

No violations to justify.

## Verification Plan

### Verification commands

| ID | Command | Scope | Source |
|----|---------|-------|--------|
| unit | `npm test -- {select}` | focused | package.json script `test` (Vitest) |
| unit-all | `npm test` | broad | package.json script `test` (Vitest) |
| e2e | `npm run test:e2e -- {select}` | focused | package.json script `test:e2e` (Playwright) |
| e2e-all | `npm run test:e2e` | broad | package.json script `test:e2e` (Playwright) |

### Verification obligations

| ID | Requirements | Scenario | Expected outcome | Level | Origin |
|----|--------------|----------|------------------|-------|--------|
| VO-001 | FR-015, US1-AS3, EC-02 | Create a diagram, then reload the page and open the saved view's address in a new tab; also open the start screen and a new-diagram address directly | The saved view's address shows the view after `#`; reload and new tab show the same diagram; the start screen and new-diagram addresses open their views; no hosting error page appears | end-to-end | planned |
| VO-002 | FR-004, FR-005, FR-014, US1-AS1, US1-AS3, EC-01, DC-01 | The built output is served from a sub-folder (`/mermaid-editor-wysiwyg/`) and from the root; a visitor loads the page, opens a saved diagram's address and reloads it | Every request for the site's own files is answered successfully, the console shows no error, the editor appears, and the reload shows the same view, in both locations | end-to-end | planned |
| VO-003 | FR-002, FR-012, FR-003 | A full session in each diagram type is run from the built files with the network cut after load | The build holds only static files, no request leaves the page's own origin, and the session's results match those of the local app | end-to-end | planned |
| VO-004 | FR-003, FR-004, US1-AS2, DC-02 | The complete existing end-to-end and unit suites run in the local app at the domain root, with addresses in the new style | Every existing behaviour still passes; no test was removed, skipped or weakened | end-to-end | planned |
| VO-005 | FR-006, FR-008, FR-009, US2-AS3, US3-AS1 | The workflow definition is read | It starts on a push to `main` and on a manual start only; the deploy step is limited to `main`, so no other branch can change the live site | contract | planned |
| VO-006 | FR-007, US2-AS2, DC-03 | The workflow definition is read | The deploy step depends on a check step that runs type checking, unit tests and the end-to-end tests with Chromium and Firefox installed; no check step can fail without stopping the deploy; the end-to-end step leaves out the timing test (edit within a second, 100 elements) | contract | planned |
| VO-007 | FR-010, EC-06 | The workflow definition is read | Runs share one concurrency group and a newer run supersedes an older one; the site is replaced by a single uploaded artifact | contract | planned |
| VO-008 | FR-011, EC-07 | The workflow definition is read | A Pages configuration step precedes the deploy and nothing in the workflow lets a failure pass silently | contract | planned |
| VO-009 | FR-013, US3-AS2 | The README is read | It gives the public address, says publishing runs from `main` and by manual start, and says how to serve the production build locally before merging | contract | planned |

### Verification exemptions

| Requirement | Reason | Alternative verification |
|-------------|--------|--------------------------|
| FR-001 | Needs the real public site, a fresh browser profile and no GitHub login, which no test run can supply | Manual check MV-001 |
| US2-AS1 | Needs a real merge into `main` and the hosted service | Manual check MV-002 |
| EC-03 | No behaviour is promised: the edge case says old path-style links are unsupported | Review of the spec wording |
| EC-04 | Unchanged by construction: the change gives no way to vary it | Review of the diff |
| EC-05 | Unchanged by construction: the change gives no way to vary it | Review of the diff |
| EC-08 | No behaviour is promised: the edge case says offline use makes no new promise | Review of the spec wording |

### Manual verification

| ID | Covers | Steps | Expected result | Why not automated |
|----|--------|-------|-----------------|-------------------|
| MV-001 | FR-001, US1-AS1, SC-001, SC-004 | After the first publish, open the public address in a fresh browser profile, signed out of GitHub, and run one create, edit, undo and save round trip | The editor loads in under 5 seconds with no console error or failed request, and the round trip works | Needs the real public site and a fresh profile |
| MV-002 | FR-006, US2-AS1, SC-003 | Merge a visible change (a changed catalogue text) into `main` and time it until the public address shows it | The change is live within 10 minutes with no manual step | Needs a real merge and the hosted service |
| MV-003 | FR-007, US2-AS2, SC-005 | Merge a change that breaks a test and watch the run | The run fails with a visible reason and the public address still serves the earlier version | Needs a real failing run on the hosted service |
| MV-004 | FR-009, FR-011, US3-AS1, EC-07 | With Pages not yet enabled, start a manual publish; then enable Pages and start it again | The first run fails with a message that says to enable Pages; the second serves the current tip of `main` | Needs repository settings that tests cannot change |
| MV-005 | SC-002, FR-003 | Run the end-to-end suite against the public address, with `E2E_BASE_URL` set to it | All applicable acceptance criteria of the editor pass at the public address | Needs the real public site |

### Behaviour checklist

Behaviour items are in [tests/behaviour-checklist.md](tests/behaviour-checklist.md).
