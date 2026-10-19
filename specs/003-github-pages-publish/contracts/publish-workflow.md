# Contract: Publish workflow

File: `.github/workflows/pages.yml`. Checked by `e2e/publish-*.spec.ts` (text assertions, no YAML library added).

| Rule | Requirement |
|------|-------------|
| Triggers are `push` on branch `main` and `workflow_dispatch`, and no other | FR-006, FR-008, FR-009 |
| The `deploy` job runs only when the ref is `refs/heads/main` | FR-008, FR-009 |
| The `deploy` job lists `check` in `needs` | FR-007, DC-03 |
| `check` runs `npm run typecheck`, `npm test` and `npm run test:e2e`, after installing Chromium and Firefox; the end-to-end step passes `--grep-invert "within a second"` so the timing test is left out (the phrase in its title must stay) | FR-007 |
| No `continue-on-error` anywhere | FR-007, FR-011 |
| One concurrency group with `cancel-in-progress: true` | FR-010, EC-06 |
| `deploy` uses `configure-pages`, `upload-pages-artifact` with path `build/client`, then `deploy-pages` | FR-010, EC-07 |
| Permissions: `contents: read`, `pages: write`, `id-token: write` on `deploy`; read-only on `check` | least privilege |
| The environment is `github-pages` and its URL is the deploy output | US3 |

Outputs: a run per trigger, shown in the repository's Actions tab with a pass or fail state and the failing step.
