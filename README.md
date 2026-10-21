# Mermaid Editor (WYSIWYG)

A visual, drag-and-drop editor for Mermaid flowchart, sequence and C4 diagrams. You build the diagram on a canvas;
the editor generates read-only Mermaid source from it. Diagrams stay in your browser and in files you save. There is
no server.

**Live demo:** <https://leejsinclair.github.io/mermaid-editor-wysiwyg/>

## Use it

Open the [live demo](https://leejsinclair.github.io/mermaid-editor-wysiwyg/) in a current Chromium-based browser or
Firefox on a desktop. Nothing needs installing, and nothing you draw leaves your browser unless you save it to a file.

## Start a diagram

The start screen offers three new diagrams (flowchart, sequence, C4) and your saved ones. **New from Mermaid…** starts
a diagram from existing Mermaid text instead. Paste the text, or choose or drop a `.mmd`, `.md` or `.txt` file (up to
5 MB; a Markdown file's first `mermaid` block is used). The dialog shows the picture as it would be drawn, the type it
detected, and an **Import report** that lists anything the editor could not keep:

- **dropped**: a construct the editor does not have (for example `subgraph`, `classDef` or a click handler), gone from the
  diagram;
- **approximated**: a construct kept in the nearest form the editor has, with the change named;
- **ignored**: a second diagram in the same text, or a second `mermaid` block in a Markdown file.

**Compare** sets the original text beside the generated source, line by line, so you can see what changed. Nothing is
created until you press **Import**, and the diagram you get is the same kind of diagram as one you draw yourself.
Mermaid text is never run as code, and nothing in it is followed or fetched.

## Develop

- `npm run dev` starts the editor with live reload.
- `npm run typecheck`, `npm test` and `npm run test:e2e` run the checks. `npm run lint` runs the linters.

## How it is published

The site is published to GitHub Pages by the `Publish` workflow (`.github/workflows/pages.yml`).

- **Automatic:** when a change is merged into `main`, the workflow runs type checking, the unit tests and the
  end-to-end tests in Chromium and Firefox, and only if all of them pass builds and deploys the site. A failing
  run leaves the live site as it was and shows in the repository's Actions tab. The one timing test (an edit within a
  second, 100 elements) is not part of this gate because a hosted runner's speed varies; it still runs locally.
- **Manual:** open the repository's Actions tab, choose **Publish**, and press **Run workflow** with branch `main`.
  This publishes the current tip of `main` without a new commit. Other branches are never published.
- **One-time setup:** the repository must be public (or on a plan that allows Pages for private repositories), and
  Settings → Pages → Build and deployment → Source must be **GitHub Actions**. Without it the run fails at the Pages
  step with a message saying so.

Views are named after `#` in the address (for example `#/d/abc` for a saved diagram), so a reload or a link opened in a
new tab shows the same view without any rule on the host.

### Check the published build before merging

1. `npm run build` writes the static site to `build/client`.
2. `npm run preview` serves it; open the printed address, make a diagram and reload the page.
