# Quickstart: validating the Blueprint Studio redesign

**Feature**: [spec.md](spec.md) | **Contracts**: [contracts/](contracts/) | **Data model**: [data-model.md](data-model.md)

## Prerequisites

```bash
npm ci
npx playwright install chromium firefox webkit   # webkit is new for the touch suite (research R9)
```

On a distribution Playwright's WebKit does not support (for example Arch Linux), `mobile-ios` may fail to launch; that is
an environment failure. Run it in CI (`ubuntu-latest`) or a Debian/Ubuntu container.

## Automated checks

| Command | What it proves |
|---------|----------------|
| `npm run typecheck` | Strict types still hold |
| `npm run lint` | ESLint, Stylelint, HTMLHint, markdownlint and Mermaid syntax still pass |
| `npm test` | Pure layers: tokens and contrast, appearance parsing, Mermaid look, highlighting runs, grid, pinch, layout; all existing unit tests |
| `npm run test:e2e -- --project=chromium --project=firefox` | The existing desktop suite plus the new desktop tests (appearance switch, grid, status bar, narrow layouts, axe in both appearances) |
| `npm run test:e2e -- --project=mobile-android --project=mobile-ios` | The touch suite (`e2e/touch/`) on emulated Android Chrome and iOS Safari |
| `npm run build && npm run preview` | The published build still serves and works offline |

## Manual walk-through (about 10 minutes)

1. `npm run dev`, open the start page: it is in Blueprint Studio (navy) and shows "Mermaid diagram editor".
2. New flowchart. Add four shapes and three labelled connections, one label long. Check: navy canvas, faint 16 px grid
   with stronger 80 px lines, ivory labels, cyan selection, dashed hover outline.
3. Zoom in to the maximum and out to the minimum, pan: the grid stays under the same items; at the minimum only the
   major grid shows. The status bar shows the zoom percent.
4. Open "Preview as Mermaid draws it": blueprint colours. Press Light in the header: the whole editor and the preview
   turn light, the selection and source are unchanged. Reload: still Light. Switch back to Blueprint Studio.
5. Expand the Mermaid source: highlighted, monospace, cannot be typed in; Copy Source pastes exactly the same text.
6. New from Mermaid with source containing `style A fill:#f9f` and `classDef`: the import picture shows those styles.
7. Narrow the window to 800 px, then 360 px: "Tools" opens and closes the toolbox and properties; at 360 px Copy and
   Save are under "More actions"; no sideways scroll.
8. Keyboard only: Tab through header, switch, toolbar, tools and canvas; focus is always visible.
9. In DevTools emulate a phone with touch: one-finger drag on empty canvas pans, pinch zooms the drawing, double-tap
   renames, tapping a toolbox item adds it.
