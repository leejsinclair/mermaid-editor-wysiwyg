# Data Model: Blueprint Studio Visual Redesign

**Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

The diagram model, history, generation and file format are **unchanged**. This feature adds presentation data only.

## Appearance

| Value | Name shown in the switch | Default |
|-------|--------------------------|---------|
| `blueprint` | Blueprint Studio | yes |
| `light` | Light | no |

- **Stored preference**: one `localStorage` entry, key `mermaid-editor.appearance`, value `"blueprint"` or `"light"`.
- **Reading (untrusted)**: any other value, a missing entry, or a storage exception gives `blueprint`. Nothing is shown
  to the user and nothing else is read.
- **Writing**: on every switch. On a storage exception the switch still takes effect for the session and the editor
  shows the notice "Your appearance choice could not be saved for next time." (Clarifications).
- **Boundaries**: never written into a diagram, the diagram store, a saved file, copied source or copied Markdown, and
  not recorded in undo history. Switching never changes selection, an open draft label or the viewport.

## Design token set (one per appearance)

| Group | Tokens | Blueprint Studio | Light |
|-------|--------|------------------|-------|
| Surfaces | `background`, `panel`, `panelRaised` | `#071C30`, `#0D2B45`, `#174565` | `#FFFFFF`, `#F5F7FA`, `#E8EDF2` |
| Text | `text`, `textMuted` | ivory `#F1E9D7`, `#A9C0D0` | `#222222`, `#5F6B76` |
| Accent | `accent` (focus, selection, primary action) | cyan `#72D7F2` | `#1565C0` |
| States | `warning`, `error`, `success` | amber `#E8AD63`, `#FF8A80`, `#7FD8A6` | `#8A5300`, `#C62828`, `#2E7D32` |
| Canvas | `canvasSurface`, `canvasInk`, `nodeFill`, `gridMinor`, `gridMajor`, `selection` | `#071C30`, ivory, `#0D2B45`, cyan at 8 %, cyan at 18 %, cyan | `#FFFFFF`, `#222222`, `#FFFFFF`, `#1565C0` at 6 %, `#1565C0` at 14 %, `#1565C0` |
| Borders | `border`, `borderStrong` | `#174565`, cyan at 45 % | `#D0D7DE`, `#8C959F` |
| Source highlighting | `codeKeyword`, `codeString`, `codeOperator`, `codeComment`, `codeIdentifier` | cyan, amber, ivory, muted, ivory | `#1565C0`, `#8A5300`, `#222222`, `#5F6B76`, `#222222` |
| Type | `fontSans`, `fontMono`, sizes | system stacks (research R11) | same |
| Shape | `space` (8 px unit), `radius` (4 px), `borderWidth` (1 px), `focusWidth` (3 px) | same | same |
| Motion | `duration` | 150 ms (0 under reduced motion) | same |

The three user-specified colours not named above (`#174565` secondary blue, `#72D7F2`, `#E8AD63`) are used exactly as
given. Only the token module holds colour literals (SC-004).

### Contrast rules (verified by unit test, FR-020)

| Pair | Minimum |
|------|---------|
| `text`, `textMuted`, `error`, `success`, `warning`, every `code*` token on `background` and on `panel` | 4.5:1 |
| `text`, `textMuted`, `warning` on `panelRaised` | 4.5:1 (error text is never placed on `panelRaised`: `#FF8A80` on `#174565` is 4.43:1) |
| `canvasInk` and `selection` on `canvasSurface` and on `nodeFill` | 4.5:1 (labels and lines) |
| `accent` (focus ring) on `background`, `panel` and `canvasSurface` | 3:1 |
| `borderStrong` on the surface it bounds | 3:1 for control boundaries |

Computed for the values above: ivory on `#071C30` 14.3:1, on `#0D2B45` 12.0:1; cyan on `#071C30` 10.4:1; amber on
`#0D2B45` 7.3:1; muted on `#0D2B45` 7.7:1; Light `#1565C0` on white 5.8:1, `#8A5300` on white 6.3:1.

## Mermaid look (derived, per appearance)

| Appearance | Mermaid configuration added to `startOnLoad: false, securityLevel: "strict"` |
|------------|-------------------------------------------------------------------------------|
| Blueprint Studio | `theme: "base"`, `themeVariables`: `background` = `canvasSurface`, `primaryColor` = `nodeFill`, `primaryTextColor` = `text`, `primaryBorderColor` = `accent`, `lineColor` = `canvasInk`, `secondaryColor` = `panelRaised`, `tertiaryColor` = `panel`, `noteBkgColor` = `panelRaised`, `noteTextColor` = `text`, `fontFamily` = `fontSans` |
| Light | `theme: "default"` (Mermaid's own look, as today) |

## Source highlighting runs

A run is `{ kind, text }` with `kind` one of `keyword`, `identifier`, `string`, `operator`, `comment`, `punctuation`,
`space`. Invariant: the concatenation of the runs' texts equals the source exactly, for any input.

## Workspace layout state (in memory only)

| State | Values | Rule |
|-------|--------|------|
| Layout | `wide` (≥ 900 px), `narrow` (600–899 px), `compact` (< 600 px) | From the window width; changes with it |
| Tools panel open | true / false | Only in `narrow` and `compact`; starts closed; opening or closing never changes the diagram, selection or draft |
| Zoom shown | whole percent of the current canvas zoom | Updated on every zoom change by buttons, wheel or pinch |

## Touch gesture (Sequence and C4)

| State | Enters when | Effect | Leaves when |
|-------|-------------|--------|-------------|
| Idle | — | — | — |
| Panning | one touch pointer goes down on empty canvas | container scrolls by the finger's movement | the pointer lifts or is cancelled |
| Pinching | a second touch pointer goes down while panning | zoom = start zoom × current distance ÷ start distance, clamped to 0.25–4 | either pointer lifts (back to idle) |
| Item drag (feature 004) | a pointer goes down on an item, handle or line | as today; a second touch pointer is ignored and starts no zoom (Clarifications) | as today |
