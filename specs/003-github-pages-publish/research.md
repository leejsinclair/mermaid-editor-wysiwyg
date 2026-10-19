# Research: Publish the Editor as a GitHub Page

## R1. Hash-style addresses need React Router's data mode

- **Decision**: Replace framework mode with data mode: a root `index.html`, an entry point that calls
  `createHashRouter` over a route table, and plain Vite with the React plugin.
- **Rationale**: Framework mode builds its router from the browser history and exposes no hash option; the hash
  router exists only in data mode (`createHashRouter`, exported by `react-router` 8.4 in this repository). The two
  route components use only `Link`, `Navigate`, `useNavigate` and `useParams`, none of the framework-only exports
  (loaders, `+types`, `meta`), so they move unchanged.
- **Alternatives considered**: (1) Keep framework mode and a `404.html` copy of the page: rejected in the grill
  (HTTP status 404, and a decision already settled). (2) Custom history in framework mode through the unsafe
  `createHashHistory` export: unsupported, breaks on upgrade. (3) Pre-render each route: impossible for `/d/:id`,
  whose ids exist only in the visitor's browser.

## R2. Relative asset URLs

- **Decision**: Vite `base: "./"` with the hash router.
- **Rationale**: With hash addresses the document path never changes, so relative URLs for scripts, styles and
  lazily loaded chunks resolve at any host path. One build then serves the domain root (local), the Pages sub-path
  and the test server, and nothing needs the repository name.
- **Alternatives considered**: `base` set to `/mermaid-editor-wysiwyg/` (build only works there; the local build
  check and the offline test would need it too; a rename of the repository breaks the site).

## R3. Keep the build folder

- **Decision**: Vite writes to `build/client`.
- **Rationale**: `.gitignore`, the build-output test and the lint ignore lists already name `build`; the existing
  build-output test reads `build/client`. No other file changes for this.
- **Alternatives considered**: Vite's default `dist` (more edits for no gain).

## R4. Dev refresh

- **Decision**: Add `@vitejs/plugin-react` as a dev dependency.
- **Rationale**: The React Router plugin used to supply React refresh. Without a plugin, edits reload the whole page
  and lose editor state during development.
- **Alternatives considered**: No plugin (works, worse developer experience).

## R5. Workflow shape

- **Decision**: One workflow, two jobs. `check`: install with `npm ci`, `npm run typecheck`, `npm test`,
  install Chromium and Firefox with their system libraries, `npm run test:e2e`. `deploy`: needs `check`; runs only
  on `refs/heads/main`; configures Pages, uploads `build/client` as the Pages artifact, deploys it. Triggers are
  `push` to `main` and `workflow_dispatch`. A `pages` concurrency group cancels an older in-progress run.
- **Rationale**: GitHub's own Pages actions replace the live site atomically from one artifact (FR-010), report
  the address as the deploy output (US3), and fail with a clear message when Pages is not enabled (EC-07).
  `workflow_dispatch` on another branch would start the run, so the deploy job is also guarded by the branch.
- **Alternatives considered**: A `gh-pages` branch pushed by a third-party action (writes to the repository, partly
  updates, extra token scope); building and deploying in one job (a deploy would not wait on a gate that is
  separately visible).

## R6. Serving the built output under a sub-path in a test

- **Decision**: The new test builds with Vite, serves `build/client` with a small Node server under the prefix
  `/mermaid-editor-wysiwyg/`, answers 404 for anything that is not a real file (as Pages does), and records every
  response and console message.
- **Rationale**: This reproduces the host: real files only, a sub-path, no fallback. It proves the hash router is
  what makes reload work (FR-005) rather than a server rule. The existing build test already contains a small
  server; the new test does not use its "unknown path gets the page" rule.
- **Alternatives considered**: `vite preview --base` (adds a fallback the real host lacks, hiding the very failure
  this feature exists to avoid).

## R7. Test addresses

- **Decision**: Tests open views with a leading `#` (`page.goto("#/new/flowchart")`) and assert the URL with a
  hash regex.
- **Rationale**: Playwright resolves `#/…` against the base URL, keeping any path on it, so the same specs run at
  the local root and at a Pages-style address (MV-005). A leading `/` would drop the sub-path.

## R8. README

- **Decision**: Create `README.md` (none exists) with the address, the publishing rules, the one-time Pages
  setting and the local production check (`npm run build`, `npm run preview`).
- **Rationale**: FR-013 and US3-AS2 name the README.
