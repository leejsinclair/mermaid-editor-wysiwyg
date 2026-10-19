# Quickstart: Publish the Editor as a GitHub Page

## Check the production build locally

1. `npm ci`
2. `npm run build` (writes `build/client`)
3. `npm run preview` and open the printed address. Open `#/new/flowchart`, create a diagram, reload the page: the
   same diagram is shown. The address shows the view after `#`.

## Run the checks the workflow runs

- `npm run typecheck`
- `npm test`
- `npm run test:e2e` (Chromium and Firefox)

## One-time repository setup (maintainer)

1. Make the repository public (or use a plan that allows Pages for private repositories).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Merge the editor work into `main`. The first publish runs on the merge; to publish again without a commit, open
   Actions → Publish → Run workflow, with branch `main`.

## Verify the live site

- Open `https://leejsinclair.github.io/mermaid-editor-wysiwyg/` in a fresh profile (MV-001).
- Run the end-to-end suite against it: `E2E_BASE_URL=https://leejsinclair.github.io/mermaid-editor-wysiwyg/ npm run test:e2e` (MV-005).

Contracts: [addresses](contracts/addresses.md), [publish workflow](contracts/publish-workflow.md).
