import { describe, expect, it } from "vitest";
import { contrastRatio, tokensFor, type Appearance } from "./tokens";

const APPEARANCES: readonly Appearance[] = ["blueprint", "light"];

// VO-003 (FR-002, FR-004, FR-020, EC-08, EC-09): every foreground and background pair the design uses meets its minimum contrast
// in both appearances (data-model "Contrast rules"): 4.5:1 for text and for the lines and labels of the drawing, 3:1 for the
// focus ring and the boundaries of controls. Amber is the warning colour and red the error colour in both sets.

const TEXT_ON = 4.5;
const GRAPHIC_ON = 3;

describe("the contrast of the design tokens", () => {
  it("is measured the WCAG way: black on white is 21:1 and a colour on itself 1:1, with transparency laid over its surface", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
    expect(contrastRatio("rgba(255, 255, 255, 0.5)", "#000000")).toBeCloseTo(contrastRatio("#808080", "#000000"), 1);
  });

  for (const appearance of APPEARANCES) {
    const t = tokensFor(appearance);
    const pairs: readonly (readonly [string, string, string, number])[] = [
      ...[t.text.text, t.text.textMuted, t.states.error, t.states.success, t.states.warning, ...Object.values(t.code)].flatMap((colour) => [
        ["text-like", colour, t.surfaces.background, TEXT_ON] as const,
        ["text-like", colour, t.surfaces.panel, TEXT_ON] as const,
      ]),
      ...[t.text.text, t.text.textMuted, t.states.warning].map((colour) => ["on panelRaised", colour, t.surfaces.panelRaised, TEXT_ON] as const),
      ...[t.canvas.canvasInk, t.canvas.selection].flatMap((colour) => [
        ["drawing", colour, t.canvas.canvasSurface, TEXT_ON] as const,
        ["drawing", colour, t.canvas.nodeFill, TEXT_ON] as const,
      ]),
      ...[t.surfaces.background, t.surfaces.panel, t.canvas.canvasSurface].map((surface) => ["focus ring", t.accent.accent, surface, GRAPHIC_ON] as const),
      ...[t.surfaces.background, t.surfaces.panel].map((surface) => ["control boundary", t.borders.borderStrong, surface, GRAPHIC_ON] as const),
    ];
    it(`meets every minimum in the ${appearance} appearance (${String(pairs.length)} pairs)`, () => {
      for (const [role, foreground, background, minimum] of pairs) {
        expect(contrastRatio(foreground, background), `${role} ${foreground} on ${background}`).toBeGreaterThanOrEqual(minimum);
      }
    });

    it(`keeps amber for the warning and red for the error in the ${appearance} appearance`, () => {
      const hue = (colour: string): number => {
        const [r = 0, g = 0, b = 0] = [1, 3, 5].map((at) => Number.parseInt(colour.slice(at, at + 2), 16));
        const max = Math.max(r, g, b);
        const delta = max - Math.min(r, g, b);
        if (delta === 0) return 0;
        if (max === r) return (((g - b) / delta + 6) % 6) * 60;
        return max === g ? ((b - r) / delta + 2) * 60 : ((r - g) / delta + 4) * 60;
      };
      expect(hue(t.states.warning)).toBeGreaterThanOrEqual(25);
      expect(hue(t.states.warning)).toBeLessThanOrEqual(50);
      const error = hue(t.states.error);
      expect(error <= 10 || error >= 350).toBe(true);
    });
  }
});
