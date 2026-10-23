import type { Mermaid, MermaidConfig } from "mermaid";
import { tokensFor, type Appearance } from "../theme/tokens";

// The one place Mermaid is set up (spec 007, FR-019). Mermaid keeps one global configuration, and each parse, snapshot and drawing
// used to set it afresh; they all go through `loadMermaid` now, so the look of the current appearance holds for every drawing and
// nothing in a drawing's text or in the generated source has to carry it.

/**
 * Mermaid's configuration for an appearance, with the strict security level: in Blueprint Studio its base theme takes the blueprint
 * colours and the system font from the design tokens; Light keeps Mermaid's own default look. Colours a diagram's own `style` or
 * `classDef` statements set still win over these theme defaults.
 */
export function mermaidConfig(appearance: Appearance): MermaidConfig {
  const base = { startOnLoad: false, securityLevel: "strict" } as const;
  if (appearance === "light") return { ...base, theme: "default" };
  const { surfaces, text, accent, canvas, type } = tokensFor(appearance);
  return {
    ...base,
    theme: "base",
    themeVariables: {
      background: canvas.canvasSurface,
      primaryColor: canvas.nodeFill,
      primaryTextColor: text.text,
      primaryBorderColor: accent.accent,
      lineColor: canvas.canvasInk,
      secondaryColor: surfaces.panelRaised,
      tertiaryColor: surfaces.panel,
      noteBkgColor: surfaces.panelRaised,
      noteTextColor: text.text,
      fontFamily: type.fontSans,
      // Mermaid 12's base theme outlines nodes with a gradient unless told not to; the outline is the accent colour.
      useGradient: false,
    },
  };
}

let current: Appearance = "blueprint";

/** Tells Mermaid which look to draw in from now on. */
export function setMermaidAppearance(appearance: Appearance): void {
  current = appearance;
}

/** Mermaid, loaded when first needed so the editor opens without it, and set up for the current appearance. */
export async function loadMermaid(): Promise<Mermaid> {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize(mermaidConfig(current));
  return mermaid;
}
