import { describe, expect, it } from "vitest";
import { mermaidConfig } from "./mermaidRuntime";
import { tokensFor } from "../theme/tokens";

// VO-025 (FR-019): Mermaid is set up the same way for every drawing, with the strict security level; in Blueprint Studio its base
// theme takes the blueprint colours from the design tokens, and in Light it keeps its own default look.

describe("Mermaid's configuration", () => {
  it("gives Blueprint Studio the base theme with the token colours and fonts", () => {
    const { surfaces, text, accent, canvas, type } = tokensFor("blueprint");
    expect(mermaidConfig("blueprint")).toEqual({
      startOnLoad: false,
      securityLevel: "strict",
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
        useGradient: false,
      },
    });
  });

  it("gives Light Mermaid's own default theme, with no theme variables", () => {
    const config = mermaidConfig("light");
    expect(config).toEqual({ startOnLoad: false, securityLevel: "strict", theme: "default" });
    expect(Object.keys(config)).not.toContain("themeVariables");
  });
});
