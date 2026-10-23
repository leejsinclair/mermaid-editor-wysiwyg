# Contract: Presentation modules

Pure modules (no DOM) are unit-tested with Vitest; the adapters around them hold the only DOM or storage access. Names
are indicative; tasks fix the files.

## Tokens (`app/rendering/theme/tokens.ts`, pure)

- `type Appearance = "blueprint" | "light"`
- `TOKENS: Readonly<Record<Appearance, TokenSet>>` — the only colour literals in `app/` (SC-004).
- `cssVariables(appearance): Readonly<Record<string, string>>` — the `--…` custom properties for one appearance.
- `muiThemeOptions(appearance)` — the options from which the MUI theme of that appearance is created.
- `contrastRatio(foreground, background): number` — WCAG 2.x ratio of two colours (alpha composited on the background).

## Appearance preference (`app/persistence/appearance.ts`)

- `parseAppearance(stored: unknown): Appearance` — pure; `"light"` gives `light`, anything else `blueprint`.
- `readAppearance(storage?: Storage): Appearance` — never throws; a throwing storage gives `blueprint`.
- `writeAppearance(appearance, storage?: Storage): boolean` — never throws; `false` when the value could not be saved,
  which the caller reports with the notice.

## Mermaid runtime (`app/rendering/shared/mermaidRuntime.ts`)

- `mermaidConfig(appearance)` — pure; the configuration in data-model "Mermaid look".
- `setMermaidAppearance(appearance): void` and `loadMermaid(): Promise<Mermaid>` — the only call site of
  `mermaid.initialize` in `app/` outside test helpers. `drawWithMermaid`, `parseWithMermaid`, `parseLocated` and the
  snapshot readers load Mermaid through it.

## Source highlighting (`app/rendering/shared/highlight.ts`, pure)

- `highlightRuns(source: string): readonly Run[]` — runs as in data-model; `runs.map((run) => run.text).join("")`
  equals `source` for every input.

## Grid (`app/rendering/shared/grid.ts`, pure)

- `gridLayers(zoom): { minor: number | null; major: number }` — on-screen spacings in px (16 × zoom, 80 × zoom); minor
  is `null` below 6 px.

## Pinch (`app/rendering/shared/pinch.ts`, pure)

- `pinchZoom(startZoom, startDistance, distance, limits): number` — `startZoom × distance ÷ startDistance` clamped to
  `limits`; a non-positive `startDistance` returns `startZoom`.

## Layout (`app/rendering/shared/layout.ts`, pure)

- `layoutFor(width: number): "wide" | "narrow" | "compact"` — ≥ 900, 600–899, < 600.
